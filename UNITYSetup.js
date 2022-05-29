require('dotenv').config()
const WL = require("./ContractData/WL/minters.json")
// const URIS = require("./ContractData/URIs/URIs.json")
var contract = artifacts.require("Duality");
//////////////// PROD VARIABLES ///////////////////
var contract_address = process.env.PROD_CONTRACT_ADDRESS;
// const royalties_recipient_address = process.env.ROYALTIES_RECIPIENT_ADDRESS;
const WLaddresses = WL.addresses;
///////////////////////////////////////////////////

//////////////// DEV VARIABLES ///////////////////
// var contract_address = process.env.DEV_CONTRACT_ADDRESS;
// const WLaddresses = WL.test;
// const royalties_recipient_address = "0xba45e32c3D74d8db4981271542892a425CFC4a69";
///////////////////////////////////////////////////

module.exports = async function() {
    const Duality = await contract.at(contract_address);
    // console.log(contract_address)
    // const uri = URIS.link
    
    // const royaltiesAmount = 10; //In %
            
        // //     Setting up the URI
        // console.log('Setting up the URI')
        // try{
        //     console.log(uri)
        //     let res = await UNITY.setURI(uri);
        //     console.log('Successfully set the URI')
        //     console.log(res)
        //     console.log('/////////////////////////')
        // }catch(err){console.log(err)}

        //     Load the WL
            // console.log('Loading the WL')
            // try{
            //     console.log(WLaddresses)
            //     let res = await UNITY.loadWL(WLaddresses);
            //     console.log('Successfully loaded the WL')
            //     console.log(res)
            //     console.log('/////////////////////////')
            // }catch(err){console.log(err)}

        try{
            totalToken=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            for(i=0;i<WLaddresses.length;i++){
                console.log(WLaddresses[i].address)
                tokenList=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                for(j=1;j<=16;j++){
                    let addressBal = await Duality.balanceOf(WLaddresses[i].address, j)
                    let addressTokens = addressBal.toNumber()
                    tokenList[j-1] = addressTokens
                    totalToken[j-1] += addressTokens
                }
                console.log(tokenList)
            }
            console.log("Total:")
            console.log(totalToken)
        }catch(err){ console.log(err)}

        // try{
        //     for(j=1;j<=16;j++){
        //         balance = 0
        //         for(i=0;i<WLaddresses.length;i++){
        //             let addressBal = await Duality.balanceOf(WLaddresses[i].address, j)
        //             let addressTokens = addressBal.toNumber()
        //             balance += addressTokens
        //         }
        //         console.log("Token" + j + ": " + balance)
        //     }
        // }catch(err){ console.log(err)}
    
        //     Set royalties info
            // console.log('Setting royalties info')
            // try{
            //     let res = await UNITY.setRoyalties(royalties_recipient_address, royaltiesAmount);
            //     console.log('Successfully set Royalties info')
            //     console.log(res)
            //     console.log('/////////////////////////')
            // }catch(err){console.log(err)}
    // }
        console.log('program done executing - please terminate')

}