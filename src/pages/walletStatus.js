import React from 'react';

function WalletStatus (authenticated) {
    const flag = authenticated;
    
    return (
        <div>
            <h1>Wallet Information</h1>
            {flag ? (
                <h2>You are connected with the wallet address {window.manifold.address}</h2>
            ) : (
                <h2>You have not yet connected with your MetaMask wallet, please do so in the top right</h2>
            )}
        </div>
    );
};

export default WalletStatus;