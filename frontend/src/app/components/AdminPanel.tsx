import React, { useState } from "react";

import type { CurrentConnectionProps } from "../page";

type AdminPanelProps = {
    connection: CurrentConnectionProps | undefined;
    setTxHash: React.Dispatch<React.SetStateAction<string | undefined>>;
    setErrorTx: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({connection, setTxHash, setErrorTx}) => {
    const [ divisor, setDivisor ] = useState<string>("");
    const [ value, setValue ] = useState<string>("");
    const [ hide, setHide ] = useState<boolean>(false);

    const handleInputChangeDivisor = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDivisor(event?.target.value);
    }

    const handleInputChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event?.target.value);
    }

    const handleClickSetDivisor = async() => {
        if (!divisor) {
            console.log("Need divisor");
            return;
        }

        try {
            console.log("Attempt to send transaction");
            console.log("Connection:", connection);

            const tx = await connection?.exch?.setPriceDivisor(BigInt(divisor));
            
            console.log("Tx sent", tx);

            await tx?.wait();
            setTxHash(tx?.hash);
          
            console.log("Transaction sent successfully");
            console.log("Actual divisor:", await connection?.exch?.divisor());
        } catch (error: any) {
            if (error.reason) {
                console.error(error.reason);
                setErrorTx(error.reason);
                
            }
        } finally {
            setDivisor("");
        }
    }

    const handleClickTopUp = async() => {
        if (!value) {
            console.log("Need value")
            return;
        }

        const _ethValue = BigInt(Number(value.replaceAll(",", ".")) * 10 ** 18);
        try {
            console.log("Attempt to send transaction");
            console.log("Connetion:", connection);

            const tx = await connection?.exch?.topUp({ value: _ethValue });
            
            console.log("Tx sent", tx);

            await tx?.wait();
            setTxHash(tx?.hash);

            const exchAddr = await connection?.exch?.getAddress();
          
            console.log("Transaction sent successfully");
            console.log("Current exchange ETH balance:", await connection?.provider?.getBalance(exchAddr!, await connection?.provider?.getBlockNumber()));
        } catch (error: any) {
            if (error.reason) {
                console.error(error.reason);
                setErrorTx(error.reason);
                
            }
        } finally {
            setValue("");
        }
    }

    const handleClickWithdraw = async() => {

        console.log("Withdraw started");

        try {
            const tx = await connection?.exch?.withdraw();
            await tx?.wait();

            setTxHash(tx?.hash);
        } catch (error: any) {
            if (error.reason) {
                console.error(error.reason);
                setErrorTx(error.reason);
            }
        } 

        console.log("Withdraw successfully");
    }

    return (
        <div>
            <button className="press-button1" onClick={() => {setHide(!hide)}}>
                Administration
            </button>
            {hide && 
            <div>
                <div>
                    <input 
                        className="stylish-input"
                        type="text" 
                        value={divisor} 
                        onChange={handleInputChangeDivisor} 
                        placeholder="divisor" 
                    />
                    <button className="press-button1" type="button" onClick={handleClickSetDivisor}>
                        setDivisor
                    </button>
                </div>
                <div>
                    <input 
                        className="stylish-input"
                        type="text"
                        value={value}
                        onChange={handleInputChangeValue}
                        placeholder="value"
                    />
                    <button className="press-button1" type="button" onClick={handleClickTopUp}>
                        topUp
                    </button>
                </div>
                <button className="press-button1" type="button" onClick={handleClickWithdraw}>
                        Withdraw
                </button>
            </div>
            }
        </div>
    );
}

export default AdminPanel;
