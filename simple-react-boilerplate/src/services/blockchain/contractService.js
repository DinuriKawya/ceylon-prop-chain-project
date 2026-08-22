import UserDto from '../../dto/UserDto';
import ApartmentDto from '../../dto/ApartmentDto';

export const checkUserStatus = async (contract, userAccount) => {
  if (!contract || !userAccount) return { isVerified: false, isAdmin: false, isRegistered: false };
  
  const owner = await contract.methods.owner().call();
  const isAdmin = userAccount.toLowerCase() === owner.toLowerCase();
  
  let isRegistered = false;
  let isVerified = false;
  
  try {
    const userInfo = await contract.methods.getUserInfo(userAccount).call();
    isRegistered = userInfo[0] && userInfo[0].length > 0;
    isVerified = userInfo[2];
  } catch (e) {
    console.log("User not registered:", userAccount);
  }
  
  return {
    isAdmin,
    isVerified: isAdmin ? true : isVerified,
    isRegistered: isAdmin ? true : isRegistered
  };
};

export const loadApartments = async (contract, web3) => {
  if (!contract) return [];
  const result = await contract.methods.getAllApartments().call();
  const apartmentsList = [];
  
  for (let i = 0; i < result[0].length; i++) {
    apartmentsList.push(new ApartmentDto(
      parseInt(result[0][i]),
      result[1][i],
      result[2][i],
      result[3][i],
      parseInt(result[4][i]),
      parseFloat(web3.utils.fromWei(result[5][i], 'ether')),
      parseInt(result[6][i]),
      result[7][i],
      parseInt(result[4][i]) - parseInt(result[6][i]),
      result[10][i],
      result[8][i],
      result[9][i],
      result[11][i],
      result[12][i]
    ));
  }
  return apartmentsList;
};

export const loadPendingUsers = async (contract, account) => {
  if (!contract) return [];
  const result = await contract.methods.getPendingUsers().call({ from: account });
  const pendingUsersList = [];
  for (let i = 0; i < result[0].length; i++) {
    pendingUsersList.push(new UserDto(
      result[0][i],
      result[1][i],
      result[2][i],
      false,
      result[3][i],
      result[4][i]
    ));
  }
  return pendingUsersList;
};

export const loadVerifiedUsers = async (contract) => {
  if (!contract) return [];
  return await contract.methods.getAllVerifiedUsers().call();
};

export const getUserName = async (contract, address) => {
  if (!contract || !address) return null;
  try {
    const info = await contract.methods.getUserInfo(address).call();
    return info[0] && info[0].length > 0 ? info[0] : null;
  } catch (e) {
    console.log("Could not fetch user name for:", address);
    return null;
  }
};

export const loadVerifiedUsersDetailed = async (contract) => {
  if (!contract) return [];
  const addresses = await contract.methods.getAllVerifiedUsers().call();
  const detailed = [];
  for (const address of addresses) {
    const info = await contract.methods.getUserInfo(address).call();
    detailed.push(new UserDto(address, info[0], info[1], info[2], info[3], info[4]));
  }
  return detailed;
};

export const loadUserTokens = async (contract, apartments, userAccount) => {
  if (!contract || !apartments.length || !userAccount) return {};
  const tokens = {};
  for (let i = 0; i < apartments.length; i++) {
    const balance = await contract.methods.getTokenBalance(i, userAccount).call();
    if (parseInt(balance) > 0) tokens[i] = parseInt(balance);
  }
  return tokens;
};

export const loadPendingCount = async (contract) => {
  if (!contract) return 0;
  const count = await contract.methods.getPendingCount().call();
  return parseInt(count);
};

export const loadTopHoldersForApartment = async (contract, apartmentId) => {
  if (!contract) return null;
  return await contract.methods.getTopHolders(apartmentId, 10).call();
};

export const loadOwnerBalances = async (contract, web3, apartments, account) => {
  if (!contract || !apartments.length || !account) return {};
  const balances = {};
  const ownedApartments = apartments.filter(apt => apt.owner && apt.owner.toLowerCase() === account.toLowerCase());
  for (const apt of ownedApartments) {
    const balanceWei = await contract.methods.apartmentBalance(apt.id).call();
    const balanceEth = parseFloat(web3.utils.fromWei(balanceWei, 'ether'));
    if (balanceEth > 0) balances[apt.id] = balanceEth;
  }
  return balances;
};

export const loadClaimableRentalIncome = async (contract, web3, apartments, account) => {
  if (!contract || !apartments.length || !account) return {};
  const claimable = {};
  for (const apt of apartments) {
    const amountWei = await contract.methods.claimableRentalIncome(apt.id, account).call();
    const amountEth = parseFloat(web3.utils.fromWei(amountWei, 'ether'));
    if (amountEth > 0) claimable[apt.id] = amountEth;
  }
  return claimable;
};

export const getPastTransactions = async (contract, web3, fromBlock = 0) => {
  if (!contract || !web3) return [];
  
  const transactions = [];
  
  try {
    // Fetch TokensPurchased events
    const purchaseEvents = await contract.getPastEvents('TokensPurchased', {
      fromBlock: fromBlock,
      toBlock: 'latest'
    });
    
    for (const event of purchaseEvents) {
      const block = await web3.eth.getBlock(event.blockNumber);
      transactions.push({
        type: 'BUY',
        apartmentId: parseInt(event.returnValues.apartmentId),
        from: event.returnValues.buyer,
        to: null,
        amount: parseInt(event.returnValues.amount),
        totalValue: parseFloat(web3.utils.fromWei(event.returnValues.totalPrice, 'ether')),
        timestamp: parseInt(block.timestamp) * 1000,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    }
    
    // Fetch TokensTransferred events  
    const transferEvents = await contract.getPastEvents('TokensTransferred', {
      fromBlock: fromBlock,
      toBlock: 'latest'
    });
    
    for (const event of transferEvents) {
      const block = await web3.eth.getBlock(event.blockNumber);
      transactions.push({
        type: 'TRANSFER',
        apartmentId: parseInt(event.returnValues.apartmentId),
        from: event.returnValues.from,
        to: event.returnValues.to,
        amount: parseInt(event.returnValues.amount),
        totalValue: null,
        timestamp: parseInt(block.timestamp) * 1000,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    }
    
    // Fetch TokensSold events
    const sellEvents = await contract.getPastEvents('TokensSold', {
      fromBlock: fromBlock,
      toBlock: 'latest'
    });
    
    for (const event of sellEvents) {
      const block = await web3.eth.getBlock(event.blockNumber);
      transactions.push({
        type: 'SELL',
        apartmentId: parseInt(event.returnValues.apartmentId),
        from: event.returnValues.seller,
        to: null,
        amount: parseInt(event.returnValues.amount),
        totalValue: parseFloat(web3.utils.fromWei(event.returnValues.totalValue, 'ether')),
        timestamp: parseInt(block.timestamp) * 1000,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    }
  } catch (e) {
    console.error('Error fetching past events:', e);
  }
  
  transactions.sort((a, b) => b.timestamp - a.timestamp);
  
  return transactions;
};

