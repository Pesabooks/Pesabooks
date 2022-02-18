// import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
// import {assert, expect} from 'chai';
// import {ethers} from 'hardhat';
// // eslint-disable-next-line node/no-missing-import
// import {MockTether, Account, MockTether__factory, Account__factory, Pool__factory, Pool} from '../typechain';
// import {SavingAccount__factory} from '../typechain/factories/SavingAccount__factory';
// import {SavingAccount} from '../typechain/SavingAccount';

// let tether: MockTether;
// let pool: Pool;
// let owner: SignerWithAddress;
// let addr1: SignerWithAddress;
// let addr2: SignerWithAddress;
// let addrs: SignerWithAddress[];

// beforeEach(async () => {
//   [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

//   // Deploy mock tether
//   const tetherFactory = new MockTether__factory(owner);
//   tether = await tetherFactory.deploy();
//   await tether.deployed();

//   // Deploy Pool
//   const PoolFactory = new Pool__factory(owner);
//   pool = await PoolFactory.deploy(tether.address);
//   await pool.deployed();
// });

// describe('Transfer', function () {
//   let amount: number = 500;
//   let account: Account;
//   let savingAc: SavingAccount;

//   beforeEach(async () => {
//     const accountFactory = new Account__factory(owner);
//     account = await accountFactory.deploy(pool.address, tether.address);
//     await account.deployed();
//   });

//   beforeEach(async () => {
//     // Fund checking account
//     await (await tether.increaseAllowance(account.address, amount)).wait();
//     await (await account.deposit(amount)).wait();

//     // deploy second accont
//     const savingAccountFactory = new SavingAccount__factory(owner);
//     savingAc = await savingAccountFactory.deploy(pool.address, tether.address);
//     await savingAc.deployed();
//   });

//   it.only('should tranfer if tokens are different ', async function () {
//     // deploy second accont
//     const accountFactory = new Account__factory(owner);
//     const acc3 = await accountFactory.deploy(pool.address, addr2.address);
//     await acc3.deployed();
//     assert((await acc3.canDepositDiffToken()) === false);

//     await expect(account.transfer(acc3.address, amount)).to.be.revertedWith(
//       'Transfer from accounts with different tokens not supported',
//     );
//   });
// });
