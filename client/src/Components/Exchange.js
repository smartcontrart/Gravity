import React, {useState, useContext, useRef, useEffect} from "react";
import {Row, Col, Figure, Button, Spinner, Alert} from 'react-bootstrap'
import { AccountInfoContext } from "../Context/AccountInfo";
import noaudio from "../images/no audio.png"
import zeroaudio from "../images/zero audio.png";
import oneaudio from "../images/one audio.png";
import zeroaudio_video from "../images/zero audio.mp4";
import oneaudio_video from "../images/one audio.mp4";
import unknownaudio from "../images/unknown audio.png";
import novideo from "../images/no video.png";
import zerovideo from "../images/zero video.png";
import onevideo from "../images/one video.png";
import zerovideo_video from "../images/zero video.mp4";
import onevideo_video from "../images/one video.mp4";
import unknownvideo from "../images/unknown video.png";
import play from "../images/play.png";
import pause from "../images/pause.png";

import '../App.css'

function Home() {
    let accountInfo = useContext(AccountInfoContext)
    const [tokenIds, setTokenIds] = useState([])
    const [tokenQuantities, setTokenQuantities] = useState([])
    const [videoSelection, setVideoSelection] = useState([])
    const [audioSelection, setAudioSelection] = useState([])
    const [alert, setAlert] = useState({active: false, content: null, variant: null})
    const [videoPlaying, setVideoPlaying] = useState(null)
    const [audioPlaying, setAudioPlaying] = useState(null)
    const vidRef1 = useRef(null);
    const vidRef2 = useRef(null);
    const vidRef5 = useRef(null);
    const vidRef6 = useRef(null);
    const visualOptions=
    [
        {title: 'Zero Video', id:1, image: zerovideo, video: zerovideo_video, ref: vidRef1}, 
        {title: 'One Video', id:2, image: onevideo, video: onevideo_video, ref: vidRef2}, 
        {title: 'Unknown Video',id:3, image: unknownvideo}, 
        {title: 'No Video',id:4, image: novideo}
    ]
    const audioOptions=
    [
        {title: 'Zero Audio', id:5, image: zeroaudio, video: zeroaudio_video, ref: vidRef5}, 
        {title: 'One Audio', id:6, image: oneaudio, video: oneaudio_video, ref: vidRef6}, 
        {title: 'Unknown Audio',id:7, image: unknownaudio}, 
        {title: 'No Audio',id:8, image: noaudio}
    ]
    const [borderStyles, setBorderStyles] = useState(new Array(visualOptions.length + audioOptions.length))

    function highlightItem(optionId, action){
        let updatedBorder = [...borderStyles]
        let hightlightColor;
        if(action === 'highlight'){
            hightlightColor = 'white'
        }else{
            hightlightColor = null
        }
        updatedBorder[optionId - 1] = hightlightColor == null ? null : {border: `solid 5px ${hightlightColor}`}
        setBorderStyles(updatedBorder);
    }

    function selectToken(optionId){
        if(accountInfo.signedMessage){ //Checks if on the AL
            let shallowCopyVideoSelection = [...videoSelection]
            let shallowCopyAudioSelection = [...audioSelection]
            if(shallowCopyAudioSelection.length <= shallowCopyVideoSelection.length ){
                if(optionId < 5){
                    if(shallowCopyVideoSelection.length <= shallowCopyAudioSelection.length 
                        && shallowCopyVideoSelection.length < (accountInfo.ALquantity - accountInfo.tokensClaimed)
                    ){
                        shallowCopyVideoSelection.push(optionId)
                        setVideoSelection(shallowCopyVideoSelection)
                    }
                }else{
                    if(shallowCopyVideoSelection.length > shallowCopyAudioSelection.length){
                        shallowCopyAudioSelection.push(optionId)
                        setAudioSelection(shallowCopyAudioSelection)
                        selectTokens(videoSelection[videoSelection.length-1], optionId)
                    }
                }
            }
        }
    }

    // 1	Zero Video(1) + (8) - 9
    // 7	Zero Video(1), Zero Audio (5) - 6
    // 8	Zero Video(1), One Audio (6) - 7
    // 9	Zero Video(1), ∞ Audio (7) - 8

    // 10	One Video(2), Zero Audio (5) - 7
    // 11	One Video(2), One Audio (6) - 8
    // 12	One Video(2), ∞ Audio (7) - 9
    // 3	One Video(2) + (8) - 10

    // 13	∞ Video(3), Zero Audio (5) - 8
    // 14	∞ Video(3), One Audio (6) - 9
    // 15	∞ Video(3), ∞ Audio (7) - 10
    // 5	∞ Video(3) + (8) - 11 

    // 2	Zero Audio(5) + (4) - 9
    // 4	One Audio(6) +(4) - 10
    // 6	∞ Audio(7) + (4) - 11
    // 16   No Video (4), No Audio (8)

    function selectTokens(videoId, audioId){
        let sum = videoId + audioId
        let tokenId;
        switch(videoId){
            case 1:
                tokenId = sum === 6 ? 7 : sum === 7 ? 8 : sum === 8 ? 9 : 1
                break;
            case 2:
                tokenId = sum === 7 ? 10 : sum === 8 ? 11 : sum === 9 ? 12 : 3
                break;
            case 3:
                tokenId = sum === 8 ? 13 : sum === 9 ? 14 : sum === 10 ? 15 : 5
                break;
            case 4:
                tokenId = sum === 9 ? 2 : sum === 10 ? 4 : sum === 11 ? 6 : 16
                break;
            default:
                tokenId = null
                break;
        }
        setTokenIds(tokenIds=>[...tokenIds, tokenId])
        setTokenQuantities(tokenQuantities=>[...tokenQuantities, 1])
    }

    const renderOptions = (options) => {
        return(
            options.map((option, key)=>{
                if(videoPlaying === option.id || audioPlaying === option.id){
                    return(
                        <Col xs={6} md={3} key={key}>
                            <Col>
                                <video ref={option.ref}
                                autoPlay 
                                width={150}
                                height={150}>
                                    <source 
                                    src={option.video} 
                                    type="video/mp4"
                                    />
                                </video>
                                {renderPreviewOption(option, key)}
                            </Col>
                        </Col>
                    )
                }else{
                    return(
                        <Col xs={6} md={3} key={key}>
                                <Figure>
                                    <Figure.Image
                                    onClick={()=>selectToken(option.id)}
                                    style = {borderStyles[option.id - 1]}
                                    onMouseOver={()=>highlightItem(option.id, 'highlight')}
                                    onMouseLeave={()=>highlightItem(option.id, 'reset')}
                                    className="figure_image"
                                    width={150}
                                    height={150}
                                    alt="150x150"
                                    src={option.image}/>
                                    <Figure.Caption>
                                        {renderPreviewOption(option, key)}
                                    </Figure.Caption>
                                </Figure>
                        </Col>
                    )
                }
            })
        )
    }

    const handlePlayVideo = (option) => {
        if(videoPlaying === option.id){
            setVideoPlaying(null)
        }else if(audioPlaying === option.id){
            setAudioPlaying(null)
        }else{
            if(option.id < 5){
                setVideoPlaying(option.id)
            }else{
                setAudioPlaying(option.id)
            }
        }
    }

    function renderPreviewOption(option, key){
        if( key === 0 ||
            key === 1 ){
                return(
                    <img 
                    alt='play'
                    src={audioPlaying === option.id || videoPlaying === option.id ? pause : play}
                    width={20}
                    height={20}
                    onClick={()=>handlePlayVideo(option, key)}/>
                )
            }
    }

    function resetSelection(){
        console.log(tokenIds)
        setVideoSelection([])
        setAudioSelection([])
        setTokenIds([])
    }

    function renderTokensLeftToMint(){
        if(accountInfo.account && accountInfo.networkId === accountInfo.contractNetwork){
            return(
                <React.Fragment>
                    <div>Mints remaining: {accountInfo.ALquantity - accountInfo.tokensClaimed}</div>
                    <br/><br/>
                </React.Fragment>
            )
        }
    }

    function renderUserInterface(){
        if(!accountInfo.account || accountInfo.networkId !== accountInfo.contractNetwork ){
            return null
        }else if(!accountInfo.signedMessage){
                return <div>Uh oh... You are not on the Allow List</div>
        }else {
            if(videoSelection.length > 0){
                return(
                    <React.Fragment>
                        <Col><Button id="connect_button" onClick={resetSelection}>Reset selection</Button></Col>
                        {tokenIds.length >= 1 ? 
                        <Col><Button id='mint_button' onClick={() => handleMint()}>Mint {tokenIds.length} token </Button></Col> : null}
                    </React.Fragment>
                )
            }
        }
    }

        async function handleMint(){
        let allowance = accountInfo.contractAllowance
        let price = accountInfo.mintPrice
        let quantity = Math.min(videoSelection.length, audioSelection.length)
        let ashApprovalFailed = false
        let mintFailed = false

        if(quantity <= accountInfo.ALquantity && accountInfo.tokensClaimed < accountInfo.ALquantity){
            accountInfo.updateAccountInfo({userFeedback: "Approving ASH"})
            if(allowance < price * quantity){
                try{
                    await accountInfo.ashInstance.methods.approve(accountInfo.dualityAddress, (price * quantity).toString()).send({from: accountInfo.account})
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
                        accountInfo.account, 
                        tokenIds, 
                        tokenQuantities, 
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
            console.log(accountInfo)
            accountInfo.updateAccountInfo({contractAllowance: parseInt(await accountInfo.ashInstance.methods.allowance(accountInfo.account, accountInfo.ashAddress).call())})
            accountInfo.updateAccountInfo({tokensClaimed: parseInt(await accountInfo.dualityInstance.methods._tokensClaimed(accountInfo.account).call())})
            if(!mintFailed) {resetSelection()};
            accountInfo.updateAccountInfo({userFeedback: null})
        }else{
            setAlert({active: true, content: "Cannot mint more tokens than allowed", variant: "warning"})
        }

    }

    function renderSelectedTokens(){
        return(
            videoSelection.map((video, index)=>{
                return(
                    <Col xs={6} md={3}>
                        <Figure>
                            <Figure.Image
                                width={100}
                                height={100}
                                alt="75x75"
                                src={visualOptions[videoSelection[index]-1].image}
                            />
                            <Figure.Caption>
                                {visualOptions[videoSelection[index]-1].title}
                                <br/>
                                {audioOptions[audioSelection[index]-5] ? audioOptions[audioSelection[index]-5].title : null}
                            </Figure.Caption>
                        </Figure>
                    </Col>
                )
            })
        )
    }

    function renderSelection(){
        return(
            <React.Fragment>
                {videoSelection.length>0 ? <h3><b>YOUR CHOICES</b></h3> : null}
                {renderSelectedTokens()}
            </React.Fragment>
        )
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
                <h1><b>DUALITY</b></h1>
                <h3><b>Exchange</b></h3>
            </Row>
            <Row id="description_row">
                <span>In Duality, there is no disappointment.</span>
                <span>You can exchange your token if you don't like it.</span>
                <span>The first exchange is free. The second one  is 5 Ash</span>
            </Row>
            <Row>
                {renderOwnerTokens()}
            </Row>
            <Row id="visual_row">
                <h3><b>CHOOSE VISUAL</b></h3>
                {renderOptions(visualOptions)}
            </Row>
            <Row id="audio_row">
                <h3><b>CHOOSE AUDIO</b></h3>
                {renderOptions(audioOptions)}
            </Row>
            <Row>
                {renderSelection()}
            </Row>
            {/* <Row>
                {renderTokensLeftToMint()}
            </Row> */}
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


