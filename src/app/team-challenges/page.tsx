'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiPlus, FiTarget, FiX, FiAward, FiZap, FiClock, FiUser, FiShield, FiLock, FiInfo, FiLoader, FiChevronDown, FiCheck,
} from 'react-icons/fi';
import { useSession } from 'next-auth/react';

interface TeamMember {
  name: string;
  contribution: number;
  avatar: string;
  isYou?: boolean;
}

interface TeamChallenge {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  color: string;
  dailyGoal: string;
  duration: number;
  daysLeft: number;
  ended: boolean;
  reward: number;
  maxMembers: number;
  progress: number;
  target: number;
  isActive: boolean;
  isJoined: boolean;
  isOwner: boolean;
  membersCount: number;
  leaderboardPoints: number;
  membersList: TeamMember[];
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  icon: string;
  color: string;
  membersCount: number;
  points: number;
  youJoined: boolean;
}

const CHALLENGE_TYPES = [
  { id: 'steps', name: 'Team Steps', icon: '👟', description: 'Collect the most steps as a team', color: 'from-blue-500 to-cyan-500' },
  { id: 'hydration', name: 'Hydration', icon: '💧', description: 'Team water intake goal', color: 'from-teal-500 to-emerald-500' },
  { id: 'meditation', name: 'Meditation', icon: '🧘', description: 'Team meditation minutes', color: 'from-purple-500 to-violet-500' },
  { id: 'workout', name: 'Workout', icon: '🏋️', description: 'Team workout sessions', color: 'from-orange-500 to-red-500' },
  { id: 'checkups', name: 'Health Checkups', icon: '🩺', description: 'Team health checkups completed', color: 'from-green-500 to-lime-500' },
];

