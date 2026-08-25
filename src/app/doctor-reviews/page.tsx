'use client';

import { useState, useMemo } from 'react';
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

const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Priya Sharma', specialty: 'Cardiology', hospital: 'AIIMS Delhi', city: 'New Delhi', experience: 22, rating: 4.8, totalReviews: 342, avatar: '👩‍⚕️' },
  { id: 'd2', name: 'Dr. Rajesh Gupta', specialty: 'Orthopedics', hospital: 'Fortis Hospital', city: 'Mumbai', experience: 18, rating: 4.6, totalReviews: 218, avatar: '👨‍⚕️' },
  { id: 'd3', name: 'Dr. Anita Desai', specialty: 'Neurology', hospital: 'Max Hospital', city: 'Gurgaon', experience: 15, rating: 4.7, totalReviews: 189, avatar: '👩‍⚕️' },
  { id: 'd4', name: 'Dr. Suresh Patel', specialty: 'Gastroenterology', hospital: 'Apollo Hospital', city: 'Chennai', experience: 20, rating: 4.5, totalReviews: 276, avatar: '👨‍⚕️' },
  { id: 'd5', name: 'Dr. Meera Nair', specialty: 'Dermatology', hospital: 'CMC Vellore', city: 'Vellore', experience: 12, rating: 4.9, totalReviews: 156, avatar: '👩‍⚕️' },
  { id: 'd6', name: 'Dr. Arjun Singh', specialty: 'Pulmonology', hospital: 'Medanta Hospital', city: 'Gurgaon', experience: 17, rating: 4.4, totalReviews: 198, avatar: '👨‍⚕️' },
  { id: 'd7', name: 'Dr. Kavita Reddy', specialty: 'Oncology', hospital: 'Tata Memorial', city: 'Mumbai', experience: 25, rating: 4.8, totalReviews: 412, avatar: '👩‍⚕️' },
  { id: 'd8', name: 'Dr. Vikram Joshi', specialty: 'Endocrinology', hospital: 'Manipal Hospital', city: 'Bangalore', experience: 14, rating: 4.3, totalReviews: 167, avatar: '👨‍⚕️' },
];

const VISIT_TYPES = ['OPD', 'Emergency', 'Surgery', 'Consultation'];
const SORT_OPTIONS = ['Most Recent', 'Highest Rated', 'Lowest Rated', 'Most Helpful'];

