'use client';

import { useState } from 'react';
import { FiUsers, FiMessageCircle, FiHeart, FiShield, FiPlus, FiSearch, FiThumbsUp, FiShare2, FiFlag, FiMoreHorizontal, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  icon: string;
  color: string;
  category: string;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  community: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isAnonymous: boolean;
}

const communities: Community[] = [
  { id: '1', name: 'Diabetes Fighters', description: 'Support for managing diabetes naturally', members: 12450, icon: '💉', color: 'from-red-500 to-orange-500', category: 'Chronic Conditions' },
  { id: '2', name: 'New Moms Circle', description: 'First-time mothers sharing experiences', members: 8920, icon: '👶', color: 'from-pink-500 to-rose-500', category: 'Parenting' },
  { id: '3', name: 'Mental Health Hub', description: 'Safe space for anxiety & depression support', members: 15680, icon: '🧠', color: 'from-purple-500 to-indigo-500', category: 'Mental Health' },
  { id: '4', name: 'Fitness Enthusiasts', description: 'Workout tips and motivation', members: 23400, icon: '💪', color: 'from-green-500 to-emerald-500', category: 'Fitness' },
  { id: '5', name: 'Heart Survivors', description: 'Cardiac health support group', members: 5680, icon: '❤️', color: 'from-red-600 to-pink-500', category: 'Chronic Conditions' },
  { id: '6', name: 'PCOS/PCOD Support', description: 'Women sharing PCOD journey', members: 7890, icon: '🌸', color: 'from-pink-400 to-purple-500', category: "Women's Health" },
  { id: '7', name: 'Seniors Wellness', description: 'Health tips for elderly care', members: 4560, icon: '👴', color: 'from-blue-500 to-cyan-500', category: 'Elder Care' },
  { id: '8', name: 'Quit Smoking', description: 'Support to quit tobacco', members: 6780, icon: '🚭', color: 'from-gray-500 to-slate-500', category: 'Addiction Recovery' },
];

const posts: Post[] = [
  { id: '1', author: 'Anonymous', avatar: 'A', community: 'Diabetes Fighters', time: '2 hours ago', content: 'My HbA1c dropped from 8.5 to 6.2 in 3 months! The key was not just medication but consistent walking and cutting carbs. Happy to answer any questions.', likes: 234, comments: 45, isLiked: false, isAnonymous: true },
  { id: '2', author: 'Priya S.', avatar: 'PS', community: 'New Moms Circle', time: '4 hours ago', content: 'Baby is 3 months now and sleeping through the night! The first 6 weeks were tough but it gets better. Any moms in the same boat?', likes: 156, comments: 89, isLiked: true, isAnonymous: false },
  { id: '3', author: 'Anonymous', avatar: 'A', community: 'Mental Health Hub', time: '6 hours ago', content: 'Day 30 of being anxiety-free. Meditation and therapy helped me a lot. Remember - it is okay to seek professional help.', likes: 567, comments: 123, isLiked: true, isAnonymous: true },
  { id: '4', author: 'Rahul K.', avatar: 'RK', community: 'Heart Survivors', time: '1 day ago', content: '3 months post-bypass surgery and feeling great! Moderation is key - can not do everything but can do most things.', likes: 234, comments: 56, isLiked: false, isAnonymous: false },
];

export default function CommunitiesPage() {
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'communities' | 'posts'>('communities');
  const [postContent, setPostContent] = useState('');

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl mb-6">
            <FiUsers size={32} className="text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Zyntra <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Communities</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Connect with people who understand your health journey. Anonymous, safe, and supportive.
          </p>
        </motion.div>

        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-[2rem] p-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl text-emerald-400 text-sm">
              <FiShield size={16} />
              <span>Anonymous & Verified</span>
            </div>
            <div className="flex items-center gap-2 bg-sky-500/10 px-4 py-2 rounded-xl text-sky-400 text-sm">
              <FiCheckCircle size={16} />
              <span>Doctor Verified Info</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('communities')}
            className={`px-6 py-3 rounded-2xl font-bold transition ${
              activeTab === 'communities' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'
            }`}
          >
            <FiUsers className="inline mr-2" /> Communities
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 rounded-2xl font-bold transition ${
              activeTab === 'posts' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'
            }`}
          >
            <FiMessageCircle className="inline mr-2" /> Recent Posts
          </button>
        </div>

        {activeTab === 'communities' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="relative mb-6">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {filteredCommunities.map((community) => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedCommunity(community.id)}
                    className={`bg-slate-900/80 border rounded-[2rem] p-6 cursor-pointer hover:border-purple-500/30 transition ${
                      selectedCommunity === community.id ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${community.color} flex items-center justify-center text-2xl`}>
                        {community.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{community.name}</h3>
                        <p className="text-xs text-gray-400">{community.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{community.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{community.members.toLocaleString()} members</span>
                      <button className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-sm font-bold transition">
                        Join
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">Categories</h3>
                <div className="space-y-2">
                  {['Chronic Conditions', 'Mental Health', "Women's Health", 'Parenting', 'Fitness', 'Elder Care'].map((cat) => (
                    <button key={cat} className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-3">Start New Community</h3>
                <p className="text-gray-400 text-sm mb-4">Create a safe space for others with similar health experiences.</p>
                <button className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white py-3 rounded-xl font-bold transition">
                  <FiPlus size={18} /> Create Community
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center font-bold">
                    Y
                  </div>
                  <textarea
                    placeholder="Share your health journey anonymously..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder:text-gray-500 resize-none outline-none"
                    rows={2}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition">
                      Anonymous
                    </button>
                  </div>
                  <button disabled={!postContent} className="px-6 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-bold transition">
                    Post
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center font-bold text-sm">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {post.isAnonymous ? 'Anonymous' : post.author}
                          <span className="text-gray-400 font-normal ml-2">in {post.community}</span>
                        </p>
                        <p className="text-xs text-gray-500">{post.time}</p>
                      </div>
                      <button className="text-gray-400 hover:text-white">
                        <FiMoreHorizontal size={20} />
                      </button>
                    </div>
                    <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                      <button className={`flex items-center gap-2 text-sm ${post.isLiked ? 'text-red-400' : 'text-gray-400'}`}>
                        <FiHeart className={post.isLiked ? 'fill-current' : ''} size={18} />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-400">
                        <FiMessageCircle size={18} />
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-400">
                        <FiShare2 size={18} />
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-400 ml-auto">
                        <FiFlag size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">Community Guidelines</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FiShield className="text-emerald-400 mt-1" size={18} />
                    <p className="text-sm text-gray-400">Be kind and supportive</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiShield className="text-emerald-400 mt-1" size={18} />
                    <p className="text-sm text-gray-400">No medical advice without verification</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiShield className="text-emerald-400 mt-1" size={18} />
                    <p className="text-sm text-gray-400">Report inappropriate content</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiShield className="text-emerald-400 mt-1" size={18} />
                    <p className="text-sm text-gray-400">Respect privacy</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4">Popular Communities</h3>
                <div className="space-y-3">
                  {communities.slice(0, 4).map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-lg`}>
                        {c.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.members.toLocaleString()} members</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}