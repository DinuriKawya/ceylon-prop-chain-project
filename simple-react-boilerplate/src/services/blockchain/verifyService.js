import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_NETWORKS } from "../../utils/constants";

const GANACHE_RPC = `http://${window.location.hostname || "127.0.0.1"}:7545`;

const getReadOnlyContract = async () => {
  if (window.ethereum) {
    try {
      const injected = new Web3(window.ethereum);
      const injectedNet = await injected.eth.net.getId();
      if (CONTRACT_NETWORKS[injectedNet]) {
        return {
          web3: injected,
          contract: new injected.eth.Contract(
            CONTRACT_ABI,
            CONTRACT_NETWORKS[injectedNet].address,
          ),
        };
      }
    } catch (e) {}
  }

  const web3 = new Web3(new Web3.providers.HttpProvider(GANACHE_RPC));
  const networkId = await web3.eth.net.getId();
  const deployed = CONTRACT_NETWORKS[networkId];
  if (!deployed)
    throw new Error(
      "Contract not found on the local network. Make sure Ganache is running.",
    );
  return {
    web3,
    contract: new web3.eth.Contract(CONTRACT_ABI, deployed.address),
  };
};

export const verifyOwnership = async (apartmentId, address) => {
  const { web3, contract } = await getReadOnlyContract();

  const balance = parseInt(
    await contract.methods.getTokenBalance(apartmentId, address).call(),
  );
  const totalTokens = parseInt(
    await contract.methods.getTotalSupply(apartmentId).call(),
  );

  const all = await contract.methods.getAllApartments().call();
  const idx = all[0].findIndex((id) => parseInt(id) === parseInt(apartmentId));
  const property =
    idx > -1
      ? {
          title: all[1][idx],
          location: all[2][idx],
          imageUrl: all[8][idx],
          tokenPrice: parseFloat(web3.utils.fromWei(all[5][idx], "ether")),
        }
      : null;

  let ownerName = "";
  try {
    const info = await contract.methods.getUserInfo(address).call();
    ownerName = info[0] || "";
  } catch (e) {}

  return {
    verified: balance > 0,
    balance,
    totalTokens,
    pct: totalTokens > 0 ? (balance / totalTokens) * 100 : 0,
    property,
    ownerName,
    address,
  };
};
