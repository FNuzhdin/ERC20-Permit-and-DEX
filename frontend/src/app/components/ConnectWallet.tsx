import React from "react";

type ConnectWalletProps = {
    signerIs: boolean | undefined;
    disconnect: React.MouseEventHandler<HTMLButtonElement>;
    connectWallet: React.MouseEventHandler<HTMLButtonElement>;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ signerIs, disconnect, connectWallet }) => {
    console.log("Commponent ConnectWallet");

    return (
        <div className="center-container">
            {signerIs ? 
                <button className="press-button" type="button" onClick={disconnect}>
                    Disconnect
                </button>
                :
                <button className="press-button" type="button" onClick={connectWallet}>
                    Tap to connect
                </button>
            }
        </div>
            
    )
}

export default ConnectWallet;