# Donation dApp

A decentralized application (dApp) for handling donations on the Ethereum blockchain, built with Hardhat for smart contract development and deployment.

## Overview

This donation dApp enables transparent and secure donations using smart contracts. The application demonstrates blockchain-based crowdfunding capabilities where users can make donations that are recorded immutably on the blockchain.

## Features

- **Modern Web Interface**: Built with Next.js for optimal user experience
- **Smart Contract-Based Donations**: Secure and transparent donation processing
- **Ethereum Integration**: Built on Ethereum blockchain for decentralized operations  
- **Hardhat Development Environment**: Professional development setup with testing and deployment tools
- **Gas Optimization**: Efficient smart contract design for cost-effective transactions
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js
- **Smart Contracts**: Solidity
- **Development Framework**: Hardhat
- **Blockchain**: Ethereum
- **Testing**: Hardhat Test Suite
- **Deployment**: Hardhat Ignition

## Prerequisites

Before running this project, make sure you have:

- Node.js (v14+ recommended)
- npm or yarn
- MetaMask wallet (for blockchain interaction)
- Ethereum testnet ETH (for testing)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Abu-Miracle/Donation-dApp.git
cd Donation-dApp
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Development Commands

**Blockchain Development:**
```bash
# Get help with available commands
npx hardhat help

# Run tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test

# Start local blockchain node
npx hardhat node

# Deploy contracts
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

**Frontend Development:**
```bash
# Start the Next.js development server
npm run dev
# or
yarn dev

# Build the application for production
npm run build
# or
yarn build

# Start the production server
npm start
# or
yarn start
```

### Testing

Run the test suite to ensure all functionality works correctly:

```bash
npm test
```

### Deployment

Deploy the smart contracts to your chosen network:

```bash
npx hardhat ignition deploy ./ignition/modules/Lock.js --network <network-name>
```

## Smart Contract Features

- Donation acceptance and tracking
- Transparent fund management
- Withdrawal mechanisms for authorized recipients
- Event logging for all transactions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Security

This project includes:
- Comprehensive test coverage
- Gas optimization
- Security best practices for smart contract development

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Abu-Miracle** - [GitHub Profile](https://github.com/Abu-Miracle)

## Acknowledgments

- Built with Hardhat development environment
- Utilizes Ethereum blockchain technology
- Inspired by decentralized fundraising principles

---

*For questions or support, please open an issue in the repository.*

