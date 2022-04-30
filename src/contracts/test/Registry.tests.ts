import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {expect} from 'chai';
import {ethers} from 'hardhat';
import {Constants} from '../Constants';
// eslint-disable-next-line node/no-missing-import
import {Controller, Controller__factory, Registry, Registry__factory} from '../typechain';

let owner: SignerWithAddress;
let addr1: SignerWithAddress;
let controller: Controller;

beforeEach(async () => {
  [owner, addr1] = await ethers.getSigners();
  // Deploy controller
  const actionFactory = new Controller__factory(owner);
  controller = await actionFactory.deploy();
  await controller.deployed();
});

describe('Registry Contract', function () {
  describe('Deployment', function () {
    let registry: Registry;
    beforeEach(async () => {
      const factory = new Registry__factory(owner);
      registry = await factory.deploy(Constants.CONTROLLER_ADDRESS, controller.address);
      await registry.deployed();
    });
    describe('addOrUpdate', function () {
      it('Should update registry', async function () {
        const factory = new Registry__factory(owner);
        const newRegistry: Registry = await factory.deploy(Constants.CONTROLLER_ADDRESS, controller.address);
        await newRegistry.deployed();

        await registry.addOrUpdate(Constants.CONTROLLER_ADDRESS, newRegistry.address);
        expect(await registry.getAddress(Constants.CONTROLLER_ADDRESS)).to.eq(newRegistry.address);
      });

      it('Should add new addres', async function () {
        await registry.addOrUpdate('NEW_SETTINGS', owner.address);
        expect(await registry.getAddress('NEW_SETTINGS')).to.eq(owner.address);
      });

      it('Should failed without owner right', async function () {
        const factory = new Registry__factory(owner);
        const newRegistry: Registry = await factory.deploy(Constants.CONTROLLER_ADDRESS, controller.address);
        await newRegistry.deployed();

        await expect(registry.connect(addr1).addOrUpdate(Constants.CONTROLLER_ADDRESS, newRegistry.address)).to.be
          .reverted;
      });
    });
  });
});
