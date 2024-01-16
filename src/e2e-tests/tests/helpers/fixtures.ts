import { ethers } from "hardhat";

export async function deploySwapTokens () {
    const TokenMock = await ethers.getContractFactory('TokenMock');
    const dai = await TokenMock.deploy('DAI', 'DAI');
    await dai.waitForDeployment();
    const WrappedTokenMock = await ethers.getContractFactory('WrappedTokenMock');
    const weth = await WrappedTokenMock.deploy('WETH', 'WETH');

    await weth.waitForDeployment();
    const LimitOrderProtocol = await ethers.getContractFactory('LimitOrderProtocol');
    const swap = await LimitOrderProtocol.deploy(await weth.getAddress());
    await swap.waitForDeployment();
    const chainId = (await ethers.provider.getNetwork()).chainId;
    return { dai, weth, swap, chainId };
};

export async function deployArbitraryPredicate () {
    const ArbitraryPredicateMock = await ethers.getContractFactory('ArbitraryPredicateMock');
    const arbitraryPredicate = await ArbitraryPredicateMock.deploy();
    await arbitraryPredicate.waitForDeployment();
    return { arbitraryPredicate };
};

