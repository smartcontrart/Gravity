import React from 'react';
import { Row } from 'react-bootstrap';
import Connect from './Components/Connect';
import Home from './Components/Home';
// import Exchange from './Components/Exchange';
import ConnexionStatus from './Components/ConnexionStatus';
import AccountInfoProvider from './Context/AccountInfo';
import ContractInfoProvider from './Context/ContractInfo';
import DropConfigProvider from './Context/DropConfig.js';
import './App.css'

function App() {
  return (
    <div className="App">
      <DropConfigProvider>
        <AccountInfoProvider>
          <ContractInfoProvider>
            <Row id='App_row'>
              <Home/> 
              {/* <Exchange/> */}
              <Connect/>
              <br/>
              <ConnexionStatus/>
            </Row>
          </ContractInfoProvider>
        </AccountInfoProvider>
      </DropConfigProvider>
    </div>
  );
}

export default App;