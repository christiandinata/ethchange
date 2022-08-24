import React, {useState, useEffect, createContext} from "react";
import {ethers} from "ethers";

import {contractABI, contractAddress} from '../utils/constants'

// create context that will be used for all components
export const TransactionContext = createContext();

const {ethereum} = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionContract;
}

// global provider
export const TransactionProvider = ({children}) => {
  const [formData, setformData] = useState({
    addressTo: '',
    amount: '',
    keyword: '',
    message: '',
  })

  const [transactions, setTransactions] = useState([])

  const handleChange = (e, name) => {
    setformData({...formData, [name]: e.target.value});
  }

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");

      const transactionContract = getEthereumContract();
      const availableTransactions = await transactionContract.getAllTransactions();

      const structuredTransactions  = availableTransactions.map((transaction) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        keyword: transaction.keyword,
        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.message,
        amount: parseInt(transaction.amount._hex) / (10**18)
      }))

      console.log(structuredTransactions)
      setTransactions(structuredTransactions);
    } catch (error) {
      console.log(error)
    }
  }

  const [isLoading, setIsLoading] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState('')
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))

  // CHECK IF WALLET CONNECTED
  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");

      const accounts = await ethereum.request({method: 'eth_accounts'});

      if (accounts.length){
        setConnectedAccount(accounts[0]);

        getAllTransactions();
      }else{
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  }

  // CHEK IF TRANSACTION EXISTS
  const checkIfTransactionExists = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();

      window.localStorage.setItem("transactionCount", transactionCount)
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  }

  // CONNECT WALLET
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});

      setConnectedAccount(accounts[0])
      // console.log(accounts);

    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  }

  // SEND TRANSACTION
  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");
      const {addressTo, amount, keyword, message} = formData;

      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount)
      
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: connectedAccount,
          to: addressTo,
          gas: '0x5208', // 21000 gwei or 0.00021 something eth
          value: parsedAmount._hex,  
        }]
      })

      const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();

      setTransactionCount(transactionCount.toNumber());
      window.reload();
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionExists();
  }, [])
  

  return (
    <TransactionContext.Provider value={{connectWallet, transactions, isLoading, connectedAccount, formData, handleChange, sendTransaction}}>
      {children}
    </TransactionContext.Provider>
  )
}