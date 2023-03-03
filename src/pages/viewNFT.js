import { NFTStorage } from 'nft.storage';
import React from 'react';
import { useEffect, useState } from 'react';
import './viewNFT.css';
import { ethers } from "ethers";

import TokenArtifact1155 from ".//contracts/Propel1155Token.json";

function ViewNFT(core, ext, connectedAddress) {
    const [nfts, setNfts] = useState([]);
    const [authenticated, setAuthenticated] = useState(false);
    const [client, setClinet] = useState(null);



  window.addEventListener('m-authenticated', async (event) => {
    // Get the data client instance
    setClinet(event.detail.client);

    // Get the NFTs owned by the currently connected wallet
    // Data client API's can be found here: https://docs.manifold.xyz/v/manifold-for-developers/client-widgets/connect-widget/data-client-apis
    setNfts(await event.detail.client.getNFTsOfOwner({
        filters: [
            {
                contractAddress: core,
            }
        ]
    }));
    setAuthenticated(true);
  })
  window.addEventListener('m-unauthenticated', async (event) => {
    setNfts([]);
    setAuthenticated(false);
  })



    return (
        <div>
            <h1>Your Available NFTs</h1>
            {authenticated && client? (
                <div>

                    <div id="grid">
                        { nfts.map((nft) => {
                        return (
                            <div id="container-border">
                                <NftRender tokenID={nft.tokenId} ownerAddr={nft.ownerAddress} coreAddr={core} extAddr={ext}/>
                            </div>
                        )
                        })
                        }

                    </div>
                    <OppositeNFTRender address={connectedAddress} coreAddr={core} extAddr={ext}></OppositeNFTRender>
                </div>
            ) : (
                <h2>You have not yet connected with your MetaMask wallet, please do so in the top right</h2>
            )}
        </div>
    );
};

export class OppositeNFTRender extends React.Component{

    constructor(props){
        super(props);

        var myAddress = props.address
        var extAddr = props.extAddr;
        var coreAddr = props.coreAddr;
        var manifoldClient = props.client;


        this.state = {theAddr: myAddress, coreAddr: coreAddr, extAddr: extAddr, manifoldClient: manifoldClient, oppositeIDs: null}

    }

    componentDidMount() {
        console.log("Running")

        
        this.getOppositeArray(this.state.theAddr).then(bigNumArr => {
            if(!bigNumArr){
                console.log("No TIDS")
            }else{
                var indexArray = []
                for(let i = 0; i < bigNumArr.length; i++){
                    var index = this.convertBigNumberToInt(bigNumArr[i])
                    console.log("Opp TID: ", index)
                    indexArray.push(index)
                }
                this.setState({
                    oppositeIDs:indexArray
                })
            }
        })

        
                
    }


    render(){
        return(
            <div>
                <h1>  Compatible NFTs</h1>
                {this.state.oppositeIDs? (
                    <div id="grid">
                       { this.state.oppositeIDs.map((index) => {
                        return (
                            <div id="container-border">
                                <NftRender tokenID={index} ownerAddr={null} coreAddr={this.state.coreAddr} extAddr={this.state.extAddr}/>
                            </div>
                        )
                        })
                        }
                </div>
                ): null}
                
               
            </div>
        )
    }

    async getOppositeArray(address){
        console.log("My addr:", address)

        this._provider = new ethers.providers.Web3Provider(window.ethereum);

        this._token = new ethers.Contract(
            this.state.extAddr,
            TokenArtifact1155.abi,
            this._provider.getSigner(0)
        );

        var role = await this._token.getUserType(address)
        var oppositeTIDArray = null
        
        if(role == "Admin"){
            
        }

        if(role == "Donator"){
            oppositeTIDArray = await this._token.getRecipientIndices()
            console.log(oppositeTIDArray)
        }else if(role == "Recipient"){
            oppositeTIDArray = await this._token.getDonorIndices()
        }else{
            console.log("No arrays for admins")
        }

        return oppositeTIDArray

    


        /*
        var role = await this._token.getUserType(address)
        console.log("Role: ", role)

        var bigNum = await this._token.getNumTokens()
        
        var count =  this.convertBigNumberToInt(bigNum)

        console.log("Count: ", count)

        var donatorArray = await this._token.getDonorIndices()

        console.log("Donor Array: ", donatorArray)

        for (let i = 0; i < donatorArray.length; i++) {
            console.log(donatorArray[i])
          }
        
        */
        
    }

