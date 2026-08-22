import ApartmentToken from "../static/ApartmentToken.json";

export const IMGBB_API_KEY = process.env.REACT_APP_IMGBB_API_KEY;
export const CONTRACT_ABI = ApartmentToken.abi;
export const CONTRACT_NETWORKS = ApartmentToken.networks;
export const DEFAULT_GAS = 3000000;

export const MIN_INVESTMENT_ETH = 10;

export const ML_CLUSTERS = ['Expensive & Stable', 'Fast Growing', 'Budget & Rising'];
export const CHAT_RESPONSES = [
  "Based on 2025 data, Fast Growing areas show +25-35% growth. Top picks: Kadawatha (+35% last year), Yakkala (+35%), Kiribathgoda (+34%)",
  "The best investment areas right now are in the Western Province, with projected growth of 20-30% over the next 2 years.",
  "Budget & Rising areas offer great entry points with high future potential. Consider investing in areas like Kadawatha and Yakkala.",
  `Fractional ownership allows you to invest from just ${MIN_INVESTMENT_ETH} ETH. This makes real estate accessible to everyone!`
];
