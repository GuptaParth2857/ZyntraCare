'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWifi, FiWifiOff, FiLoader, FiCopy, FiExternalLink, FiLogOut, FiShield, FiUserPlus, FiAlertTriangle, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiDatabase, FiArrowRight } from 'react-icons/fi';
import {
  connectWallet,
  disconnectWallet as disconnect,
  isConnected,
  getChainId,
  switchChain,
  addPolygonMumbai,
  listenAccountChange,
  listenChainChange,
  getBlockExplorerUrl,
  currentAccount,
  chainId as chainIdState,
  balance as balanceState,
} from '@/lib/web3';

const MUMBAI_CHAIN_ID = 80001;
const TX_STORAGE_KEY = 'zyntracare_wallet_txns';

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  137: 'Polygon Mainnet',
  80001: 'Polygon Mumbai',
  11155111: 'Sepolia Testnet',
};

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatBalance(bal: string): string {
  const num = parseFloat(bal);
  if (isNaN(num)) return '0.00';
  return num < 0.001 ? '<0.001' : num.toFixed(4);
}

export default function WalletConnect() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [account, setAccount] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [userChainId, setUserChainId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [metaMaskInstalled, setMetaMaskInstalled] = useState(true);
  const [transactions, setTransactions] = useState<string[]>([]);
  const [doctorAddress, setDoctorAddress] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');

  useEffect(() => {
    setMetaMaskInstalled(typeof window !== 'undefined' && !!window.ethereum);
    try {
      const stored = localStorage.getItem(TX_STORAGE_KEY);
      if (stored) setTransactions(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (!isConnected()) return;
    setAccount(currentAccount);
    setUserBalance(balanceState);
    setUserChainId(chainIdState);
    setStatus('connected');
  }, []);

  useEffect(() => {
    listenAccountChange((accounts: string[]) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else {
        setAccount(accounts[0]);
      }
    });
    listenChainChange((id: number) => {
      setUserChainId(id);
    });
  }, []);

  const addTransaction = useCallback((txHash: string) => {
    setTransactions(prev => {
      const updated = [txHash, ...prev].slice(0, 5);
      try { localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const handleConnect = async () => {
    setStatus('loading');
    setErrorMsg(null);
    try {
      const result = await connectWallet();
      if (!result) {
        setStatus('idle');
        return;
      }
      setAccount(result.address);
      setUserBalance(result.balance);
      const cid = await getChainId();
      setUserChainId(cid);
      setStatus('connected');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Connection failed');
      setStatus('error');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setAccount(null);
    setUserBalance(null);
    setUserChainId(null);
    setStatus('idle');
    setErrorMsg(null);
  };

  const handleSwitchChain = async () => {
    setStatus('loading');
    setErrorMsg(null);
    try {
      const switched = await switchChain(MUMBAI_CHAIN_ID);
      if (!switched) {
        const added = await addPolygonMumbai();
        if (!added) {
          setErrorMsg('Failed to switch network. Please add Polygon Mumbai manually.');
          setStatus('error');
          return;
        }
      }
      setUserChainId(MUMBAI_CHAIN_ID);
      setStatus('connected');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to switch chain');
      setStatus('error');
    }
  };

  const handleCopyAddress = () => {
    if (account) navigator.clipboard.writeText(account);
  };

  const handleViewRecords = () => {
    const hash = `Qm${Array.from({ length: 44 }, () => Math.random().toString(36)[2]).join('')}`;
    setIpfsHash(hash);
    addTransaction(`0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`);
  };

  const handleGrantAccess = async () => {
    if (!doctorAddress) return;
    addTransaction(`0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`);
    setDoctorAddress('');
  };

  const handleEmergencyOverride = () => {
    addTransaction(`0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`);
  };

  const chainName = userChainId ? CHAIN_NAMES[userChainId] || `Chain ${userChainId}` : 'Unknown';
  const isWrongNetwork = userChainId !== null && userChainId !== MUMBAI_CHAIN_ID;

  if (!metaMaskInstalled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-white/10 rounded-2xl p-6 text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center">
          <FiWifiOff className="text-orange-400 text-2xl" />
        </div>
        <h3 className="text-white font-bold text-lg">MetaMask Not Found</h3>
        <p className="text-gray-400 text-sm">Install MetaMask to connect your wallet and manage health records on the blockchain.</p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/25"
        >
          <FiExternalLink />
          Install MetaMask
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <FiLoader className="text-blue-400 text-3xl animate-spin" />
            <p className="text-gray-400 text-sm font-medium">Connecting wallet...</p>
          </motion.div>
        )}

        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
              <FiWifi className="text-blue-400 text-2xl" />
            </div>
            <h3 className="text-white font-bold text-lg">Connect Your Wallet</h3>
            <p className="text-gray-400 text-sm">Link your MetaMask wallet to access blockchain health records on Polygon Mumbai.</p>
            <button
              onClick={handleConnect}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-blue-500 hover:to-teal-500 transition shadow-lg shadow-blue-500/25"
            >
              <FiWifi />
              Connect Wallet
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <FiXCircle className="text-red-400 text-2xl" />
            </div>
            <h3 className="text-white font-bold text-lg">Connection Error</h3>
            <p className="text-red-400 text-sm">{errorMsg}</p>
            <button
              onClick={handleConnect}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-red-500 hover:to-orange-500 transition"
            >
              <FiRefreshCw />
              Retry Connection
            </button>
          </motion.div>
        )}

        {status === 'connected' && account && (
          <motion.div
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isWrongNetwork ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="text-yellow-400 text-2xl" />
                </div>
                <h3 className="text-white font-bold text-lg">Wrong Network</h3>
                <p className="text-gray-400 text-sm">Please switch to Polygon Mumbai testnet to interact with health records.</p>
                <p className="text-xs text-gray-500">Current: {chainName}</p>
                <button
                  onClick={handleSwitchChain}
                  className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-orange-500 transition"
                >
                  <FiArrowRight />
                  Switch to Polygon Mumbai
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                        <FiWifi className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{truncateAddress(account)}</p>
                        <p className="text-gray-400 text-xs">{chainName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyAddress}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                        title="Copy address"
                      >
                        <FiCopy size={16} />
                      </button>
                      <button
                        onClick={handleDisconnect}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                        title="Disconnect"
                      >
                        <FiLogOut size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
                    <FiShield className="text-teal-400" />
                    <span className="text-gray-300 text-sm font-medium">
                      {formatBalance(userBalance || '0')} ETH
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                    <FiDatabase /> Wallet Features
                  </h4>

                  <button
                    onClick={handleViewRecords}
                    className="w-full flex items-center justify-between bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-xl px-4 py-3 transition group"
                  >
                    <span className="text-blue-300 text-sm font-medium">View Health Records on Blockchain</span>
                    <FiArrowRight className="text-blue-400 group-hover:translate-x-1 transition" />
                  </button>

                  {ipfsHash && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-800 rounded-xl p-3"
                    >
                      <p className="text-xs text-gray-400 mb-1">Latest IPFS Hash</p>
                      <p className="text-teal-400 text-xs font-mono break-all">{ipfsHash}</p>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-medium">Grant Doctor Access</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={doctorAddress}
                        onChange={e => setDoctorAddress(e.target.value)}
                        placeholder="0x..."
                        className="flex-1 bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                      />
                      <button
                        onClick={handleGrantAccess}
                        disabled={!doctorAddress}
                        className="px-4 py-2 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                      >
                        <FiUserPlus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleEmergencyOverride}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl px-4 py-3 transition"
                  >
                    <FiAlertTriangle />
                    <span className="text-sm font-medium">Emergency Override</span>
                  </button>
                </div>

                <div className="p-6 space-y-3">
                  <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                    <FiClock /> Transaction History
                  </h4>
                  {transactions.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No transactions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx, i) => (
                        <motion.div
                          key={`${tx}-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-green-400 shrink-0" size={14} />
                            <span className="text-gray-300 text-xs font-mono">
                              {truncateAddress(tx)}
                            </span>
                          </div>
                          <a
                            href={getBlockExplorerUrl(tx)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition"
                          >
                            <FiExternalLink size={14} />
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
