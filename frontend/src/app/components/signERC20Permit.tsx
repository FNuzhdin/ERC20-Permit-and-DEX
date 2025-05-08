import { ethers } from "ethers";

interface ERC2612PermitMessage {
    owner: string;
    spender: string;
    value: bigint | number | string;
    nonce: number | string;
    deadline: number | string;
}

interface RSV {
    r: string;
    s: string;
    v: number;
}

interface Domain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}

export async function signERC2612Permit(
    token: string,
    owner: string,
    spender: string,
    value: bigint | string | number,
    deadline: number, 
    nonce: number,
    signer: ethers.JsonRpcSigner,
    chainId: number, 
): Promise<ERC2612PermitMessage & RSV> {
    const message: ERC2612PermitMessage = {
        owner, 
        spender,
        value,
        nonce,
        deadline,
    }; 

    const domain: Domain = {
        name: "AnnaToken",
        version: "1",
        chainId: chainId,
        verifyingContract: token
    };

    const typedData = createTypedERC2612Data(message, domain);

    const rawSignature = await signer.signTypedData(
        typedData.domain,
        typedData.types,
        typedData.message
    );

    const sig = splitSignatureToRSV(rawSignature); 

    return { ...sig, ...message }
}

function createTypedERC2612Data(message: ERC2612PermitMessage, domain: Domain) {
    return {
        types: {
            
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" }, 
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ]
        },
        primaryType: "Permit", 
        domain,
        message
    };
}



function splitSignatureToRSV(signature: string): RSV {
    const r = "0x" + signature.substring(2).substring(0, 64);
    const s = "0x" + signature.substring(2).substring(64, 128);
    const v = parseInt(signature.substring(2).substring(128, 130), 16);

    return { r, s, v};
}
