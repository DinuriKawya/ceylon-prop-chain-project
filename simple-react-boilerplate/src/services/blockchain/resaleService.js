import { DEFAULT_GAS } from '../../utils/constants';

export const loadActiveResaleListings = async (contract, web3, apartmentId = null) => {
  if (!contract || !web3) return [];
  const count = parseInt(await contract.methods.getResaleListingCount().call());
  const out = [];

  for (let i = 0; i < count; i++) {
    const l = await contract.methods.resaleListings(i).call();
    if (!l.active) continue;
    if (apartmentId !== null && parseInt(l.apartmentId) !== parseInt(apartmentId)) continue;

    const amount = parseInt(l.amount);
    const pricePerToken = parseFloat(web3.utils.fromWei(l.pricePerToken, 'ether'));
    out.push({
      id: parseInt(l.id),
      apartmentId: parseInt(l.apartmentId),
      seller: l.seller,
      amount,
      priceWei: l.pricePerToken,
      pricePerToken,
      total: parseFloat((pricePerToken * amount).toFixed(6))
    });
  }
  return out;
};

export const listForResale = (contract, web3, account, apartmentId, amount, pricePerTokenEth) => {
  const priceWei = web3.utils.toWei(String(pricePerTokenEth), 'ether');
  return contract.methods.listForResale(apartmentId, amount, priceWei).send({ from: account, gas: DEFAULT_GAS });
};

export const buyResaleListing = (contract, web3, account, listing) => {
  const value = web3.utils.toBN(listing.priceWei).mul(web3.utils.toBN(listing.amount)).toString();
  return contract.methods.buyResaleListing(listing.id).send({ from: account, value, gas: DEFAULT_GAS });
};

export const cancelResaleListing = (contract, account, listingId) =>
  contract.methods.cancelResaleListing(listingId).send({ from: account, gas: DEFAULT_GAS });

export const loadMyResaleSales = async (contract, web3, account) => {
  if (!contract || !web3 || !account) return [];
  try {
    const events = await contract.getPastEvents('ResaleSold', { fromBlock: 0, toBlock: 'latest' });
    return events
      .filter(e => e.returnValues.seller.toLowerCase() === account.toLowerCase())
      .map(e => ({
        key: `${e.transactionHash}-${e.logIndex}`,
        listingId: parseInt(e.returnValues.listingId),
        apartmentId: parseInt(e.returnValues.apartmentId),
        buyer: e.returnValues.buyer,
        amount: parseInt(e.returnValues.amount),
        totalEth: parseFloat(web3.utils.fromWei(e.returnValues.totalPrice, 'ether'))
      }));
  } catch (err) {
    console.error('Failed to load resale sales:', err);
    return [];
  }
};
