import {ethers} from 'hardhat';
import {Constants} from '../Constants';

async function main() {
  // Deploy Pool Controller Contract

  const controllerFactory = await ethers.getContractFactory('Controller');
  const controller = await controllerFactory.deploy();
  await controller.deployed();

  console.log('Controller deployed to:', controller.address);

  const RegistryFactory = await ethers.getContractFactory('Registry');
  const registry = await RegistryFactory.deploy(Constants.CONTROLLER_ADDRESS, controller.address);
  await registry.deployed();

  console.log('Registry deployed to:', registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
