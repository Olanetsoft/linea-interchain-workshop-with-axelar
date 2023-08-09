Fullstack Interchain dApp on Linea with Axelar 🔥

Step 1
- Clone the project
- Install dependencies with `npm install`
- Run the project with `npm run dev`

Step 2
- Create a new folder called `truffle` with the following command `mkdir truffle`
- cd into the folder `cd truffle`
- Run the following command to install truffle globally, initialize a new truffle project with the default configuration and run tests:
```
npm i -g truffle
truffle init
truffle test
```

Step 3
- Create a new solidity file called `SendMessage.sol` in the `contracts` folder
- Add the following code to the file:
```
// SPDX-License-Identifier: MIT
// SPDX license identifier specifies which open-source license is being used for the contract
pragma solidity ^0.8.0;

// Importing external contracts for dependencies
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";

// Contract definition and name
contract SendMessage is AxelarExecutable {
    // Three state variables that any function in the contract can access
    string public message;
    string public sourceChain;
    string public sourceAddress;

    // State variable that can only be set during contract deployment and is immutable after that
    IAxelarGasService public immutable gasService;

    // Contract constructor function gets called when the contract is first deployed
    constructor(
        address gateway_,
        address gasReceiver_
    ) AxelarExecutable(gateway_) {
        // Sets the immutable state variable to the address of gasReceiver_
        gasService = IAxelarGasService(gasReceiver_);
    }

    // Call this function to update the value of this contract along with all its siblings.
    function sendMessage(
        string calldata destinationChain,
        string calldata destinationAddress,
        string calldata value_
    ) external payable {
        require(msg.value > 0, "Gas payment is required");

        // Encodes the new value string into bytes, which can be sent to the Axelar gateway contract
        bytes memory payload = abi.encode(value_);

        gasService.payNativeGasForContractCall{value: msg.value}(
            address(this),
            destinationChain,
            destinationAddress,
            payload,
            msg.sender
        );
        // Calls the Axelar gateway contract with the specified destination chain and address and sends the payload along with the call
        gateway.callContract(destinationChain, destinationAddress, payload);
    }

    // Handles calls created by setAndSend. Updates this contract's value
    function _execute(
        string calldata sourceChain_,
        string calldata sourceAddress_,
        bytes calldata payload_
    ) internal override {
        // Decodes the payload bytes into the string message and sets the state variable for this contract
        (message) = abi.decode(payload_, (string));
        // Sets the sourceChain and sourceAddress state variables with the provided arguments
        sourceChain = sourceChain_;
        sourceAddress = sourceAddress_;
    }
}
```
- To make sure everything is working, run `truffle compile`

Step 4
- Create a new `.env` file inside the truffle folder
- Add the following code to the file:
```
MNEMONIC=your mnemonic
PROJECT_ID=your infura project id
```
> Note: You can get your mnemonic from your Metamask wallet and your Infura project id from [Infura](https://infura.io/)
- Navigate to the `truffle-config.js` file and update the file with the following code:
```
require("dotenv").config();
const { MNEMONIC, PROJECT_ID } = process.env;

const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
   
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    linea_goerli: {
      provider: () =>
        new HDWalletProvider(
          MNEMONIC,
          `https://linea-goerli.infura.io/v3/${PROJECT_ID}`
        ),
      network_id: 59140, // Linea Goerli's id
    },
    optimism: {
      provider: () =>
        new HDWalletProvider(
          MNEMONIC,
          `https://optimism-goerli.infura.io/v3/${PROJECT_ID}`
        ),
      network_id: 420, // Optimism's id
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.21", // Fetch the exact version from solc-bin (default: truffle's version)
    },
  },
};
```

Step 5
- Create a new file called `1_deploy_contracts.js` in the `migrations` folder
In this step, we will deploy the contract to the Linea Goerli testnet and Optimism Goerli testnet.

Go to [Axelar Documentation](https://docs.axelar.dev/resources/testnet) to get the addresses for the Linea Gateway Contract and Gas Service Contract for the Linea Goerli testnet and Optimism Goerli testnet.

`Deploying to Linea Goerli testnet`
- Add the following code to the file:
```
const SendMessage = artifacts.require("SendMessage");

const gatewayAddress = "0xe432150cce91c13a887f7D836923d5597adD8E31"; // Linea Gateway Contract address

// Gas Service Contract address
const gasService = "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6";

module.exports = function (deployer) {
  // Arguments
  deployer.deploy(SendMessage, gatewayAddress, gasService);
};
```
- Run `truffle migrate --network goerli` to deploy the contract to the Linea Goerli testnet

Next, update the gateway address and gas service address to the Optimism Goerli testnet addresses and run `truffle migrate --network optimism` to deploy the contract to the Optimism Goerli testnet

- Save the contract address for the Linea Goerli testnet and Optimism Goerli testnet, as we will need it later

Hurrah! We have successfully deployed our contract to the Linea Goerli testnet and Optimism Goerli testnet.

Step 6

Let's wire up our frontend to our contract.

- In the root directory, create a new file called `.env.local` and add the following:
```
NEXT_PUBLIC_OPTIMISM_RPC_URL=https://optimism-goerli.infura.io/v3/<your-infura-project-id>
NEXT_PUBLIC_LINEA_CONTRACT_ADDRESS=
NEXT_PUBLIC_OPTIMISM_CONTRACT_ADDRESS=
```
- Replace the `<your-infura-project-id>` with your infura project id
- Replace the `NEXT_PUBLIC_LINEA_CONTRACT_ADDRESS` with the contract address for the Linea Goerli testnet
- Replace the `NEXT_PUBLIC_OPTIMISM_CONTRACT_ADDRESS` with the contract address for the Optimism Goerli testnet

Step 7
- We need to import the contract abi and the contract addresses and Optimism RPC from the `.env` file. Navigate to the `pages/index.js` file and update the file with the following code:
```
//...

