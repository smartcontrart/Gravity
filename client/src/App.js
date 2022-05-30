import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Connect from './Components/Connect';
import Home from './Components/Home';
// import Exchange from './Components/Exchange';
import ConnexionStatus from './Components/ConnexionStatus';
import AccountInfoProvider from './Context/AccountInfo';
import ContractInfoProvider from './Context/ContractInfo';
import DropConfigProvider from './Context/DropConfig.js';
import './App.css'
import background from "./images/background.png";

function App() {
  return (
    <div className="App">
      <DropConfigProvider>
        <AccountInfoProvider>
          <ContractInfoProvider>
              <div className="App background" style={{
                backgroundImage: `url(${background})`,
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat'}}>
                <Container fluid>
                  <Row>
                    <Home/> 
                  </Row>
                  <Row className='AppRow'>
                    <Connect/>
                  </Row>
                  <Row className='AppRow'>
                    <ConnexionStatus/>
                  </Row>
              </Container>
            </div>
          </ContractInfoProvider>
        </AccountInfoProvider>
      </DropConfigProvider>
    </div>
  );
}

export default App;