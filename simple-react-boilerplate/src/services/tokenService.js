import { DEFAULT_GAS } from '../utils/constants';

export const buyTokens = async (contract, web3, account, apartmentId, amount, tokenPrice) => {
  const totalPrice = tokenPrice * parseFloat(amount);
  await contract.methods.buyTokens(apartmentId, parseInt(amount))
    .send({ from: account, value: web3.utils.toWei(totalPrice.toString(), 'ether'), gas: DEFAULT_GAS });
};

export const transferTokens = async (contract, account, apartmentId, toAddress, amount) => {
  await contract.methods.transferTokens(apartmentId, toAddress, parseInt(amount))
    .send({ from: account, gas: DEFAULT_GAS });
};

export const sellTokens = async (contract, account, apartmentId, amount) => {
  await contract.methods.sellTokens(apartmentId, amount)
    .send({ from: account, gas: DEFAULT_GAS });
};

export const withdrawFunds = async (contract, web3, account, apartmentId, amountEth) => {
  const amountWei = web3.utils.toWei(amountEth.toString(), 'ether');
  await contract.methods.withdraw(apartmentId, amountWei)
    .send({ from: account, gas: DEFAULT_GAS });
};

export const claimRentalIncome = async (contract, account, apartmentId) => {
  await contract.methods.claimRentalIncome(apartmentId)
    .send({ from: account, gas: DEFAULT_GAS });
};
