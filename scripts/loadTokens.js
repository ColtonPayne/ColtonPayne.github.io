function getHTTPGateway(ipfsLink){
    var prefix = 'https';
    var uri = ipfsLink.substring(4, ipfsLink.length - 5);
    var suffix = '.ipfs.nftstorage.link/blob';
    return prefix + uri + suffix;
}

// Create a div element for each token you own
function getTokens(){
    for (let i = 1; i < 3; i++) {
        const img = document.createElement("img");
        var ipfsLink = tokens[i].image;
        img.src = getHTTPGateway(ipfsLink);
        img.height = 200;
        img.width = 200;
        document.getElementById("nfts").appendChild(img);
        const TID = document.createElement("h2");
        TID.innerHTML = tokens[i].tokenId;
        document.getElementById("nfts").appendChild(TID);
        const md = document.createElement("h2");
        md.innerHTML = tokens[i].metadata.attributes[1].value;
        document.getElementById("nfts").appendChild(md);
    }
}


window.addEventListener('m-authenticated', async (event) => {
    // Get the data client instance
    const client = event.detail.client;

    // Get the NFTs owned by the currently connected wallet
    const tokens = await client.getNFTsOfOwner();


    const h2 = document.createElement("h2");
    h2.innerHTML = "Your NFTs";
    document.getElementById("nfts").appendChild(document.createElement("h2"))
    
    getTokens()

})
window.addEventListener('m-unauthenticated', async (event) => {
    document.getElementById("nfts").innerHTML = "";
})