import {ethers} from 'hardhat';
import {Constants} from '../Constants';

async function main() {
  // Deploy Pool Logic Contract

  const poolLogicFactory = await ethers.getContractFactory('PoolLogic');
  const logic = await poolLogicFactory.deploy();
  await logic.deployed();

  console.log('PoolLogic deployed to:', logic.address);

  const RegistryFactory = await ethers.getContractFactory('Registry');
  const registry = await RegistryFactory.deploy(Constants.POOL_LOGIC_ADDRESS, logic.address);
  await registry.deployed();

  console.log('Registry deployed to:', registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
