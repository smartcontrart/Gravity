import React, {useRef} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Connect from './Components/Connect';
import Home from './Components/Home';
// import Exchange from './Components/Exchange';
import ConnexionStatus from './Components/ConnexionStatus';
import AccountInfoProvider from './Context/AccountInfo';
import ContractInfoProvider from './Context/ContractInfo';
import DropConfigProvider from './Context/DropConfig.js';
import background_video from  './images/CBR1_1920.mp4'
import './App.css'


function App() {
  const vidRef1 = useRef(null);
  return (
    <div className="App">
      <DropConfigProvider>
        <AccountInfoProvider>
          <ContractInfoProvider>

              <video ref={vidRef1}
                autoPlay 
                loop
                muted
                id="background_video">
                  <source 
                  src={background_video} 
                  type="video/mp4"
                  />
              </video>
            <Container fluid id="container">
                  <Row className="align-items-center">
                    <Home/> 
                  </Row>
                  <Row className='AppRow'>
                    <Connect/>
                  </Row>
                  <Row id="connextion_status" className='AppRow'>
                    <ConnexionStatus/>
                  </Row>
              </Container>
          </ContractInfoProvider>
        </AccountInfoProvider>
      </DropConfigProvider>
    </div>
  );
}

export default App;