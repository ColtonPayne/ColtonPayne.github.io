import React from 'react';
import "./adminPage.css"

import { NFTStorage } from 'nft.storage';

import { ethers } from 'ethers';
import TokenArtifact1155 from "..//contracts/Propel1155Token.json";

import { NftRender } from './viewNFT';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFhMzg0YmI2N0NBYUVhOGFhNGI1MTIxYWQzMTc3NTcyMkI5N2ZlODYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NzE2NTk5MDk0OCwibmFtZSI6InByb3BlbF92ZW50dXJlcyJ9.kNhl_ky1xK2WPbVjKiyUxppGeW88wNrS3af7OjsFotI';

const zero_addr = "0x0000000000000000000000000000000000000000";

function Admin(nfts, core, ext) {
    console.log(nfts);
    return (
        <div className='adminSpace'>
            <div className='mintToken'>
                <h1>Mint Tokens Here</h1>
                <p>Choose the Token Type to Mint:</p>
                <form>
                    <input type="radio" id="Donator" name="tokenType" value="Donator"></input>
                    <label for="Donator">Donator</label><br></br>
                    <input type="radio" id="Recipient" name="tokenType" value="Recipient"></input>
                    <label for="Recipient">Recipient</label><br></br>
                    <input type="radio" id="Both" name="tokenType" value="Both"></input>
                    <label for="Both">Both</label><br></br>
                </form>
                <p>Number of Tokens to Mint</p> 
                <form> 
                    <input type="text" id="amountOfTokens" name="amountOfTokens"></input><br></br>
                </form>
                <p>Address to Mint For (Leave Blank to Mint For Yourself)</p>
                <form>
                    <input type="text" id="addressToMintFor" name="addressToMintFor"></input><br></br>
                </form>
                <Buttons coreAddr={core} extAddr={ext} showMintButton={true} showTransferButton={false}/>
            </div>
            <div className='transferToken'>
                <h1>Transfer A Token</h1>
                <form>
                    <label>Token ID to Transfer </label>
                    <input type="text" id="tokenIdToTransfer" name="tokenIdToTransfer"></input><br></br>
                    <label>Amount to Transfer </label>
                    <input type="text" id="amountToTransfer" name="amountToTransfer"></input><br></br>
                    <label>Address to Transfer To </label>
                    <input type="text" id="addressToTransfer" name="addressToTransfer"></input><br></br>
                </form>
                <Buttons showMintButton={false} showTransferButton={true}/>
            </div>
            <h2 className="center">NFTs Currently In Your Wallet</h2>
            <div id="grid">
                {nfts.map((nft) => {
                    return (
                        <NftRender tokenID={nft.tokenId} ownerAddr={nft.ownerAddress} coreAddr={core} extAddr={ext}/>
                    )})
                }
            </div>

        </div>
    );
}

export class Buttons extends React.Component {
    constructor(props) {
        super(props);
        var coreAddr = props.coreAddr;
        var extAddr = props.extAddr;
        this.state = {coreAddr: coreAddr, extAddr: extAddr, showMintButton: props.showMintButton, showTransferButton: props.showTransferButton}
    }

    componentDidMount() {

    }

    render() {
        var mintButton = this.state.showMintButton;
        var transferButton = this.state.showTransferButton

        return (
            <div>
                {mintButton ? <button onClick={() => this.mintNFT(document.getElementsByName("tokenType"),parseInt(document.getElementById("amountOfTokens").value),document.getElementById("addressToMintFor").value)}>Mint NFT</button> : <></>}
                {transferButton ? <button onClick={() => console.log("Transferred")}>Transfer NFT</button> : <></>}
            </div>
        )
    }
    async mintNFT(tokenTypes, amountToMint, address) {
        var tokenType;
        for (let i = 0; i < tokenTypes.length; i++) {
            if (tokenTypes[i].checked) {
                tokenType = tokenTypes[i].value;
            }
        }

        this._provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log(this._provider.getSigner(0))

        this._token = new ethers.Contract(
            this.state.extAddr,
            TokenArtifact1155.abi,
            this._provider.getSigner(0)
        );
        
        

        // COLTON - REMOVING MULTIPLE ADDRESS UNTIL IMPLEMENTED 
        /*
        if (address != ""){
            var splitStr = address.split(',');

            if (splitStr > 1) {

            }
            // Mint token for single wallet ("Not self")
            else {
                
                this.sendMintTransaction(amountToMint, tokenType, address)
            }
        }
        else {
            // Mint token for self
            this.sendMintTransaction(amountToMint, tokenType, zero_addr)
        }
        */
       if(address != ""){
        console.log("Minting for address: ", address)
        this.sendMintTransaction(amountToMint, tokenType, address)

       }else{
        console.log("Minting for self")
        this.sendMintTransaction(amountToMint, tokenType, zero_addr)

       }
  
    }

