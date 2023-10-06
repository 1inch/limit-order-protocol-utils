import {
    compactSignature,
    fillWithMakingAmount,
    getFacadeTx,
    getFacadeViewCall,
    getOrderFacade,
    getPredicateBuilder,
    getSignedOrder,
    skipMakerPermit,
} from './helpers/utils';
import { ether } from './helpers/utils';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployArbitraryPredicate, deploySwapTokens } from './helpers/fixtures';
import { ethers } from 'hardhat'
import { expect } from 'chai';
import {getPermit} from "./helpers/eip712";
import {getPermit2, permit2Contract, withTarget, } from "@1inch/solidity-utils";
import {LimitOrderBuilder} from "../../limit-order.builder";
import {ZX} from "../../limit-order-protocol.const";
import {
    SignerWithAddress,
} from "@1inch/solidity-utils/node_modules/@nomiclabs/hardhat-ethers/signers";

const getCurrentTime = () => Math.floor(Date.now() / 1000);

describe('LimitOrderProtocol',  () => {
    let addr: SignerWithAddress, addr1: SignerWithAddress;

    beforeEach(async function () {
        [addr, addr1] = await ethers.getSigners();
    });

    async function initContracts(dai, weth, swap) {
        await dai.mint(addr1.address, ether('1000000'));
        await dai.mint(addr.address, ether('1000000'));
        await weth.deposit({ value: ether('100') });
        await weth.connect(addr1).deposit({ value: ether('100') });
        await dai.approve(swap.address, ether('1000000'));
        await dai.connect(addr1).approve(swap.address, ether('1000000'));
        await weth.approve(swap.address, ether('100'));
        await weth.connect(addr1).approve(swap.address, ether('100'));
    }

    describe('wip', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            await initContracts(dai, weth, swap);
            return { dai, weth, swap, chainId };
        };

        it('transferFrom', async function () {
            const { dai } = await loadFixture(deployContractsAndInit);

            await dai.connect(addr1).approve(addr.address, '2');
            await dai.transferFrom(addr1.address, addr.address, '1');
        });

        it('should not swap with bad signature', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const { order, signature } = await getSignedOrder(addr, {
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '1',
                takingAmount: '1',
                maker: addr.address,
            }, {
                chainId, verifyingContract: swap.address,
            });

            const facade = getOrderFacade(swap.address, chainId, addr1)

            const calldata = facade.fillLimitOrder({
                order: order.order,
                amount: '1',
                signature,
                takerTraits: fillWithMakingAmount(BigInt(1))
            });

            const tx = await addr1.sendTransaction({
                to: swap.address,
                data: calldata
            });

            await tx.wait();

            const makerDai = await dai.balanceOf(addr.address);
            const takerDai = await dai.balanceOf(addr1.address);
            const makerWeth = await weth.balanceOf(addr.address);
            const takerWeth = await weth.balanceOf(addr1.address);
            expect(makerDai.toString()).to.equal('999999999999999999999999')
            expect(takerDai.toString()).to.equal('1000000000000000000000001')
            expect(makerWeth.toString()).to.equal('100000000000000000001')
            expect(takerWeth.toString()).to.equal('99999999999999999999')
        });

        it('should fill when not expired', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const { order, signature } = await getSignedOrder(addr1, {
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '1',
                takingAmount: '1',
                maker: addr1.address,
                makerTraits: LimitOrderBuilder.buildMakerTraits({
                    expiry: getCurrentTime() + 3600
                }),
            }, {
                chainId, verifyingContract: swap.address,
            });

            const facade = getOrderFacade(swap.address, chainId, addr)

            const calldata = facade.fillLimitOrder({
                order: order.order,
                amount: '1',
                signature,
                takerTraits: fillWithMakingAmount(BigInt(1))
            });

            const tx = await addr.sendTransaction({
                to: swap.address,
                data: calldata
            });

            await tx.wait();

            const makerDai = await dai.balanceOf(addr1.address);
            const takerDai = await dai.balanceOf(addr.address);
            const makerWeth = await weth.balanceOf(addr1.address);
            const takerWeth = await weth.balanceOf(addr.address);

            expect(makerDai.toString()).to.equal('999999999999999999999999')
            expect(takerDai.toString()).to.equal('1000000000000000000000001')
            expect(makerWeth.toString()).to.equal('100000000000000000001')
            expect(takerWeth.toString()).to.equal('99999999999999999999')
        });

        it('remainingInvalidatorForOrder should return correct remaining', async () => {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const { signature, order, orderHash } = await getSignedOrder(addr1, {
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '3',
                takingAmount: '3',
                maker: addr1.address,
            }, { chainId, verifyingContract: swap.address });

            const beforeFillRemaining = await getFacadeViewCall('remainingInvalidatorForOrder', [
                addr1.address,
                orderHash,
            ], addr, chainId, swap)

            // aa3eef95 - is a decoded RemainingInvalidatedOrder error
            expect(beforeFillRemaining).to.equal(BigInt('0xaa3eef95'))

            await getFacadeTx('fillLimitOrder', {
                order: order.order,
                signature,
                amount: '1',
                takerTraits: fillWithMakingAmount(BigInt(1))
            }, addr, chainId, swap);

            const remainingAmount = await getFacadeViewCall('remainingInvalidatorForOrder', [
                addr1.address,
                orderHash,
            ], addr, chainId, swap);

            expect(remainingAmount).to.equal(BigInt(2));

            await getFacadeTx('fillLimitOrder', {
                order: order.order,
                signature,
                amount: '2',
                takerTraits: fillWithMakingAmount(BigInt(2))
            }, addr, chainId, swap);

            const remainingAfterFullFill = await getFacadeViewCall('remainingInvalidatorForOrder', [
                addr1.address,
                orderHash,
            ], addr, chainId, swap);

            expect(remainingAfterFullFill).to.equal(BigInt(0));
        });

        it('remaining with makerAmount', async () => {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const { signature, order, orderHash } = await getSignedOrder(addr1, {
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '3',
                takingAmount: '3',
                maker: addr1.address,
            }, { chainId, verifyingContract: swap.address });

            const beforeFillRemaining = await getFacadeViewCall('remainingInvalidatorForOrder', [
                addr1.address,
                orderHash,
            ], addr, chainId, swap);

            // aa3eef95 - is a decoded RemainingInvalidatedOrder error
            expect(beforeFillRemaining).to.equal(BigInt('0xaa3eef95'))

            await getFacadeTx('fillLimitOrder', {
                order: order.order,
                signature,
                amount: '1',
                takerTraits: fillWithMakingAmount(BigInt(1))
            }, addr, chainId, swap);

            const remainingAmount = await getFacadeViewCall('remainingInvalidatorForOrder', [
                addr1.address,
                orderHash,
            ], addr, chainId, swap);

            expect(remainingAmount).to.equal(BigInt(2));

            await getFacadeTx('fillLimitOrder', {
                order: order.order,
                signature,
                amount: '2',
                takerTraits: fillWithMakingAmount(BigInt(2))
            }, addr, chainId, swap);

            const remainingAfterFullFill = await getFacadeViewCall('remainingInvalidatorForOrder', [
                addr1.address,
                orderHash,
            ], addr, chainId, swap);

            expect(remainingAfterFullFill).to.equal(BigInt(0));
        });

        it('should not fill when expired', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);


            const { order, signature } = await getSignedOrder(addr1,{
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '1',
                takingAmount: '1',
                maker: addr1.address,
                makerTraits: LimitOrderBuilder.buildMakerTraits({ expiry: 0xff0000 }),
            }, { chainId, verifyingContract: swap.address });

            const facade = getOrderFacade(swap.address, chainId, addr);

            const calldata = facade.fillLimitOrder({
                order: order.order,
                amount: '1',
                signature,
                takerTraits: fillWithMakingAmount(BigInt(1))
            });

            await expect(addr.sendTransaction({
                to: swap.address,
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
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '1',
                takingAmount: '1',
                maker: addr1.address,
                makerTraits: LimitOrderBuilder.buildMakerTraits({ allowedSender: addr.address }),
            }, { chainId, verifyingContract: swap.address });


            const fillTx = getFacadeTx('fillLimitOrder', {
                order: order.order,
                signature,
                amount: '1',
                takerTraits: fillWithMakingAmount(BigInt(1))
            }, addr, chainId, swap);

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

            const { order,, orderHash } = await getSignedOrder(addr1, {
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '1',
                takingAmount: '1',
                maker: addr1.address,
                makerTraits: LimitOrderBuilder.buildMakerTraits({ allowedSender: addr.address }),
            }, { chainId, verifyingContract: swap.address });


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
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '1',
                takingAmount: '1',
                maker: addr1.address,
                makerTraits: LimitOrderBuilder.buildMakerTraits({ allowMultipleFills: true }),
            }, { chainId, verifyingContract: swap.address });
            return { dai, weth, swap, chainId, order, orderHash, signature };
        };

        const orderWithEpochInit = async function () {
            const { dai, weth, swap, chainId } = await deployContractsAndInit();

            const { order, orderHash, signature } = await getSignedOrder(addr1,{
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '2',
                takingAmount: '2',
                maker: addr1.address,
                makerTraits: LimitOrderBuilder.buildMakerTraits({
                    allowMultipleFills: true,
                    shouldCheckEpoch: true,
                    nonce: BigInt(0),
                    series: BigInt(1),
                }),
            }, { chainId, verifyingContract: swap.address });
            return { dai, weth, swap, chainId, order, orderHash, signature };
        };

        it('should cancel own order', async function () {
            const { swap, chainId, order, orderHash } = await loadFixture(orderCancelationInit);
            const orderFacade = getOrderFacade(swap.address, chainId, addr1);

            const calldata = orderFacade.cancelLimitOrder(order.order.makerTraits, orderHash);
            await addr1.sendTransaction({
                to: swap.address,
                data: calldata
            });

            const result = await getFacadeViewCall(
                'remainingInvalidatorForOrder',
                [addr1.address, orderHash],
                addr,
                chainId,
                swap,
            );

            expect(result).to.equal(BigInt(0))
        });


        it('epoch change, order should fail', async function () {
            const { swap, chainId, order, signature } = await loadFixture(orderWithEpochInit);

            await getFacadeTx(
                'increaseEpoch', BigInt(1), addr1, chainId, swap
            );

            await getFacadeViewCall('epoch', [
                addr1.address,
                BigInt(1),
            ], addr1, chainId, swap);

            const fillTx = getFacadeTx(
                'fillLimitOrder',
                {
                    order: order.order,
                    signature,
                    amount: '2',
                    takerTraits: fillWithMakingAmount(BigInt(2))
                }, addr, chainId, swap);

            await expect(fillTx).to.be.revertedWithCustomError(swap, 'WrongSeriesNonce')
        });

        it('advance nonce', async function () {
            const { swap, chainId } = await loadFixture(deployContractsAndInit);

            await getFacadeTx(
                'increaseEpoch',
                0,
                addr,
                chainId,
                swap
            );

            const epochViewCall = await getFacadeViewCall(
                'epoch', [addr.address, BigInt(0)], addr, chainId, swap,
            );

            expect(epochViewCall).to.equal(epochViewCall);
        });

    });

    describe('MakerTraits', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            await initContracts(dai, weth, swap);
            const TakerIncreaser = await ethers.getContractFactory('TakerIncreaser');
            const takerIncreaser = await TakerIncreaser.deploy();
            return { dai, weth, swap, chainId, takerIncreaser };
        };

        it('disallow multiple fills', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);
            // Order: 10 DAI => 2 WETH
            // Swap:  4 DAI => 1 WETH

            const { order, signature } = await getSignedOrder(addr1, {
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '10',
                takingAmount: '2',
                maker: addr1.address,
                makerTraits: LimitOrderBuilder.buildMakerTraits({ allowMultipleFills: false }),
            }, { chainId, verifyingContract: swap.address });

            const fillTx = getFacadeTx(
                'fillLimitOrder',
                {
                    order: order.order,
                    amount: '4',
                    takerTraits: fillWithMakingAmount(BigInt(1)),
                    signature,
                },
                addr,
                chainId,
                swap
            )

            await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [4, -4]);
            await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);

            const secondFillTx = getFacadeTx(
                'fillLimitOrder',
                {
                    order: order.order,
                    amount: '4',
                    takerTraits: fillWithMakingAmount(BigInt(1)),
                    signature,
                },
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
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '10',
                takingAmount: '2',
                maker: addr1.address,
                makerTraits: LimitOrderBuilder.buildMakerTraits({ unwrapWeth: true }),
            }, { chainId, verifyingContract: swap.address });

            const fillTx = getFacadeTx(
        'fillLimitOrder',
                {
                    order: order.order,
                    amount: '10',
                    signature,
                    takerTraits: fillWithMakingAmount(BigInt(2))
                },
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
                swap.address, chainId, addr1
            )

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                arbitraryPredicate.address,
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
                swap.address, chainId, addr1
            );

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                arbitraryPredicate.address,
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const predicate = predicateBuilder.lt(
                '10',
                arbitraryCalldata,
            );

            const { order, signature} = await getSignedOrder(addr1,
                {
                    makerAsset: dai.address,
                    takerAsset: weth.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr1.address,
                },
                {
                    chainId,
                    verifyingContract: swap.address,
                },
                {
                    predicate,
                },
            );

            const tx = await getFacadeTx('fillLimitOrderExt', {
                order: order.order,
                amount: '1',
                signature,
                takerTraits: '1',
                extension: order.extension,
            }, addr, chainId, swap);

            await tx.wait();

            await expect(tx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
            await expect(tx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
        });

        it('arbitrary call predicate should fail', async function () {
            const { dai, weth, swap, chainId, arbitraryPredicate } = await loadFixture(deployContractsAndInit);

            const predicateBuilder = getPredicateBuilder(
                swap.address, chainId, addr1
            );

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                arbitraryPredicate.address,
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const predicate = predicateBuilder.gt(
                '10',
                arbitraryCalldata,
            );

            const { order, signature } = await getSignedOrder(addr1,
                {
                    makerAsset: dai.address,
                    takerAsset: weth.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr1.address,
                },
                {
                    chainId,
                    verifyingContract: swap.address,
                },
                {
                    predicate,
                },
            );

            const tx = getFacadeTx('fillLimitOrderExt', {
                order: order.order,
                amount: '1',
                signature,
                takerTraits: '1',
                extension: order.extension,
            }, addr, chainId, swap);

            await expect(tx).to.be.revertedWithCustomError(swap, 'PredicateIsNotTrue');
        });

        it('`or` should pass', async function () {
            const { dai, weth, swap, chainId, arbitraryPredicate } = await loadFixture(deployContractsAndInit);

            const predicateBuilder = getPredicateBuilder(
                swap.address, chainId, addr1
            );

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                arbitraryPredicate.address,
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const comparelt = predicateBuilder.lt('15', arbitraryCalldata);
            const comparegt = predicateBuilder.gt('5', arbitraryCalldata);

            const predicate = predicateBuilder.or(comparelt, comparegt);

            const { order, signature } = await getSignedOrder(addr1,
                {
                    makerAsset: dai.address,
                    takerAsset: weth.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr1.address,
                },
                {
                    chainId, verifyingContract: swap.address,
                },
                {
                    predicate,
                },
            );

            const fillTx = getFacadeTx('fillLimitOrderExt', {
                order: order.order,
                signature,
                extension: order.extension,
                amount: '1',
                takerTraits: '1'
            }, addr, chainId, swap);
            await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
            await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
        });

        it('`and` should pass', async function () {
            const { dai, weth, swap, chainId, arbitraryPredicate } = await loadFixture(deployContractsAndInit);

            const predicateBuilder = getPredicateBuilder(
                swap.address, chainId, addr1
            );

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                arbitraryPredicate.address,
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const comparelt = predicateBuilder.lt('15', arbitraryCalldata);
            const comparegt = predicateBuilder.gt('5', arbitraryCalldata);

            const predicate = predicateBuilder.or(comparelt, comparegt);

            const { order, signature } = await getSignedOrder(addr1,
                {
                    makerAsset: dai.address,
                    takerAsset: weth.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr1.address,
                },
                {
                    chainId, verifyingContract: swap.address,
                },
                {
                    predicate,
                },
            );

            const fillTx = await getFacadeTx('fillLimitOrderExt', {
                order: order.order,
                signature,
                extension: order.extension,
                amount: '1',
                takerTraits: '1'
            }, addr, chainId, swap);

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
                swap.address, chainId, addr
            )

            const arbitraryCalldata = predicateBuilder.arbitraryStaticCall(
                arbitraryPredicate.address,
                arbitraryPredicate.interface.encodeFunctionData('copyArg', [1]),
            );

            const predicate = predicateBuilder.lt(
                '10',
                arbitraryCalldata,
            )

            const permit = withTarget(
                weth.address,
                await getPermit(addr.address, addr, weth, '1', chainId, swap.address, '1'),
            );

            const {order, signature } = await getSignedOrder(addr,
                {
                    makerAsset: weth.address,
                    takerAsset: dai.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr.address,
                },{
                    chainId, verifyingContract: swap.address,
                },
                {
                    predicate,
                    permit
                },
            );

            const fillTx = await getFacadeTx('fillLimitOrderExt', {
                order: order.order,
                amount: '1',
                signature,
                takerTraits: fillWithMakingAmount(BigInt(1)),
                extension: order.extension,
            }, addr1, chainId, swap);

            await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
            await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
        });
    })

    describe('Permit', function () {
        describe('fillOrderToWithPermit', function () {
            const deployContractsAndInitPermit = async function () {
                const { dai, weth, swap, chainId } = await deploySwapTokens();
                await initContracts(dai, weth, swap);

                const {order, signature } = await getSignedOrder(addr1,{
                    makerAsset: dai.address,
                    takerAsset: weth.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr1.address,
                }, {
                    chainId, verifyingContract: swap.address,
                });

                return { dai, weth, swap, chainId, order, signature };
            };

            it('DAI => WETH', async function () {
                const { dai, weth, swap, chainId, order, signature } = await loadFixture(deployContractsAndInitPermit);

                const permit = await getPermit(addr.address, addr, weth, '1', chainId, swap.address, '1');

                const fillTx = await getFacadeTx('fillOrderToWithPermit', {
                    order: order.order,
                    signature,
                    amount: '1',
                    takerTraits: fillWithMakingAmount(BigInt(1)),
                    permit,
                    interaction: ZX,
                    target: addr.address,
                }, addr, chainId, swap);

                expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
                expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
            });

            it('DAI => WETH, permit2 maker', async function () {
                const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInitPermit);

                const permit2 = await permit2Contract();
                await dai.connect(addr1).approve(permit2.address, 1);
                const permit = await getPermit2(addr1, dai.address, chainId, swap.address, BigInt(1));

                const {order, signature } = await getSignedOrder(addr1, {
                    makerAsset: dai.address,
                    takerAsset: weth.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr1.address,
                    makerTraits: LimitOrderBuilder.buildMakerTraits({ usePermit2: true }),
                }, {
                    chainId, verifyingContract: swap.address,
                },);

                const fillTx = getFacadeTx('fillOrderToWithPermit', {
                    order: order.order,
                    signature,
                    amount: '1',
                    takerTraits: fillWithMakingAmount(BigInt(1)),
                    permit,
                    interaction: ZX,
                    target: addr.address,
                }, addr, chainId, swap);

                await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
                await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
            });
        });

        describe('maker permit', function () {
            const deployContractsAndInitPermit = async function () {
                const { dai, weth, swap, chainId } = await deploySwapTokens();
                await initContracts(dai, weth, swap);

                const permit = withTarget(
                    weth.address,
                    await getPermit(addr.address, addr, weth, '1', chainId, swap.address, '1'),
                );

                const {order, signature } = await getSignedOrder(addr,
                    {
                        makerAsset: weth.address,
                        takerAsset: dai.address,
                        makingAmount: '1',
                        takingAmount: '1',
                        maker: addr.address,
                    },{
                        chainId, verifyingContract: swap.address,
                    },
                    {
                        permit,
                    },
                );

                return { dai, weth, swap, order, signature, permit, chainId };
            };

            it('maker permit works', async function () {
                const { dai, weth, swap, order, signature, chainId } = await loadFixture(deployContractsAndInitPermit);

                const fillTx = getFacadeTx('fillLimitOrderExt', {
                    order: order.order,
                    extension: order.extension,
                    amount: '1',
                    takerTraits: fillWithMakingAmount(BigInt(1)),
                    signature,
                }, addr1, chainId, swap);

                await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
                await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
            });

            it('skips order permit flag', async function () {
                const { dai, weth, swap, order, signature, permit } = await loadFixture(deployContractsAndInitPermit);

                const { r, vs } = compactSignature(signature);
                await addr1.sendTransaction({ to: weth.address, data: '0xd505accf' + permit.substring(42) });
                // todo facade
                const filltx = swap.connect(addr1)
                    .fillOrderExt(
                        order.order, r, vs, 1, skipMakerPermit(BigInt(0)), order.extension
                    );
                await expect(filltx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
                await expect(filltx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
            });
        });
    });
});
