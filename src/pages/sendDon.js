import React from 'react';
import './sendDon.css';

import { NFTStorage } from 'nft.storage';
import { useEffect, useState } from 'react';
import { ethers } from "ethers";

import TokenArtifact from ".//contracts/Token.json";
import TokenArtifact1155 from ".//contracts/Propel1155Token.json";
import { checkProperties } from 'ethers/lib/utils';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFhMzg0YmI2N0NBYUVhOGFhNGI1MTIxYWQzMTc3NTcyMkI5N2ZlODYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NzE2NTk5MDk0OCwibmFtZSI6InByb3BlbF92ZW50dXJlcyJ9.kNhl_ky1xK2WPbVjKiyUxppGeW88wNrS3af7OjsFotI';

const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

function Donation(userAddr, core, ext) {
    return (
        <div>
            <div className='headerDiv'>
                <h1>Send a Donation to Another NFT!</h1>
                <form>
                    <label>Token ID to Donate From: </label>
                    <input type="text" id="tokenIdFrom" name="tokenIdFrom"></input><br></br>
                    <label>Token ID to Donate To: </label>
                    <input type="text" id="tokenIdTo" name="tokenIdTo"></input><br></br>
                    <label>Amount to Send To: </label>
                    <input type="text" id="amount" name="amount"></input><br></br>
                </form>
                <MyClass2 currentAddr={userAddr} coreAddr={core} extAddr={ext} displayButton={true}/>
            </div>
        </div>
    );
};

export class MyClass2 extends React.Component {
    constructor(props) {
      super(props);
      var currentAddr = props.currentAddr;
      var coreAddr = props.coreAddr;
      var extAddr = props.extAddr;
      var displayButton = props.displayButton;
      this.state = {currentAddr: currentAddr, coreAddr: coreAddr, extAddr: extAddr, displayButton: displayButton}
    }
  
    componentDidMount(){
      
    }
  
    render(){
      var showButton = this.state.displayButton;
      return(
        <div>
          {showButton
          ? <button onClick={() => this._initializeEthers(true)}>Send Donation</button>
          : <></>}
          
        </div>
        
      )
    }
  
    async _initializeEthers(donate){
      this._provider = new ethers.providers.Web3Provider(window.ethereum);
      
      this._token = new ethers.Contract(
        this.state.extAddr,
        TokenArtifact1155.abi,
        this._provider.getSigner(0)
      );
        
      //alert("Address: " + this._token.address);
      if(donate){

        var tokenIdFrom = parseInt(document.getElementById("tokenIdFrom").value);
        var tokenIdTo = parseInt(document.getElementById("tokenIdTo").value);
        var amount = parseInt(document.getElementById("amount").value);

        this.sendDonation(this._token, tokenIdFrom, tokenIdTo, amount);
      }
    }
  
    async sendDonation(token, donatorID, recieverID, transferBalance){
      try{
        var recipiantURI = await token.tokenURIRetrieve(this.state.coreAddr, recieverID);
        var  donatorURI = await token.tokenURIRetrieve(this.state.coreAddr, donatorID);
    
        console.log(recipiantURI);
        console.log(donatorURI);

        var recipientJSON = await this.getTokenJson(recipiantURI);
        var donatorJSON = await this.getTokenJson(donatorURI);

        console.log(recipientJSON);
        console.log(donatorJSON);
    
        var donatorType = donatorJSON.attributes[1].value;
        var donationsRemaining = donatorJSON.attributes[2].value;
    
        var recipientType = recipientJSON.attributes[1].value;

        var recipientBalance = recipientJSON.attributes[2].value;
        var recipientMaxBalance = recipientJSON.attributes[2].max_value;
      }catch (error){
        console.error(error)
      }
  
  
      alert("Loaded Metadata");
      // Check the token type of donator and recipient
      if(donatorType == 'Donator' && recipientType == 'Recipient'){
        // Check if donator has sufficient funds to complete the transaction
        if (donationsRemaining - transferBalance >= 0){
          // Check if the recpient is eligible to recieve a donation of this size
          if(recipientBalance + transferBalance <= recipientMaxBalance){
            // Set new balance for donator and recipient
  
            donatorURI = this.storeDonatorToken(donationsRemaining - transferBalance);
            recipiantURI = this.storeRecipientToken(recipientBalance + transferBalance);
  
            try{
              const tx = await token.setURI(this.state.coreAddr, [recieverID, donatorID], [recipiantURI, donatorURI]);
              const receipt = await tx.wait();
              if (receipt.status === 0) {
                // We can't know the exact error that made the transaction fail when it
                // was mined, so we throw this generic one.
                throw new Error("Transaction failed");
              }
            }catch (error) {
              // We check the error code to see if this error was produced because the
              // user rejected a tx. If that's the case, we do nothing.
              if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
                return;
              }
        
              // Other errors are logged and stored in the Dapp's state. This is used to
              // show them to the user, and for debugging.
              console.error(error);
              
            } 
        
            alert("Successfully sent a donation of " + transferBalance + " from token " + donatorID + " to token " + recieverID, ".")
  
          }
  
        }else{
          console.log("Cannot complete transfer: Donator has insufficient funds.")
        }
  
      }else{
        console.log("Cannot complete transaction - donator or recipient is of the wrong type")
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
      //console.log("URI: ", uri);
      var suffix = '.ipfs.nftstorage.link/metadata.json';
  
      var url = prefix + uri + suffix;
      //console.log("URL: ", url);
  
      return fetch(url)
        .then(response => response.json())
        .then(data => {
          return data;
        })
    }
  
    
  
    async storeRecipientToken(donationsRemaining) {
      const image = await this.getExampleImage('https://cors-anywhere.herokuapp.com/https://www.cloudways.com/blog/wp-content/uploads/55-best-1.jpg')
      const nft = {
        "name":"Recipient Token",
        "created_by":"Colton Payne",
        "description":"This is a recipient token. This is the description for test contract 14.",
         "attributes":[
        {"trait_type":"Artist","value":"Colton Payne"},
        {"trait_type":"token_type","value":"Recipient"},
        {"display_type":"number","trait_type":"donation_dollars_recieved","value":donationsRemaining,"max_value":"50000"}],
        "image":image}
  
  
  
      const client = new NFTStorage({ token: API_KEY })
      const metadata = await client.store(nft)
  
      console.log('NFT data stored!')
      console.log('Metadata URI: ', metadata.url)
      return metadata.url
    }
  
     async storeDonatorToken(donationsRemaining) {
      const image = await this.getExampleImage('https://cors-anywhere.herokuapp.com/https://conexum.com.au/wayward/uploads/2016/09/Screen-Shot-2016-09-27-at-3.08.50-pm-800x725.png')
      const nft = {
        "name":"Donator Token",
        "created_by":"Colton Payne",
        "description":"This is a donator token. This is the description for test contract 14.",
         "attributes":[
        {"trait_type":"Artist","value":"Justin Horan"},
        {"trait_type":"token_type","value":"Donator"},
        {"display_type":"number","trait_type":"donation_dollars_remaining","value":donationsRemaining,"max_value":"10000"}],
        "image":image}
  
  
  
      const client = new NFTStorage({ token: API_KEY })
      const metadata = await client.store(nft)
  
      console.log('NFT data stored!')
      console.log('Metadata URI: ', metadata.url)
      return metadata.url
    }
  
  }


export default Donation;