////////////////////////////////////////////////////////////////////////////////

import SendMessageContract from "../truffle/build/contracts/SendMessage.json";

const LINEA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LINEA_CONTRACT_ADDRESS;
const OPTIMISM_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_OPTIMISM_CONTRACT_ADDRESS;
const OPTIMISM_RPC_URL = process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL;

////////////////////////////////////////////////////////////////////////////////

export default function Home() {
	//...
}
```

Step 8

In this step, we will implement the write functionality and the gas estimator to send message cross chain from Linea to Optimism.

- Navigate to the `pages/index.js` file and update the file with the following code:
```
//...

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  ////////////////////////////////////////////////////////////////////////////////

  const [message, setMessage] = useState(""); // State variable to hold the message content
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
  const [gasFee, setGasFee] = useState(0);

  ////////////////////////////////////////////////////////////////////////////////

  // Estimate Gas
  const gasEstimator = async () => {
    const gas = await api.estimateGasFee(
      EvmChain.LINEA,
      EvmChain.OPTIMISM,
      GasToken.ETH,
      700000,
      2
    );
    setGasFee(gas);
  };

  ////////////////////////////////////////////////////////////////////////////////

  const { config } = usePrepareContractWrite({
    // Calling a hook to prepare the contract write configuration
    address: LINEA_CONTRACT_ADDRESS, // Address of the LINEA contract
    abi: SendMessageContract.abi, // ABI (Application Binary Interface) of the contract
    functionName: "sendMessage", // Name of the function to call on the contract
    args: ["optimism", OPTIMISM_CONTRACT_ADDRESS, message], // Arguments to pass to the contract function
    value: gasFee, // Value to send with the transaction
  });

  const { data: useContractWriteData, write } = useContractWrite(config); // Calling a hook to get contract write data and the write function

  const { data: useWaitForTransactionData, isSuccess } = useWaitForTransaction({
    // Calling a hook to wait for the transaction to be mined
    hash: useContractWriteData?.hash, // Hash of the transaction obtained from the contract write data
  });

  ////////////////////////////////////////////////////////////////////////////////

  const handleSendMessage = () => {
    write(); // Initiating the contract call

    toast.info("Sending message...", {
      // Displaying a toast notification
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
  };

  ////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const body = document.querySelector("body");
    darkMode ? body.classList.add("dark") : body.classList.remove("dark");

    gasEstimator();

    ////////////////////////////////////////////////////////////////////////////////
    isSuccess
      ? toast.success("Message sent!", {
          position: "top-right",
          autoClose: 7000,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        })
      : useWaitForTransactionData?.error || useContractWriteData?.error
      ? toast.error("Error sending message")
      : null;
  }, [darkMode, useContractWriteData, useWaitForTransactionData]);

  return ();
}
```

Step 9
Update the input(textarea) field and the button with the following code:
```
//...

return(

//...

<textarea
type="text"
placeholder="Message"
className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
onChange={(e) => setMessage(e.target.value)}
/>
<button
className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full"
onClick={() => handleSendMessage()}
>
Send
</button>

//...
)
```
Hurrah! We have successfully implemented the write functionality and the gas estimator to send message cross chain from Linea to Optimism.

Step 10

In this step, we will implement the read functionality to read the message from the Optimism Goerli testnet.

- Inside the `pages/index.js` file and update the file with the following code:
```
//...

export default function Home() {
	//...
  ////////////////////////////////////////////////////////////////////////////////

  const [sourceChain, setSourceChain] = useState(""); // State variable to hold the source chain
  const [value, setValue] = useState(""); // State variable to hold the value

    ////////////////////////////////////////////////////////////////////////////////

  const provider = new ethers.providers.JsonRpcProvider(OPTIMISM_RPC_URL);
  const contract = new ethers.Contract(
    OPTIMISM_CONTRACT_ADDRESS,
    SendMessageContract.abi,
    provider
  );

  async function readDestinationChainVariables() {
    try {
      const value = await contract.message();
      const sourceChain = await contract.sourceChain();

      setValue(value.toString());
      setSourceChain(sourceChain);
    } catch (error) {
      console.log(error);
      toast.error("Error reading message");
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
     readDestinationChainVariables();

     //...
  }, []);

  return (
    //...
  );
}
```

Step 11

Update the `return` statement with the following code:
```
//...

return (
  //...

   <div className="border border-gray-300 rounded-lg p-8 m-2 w-2/5">
            <h2 className="text-2xl font-bold mb-4">Response 🎉 </h2>
            {value ? (
              <>
                <p className="font-semibold mb-4">
                  From:{" "}
                  <span className="font-normal text-gray-500">
                    {" "}
                    {sourceChain.charAt(0).toUpperCase() + sourceChain.slice(1)}
                  </span>
                </p>
                <p className="font-semibold mb-4">
                  To:{" "}
                  <span className="font-normal text-gray-500">
                    {sourceChain ? "Optimism" : null}
                  </span>
                </p>
                <p className="font-semibold mb-4">
                  Message:{" "}
                  <span className="font-normal text-gray-500">{value}</span>
                </p>
              </>
            ) : (
              <span className="text-red-500 ">waiting for response...</span>
            )}
          </div>

//...
)
```

Hurrah! We have successfully implemented the read functionality to read the message from the Optimism Goerli testnet.

Time to test the application.

We have built a simple application that allows users to send messages cross-chain from Linea to Optimism.

What Next?
It's up to you; check out our documentation to learn more about [Axelar General Message Passing](https://docs.axelar.dev/dev/general-message-passing/overview).

