import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {expect} from 'chai';
import {ethers} from 'hardhat';
import {Constants} from '../Constants';
// eslint-disable-next-line node/no-missing-import
import {
  MockTether,
  MockTether__factory,
  PoolLogic,
  PoolLogic__factory,
  PoolSafe,
  PoolSafe__factory,
  Registry,
  Registry__factory,
} from '../typechain';

let tether: MockTether;
let poolSafe: PoolSafe;
let poolLogic: PoolLogic;
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

  // Deploy poolLogic
  const actionFactory = new PoolLogic__factory(owner);
  poolLogic = await actionFactory.deploy();
  await poolLogic.deployed();

  // Deploy Proxy
  const registryFactory = new Registry__factory(owner);
  registry = await registryFactory.deploy(Constants.POOL_LOGIC_ADDRESS, poolLogic.address);
  await registry.deployed();

  // Deploy Pool
  const poolSafeFactory = new PoolSafe__factory(owner);
  poolSafe = await poolSafeFactory.deploy(tether.address, registry.address);
  await poolSafe.deployed();
});

describe('PoolLogic Contract', function () {
  describe('Deposit', function () {
    it('Should transfer tokens between wallet ', async function () {
      const amount = 50;

      await (await tether.increaseAllowance(poolSafe.address, amount)).wait();
      await (await poolLogic.deposit(poolSafe.address, tether.address, amount)).wait();
      let poolBalance = await tether.balanceOf(poolSafe.address);

      expect(poolBalance).to.be.equal(amount);
    });
  });

  describe('Withdrawal', function () {
    let balance = 50000;
    beforeEach(async () => {
      await (await tether.increaseAllowance(poolSafe.address, balance)).wait();
      await (await poolLogic.deposit(poolSafe.address, tether.address, balance)).wait();
    });

    it('should failed if sender is not an admin ', async function () {
      await expect(
        poolLogic.connect(addr1).withdraw(poolSafe.address, tether.address, addr1.address, 50),
      ).to.be.revertedWith('Operation require admin privilige');
    });

    it('should failed if poolSafe doesn’t have enough tokens ', async function () {
      await expect(poolLogic.withdraw(poolSafe.address, tether.address, addr1.address, balance + 1)).to.be.revertedWith(
        'Insufficient funds',
      );
    });

    it('Should transfer tokens between accounts', async function () {
      const amount = 1000;
      const tx = await poolLogic.withdraw(poolSafe.address, tether.address, addr1.address, amount);
      await tx.wait();

      expect(await tether.balanceOf(addr1.address)).to.be.equal(amount);
    });
  });
});
