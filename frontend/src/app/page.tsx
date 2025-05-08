"use client";

import React, { useState } from "react";

import { ethers } from "ethers";
import { Exchange__factory } from "@/typechain";
import { AnnaToken__factory } from "@/typechain";
import type { Exchange } from "@/typechain";
import type { AnnaToken } from "@/typechain";
import type { BrowserProvider } from "ethers";

import deployingData from "../../public/DeployingData.json";
import ConnectWallet from "./components/ConnectWallet";
import ErrorsAndTxSent from "./components/ErrorsAndTxSent";
import AboutUser from "./components/AboutUser";
import ExchangeComponent from "./components/ExchangeComponent";

const SEPOLIA_CHAINID = "0xaa36a7"; /* контракт будет размещен 
только в одной сети. но мы оставим hardhat для тестирования */
/* сейчас при пропытке вызывать owner() на exch выходит ошибка
это происходит по тому, что контракта нет в sepolia */
const HARDHAT_CHAINID = "0x539";

const exchAddr = deployingData.exchAddr;
const tokenAddr = deployingData.tokenAddr;

declare let window: any;

export type CurrentConnectionProps = {
    provider: BrowserProvider | undefined;
    exch: Exchange | undefined;
    token: AnnaToken | undefined;
    signer: ethers.JsonRpcSigner | undefined;
    isOwner: boolean | undefined; 
}

export default function Home() {
    const [ currentConnection, setCurrentConnection] = useState<CurrentConnectionProps>();
    const [ errorNetwork, setErrorNetwork ] = useState<string>();
    const [ txHash, setTxHash ] = useState<string>();
    const [ errorTx, setErrorTx ] = useState<any>();

    

    const _dismissErrorNetwork = () => {
        setErrorNetwork(undefined);
    }

    const _dismissErrorTx = () => {
        setErrorTx(undefined);
    }

    const _connectWallet = async() => {
        if(window.ethereum === undefined) {
            setErrorNetwork("Install wallet please!");
            return;
        }

        if (!(await _checkNetwork())) {
            return;
        }

        const [ selectAccount ] = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        await _initialize(selectAccount);

        window.ethereum.on(
            "accountsChanged",
            async([newAccount]: [newAccount: string]) => {
                if(newAccount === undefined) {
                    console.log("Account undefined");
                    return _resetState();
                }

                console.log("new initialize");
                _resetState();
                await _initialize(newAccount);
            }
        );

        window.ethereum.on(
            "chainChanged",
            async([_newNetworkId]: string) => {
                console.log("chain changed");
                if (!(await _checkNetwork(_newNetworkId))) {
                    console.log("reset state");
                    return _resetState();
                }
            }
        );
    }

    const _resetState = () => {
        console.log("resetState");
        setCurrentConnection({
            provider: undefined,
            exch: undefined,
            token: undefined,
            signer: undefined,
            isOwner: undefined 
        });
        setErrorNetwork(undefined);
        setTxHash(undefined);
        setErrorTx(undefined);
    }

    const _checkNetwork = async(newNetworkId?: string): Promise<boolean> => {
        console.log("checkNetwork");
        const chosenChainId = 
            newNetworkId || await window.ethereum.request({
                method: "eth_chainId",
            });

        if (
            chosenChainId === SEPOLIA_CHAINID ||
            chosenChainId === HARDHAT_CHAINID
        ) {
            console.log("network is true");
            return true;
        } else {
            console.log("network is false");
            setErrorNetwork("Only hardhat or sepolia networks");
            return false; 
        }
    }

    const _initialize = async(selectedAccount: string) => {
        console.log("initialize starts");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner(selectedAccount);

        const isOwner = await _checkOwner(signer);

        setCurrentConnection({
            ...currentConnection,
            provider,
            exch: Exchange__factory.connect(exchAddr, signer),
            token: AnnaToken__factory.connect(tokenAddr, signer),
            signer,
            isOwner
        });
        console.log("initialize is succes");
    }

    const _checkOwner = async(signer: ethers.JsonRpcSigner): Promise<boolean> => {
        console.log("checkOwner starts");
        const exch = Exchange__factory.connect(exchAddr, signer);
        const ownerAddr = await exch.owner();
        
        if (ownerAddr === signer.address) {
            console.log("isOwner: true");
            return true;
        } 
        console.log("isOwner: false");
        return false; 
    }

    console.log(errorTx);

    return (
        <main>
            <ConnectWallet 
                signerIs={currentConnection?.signer !== undefined}
                disconnect={_resetState}
                connectWallet={_connectWallet}
            />

            {currentConnection?.signer && 
            <div>
                <AboutUser 
                    connection={currentConnection} 
                    setTxHash={setTxHash}
                    txHash={txHash}
                    setErrorTx={setErrorTx}
                />

                <ExchangeComponent 
                    connection={currentConnection}
                    setErrorTx={setErrorTx}
                    setTxHash={setTxHash}
                    txHash={txHash}
                />
                
                <ErrorsAndTxSent 
                    errorNetwork={errorNetwork}
                    errorTx={errorTx} 
                    txHash={txHash} 
                    dismissErrorNetwork={_dismissErrorNetwork} 
                    dismissErrorTx={_dismissErrorTx}
                /> 
            </div>
            }
            <div className="fixed-bottom-container1">
                <h1>Exchange address: {exchAddr}</h1>
                <h1>Token address: {tokenAddr}</h1>
            </div>
            
        </main>
        
    ); 
}
