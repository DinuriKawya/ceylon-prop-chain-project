# CeylonPropChain

CeylonPropChain is a blockchain-based fractional real estate investment platform. It lets verified property owners tokenize apartments in Sri Lanka and lets investors buy, hold, resell and earn rental income from fractional tokens — all backed by a Solidity smart contract and a React front end connected through MetaMask.

## Features

- Wallet-based registration and administrator identity review
- Property tokenization with admin approval
- Fractional token marketplace (primary purchase and resale)
- Portfolio management (transfer, sell, resell, cancel)
- Rental income distribution and claiming
- QR-based ownership verification
- Location insights via K-means clustering
- AI chat assistant

## Tech stack

| Layer | Technology |
|---|---|
| Front end | React 16, Bootstrap 5 |
| Blockchain client | Web3.js, MetaMask |
| Smart contract | Solidity `^0.8.21` (`ApartmentToken.sol`) |
| Local blockchain | Ganache (Truffle) |
| Off-chain storage | ImgBB (identity images, apartment images, deed references) |
| AI assistant | OpenRouter API |
| Location analytics | Python (pandas, scikit-learn K-means) — precomputed, not run live |

## Architecture

CeylonPropChain follows a standard DApp (decentralized application) architecture — a React front end talking to a Solidity smart contract through Web3.js and MetaMask, with off-chain services for anything that shouldn't live on-chain.

```
Browser
  │
  ▼
React Frontend (simple-react-boilerplate)
  │
  ├──► ImgBB API           (off-chain: identity images, apartment images, deed references)
  ├──► OpenRouter API       (AI chat assistant)
  ├──► Precomputed JSON     (location insights — from the offline K-means pipeline)
  │
  ▼
Web3.js
  │
  ▼
MetaMask                    (wallet connection, transaction signing)
  │
  ▼
ApartmentToken Smart Contract (Solidity, deployed on Ganache)
```

- React frontend — renders all user and admin interfaces
- Web3.js — bridges frontend and blockchain
- MetaMask — wallet connection and transaction signing
- `ApartmentToken` contract — source of truth for users, apartments, tokens, resale, rental income
- ImgBB, OpenRouter — off-chain services, called directly from the frontend
- Location insights — precomputed offline, bundled as static JSON

## Project structure

```
CeylonPropChain/
├── contracts/
│   └── ApartmentToken.sol
├── migrations/
│   └── 3_ApartmentToken_migration.js
├── test/
├── Location_Cluster/
│   ├── 00_eda.ipynb
│   ├── 01_preprocessing.ipynb
│   ├── 02_clustering.ipynb
│   ├── 03_enrichment_charts.ipynb
│   ├── 04_testing_export.ipynb
│   ├── build_ml_report.py
│   ├── ml_utils.py
│   ├── kmeans_model.pkl
│   └── scaler.pkl
├── simple-react-boilerplate/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── components/
│       │   ├── Certificate/
│       │   ├── ChatWidget/
│       │   ├── Footer/
│       │   ├── LocationMap/
│       │   ├── Modal/
│       │   ├── Navbar/
│       │   └── PropertyStatusNotifications/
│       ├── context/
│       │   ├── AppContext.js
│       │   ├── ChatContext.js
│       │   ├── UserContext.js
│       │   └── WalletContext.js
│       ├── data/
│       │   ├── city_clusters.json
│       │   ├── city_map_data.json
│       │   ├── district_clusters.json
│       │   └── postal_to_city.json
│       ├── dto/
│       │   ├── ApartmentDto.js
│       │   ├── ChatDto.js
│       │   ├── PortfolioDto.js
│       │   ├── TokenDto.js
│       │   └── UserDto.js
│       ├── hooks/
│       │   ├── useProperties.js
│       │   ├── useTokens.js
│       │   ├── useUser.js
│       │   └── useWallet.js
│       ├── pages/
│       │   ├── Admin/
│       │   ├── Home/
│       │   ├── Marketplace/
│       │   ├── Portfolio/
│       │   ├── PropertyDetails/
│       │   ├── Tokenize/
│       │   ├── Transactions/
│       │   └── Verify/
│       ├── services/
│       │   ├── blockchain/
│       │   │   ├── contractService.js
│       │   │   ├── resaleService.js
│       │   │   ├── verifyService.js
│       │   │   └── web3Service.js
│       │   ├── chatbotService.js
│       │   ├── mlService.js
│       │   ├── propertyService.js
│       │   ├── tokenService.js
│       │   ├── uploadService.js
│       │   └── userService.js
│       ├── static/
│       │   └── ApartmentToken.json
│       └── utils/
│           ├── constants.js
│           └── helpers.js
├── truffle-config.js
└── README.md
```

## Prerequisites

- Node.js and Yarn (or npm)
- [Truffle](https://trufflesuite.com/) (`yarn global add truffle`)
- [Ganache](https://trufflesuite.com/ganache/) running locally
- [MetaMask](https://metamask.io/) browser extension
- An ImgBB API key ([api.imgbb.com](https://api.imgbb.com/))
- An OpenRouter API key ([openrouter.ai](https://openrouter.ai/))

## Setup

1. **Clone the repository**

   ```
   git clone https://github.com/DinuriKawya/ceylon-prop-chain-project.git
   cd ceylon-prop-chain-project
   ```

2. **Start Ganache** on `127.0.0.1:7545` (matches `truffle-config.js`).

3. **Configure MetaMask**

   Connect MetaMask to the Ganache network (`http://127.0.0.1:7545`, chain ID as reported by Ganache) and import one or more Ganache test accounts.

4. **Compile and deploy the smart contract**

   ```
   truffle compile
   truffle migrate --reset
   ```

   Note the deployed `ApartmentToken` contract address from the migration output.

5. **Install front-end dependencies**

   ```
   cd simple-react-boilerplate
   yarn install
   ```

6. **Run the app**

   ```
   yarn start
   ```

   The app runs on [http://localhost:3000](http://localhost:3000).

## Location clustering pipeline

The `Location_Cluster/` folder contains the offline analysis used to produce location insights shown in the app. Notebooks run in order:

1. `00_eda.ipynb` — exploratory data analysis on raw listing data
2. `01_preprocessing.ipynb` — cleaning and feature preparation
3. `02_clustering.ipynb` — K-means clustering by city/district (`kmeans_model.pkl`, `scaler.pkl`)
4. `03_enrichment_charts.ipynb` — enrichment with postal/geographic data and chart generation
5. `04_testing_export.ipynb` — validation and export of final JSON insights consumed by the React app (`city_clusters.json`, `district_clusters.json`)

Source data is from Kaggle:
- Property ads: https://www.kaggle.com/datasets/ivantha/sri-lanka-property-ads-dataset
- City/district reference data: https://www.kaggle.com/datasets/tharindumadhusanka9/sri-lanka-provinces-districts-cities

The raw property ads file (`properties.csv`) is intentionally excluded from version control.

## User types

| Type | Can do |
|---|---|
| **User** | Register (pending admin approval), connect wallet, submit apartments for tokenization (pending admin approval), buy/sell/transfer tokens, resell, claim rental income, withdraw property funds (for apartments they own) |
| **Admin** | Everything a User can do except submitting apartments for tokenization, plus: approve/reject user registrations, approve/reject property submissions, distribute rental income. Admin accounts are auto-verified — no approval step needed |

## Testing

Smart contract tests live in `test/` and run via Truffle:

```
truffle test
```

## License

This project was developed as part of an academic dissertation. No license has been chosen yet.
