'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiPlus, FiTarget, FiCheckCircle, FiX, FiAward, FiZap, FiClock, FiUser, FiShield } from 'react-icons/fi';
import Link from 'next/link';

interface TeamChallenge {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  members: number;
  maxMembers: number;
  progress: number;
  dailyGoal: string;
  duration: number;
  daysLeft: number;
  reward: number;
  color: string;
  membersList: { name: string; contribution: number; avatar: string }[];
  isActive: boolean;
}

const CHALLENGE_TYPES = [
  { id: 'steps', name: 'Team Steps', icon: '👟', description: 'Collect the most steps as a team', color: 'from-blue-500 to-cyan-500' },
  { id: 'hydration', name: 'Hydration', icon: '💧', description: 'Team water intake goal', color: 'from-teal-500 to-emerald-500' },
  { id: 'meditation', name: 'Meditation', icon: '🧘', description: 'Team meditation minutes', color: 'from-purple-500 to-violet-500' },
  { id: 'workout', name: 'Workout', icon: '🏋️', description: 'Team workout sessions', color: 'from-orange-500 to-red-500' },
  { id: 'checkups', name: 'Health Checkups', icon: '🩺', description: 'Team health checkups completed', color: 'from-green-500 to-lime-500' },
];

export default function TeamChallengesPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'leaderboards' | 'create'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([
    {
      id: '1',
      name: 'Family Walking Squad',
      description: 'Walk 10,000 steps daily as a team',
      type: 'steps',
      icon: '👟',
      members: 4,
      maxMembers: 8,
      progress: 72,
      dailyGoal: '10,000 steps',
      duration: 7,
      daysLeft: 3,
      reward: 500,
      color: 'from-blue-500 to-cyan-500',
      membersList: [
        { name: 'Parth G.', contribution: 12500, avatar: 'P' },
        { name: 'Priya M.', contribution: 9800, avatar: 'P' },
        { name: 'Rahul V.', contribution: 8200, avatar: 'R' },
        { name: 'Ananya S.', contribution: 7400, avatar: 'A' },
      ],
      isActive: true,
    },
    {
      id: '2',
      name: 'Apartment Hydration League',
      description: 'Combined water intake of 100 glasses daily',
      type: 'hydration',
      icon: '💧',
      members: 6,
      maxMembers: 10,
      progress: 45,
      dailyGoal: '100 glasses',
      duration: 14,
      daysLeft: 8,
      reward: 800,
      color: 'from-teal-500 to-emerald-500',
      membersList: [
        { name: 'Neha K.', contribution: 18, avatar: 'N' },
        { name: 'Vikram S.', contribution: 16, avatar: 'V' },
        { name: 'Sonia R.', contribution: 14, avatar: 'S' },
        { name: 'Ajay T.', contribution: 12, avatar: 'A' },
      ],
      isActive: true,
    },
    {
      id: '3',
      name: 'Office Stress Busters',
      description: 'Team meditation of 300 minutes this week',
      type: 'meditation',
      icon: '🧘',
      members: 5,
      maxMembers: 12,
      progress: 60,
      dailyGoal: '300 min',
      duration: 7,
      daysLeft: 2,
      reward: 600,
      color: 'from-purple-500 to-violet-500',
      membersList: [
        { name: 'Kiran J.', contribution: 45, avatar: 'K' },
        { name: 'Mohan D.', contribution: 38, avatar: 'M' },
        { name: 'Divya P.', contribution: 35, avatar: 'D' },
        { name: 'Arjun B.', contribution: 30, avatar: 'A' },
      ],
      isActive: true,
    },
  ]);

  const [leaderboards, setLeaderboards] = useState([
    { rank: 1, team: 'Fit Family', members: 5, points: 2450, icon: '👨‍👩‍👧‍👦', color: 'from-amber-500 to-orange-500' },
    { rank: 2, team: 'Step Squad', members: 8, points: 2100, icon: '👟', color: 'from-blue-500 to-cyan-500' },
    { rank: 3, team: 'H2O Heroes', members: 6, points: 1850, icon: '💧', color: 'from-teal-500 to-emerald-500' },
    { rank: 4, team: 'Zen Zone', members: 4, points: 1600, icon: '🧘', color: 'from-purple-500 to-violet-500' },
    { rank: 5, team: 'Gym Buddies', members: 7, points: 1400, icon: '🏋️', color: 'from-orange-500 to-red-500' },
  ]);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(5);
  const [duration, setDuration] = useState<7 | 14 | 30>(7);

  const handleCreateChallenge = () => {
    if (!selectedType || !teamName.trim()) return;
    const type = CHALLENGE_TYPES.find(t => t.id === selectedType);
    if (!type) return;

    const newChallenge: TeamChallenge = {
      id: Date.now().toString(),
      name: teamName,
      description: type.description,
      type: type.id,
      icon: type.icon,
      members: 1,
      maxMembers: teamSize,
      progress: 0,
      dailyGoal: type.id === 'steps' ? '10,000 steps' : type.id === 'hydration' ? '100 glasses' : type.id === 'meditation' ? '300 min' : '5 sessions',
      duration,
      daysLeft: duration,
      reward: type.id === 'hydration' ? 500 : 600,
      color: type.color,
      membersList: [{ name: 'You', contribution: 0, avatar: 'Y' }],
      isActive: true,
    };

    setTeamChallenges(prev => [newChallenge, ...prev]);
    setShowCreateModal(false);
    setTeamName('');
    setSelectedType(null);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-black';
    if (rank === 2) return 'bg-gray-400 text-black';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-white/10 text-white';
  };

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

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FiUsers className="text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white">{teamChallenges.length}</p>
              <p className="text-xs text-gray-400">Active Teams</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FiTarget className="text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">{teamChallenges.reduce((sum, c) => sum + c.members, 0)}</p>
              <p className="text-xs text-gray-400">Total Members</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FiZap className="text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white">{teamChallenges.reduce((sum, c) => sum + c.reward, 0)}</p>
              <p className="text-xs text-gray-400">Rewards Pool (coins)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FiAward className="text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">{teamChallenges.filter(c => c.progress === 100).length + 3}</p>
              <p className="text-xs text-gray-400">Challenges Won</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
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

        <AnimatePresence mode="wait">
          {/* Active Teams */}
          {activeTab === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {teamChallenges.map((challenge, idx) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
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
                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg font-bold">
                      +{challenge.reward} coins
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      <FiUsers className="inline mr-1" size={12} />
                      {challenge.members}/{challenge.maxMembers} members
                    </span>
                    <span className="text-xs font-bold text-white">{challenge.dailyGoal}</span>
                  </div>

                  <div className="mb-4">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.progress}%` }}
                        transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
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

                  {/* Team Members */}
                  <div className="space-y-2 mb-4">
                    {challenge.membersList.map((member, mi) => (
                      <div key={mi} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${challenge.color} flex items-center justify-center text-xs font-bold text-white`}>
                          {member.avatar}
                        </div>
                        <span className="text-sm font-medium text-white flex-1">{member.name}</span>
                        <span className="text-sm font-bold text-emerald-400">{member.contribution.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-sm hover:from-blue-500 hover:to-cyan-500 transition">
                      Join Team
                    </button>
                    <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Leaderboard */}
          {activeTab === 'leaderboards' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Top 3 Podium */}
              <div className="flex items-end justify-center gap-4 mb-8">
                {[leaderboards[1], leaderboards[0], leaderboards[2]].filter(Boolean).map((entry, idx) => {
                  const heights = ['h-24', 'h-32', 'h-20'];
                  const medals = ['🥈', '🥇', '🥉'];
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center text-2xl mb-2`}>
                        {entry.icon}
                      </div>
                      <p className="text-sm font-bold text-white mb-1">{entry.team}</p>
                      <p className="text-xs text-amber-400 mb-2">{entry.points.toLocaleString()} pts</p>
                      <div className={`${heights[idx]} w-24 rounded-t-xl bg-gradient-to-t ${
                        idx === 1 ? 'from-yellow-500 to-yellow-600' :
                        idx === 0 ? 'from-gray-500 to-gray-400' :
                        'from-amber-700 to-amber-600'
                      } flex items-center justify-center`}>
                        <span className="text-3xl">{medals[idx]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Leaderboard */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <div className="space-y-2">
                  {leaderboards.map((entry) => (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: entry.rank * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${getRankColor(entry.rank)}`}>
                        {entry.rank}
                      </div>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center text-lg`}>
                        {entry.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{entry.team}</p>
                        <p className="text-xs text-gray-500">{entry.members} members</p>
                      </div>
                      <p className="text-amber-400 font-bold">{entry.points.toLocaleString()}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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

              <div className="flex gap-3">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition">
                  Cancel
                </button>
                <button
                  onClick={handleCreateChallenge}
                  disabled={!selectedType || !teamName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Team
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
