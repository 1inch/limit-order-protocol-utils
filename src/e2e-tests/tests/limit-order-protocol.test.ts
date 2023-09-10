import {
    fillWithMakingAmount,
    getOrderBuilder,
    getOrderFacade, getPredicateBuilder,
} from './helpers/utils';
import { ether } from './helpers/utils';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import {deployArbitraryPredicate, deploySwapTokens} from './helpers/fixtures';
import { ethers } from 'hardhat'
import {expect} from 'chai';
import {trim0x} from "@1inch/solidity-utils";

const getCurrentTime = () => Math.floor(Date.now() / 1000);
// todo replace from library
function joinStaticCalls (dataArray: string[]) {
    const trimmed = dataArray.map(trim0x);
    const cumulativeSum = (sum => value => { sum += value; return sum; })(0);
    return {
        offsets: trimmed
            .map(d => d.length / 2)
            .map(cumulativeSum)
            .reduce((acc, val, i) => acc | BigInt(val) << BigInt(32 * i), BigInt(0)),
        data: '0x' + trimmed.join(''),
    };
}

describe('LimitOrderProtocol',  () => {
    let addr, addr1;

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
            const builder = getOrderBuilder(swap.address, addr);

            const order = builder.buildLimitOrder({
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '1',
                takingAmount: '1',
                maker: addr.address,
            });

            const typedData = builder.buildLimitOrderTypedData(order.order, chainId, swap.address);
            const signature = await builder.buildOrderSignature(addr.address, typedData);

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
            // expect(await dai.balanceOf(addr1.address)).to.equal(makerDai.sub(1));
            expect(makerDai.toString()).to.equal('999999999999999999999999')
            expect(takerDai.toString()).to.equal('1000000000000000000000001')
            expect(makerWeth.toString()).to.equal('100000000000000000001')
            expect(takerWeth.toString()).to.equal('99999999999999999999')
        });

        it('should fill when not expired', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);
            const builder = getOrderBuilder(swap.address, addr1)

            const order = builder.buildLimitOrder({
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '1',
                takingAmount: '1',
                maker: addr1.address,
                makerTraits: builder.buildMakerTraits({
                    expiry: getCurrentTime() + 3600
                }),
            });

            const typedData = builder.buildLimitOrderTypedData(order.order, chainId, swap.address);
            const signature = await builder.buildOrderSignature(addr.address, typedData);

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

        it('should not fill when expired', async function () {
            const { dai, weth, swap, chainId } = await loadFixture(deployContractsAndInit);

            const builder = getOrderBuilder(swap.address, addr1)

            const order = builder.buildLimitOrder({
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '1',
                takingAmount: '1',
                maker: addr1.address,
                makerTraits: builder.buildMakerTraits({ expiry: 0xff0000 }),
            });

            const typedData = builder.buildLimitOrderTypedData(order.order, chainId, swap.address);
            const signature = await builder.buildOrderSignature(addr.address, typedData);

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
    });

    describe('Order Cancelation', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            await initContracts(dai, weth, swap);
            return { dai, weth, swap, chainId };
        };

        const orderCancelationInit = async function () {
            const { dai, weth, swap, chainId } = await deployContractsAndInit();
            const builder = getOrderBuilder(swap.address, addr1);
            const order = builder.buildLimitOrder({
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '1',
                takingAmount: '1',
                maker: addr1.address,
                makerTraits: builder.buildMakerTraits({ allowMultipleFills: true }),
            });
            return { dai, weth, swap, chainId, order, builder };
        };

        const orderWithEpochInit = async function () {
            const { dai, weth, swap, chainId } = await deployContractsAndInit();
            const builder = getOrderBuilder(swap.address, addr1);
            const order = builder.buildLimitOrder({
                makerAsset: dai.address,
                takerAsset: weth.address,
                makingAmount: '2',
                takingAmount: '2',
                maker: addr1.address,
                makerTraits: builder.buildMakerTraits({ allowMultipleFills: true, shouldCheckEpoch: true, nonce: 0, series: 1 }),
            });
            return { dai, weth, swap, chainId, order, builder };
        };

        it('should cancel own order', async function () {
            const { swap, chainId, order, builder } = await loadFixture(orderCancelationInit);
            const data = builder.buildLimitOrderTypedData(order.order, chainId, swap.address);
            const orderHash = builder.buildLimitOrderHash(data);
            const orderFacade = getOrderFacade(swap.address, chainId, addr1);

            const calldata = orderFacade.cancelLimitOrder(order.order.makerTraits, orderHash);
            const tx = await addr1.sendTransaction({
                to: swap.address,
                data: calldata
            });

            await tx.wait();

            const remainingInvalidatorForOrderCalldata =
                orderFacade.remainingInvalidatorForOrder(addr1.address, orderHash);

            const provider = ethers.provider;
            const result = await provider.call({
                to: swap.address,
                data: remainingInvalidatorForOrderCalldata
            });

            expect(BigInt(result)).to.equal(BigInt(0))
        });


        it('epoch change, order should fail', async function () {
            const { swap, chainId, order, builder } = await loadFixture(orderWithEpochInit);

            await swap.connect(addr1).increaseEpoch(1);

            const typedData = builder.buildLimitOrderTypedData(order.order, chainId, swap.address);
            const signature = await builder.buildOrderSignature(addr1.address, typedData);

            const orderFacade = getOrderFacade(swap.address, chainId, addr1);
            const calldata = orderFacade.increaseEpoch('1');
            const tx = await addr1.sendTransaction({
                to: swap.address,
                data: calldata
            });

            await tx.wait();

            const fillCalldata = orderFacade.fillLimitOrder({
                order: order.order,
                signature,
                amount: '2',
                takerTraits: fillWithMakingAmount(BigInt(1))
            })

            await expect(addr1.sendTransaction({
                to: swap.address,
                data: fillCalldata
            })).to.be.revertedWithCustomError(swap, 'WrongSeriesNonce')
        });

        it('advance nonce', async function () {
            const { swap, chainId } = await loadFixture(deployContractsAndInit);

            const orderFacade = getOrderFacade(swap.address, chainId, addr);
            const calldata = orderFacade.increaseEpoch('0');
            const tx = await addr.sendTransaction({
                to: swap.address,
                data: calldata
            });

            await tx.wait();

            const epochCallData = orderFacade.epoch(addr.address, '0');

            const provider = ethers.provider;
            const result = BigInt(
                await provider.call({
                    to: swap.address,
                    data: epochCallData
                })
            )
            expect(result).to.equal(BigInt(1));
        });

    });

    describe('Predicate', function () {
        const deployContractsAndInit = async function () {
            const { dai, weth, swap, chainId } = await deploySwapTokens();
            const { arbitraryPredicate } = await deployArbitraryPredicate();
            await initContracts(dai, weth, swap);
            return { dai, weth, swap, chainId, arbitraryPredicate };
        };

        it('arbitrary call predicate should pass', async function () {
            const { dai, weth, swap, chainId, arbitraryPredicate } = await loadFixture(deployContractsAndInit);

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

            const builder = getOrderBuilder(swap.address, addr1);

            const order = builder.buildLimitOrder(
                {
                    makerAsset: dai.address,
                    takerAsset: weth.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr1.address,
                },
                {
                    predicate,
                },
            );

            const signature = await builder.buildTypedDataAndSign(
                order.order,
                chainId,
                swap.address,
                addr1.address
            );

            const takerFacade = getOrderFacade(swap.address, chainId, addr);

            const calldata = takerFacade.fillLimitOrderExt({
                order: order.order,
                amount: '1',
                signature,
                takerTraits: '1',
                extension: order.extension,
            });

            const tx = await addr.sendTransaction({
                to: swap.address,
                data: calldata
            });

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
            )

            const builder = getOrderBuilder(swap.address, addr1);

            const order = builder.buildLimitOrder(
                {
                    makerAsset: dai.address,
                    takerAsset: weth.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr1.address,
                },
                {
                    predicate,
                },
            );

            const signature = await builder.buildTypedDataAndSign(
                order.order,
                chainId,
                swap.address,
                addr1.address
            );

            const facade = getOrderFacade(
                swap.address,
                chainId,
                addr
            );

            const calldata = facade.fillLimitOrderExt({
                order: order.order,
                amount: '1',
                signature,
                takerTraits: '1',
                extension: order.extension,
            });

            await expect(addr.sendTransaction({
                to: swap.address,
                data: calldata
            })).to.be.revertedWithCustomError(swap, 'PredicateIsNotTrue');
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

            const builder = getOrderBuilder(
                swap.address,
                addr1
            );

            const order = builder.buildLimitOrder(
                {
                    makerAsset: dai.address,
                    takerAsset: weth.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr1.address,
                },
                {
                    predicate,
                },
            );

            const signature = await builder.buildTypedDataAndSign(
                order.order,
                chainId,
                swap.address,
                addr1
            );

            const facade = getOrderFacade(
                swap.address,
                chainId,
                addr1,
            );

            const fillCalldata = facade.fillLimitOrderExt({
                order: order.order,
                signature,
                extension: order.extension,
                amount: '1',
                takerTraits: '1'
            });

            const fillTx = await addr.sendTransaction({
                to: swap.address,
                data: fillCalldata,
            });
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

            const builder = getOrderBuilder(
                swap.address,
                addr1
            );

            const order = builder.buildLimitOrder(
                {
                    makerAsset: dai.address,
                    takerAsset: weth.address,
                    makingAmount: '1',
                    takingAmount: '1',
                    maker: addr1.address,
                },
                {
                    predicate,
                },
            );

            const signature = await builder.buildTypedDataAndSign(
                order.order,
                chainId,
                swap.address,
                addr1
            );

            const facade = getOrderFacade(
                swap.address,
                chainId,
                addr1,
            );

            const fillCalldata = facade.fillLimitOrderExt({
                order: order.order,
                signature,
                extension: order.extension,
                amount: '1',
                takerTraits: '1'
            });

            const fillTx = await addr.sendTransaction({
                to: swap.address,
                data: fillCalldata,
            });

            await expect(fillTx).to.changeTokenBalances(dai, [addr, addr1], [1, -1]);
            await expect(fillTx).to.changeTokenBalances(weth, [addr, addr1], [-1, 1]);
        });
    });
});
