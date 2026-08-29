const ApartmentToken = artifacts.require("ApartmentToken");

const toWei = (n) => web3.utils.toWei(String(n), "ether");
const toBN = (n) => web3.utils.toBN(n);

const expectRevert = async (promise, reason) => {
  try {
    await promise;
    assert.fail(`Expected the call to revert${reason ? ` with "${reason}"` : ""}, but it succeeded`);
  } catch (error) {
    if (error.message.startsWith("Expected the call to revert")) throw error;
    if (reason) {
      assert.ok(
        error.message.includes(reason),
        `Expected revert reason "${reason}", got: ${error.message}`
      );
    } else {
      assert.ok(error.message.includes("revert"), `Expected a revert, got: ${error.message}`);
    }
  }
};

contract("ApartmentToken", (accounts) => {
  const [admin, lister, investor, investor2, outsider] = accounts;
  let instance;


  const registerAndVerify = async (who, name = "Test User", email) => {
    await instance.registerUser(
      name,
      email || `${name.replace(/\s+/g, ".").toLowerCase()}@test.com`,
      "ipfs://id-photo",
      "ipfs://selfie",
      { from: who }
    );
    await instance.approveUser(who, { from: admin });
  };

  beforeEach(async () => {
    instance = await ApartmentToken.new();
  });

  describe("deployment", () => {
    it("sets the deployer as owner and as a pre-verified admin user", async () => {
      assert.equal(await instance.owner(), admin);
      assert.isTrue(await instance.isUserVerified(admin));
    });
  });

  describe("user registration & KYC approval", () => {
    it("lets a new wallet register and lands them in the pending queue, unverified", async () => {
      await instance.registerUser("Alice", "alice@test.com", "id.jpg", "selfie.jpg", { from: investor });
      assert.isFalse(await instance.isUserVerified(investor));
      assert.equal((await instance.getPendingCount()).toString(), "1");
    });

    it("rejects a second registration from the same wallet", async () => {
      await instance.registerUser("Alice", "alice@test.com", "id.jpg", "selfie.jpg", { from: investor });
      await expectRevert(
        instance.registerUser("Alice Again", "alice2@test.com", "id.jpg", "selfie.jpg", { from: investor }),
        "User already registered"
      );
    });

    it("requires a non-empty name and email", async () => {
      await expectRevert(
        instance.registerUser("", "a@test.com", "id.jpg", "selfie.jpg", { from: investor }),
        "Name is required"
      );
      await expectRevert(
        instance.registerUser("Alice", "", "id.jpg", "selfie.jpg", { from: investor2 }),
        "Email is required"
      );
    });

    it("only the contract owner can approve or reject a pending user", async () => {
      await instance.registerUser("Alice", "alice@test.com", "id.jpg", "selfie.jpg", { from: investor });
      await expectRevert(
        instance.approveUser(investor, { from: outsider }),
        "Only contract owner can call this"
      );
    });

    it("approving a user verifies them and removes them from the pending queue", async () => {
      await instance.registerUser("Alice", "alice@test.com", "id.jpg", "selfie.jpg", { from: investor });
      await instance.approveUser(investor, { from: admin });
      assert.isTrue(await instance.isUserVerified(investor));
      assert.equal((await instance.getPendingCount()).toString(), "0");
    });

    it("rejecting a user deletes their record entirely, freeing the wallet to re-register", async () => {
      await instance.registerUser("Alice", "alice@test.com", "id.jpg", "selfie.jpg", { from: investor });
      await instance.rejectUser(investor, { from: admin });
      const info = await instance.getUserInfo(investor);
      assert.equal(info.name, "");

      await instance.registerUser("Alice B", "aliceb@test.com", "id.jpg", "selfie.jpg", { from: investor });
      assert.equal((await instance.getPendingCount()).toString(), "1");
    });

    it("only the owner can read the pending queue", async () => {
      await expectRevert(
        instance.getPendingUsers({ from: outsider }),
        "Only contract owner can call this"
      );
    });
  });

  describe("apartment listing", () => {
    it("only verified users can list an apartment", async () => {
      await expectRevert(
        instance.createApartment("Flat A", "Colombo 03", "desc", 100, toWei(0.01), "img", "deed", { from: outsider }),
        "You must be verified to perform this action"
      );
    });

    it("lets a verified user create an apartment, unverified by default", async () => {
      await registerAndVerify(lister, "Lister");
      await instance.createApartment("Flat A", "Colombo 03", "desc", 100, toWei(0.01), "img", "deed", { from: lister });
      const apts = await instance.getAllApartments();
      assert.equal(apts.titles.length, 1);
      assert.equal(apts.titles[0], "Flat A");
      assert.isFalse(apts.isVerified[0]);
      assert.equal(apts.owners[0], lister);
    });

    it("rejects a listing with zero tokens or zero price", async () => {
      await registerAndVerify(lister, "Lister");
      await expectRevert(
        instance.createApartment("Flat A", "Colombo 03", "desc", 0, toWei(0.01), "img", "deed", { from: lister }),
        "Total tokens must be > 0"
      );
      await expectRevert(
        instance.createApartment("Flat A", "Colombo 03", "desc", 100, 0, "img", "deed", { from: lister }),
        "Token price must be > 0"
      );
    });

    it("only the owner can verify or reject an apartment, and a verified one can't then be rejected", async () => {
      await registerAndVerify(lister, "Lister");
      await instance.createApartment("Flat A", "Colombo 03", "desc", 100, toWei(0.01), "img", "deed", { from: lister });

      await expectRevert(
        instance.verifyApartment(0, true, { from: outsider }),
        "Only contract owner can call this"
      );

      await instance.verifyApartment(0, true, { from: admin });
      await expectRevert(
        instance.rejectApartment(0, "Too late, already verified", { from: admin }),
        "Cannot reject an already verified apartment"
      );
    });

    it("requires a non-empty reason to reject an apartment, and stores it once rejected", async () => {
      await registerAndVerify(lister, "Lister");
      await instance.createApartment("Flat B", "Kandy", "desc", 100, toWei(0.01), "img", "deed", { from: lister });

      await expectRevert(
        instance.rejectApartment(0, "", { from: admin }),
        "Rejection reason is required"
      );

      await instance.rejectApartment(0, "Deed document does not match the listed address", { from: admin });
      const apts = await instance.getAllApartments();
      assert.isTrue(apts.isRejected[0]);
      assert.equal(apts.rejectionReasons[0], "Deed document does not match the listed address");
    });
  });

  describe("buying tokens", () => {
    beforeEach(async () => {
      await registerAndVerify(lister, "Lister");
      await instance.createApartment("Flat A", "Colombo 03", "desc", 100, toWei(0.01), "img", "deed", { from: lister });
      await instance.verifyApartment(0, true, { from: admin });
      await registerAndVerify(investor, "Investor");
    });

    it("only verified users can buy tokens", async () => {
      await expectRevert(
        instance.buyTokens(0, 5, { from: outsider, value: toWei(0.05) }),
        "You must be verified to perform this action"
      );
    });

    it("blocks purchases from an unverified apartment", async () => {
      await instance.createApartment("Flat B", "Kandy", "desc", 100, toWei(0.01), "img", "deed", { from: lister });
      await expectRevert(
        instance.buyTokens(1, 5, { from: investor, value: toWei(0.05) }),
        "Apartment not verified yet"
      );
    });

    it("blocks buying more tokens than remain", async () => {
      await expectRevert(
        instance.buyTokens(0, 101, { from: investor, value: toWei(1.01) }),
        "Not enough tokens available"
      );
    });

    it("blocks underpaying for the tokens requested", async () => {
      await expectRevert(
        instance.buyTokens(0, 5, { from: investor, value: toWei(0.04) }),
        "Insufficient payment"
      );
    });

    it("does NOT enforce any minimum purchase amount on-chain -- a tiny purchase still succeeds", async () => {
      await instance.buyTokens(0, 1, { from: investor, value: toWei(0.01) });
      assert.equal((await instance.getTokenBalance(0, investor)).toString(), "1");
    });

    it("credits the buyer's token balance, updates tokensSold, and tracks them as a holder", async () => {
      await instance.buyTokens(0, 10, { from: investor, value: toWei(0.1) });
      assert.equal((await instance.getTokenBalance(0, investor)).toString(), "10");

      const apts = await instance.getAllApartments();
      assert.equal(apts.tokensSold[0].toString(), "10");
      const topHolders = await instance.getTopHolders(0, 10);
      assert.equal(topHolders[0][0], investor);
      assert.equal(topHolders[1][0].toString(), "10");
    });

    it("refunds any overpayment", async () => {
      const before = toBN(await web3.eth.getBalance(investor));

      const tx = await instance.buyTokens(0, 5, { from: investor, value: toWei(0.1) });
      const txInfo = await web3.eth.getTransaction(tx.tx);
      const gasCost = toBN(tx.receipt.gasUsed).mul(toBN(txInfo.gasPrice));
      const after = toBN(await web3.eth.getBalance(investor));


      const expectedAfter = before.sub(toBN(toWei(0.05))).sub(gasCost);
      assert.equal(after.toString(), expectedAfter.toString());
    });
  });

  describe("transferring tokens", () => {
    beforeEach(async () => {
      await registerAndVerify(lister, "Lister");
      await instance.createApartment("Flat A", "Colombo 03", "desc", 100, toWei(0.01), "img", "deed", { from: lister });
      await instance.verifyApartment(0, true, { from: admin });
      await registerAndVerify(investor, "Investor");
      await registerAndVerify(investor2, "Investor Two");
      await instance.buyTokens(0, 10, { from: investor, value: toWei(0.1) });
    });

    it("moves tokens between two verified users and updates their balances", async () => {
      await instance.transferTokens(0, investor2, 4, { from: investor });
      assert.equal((await instance.getTokenBalance(0, investor)).toString(), "6");
      assert.equal((await instance.getTokenBalance(0, investor2)).toString(), "4");
    });

    it("blocks transferring more tokens than you hold", async () => {
      await expectRevert(
        instance.transferTokens(0, investor2, 11, { from: investor }),
        "Insufficient tokens"
      );
    });

    it("blocks transferring to the zero address", async () => {
      await expectRevert(
        instance.transferTokens(0, "0x0000000000000000000000000000000000000000", 1, { from: investor }),
        "Invalid address"
      );
    });
  });

  describe("selling tokens back", () => {
    beforeEach(async () => {
      await registerAndVerify(lister, "Lister");
      await instance.createApartment("Flat A", "Colombo 03", "desc", 100, toWei(0.01), "img", "deed", { from: lister });
      await instance.verifyApartment(0, true, { from: admin });
      await registerAndVerify(investor, "Investor");
      await instance.buyTokens(0, 10, { from: investor, value: toWei(0.1) });
    });

    it("returns ETH for the tokens sold and reduces tokensSold", async () => {
      await instance.sellTokens(0, 4, { from: investor });
      assert.equal((await instance.getTokenBalance(0, investor)).toString(), "6");
      const apts = await instance.getAllApartments();
      assert.equal(apts.tokensSold[0].toString(), "6");
    });

    it("blocks selling more tokens than you hold", async () => {
      await expectRevert(
        instance.sellTokens(0, 11, { from: investor }),
        "Insufficient tokens"
      );
    });
  });

  describe("resale marketplace", () => {
    beforeEach(async () => {
      await registerAndVerify(lister, "Lister");
      await instance.createApartment("Flat A", "Colombo 03", "desc", 100, toWei(0.01), "img", "deed", { from: lister });
      await instance.verifyApartment(0, true, { from: admin });
      await registerAndVerify(investor, "Investor");
      await registerAndVerify(investor2, "Investor Two");
      await instance.buyTokens(0, 10, { from: investor, value: toWei(0.1) });
    });

    it("lists tokens for resale and lets another verified user buy them", async () => {
      await instance.listForResale(0, 5, toWei(0.012), { from: investor });
      await instance.buyResaleListing(0, { from: investor2, value: toWei(0.06) });
      assert.equal((await instance.getTokenBalance(0, investor2)).toString(), "5");
      assert.equal((await instance.getTokenBalance(0, investor)).toString(), "5");
    });

    it("blocks listing more tokens than you own", async () => {
      await expectRevert(
        instance.listForResale(0, 11, toWei(0.01), { from: investor }),
        "You don't own enough tokens"
      );
    });

    it("blocks buying your own listing", async () => {
      await instance.listForResale(0, 5, toWei(0.01), { from: investor });
      await expectRevert(
        instance.buyResaleListing(0, { from: investor, value: toWei(0.05) }),
        "You cannot buy your own listing"
      );
    });

    it("blocks buying a listing that was already cancelled", async () => {
      await instance.listForResale(0, 5, toWei(0.01), { from: investor });
      await instance.cancelResaleListing(0, { from: investor });
      await expectRevert(
        instance.buyResaleListing(0, { from: investor2, value: toWei(0.05) }),
        "Listing is not active"
      );
    });

    it("only the seller can cancel their own listing", async () => {
      await instance.listForResale(0, 5, toWei(0.01), { from: investor });
      await expectRevert(
        instance.cancelResaleListing(0, { from: investor2 }),
        "Only the seller can cancel"
      );
    });
  });

  describe("rental income distribution", () => {
    beforeEach(async () => {
      await registerAndVerify(lister, "Lister");
      await instance.createApartment("Flat A", "Colombo 03", "desc", 100, toWei(0.01), "img", "deed", { from: lister });
      await instance.verifyApartment(0, true, { from: admin });
      await registerAndVerify(investor, "Investor");
      await registerAndVerify(investor2, "Investor Two");
      await instance.buyTokens(0, 30, { from: investor, value: toWei(0.3) });
      await instance.buyTokens(0, 70, { from: investor2, value: toWei(0.7) });
    });

    it("splits distributed rent proportionally by tokens held, and lets holders claim their share", async () => {
      await instance.distributeRentalIncome(0, { from: admin, value: toWei(10) });

      assert.equal((await instance.claimableRentalIncome(0, investor)).toString(), toWei(3));
      assert.equal((await instance.claimableRentalIncome(0, investor2)).toString(), toWei(7));

      const before = toBN(await web3.eth.getBalance(investor));
      const tx = await instance.claimRentalIncome(0, { from: investor });
      const txInfo = await web3.eth.getTransaction(tx.tx);
      const gasCost = toBN(tx.receipt.gasUsed).mul(toBN(txInfo.gasPrice));
      const after = toBN(await web3.eth.getBalance(investor));

      assert.equal(after.toString(), before.add(toBN(toWei(3))).sub(gasCost).toString());
    });

    it("only the owner can distribute rental income, and only for a verified apartment", async () => {
      await expectRevert(
        instance.distributeRentalIncome(0, { from: lister, value: toWei(10) }),
        "Only contract owner can call this"
      );

      await instance.createApartment("Flat B", "Kandy", "desc", 100, toWei(0.01), "img", "deed", { from: lister });
      await expectRevert(
        instance.distributeRentalIncome(1, { from: admin, value: toWei(10) }),
        "Apartment not verified"
      );
    });

    it("blocks claiming when there's nothing to claim", async () => {
      await expectRevert(
        instance.claimRentalIncome(0, { from: investor }),
        "No rental income to claim"
      );
    });
  });

  describe("withdrawing apartment funds", () => {
    beforeEach(async () => {
      await registerAndVerify(lister, "Lister");
      await instance.createApartment("Flat A", "Colombo 03", "desc", 100, toWei(0.01), "img", "deed", { from: lister });
      await instance.verifyApartment(0, true, { from: admin });
      await registerAndVerify(investor, "Investor");
      await instance.buyTokens(0, 10, { from: investor, value: toWei(0.1) });
    });

    it("only the apartment's lister can withdraw its accumulated funds", async () => {
      await expectRevert(
        instance.withdraw(0, toWei(0.01), { from: outsider }),
        "Only the apartment owner can withdraw"
      );
    });

    it("lets the lister withdraw up to what's been collected, and blocks withdrawing more", async () => {
      await expectRevert(
        instance.withdraw(0, toWei(0.11), { from: lister }),
        "Invalid withdrawal amount"
      );
      await instance.withdraw(0, toWei(0.05), { from: lister });
      assert.equal((await instance.apartmentBalance(0)).toString(), toWei(0.05));
    });
  });
});
