import React, {useState, useContext} from "react";
import {Row, Col, Button, Spinner, Alert, Container} from 'react-bootstrap'
import { AccountInfoContext } from "../Context/AccountInfo";
import { ContractInfoContext } from "../Context/ContractInfo";
import Gravitylogo from "../images/Gravity_logo.svg";
import '../App.css'

function Home() {
    let accountInfo = useContext(AccountInfoContext)
    let contractInfo = useContext(ContractInfoContext)
    const [alert, setAlert] = useState({active: false, content: null, variant: null})

    function renderUserInterface(){
        console.log(accountInfo.supply)
        if(accountInfo.supply >= 100){
            return <div id="not_allowed">GRAVITY is sold out! Thank you for minting!</div>
        }else{
            if(!accountInfo.account || accountInfo.networkId !== accountInfo.contractNetwork ){
                return null
            }else if(accountInfo.tokenClaimed){
                return <div id="not_allowed">Thank you for minting GRAVITY</div>
            }else if(accountInfo.ALSaleActivated && !accountInfo.signedMessage && !accountInfo.publicSaleActivated){
                    return <div id="not_allowed">Sorry, you have not secured an allowlist spot, Please come back tomorrow for a public mint.</div>
            }else if(!accountInfo.publicSaleActivated &&  !accountInfo.ALSaleActivated){
                return( 
                    <div id="not_allowed">Drop closed</div>
                )
            }else{
                return(
                    <React.Fragment>
                        <Col><Button id='mint_button' onClick={() => handleMint()}>MINT</Button></Col>
                    </React.Fragment>
                )
            }
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
                await accountInfo.ashInstance.methods.approve(accountInfo.gravityAddress, (price).toString()).send({from: accountInfo.account})
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
            if(!accountInfo.publicSaleActivated){
                try{
                    await accountInfo.gravityInstance.methods.ALMint(
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
            }else{
                try{
                    await accountInfo.gravityInstance.methods.publicMint(
                    ).send({from: accountInfo.account});
                }
                catch(error){
                    console.log(error)
                    mintFailed = true
                    setAlert({active: true, content: error.message, variant: "danger"})
                }
            }
        }
        accountInfo.updateAccountInfo({contractAllowance: parseInt(await accountInfo.ashInstance.methods.allowance(accountInfo.account, accountInfo.ashAddress).call())})
        accountInfo.updateAccountInfo({tokenClaimed: await accountInfo.gravityInstance.methods._tokenClaimed(1, accountInfo.account).call()})
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

    function renderRewardText(){
        if(accountInfo.publicSaleActivated){
            return(
                <div id="drop_reward">
                By participating in this drop you will get 1 allow list for HOXID’s upcoming Large edition project.
                </div>
            )
        }else{
            return(
                <div id="drop_reward">
                    By participating in WL minting you will get 1 free mint + 1 allow list for HOXID’s upcoming Large edition project.
                </div>
            )
        }
    }

    return ( 
        <Container fluid>
            <Row className="Home_row" id="first_row">
            <img 
                id= "logo"
                alt='logo'
                src={Gravitylogo}/>
            </Row>
            <Row className="Home_row">
                <div id="drop_subtitle">
                ‘Once we understand that it is the same gravity that holds us to the ground, we will more easily be able to express emotions and be open to change’
                </div>
            </Row>
            <Row className="Home_row">
                <div id="drop_credit">
                ASH EXCLUSIVE DROP BY HOXID
                </div>
            </Row>
            <Row className="Home_row">
                {renderRewardText()}
            </Row>
            <Row className="Home_row">
                {renderUserInterface()}
            </Row>
            <Row className="Home_row" >
                <div id="drop_description">
                    55 ASH
                </div>
            </Row>
            <Row className="Home_row">
                {renderAlert()}
            </Row>
            <Row className="Home_row">
                {renderUserFeedback()}
            </Row>
        </Container>
     );
}

export default Home;


