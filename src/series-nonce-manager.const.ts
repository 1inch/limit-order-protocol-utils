import { AbiItem } from "src/model/abi.model";
import { ChainId } from "./model/limit-order-protocol.model";
import SeriesNonceManagerABISource from './abi/SeriesNonceManagerABI.json';

export const SERIES_NONCE_MANAGER_ABI: AbiItem[] = SeriesNonceManagerABISource;

export const seriesNonceManagerContractAddresses: {[key in ChainId]: string} = {
    [ChainId.etherumMainnet]: '0x303389f541ff2d620e42832f180a08e767b28e10',
    [ChainId.binanceMainnet]: '0x58ce0e6ef670c9a05622f4188faa03a9e12ee2e4',
    [ChainId.polygonMainnet]: '0xa5eb255ef45dfb48b5d133d08833def69871691d',
    [ChainId.optimismMainnet]: '0x32d12a25f539e341089050e2d26794f041fc9df8',
    [ChainId.arbitrumMainnet]: '0xd7936052d1e096d48c81ef3918f9fd6384108480',
    [ChainId.gnosisMainnet]: '0x11431a89893025d2a48dca4eddc396f8c8117187',
    [ChainId.avalancheMainnet]: '0x2ec255797fef7669fa243509b7a599121148ffba',
    [ChainId.auroraMainnet]: '0x7f069df72b7a39bce9806e3afaf579e54d8cf2b9',
    [ChainId.fantomMainnet]: '0x7871769b3816b23db12e83a482aac35f1fd35d4b',
    [ChainId.klaytnMainnet]: '0x7871769b3816b23db12e83a482aac35f1fd35d4b',
    [ChainId.zkSyncEraMainnet]: '0xce3cf049b99ca75d520287c8f9c35e5bdbf0376b',
};
