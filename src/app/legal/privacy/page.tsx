'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiEye, FiLock, FiUsers, FiDatabase, FiMail, FiAlertCircle, FiGlobe, FiClock, FiPhone } from 'react-icons/fi';

export default function PrivacyPolicyPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('collection');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'collection',
      icon: FiDatabase,
      title: 'Information We Collect',
      content: `ZyntraCare collects the following categories of information:

**Personal Information:**
- Full name, email address, phone number
- Date of birth, gender
- Profile picture (optional)
- Emergency contact information

**Health Information:**
- Medical reports and test results uploaded by you
- Prescription records
- Appointment history with healthcare providers
- Symptom check inputs and AI analysis results
- Health metrics from connected wearable devices

**Usage Information:**
- Device type, browser, and operating system
- IP address and approximate location
- Pages visited and features used
- Search queries within the platform
- Time and duration of visits

**Payment Information:**
- Payment method details (processed securely via Razorpay)
- Transaction history
- Subscription status

We collect this information only when you provide it voluntarily or automatically through your use of our services.`,
    },
    {
      id: 'usage',
      icon: FiUsers,
      title: 'How We Use Your Information',
      content: `We use your information for the following purposes:

**Service Delivery:**
- Facilitate doctor appointments and video consultations
- Process payments and manage subscriptions
- Provide AI-powered symptom analysis
- Send appointment reminders and notifications

**Platform Improvement:**
- Analyze usage patterns to improve features
- Develop new healthcare tools and services
- Conduct research on healthcare accessibility (anonymized data only)

**Communication:**
- Send service-related notifications
- Provide customer support
- Share health tips and wellness content (with your consent)
- Send emergency alerts when requested

**Legal Compliance:**
- Comply with applicable healthcare regulations
- Respond to legal requests and prevent fraud
- Protect the safety and rights of our users`,
    },
    {
      id: 'protection',
      icon: FiLock,
      title: 'Data Protection & Security',
      content: `We implement industry-standard security measures:

**Technical Safeguards:**
- End-to-end encryption for video consultations
- AES-256 encryption for stored health data
- TLS 1.3 for all data in transit
- Regular security audits and penetration testing

**Organizational Measures:**
- Strict access controls and authentication
- Employee training on data protection
- Incident response procedures
- Regular security assessments

**Compliance:**
- HIPAA compliance for health data handling
- GDPR compliance for EU/EEA users
- IT Act 2000 compliance for Indian users
- Regular compliance audits

**Data Retention:**
- Account data: Retained while account is active
- Health records: Retained for 7 years as per medical regulations
- Payment data: Retained as required by tax laws
- Usage data: Anonymized after 24 months`,
    },
    {
      id: 'sharing',
      icon: FiGlobe,
      title: 'Data Sharing & Third Parties',
      content: `We share your information only in the following circumstances:

**With Healthcare Providers:**
- When you book an appointment, relevant information is shared with the doctor
- Video consultation data is shared with the consulting physician
- Medical reports you upload are accessible to your chosen doctors

**Service Providers:**
- Payment processing (Razorpay) - for transaction processing only
- Cloud hosting (encrypted storage) - for data storage only
- Analytics providers (anonymized data only)

**We Never:**
- Sell your personal information to third parties
- Share health data with advertisers
- Use your medical information for marketing without consent
- Provide data to insurance companies without explicit permission

**Legal Requirements:**
We may disclose information if required by law, court order, or to protect the safety of our users and the public.`,
    },
    {
      id: 'rights',
      icon: FiEye,
      title: 'Your Rights',
      content: `You have the following rights regarding your data:

**Access Rights:**
- Request a copy of all personal data we hold
- View your health records and consultation history
- Download your data in a portable format

**Control Rights:**
- Update or correct your personal information
- Modify your communication preferences
- Control visibility of your profile to doctors

**Deletion Rights:**
- Request deletion of your account and associated data
- Remove specific health records
- Opt out of data collection for analytics

**Portability Rights:**
- Export your health records in standard formats
- Transfer your data to another healthcare provider
- Receive data in machine-readable format

**To Exercise Your Rights:**
Email privacy@zyntracare.com with your request. We will respond within 30 days.`,
    },
    {
      id: 'cookies',
      icon: FiAlertCircle,
      title: 'Cookies & Tracking',
      content: `We use cookies and similar technologies:

**Essential Cookies:**
- Required for platform functionality
- Authentication and session management
- Cannot be disabled

**Analytics Cookies:**
- Help us understand how users interact with the platform
- Used to improve user experience
- Can be disabled in settings

**Marketing Cookies:**
- Used for personalized health content recommendations
- Can be disabled in settings

**Third-Party Cookies:**
- Google Analytics (anonymized)
- Razorpay (for payment processing only)

You can manage cookie preferences through your browser settings. Note that disabling essential cookies may affect platform functionality.`,
    },
    {
      id: 'children',
      icon: FiUsers,
      title: 'Children\'s Privacy',
      content: `ZyntraCare is not intended for users under 13 years of age.

**For Minors (13-18 years):**
- Parental consent is required for account creation
- Parents can access and manage their child's data
- Health data for minors receives additional protection

**For Parents/Guardians:**
- You can request access to your child's data
- You can request deletion of your child's account
- We will not collect data from minors without parental consent

If we discover we have collected data from a child under 13 without parental consent, we will delete it immediately.`,
    },
    {
      id: 'contact',
      icon: FiPhone,
      title: 'Contact Us',
      content: `For privacy-related inquiries:

**Data Protection Officer:**
Email: dpo@zyntracare.com
Phone: +91-11-XXXX-XXXX

**Postal Address:**
ZyntraCare Privacy Team
[Company Address]
New Delhi, India 110001

**Response Time:**
We aim to respond to all privacy inquiries within 48 hours. Data access requests will be fulfilled within 30 days.

**Complaints:**
If you believe your privacy rights have been violated, you may file a complaint with:
- Our Data Protection Officer
- The relevant data protection authority in your jurisdiction`,
    },
  ];

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiShield className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your personal information protection is our priority. This policy describes how we collect, use, and protect your data.
          </p>
        </motion.div>

        <div className="text-center text-gray-500 mb-8 flex items-center justify-center gap-2">
          <FiClock size={14} />
          <span>Last updated: June 2026 | Effective: June 15, 2026</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <h3 className="text-white font-bold mb-2">Summary</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            ZyntraCare ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare platform, including our website, mobile application, and related services (collectively, the "Service"). By using the Service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                    <section.icon className="text-white" size={20} />
                  </div>
                  <span className="text-white font-semibold text-lg">{section.title}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedSection === section.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
              {expandedSection === section.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5">
                  <div className="text-gray-400 leading-relaxed ml-14 whitespace-pre-line text-sm">{section.content}</div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Privacy Questions?</h3>
          <p className="text-gray-400 mb-4">Contact our Data Protection Officer for any privacy-related concerns.</p>
          <a href="mailto:privacy@zyntracare.com" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded-full font-semibold transition">
            <FiMail size={18} /> privacy@zyntracare.com
          </a>
        </motion.div>
      </div>
    </main>
  );
}