const ALL_REVIEWS: Review[] = [
  { id: 'r1', doctorId: 'd1', userName: 'Amit Kumar', avatar: 'AK', date: '2026-08-15', rating: 5, title: 'Life-saving cardiac intervention', text: 'Dr. Priya Sharma performed my angioplasty with exceptional skill. She explained every step calmly and the nursing staff at AIIMS was phenomenal. Recovery was smooth within 3 days. Highly recommend for any cardiac issues.', visitType: 'Surgery', wouldRecommend: true, anonymous: false, helpful: 47, helpedByMe: false },
  { id: 'r2', doctorId: 'd1', userName: 'Anonymous', avatar: 'AN', date: '2026-07-22', rating: 4, title: 'Thorough consultation', text: 'Very thorough in her approach. Took time to review all my reports. Wait time was about 45 minutes which is expected at AIIMS. Prescribed the right medication and follow-up was well managed.', visitType: 'OPD', wouldRecommend: true, anonymous: true, helpful: 23, helpedByMe: false },
  { id: 'r3', doctorId: 'd1', userName: 'Sunita Mehta', avatar: 'SM', date: '2026-06-10', rating: 5, title: 'Best cardiologist in Delhi NCR', text: 'Diagnosed my arrhythmia that two other doctors missed. The ECG interpretation was spot on. She genuinely cares about patients and follows up personally. The best experience I have had at any hospital.', visitType: 'Consultation', wouldRecommend: true, anonymous: false, helpful: 61, helpedByMe: false },
  { id: 'r4', doctorId: 'd1', userName: 'Ravi Teja', avatar: 'RT', date: '2026-05-18', rating: 3, title: 'Good but overcrowded', text: 'Medical expertise is top-notch but the OPD is extremely crowded. Had to wait 2 hours for a 10-minute consultation. She is clearly overworked. The treatment itself was effective though.', visitType: 'OPD', wouldRecommend: true, anonymous: false, helpful: 15, helpedByMe: false },
  { id: 'r5', doctorId: 'd2', userName: 'Deepak Verma', avatar: 'DV', date: '2026-08-10', rating: 5, title: 'Knee replacement was seamless', text: 'Dr. Rajesh Gupta did my total knee replacement at Fortis Mumbai. Minimal pain post-surgery, and I was walking with support within 48 hours. His physiotherapy recommendations were excellent.', visitType: 'Surgery', wouldRecommend: true, anonymous: false, helpful: 38, helpedByMe: false },
  { id: 'r6', doctorId: 'd2', userName: 'Pooja Sharma', avatar: 'PS', date: '2026-07-05', rating: 4, title: 'Excellent spine specialist', text: 'Treatment for my slipped disc was very effective. He explained the MRI clearly and gave both surgical and non-surgical options. Chose conservative treatment first which worked. Fortis facility is world class.', visitType: 'Consultation', wouldRecommend: true, anonymous: false, helpful: 29, helpedByMe: false },
  { id: 'r7', doctorId: 'd2', userName: 'Anonymous', avatar: 'AN', date: '2026-06-20', rating: 4, title: 'Emergency fracture treatment', text: 'Got my wrist fracture treated in emergency. Doctor was professional and set the bone correctly. Only concern was the billing was quite high for Fortis. Medical care was excellent though.', visitType: 'Emergency', wouldRecommend: true, anonymous: true, helpful: 12, helpedByMe: false },
  { id: 'd8', doctorId: 'd3', userName: 'Neha Agarwal', avatar: 'NA', date: '2026-08-12', rating: 5, title: 'Miracle worker for migraines', text: 'Suffered from chronic migraines for 8 years. Dr. Desai at Max Hospital put me on a new regimen and within 2 months my migraine frequency dropped from weekly to once a month. She truly changed my life.', visitType: 'OPD', wouldRecommend: true, anonymous: false, helpful: 55, helpedByMe: false },
  { id: 'r9', doctorId: 'd3', userName: 'Vikash Singh', avatar: 'VS', date: '2026-07-28', rating: 4, title: 'Comprehensive epilepsy management', text: 'She manages my epilepsy medication very carefully. Always reviews blood work before adjusting doses. The only reason for 4 stars is the long waiting time at Max. But her medical knowledge is exceptional.', visitType: 'OPD', wouldRecommend: true, anonymous: false, helpful: 18, helpedByMe: false },
  { id: 'r10', doctorId: 'd4', userName: 'Lakshmi Iyer', avatar: 'LI', date: '2026-08-08', rating: 5, title: 'Expert endoscopy specialist', text: 'Dr. Patel performed my endoscopy at Apollo Chennai. Very gentle and professional. He found a gastric ulcer early that could have become serious. His follow-up care was outstanding. Very affordable too.', visitType: 'Surgery', wouldRecommend: true, anonymous: false, helpful: 42, helpedByMe: false },
  { id: 'r11', doctorId: 'd4', userName: 'Mohammed Ali', avatar: 'MA', date: '2026-06-30', rating: 4, title: 'IBS management was helpful', text: 'Good doctor for digestive issues. He listened to all my symptoms patiently and ordered the right tests. Treatment for IBS has been working well. His diet recommendations were practical and easy to follow.', visitType: 'Consultation', wouldRecommend: true, anonymous: false, helpful: 21, helpedByMe: false },
  { id: 'r12', doctorId: 'd5', userName: 'Ananya Roy', avatar: 'AR', date: '2026-08-18', rating: 5, title: 'Cleared my persistent skin condition', text: 'Dr. Nair at CMC Vellore is a dermatologist like no other. She identified my psoriasis triggers that others dismissed. Her treatment plan with phototherapy and topical medication cleared 90% of my patches in 3 months.', visitType: 'OPD', wouldRecommend: true, anonymous: false, helpful: 67, helpedByMe: false },
  { id: 'r13', doctorId: 'd5', userName: 'Rohit Menon', avatar: 'RM', date: '2026-07-15', rating: 5, title: 'Best dermatologist in South India', text: 'Travelled from Kerala specifically to see her. Worth every kilometre. She is extremely knowledgeable about the latest dermatological treatments and explains everything in simple language.', visitType: 'Consultation', wouldRecommend: true, anonymous: false, helpful: 34, helpedByMe: false },
  { id: 'r14', doctorId: 'd6', userName: 'Pradeep Nair', avatar: 'PN', date: '2026-08-01', rating: 4, title: 'Asthma management improved significantly', text: 'Dr. Singh at Medanta helped me get my asthma under control. He adjusted my inhaler regimen and taught me proper technique. My peak flow readings have improved by 40%. Good bedside manner.', visitType: 'OPD', wouldRecommend: true, anonymous: false, helpful: 25, helpedByMe: false },
  { id: 'r15', doctorId: 'd6', userName: 'Anonymous', avatar: 'AN', date: '2026-06-25', rating: 3, title: 'Average experience with COVID follow-up', text: 'Post-COVID lung evaluation was thorough but felt rushed during the consultation. He ordered the right tests but did not explain the long-term implications well. The hospital facilities were excellent though.', visitType: 'Consultation', wouldRecommend: false, anonymous: true, helpful: 9, helpedByMe: false },
  { id: 'r16', doctorId: 'd7', userName: 'Savithri Menon', avatar: 'SM2', date: '2026-08-20', rating: 5, title: 'Guided me through cancer treatment with compassion', text: 'Dr. Reddy at Tata Memorial is not just an oncologist but a healer. She guided my mother through breast cancer treatment with extraordinary compassion. Her team at Tata Memorial is world-class. The chemotherapy protocol was personalized and effective.', visitType: 'Consultation', wouldRecommend: true, anonymous: false, helpful: 89, helpedByMe: false },
  { id: 'r17', doctorId: 'd7', userName: 'Rajesh Patel', avatar: 'RP', date: '2026-07-10', rating: 5, title: 'Cancer survivor thanks to her', text: 'Stage 2 lung cancer survivor. Dr. Kavita Reddy planned a combination of surgery and immunotherapy. Two years cancer-free now. She reviews every scan personally. Tata Memorial under her care is world-class.', visitType: 'Surgery', wouldRecommend: true, anonymous: false, helpful: 73, helpedByMe: false },
  { id: 'r18', doctorId: 'd7', userName: 'Priyanka Das', avatar: 'PD', date: '2026-05-28', rating: 4, title: 'Excellent but Tata Memorial is crowded', text: 'Medical expertise is 5 stars. The wait times at Tata are heartbreaking though. We waited 5 hours for consultation. But once you meet her, you understand why. She takes time with each patient despite the crowd.', visitType: 'OPD', wouldRecommend: true, anonymous: false, helpful: 41, helpedByMe: false },
  { id: 'r19', doctorId: 'd8', userName: 'Kiran Bhat', avatar: 'KB', date: '2026-08-05', rating: 4, title: 'Diabetes management was effective', text: 'Dr. Joshi at Manipal Hospital helped me manage my Type 2 diabetes. He adjusted my Metformin dosage and recommended dietary changes. My HbA1c dropped from 9.2 to 6.8 in 4 months. Very approachable doctor.', visitType: 'OPD', wouldRecommend: true, anonymous: false, helpful: 19, helpedByMe: false },
  { id: 'r20', doctorId: 'd8', userName: 'Anonymous', avatar: 'AN', date: '2026-07-20', rating: 3, title: 'Decent but felt like a conveyor belt', text: 'The consultation felt rushed. He prescribed standard diabetes medication without much personalization. Maybe I was expecting more detailed analysis. The facility at Manipal is top-notch though.', visitType: 'OPD', wouldRecommend: false, anonymous: true, helpful: 11, helpedByMe: false },
  { id: 'r21', doctorId: 'd1', userName: 'Vikram Chauhan', avatar: 'VC', date: '2026-04-12', rating: 5, title: 'Emergency heart attack response saved my life', text: 'Had a massive heart attack. Dr. Sharma performed emergency PCI at AIIMS within 30 minutes of my arrival. Her quick thinking and expertise saved my life. I cannot recommend her enough.', visitType: 'Emergency', wouldRecommend: true, anonymous: false, helpful: 94, helpedByMe: false },
  { id: 'r22', doctorId: 'd3', userName: 'Deepika Kumari', avatar: 'DK', date: '2026-05-05', rating: 5, title: 'Bell\'s palsy recovery with her guidance', text: 'Dr. Desai treated my Bell\'s palsy with a combination of steroids and physiotherapy. Full recovery in 6 weeks. She was reassuring throughout and available on WhatsApp for urgent queries. Remarkable doctor.', visitType: 'OPD', wouldRecommend: true, anonymous: false, helpful: 36, helpedByMe: false },
  { id: 'r23', doctorId: 'd5', userName: 'Anjali Gupta', avatar: 'AG', date: '2026-04-22', rating: 4, title: 'Allergy treatment was effective', text: 'Dr. Nair conducted thorough allergy testing and identified my triggers. Treatment with antihistamines and avoidance protocol worked well. CMC Vellore has a great dermatology department under her.', visitType: 'Consultation', wouldRecommend: true, anonymous: false, helpful: 16, helpedByMe: false },
];

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

  const specialties = useMemo(() => ['All', ...Array.from(new Set(DOCTORS.map(d => d.specialty)))], []);

  const filteredDoctors = DOCTORS.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) || d.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'All' || d.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const doctorReviews = useMemo(() => {
    if (!selectedDoctor) return [];
    let reviews = ALL_REVIEWS.filter(r => r.doctorId === selectedDoctor.id);
    switch (sortBy) {
      case 'Highest Rated': reviews.sort((a, b) => b.rating - a.rating); break;
      case 'Lowest Rated': reviews.sort((a, b) => a.rating - b.rating); break;
      case 'Most Helpful': reviews.sort((a, b) => b.helpful - a.helpful); break;
      default: reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return reviews;
  }, [selectedDoctor, sortBy]);

  const ratingDistribution = useMemo(() => {
    if (!selectedDoctor) return [0, 0, 0, 0, 0];
    const dist = [0, 0, 0, 0, 0];
    ALL_REVIEWS.filter(r => r.doctorId === selectedDoctor.id).forEach(r => { dist[r.rating - 1]++; });
    return dist;
  }, [selectedDoctor]);

  const handleSubmitReview = () => {
    if (!reviewRating || !newReview.title.trim() || !newReview.text.trim() || !selectedDoctor) return;
    setSubmitting(true);
    setTimeout(() => {
      const review: Review = {
        id: `r_new_${Date.now()}`,
        doctorId: selectedDoctor.id,
        userName: newReview.anonymous ? 'Anonymous' : 'You',
        avatar: newReview.anonymous ? 'AN' : 'YO',
        date: new Date().toISOString().split('T')[0],
        rating: reviewRating,
        title: newReview.title,
        text: newReview.text,
        visitType: newReview.visitType,
        wouldRecommend: newReview.wouldRecommend,
        anonymous: newReview.anonymous,
        helpful: 0,
        helpedByMe: false,
      };
      ALL_REVIEWS.unshift(review);
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setShowReviewForm(false);
        setSubmitted(false);
        setReviewRating(0);
        setNewReview({ title: '', text: '', visitType: 'OPD', wouldRecommend: true, anonymous: false });
      }, 2000);
    }, 1200);
  };

  const toggleHelpful = (reviewId: string) => {
    const review = ALL_REVIEWS.find(r => r.id === reviewId);
    if (review) {
      review.helpedByMe = !review.helpedByMe;
      review.helpful += review.helpedByMe ? 1 : -1;
    }
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
                        onChange={e => setCompareDoctor(DOCTORS.find(d => d.id === e.target.value) || null)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900">Select a doctor to compare...</option>
                        {DOCTORS.filter(d => d.id !== selectedDoctor?.id).map(d => (
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
                      {ALL_REVIEWS.filter(r => r.doctorId === selectedDoctor.id).sort((a, b) => b.helpful - a.helpful).slice(0, 3).map(review => (
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
