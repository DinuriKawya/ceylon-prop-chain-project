import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_NETWORKS } from '../../utils/constants';

export const initWeb3AndContract = async () => {
  if (!window.ethereum) throw new Error('Please install MetaMask!');
  
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const web3Instance = new Web3(window.ethereum);
  const networkId = await web3Instance.eth.net.getId();
  const deployedNetwork = CONTRACT_NETWORKS[networkId];
  
  if (!deployedNetwork) throw new Error('Contract not deployed to detected network');
  
  const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, deployedNetwork.address);
  
  return { web3: web3Instance, contract: contractInstance, account: accounts[0] };
};
