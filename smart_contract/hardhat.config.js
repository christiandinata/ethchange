// https://eth-goerli.g.alchemy.com/v2/2868fnp6mU_U-_vUQgbSJVEl5k1eLUIJ

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/2868fnp6mU_U-_vUQgbSJVEl5k1eLUIJ",
      // python metamask account
      accounts: [
        "90dd15e244b7106b1cfa33c350cd05e41d98bd92766cbcdfe029c99f629df162",
      ],
    },
  },
};
