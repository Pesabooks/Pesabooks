import {ethers} from 'hardhat';
import {Constants} from '../Constants';
import {Registry__factory} from '../typechain';

async function main() {
  // Deploy Pool Controller Contract
  const [owner] = await ethers.getSigners();

  const controllerFactory = await ethers.getContractFactory('Controller');
  const controller = await controllerFactory.deploy();
  await controller.deployed();

  console.log('Controller deployed to:', controller.address);

  const RegistryFactory = await ethers.getContractFactory('Registry');
  const registry = await Registry__factory.connect('0x0d3ED482F98050eC6F71E7560b22d2cB74baB06C', owner);

  await registry.addOrUpdate(Constants.CONTROLLER_ADDRESS, controller.address);

  console.log('Registry updated.', `{${Constants.CONTROLLER_ADDRESS}: ${controller.address}}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
