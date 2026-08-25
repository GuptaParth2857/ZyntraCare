'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiUserPlus, FiUserX, FiExternalLink, FiCopy, FiCheckCircle, FiAlertTriangle, FiClock, FiRefreshCw, FiLink, FiActivity, FiCpu, FiFileText } from 'react-icons/fi';
import { connectWallet, disconnectWallet as disconnect, isConnected, getChainId, currentAccount, balance as balanceState, chainId } from '@/lib/web3';

const HEALTHID_ABI = [
  'function mintHealthID(address patient, string memory ipfsHash) external returns (uint256 tokenId)',
  'function grantAccess(uint256 tokenId, address doctor) external',
  'function revokeAccess(uint256 tokenId, address doctor) external',
  'function hasAccess(uint256 tokenId, address doctor) external view returns (bool)',
  'function getRecord(uint256 tokenId) external view returns (string memory ipfsHash)',
  'function getRecordHistory(uint256 tokenId) external view returns (tuple(string ipfsHash, uint256 timestamp, string updatedBy)[])',
  'function emergencyOverride(uint256 tokenId) external',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function tokenURI(uint256 tokenId) external view returns (string memory)',
  'event HealthIDMinted(uint256 indexed tokenId, address indexed patient, string ipfsHash)',
  'event RecordUpdated(uint256 indexed tokenId, string newIpfsHash, uint256 timestamp)',
  'event AccessGranted(uint256 indexed tokenId, address indexed doctor)',
  'event AccessRevoked(uint256 indexed tokenId, address indexed doctor)',
];

const CONTRACT_ADDRESS = '0x...'; // Replace with deployed contract address

