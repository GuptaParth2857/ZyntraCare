'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiActivity, FiDroplet, FiClock, FiHeart, FiShield, FiCrosshair } from 'react-icons/fi';
import { FaWeight, FaWater, FaPills, FaTint, FaQrcode, FaFirstAid, FaStethoscope } from 'react-icons/fa';

const TOOLS = [
  {
    icon: <FaStethoscope size={28} />,
    title: 'AI Symptom Checker',
    description: 'Describe symptoms in English or Hindi and get an instant AI-powered health analysis.',
    href: '/symptom-checker',
    gradient: 'from-blue-500/20 to-teal-500/20',
    border: 'border-blue-500/30',
    iconBg: 'bg-blue-500/20 text-blue-400',
    hover: 'hover:border-blue-500/30',
  },
  {
    icon: <FaWeight size={28} />,
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index and understand your health category.',
    href: '/tools/bmi',
    gradient: 'from-teal-500/20 to-emerald-500/20',
    border: 'border-teal-500/30',
    iconBg: 'bg-teal-500/20 text-teal-400',
    hover: 'hover:border-teal-500/30',
  },
  {
    icon: <FaWater size={28} />,
    title: 'Water Intake Calculator',
    description: 'Find out how much water you should drink daily based on your activity.',
    href: '/tools/water-intake',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    iconBg: 'bg-blue-500/20 text-blue-400',
    hover: 'hover:border-blue-500/30',
  },
  {
    icon: <FaPills size={28} />,
    title: 'Medicine Reminder',
    description: 'Set up medicine reminders and never miss a dose.',
    href: '/medicine-reminder',
    gradient: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    iconBg: 'bg-purple-500/20 text-purple-400',
    hover: 'hover:border-purple-500/30',
  },
  {
    icon: <FaTint size={28} />,
    title: 'Blood Donor Finder',
    description: 'Find blood donors in your area and request blood in emergencies.',
    href: '/blood-donors',
    gradient: 'from-red-500/20 to-orange-500/20',
    border: 'border-red-500/30',
    iconBg: 'bg-red-500/20 text-red-400',
    hover: 'hover:border-red-500/30',
  },
  {
    icon: <FaQrcode size={28} />,
    title: 'Emergency QR Card',
    description: 'Generate a medical QR card with your emergency info for quick access.',
    href: '/tools/emergency-card',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-500/30',
    iconBg: 'bg-amber-500/20 text-amber-400',
    hover: 'hover:border-amber-500/30',
  },
  {
    icon: <FaFirstAid size={28} />,
    title: 'First Aid Guides',
    description: 'Step-by-step first aid instructions for common medical emergencies.',
    href: '/first-aid',
    gradient: 'from-red-600/20 to-red-400/20',
    border: 'border-red-500/30',
    iconBg: 'bg-red-500/20 text-red-400',
    hover: 'hover:border-red-500/30',
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 via-transparent to-cyan-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl mb-6">
            <FiActivity size={32} className="text-teal-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              Health Tools
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Essential health calculators and emergency tools to help you stay informed and prepared.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool, idx) => (
            <Link key={tool.href} href={tool.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer transition-all group ${tool.hover}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${tool.iconBg}`}>
                    {tool.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-teal-400 transition-colors">{tool.title}</h3>
                <p className="text-gray-400 text-sm">{tool.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
