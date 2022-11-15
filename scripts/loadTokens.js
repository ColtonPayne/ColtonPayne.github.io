function sayHi(){
    alert("Hello World");
}

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
        const img = document.createElement("img");
        var ipfsLink = tokens[i].image;
        var prefix = 'https';
        var uri = ipfsLink.substring(4, ipfsLink.length - 5);
        var suffix = '.ipfs.nftstorage.link/blob';
        img.src = prefix + uri + suffix;
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
})
window.addEventListener('m-unauthenticated', async (event) => {
    document.getElementById("nfts").innerHTML = "";
})