import {ethers} from 'hardhat';
import {Constants} from '../Constants';
import {Registry__factory} from '../typechain';

async function main() {
  // Deploy Pool Logic Contract
  const [owner] = await ethers.getSigners();

  const poolLogicFactory = await ethers.getContractFactory('PoolLogic');
  const logic = await poolLogicFactory.deploy();
  await logic.deployed();

  console.log('PoolLogic deployed to:', logic.address);

  const RegistryFactory = await ethers.getContractFactory('Registry');
  const registry = await Registry__factory.connect('0x0d3ED482F98050eC6F71E7560b22d2cB74baB06C', owner);

  await registry.update(Constants.POOL_LOGIC_ADDRESS, logic.address);

  console.log('Registry updated.', `{${Constants.POOL_LOGIC_ADDRESS}: ${logic.address}}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
