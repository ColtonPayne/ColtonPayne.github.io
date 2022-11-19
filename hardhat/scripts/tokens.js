const { NFTStorage } = require('nft.storage')


// read the API key from an environment variable. You'll need to set this before running the example!
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDBDNjZDM0Y0N2MyQ0Q0NjY1OEU0ZjdEYTAxNjY1MTBFQTNGY0JGMjAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NzE2Njk0NjgxMCwibmFtZSI6IkNvbHRvbktleSJ9.j5tMZf9UjLq9uo8TAnjoGAFZCeet4l1P4v0mUP9qe0I';
var _firstURI;
var _secondURI;

const coreAddress = '0x396865d35D809dbb90de94ee68655A66aF0f1617';
const extensionAddres = '0x9bA4Dc35F4Fe3C7cBE77036a23EEaE91f96E5c5B';


async function main(){
    await sendDonation(3,2,500);

}

function initTokens(){
  window.addEventListener('m-authenticated', async (event) => {
      // Get the data client instance
      const client = event.detail.client;

      // Get the NFTs owned by the currently connected wallet
      const tokens = await client.getNFTsOfOwner();


      const h2 = document.createElement("h2");
      h2.innerHTML = "Your NFTs";
      document.getElementById("nfts").appendChild(document.createElement("h2"))
      // Create a div element for each token you own
      for (let i = 0; i < tokens.length; i++) {
          if(tokens[i].tokenId != 3){
              const img = document.createElement("img");
              var ipfsLink = tokens[i].image;
              var prefix = 'https';
              var uri = ipfsLink.substring(4, ipfsLink.length - 5);
              var suffix = '.ipfs.nftstorage.link/blob';
              img.src = prefix + uri + suffix;
              img.height = 200;
              img.width = 200;
              document.getElementById("nfts").appendChild(img);
              const md = document.createElement("h2");
              md.innerHTML = tokens[i].metadata.attributes[2].value;
              document.getElementById("nfts").appendChild(md);
          }     
      }
  })
  window.addEventListener('m-unauthenticated', async (event) => {
      document.getElementById("nfts").innerHTML = "";
  })
}

function sayHi(){
  alert("Hello World from hardhat");
}

// For example's sake, we'll fetch an image from an HTTP URL.
// In most cases, you'll want to use files provided by a user instead.
async function getExampleImage(link) {
  const imageOriginUrl = link
  const r = await fetch(imageOriginUrl)
  if (!r.ok) {
    throw new Error(`error fetching image: [${r.statusCode}]: ${r.status}`)
  }
  return r.blob()
}

  async function getTokenJson(uri){
    var prefix = 'https'
    uri = uri.substring(4, uri.length - 14);
    console.log("URI: ", uri);
    suffix = '.ipfs.nftstorage.link/metadata.json';

    var url = prefix + uri + suffix;
    console.log("URL: ", url);

    return fetch(url)
      .then(response => response.json())
      .then(data => {
        return data;
      })
  }

  async function sendDonation(donatorID, recieverID, transferBalance){
    try{
      const Token = await ethers.getContractFactory("Token");
      const token = await Token.attach(extensionAddres);
  
      var recipiantURI = await token.tokenURI(coreAddress, recieverID);
      var  donatorURI = await token.tokenURI(coreAddress, donatorID);
  
      var recipientJSON = await getTokenJson(recipiantURI);
      var donatorJSON = await getTokenJson(donatorURI);
  
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

          donatorURI = storeDonatorToken(donationsRemaining - transferBalance);
          recipiantURI = storeRecipientToken(recipientBalance + transferBalance);

          await token.setURI(coreAddress, recieverID, recipiantURI);
          await token.setURI(coreAddress, donatorID, donatorURI);

          alert("Successfully sent a donation of ", transferBalance, " from token ", donatorID, "to token ", recieverID, ".")

        }

      }else{
        console.log("Cannot complete transfer: Donator has insufficient funds.")
      }

    }else{
      console.log("Cannot complete transaction - donator or recipient is of the wrong type")
    }

  }

  async function storeRecipientToken(donationsRemaining) {
    const image = await getExampleImage('https://www.cloudways.com/blog/wp-content/uploads/55-best-1.jpg')
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

  export async function storeDonatorToken(donationsRemaining) {
      const image = await getExampleImage('https://conexum.com.au/wayward/uploads/2016/09/Screen-Shot-2016-09-27-at-3.08.50-pm-800x725.png')
      const nft = {
        "name":"Donator Token",
        "created_by":"Colton Payne",
        "description":"This is a donator token. This is the description for test contract 14.",
         "attributes":[
        {"trait_type":"Artist","value":"Colton Payne"},
        {"trait_type":"token_type","value":"Donator"},
        {"display_type":"number","trait_type":"donation_dollars_remaining","value":donationsRemaining,"max_value":"10000"}],
        "image":image}



      const client = new NFTStorage({ token: API_KEY })
      const metadata = await client.store(nft)

      console.log('NFT data stored!')
      console.log('Metadata URI: ', metadata.url)
      return metadata.url
    }



  /*  
  main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  */
