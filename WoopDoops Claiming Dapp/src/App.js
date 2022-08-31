import { useState, useEffect } from "react";
// import { Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
// import Minter from "./components/Minter";
// import Navbar from "./components/Navbar";
import { abi } from "./contract/contractAbi";
import { address } from "./contract/contractAddress";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Web3Modal from "web3modal";
import WalletConnect from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

// import { providerOptions } from "./providerOptions";

function App() {
  const [wallet, setWallet] = useState({});
  const [canClaim, setCanClaim] = useState(0);
  const [claimed, setClaimed] = useState(0);
  const [claimStatus, setClaimStatus] = useState(false);
  // Connect Wallet
  // const providerOptions = {
  //   coinbasewallet: {
  //     package: CoinbaseWalletSDK,
  //     options: {},
  //   },
  // };

  const providerOptions = {
    walletlink: {
      package: CoinbaseWalletSDK, // Required
      options: {
        appName: "WoopDoop", // Required
        infuraId: "219cce269f774a9f9970dd42da83cb5b", // Required unless you provide a JSON RPC url; see `rpc` below
        // infuraId: process.env.INFURA_KEY, // Required unless you provide a JSON RPC url; see `rpc` below
      },
    },
    walletconnect: {
      package: WalletConnect, // required
      options: {
        infuraId: "219cce269f774a9f9970dd42da83cb5b", // required
        // infuraId: process.env.INFURA_KEY, // required
      },
    },
  };
  let web3Modal;
  const handleConnectWallet = async () => {
    // try {
    //   let web3Modal = new Web3Modal({
    //     cacheProvider: false,
    //     providerOptions,
    //   });
    //   const web3ModalInstance = await web3Modal.connect();
    //   const web3ModalProvider = new ethers.providers.Web3Provider(
    //     web3ModalInstance
    //   );
    //   const signer = web3ModalProvider.getSigner();
    //   console.log(web3ModalProvider);
    //   setWallet({
    //     ...wallet,
    //     address: accounts?.result[0],
    //     signer: signer,
    //     network: await _signer.getNetwork(),
    //   });
    // } catch (error) {}
    // if (typeof window.ethereum !== "undefined") {

    try {
      // await window.ethereum.enable();
      web3Modal = new Web3Modal({
        theme: "dark",
        // cacheProvider: true,
        // cacheProvider: false,
        providerOptions,
      });
      // if()
      const web3ModalInstance = await web3Modal.connect();

      const web3ModalProvider = new ethers.providers.Web3Provider(
        web3ModalInstance
      );
      const account = await web3ModalProvider.listAccounts();
      // const account = web3ModalProvider.provider._addresses[0];
      // const accounts = await window.ethereum.send("eth_requestAccounts");
      console.log(account);
      const _signer = await web3ModalProvider.getSigner();
      console.log("hello", web3ModalProvider);
      setWallet({
        ...wallet,
        address: account[0],
        signer: _signer,
        network: web3ModalProvider._network,
      });
      // const accounts = await window.ethereum.send("eth_requestAccounts");
      // const _signer = new ethers.providers.Web3Provider(window.ethereum);
      // setWallet({
      //   ...wallet,
      //   address: accounts?.result[0],
      //   signer: _signer.getSigner(),
      //   network: await _signer.getNetwork(),
      // });

      //  contract.canClaim(address).then((res)=>console.log("Helooooo",res))
    } catch (error) {
      console.log("Error:", error.message);
    }
    // } else alert("Please install MetaMask");
  };
  // Switch Network
  // const handleSwitchNetwork = async () => {
  //   if (window.ethereum) {
  //     try {
  //       await window.ethereum.request({
  //         method: "wallet_switchEthereumChain",
  //         params: [{ chainId: "0x4" }],
  //       });
  //     } catch (error) {
  //       if (error.code === 4902) {
  //         alert("Please add this network to metamask!");
  //       }
  //     }
  //   }
  // };
  const Msg = ({ closeToast, toastProps, hash }) => (
    <div className="bg-[white] w-1/2 ">
      <a
        className="text-underline text-gray-400"
        href={`https://etherscan.io/tx/${hash}`}
        target="_blank"
      >
        https://etherscan.io/tx/${hash}
      </a>
      {/* <button>Retry</button> */}
      {/* <button onClick={closeToast}>Close</button> */}
    </div>
  );

  const notify = (hash) =>
    toast(
      <Msg hash={hash} />,

      {
        // position: "bottom-center",

        autoClose: 5000,
        hideProgressBar: true,
        // closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );
  const handleClaim = async () => {
    setClaimStatus(true);
    // if (typeof window.ethereum !== "undefined") {
    //   try {
    //     console.log("to be coded...");
    //   } catch (error) {
    //     console.log("Error:", error.message);
    //   }
    // } else alert("Please install MetaMask");

    let contract = new ethers.Contract(address, abi, wallet?.signer);
    console.log(contract);
    toast.promise(
      contract.claim().then((transaction) => {
        toast.promise(
          transaction
            .wait()
            .then((tx) => {
              // toast.info(<a>https://etherscan.io/tx/{tx.transactionHash}</a>);
              // console.log("Hiiii", tx.transactionHash);
              notify(tx.transactionHash);
              setClaimStatus(false);
              // setMintingStatus(false);
            })
            .catch((err) => {
              toast.error("Error in Minting Token:", err);
            }),
          {
            pending: "Claiming in Process...",
            success: "Claimed Successfully 👌",
            error: "Promise rejected 🤯",
          }
        );
      }),
      {
        pending: "Waiting to Sign Transaction...",
        success: "Transaction Signed... 👌",
        error: "Transaction Rejected 🤯",
      }
    );
  };

  // Detect change in Metamask accounts
  // useEffect(() => {
  //   if (window.ethereum) {
  //     window.ethereum.on("chainChanged", () => handleConnectWallet());
  //     window.ethereum.on("accountsChanged", () => handleSwitchNetwork());
  //     // window.ethereum.on('disconnect', (res)=> console.log("disconected"));

  //   }
  // });

  // if(!window.ethereum.isConnected()){
  //   console.log('Disconnected')
  // }else{
  //   console.log('Connected')
  // }

  // Connect wallet on Refresh Page
  useEffect(async () => {
    // if (web3Modal.cachedProvider)
    console.log("HEllo", localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER"));
    if ("injected" == localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
      // http://localhost:3000/
    } else {
      await this.web3Modal.clearCachedProvider();
      handleConnectWallet();
    }
    // if (window.ethereum)
    // console.log("win", window.ethereum.listAccounts());
    // }
    // eslint-disable-next-line
  }, []);
  let contract = new ethers.Contract(address, abi, wallet?.signer);
  // console.log(contract)
  contract
    .canClaim(wallet.address)
    .then((res) => setCanClaim(ethers.BigNumber.from(res).toString()))
    .catch((err) => {
      setCanClaim(0);
      console.log(err.errorArgs[0]);
    });
  contract
    .totalClaimed(wallet.address)
    .then((res) => setClaimed(ethers.BigNumber.from(res).toString()))
    .catch((err) => toast.error(err.errorArgs[0]));
  useEffect(() => {
    let contract = new ethers.Contract(address, abi, wallet?.signer);
    // console.log(contract)
    contract
      .canClaim(wallet.address)
      .then((res) => setCanClaim(ethers.BigNumber.from(res).toString()))
      .catch((err) => {
        setCanClaim(0);
        console.log(err.errorArgs[0]);
      });
    contract
      .totalClaimed(wallet.address)
      .then((res) => setClaimed(ethers.BigNumber.from(res).toString()))
      .catch((err) => toast.error(err.errorArgs[0]));

    // eslint-disable-next-line
  }, [claimStatus]);

  // console.log("Wallet:", wallet);
  return (
    <>
      {/* <Navbar
        wallet={wallet}
        connectWallet={handleConnectWallet}
        disconnectWallet={handleDisconnectWallet}
      /> */}
      <ToastContainer />

      <div
        className="min-h-screen  px-5 sm:px-0 "
        style={{ background: "url(assets/bg.png)" }}
      >
        <img
          src={"assets/logo.png"}
          alt="Doop Claim"
          className="h-auto w-40 md:w-40 py-12 md:ml-24 pl:0  "
        />
        {/* <div className="w-1/2 mx-auto ">Helo</div> */}
        <div className=" bg-[#d9d9d9] mx-auto md:min-w-0 w-[300px] mt-8 sm:w-[350px]">
          <main class="flex items-center">
            <div class="">
              <div class="lg:grid lg:grid-cols-12 lg:auto-rows-min lg:gap-x-8">
                <div class="lg:col-span-12">
                  <section class="flex flex-col gap-2 px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
                    <dl class="space-y-4">
                      <div class="flex items-center justify-between gap-4">
                        <dt class="flex flex-col gap-1 text-sm text-gray-600">
                          <span>Your total claimed</span>
                          <small class="text-xs flex-shrink-0 text-gray-400">
                            Sum of all previous claims
                          </small>
                        </dt>
                        <dd class="text-sm font-medium text-gray-900">
                          <div className="text-xs sm:text-base text-bold">
                            {claimed} DOOP
                          </div>
                        </dd>
                      </div>
                      <div class="border-t border-[#f1f1f1] pt-4 flex items-center justify-between gap-4">
                        <dt className="flex flex-col gap-1 text-sm text-gray-600">
                          <span>Reward rate</span>
                          <small class="text-xs flex-shrink-0 text-gray-400">
                            How many tokens you receive{" "}
                            <div class="inline">every 1 day</div>
                          </small>
                        </dt>
                        <dd class="text-sm font-medium text-gray-900">
                          <div className="text-xs sm:text-[base] min-w-[50px]">
                            5 DOOP
                          </div>
                        </dd>
                      </div>
                      <div class="border-t border-[#f1f1f1] pt-4 flex items-center justify-between gap-4">
                        <dt class="flex flex-col gap-1 text-sm text-gray-600">
                          <span>Claim window</span>
                          <small class="text-xs flex-shrink-0 text-gray-400">
                            How often can you claim
                          </small>
                        </dt>
                        <dd class="text-sm font-medium text-gray-900">
                          <div>every 1 day</div>
                        </dd>
                      </div>
                      <div class="border-t border-[#f1f1f1] pt-4 flex items-center justify-between gap-4">
                        <dt class="text-base font-medium text-gray-900">
                          Claimable now for you
                        </dt>
                        <dd class="text-base font-medium text-gray-900">
                          <div className="text-xs sm:text-sm text-bold min-w-[80px]">
                            {canClaim} DOOP
                          </div>
                        </dd>
                      </div>
                    </dl>
                    <div class="flex flex-col justify-center items-center">
                      {/* <button class="mt-4 w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                      Connect to claim
                    </button> */}
                      {
                        // typeof window.ethereum !== "undefined" ? (
                        wallet?.address ? (
                          <button
                            onClick={handleClaim}
                            class="mt-4 w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {/* {wallet?.address?.slice(0, 5)}...{wallet?.address?.slice(-4)} */}
                            Claim
                          </button>
                        ) : (
                          <button
                            onClick={handleConnectWallet}
                            class="mt-4 w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Connect To Claim
                          </button>
                        )
                        // ) : (
                        //   <a
                        //     target="_blank"
                        //     href="https://metamask.io/download/"
                        //     class="mt-4 w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        //     rel="noreferrer"
                        //   >
                        //     Install Metamask
                        //   </a>
                        // )
                      }
                    </div>
                    <div class="flex flex-col gap-2"></div>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* <Routes>
        <Route path="/" element={<Minter wallet={wallet} />} />
      </Routes> */}
    </>
  );
}

export default App;
