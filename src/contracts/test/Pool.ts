import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {assert, expect} from 'chai';
import {ethers} from 'hardhat';
// eslint-disable-next-line node/no-missing-import
import {
  MockTether,
  Pool,
  Account,
  PoolFactory__factory,
  PoolFactory,
  MockTether__factory,
  Pool__factory,
  Account__factory,
  // eslint-disable-next-line node/no-missing-import
} from '../typechain';
import abiDecoder from 'abi-decoder';

let tether: MockTether;
let poolFactory: PoolFactory;
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

  // Deploy Pool Factory
  const PoolFactory_F = new PoolFactory__factory(owner);
  poolFactory = await PoolFactory_F.deploy();
  await poolFactory.deployed();
});

describe('Pool Contract', function () {
  let pool: Pool;

  describe('Deployment with factory', function () {
    it(' should have precomputed address', async function () {
      const byteCode = await poolFactory.getBytecode(tether.address);
      const address = await poolFactory.getAddress(byteCode, 1);
      const receipt = await (await poolFactory.deploy(byteCode, 1)).wait();

      const deploymentEvent = receipt.events.find(
        (e) => e.event == poolFactory.interface.events['Deployed(address,uint256)'].name,
      );

      expect(address).to.be.eq(deploymentEvent.args[0]);
    });
  });

  describe('Deployment', function () {
    let pool: Pool;
    beforeEach(async () => {
      // Deploy Pool
      const PoolFactory = new Pool__factory(owner);
      pool = await PoolFactory.deploy(tether.address);
      await pool.deployed();
    });

    it('Should set the admin right', async function () {
      expect(await pool.hasRole(await pool.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
      const admins = await pool.getAdmins();
      expect(admins).to.contain(owner.address);
    });

    it('Should deployed default account', async function () {
      const defaultAccountAddr = await pool.defaultAccount();
      const defaultAccount = Account__factory.connect(defaultAccountAddr, owner);
      expect(defaultAccountAddr).to.be.properAddress;
      expect(await defaultAccount.token()).to.be.eq(tether.address);
    });
  });

  describe('Add Admin', function () {
    let pool: Pool;
    beforeEach(async () => {
      // Deploy Pool
      const PoolFactory = new Pool__factory(owner);
      pool = await PoolFactory.deploy(tether.address);
      await pool.deployed();
    });

    it('Should set address as admin', async function () {
      assert((await pool.hasRole(await pool.DEFAULT_ADMIN_ROLE(), addr1.address)) === false);

      await (await pool.addAdmin(addr1.address)).wait();

      expect(await pool.hasRole(await pool.DEFAULT_ADMIN_ROLE(), addr1.address)).to.equal(true);
      expect(await pool.getAdmins()).to.contain(addr1.address);
    });

    it('Should failed without admin privilege', async function () {
      await expect(pool.connect(addr1).addAdmin(addr1.address)).to.be.revertedWith('Operation require admin privilige');
    });

    it('Should failed if already admin ', async function () {
      await expect(pool.addAdmin(owner.address)).to.be.reverted;
    });
  });

  describe('Remove Admin', function () {
    let pool: Pool;
    beforeEach(async () => {
      // Deploy Pool
      const PoolFactory = new Pool__factory(owner);
      pool = await PoolFactory.deploy(tether.address);
      await pool.deployed();
    });

    it('Should remove address as admin', async function () {
      await (await pool.addAdmin(addr1.address)).wait();
      assert((await pool.hasRole(await pool.DEFAULT_ADMIN_ROLE(), addr1.address)) === true);

      await (await pool.removeAdmin(addr1.address)).wait();

      expect(await pool.hasRole(await pool.DEFAULT_ADMIN_ROLE(), addr1.address)).to.equal(false);
      expect(await pool.getAdmins()).to.not.contain(addr1.address);
    });

    it('Should failed when remove himself', async function () {
      await expect(pool.removeAdmin(owner.address)).to.be.revertedWith('Cannot self revoke right');
    });
    it('Should failed without admin privilege', async function () {
      await expect(pool.connect(addr1).removeAdmin(addr1.address)).to.be.revertedWith(
        'Operation require admin privilige',
      );
    });
  });
});
