import React, { Component } from "react";
import Web3 from "web3";
import { Button, Alert } from "react-bootstrap";
import { AccountInfoContext } from '../Context/AccountInfo'
import duality  from "../contracts/Duality.json";
import ash  from "../contracts/fakeASH.json";
import AL from "../AL/signedList.json"

class Connect extends Component {
  
  static contextType =  AccountInfoContext
  
  componentDidMount = async () => {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      this.web3  = new Web3(window.web3.currentProvider);
    };
    if(this.web3){
      await this.setNetwork();
      await this.getContractsInstances();
      await this.setAccount();
    }
  }

  async getContractsInstances(){
    this.networkId = await this.web3.eth.net.getId();
    this.deployedNetwork = duality.networks[this.networkId];
    this.dualityInstance = new this.web3.eth.Contract(
      duality.abi,
      parseInt(process.env.REACT_APP_MAINNET_NETWORK) && process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS
    )
    this.ashInstance = new this.web3.eth.Contract(
      ash.abi,
      parseInt(process.env.REACT_APP_MAINNET_NETWORK) && process.env.REACT_APP_MAINNET_ASH_ADDRESS
    )
    this.context.updateAccountInfo({ashInstance: this.ashInstance, dualityInstance: this.dualityInstance})
    this.getMintInfo();
  }

  async setAccount(){
    if(this.context.networkId !== null){
      let accounts = await this.web3.eth.getAccounts();
      await this.context.updateAccountInfo({account: accounts[0]});
      if(this.context.account) this.getAccountsData()
    }else{
      this.resetAccountData();
    }
  }

  resetAccountData(){
    this.context.updateAccountInfo({
      account: null,
    })
  }

  async setNetwork(){
    if(this.web3){
      let networkId = await this.web3.eth.net.getId();
      this.context.updateAccountInfo({networkId: networkId})
    }
  }

  async getAccountsData(){
    if(this.context.networkId === parseInt(process.env.REACT_APP_MAINNET_NETWORK) ){
      this.context.updateAccountInfo({walletAshBalance: parseFloat(await this.ashInstance.methods.balanceOf(this.context.account).call())})
      this.context.updateAccountInfo({contractAllowance: parseInt(await this.ashInstance.methods.allowance(this.context.account, process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS).call())})
      let accountALData = await this.findSignedMessage(this.context.account);
      console.log('HERE')
      console.log(accountALData)
      if(accountALData){
        this.context.updateAccountInfo({signedMessage: accountALData.signedMessage})
        this.context.updateAccountInfo({ALquantity: parseInt(accountALData.ALquantity)})
      }
      this.context.updateAccountInfo({tokensClaimed: parseInt(await this.dualityInstance.methods._tokensClaimed(this.context.account).call())})
    }
  }

  async findSignedMessage(account){
    let signedMessage = null
    for(let i=0;i<AL.length;i++){
      let key = Object.keys(AL[i])[0]
      if(key==account){
        signedMessage = AL[i][key]
      }
    }
    return signedMessage
  }

  async getMintInfo(){
    if(this.context.networkId === parseInt(process.env.REACT_APP_MAINNET_NETWORK) ){
      this.context.updateAccountInfo({mintPrice: parseFloat(await this.dualityInstance.methods._ashPrice().call())})
    }
  }

  async connectWallet(){
    this.context.updateAccountInfo({transactionInProgress: true})
    try{
      window.ethereum.enable()
    }catch(error){
      console.log(error)
    }
    this.context.updateAccountInfo({transactionInProgress: false})
  }

  renderUserInterface(){
    if(this.web3){
      if(!this.context.account){
        return <Button id="connect_button" variant='dark' onClick={() => this.connectWallet()}>Connect your wallet</Button>
      }else if(this.context.networkId !== this.context.contractNetwork){
        return <p>Please connect to the right network</p>
      }else return null
    }else{
      return <Alert id="web3_alert" variant="dark">No Wallet detected</Alert>
    }
  }

  render() {
    if(this.web3){
      window.ethereum.on('accountsChanged', async () => {
        await this.setAccount()
      })
      window.ethereum.on('networkChanged', async () => {
        await this.setNetwork()
        await this.setAccount();
      });
    }
    return this.renderUserInterface()
  }
  
}

export default Connect;

