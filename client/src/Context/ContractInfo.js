import React, { Component, createContext } from 'react';

export const ContractInfoContext = createContext();

class ContractInfoProvider extends Component {
    state = {
        prodAddress: process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS,
        devAddress: process.env.REACT_APP_MAINNET_CONTRACT_ADDRESS,
        owner: "0x2686544Ed0149b134B27009958788cDf4Ca8c064"
        
    }

    updateContractInfo(contractInfo){
        this.setState({
            prodAddress: contractInfo.prodAddress,
            devAddress: contractInfo.devAddress,
            owner: contractInfo.contractInfo
        })
    }

    render(){
        return(
            <ContractInfoContext.Provider 
            value={{
                ...this.state, 
                updateContractInfo: this.state.updateContractInfo,
                }}>
                {this.props.children}
            </ContractInfoContext.Provider>
        )
    }

}
export default ContractInfoProvider;