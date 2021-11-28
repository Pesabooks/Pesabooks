import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useState } from 'react';
import { ethers } from 'ethers'

import {Greeter__factory} from '@pesapool/smart-contracts/typechain/factories/Greeter__factory';

// Update with the contract address logged out to the CLI when it was deployed 
const greeterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

function App() {

  // store greeting in local state
  const [greeting, setGreetingValue] = useState<string>()

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // call the smart contract, read the current greeting value
  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = Greeter__factory.connect(greeterAddress, provider)
      try {
        const data = await contract.greet()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  // call the smart contract, send an update
  async function setGreeting() {
    if (!greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = Greeter__factory.connect(greeterAddress, signer)
      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      fetchGreeting()
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" />
      </header>
    </div>
  );
}

export default App;
