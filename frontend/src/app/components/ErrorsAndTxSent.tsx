import React from "react";

type ErrorsAndTxSentProps = {
    errorNetwork: string | undefined;
    errorTx: any | undefined;
    txHash: string | undefined;
    dismissErrorNetwork: React.MouseEventHandler<HTMLButtonElement>;
    dismissErrorTx: React.MouseEventHandler<HTMLButtonElement>;
}

const ErrorsAndTxSent: React.FC<ErrorsAndTxSentProps> = ({ errorNetwork, errorTx, txHash, dismissErrorNetwork, dismissErrorTx}) => {
    console.log("Commponent ErrorsAndTxSent");

    return (
        <div className="fixed-bottom-container">
            {txHash &&
                <p><strong>Last transaction hash:</strong> {txHash}</p> 
            }
            
            {errorNetwork && 
                <div className="error-container">   
                    <p className="error-text" key={errorNetwork}>{errorNetwork}</p>
                    <button type="button" onClick={dismissErrorNetwork}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            }
            
            {errorTx &&
                <div className="error-container">
                    <p className="error-text" key={errorTx}>{errorTx}</p>
                    <button type="button" onClick={dismissErrorTx}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            }
        </div>
        
    );

}

export default ErrorsAndTxSent;