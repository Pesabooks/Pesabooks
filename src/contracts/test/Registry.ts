import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {expect} from 'chai';
import {ethers} from 'hardhat';
import {Constants} from '../Constants';
// eslint-disable-next-line node/no-missing-import
import {PoolLogic, PoolLogic__factory, Registry, Registry__factory} from '../typechain';

let owner: SignerWithAddress;
let addr1: SignerWithAddress;
let poolLogic: PoolLogic;

beforeEach(async () => {
  [owner, addr1] = await ethers.getSigners();
  // Deploy poolLogic
  const actionFactory = new PoolLogic__factory(owner);
  poolLogic = await actionFactory.deploy();
  await poolLogic.deployed();
});

describe('Registry Contract', function () {
  describe('Deployment', function () {
    let registry: Registry;
    beforeEach(async () => {
      const factory = new Registry__factory(owner);
      registry = await factory.deploy(Constants.POOL_LOGIC_ADDRESS, poolLogic.address);
      await registry.deployed();
    });
    describe('Update', function () {
      it('Should update registry', async function () {
        const factory = new Registry__factory(owner);
        const newRegistry: Registry = await factory.deploy(Constants.POOL_LOGIC_ADDRESS, poolLogic.address);
        await newRegistry.deployed();

        await registry.update(Constants.POOL_LOGIC_ADDRESS, newRegistry.address);
        expect(await registry.getAddress(Constants.POOL_LOGIC_ADDRESS)).to.eq(newRegistry.address);
      });

      it('Should add new addres', async function () {
        await registry.update('NEW_SETTINGS', owner.address);
        expect(await registry.getAddress('NEW_SETTINGS')).to.eq(owner.address);
      });

      it('Should failed without owner right', async function () {
        const factory = new Registry__factory(owner);
        const newRegistry: Registry = await factory.deploy(Constants.POOL_LOGIC_ADDRESS, poolLogic.address);
        await newRegistry.deployed();

        await expect(registry.connect(addr1).update(Constants.POOL_LOGIC_ADDRESS, newRegistry.address)).to.be.reverted;
      });
    });
  });
});
