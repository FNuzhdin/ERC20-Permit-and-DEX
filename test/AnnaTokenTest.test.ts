import { AnnaToken } from "../typechain-types";
import { loadFixture, ethers, expect } from "./setup";
import { signERC2612Permit } from "eth-permit";

describe("AnnaTokenTests", () => {
    async function deploy() {
        const [deployer, signer, signer2] = await ethers.getSigners();

        const AnnaToken = await ethers.getContractFactory("AnnaToken");
        const anna = await AnnaToken.deploy();
        await anna.waitForDeployment();

        return { deployer, signer, signer2, anna }
    }

    it("Constructor", async () => {
        const { deployer, signer, anna } = await loadFixture(deploy);

        const totalSupply = await anna.totalSupply();
        expect(totalSupply).to.eq(await withDecimals(anna, 10000n));
        expect(await anna.decimals()).to.eq(18);
        expect(await anna.name()).to.eq("AnnaToken");
        expect(await anna.symbol()).to.eq("ANNA");
        expect(await anna.owner()).to.eq(deployer.address);

        const deployerTokenBalance = await anna.balanceOf(deployer.address);
        expect(deployerTokenBalance).to.eq(await withDecimals(anna, 10000n));        
    });

    it("AnnaToken mint", async () => {
        const { signer, anna } = await loadFixture(deploy);

        const value = await withDecimals(anna, 100n);

        const txMint = await anna.mint(signer.address, value);
        await txMint.wait();

        expect(await anna.balanceOf(signer.address)).to.eq(value);
        await expect(
            anna.connect(signer).mint(signer.address, value)
        ).to.revertedWith("Not an owner");
    });

    it("ERC20 burn", async() => {
        const { deployer, signer, signer2, anna } = await loadFixture(deploy);

        const value = await withDecimals(anna, 10000n);

        await anna.burn(value);

        expect(await anna.balanceOf(deployer.address)).to.eq(0);

        const txMint = await anna.mint(signer.address, value);
        await txMint.wait();

        const txApprove = await anna.connect(signer).approve(signer2.address, value);
        await txApprove.wait();

        expect(
            await anna.allowance(signer.address, signer2.address)
        ).to.eq(value);

        await expect(
            anna.burnFrom(signer.address, value)
        ).to.revertedWithCustomError(
            anna, "ERC20InsufficientAllowance"
        ).withArgs(deployer.address, 0, value);

        const txBurn = await anna.connect(signer2).burnFrom(signer.address, value);
        await txBurn.wait();

        expect(await anna.allowance(signer.address, signer2.address)).to.eq(0);
    });

    it("ERC20 transfer", async () => {
        const { deployer, signer, signer2, anna } = await loadFixture(deploy);

        const value = await withDecimals(anna, 1000n);
        const txTransferSigner1 = await anna.transfer(signer.address, value);
        const txTransferSigner2 = await anna.transfer(signer2.address, value);

        await expect(txTransferSigner1).to.changeTokenBalances(anna,
            [deployer, signer], [-value, value]
        );
        await expect(txTransferSigner2).to.changeTokenBalances(anna,
            [deployer, signer2], [-value, value]
        );

        const ZERO = ethers.ZeroAddress; 
        
        await expect(anna.transfer(ZERO, 100n))
        .to.revertedWithCustomError(
            anna, `ERC20InvalidReceiver`
        ).withArgs(ZERO);
    });

    it("ERC20 transferFrom", async() => {
        const { deployer, signer, signer2, anna } = await loadFixture(deploy);

        await expect(anna.connect(signer).transferFrom(deployer, signer, 100n))
        .to.revertedWithCustomError(anna, "ERC20InsufficientAllowance"); 

        const value = await withDecimals(anna, 3000n);
        const txApprove = await anna.approve(signer, value);
        await txApprove.wait();

        expect(await anna.allowance(deployer, signer)).to.eq(value);

        const txTransferFrom = await anna.connect(signer)
        .transferFrom(deployer, signer2, value);
        await txTransferFrom.wait();

        expect(await anna.allowance(deployer, signer)).to.eq(0);
        expect(await anna.balanceOf(signer2)).to.eq(value);

        const ZERO = ethers.ZeroAddress;

        await expect(anna.approve(
            ZERO, 10n)
        ).to.revertedWithCustomError(
            anna, "ERC20InvalidSpender"
        ).withArgs(ZERO);
    });

    it("Permit", async () => {
        const { deployer, signer, anna } = await loadFixture(deploy);

        expect(await anna.nonces(deployer.address)).to.eq(0);

        const provider = ethers.provider;
        const value = 1000;
        const tokenAddress = await anna.getAddress();

        const result = await signERC2612Permit(
            provider, tokenAddress, deployer.address, signer.address, value
        );

        const txPermit = await anna.permit(
            deployer.address, 
            signer.address, 
            value, 
            result.deadline, 
            result.v, 
            result.r, 
            result.s
        );
        await txPermit.wait();

        expect(await anna.allowance(
            deployer.address, signer.address
        )).to.eq(value);

        expect(await anna.nonces(deployer.address)).to.eq(1);
    });

    async function withDecimals(anna: AnnaToken, amount: bigint): Promise<bigint> {
        return amount * 10n ** await anna.decimals();
    }
});