export default function TeamChallengesPage() {
  const { data: session, status } = useSession();
  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const userId = demoMode ? 'demo-user' : (session?.user as any)?.id || '';
  const isAuthenticated = demoMode || status === 'authenticated';

  const [activeTab, setActiveTab] = useState<'active' | 'leaderboards'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [challenges, setChallenges] = useState<TeamChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contributionValue, setContributionValue] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(5);
  const [duration, setDuration] = useState<7 | 14 | 30>(7);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`/api/team-challenges${demoMode ? '?userId=demo-user' : ''}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setChallenges(Array.isArray(data.challenges) ? data.challenges : []);
        setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      })
      .catch((e) => setError(e.message || 'Could not load team challenges'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, demoMode]);

  const applyChallengeUpdate = (updated?: TeamChallenge) => {
    if (!updated) return;
    setChallenges(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const reloadLeaderboard = async () => {
    try {
      const res = await fetch(`/api/team-challenges${demoMode ? '?userId=demo-user' : ''}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.leaderboard)) setLeaderboard(data.leaderboard);
    } catch {}
  };

  const handleCreateChallenge = async () => {
    if (!selectedType || !teamName.trim()) return;
    setBusyId('create');
    setError('');
    try {
      const res = await fetch('/api/team-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...(demoMode ? { userId: 'demo-user' } : {}),
          name: teamName,
          type: selectedType,
          duration,
          maxMembers: teamSize,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create team');
      setChallenges(prev => [data.challenge, ...prev]);
      setShowCreateModal(false);
      setTeamName('');
      setSelectedType(null);
      await reloadLeaderboard();
    } catch (e: any) {
      setError(e.message || 'Failed to create team');
    } finally {
      setBusyId(null);
    }
  };

  const handleJoinLeave = async (team: TeamChallenge, action: 'join' | 'leave') => {
    setBusyId(team.id);
    setError('');
    try {
      const res = await fetch('/api/team-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          challengeId: team.id,
          ...(demoMode ? { userId: 'demo-user' } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      applyChallengeUpdate(data.challenge);
      await reloadLeaderboard();
    } catch (e: any) {
      setError(e.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleContribute = async (team: TeamChallenge) => {
    const value = Number(contributionValue[team.id]);
    if (!Number.isFinite(value) || value <= 0) return;
    setBusyId(team.id);
    setError('');
    try {
      const res = await fetch('/api/team-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'contribute',
          challengeId: team.id,
          value,
          ...(demoMode ? { userId: 'demo-user' } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log progress');
      applyChallengeUpdate(data.challenge);
      setContributionValue(prev => ({ ...prev, [team.id]: '' }));
      await reloadLeaderboard();
    } catch (e: any) {
      setError(e.message || 'Failed to log progress');
    } finally {
      setBusyId(null);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-black';
    if (rank === 2) return 'bg-gray-400 text-black';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-white/10 text-white';
  };

  const totalMembers = challenges.reduce((sum, c) => sum + c.membersCount, 0);
  const rewardPool = challenges.reduce((sum, c) => sum + c.reward, 0);
  const challengesWon = challenges.filter(c => c.progress === 100 && c.ended).length;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl mb-6">
            <FiUsers size={32} className="text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Team Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Challenges</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Build teams, compete for collective goals, and climb the team leaderboards.
          </p>
        </motion.div>

        {!isAuthenticated && status !== 'loading' ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto bg-white/[0.03] border border-white/10 rounded-[2rem] p-10 text-center backdrop-blur-xl"
          >
            <div className="w-14 h-14 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5">
              <FiLock className="text-indigo-400" size={24} />
            </div>
            <h2 className="text-2xl font-black mb-2">Private to your account</h2>
            <p className="text-white/50 text-sm mb-8">Team challenges and leaderboards are tied to your account. Sign in to create or join teams.</p>
            <a href="/auth/signin" className="inline-flex px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-sm hover:from-indigo-500 hover:to-violet-500 transition">
              Sign In
            </a>
            <p className="text-white/20 text-xs mt-4">Hot preview at <span className="font-mono text-white/40">/team-challenges?demo=1</span></p>
          </motion.div>
        ) : status === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <FiLoader className="animate-spin text-indigo-400" size={32} />
            <p className="text-white/40 text-sm">Loading…</p>
          </div>
        ) : (
          <>
            {demoMode && (
              <div className="max-w-6xl mx-auto mb-6 flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm font-bold">
                <FiInfo size={16} className="flex-shrink-0" />
                Viewing demo dataset. Sign in to use your own account.
              </div>
            )}

            {error && (
              <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                <p className="text-red-400/90 text-sm font-medium flex-1">{error}</p>
                <button onClick={() => setError('')} className="px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs font-bold hover:bg-red-500/30 transition">Dismiss</button>
              </div>
            )}

            <div className="max-w-6xl mx-auto bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FiUsers className="text-blue-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{challenges.length}</p>
                  <p className="text-xs text-gray-400">Active Teams</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FiTarget className="text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{totalMembers}</p>
                  <p className="text-xs text-gray-400">Total Members</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FiZap className="text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{rewardPool}</p>
                  <p className="text-xs text-gray-400">Rewards Pool (coins)</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FiAward className="text-purple-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{challengesWon}</p>
                  <p className="text-xs text-gray-400">Challenges Won</p>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto flex gap-2 mb-8 flex-wrap">
              {[
                { id: 'active' as const, label: 'Active Teams', icon: <FiTarget /> },
                { id: 'leaderboards' as const, label: 'Team Leaderboard', icon: <FiAward /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
              <button
                onClick={() => setShowCreateModal(true)}
                className="ml-auto flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-sm transition hover:from-green-500 hover:to-emerald-500"
              >
                <FiPlus size={16} /> Create Team
              </button>
            </div>

            {activeTab === 'active' && (
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                {loading ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 gap-3">
                    <FiLoader className="animate-spin text-indigo-400" size={32} />
                    <p className="text-white/40 text-sm">Loading teams…</p>
                  </div>
                ) : challenges.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white/[0.03] border border-white/10 rounded-[2rem]">
                    <FiUsers size={40} className="text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 font-bold text-lg mb-1">No teams yet</p>
                    <p className="text-white/30 text-sm mb-6">Create the first challenge and invite your friends.</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-sm hover:from-blue-500 hover:to-cyan-500 transition"
                    >
                      <FiPlus size={16} /> Create Team
                    </button>
                  </div>
                ) : (
                  challenges.map((challenge, idx) => {
                    const expanded = expandedId === challenge.id;
                    const busy = busyId === challenge.id;
                    return (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 self-start"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${challenge.color} flex items-center justify-center text-2xl`}>
                              {challenge.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-white">{challenge.name}</h3>
                              <p className="text-xs text-gray-400">{challenge.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {challenge.isOwner ? (
                              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                                <FiUser size={11} /> You
                              </span>
                            ) : null}
                            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg font-bold">
                              +{challenge.reward} coins
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">
                            <FiUsers className="inline mr-1" size={12} />
                            {challenge.membersCount}/{challenge.maxMembers} members
                          </span>
                          <span className="text-xs font-bold text-white">
                            {challenge.ended ? 'Ended' : challenge.dailyGoal}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${challenge.progress}%` }}
                              transition={{ duration: 0.8 }}
                              className={`h-full bg-gradient-to-r ${challenge.color} rounded-full`}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-400">{challenge.progress}% achieved</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <FiClock size={11} /> {challenge.daysLeft} days left
                            </span>
                          </div>
                        </div>

                        {expanded ? (
                          <div className="space-y-2 mb-4">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <span className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full font-bold">
                                {challenge.dailyGoal}
                              </span>
                              <span className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full font-bold">
                                Target: {(challenge.target || 0).toLocaleString()}
                              </span>
                            </div>
                            {challenge.membersList.length === 0 ? (
                              <p className="text-sm text-white/40 py-4 text-center">No members yet</p>
                            ) : (
                              challenge.membersList.map((member, mi) => (
                                <div key={mi} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${challenge.color} flex items-center justify-center text-xs font-bold text-white`}>
                                    {member.avatar}
                                  </div>
                                  <span className="text-sm font-medium text-white flex-1">
                                    {member.name}
                                    {member.isYou ? <span className="text-emerald-400 ml-1">(you)</span> : null}
                                  </span>
                                  <span className="text-sm font-bold text-emerald-400">{member.contribution.toLocaleString()}</span>
                                </div>
                              ))
                            )}

                            {challenge.isJoined && !challenge.ended && (
                              <div className="mt-3 p-3 bg-white/5 rounded-xl">
                                <p className="text-xs text-gray-400 font-bold mb-2">Log today&apos;s progress</p>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={contributionValue[challenge.id] || ''}
                                    onChange={(e) => setContributionValue(prev => ({ ...prev, [challenge.id]: e.target.value }))}
                                    placeholder="Value (e.g. steps, glasses, minutes)"
                                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                  />
                                  <button
                                    onClick={() => handleContribute(challenge)}
                                    disabled={busy}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl font-bold text-sm hover:from-emerald-500 hover:to-green-500 transition disabled:opacity-50"
                                  >
                                    {busy ? 'Saving…' : 'Log'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5 mb-4">
                            {challenge.membersList.slice(0, 3).map((member, mi) => (
                              <div key={mi} className="flex items-center gap-2 text-xs">
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${challenge.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                                  {member.avatar}
                                </div>
                                <span className="font-medium text-white/80">{member.name}</span>
                                <span className="ml-auto font-bold text-emerald-400">{member.contribution.toLocaleString()}</span>
                              </div>
                            ))}
                            {challenge.membersList.length > 3 && (
                              <p className="text-xs text-gray-500 pt-1">+{challenge.membersList.length - 3} more members</p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                          {challenge.ended ? (
                            <div className="flex-1 py-3 text-center text-xs bg-white/5 border border-white/10 rounded-xl font-bold">
                              {challenge.progress >= 100 ? '🏆 Round completed' : 'Challenge ended'}
                            </div>
                          ) : challenge.isJoined ? (
                            <button
                              onClick={() => handleJoinLeave(challenge, 'leave')}
                              disabled={challenge.isOwner || busy}
                              className={`flex-1 py-3 rounded-xl font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                challenge.isOwner
                                  ? 'bg-white/5 border border-white/10 text-gray-400'
                                  : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                              }`}
                              title={challenge.isOwner ? 'Creator cannot leave the team' : 'Leave team'}
                            >
                              {challenge.isOwner ? 'You created this' : busy ? 'Working…' : 'Leave Team'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinLeave(challenge, 'join')}
                              disabled={challenge.membersCount >= challenge.maxMembers || busy}
                              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-sm hover:from-blue-500 hover:to-cyan-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {challenge.membersCount >= challenge.maxMembers ? 'Team Full' : busy ? 'Joining…' : 'Join Team'}
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedId(expanded ? null : challenge.id)}
                            className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition flex items-center gap-2"
                          >
                            {expanded ? 'Hide' : 'Details'}
                            <FiChevronDown className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'leaderboards' && (
              <div className="max-w-6xl mx-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <FiLoader className="animate-spin text-indigo-400" size={32} />
                    <p className="text-white/40 text-sm">Loading leaderboard…</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-20 bg-white/[0.03] border border-white/10 rounded-[2rem]">
                    <FiAward size={40} className="text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 font-bold text-lg">No teams on the board yet</p>
                    <p className="text-white/30 text-sm mt-1">Create a team to start climbing.</p>
                  </div>
                ) : (
                  <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                    <div className="space-y-2">
                      {leaderboard.map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex items-center gap-4 p-4 rounded-xl ${entry.youJoined ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/5'}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${getRankColor(entry.rank)}`}>
                            {entry.rank}
                          </div>
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center text-lg`}>
                            {entry.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-white text-sm">
                              {entry.name}
                              {entry.youJoined ? <span className="text-emerald-400 text-xs ml-1">(you)</span> : null}
                            </p>
                            <p className="text-xs text-gray-500">{entry.membersCount} members · total logged points</p>
                          </div>
                          <p className="text-amber-400 font-bold">{entry.points.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-white/25 text-[10px] mt-4 text-center">
                      Leaderboard ranks teams by total logged progress points. Fair-play: only members can add progress.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setShowCreateModal(false)}>
          <div
            className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Create Team Challenge</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-gray-300 mb-3 block">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Family Walking Squad"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-gray-300 mb-3 block">Challenge Type</label>
              <div className="grid grid-cols-2 gap-3">
                {CHALLENGE_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border text-left transition ${
                      selectedType === type.id
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <p className={`font-bold text-sm ${selectedType === type.id ? 'text-blue-400' : 'text-white'}`}>{type.name}</p>
                    <p className="text-[10px] text-gray-400">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Max Members</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={teamSize}
                  onChange={(e) => setTeamSize(parseInt(e.target.value) || 5)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Duration</label>
                <div className="flex gap-2">
                  {[7, 14, 30].map(dur => (
                    <button
                      key={dur}
                      onClick={() => setDuration(dur as 7 | 14 | 30)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${
                        duration === dur
                          ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {dur}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400">
              <FiShield className="inline mr-1 text-emerald-400" />
              Teams are saved to your account. Members log their own progress — the team&apos;s total moves the progress bar.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition">
                Cancel
              </button>
              <button
                onClick={handleCreateChallenge}
                disabled={!selectedType || !teamName.trim() || busyId === 'create'}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busyId === 'create' ? 'Creating…' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}