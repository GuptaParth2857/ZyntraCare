'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiStar, FiSearch, FiFilter, FiThumbsUp, FiUser, FiCheck, FiArrowLeft, FiArrowRight, FiChevronDown, FiChevronUp, FiMessageSquare, FiEdit3, FiSend, FiX, FiEye, FiAward, FiClock, FiMapPin, FiHeart } from 'react-icons/fi';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  city: string;
  experience: number;
  rating: number;
  totalReviews: number;
  avatar: string;
}

interface Review {
  id: string;
  doctorId: string;
  userName: string;
  avatar: string;
  date: string;
  rating: number;
  title: string;
  text: string;
  visitType: string;
  wouldRecommend: boolean;
  anonymous: boolean;
  helpful: number;
  helpedByMe: boolean;
}

const VISIT_TYPES = ['OPD', 'Emergency', 'Surgery', 'Consultation'];
const SORT_OPTIONS = ['Most Recent', 'Highest Rated', 'Lowest Rated', 'Most Helpful'];

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl ${className}`}>
    {children}
  </div>
);

const StarRating = ({ rating, size = 18 }: { rating: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <FiStar key={s} size={size} className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
    ))}
  </div>
);

const RatingBar = ({ stars, count, total }: { stars: number; count: number; total: number }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-400 w-6">{stars}★</span>
    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }} transition={{ duration: 0.8, delay: 0.1 * (5 - stars) }} className="h-full bg-yellow-400 rounded-full" />
    </div>
    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
  </div>
);

export default function DoctorReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [sortBy, setSortBy] = useState('Most Recent');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareDoctor, setCompareDoctor] = useState<Doctor | null>(null);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ title: '', text: '', visitType: 'OPD', wouldRecommend: true, anonymous: false });
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverReviewRating, setHoverReviewRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [filterSpecialty, setFilterSpecialty] = useState('All');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctor-reviews');
        if (res.ok) {
          const data = await res.json();
          setDoctors(data.doctors || []);
        }
      } catch (e) {
        console.error('Failed to fetch doctors', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const fetchReviews = useCallback(async (doctorId: string) => {
    try {
      const res = await fetch(`/api/doctor-reviews?doctorId=${doctorId}`);
      if (res.ok) {
        const data = await res.json();
        setAllReviews(data.reviews || []);
      }
    } catch (e) {
      console.error('Failed to fetch reviews', e);
    }
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchReviews(selectedDoctor.id);
    }
  }, [selectedDoctor, fetchReviews]);

  const specialties = useMemo(() => ['All', ...Array.from(new Set(doctors.map(d => d.specialty)))], [doctors]);

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) || d.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'All' || d.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const doctorReviews = useMemo(() => {
    if (!selectedDoctor) return [];
    let reviews = allReviews.filter(r => r.doctorId === selectedDoctor.id);
    switch (sortBy) {
      case 'Highest Rated': reviews.sort((a, b) => b.rating - a.rating); break;
      case 'Lowest Rated': reviews.sort((a, b) => a.rating - b.rating); break;
      case 'Most Helpful': reviews.sort((a, b) => b.helpful - a.helpful); break;
      default: reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return reviews;
  }, [selectedDoctor, sortBy, allReviews]);

  const ratingDistribution = useMemo(() => {
    if (!selectedDoctor) return [0, 0, 0, 0, 0];
    const dist = [0, 0, 0, 0, 0];
    allReviews.filter(r => r.doctorId === selectedDoctor.id).forEach(r => { dist[r.rating - 1]++; });
    return dist;
  }, [selectedDoctor, allReviews]);

  const handleSubmitReview = async () => {
    if (!reviewRating || !newReview.title.trim() || !newReview.text.trim() || !selectedDoctor) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/doctor-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          userId: 'demo-user',
          rating: reviewRating,
          title: newReview.title,
          text: newReview.text,
          visitType: newReview.visitType,
          wouldRecommend: newReview.wouldRecommend,
          anonymous: newReview.anonymous,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.review) {
          setAllReviews(prev => [data.review, ...prev]);
        }
        setSubmitting(false);
        setSubmitted(true);
        setTimeout(() => {
          setShowReviewForm(false);
          setSubmitted(false);
          setReviewRating(0);
          setNewReview({ title: '', text: '', visitType: 'OPD', wouldRecommend: true, anonymous: false });
        }, 2000);
      }
    } catch (e) {
      console.error('Failed to submit review', e);
      setSubmitting(false);
    }
  };

  const toggleHelpful = (reviewId: string) => {
    setAllReviews(prev => prev.map(r => {
      if (r.id !== reviewId) return r;
      const newHelpedByMe = !r.helpedByMe;
      return { ...r, helpedByMe: newHelpedByMe, helpful: newHelpedByMe ? r.helpful + 1 : r.helpful - 1 };
    }));
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white py-12 px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.12, 0.26, 0.12], scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-violet-600/18 rounded-full blur-[175px]" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.08, 0.22, 0.08], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-600/14 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition mb-8 text-sm font-medium">
          <FiArrowLeft /> Back to ZyntraCare
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiStar size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Doctor Reviews & Ratings</h1>
          <p className="text-gray-400 text-lg">Real patient experiences from top Indian hospitals</p>
        </motion.div>

        {!selectedDoctor ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {/* Search & Filter */}
            <GlassCard className="p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search doctors by name, specialty, or hospital..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition"
                  />
                </div>
                <select
                  value={filterSpecialty}
                  onChange={e => setFilterSpecialty(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition appearance-none cursor-pointer min-w-[180px]"
                >
                  {specialties.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                </select>
              </div>
            </GlassCard>

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDoctors.map((doctor, i) => (
                <motion.div key={doctor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} whileHover={{ y: -4, scale: 1.01 }} className="cursor-pointer" onClick={() => setSelectedDoctor(doctor)}>
                  <GlassCard className="p-5 hover:border-violet-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-2xl border border-white/10">
                        {doctor.avatar}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">{doctor.name}</h3>
                        <p className="text-xs text-violet-400">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-400 mb-3">
                      <div className="flex items-center gap-1.5"><FiMapPin size={11} /> {doctor.hospital}, {doctor.city}</div>
                      <div className="flex items-center gap-1.5"><FiAward size={11} /> {doctor.experience} years experience</div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={Math.round(doctor.rating)} size={14} />
                        <span className="text-sm font-bold text-yellow-400">{doctor.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">{doctor.totalReviews} reviews</span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
            {filteredDoctors.length === 0 && (
              <div className="text-center text-gray-500 py-20">
                <FiSearch size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">No doctors found matching your search</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Doctor Header */}
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => { setSelectedDoctor(null); setShowReviewForm(false); }} className="text-gray-500 hover:text-white transition"><FiArrowLeft size={20} /></button>
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                    {selectedDoctor.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{selectedDoctor.name}</h2>
                    <p className="text-violet-400 font-medium">{selectedDoctor.specialty}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><FiMapPin size={12} /> {selectedDoctor.hospital}, {selectedDoctor.city}</span>
                      <span className="flex items-center gap-1"><FiAward size={12} /> {selectedDoctor.experience} yrs</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowCompare(true); setCompareDoctor(null); }} className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/10 transition flex items-center gap-2">
                    <FiEye size={16} /> Compare
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowReviewForm(true)} className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 flex items-center gap-2">
                    <FiEdit3 size={16} /> Write Review
                  </motion.button>
                </div>
              </div>
            </GlassCard>

            {/* Rating Summary + Compare */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary */}
              <GlassCard className="p-6">
                <h3 className="font-bold text-white mb-4">Rating Summary</h3>
                <div className="text-center mb-4">
                  <div className="text-5xl font-black text-yellow-400 mb-1">{selectedDoctor.rating}</div>
                  <StarRating rating={Math.round(selectedDoctor.rating)} size={20} />
                  <p className="text-sm text-gray-400 mt-1">{selectedDoctor.totalReviews} reviews</p>
                </div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(s => (
                    <RatingBar key={s} stars={s} count={ratingDistribution[s - 1]} total={doctorReviews.length || 1} />
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-sm text-gray-400">
                  <div className="flex justify-between"><span>Would recommend</span><span className="text-emerald-400 font-bold">{Math.round((doctorReviews.filter(r => r.wouldRecommend).length / Math.max(doctorReviews.length, 1)) * 100)}%</span></div>
                </div>
              </GlassCard>

              {/* Compare Panel */}
              <div className="lg:col-span-2">
                {showCompare ? (
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white">Compare Doctors</h3>
                      <button onClick={() => { setShowCompare(false); setCompareDoctor(null); }} className="text-gray-500 hover:text-white"><FiX size={18} /></button>
                    </div>
                    <div className="mb-4">
                      <select
                        value={compareDoctor?.id || ''}
                        onChange={e => setCompareDoctor(doctors.find(d => d.id === e.target.value) || null)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900">Select a doctor to compare...</option>
                        {doctors.filter(d => d.id !== selectedDoctor?.id).map(d => (
                          <option key={d.id} value={d.id} className="bg-slate-900">{d.name} — {d.specialty}</option>
                        ))}
                      </select>
                    </div>
                    {compareDoctor && selectedDoctor && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 text-gray-500 font-medium">Metric</th>
                              <th className="text-left py-3 text-violet-400 font-medium">{selectedDoctor.name.split(' ').slice(-1)[0]}</th>
                              <th className="text-left py-3 text-emerald-400 font-medium">{compareDoctor.name.split(' ').slice(-1)[0]}</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-300">
                            <tr className="border-b border-white/5"><td className="py-2.5 text-gray-500">Specialty</td><td>{selectedDoctor.specialty}</td><td>{compareDoctor.specialty}</td></tr>
                            <tr className="border-b border-white/5"><td className="py-2.5 text-gray-500">Hospital</td><td>{selectedDoctor.hospital}</td><td>{compareDoctor.hospital}</td></tr>
                            <tr className="border-b border-white/5"><td className="py-2.5 text-gray-500">Experience</td><td>{selectedDoctor.experience} yrs</td><td>{compareDoctor.experience} yrs</td></tr>
                            <tr className="border-b border-white/5"><td className="py-2.5 text-gray-500">Rating</td><td className="text-yellow-400 font-bold">{selectedDoctor.rating} ★</td><td className="text-yellow-400 font-bold">{compareDoctor.rating} ★</td></tr>
                            <tr><td className="py-2.5 text-gray-500">Reviews</td><td>{selectedDoctor.totalReviews}</td><td>{compareDoctor.totalReviews}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </GlassCard>
                ) : (
                  <GlassCard className="p-6">
                    <h3 className="font-bold text-white mb-4">Top Patient Reviews</h3>
                    <div className="space-y-3">
                      {allReviews.filter(r => r.doctorId === selectedDoctor.id).sort((a, b) => b.helpful - a.helpful).slice(0, 3).map(review => (
                        <div key={review.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">{review.avatar}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-white">{review.userName}</span>
                                <StarRating rating={review.rating} size={12} />
                                {review.wouldRecommend && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><FiHeart size={8} /> Recommends</span>}
                              </div>
                              <p className="text-xs text-gray-400 mb-1">{review.title}</p>
                            </div>
                            <span className="text-xs text-gray-600 shrink-0">{review.helpful} helpful</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </div>
            </div>

            {/* Sort + Reviews List */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">All Reviews ({doctorReviews.length})</h3>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none appearance-none cursor-pointer">
                {SORT_OPTIONS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              {doctorReviews.map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                  <GlassCard className="p-5 hover:border-white/15 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">{review.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-semibold text-white">{review.userName}</span>
                          <StarRating rating={review.rating} size={13} />
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">{review.visitType}</span>
                          {review.wouldRecommend && <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><FiHeart size={8} /> Recommends</span>}
                        </div>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><FiClock size={10} /> {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <h4 className="font-bold text-white text-sm mb-1">{review.title}</h4>
                        <p className={`text-sm text-gray-300 leading-relaxed ${expandedReview === review.id ? '' : 'line-clamp-2'}`}>{review.text}</p>
                        {review.text.length > 150 && (
                          <button onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)} className="text-xs text-violet-400 hover:text-violet-300 mt-1 flex items-center gap-1">
                            {expandedReview === review.id ? <><FiChevronUp /> Show less</> : <><FiChevronDown /> Read more</>}
                          </button>
                        )}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleHelpful(review.id)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${review.helpedByMe ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'}`}>
                            <FiThumbsUp size={12} /> Helpful ({review.helpful})
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !submitting && setShowReviewForm(false)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()} className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {submitted ? (
                  <div className="text-center py-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheck size={32} className="text-white" />
                    </motion.div>
                    <h3 className="text-xl font-black text-white mb-2">Review Submitted!</h3>
                    <p className="text-gray-400">Thank you for sharing your experience.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">Write a Review</h3>
                      <button onClick={() => setShowReviewForm(false)} className="text-gray-500 hover:text-white"><FiX size={20} /></button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="text-gray-300 font-semibold text-sm block mb-3">Your Rating *</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <motion.button key={star} type="button" whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }} onClick={() => setReviewRating(star)} onMouseEnter={() => setHoverReviewRating(star)} onMouseLeave={() => setHoverReviewRating(0)} className="text-3xl transition">
                              <FiStar className={`transition-colors ${star <= (hoverReviewRating || reviewRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} fill={star <= (hoverReviewRating || reviewRating) ? 'currentColor' : 'none'} />
                            </motion.button>
                          ))}
                          {reviewRating > 0 && <span className="ml-2 text-gray-400 text-sm self-center">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][reviewRating]}</span>}
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-300 font-semibold text-sm block mb-2">Review Title *</label>
                        <input value={newReview.title} onChange={e => setNewReview({ ...newReview, title: e.target.value })} placeholder="Summarize your experience" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition" />
                      </div>

                      <div>
                        <label className="text-gray-300 font-semibold text-sm block mb-2">Your Review *</label>
                        <textarea value={newReview.text} onChange={e => setNewReview({ ...newReview, text: e.target.value })} rows={4} placeholder="Share details about your visit, treatment, and overall experience..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition resize-none" />
                      </div>

                      <div>
                        <label className="text-gray-300 font-semibold text-sm block mb-2">Visit Type</label>
                        <div className="flex flex-wrap gap-2">
                          {VISIT_TYPES.map(vt => (
                            <button key={vt} type="button" onClick={() => setNewReview({ ...newReview, visitType: vt })} className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition ${newReview.visitType === vt ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                              {vt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-semibold text-sm">Would you recommend this doctor?</span>
                        <button type="button" onClick={() => setNewReview({ ...newReview, wouldRecommend: !newReview.wouldRecommend })} className={`w-12 h-6 rounded-full transition-all relative ${newReview.wouldRecommend ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                          <motion.div animate={{ x: newReview.wouldRecommend ? 24 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-semibold text-sm">Post anonymously</span>
                        <button type="button" onClick={() => setNewReview({ ...newReview, anonymous: !newReview.anonymous })} className={`w-12 h-6 rounded-full transition-all relative ${newReview.anonymous ? 'bg-violet-500' : 'bg-gray-700'}`}>
                          <motion.div animate={{ x: newReview.anonymous ? 24 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
                        </button>
                      </div>

                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmitReview} disabled={submitting || !reviewRating || !newReview.title.trim() || !newReview.text.trim()} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-lg transition shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2">
                        {submitting ? (
                          <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Submitting...</>
                        ) : (
                          <><FiSend /> Submit Review</>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
