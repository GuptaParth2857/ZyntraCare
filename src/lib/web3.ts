import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export let currentAccount: string | null = null;
export let chainId: number | null = null;
export let balance: string | null = null;

export function getProvider(): ethers.BrowserProvider | null {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }
  try {
    return new ethers.BrowserProvider(window.ethereum);
  } catch {
    return null;
  }
}

export async function getSigner(): Promise<ethers.JsonRpcSigner | null> {
  const provider = getProvider();
  if (!provider) return null;
  try {
    await provider.send('eth_requestAccounts', []);
    return provider.getSigner();
  } catch {
    return null;
  }
}

export async function getContract(address: string, abi: any): Promise<ethers.Contract> {
  const provider = getProvider();
  if (!provider) throw new Error('No provider');
  const signer = await getSigner();
  if (!signer) throw new Error('No signer');
  return new ethers.Contract(address, abi, signer);
}

export async function connectWallet(): Promise<{ address: string; balance: string } | null> {
  const provider = getProvider();
  if (!provider) {
    throw new Error('MetaMask not installed');
  }
  try {
    const accounts: string[] = await provider.send('eth_requestAccounts', []);
    if (accounts.length === 0) return null;
    currentAccount = accounts[0];
    const bal = await provider.getBalance(currentAccount);
    balance = ethers.formatEther(bal);
    chainId = Number(await provider.send('eth_chainId', []));
    return { address: currentAccount || '', balance: balance || '0' };
  } catch (err: any) {
    if (err?.code === 4001) throw new Error('User rejected connection');
    throw err;
  }
}

export function disconnectWallet(): void {
  currentAccount = null;
  chainId = null;
  balance = null;
}

export function isConnected(): boolean {
  return currentAccount !== null;
}

export async function getChainId(): Promise<number> {
  const provider = getProvider();
  if (!provider) throw new Error('No provider');
  chainId = Number(await provider.send('eth_chainId', []));
  return chainId;
}

export async function switchChain(targetChainId: number): Promise<boolean> {
  const provider = getProvider();
  if (!provider) throw new Error('No provider');
  try {
    await provider.send('wallet_switchEthereumChain', [{ chainId: `0x${targetChainId.toString(16)}` }]);
    chainId = targetChainId;
    return true;
  } catch (err: any) {
    if (err?.code === 4902) return false;
    throw err;
  }
}

export async function addPolygonMumbai(): Promise<boolean> {
  const provider = getProvider();
  if (!provider) throw new Error('No provider');
  try {
    await provider.send('wallet_addEthereumChain', [
      {
        chainId: '0x13881',
        chainName: 'Polygon Mumbai',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com'],
      },
    ]);
    chainId = 80001;
    return true;
  } catch {
    return false;
  }
}

export async function signMessage(message: string): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No provider');
  const signer = await getSigner();
  if (!signer) throw new Error('No signer');
  return signer.signMessage(message);
}

export async function verifySignature(address: string, message: string, signature: string): Promise<string> {
  return ethers.verifyMessage(message, signature);
}

export function listenAccountChange(callback: (accounts: string[]) => void): void {
  if (typeof window === 'undefined' || !window.ethereum) return;
  window.ethereum.on('accountsChanged', callback);
}

export function listenChainChange(callback: (chainId: number) => void): void {
  if (typeof window === 'undefined' || !window.ethereum) return;
  window.ethereum.on('chainChanged', (id: string) => callback(Number(id)));
}

export function getBlockExplorerUrl(txHash: string): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io/tx/',
    5: 'https://goerli.etherscan.io/tx/',
    80001: 'https://mumbai.polygonscan.com/tx/',
    137: 'https://polygonscan.com/tx/',
  };
  const base = chainId && explorers[chainId] ? explorers[chainId] : explorers[80001];
  return `${base}${txHash}`;
}

export async function estimateGas(tx: any): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No provider');
  const gasLimit = await provider.estimateGas(tx);
  return gasLimit.toString();
}
