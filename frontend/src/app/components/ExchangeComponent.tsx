import React, { useEffect, useState } from "react";
import type { CurrentConnectionProps } from "../page";
import { signERC2612Permit } from "./signERC20Permit";

type ExchangeComponentProps = {
    connection: CurrentConnectionProps | undefined;
    setTxHash: React.Dispatch<React.SetStateAction<string | undefined>>;
    txHash: string | undefined;
    setErrorTx: React.Dispatch<React.SetStateAction<string | undefined>>;
}

declare let window: any;

const ExchangeComponent: React.FC<ExchangeComponentProps> = ({ connection, setErrorTx, setTxHash, txHash }) => {
    const [ value, setValue ] = useState<string>(""); 
    const [ cost, setCost ] = useState<string>();

    useEffect(() => {
        (async() => {
            console.log("useEffect from ExchangeComponent");

            const divisor = await connection?.exch?.divisor();
            setCost(divisor?.toString());
        })()}, [txHash]);

    const handleInputChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event?.target.value);
    }

    const handleClickBuy = async() => {
        console.log("Buy started");

        if (!value) {
            console.log("Need amount")
            return;
        }

        const decimals = await connection?.token?.decimals();
        const _value = BigInt(Number(value.replaceAll(",",".")) * 10 ** Number(decimals)); 
        const _ethValue = BigInt(Number(_value) / Number(cost));
        try {
            console.log("Attempt to buy");

            console.log(value, _value, _ethValue);

            const tx = await connection?.exch?.buy(_value, {value: _ethValue});
            await tx?.wait()

            setTxHash(tx?.hash);
            console.log("Tx hash:", tx?.hash);
            console.log("Buy successfully");

        } catch (error: any) {
            if (error.reason) {
                console.error(error.reason);
                setErrorTx(error.reason);
            }
        } finally {
            setValue("");
        }
    }

    const handleClickSell = async() => {
        console.log("Sell started");

        if (!value) {
            console.log("Need amount")
            return;
        }
        

        const _value = BigInt(Number(value.replaceAll(",", ".")) * 10 ** 18);
        const spender = await connection?.exch?.getAddress();
        const signer = await connection?.signer?.getAddress();
        const tokenAddr = await connection?.token?.getAddress();
        const deadline = Math.floor(Date.now() / 1000) + 1000;
        const nonce = Number(await connection?.token?.nonces(signer!));
        const chainId = parseInt((await window.ethereum.request({
            method: "eth_chainId"
        })), 16);
        console.log("Chosen chain:", chainId);

        const result = await signERC2612Permit(
            tokenAddr!,
            signer!,
            spender!,
            _value, 
            deadline,
            nonce,
            connection?.signer!,
            chainId
        );

        try {
            console.log("Attempt to sell");

            const tx = await connection?.exch?.sellWithPermit(
                signer!,
                spender!,
                _value,
                result.deadline,
                result.v,
                result.r,
                result.s
            );
            await tx?.wait();

            setTxHash(tx?.hash);
        } catch (error: any) {
            if (error.reason) {
                console.error(error.reason);
                setErrorTx(error.reason);
            }
        } finally {
            setValue("");
        }
    }

    return (
        <div className="center-container">
            <h1 className="stylish-title">The Exchange</h1>
            <h2 className="stylish-subtitle">Cost: {cost} tokens per 1 ETH</h2>
            <div>
                <input 
                    className="stylish-input1"
                    type="text" 
                    value={value} 
                    onChange={handleInputChangeValue} 
                    placeholder="amount" 
                />
                <div>
                    <button className="press-buttonBuy" onClick={handleClickBuy}>Buy</button>
                    <button className="press-buttonSell" onClick={handleClickSell}>Sell</button>
                </div>
            </div>
        </div>
    );
}

export default ExchangeComponent;