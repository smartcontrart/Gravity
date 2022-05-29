import React, { Component, createContext } from 'react';

export const AccountInfoContext = createContext();

class AccountInfoProvider extends Component {
    state = {
        ashAddress: process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS,
        dualityAddress: process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS,
        ashInstance: null,
        dualityInstance: null,
        account: null,
        networkId: null,
        transactionInProgress: false,
        userFeedback: null,
        contractNetwork: 1,
        walletAshBalance: 0,
        mintPrice: 0,
        contractAllowance: 0,
        signedMessage: null,
        ALquantity: 0,
        tokensClaimed: 0
    }

    updateAccountInfo = (updatedData) =>{
        for (const [key, value] of Object.entries(updatedData)) {
            this.setState(prevState=>({
                ...prevState,
                [key]: value
            }))
        }
    }

    render(){
        return(
            <AccountInfoContext.Provider 
                value={{
                    ...this.state, 
                    updateAccountInfo: this.updateAccountInfo,
                    }}>
                {this.props.children}
            </AccountInfoContext.Provider>
        )
    }

}
export default AccountInfoProvider;