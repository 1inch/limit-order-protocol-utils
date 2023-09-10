import { ethers } from "hardhat";

export async function deploySwapTokens () {
    const TokenMock = await ethers.getContractFactory('TokenMock');
    const dai = await TokenMock.deploy('DAI', 'DAI');
    await dai.deployed();
    const WrappedTokenMock = await ethers.getContractFactory('WrappedTokenMock');
    const weth = await WrappedTokenMock.deploy('WETH', 'WETH');
    await weth.deployed();
    const inch = await TokenMock.deploy('1INCH', '1INCH');
    await inch.deployed();
    const LimitOrderProtocol = await ethers.getContractFactory('LimitOrderProtocol');
    const swap = await LimitOrderProtocol.deploy(weth.address);
    await swap.deployed();
    const TokenCustomDecimalsMock = await ethers.getContractFactory('TokenCustomDecimalsMock');
    const usdc = await TokenCustomDecimalsMock.deploy('USDC', 'USDC', '0', 6);
    await usdc.deployed();
    const chainId = (await ethers.provider.getNetwork()).chainId;
    return { dai, weth, inch, swap, chainId, usdc };
};

export async function deployArbitraryPredicate () {
    const ArbitraryPredicateMock = await ethers.getContractFactory('ArbitraryPredicateMock');
    const arbitraryPredicate = await ArbitraryPredicateMock.deploy();
    await arbitraryPredicate.deployed();
    return { arbitraryPredicate };
};


// export async function deploySeriesEpochManager () {
//     const SeriesEpochManager = await ethers.getContractFactory('SeriesEpochManager');
//     const seriesNonceManager = await SeriesEpochManager.deploy();
//     await seriesNonceManager.deployed();
//     return { seriesNonceManager };
// };
