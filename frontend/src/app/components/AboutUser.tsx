import React, { useEffect, useState } from "react";
import type { CurrentConnectionProps } from "../page";
import AdminPanel from "./AdminPanel";

type AboutUserProps = {
    connection: CurrentConnectionProps | undefined;
    setTxHash: React.Dispatch<React.SetStateAction<string | undefined>>;
    txHash: string | undefined;
    setErrorTx: React.Dispatch<any>;
}

type Balance = {
    eth: string | undefined;
    token: string | undefined;
}

const AboutUser: React.FC<AboutUserProps> = ({ connection, setTxHash, txHash, setErrorTx }) => {
    const [ balance, setBalance ] = useState<Balance>();
    const [ hide, setHide ] = useState<boolean>(false);

    useEffect(() => {
        (async() => {
            console.log("useEffect from AboutUser");
            if (connection?.signer) {
                const address = await connection.signer.getAddress();
                const tokenBalance = await connection.token?.balanceOf(address);
                const decimals = await connection.token?.decimals();
                const ethBalance = await connection.provider?.getBalance(
                    address,
                    await connection.provider.getBlockNumber()
                );

                if (ethBalance === undefined) {
                    setBalance(undefined);
                    return;
                }
                const eth = (Number(ethBalance!) / 10 ** 18)?.toString();

                if (tokenBalance === undefined && decimals === undefined) {
                    setBalance(undefined);
                    return;
                } 
                const token = (Number(tokenBalance!) / 10 ** Number(decimals!)).toString();

                setBalance({ eth, token});
            } else {
                setBalance(undefined);
            }
        })()}, [txHash, connection?.signer]);

    console.log("Commponent AboutUser");

    return (
        <div className="left-container">
            <button className="press-button1" onClick={() => {setHide(!hide)}}>
                Your information
            </button>
            {hide && connection?.signer?.address && 
            <div>
                <p><strong>Your address:</strong> {connection?.signer?.address}</p>
                <p>ETH balance: {balance?.eth}</p>
                <p>Token balance: {balance?.token}</p>
            </div>
            }
            {connection?.isOwner && 
                <AdminPanel 
                    connection={connection} 
                    setTxHash={setTxHash}
                    setErrorTx={setErrorTx}
                />
            }
        </div>
    );
}
export default AboutUser;