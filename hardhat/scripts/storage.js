const { NFTStorage } = require('nft.storage')
var XMLHttpRequest = require('xhr2');

// read the API key from an environment variable. You'll need to set this before running the example!
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDBDNjZDM0Y0N2MyQ0Q0NjY1OEU0ZjdEYTAxNjY1MTBFQTNGY0JGMjAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NzE2Njk0NjgxMCwibmFtZSI6IkNvbHRvbktleSJ9.j5tMZf9UjLq9uo8TAnjoGAFZCeet4l1P4v0mUP9qe0I';
var _firstURI;
var _secondURI;

const coreAddress = '0xf3a013252d45D8B4226c79E21ca6e11Ce155B8B9';
const extensionAddres = '0x2933BC7D948fc18cD86d402e4251731eA6eC5177';


async function main(){
    await sendDonation(3,2,500);

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

          console.log("Successfully sent a donation of ", transferBalance, " from token ", donatorID, "to token ", recieverID, ".")

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

  async function storeDonatorToken(donationsRemaining) {
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
  getTokenJson()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
*/



  main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
