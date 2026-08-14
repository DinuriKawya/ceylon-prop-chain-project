import { uploadToImgBB } from './uploadService';
import { IMGBB_API_KEY, DEFAULT_GAS } from '../utils/constants';

export const registerUser = async (contract, account, name, email, idPhotoFile, selfieFile) => {
  const idPhotoUrl = await uploadToImgBB(idPhotoFile, IMGBB_API_KEY);
  const selfieUrl = await uploadToImgBB(selfieFile, IMGBB_API_KEY);
  await contract.methods.registerUser(name, email, idPhotoUrl, selfieUrl)
    .send({ from: account, gas: DEFAULT_GAS });
};

export const approveUser = async (contract, account, userAddress) => {
  await contract.methods.approveUser(userAddress).send({ from: account, gas: DEFAULT_GAS });
};

export const rejectUser = async (contract, account, userAddress) => {
  await contract.methods.rejectUser(userAddress).send({ from: account, gas: DEFAULT_GAS });
};
