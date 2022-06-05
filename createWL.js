require('dotenv').config()
const fs = require('fs');
const AL = require("./ContractData/WL/WL.json")
const ALaddresses = AL.addresses;
// const URIS = require("./ContractData/URIs/URIs.json")
// var contract = artifacts.require("Duality");
var contract_address = process.env.PROD_CONTRACT_ADDRESS;
const signer = web3.eth.accounts.wallet.add(process.env.DEV_WALLET_1_PRIVKEY);
console.log(web3)

module.exports = async function() {
    let signedAL=[];
    for(i=0; i < ALaddresses.length ;i ++){
        web3.utils.toChecksumAddress(ALaddresses[i].address)
        web3.utils.toChecksumAddress(signer.address)
        console.log(ALaddresses[i].address)
        let signedMessage = await web3.eth.accounts.sign(web3.utils.soliditySha3(ALaddresses[i].address, contract_address, 1, true, false, true), signer.privateKey)
        signedAL.push({[ALaddresses[i].address]: {signedMessage: signedMessage}})
    }
    let data = JSON.stringify(signedAL)
    fs.writeFileSync('signedList.json', data);
}

