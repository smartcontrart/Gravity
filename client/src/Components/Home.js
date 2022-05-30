import React, {useState, useContext, useRef, useEffect} from "react";
import {Row, Col, Figure, Button, Spinner, Alert} from 'react-bootstrap'
import { AccountInfoContext } from "../Context/AccountInfo";


import '../App.css'

function Home() {
    let accountInfo = useContext(AccountInfoContext)
    const [alert, setAlert] = useState({active: false, content: null, variant: null})

    function renderUserInterface(){
        if(!accountInfo.account || accountInfo.networkId !== accountInfo.contractNetwork ){
            return null
        }else if(!accountInfo.signedMessage){
                return <div>Uh oh... You are not on the Allow List</div>
        }else {
            return(
                <React.Fragment>
                    <Col><Button id='mint_button' onClick={() => handleMint()}>Mint </Button></Col>
                </React.Fragment>
            )
        }
    }

    async function handleMint(){
        let allowance = accountInfo.contractAllowance
        let price = accountInfo.mintPrice
        let ashApprovalFailed = false
        let mintFailed = false

        if(allowance < price){
            accountInfo.updateAccountInfo({userFeedback: "Approving ASH"})
            try{
                await accountInfo.ashInstance.methods.approve(accountInfo.dualityAddress, (price).toString()).send({from: accountInfo.account})
                accountInfo.updateAccountInfo({contractAllowance: parseInt(await accountInfo.ashInstance.methods.allowance(accountInfo.account, accountInfo.ashAddress).call())})
            }
            catch (error){
                ashApprovalFailed = true
                accountInfo.updateAccountInfo({userFeedback: null})
                setAlert({active: true, content: error.message, variant: "warning"})
            }
        }
        if(!ashApprovalFailed){
            accountInfo.updateAccountInfo({userFeedback: "Minting..."})
            try{
                await accountInfo.dualityInstance.methods.publicMint(
                    accountInfo.tokenId, 
                    accountInfo.ALquantity,
                    accountInfo.signedMessage.v,
                    accountInfo.signedMessage.r,
                    accountInfo.signedMessage.s
                ).send({from: accountInfo.account});
            }
            catch(error){
                console.log(error)
                mintFailed = true
                setAlert({active: true, content: error.message, variant: "danger"})
            }
        }
        accountInfo.updateAccountInfo({contractAllowance: parseInt(await accountInfo.ashInstance.methods.allowance(accountInfo.account, accountInfo.ashAddress).call())})
        accountInfo.updateAccountInfo({tokensClaimed: parseInt(await accountInfo.dualityInstance.methods._tokensClaimed(accountInfo.account).call())})
        accountInfo.updateAccountInfo({userFeedback: null})
    }

    function renderAlert(){
        if(alert.active){
            return(
            <Col>
                <br/><br/>
                <Alert variant={alert.variant}>{alert.content}</Alert>
            </Col>
            )
        }

    }

    function renderUserFeedback(){
        if(accountInfo.userFeedback){
            return(
                <React.Fragment>
                    <div>
                        <Spinner animation="grow" variant="light"/>
                    </div>
                    <div>{accountInfo.userFeedback}</div>
                </React.Fragment>
            )
        }
    }

    return ( 
        <React.Fragment>
            <Row>
                <h1><b>GRAVITY</b></h1>
            </Row>
            <Row>
                {renderUserInterface()}
            </Row>
            <Row>
                {renderAlert()}
            </Row>
            <Row>
                {renderUserFeedback()}
            </Row>
        </React.Fragment>
     );
}

export default Home;