    async transferNFT() {

    }

    async sendMintTransaction(amountToMint, tokenType, address){
        const amounts = [amountToMint];
        var uriToStore1;
        var uriToStore2;
        if (tokenType == "Donator") {
            uriToStore1 = this.storeDonatorToken();
        }
        else if (tokenType == "Recipient") {
            uriToStore1 = this.storeRecipientToken();
        }
        else {
            uriToStore1 = this.storeDonatorToken();
            uriToStore2 = this.storeRecipientToken();
        }

        var URIs;
        if (uriToStore2 != null) {
            URIs = [uriToStore1, uriToStore2];
            try {
                const mintTX = await this._token.mintSingleAddressMultipleTokens(address, [amountToMint/2, amountToMint/2], URIs);
                const mintReceipt = await mintTX.wait();
                if (mintReceipt.status == 0) {
                    throw new Error("Transaction failed");
                }
                else {
                    alert("Token Successfully Minted!")
                }
            } catch(error) {
                if (error.code === 4001) {
                    return;
                }
                console.error(error);
            }
        } else {
            URIs = [uriToStore1];
            try {
                console.log("Calling Single Address Single Token")
                const mintTX = await this._token.mintSingleAddressSingleToken(address, tokenType, amounts, uriToStore1);
                const mintReceipt = await mintTX.wait();
                if (mintReceipt.status == 0) {
                    throw new Error("Transaction failed");
                }
                else {
                    alert("Token Successfully Minted!")
                }
            } catch(error) {
                if (error.code === 4001) {
                    return;
                }
                console.error(error);
            }
        }
    }


    async  getExampleImage(link) {
      const imageOriginUrl = link
      const r = await fetch(imageOriginUrl)
      if (!r.ok) {
        throw new Error(`error fetching image: [${r.statusCode}]: ${r.status}`)
      }
      return r.blob()
    }
  
    async  getTokenJson(uri){
      var prefix = 'https';
      var uri = uri.substring(4, uri.length - 14);

      var suffix = '.ipfs.nftstorage.link/metadata.json';
  
      var url = prefix + uri + suffix;

  
      return fetch(url)
        .then(response => response.json())
        .then(data => {
          return data;
        })
    }

    async storeRecipientToken() {
        const image = await this.getExampleImage('https://cors-anywhere.herokuapp.com/https://www.cloudways.com/blog/wp-content/uploads/55-best-1.jpg')
        const nft = {
          "name":"Recipient Token",
          "created_by":"Colton Payne",
          "description":"This is a recipient token. This is the description for test contract 14.",
           "attributes":[
          {"trait_type":"Artist","value":"Colton Payne"},
          {"trait_type":"token_type","value":"Recipient"},
          {"display_type":"number","trait_type":"donation_dollars_recieved","value":0,"max_value":"50000"}],
          "image":image}
    
    
    
        const client = new NFTStorage({ token: API_KEY })
        const metadata = await client.store(nft)
    
        return metadata.url
      }
    
       async storeDonatorToken() {
        const image = await this.getExampleImage('https://cors-anywhere.herokuapp.com/https://conexum.com.au/wayward/uploads/2016/09/Screen-Shot-2016-09-27-at-3.08.50-pm-800x725.png')
        const nft = {
          "name":"Donator Token",
          "created_by":"Justin Horan",
          "description":"This is a donator token. This is the description for test contract 14.",
           "attributes":[
          {"trait_type":"Artist","value":"Justin Horan"},
          {"trait_type":"token_type","value":"Donator"},
          {"display_type":"number","trait_type":"donation_dollars_remaining","value":10000,"max_value":"10000"}],
          "image":image}
    
    
    
        const client = new NFTStorage({ token: API_KEY })
        const metadata = await client.store(nft)

        return metadata.url
      }
}



export default Admin;