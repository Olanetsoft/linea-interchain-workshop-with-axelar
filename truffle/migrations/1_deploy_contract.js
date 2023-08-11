const SendMessage = artifacts.require("SendMessage");

const gatewayAddress = "0xe432150cce91c13a887f7D836923d5597adD8E31";

// Gas Service Contract address
const gasService = "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6";

module.exports = function (deployer) {
  // Arguments are: contract
  deployer.deploy(SendMessage, gatewayAddress, gasService);
};

// Linea
// 0x752Be5CE15994EE59eB172c2132b569731C1b148

// Optimism
// 0x4EF3469C8F4c87Bd16e3E85E489dE4845b776E8c