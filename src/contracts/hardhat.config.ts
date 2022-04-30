import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import * as dotenv from 'dotenv';
import 'hardhat-gas-reporter';
import {HardhatUserConfig, task} from 'hardhat/config';
import 'solidity-coverage';

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.7.5',
      },
      {
        version: '0.8.9',
      },
    ],
  },
  paths: {
    sources: './src',
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_URL || '',
      accounts: process.env.DEVOPS_PRIVATE_KEY !== undefined ? [process.env.DEVOPS_PRIVATE_KEY] : [],
    },
    polygon: {
      url: process.env.POLYGON_MAINNET_URL || '',
      accounts: process.env.DEVOPS_PRIVATE_KEY !== undefined ? [process.env.DEVOPS_PRIVATE_KEY] : [],
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || '',
      accounts: {
        mnemonic: process.env.TEST_MNEMONIC_PHRASE || '',
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY,
  // },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
};

export default config;
