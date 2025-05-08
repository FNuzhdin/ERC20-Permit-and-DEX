
import { signERC2612Permit } from "eth-permit";
import { AnnaToken, Exchange } from "../typechain-types";
import { loadFixture, ethers, expect } from "./setup";

describe("ExchangeTests", () => {
    async function deploy() {
        const [deployer, signer, signer2] = await ethers.getSigners();

        const AnnaToken = await ethers.getContractFactory("AnnaToken");
        const anna = await AnnaToken.deploy();
        await anna.waitForDeployment();

        const Exchange = await ethers.getContractFactory("Exchange");
        const exch = await Exchange.deploy(anna.target);
        await exch.waitForDeployment();

        return { deployer, signer, signer2, anna, exch }
    }

    it("Set divisor", async() => {
        const { deployer, signer, anna, exch } = await loadFixture(deploy);

        expect(await exch.owner()).to.eq(deployer.address);

        const txSetPriceDivisor = await exch.setPriceDivisor(2);
        await txSetPriceDivisor.wait();

        expect(await exch.divisor()).to.eq(2);
        await expect(exch.connect(signer).setPriceDivisor(3)).to.revertedWith("Not an owner");

        await expect(exch.setPriceDivisor(0)).to.revertedWith("Incorrect number");
    });

    it("Buy", async() => {
        const { deployer, signer, anna, exch } = await loadFixture(deploy);

        const txSetPriceDivisor = await exch.setPriceDivisor(2);
        await txSetPriceDivisor.wait();

        await expect(exch.buy(1)).to.revertedWith("Amount is too low");

        await expect(exch.buy(4)).to.revertedWith("No product");

        const exchAddr = await exch.getAddress();

        const tokenTransfer = await anna.transfer(exchAddr, 1000);
        await tokenTransfer.wait();

        expect(await anna.balanceOf(exchAddr)).to.eq(1000);

        await expect(exch.buy(10)).to.revertedWith("Incorrect value");
        await expect(exch.buy(1000, {value: 1000})).to.revertedWith("Incorrect value");
        
        const txBuy = await exch.connect(signer).buy(1000, { value: 500});
        await txBuy.wait();

        await expect(txBuy).to.changeEtherBalances([signer, exch], [-500, 500]);
        await expect(txBuy).to.changeTokenBalances(anna, [signer, exch], [1000, -1000]);
        
        await expect(txBuy).to.emit(exch, "Buy").withArgs(signer.address, 1000);

    });

    it("Sell with permit", async () => {
        const { deployer, signer, anna, exch } = await loadFixture(deploy);
        const { 
            provider,
            exchAddress, 
            value,
            result,
        } = await preparePermitParams(anna, exch, deployer.address);


        const txTopUp = await exch.topUp({ value: value });
        await txTopUp.wait();

        expect(await provider.getBalance(exch.target)).to.eq(value);

        const txSellWithPermit = await exch.sellWithPermit(
            deployer.address, 
            exchAddress, 
            value, 
            result.deadline, 
            result.v,
            result.r,
            result.s,
        );
        await txSellWithPermit.wait();
        

        expect(await anna.allowance(deployer.address, exchAddress)).to.eq(0);
        await expect(txSellWithPermit).to.changeEtherBalances(
            [deployer, exch], [value, -value]
        );
        await expect(txSellWithPermit).to.changeTokenBalances(anna, 
            [deployer, exch], [-value, value]
        );

        expect(await provider.getBalance(exchAddress)).to.eq(0);

        await expect(txSellWithPermit).to.emit(
            exch, "Sell"
        ).withArgs(deployer.address, value);
    });

    it("Sell with revert", async() => {
        const { deployer, anna, exch } = await loadFixture(deploy);
        const { 
            provider,
            exchAddress, 
            value,
            result,
        } = await preparePermitParams(anna, exch, deployer.address, 0);

        await expect(exch.sellWithPermit(
            deployer.address, 
            exchAddress, 
            value, 
            result.deadline, 
            result.v,
            result.r,
            result.s,
        )).to.reverted;
    });

    it("Withdraw", async() => {
        const { deployer, signer, anna, exch } = await loadFixture(deploy);

        await expect(exch.withdraw()).to.revertedWith("No funds"); 

        const value = 1000;

        const txSend = await exch.topUp({value: value});
        await txSend.wait();

        const txWithdraw = await exch.withdraw();

        await expect(txWithdraw).to.changeEtherBalances(
            [deployer, exch], [value, -value]
        );

        const provider = ethers.provider;
        const txData = {
            to: exch.target,
            value,
        }
        const txSend2 = await deployer.sendTransaction(txData);
        await txSend2.wait();

        expect(await provider.getBalance(exch.target)).to.eq(value);

        await expect(signer.sendTransaction(txData)).to.revertedWith(
            "Not an owner"
        );

        await expect(exch.connect(signer).withdraw()).to.revertedWith(
            "Not an owner"
        );
    });
});

async function preparePermitParams(anna: AnnaToken, exch: Exchange, deployer: string, _value: number = 1000) {
    const provider = ethers.provider;
    const tokenAddress = await anna.getAddress();
    const exchAddress = await exch.getAddress();
    const value = _value; 
    const deadline = Math.floor(Date.now() / 1000) + 1000;

    const result = await signERC2612Permit(
        provider, 
        tokenAddress, 
        deployer, 
        exchAddress, 
        value, 
        deadline, 
        0
    );

    return {
        provider,
        exchAddress, 
        value,
        result}
}

async function withDecimals(anna: AnnaToken, amount: bigint): Promise<bigint> {
    return amount * 10n ** await anna.decimals();
}