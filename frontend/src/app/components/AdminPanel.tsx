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
            console.log("Try to send tx");
            console.log(connection);

            const tx = await connection?.exch?.setPriceDivisor(BigInt(divisor));
            
            console.log("sended", tx);

            await tx?.wait();
            setTxHash(tx?.hash);
          
            console.log("succes");
            console.log(await connection?.exch?.divisor());
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
        console.log(_ethValue, typeof(_ethValue));
        try {
            console.log("Try to send tx");
            console.log(connection);

            const tx = await connection?.exch?.topUp({ value: _ethValue });
            
            console.log("sended", tx);

            await tx?.wait();
            setTxHash(tx?.hash);

            const exchAddr = await connection?.exch?.getAddress();
          
            console.log("succes");
            console.log(await connection?.provider?.getBalance(exchAddr!, await connection?.provider?.getBlockNumber()));
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

        console.log("withdraw starts");

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

        console.log("withdraw is succes");
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
