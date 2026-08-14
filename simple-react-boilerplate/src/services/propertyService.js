import { uploadToImgBB } from './uploadService';
import { IMGBB_API_KEY, DEFAULT_GAS } from '../utils/constants';

export const submitPropertyForVerification = async (contract, web3, propertyData, account) => {
  let imageUrl = '';
  let deedUrl = '';

  if (propertyData.imageFile) {
    imageUrl = await uploadToImgBB(propertyData.imageFile, IMGBB_API_KEY);
  }
  if (propertyData.deedFile) {
    deedUrl = await uploadToImgBB(propertyData.deedFile, IMGBB_API_KEY);
  }

  await contract.methods.createApartment(
    propertyData.title,
    propertyData.location,
    propertyData.description,
    parseInt(propertyData.totalTokens),
    web3.utils.toWei(propertyData.tokenPrice.toString(), 'ether'),
    imageUrl,
    deedUrl
  ).send({ from: account, gas: DEFAULT_GAS });
};

export const approveProperty = async (contract, account, apartmentId) => {
  await contract.methods.verifyApartment(apartmentId, true).send({ from: account, gas: DEFAULT_GAS });
};

export const rejectProperty = async (contract, account, apartmentId) => {
  await contract.methods.rejectApartment(apartmentId).send({ from: account, gas: DEFAULT_GAS });
};

export const distributeRentalIncome = async (contract, web3, account, apartmentId, amountEth) => {
  const amountWei = web3.utils.toWei(amountEth.toString(), 'ether');
  await contract.methods.distributeRentalIncome(apartmentId).send({ from: account, value: amountWei, gas: DEFAULT_GAS });
};
