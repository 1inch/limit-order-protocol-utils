import { AbiItem } from "src/model/abi.model";
import { ChainId } from "./model/limit-order-protocol.model";
import SeriesNonceManagerABISource from './abi/SeriesNonceManagerABI.json';

export const SERIES_NONCE_MANAGER_ABI: AbiItem[] = SeriesNonceManagerABISource;

export const seriesNonceManagerContractAddresses: {[key in ChainId]: string} = {
    [ChainId.etherumMainnet]: '0x2dadf9264db7eb9e24470a2e6c73efbc4bdf01aa',
    [ChainId.binanceMainnet]: '0x1488a117641ed5d2d29ab3ed2397963fdefec25e',
    [ChainId.polygonMainnet]: '0x302a6eda4e2b2c563a80cc17bd80a1251b986677',
    [ChainId.optimismMainnet]: '0xcbdb7490968d4dbf183c60fc899c2e9fbd445308',
    [ChainId.arbitrumMainnet]: '0xd41b24bba51fac0e4827b6f94c0d6ddeb183cd64',
    [ChainId.gnosisMainnet]: '0xe26a18b00e4827ed86bc136b2c1e95d5ae115edd',
    [ChainId.avalancheMainnet]: '0x735247fb0a604c0adc6cab38ace16d0dba31295f',
    [ChainId.fantomMainnet]: '0x54431918cec22932fcf97e54769f4e00f646690f',
    [ChainId.auroraMainnet]: '0x54431918cec22932fcf97e54769f4e00f646690f',
    [ChainId.klaytnMainnet]: '0x54431918cEC22932fCF97E54769F4E00f646690F',
};
