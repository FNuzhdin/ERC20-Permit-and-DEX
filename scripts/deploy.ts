import { writeFileSync } from "fs";
import { ethers } from "hardhat";

async function main() {
    console.log("DEPLOYING Token...");

    const [deployer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("AnnaToken", deployer);
    const token = await Token.deploy();
    await token.waitForDeployment();

    const tokenAddr = await token.getAddress();

    console.log(`Deployer address: ${deployer.address}`);
    console.log(`Token address: ${tokenAddr}`);

    console.log("DEPLOYING Exchange...");
    const Exchange = await ethers.getContractFactory("Exchange", deployer);
    const exch = await Exchange.deploy(tokenAddr);
    await exch.waitForDeployment();

    const exchAddr = await exch.getAddress();

    console.log(`Deployer address: ${deployer.address}`);
    console.log(`Exchange address: ${exchAddr}`);

    writeFileSync("./scripts/DeployingData.json", JSON.stringify({
        tokenAddr,
        exchAddr,
    }, null, 2));
    writeFileSync("./frontend/public/DeployingData.json", JSON.stringify({
        tokenAddr,
        exchAddr,
    }, null, 2));

    console.log("SUCCESS"); 
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });