import {
    fillWithMakingAmount,
    getFacadeTx,
    getFacadeViewCall,
    getOrderFacade,
    getPredicateBuilder,
    getSignedOrder,
} from './helpers/utils';
import { ether } from './helpers/utils';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployArbitraryPredicate, deploySwapTokens } from './helpers/fixtures';
import { expect } from 'chai';
import {getPermit} from "./helpers/eip712";
import {getPermit2, permit2Contract, withTarget, } from "@1inch/solidity-utils";
import {LimitOrderBuilder} from "../../limit-order.builder";
import {ZX} from "../../limit-order-protocol.const";
import { ethers } from "hardhat"
import {buildTakerTraits} from "../../utils/build-taker-traits";
import {Contract} from "ethers";

const getCurrentTime = () => Math.floor(Date.now() / 1000);

type Signer = Awaited<ReturnType<typeof ethers.getSigners>>[0];

describe('LimitOrderProtocol',  () => {
    let addr: Signer, addr1: Signer;

    beforeEach(async () => {
        [addr, addr1] = await ethers.getSigners();
    });

    async function initContracts(dai: Contract, weth: Contract, swap: Contract) {
        await dai.mint(await addr1.getAddress(), ether('1000000'));
        await dai.mint(await addr.getAddress(), ether('1000000'));
        await weth.deposit({ value: ether('100') });
        await weth.connect(addr1).deposit({ value: ether('100') });
        await dai.approve(await swap.getAddress(), ether('1000000'));
        await dai.connect(addr1).approve(await swap.getAddress(), ether('1000000'));
        await weth.approve(await swap.getAddress(), ether('100'));
        await weth.connect(addr1).approve(await swap.getAddress(), ether('100'));
    }

    describe('wip', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            await initContracts(dai, weth, swap);
            return { dai, weth, swap, chainId };
        };

        it('transferFrom', async function () {
            const { dai } = await loadFixture(deployContractsAndInit);

            await dai.connect(addr1).approve(await addr.getAddress(), '2');
            await dai.transferFrom(await addr1.getAddress(), await addr.getAddress(), '1');
        });

        it('should not swap with bad signature', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const { order, signature } = await getSignedOrder(addr, {
                makerAsset: await dai.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '1',
                takingAmount: '1',
                maker: await addr.getAddress(),
            }, {
                chainId, verifyingContract: await swap.getAddress(),
            });

            const facade = getOrderFacade(await swap.getAddress(), chainId, addr1)

            const calldata = facade.fillLimitOrder({
                order: order.order,
                amount: '1',
                signature,
                takerTraits: fillWithMakingAmount(BigInt(1))
            });

            const tx = await addr1.sendTransaction({
                to: await swap.getAddress(),
                data: calldata
            });

            await tx.wait();

            const makerDai = await dai.balanceOf(await addr.getAddress());
            const takerDai = await dai.balanceOf(await addr1.getAddress());
            const makerWeth = await weth.balanceOf(await addr.getAddress());
            const takerWeth = await weth.balanceOf(await addr1.getAddress());
            expect(makerDai.toString()).to.equal('999999999999999999999999')
            expect(takerDai.toString()).to.equal('1000000000000000000000001')
            expect(makerWeth.toString()).to.equal('100000000000000000001')
            expect(takerWeth.toString()).to.equal('99999999999999999999')
        });

        it('should fill when not expired', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const { order, signature } = await getSignedOrder(addr1, {
                makerAsset: await dai.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '1',
                takingAmount: '1',
                maker: await addr1.getAddress(),
                makerTraits: LimitOrderBuilder.buildMakerTraits({
                    expiry: getCurrentTime() + 3600
                }),
            }, {
                chainId, verifyingContract: await swap.getAddress(),
            });

            const facade = getOrderFacade(await swap.getAddress(), chainId, addr)

            const calldata = facade.fillLimitOrder({
                order: order.order,
                amount: '1',
                signature,
                takerTraits: fillWithMakingAmount(BigInt(1))
            });

            const tx = await addr.sendTransaction({
                to: await swap.getAddress(),
                data: calldata
            });

            await tx.wait();

            const makerDai = await dai.balanceOf(await addr1.getAddress());
            const takerDai = await dai.balanceOf(await addr.getAddress());
            const makerWeth = await weth.balanceOf(await addr1.getAddress());
            const takerWeth = await weth.balanceOf(await addr.getAddress());

            expect(makerDai.toString()).to.equal('999999999999999999999999')
            expect(takerDai.toString()).to.equal('1000000000000000000000001')
            expect(makerWeth.toString()).to.equal('100000000000000000001')
            expect(takerWeth.toString()).to.equal('99999999999999999999')
        });

        it('remainingInvalidatorForOrder should return correct remaining', async () => {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const { signature, order, orderHash } = await getSignedOrder(addr1, {
                makerAsset: await dai.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '3',
                takingAmount: '3',
                maker: await addr1.getAddress(),
            }, { chainId, verifyingContract: await swap.getAddress() });

            await expect(getFacadeViewCall('remainingInvalidatorForOrder', [
                await addr1.getAddress(),
                orderHash,
            ], addr, chainId, swap)).to.be.revertedWithCustomError(swap, 'RemainingInvalidatedOrder');

            await getFacadeTx('fillLimitOrder', [{
                order: order.order,
                signature,
                amount: '1',
                takerTraits: fillWithMakingAmount(BigInt(1))
            }], addr, chainId, swap);

            const remainingAmount = await getFacadeViewCall('remainingInvalidatorForOrder', [
                await addr1.getAddress(),
                orderHash,
            ], addr, chainId, swap);

            expect(remainingAmount).to.equal(BigInt(2));

            await getFacadeTx('fillLimitOrder', [{
                order: order.order,
                signature,
                amount: '2',
                takerTraits: fillWithMakingAmount(BigInt(2))
            }], addr, chainId, swap);

            const remainingAfterFullFill = await getFacadeViewCall('remainingInvalidatorForOrder', [
                await addr1.getAddress(),
                orderHash,
            ], addr, chainId, swap);

            expect(remainingAfterFullFill).to.equal(BigInt(0));
        });

        it('remaining with makerAmount', async () => {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const { signature, order, orderHash } = await getSignedOrder(addr1, {
                makerAsset: await dai.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '3',
                takingAmount: '3',
                maker: await addr1.getAddress(),
            }, { chainId, verifyingContract: await swap.getAddress() });

            await expect(getFacadeViewCall('remainingInvalidatorForOrder', [
                await addr1.getAddress(),
                orderHash,
            ], addr, chainId, swap)).to.be.revertedWithCustomError(swap, 'RemainingInvalidatedOrder');

            await getFacadeTx('fillLimitOrder', [{
                order: order.order,
                signature,
                amount: '1',
                takerTraits: fillWithMakingAmount(BigInt(1))
            }], addr, chainId, swap);

            const remainingAmount = await getFacadeViewCall('remainingInvalidatorForOrder', [
                await addr1.getAddress(),
                orderHash,
            ], addr, chainId, swap);

            expect(remainingAmount).to.equal(BigInt(2));

            await getFacadeTx('fillLimitOrder', [{
                order: order.order,
                signature,
                amount: '2',
                takerTraits: fillWithMakingAmount(BigInt(2))
            }], addr, chainId, swap);

            const remainingAfterFullFill = await getFacadeViewCall('remainingInvalidatorForOrder', [
                await addr1.getAddress(),
                orderHash,
            ], addr, chainId, swap);

            expect(remainingAfterFullFill).to.equal(BigInt(0));
        });

        it('should not fill when expired', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);


            const { order, signature } = await getSignedOrder(addr1,{
                makerAsset: await dai.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '1',
                takingAmount: '1',
                maker: await addr1.getAddress(),
                makerTraits: LimitOrderBuilder.buildMakerTraits({ expiry: 0xff0000 }),
            }, { chainId, verifyingContract: await swap.getAddress() });

            const facade = getOrderFacade(await swap.getAddress(), chainId, addr);

            const calldata = facade.fillLimitOrder({
                order: order.order,
                amount: '1',
                signature,
                takerTraits: fillWithMakingAmount(BigInt(1))
            });

            await expect(addr.sendTransaction({
                to: await swap.getAddress(),
                data: calldata
            })).to.be.revertedWithCustomError(swap, 'OrderExpired');
        });
    })

    describe('Private Orders', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            await initContracts(dai, weth, swap);
            return { dai, weth, swap, chainId };
        };

        it('should fill with correct taker', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const { order, signature } = await getSignedOrder(addr1, {
                makerAsset: await dai.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '1',
                takingAmount: '1',
                maker: await addr1.getAddress(),
                makerTraits: LimitOrderBuilder.buildMakerTraits({ allowedSender: await addr.getAddress() }),
            }, { chainId, verifyingContract: await swap.getAddress() });


            const fillTx = await getFacadeTx('fillLimitOrder', [{
                order: order.order,
                signature,
                amount: '1',
                takerTraits: fillWithMakingAmount(BigInt(1))
            }], addr, chainId, swap);

            await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
            await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
        });
    });

    describe('orderHash should return correct hash', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            await initContracts(dai, weth, swap);
            return { dai, weth, swap, chainId };
        };

        it('should fill with correct taker', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const { order, orderHash } = await getSignedOrder(addr1, {
                makerAsset: await addr.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '1',
                takingAmount: '1',
                maker: await addr1.getAddress(),
                makerTraits: LimitOrderBuilder.buildMakerTraits({ allowedSender: await addr.getAddress() }),
            }, { chainId, verifyingContract: await swap.getAddress() });


            const orderHashFromViewCall = await getFacadeViewCall('orderHash', [
                order.order
            ], addr, chainId, swap);

            expect(orderHash).to.equal(orderHashFromViewCall);
        });
    });

    describe('Order Cancelation', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            await initContracts(dai, weth, swap);
            return { dai, weth, swap, chainId };
        };

        const orderCancelationInit = async function () {
            const { dai, weth, swap, chainId } = await deployContractsAndInit();
            const { order, orderHash, signature } = await getSignedOrder(addr1, {
                makerAsset: await addr.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '1',
                takingAmount: '1',
                maker: await addr1.getAddress(),
                makerTraits: LimitOrderBuilder.buildMakerTraits({ allowMultipleFills: true }),
            }, { chainId, verifyingContract: await swap.getAddress() });
            return { dai, weth, swap, chainId, order, orderHash, signature };
        };

        const orderWithEpochInit = async function () {
            const { dai, weth, swap, chainId } = await deployContractsAndInit();

            const { order, orderHash, signature } = await getSignedOrder(addr1,{
                makerAsset: await addr.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '2',
                takingAmount: '2',
                maker: await addr1.getAddress(),
                makerTraits: LimitOrderBuilder.buildMakerTraits({
                    allowMultipleFills: true,
                    shouldCheckEpoch: true,
                    nonce: BigInt(0),
                    series: BigInt(1),
                }),
            }, { chainId, verifyingContract: await swap.getAddress() });
            return { dai, weth, swap, chainId, order, orderHash, signature };
        };

        it('should cancel own order', async function () {
            const { swap, chainId, order, orderHash } = await loadFixture(orderCancelationInit);

            await getFacadeTx(
                'cancelLimitOrder',
                [order.order.makerTraits, orderHash],
                addr1,
                chainId,
                swap,
            );

            const result = await getFacadeViewCall(
                'remainingInvalidatorForOrder',
                [await addr1.getAddress(), orderHash],
                addr,
                chainId,
                swap,
            );

            expect(result).to.equal(BigInt(0))
        });


        it('epoch change, order should fail', async function () {
            const { swap, chainId, order, signature } = await loadFixture(orderWithEpochInit);

            await getFacadeTx(
                'increaseEpoch', [BigInt(1)], addr1, chainId, swap
            );

            await getFacadeViewCall('epoch', [
                await addr1.getAddress(),
                BigInt(1),
            ], addr1, chainId, swap);

            const fillTx = getFacadeTx(
                'fillLimitOrder',
                [{
                    order: order.order,
                    signature,
                    amount: '2',
                    takerTraits: fillWithMakingAmount(BigInt(2))
                }], addr, chainId, swap);

            await expect(fillTx).to.be.revertedWithCustomError(swap, 'WrongSeriesNonce')
        });

        it('advance nonce', async function () {
            const { swap, chainId } = await loadFixture(deployContractsAndInit);

            await getFacadeTx(
                'increaseEpoch',
                [BigInt(0)],
                addr,
                chainId,
                swap
            );

            const epochViewCall = await getFacadeViewCall(
                'epoch', [await addr.getAddress(), BigInt(0)], addr, chainId, swap,
            );

            expect(epochViewCall).to.equal(epochViewCall);
        });

    });

    describe('MakerTraits', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            await initContracts(dai, weth, swap);
            return { dai, weth, swap, chainId };
        };

        it('disallow multiple fills', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);
            // Order: 10 DAI => 2 WETH
            // Swap:  4 DAI => 1 WETH

            const { order, signature } = await getSignedOrder(addr1, {
                makerAsset: await dai.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '10',
                takingAmount: '2',
                maker: await addr1.getAddress(),
                makerTraits: LimitOrderBuilder.buildMakerTraits({ allowMultipleFills: false }),
            }, { chainId, verifyingContract: await swap.getAddress() });

            const fillTx = await getFacadeTx(
                'fillLimitOrder',
                [{
                    order: order.order,
                    amount: '4',
                    takerTraits: fillWithMakingAmount(BigInt(1)),
                    signature,
                }],
                addr,
                chainId,
                swap
            )

            await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [4, -4]);
            await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);

            const secondFillTx = getFacadeTx(
                'fillLimitOrder',
                [{
                    order: order.order,
                    amount: '4',
                    takerTraits: fillWithMakingAmount(BigInt(1)),
                    signature,
                }],
                addr,
                chainId,
                swap
            )

            await expect(secondFillTx)
                .to.be.revertedWithCustomError(swap, 'BitInvalidatedOrder');
        });

        it('unwrap weth for maker', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);
            // Order: 10 DAI => 2 WETH
            // Swap:  10 DAI => 2 ETH

            const { order, signature } = await getSignedOrder(addr1, {
                makerAsset: await dai.getAddress(),
                takerAsset: await weth.getAddress(),
                makingAmount: '10',
                takingAmount: '2',
                maker: await addr1.getAddress(),
                makerTraits: LimitOrderBuilder.buildMakerTraits({ unwrapWeth: true }),
            }, { chainId, verifyingContract: await swap.getAddress() });

            const fillTx = await getFacadeTx(
        'fillLimitOrder',
                [{
                    order: order.order,
                    amount: '10',
                    signature,
                    takerTraits: fillWithMakingAmount(BigInt(2))
                }],
                addr,
                chainId,
                swap,
            )

            await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [10, -10]);
            await expect(fillTx).to.changeTokenBalance(weth, addr, -2);
            await expect(fillTx).to.changeEtherBalance(addr1, 2);
        });
    });

    describe('Predicate', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            const { arbitraryPredicate } = await deployArbitraryPredicate();
            await initContracts(dai, weth, swap);
            return { dai, weth, swap, chainId, arbitraryPredicate };
        };


        it('checkPredicate should return true ', async function () {
            const {  swap, chainId, arbitraryPredicate } = await loadFixture(deployContractsAndInit);

            const predicateBuilder = getPredicateBuilder(
                await swap.getAddress(), chainId, addr1
            )

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                await arbitraryPredicate.getAddress(),
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const predicate = predicateBuilder.lt(
                '10',
                arbitraryCalldata,
            )

            const isPredicateValid = await getFacadeViewCall(
                'checkPredicate', [predicate], addr, chainId, swap
            );

            expect(isPredicateValid).to.true;
        });

        it('arbitrary call predicate should pass', async function () {
            const { dai, weth, swap, chainId, arbitraryPredicate } = await loadFixture(deployContractsAndInit);

            const predicateBuilder = getPredicateBuilder(
                await swap.getAddress(), chainId, addr1
            );

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                await arbitraryPredicate.getAddress(),
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const predicate = predicateBuilder.lt(
                '10',
                arbitraryCalldata,
            );

            const { order, signature} = await getSignedOrder(addr1,
                {
                    makerAsset: await dai.getAddress(),
                    takerAsset: await weth.getAddress(),
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: await addr1.getAddress(),
                },
                {
                    chainId,
                    verifyingContract: await swap.getAddress(),
                },
                {
                    predicate,
                },
            );

            const { traits, args } = buildTakerTraits({
                minReturn: BigInt(1),
                extension: order.extension,
            });
            const tx = await getFacadeTx('fillLimitOrderArgs', [
                {
                    order: order.order,
                    amount: '1',
                    signature,
                    takerTraits: traits.toString(),
                    args,
                }
            ], addr, chainId, swap);

            await tx.wait();

            await expect(tx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
            await expect(tx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
        });

        it('arbitrary call predicate should fail', async function () {
            const { weth, swap, chainId, arbitraryPredicate } = await loadFixture(deployContractsAndInit);

            const predicateBuilder = getPredicateBuilder(
                await swap.getAddress(), chainId, addr1
            );

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                await arbitraryPredicate.getAddress(),
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const predicate = predicateBuilder.gt(
                '10',
                arbitraryCalldata,
            );

            const { order, signature } = await getSignedOrder(addr1,
                {
                    makerAsset: await addr.getAddress(),
                    takerAsset: await weth.getAddress(),
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: await addr1.getAddress(),
                },
                {
                    chainId,
                    verifyingContract: await swap.getAddress(),
                },
                {
                    predicate,
                },
            );

            const { traits, args } = buildTakerTraits({
                threshold: BigInt(1),
                extension: order.extension,
            });
            const tx = getFacadeTx('fillLimitOrderArgs', [{
                order: order.order,
                amount: '1',
                signature,
                takerTraits: traits.toString(),
                args,
            }], addr, chainId, swap);

            await expect(tx).to.be.revertedWithCustomError(swap, 'PredicateIsNotTrue');
        });

        it('`or` should pass', async function () {
            const { dai, weth, swap, chainId, arbitraryPredicate } = await loadFixture(deployContractsAndInit);

            const predicateBuilder = getPredicateBuilder(
                await swap.getAddress(), chainId, addr1
            );

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                await arbitraryPredicate.getAddress(),
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const comparelt = predicateBuilder.lt('15', arbitraryCalldata);
            const comparegt = predicateBuilder.gt('5', arbitraryCalldata);

            const predicate = predicateBuilder.or(comparelt, comparegt);

            const { order, signature } = await getSignedOrder(addr1,
                {
                    makerAsset: await dai.getAddress(),
                    takerAsset: await weth.getAddress(),
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: await addr1.getAddress(),
                },
                {
                    chainId, verifyingContract: await swap.getAddress(),
                },
                {
                    predicate,
                },
            );

            const { traits, args } = buildTakerTraits({
                minReturn: BigInt(1),
                extension: order.extension,
            });
            const fillTx = await getFacadeTx('fillLimitOrderArgs', [{
                order: order.order,
                signature,
                amount: '1',
                takerTraits: traits.toString(),
                args: args,
            }], addr, chainId, swap);
            await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
            await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
        });

        it('`and` should pass', async function () {
            const { dai, weth, swap, chainId, arbitraryPredicate } = await loadFixture(deployContractsAndInit);

            const predicateBuilder = getPredicateBuilder(
                await swap.getAddress(), chainId, addr1
            );

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                await arbitraryPredicate.getAddress(),
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const comparelt = predicateBuilder.lt('15', arbitraryCalldata);
            const comparegt = predicateBuilder.gt('5', arbitraryCalldata);

            const predicate = predicateBuilder.or(comparelt, comparegt);

            const { order, signature } = await getSignedOrder(addr1,
                {
                    makerAsset: await dai.getAddress(),
                    takerAsset: await weth.getAddress(),
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: await addr1.getAddress(),
                },
                {
                    chainId, verifyingContract: await swap.getAddress(),
                },
                {
                    predicate,
                },
            );

            const { traits, args } = buildTakerTraits({
                minReturn: BigInt(1),
                extension: order.extension,
            });
            const fillTx = await getFacadeTx('fillLimitOrderArgs', [{
                order: order.order,
                signature,
                takerTraits: traits.toString(),
                args: args,
                amount: '1',
            }], addr, chainId, swap);

            await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
            await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
        });
    });

    describe('Predicate with permit', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            const { arbitraryPredicate } = await deployArbitraryPredicate();
            await initContracts(dai, weth, swap);
            return { dai, weth, swap, chainId, arbitraryPredicate };
        };

        it('arbitrary call predicate with maker permit should pass', async function () {
            const { dai, weth, swap, chainId, arbitraryPredicate } = await loadFixture(deployContractsAndInit);

            const predicateBuilder = getPredicateBuilder(
                await swap.getAddress(), chainId, addr
            )

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                await arbitraryPredicate.getAddress(),
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const predicate = predicateBuilder.lt(
                '10',
                arbitraryCalldata,
            )

            const permit = withTarget(
                await weth.getAddress(),
                await getPermit(await addr.getAddress(), addr, weth, '1', chainId, await swap.getAddress(), '1'),
            );

            const {order, signature } = await getSignedOrder(addr,
                {
                    makerAsset: await weth.getAddress(),
                    takerAsset: await dai.getAddress(),
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: await addr.getAddress(),
                },{
                    chainId, verifyingContract: await swap.getAddress(),
                },
                {
                    predicate,
                    permit
                },
            );

            const { traits, args } = buildTakerTraits({
                minReturn: BigInt(1),
                extension: order.extension,
            });
            const fillTx = await getFacadeTx('fillLimitOrderArgs', [{
                order: order.order,
                amount: '1',
                signature,
                takerTraits: traits.toString(),
                args,
            }], addr1, chainId, swap);

            await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
            await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
        });
    })

    describe('Permit', function () {
        describe('Taker Permit', function () {
            const deployContractsAndInitPermit = async function () {
                const { dai, weth, swap, chainId } = await deploySwapTokens();
                await initContracts(dai, weth, swap);

                const {order, signature } = await getSignedOrder(addr1,{
                    makerAsset: await dai.getAddress(),
                    takerAsset: await weth.getAddress(),
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: await addr1.getAddress(),
                }, {
                    chainId, verifyingContract: await swap.getAddress(),
                });
                await weth.approve(await swap.getAddress(), '0');

                return { dai, weth, swap, chainId, order, signature };
            };

            it('DAI => WETH', async function () {
                const { dai, weth, swap, chainId, order, signature } = await loadFixture(deployContractsAndInitPermit);

                const permit = await getPermit(await addr.getAddress(), addr, weth, '1', chainId, await swap.getAddress(), '1');

                const { traits, args } = buildTakerTraits({
                    makingAmount: true,
                    minReturn: BigInt(1),
                });
                const fillTx = await getFacadeTx('permitAndCall', [{
                    order: order.order,
                    signature,
                    amount: '1',
                    takerTraits: traits.toString(),
                    args,
                    permit,
                    interaction: ZX,
                    target: await addr.getAddress(),
                    permitToken: await weth.getAddress(),
                }], addr, chainId, swap);

                expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
                expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
            });

            it('DAI => WETH, permit2', async function () {
                const { dai, weth, swap, chainId, order, signature } = await loadFixture(deployContractsAndInitPermit);

                const permit2 = await permit2Contract();
                await weth.approve(await permit2.getAddress(), 1);
                const permit = await getPermit2(addr, await weth.getAddress(), chainId, await swap.getAddress(), BigInt(1));

                const { traits, args } = buildTakerTraits({
                    makingAmount: true,
                    usePermit2: true,
                    minReturn: BigInt(1),
                });
                const fillTx = await getFacadeTx('permitAndCall', [{
                    order: order.order,
                    signature,
                    amount: '1',
                    takerTraits: traits.toString(),
                    args,
                    permit,
                    interaction: ZX,
                    target: await addr.getAddress(),
                    permitToken: await dai.getAddress(),
                }], addr, chainId, swap);

                await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
                await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
            });
        });

        describe('maker permit', function () {
            const deployContractsAndInitPermit = async function () {
                const { dai, weth, swap, chainId } = await deploySwapTokens();
                await initContracts(dai, weth, swap);

                const permit = withTarget(
                    await weth.getAddress(),
                    await getPermit(await addr.getAddress(), addr, weth, '1', chainId, await swap.getAddress(), '1'),
                );

                const {order, signature } = await getSignedOrder(addr,
                    {
                        makerAsset: await weth.getAddress(),
                        takerAsset: await dai.getAddress(),
                        makingAmount: '1',
                        takingAmount: '1',
                        maker: await addr.getAddress(),
                    },{
                        chainId, verifyingContract: await swap.getAddress(),
                    },
                    {
                        permit,
                    },
                );

                return { dai, weth, swap, order, signature, permit, chainId };
            };

            it('maker permit works', async function () {
                const { dai, weth, swap, order, signature, chainId } = await loadFixture(deployContractsAndInitPermit);

                const { traits, args } = buildTakerTraits({
                    minReturn: BigInt(1),
                    extension: order.extension,
                });
                const fillTx = await getFacadeTx('fillLimitOrderArgs', [{
                    order: order.order,
                    amount: '1',
                    signature,
                    takerTraits: traits.toString(),
                    args,
                }], addr1, chainId, swap);

                await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
                await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
            });

            it('skips order permit flag', async function () {
                const { dai, weth, swap, order, signature, permit, chainId } = await loadFixture(deployContractsAndInitPermit);

                await addr1.sendTransaction({ to: await weth.getAddress(), data: '0xd505accf' + permit.substring(42) });

                const { traits, args } = buildTakerTraits({
                    minReturn: BigInt(1),
                    skipMakerPermit: true,
                    extension: order.extension,
                });
                const fillTx = await getFacadeTx('fillLimitOrderArgs', [{
                    order: order.order,
                    amount: '1',
                    signature,
                    takerTraits: traits.toString(),
                    args,
                }], addr1, chainId, swap);
                await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
                await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
            });
        });
    });
});
