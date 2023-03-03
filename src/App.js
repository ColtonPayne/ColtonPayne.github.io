import { useState } from 'react';
import React from 'react';
import './App.css';
import Navbar from './components/index'
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';

import Home from './pages/index';
import WalletStatus from './pages/walletStatus';
import Donation from './pages/sendDon';
import ViewNFT from './pages/viewNFT';
import Admin from './pages/adminPage';

import { ethers } from "ethers";

import TokenArtifact from "./contracts/Token.json";

const _coreAddress = "0x43540dE1763be5Fb5A6743292631d4f6046751a9";
const _extensionAddress = '0x14089D33d08D738A7546495f918592fEd49b9098';

const admins = ["0x2AC7F5A620D77e58F6352C7D0696FA74c1a9d077", "0xBf7d2BD0ae1EDbab03718697591D5ec942911516"];


function App() {
    const [nfts, setNfts] = useState([]);
    const [authenticated, setAuthenticated] = useState(false);
    const [connectedAddress, setAddress] = useState("");

    window.addEventListener('m-authenticated', async (event) => {
      // Get the data client instance
      const client = event.detail.client;
      setAddress(window.manifold.address);
      // Get the NFTs owned by the currently connected wallet
      // Data client API's can be found here: https://docs.manifold.xyz/v/manifold-for-developers/client-widgets/connect-widget/data-client-apis
      setNfts(await client.getNFTsOfOwner({
        filters: [
            {
                //contractAddress: '0x248b174edec799411eb2f0f65528cef52fce9b5e'
                contractAddress: _coreAddress,
            }
        ]
      }));
      setAuthenticated(true);
    })
    window.addEventListener('m-unauthenticated', async (event) => {
      setAddress("");
      setNfts([]);
      setAuthenticated(false);
    })

    return (
        <Router>
            <div className="ManifoldConnect">
                <div className="App">
                    <div
                        data-widget="m-connect"
                        data-app-name={"NFTCrowdfunding"}
                        data-client-id={"5c23cda7c20dc5fe378a4ed4431f66733338937976a411152e1acf4cc00e8c5f"}
                        data-network={5}
                        style={{
                            marginTop: "-0px",
                            marginBottom: "-0px",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center"
                        }}
                    >
                    </div>
                {authenticated}
    
                
                </div>
            </div>
            <Navbar admin={checkAdmin(connectedAddress)}/>
            <Routes>
            <Route exact path='/' element={<Home />} />
            <Route path='/walletStatus' element={WalletStatus(authenticated)} />
            <Route path='/sendDon' element={Donation(connectedAddress, _coreAddress, _extensionAddress)} />
            <Route path='/viewNFT' element={ViewNFT(_coreAddress ,_extensionAddress, connectedAddress)}/>

            <Route path ='/adminPage' element={Admin(nfts, _coreAddress, _extensionAddress)}/>
            
            </Routes>
            
        </Router>
    );
}


function checkAdmin(addr) {
  var flag = false;
  for (let i = 0; i < admins.length; i++) {
    if (admins[i].toLowerCase() == addr.toLowerCase()) {
      flag = true;
      break;
    }
  }

  return flag;
}

export default App;