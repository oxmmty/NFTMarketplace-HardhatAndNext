import { Contract, ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react' 
import Web3Modal from 'web3modal';
import { MarketContext, IMarketContext, getMarketContract, getNFTContract, isWalletConnectedHandler, connectWalletHandler } from './index'
import { getSignerAndProvider } from './walletConnection';
interface Props {
  children: JSX.Element | JSX.Element[];
}

type InitialStateType = {
  marketContract:Contract; 
  nftContract: Contract;
}


export const MarketProvider = ({ children }: Props) => {
  const [marketContract, setMarketContract] = useState<Contract | null>(null);
  const [nftContract, setNftContract] = useState<Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [signer, setSigner] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const web3ModalRef = useRef<Web3Modal | null>(null);
  
  const isWalletConnected = async () => {
    const cache = web3ModalRef.current?.cachedProvider
    const proxy = await web3ModalRef.current?.connectTo(cache!)
    const provider = new ethers.providers.Web3Provider(proxy);
    const accounts =  await provider.listAccounts();
    setIsConnected(true); 
    setSigner(accounts[0]);
  }

  const connectWallet = async () => {
    try {
      const { signer, provider } = await getSignerAndProvider(web3ModalRef);
      const accounts = await signer.provider.listAccounts();
      setIsConnected(true)
      setSigner(accounts[0]);
    } catch (error) {
      console.log(" error", error);
    }
  };

  useEffect(() => {
    web3ModalRef.current =  new Web3Modal({
      network: "hadrhatLocal",
      cacheProvider: true,
      providerOptions: {},
      theme: "dark"
    });
  
  }, []);

  useEffect(() => {
    if(typeof window != 'undefined' && typeof window.ethereum != 'undefined') {
      setHasMetamask(true);
      const { ethereum } = window;
      const marketContract = getMarketContract(ethereum);
      const nftContract = getNFTContract(ethereum);
      setInitialState({ marketContract, nftContract });
    } else {
        alert('Please install Metamask!');
        setHasMetamask(false);
    }
     
  },[]);

  const setInitialState = async ( { marketContract, nftContract }:InitialStateType) => {
    setMarketContract(marketContract);
    setNftContract(nftContract);
    await isWalletConnected();   
  } 

  return (
    <MarketContext.Provider
      value={{
        isLoading,
        isConnected,
        signer,
        connectWallet,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};
