'use client';

import { useState, useEffect } from 'react';
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

export default function CommunitiesPage() {
  const [communitiesData, setCommunitiesData] = useState<Community[]>([]);
  const [postsData, setPostsData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'communities' | 'posts'>('communities');
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/communities').then(r => r.json()),
      fetch('/api/communities/posts').then(r => r.json())
    ])
      .then(([communitiesRes, postsRes]) => {
        setCommunitiesData(communitiesRes.communities || communitiesRes || []);
        setPostsData(postsRes.posts || postsRes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCommunities = communitiesData.filter(c => 
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
                {postsData.map((post) => (
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
                  {communitiesData.slice(0, 4).map((c) => (
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