    convertBigNumberToInt(BigNumber){
        // We get a hex value here, lets convert it to an int
        const balanceHex = BigNumber._hex;
        const balanceBigNumber = ethers.BigNumber.from(balanceHex);
        const balanceDecimal = ethers.utils.formatEther(balanceBigNumber);
        const change = balanceDecimal * 10**18;

        return change
    }

    async loadNFTs(client){
        console.log("Client: ", client)
        try{
            var nft = await client.getNFT({
                contractAddress: this.state.coreAddr,
                tokenId: 1
            })

            console.log("TID:", nft.tokenID)
            console.log("Owner", nft.ownerAddress)

        }catch(error){
            console.log("Get NFT ERROR: ", error)
        }
        
        
        return nft
    }

    
}

export class NftRender extends React.Component {
    constructor(props) {
        super(props);

        var tokenID = props.tokenID;
        var ownerAddr = props.ownerAddr;
        var extAddr = props.extAddr;
        var coreAddr = props.coreAddr;
        this.state = {TID: tokenID, ownerAddr: ownerAddr, coreAddr: coreAddr, extAddr: extAddr}
    }

    componentDidMount() {
        this.getMetadata(this.state.TID);
        

    }

    render() {
        return (
            <div>
                {this.state.ownerAddr ? (<h4>Owner: {this.state.ownerAddr}</h4>): null}             
                <img src={this.state.ImageLink} height={200} width={200}></img>
                <p>Token ID: {this.state.TID}</p>
                <p>Token Type: {this.state.tokenType}</p>
                <p>Creator: {this.state.creator}</p>
                <p>{this.state.phrase}</p>
            </div>
        )
    }

    async getMetadata(TID) {

        this._provider = new ethers.providers.Web3Provider(window.ethereum);

        this._token = new ethers.Contract(
            this.state.extAddr,
            TokenArtifact1155.abi,
            this._provider.getSigner(0)
        );

        var tokenURI = await this._token.tokenURIRetrieve(this.state.coreAddr, TID);
        var tokenJSON = await this.getTokenJson(tokenURI);

        /*
        var count = await this._token.getNumTokens()
        console.log("Test: ", count)

        var role = await this._token.getUserType('0xBf7d2BD0ae1EDbab03718697591D5ec942911516')
        console.log("Role:" , role)
        */

        // Token Id set in constructor
        // Set name of creator
        var creatorOfToken = tokenJSON.created_by;
        this.setState({
            creator: creatorOfToken
        });
        // Set Token type
        var tokenType = tokenJSON.attributes[1].value;
        this.setState({
            tokenType: tokenType
        });
        
        // Set phrase of Token depending on token type
        var phrase;
        if (this.state.tokenType == "Donator") {
            phrase = "You have $" + tokenJSON.attributes[2].value + " remaining out of $" + tokenJSON.attributes[2].max_value;
        } else {
            phrase = "You have received $" + tokenJSON.attributes[2].value + " out of a remaining $" + tokenJSON.attributes[2].max_value;
        }
        this.setState({
            phrase: phrase
        });
        // Set image
        var image = tokenJSON.image;
        this.setState({
            ImageLink: getHTTP(image)
        });
        // Set metadata for debugging
        this.setState({
            
            metadata: tokenJSON
        });

        //
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
}



function getHTTP(ipfsLink) {
    var prefix = 'https';
    var uri = ipfsLink.substring(4, ipfsLink.length -5);
    var suffix = '.ipfs.nftstorage.link/blob';
    return prefix+uri+suffix;
}

export default ViewNFT;