function truncate(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function HealthIDPage() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [account, setAccount] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [doctorAddress, setDoctorAddress] = useState('');
  const [doctorAccess, setDoctorAccess] = useState<Record<string, boolean>>({});
  const [recordHash, setRecordHash] = useState('');
  const [recordHistory, setRecordHistory] = useState<any[]>([]);
  const [minting, setMinting] = useState(false);
  const [txPending, setTxPending] = useState('');
  const [txLog, setTxLog] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isConnected()) {
      setAccount(currentAccount);
      setNetworkId(chainId);
      setStatus('connected');
    }
  }, []);

  const addLog = (msg: string) => setTxLog(prev => [msg, ...prev].slice(0, 20));

  const handleConnect = async () => {
    setStatus('connecting');
    try {
      const result = await connectWallet();
      if (result) {
        setAccount(result.address);
        setNetworkId(await getChainId());
        setStatus('connected');
        addLog(`✅ Wallet connected: ${truncate(result.address)}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('disconnected');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setAccount(null);
    setNetworkId(null);
    setTokenId(null);
    setStatus('disconnected');
    addLog('🔌 Wallet disconnected');
  };

  const getContract = useCallback(async () => {
    const { ethers } = await import('ethers');
    if (!window.ethereum) throw new Error('MetaMask not installed');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, HEALTHID_ABI, signer);
  }, []);

  const handleMint = async () => {
    if (!account) return;
    setMinting(true);
    setTxPending('Minting Health ID...');
    setErrorMsg('');
    try {
      const contract = await getContract();
      const ipfsHash = `Qm${Array.from({ length: 44 }, () => Math.random().toString(36)[2]).join('')}`;
      const tx = await contract.mintHealthID(account, ipfsHash);
      addLog(`📝 Transaction sent: ${truncate(tx.hash)}`);
      setTxPending('Waiting for confirmation...');
      await tx.wait();
      const tid = await contract.balanceOf(account);
      setTokenId(tid.toString());
      addLog(`✅ Health ID Minted! Token #${tid.toString()}`);
      setTxPending('');
    } catch (err: any) {
      if (err.message?.includes('patient already has a HealthID')) {
        const contract = await getContract();
        const tid = await contract.balanceOf(account);
        setTokenId(tid.toString());
        addLog(`ℹ️ Already have Health ID #${tid.toString()}`);
      } else {
        setErrorMsg(err.message || 'Mint failed');
        addLog(`❌ Error: ${err.message}`);
      }
    }
    setTxPending('');
    setMinting(false);
  };

  const handleGrantAccess = async () => {
    if (!doctorAddress || !tokenId) return;
    setTxPending('Granting access...');
    setErrorMsg('');
    try {
      const contract = await getContract();
      const tx = await contract.grantAccess(tokenId, doctorAddress);
      addLog(`📝 Grant access tx: ${truncate(tx.hash)}`);
      await tx.wait();
      setDoctorAccess(prev => ({ ...prev, [doctorAddress]: true }));
      addLog(`✅ Access granted to ${truncate(doctorAddress)}`);
      setDoctorAddress('');
    } catch (err: any) {
      setErrorMsg(err.message);
      addLog(`❌ Error: ${err.message}`);
    }
    setTxPending('');
  };

  const handleRevokeAccess = async (doc: string) => {
    if (!tokenId) return;
    setTxPending('Revoking access...');
    try {
      const contract = await getContract();
      const tx = await contract.revokeAccess(tokenId, doc);
      addLog(`📝 Revoke access tx: ${truncate(tx.hash)}`);
      await tx.wait();
      setDoctorAccess(prev => { const n = { ...prev }; delete n[doc]; return n; });
      addLog(`✅ Access revoked from ${truncate(doc)}`);
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    }
    setTxPending('');
  };

  const handleGetRecord = async () => {
    if (!tokenId) return;
    try {
      const contract = await getContract();
      const hash = await contract.getRecord(tokenId);
      setRecordHash(hash);
      addLog(`📄 Record IPFS: ${hash}`);
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-3xl mb-6 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            <FiShield size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Web3 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Health ID</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your health identity as an NFT. Own your records. Grant and revoke doctor access on-chain via a Solidity smart contract.
          </p>
        </motion.div>

        <div className="max-w-lg mx-auto space-y-6">
          {/* Wallet Connection */}
          {status === 'disconnected' ? (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiShield size={28} className="text-white" />
              </div>
              <h3 className="text-white font-black text-lg mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 text-sm mb-6">Connect MetaMask to mint your Health ID NFT on-chain</p>
              <button onClick={handleConnect} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-[0.98] transition">
                <FiLink size={16} className="inline mr-2" /> Connect MetaMask
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center"><FiCheckCircle className="text-emerald-400" size={18} /></div>
                  <div>
                    <p className="text-white font-bold text-sm">Connected</p>
                    <p className="text-gray-500 text-xs font-mono">{account ? truncate(account) : ''}</p>
                  </div>
                </div>
                <button onClick={handleDisconnect} className="text-xs text-gray-500 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg transition">Disconnect</button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <FiCpu size={12} /> Network: {networkId === 80001 ? 'Polygon Mumbai' : networkId === 137 ? 'Polygon' : networkId === 1 ? 'Ethereum' : `Chain ${networkId}`}
              </div>
              {!tokenId ? (
                <button onClick={handleMint} disabled={minting}
                  className="w-full mt-3 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm disabled:opacity-40 transition active:scale-[0.98]"
                >
                  {minting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {txPending}
                    </span>
                  ) : '🪪 Mint Health ID NFT'}
                </button>
              ) : (
                <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-3">
                  <FiShield className="text-emerald-400 shrink-0" size={18} />
                  <div>
                    <p className="text-emerald-400 font-bold text-xs">Health ID Active</p>
                    <p className="text-emerald-400/60 text-[10px] font-mono">Token #{tokenId}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grant/Revoke Access */}
          {status === 'connected' && tokenId && (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2"><FiUserPlus className="text-indigo-400" /> Doctor Access Control</h3>
              <div className="flex gap-2">
                <input type="text" value={doctorAddress} onChange={e => setDoctorAddress(e.target.value)}
                  placeholder="0x... (doctor wallet address)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition"
                />
                <button onClick={handleGrantAccess} disabled={!doctorAddress || !!txPending}
                  className="px-4 py-2.5 bg-emerald-600/20 text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-600/30 transition disabled:opacity-30 border border-emerald-500/30"
                >
                  Grant
                </button>
              </div>

              <div className="space-y-2">
                {Object.keys(doctorAccess).length === 0 && (
                  <p className="text-gray-600 text-xs text-center py-2">No doctors granted access yet</p>
                )}
                {Object.entries(doctorAccess).map(([doc, granted]) => (
                  <div key={doc} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle size={12} className="text-emerald-400" />
                      <span className="text-xs font-mono text-gray-300">{truncate(doc)}</span>
                    </div>
                    <button onClick={() => handleRevokeAccess(doc)}
                      className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded-lg transition">
                      <FiUserX size={12} className="inline mr-1" /> Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Record */}
          {status === 'connected' && tokenId && (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2"><FiFileText className="text-purple-400" /> Health Record</h3>
              <button onClick={handleGetRecord}
                className="w-full py-3 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-xl text-sm font-bold hover:bg-purple-500/20 transition"
              >
                <FiRefreshCw size={14} className="inline mr-2" /> Fetch Record from Chain
              </button>
              {recordHash && (
                <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 truncate mr-2">{recordHash}</span>
                  <button onClick={() => navigator.clipboard.writeText(recordHash)}
                    className="text-indigo-400 hover:text-indigo-300 shrink-0">
                    <FiCopy size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Transaction Log */}
          {txLog.length > 0 && (
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Transaction Log</h4>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {txLog.map((log, i) => (
                  <p key={i} className="text-xs text-gray-400 font-mono">{log}</p>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
              <FiAlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <p className="text-red-300 text-xs">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Contract Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12 grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-3"><FiShield className="text-indigo-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">ERC-721 Health ID</h3>
            <p className="text-gray-500 text-xs">ERC-721 non-transferable NFT. Each patient gets exactly one unique Health ID token.</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3"><FiUserPlus className="text-purple-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">Granular Access Control</h3>
            <p className="text-gray-500 text-xs">Patients grant/revoke doctor access on-chain. Only authorised doctors can view records.</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3"><FiExternalLink className="text-emerald-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">IPFS + Blockchain</h3>
            <p className="text-gray-500 text-xs">Records stored on IPFS, hashes anchored on-chain. Immutable and verifiable.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
