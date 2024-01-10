import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-dependency-compiler";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/types";

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.19',
        settings: {
            optimizer: {
                enabled: true,
                runs: 100,
            },
            viaIR: true,
        },
    },
    networks: {
        hardhat: {
            chainId: 1337
        }
    },
    defaultNetwork: "hardhat",

    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    dependencyCompiler: {
        paths: [
            '@1inch/solidity-utils/contracts/mocks/TokenCustomDecimalsMock.sol',
            '@1inch/solidity-utils/contracts/mocks/TokenMock.sol',
        ],
    },
    paths: {
        sources: "./src/e2e-tests/smart-contracts/contracts",
        tests: "./src/e2e-tests/tests",
        cache: "./cache",
        artifacts: "./artifacts"
    },
};

export default config;
