import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {assert, expect} from 'chai';
import {ethers} from 'hardhat';
// eslint-disable-next-line node/no-missing-import
import {MockTether, Account, MockTether__factory, Account__factory, Pool__factory, Pool} from '../typechain';
import {SavingAccount__factory} from '../typechain/factories/SavingAccount__factory';

let tether: MockTether;
let pool: Pool;
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

  // Deploy Pool
  const PoolFactory = new Pool__factory(owner);
  pool = await PoolFactory.deploy(tether.address);
  await pool.deployed();
});

describe('Account Contract', function () {
  let account: Account;

  beforeEach(async () => {
    const accountFactory = new Account__factory(owner);
    account = await accountFactory.deploy(pool.address, tether.address);
    await account.deployed();
  });

  describe('Deployment', function () {
    it('deploys a contract', async function () {
      expect(account.address).to.be.properAddress;
    });

    it('Should set the pool', async function () {
      expect(await account.pool()).to.equal(pool.address);
    });

    it('Should set the token', async function () {
      expect(await account.token()).to.equal(tether.address);
    });
  });

  describe('Appprove token', function () {
    it('should failed is not an admin', async function () {
      await expect(account.connect(addr1).approve(addr2.address, 1000)).to.be.revertedWith(
        'Operation require admin privilige',
      );
    });

    it('Should increase allowance', async function () {
      let amount = 1000;
      await (await account.approve(addr2.address, amount)).wait();

      const allowance = await tether.allowance(account.address, addr2.address);
      expect(allowance.toNumber()).to.be.equal(amount);
    });
  });

  describe('Deposit', function () {
    it('Should transfer tokens between accounts ', async function () {
      const amount = 50;

      await (await tether.increaseAllowance(account.address, amount)).wait();
      await (await account.deposit(amount)).wait();
      let poolBalance = await tether.balanceOf(account.address);

      expect(poolBalance).to.be.equal(amount);
    });
  });

  describe('Withdrawal', function () {
    let balance = 50000;
    beforeEach(async () => {
      await (await tether.increaseAllowance(account.address, balance)).wait();
      await (await account.deposit(balance)).wait();
    });

    it('should failed if sender is not an admin ', async function () {
      await expect(account.connect(addr1).withdraw(addr1.address, 50)).to.be.revertedWith(
        'Operation require admin privilige',
      );
    });

    it('should failed if pool doesn’t have enough tokens ', async function () {
      await expect(account.withdraw(addr1.address, balance + 1)).to.be.revertedWith('Transfer amount exceeds balance');
    });

    it('Should transfer tokens between accounts', async function () {
      const amount = 1000;
      const tx = await account.withdraw(addr1.address, amount);
      await tx.wait();

      expect(await tether.balanceOf(addr1.address)).to.be.equal(amount);
    });
  });

  describe('Transfer', function () {
    let amount: number = 500;
    let savingAc: Account;

    beforeEach(async () => {
      // Fund checking account
      await (await tether.increaseAllowance(account.address, amount)).wait();
      await (await account.deposit(amount)).wait();

      // deploy second accont
      const accountFactory = new Account__factory(owner);
      savingAc = await accountFactory.deploy(pool.address, tether.address);
      await savingAc.deployed();
    });

    it('Should transfer tokens between accounts ', async function () {
      const checkingAccountBalance = await tether.balanceOf(account.address);
      assert(checkingAccountBalance.toNumber() === amount);

      await (await account.transfer(savingAc.address, amount)).wait();

      expect(await tether.balanceOf(savingAc.address)).to.be.equal(amount);
      expect(await tether.balanceOf(account.address)).to.be.equal(0);
    });

    it('should failed if sender is not an admin ', async function () {
      await expect(account.connect(addr1).transfer(savingAc.address, amount)).to.be.revertedWith(
        'Operation require admin privilige',
      );
    });

    it('should failed if tokens are different ', async function () {
      // deploy second accont
      const accountFactory = new Account__factory(owner);
      const acc3 = await accountFactory.deploy(pool.address, addr2.address);
      await acc3.deployed();
      assert((await acc3.canDepositDiffToken()) === false);

      await expect(account.transfer(acc3.address, amount)).to.be.revertedWith(
        'Transfer from accounts with different tokens not supported',
      );
    });

    it('should succed if tokens are different ', async function () {
      // deploy second accont
      const savingAccountFactory = new SavingAccount__factory(owner);
      const savingAc = await savingAccountFactory.deploy(pool.address, tether.address);
      await savingAc.deployed();

      assert((await savingAc.canDepositDiffToken()) === true);

      (await account.transfer(savingAc.address, amount)).wait();
    });
  });
});
