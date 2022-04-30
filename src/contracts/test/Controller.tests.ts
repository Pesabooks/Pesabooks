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
  PoolSafe__factory,
  Registry,
  Registry__factory,
} from '../typechain';

let tether: MockTether;
let poolSafe: PoolSafe;
let controller: Controller;
let registry: Registry;
let tetherOwner: SignerWithAddress;
let owner: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let addrs: SignerWithAddress[];

beforeEach(async () => {
  [owner, addr1, addr2, tetherOwner, ...addrs] = await ethers.getSigners();

  // Deploy mock tether
  const tetherFactory = new MockTether__factory(tetherOwner);
  tether = await tetherFactory.deploy();
  await tether.deployed();

  // Fund owner
  //await (await tether.connect(tetherOwner).increaseAllowance(owner.address, 1000)).wait();
  await (await tether.connect(tetherOwner).transfer(owner.address, 1000)).wait();

  // Deploy controller
  const actionFactory = new Controller__factory(owner);
  controller = await actionFactory.deploy();
  await controller.deployed();

  // Deploy Proxy
  const registryFactory = new Registry__factory(owner);
  registry = await registryFactory.deploy(Constants.CONTROLLER_ADDRESS, controller.address);
  await registry.deployed();

  // Deploy Pool
  const poolSafeFactory = new PoolSafe__factory(owner);
  poolSafe = await poolSafeFactory.deploy(tether.address, registry.address);
  await poolSafe.deployed();
});

describe('Controller Contract', function () {
  describe('Deposit', function () {
    it('Should transfer tokens between wallet ', async function () {
      const amount = 50;

      await (await tether.connect(owner).increaseAllowance(poolSafe.address, amount)).wait();
      await (await controller.deposit(poolSafe.address, tether.address, amount)).wait();
      let poolBalance = await tether.balanceOf(poolSafe.address);

      expect(poolBalance).to.be.equal(amount);
    });
  });

  describe('Withdrawal', function () {
    let balance = 50000;
    beforeEach(async () => {
      //await (await tether.increaseAllowance(poolSafe.address, balance)).wait();
      await (await tether.transfer(poolSafe.address, balance)).wait();
    });

    it('should failed if sender is not an admin ', async function () {
      await expect(
        controller.connect(addr1).withdraw(poolSafe.address, tether.address, addr1.address, 50),
      ).to.be.revertedWith('Operation require admin privilige');
    });

    it('should failed if poolSafe doesn’t have enough tokens ', async function () {
      await expect(
        controller.withdraw(poolSafe.address, tether.address, addr1.address, balance + 1),
      ).to.be.revertedWith('Insufficient funds');
    });

    it('Should transfer tokens between accounts', async function () {
      const allowance = await tether.allowance(poolSafe.address, addr1.address);
      console.log('allowance', allowance.toNumber());

      const amount = 1000;
      const tx = await controller.withdraw(poolSafe.address, tether.address, addr1.address, amount);
      await tx.wait();

      expect(await tether.balanceOf(addr1.address)).to.be.equal(amount);
    });
  });

  describe('increaseTokenAllowance', function () {
    let balance = 50000;
    beforeEach(async () => {
      //await (await tether.increaseAllowance(poolSafe.address, balance)).wait();
      await (await tether.transfer(poolSafe.address, balance)).wait();
    });

    it('should failed if sender is not an admin ', async function () {
      await expect(
        controller.connect(addr1).increaseTokenAllowance(poolSafe.address, tether.address, addr1.address, 50),
      ).to.be.revertedWith('Operation require admin privilige');
    });

    it('should failed if poolSafe doesn’t have enough tokens ', async function () {
      await expect(
        controller.increaseTokenAllowance(poolSafe.address, tether.address, addr1.address, balance + 1),
      ).to.be.revertedWith('Insufficient funds');
    });

    it('Should approve spender', async function () {
      let allowance = await tether.allowance(poolSafe.address, addr2.address);
      assert(allowance.toNumber() == 0);

      const amount = 1000;
      const tx = await controller.increaseTokenAllowance(poolSafe.address, tether.address, addr2.address, amount);
      await tx.wait();

      allowance = await tether.allowance(poolSafe.address, addr2.address);
      expect(allowance.toNumber()).to.be.equal(amount);
    });
  });
});
