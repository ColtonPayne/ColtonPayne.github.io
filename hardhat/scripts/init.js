// Create a donator and recipient token with default metadata

const { NFTStorage } = require('nft.storage')

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDBDNjZDM0Y0N2MyQ0Q0NjY1OEU0ZjdEYTAxNjY1MTBFQTNGY0JGMjAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NzE2Njk0NjgxMCwibmFtZSI6IkNvbHRvbktleSJ9.j5tMZf9UjLq9uo8TAnjoGAFZCeet4l1P4v0mUP9qe0I';

const coreAddress = '0xa79869Fe7d2d6aDc375FF8D0Cf90AcDE81f4AEc1';
const extensionAddres = '0x2cC2fA572d1c4854E474A2D645371EaD8Cf3dCE8';

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

  async function storeRecipientToken(donationsRemaining) {
    const image = await getExampleImage('https://www.cloudways.com/blog/wp-content/uploads/55-best-1.jpg')
    const nft = {
      "name":"Recipient Token",
      "created_by":"Colton Payne",
      "description":"This is a recipient token. This is the description for test contract 17.",
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
      "created_by":"Justin Horan",
      "description":"This is a donator token. This is the description for test contract 17.",
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

  async function main(){
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.attach(extensionAddres);
  
    _donatorURI = storeRecipientToken(0);
    _recipientURI = storeDonatorToken(10000);
  
    await token.initialize(coreAddress, _donatorURI);
    await token.initialize(coreAddress, _recipientURI);

  }

  main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
