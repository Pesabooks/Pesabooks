import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {assert, expect} from 'chai';
import {ethers} from 'hardhat';
import {Constants} from '../Constants';
// eslint-disable-next-line node/no-missing-import
import {
  Controller,
  Controller__factory,
  MockTether,
  MockTether__factory,
  PoolSafe,
  PoolSafeFactory,
  PoolSafeFactory__factory,
  PoolSafe__factory,
  Registry,
  Registry__factory,
} from '../typechain';

let tether: MockTether;
let poolSafeFactory: PoolSafeFactory;
let controller: Controller;
let registry: Registry;
let owner: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let addrs: SignerWithAddress[];

beforeEach(async () => {
  [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

  // Deploy mock tether
  const tetherFactory = new MockTether__factory(owner);
  tether = await tetherFactory.deploy();
  await tether.deployed();

  // Deploy controller
  const controllerFactory = new Controller__factory(owner);
  controller = await controllerFactory.deploy();
  await controller.deployed();

  // Deploy Proxy
  const registryFactory = new Registry__factory(owner);
  registry = await registryFactory.deploy(Constants.CONTROLLER_ADDRESS, controller.address);
  await registry.deployed();

  // Deploy PoolSafe Factory
  const poolSafeFactory_F = new PoolSafeFactory__factory(owner);
  poolSafeFactory = await poolSafeFactory_F.deploy();
  await poolSafeFactory.deployed();
});

describe('PoolSafe Contract', function () {
  describe('Deployment with factory', function () {
    it(' should have precomputed address', async function () {
      const byteCode = await poolSafeFactory.getBytecode(tether.address, registry.address);
      const address = await poolSafeFactory.getAddress(byteCode, 1);
      const receipt = await (await poolSafeFactory.deploy(byteCode, 1)).wait();

      const deploymentEvent = receipt.events.find(
        (e) => e.event == poolSafeFactory.interface.events['Deployed(address,uint256)'].name,
      );

      expect(address).to.be.eq(deploymentEvent.args[0]);
    });
  });

  describe('Deployment', function () {
    let poolSafe: PoolSafe;
    beforeEach(async () => {
      // Deploy PoolSafe
      const PoolFactory = new PoolSafe__factory(owner);
      poolSafe = await PoolFactory.deploy(tether.address, registry.address);
      await poolSafe.deployed();
    });

    it('Should set the admin right', async function () {
      expect(await poolSafe.hasRole(await poolSafe.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);

      /// enumerate admins
      const adminRole = await poolSafe.DEFAULT_ADMIN_ROLE();
      const count: number = (await poolSafe.getRoleMemberCount(adminRole)).toNumber();

      let admins = [];
      for (let i = 0; i < count; i++) {
        const a = await poolSafe.getRoleMember(adminRole, i);
        admins.push(a);
      }

      expect(admins).to.contain(owner.address);
    });
  });

  describe('', function () {
    let poolSafe: PoolSafe;
    beforeEach(async () => {
      // Deploy PoolSafe
      const PoolFactory = new PoolSafe__factory(owner);
      poolSafe = await PoolFactory.deploy(tether.address, registry.address);
      await poolSafe.deployed();
    });

    describe('Add Admin', function () {
      it('Should set address as admin', async function () {
        assert((await poolSafe.hasRole(await poolSafe.DEFAULT_ADMIN_ROLE(), addr1.address)) === false);

        await (await poolSafe.addAdmin(addr1.address)).wait();

        expect(await poolSafe.hasRole(await poolSafe.DEFAULT_ADMIN_ROLE(), addr1.address)).to.equal(true);
        expect(await poolSafe.getAdmins()).to.contain(addr1.address);
      });

      it('Should failed without admin privilege', async function () {
        await expect(poolSafe.connect(addr1).addAdmin(addr1.address)).to.be.revertedWith(
          'Operation require admin privilige',
        );
      });

      it('Should failed if already admin ', async function () {
        await expect(poolSafe.addAdmin(owner.address)).to.be.reverted;
      });
    });

    describe('Remove Admin', function () {
      it('Should remove address as admin', async function () {
        await (await poolSafe.addAdmin(addr1.address)).wait();
        assert((await poolSafe.hasRole(await poolSafe.DEFAULT_ADMIN_ROLE(), addr1.address)) === true);

        await (await poolSafe.removeAdmin(addr1.address)).wait();

        expect(await poolSafe.hasRole(await poolSafe.DEFAULT_ADMIN_ROLE(), addr1.address)).to.equal(false);
        expect(await poolSafe.getAdmins()).to.not.contain(addr1.address);
      });

      it('Should failed when remove himself', async function () {
        await expect(poolSafe.removeAdmin(owner.address)).to.be.revertedWith('Cannot self revoke right');
      });
      it('Should failed without admin privilege', async function () {
        await expect(poolSafe.connect(addr1).removeAdmin(addr1.address)).to.be.revertedWith(
          'Operation require admin privilige',
        );
      });
    });

    describe('RelayCall', function () {
      let data;

      beforeEach(async () => {
        const iface = Controller__factory.createInterface();
        data = iface.encodeFunctionData('deposit', [tether.address, owner.address, 1000]);
      });

      it('Should failed when called by non controller', async function () {
        await expect(poolSafe.relayCall(Constants.CONTROLLER_ADDRESS, data)).to.be.revertedWith('Unauthorized sender');
      });
    });
  });
});
