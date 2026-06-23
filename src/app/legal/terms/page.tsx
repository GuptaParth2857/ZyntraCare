'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiCheckCircle, FiAlertTriangle, FiUsers, FiCreditCard, FiShield, FiClock, FiPhone } from 'react-icons/fi';

export default function TermsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('acceptance');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'acceptance',
      icon: FiCheckCircle,
      title: 'Acceptance of Terms',
      content: `By accessing or using ZyntraCare ("Service"), you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree, do not use the Service.

These Terms constitute a legally binding agreement between you ("User", "you", "your") and ZyntraCare ("Company", "we", "us", "our").

We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance of the new Terms. We will notify you of material changes via email or in-app notification.

You must be at least 13 years old to use this Service. Users between 13-18 require parental consent.`,
    },
    {
      id: 'services',
      icon: FiUsers,
      title: 'Description of Services',
      content: `ZyntraCare provides a healthcare platform offering:

**Core Services:**
- Hospital and clinic discovery with real-time availability
- Doctor appointment booking and scheduling
- Video consultation with licensed healthcare providers
- AI-powered symptom analysis (for informational purposes only)
- Medical record management and health tracking
- Medicine and lab test ordering
- Emergency services coordination

**Service Availability:**
- Services are available 24/7 except for scheduled maintenance
- Video consultations depend on doctor availability
- Emergency services are provided in partnership with local providers
- We do not guarantee uninterrupted access to all features

**Service Limitations:**
- We are a platform connecting users with healthcare providers, not a healthcare provider itself
- AI symptom analysis is for informational purposes only and does not constitute medical advice
- We do not provide emergency medical services - call local emergency numbers for emergencies`,
    },
    {
      id: 'account',
      icon: FiShield,
      title: 'User Accounts & Responsibilities',
      content: `To use certain features, you must create an account:

**Account Creation:**
- You must provide accurate and complete information
- You are responsible for maintaining account security
- One account per person - multiple accounts are prohibited
- You must verify your email and phone number

**Account Security:**
- Keep your password confidential
- Enable two-factor authentication when available
- Notify us immediately of any unauthorized access
- You are liable for all activities under your account

**Account Termination:**
- You may delete your account at any time
- We may suspend accounts for Terms violations
- We reserve the right to terminate accounts with 30 days notice
- Data retention after termination follows our Privacy Policy

**User Conduct:**
- Do not misuse the platform or attempt to harm others
- Do not share account credentials
- Do not use the platform for illegal purposes
- Do not impersonate healthcare professionals`,
    },
    {
      id: 'bookings',
      icon: FiCreditCard,
      title: 'Bookings, Payments & Refunds',
      content: `**Appointment Booking:**
- Bookings are subject to doctor availability
- Confirmation is sent via email and SMS
- You may cancel or reschedule up to 2 hours before the appointment
- Late cancellations may incur fees per doctor's policy

**Payment Terms:**
- All payments are processed through Razorpay (PCI DSS compliant)
- Prices are displayed in Indian Rupees (INR)
- Payment is required at time of booking
- We do not store your payment card details

**Refund Policy:**
- Full refund for cancellations made 24+ hours before appointment
- 50% refund for cancellations made 2-24 hours before appointment
- No refund for no-shows or late cancellations
- Refunds are processed within 5-7 business days
- Subscription refunds are prorated based on usage

**Taxes:**
- All prices include applicable GST
- Additional taxes may apply based on your location
- Tax receipts are provided for all transactions`,
    },
    {
      id: 'medical',
      icon: FiAlertTriangle,
      title: 'Medical Disclaimer',
      content: `**CRITICAL: READ CAREFULLY**

ZyntraCare is NOT a healthcare provider. We are a technology platform connecting users with independent healthcare professionals.

**AI Symptom Analysis:**
- The AI symptom checker is for informational purposes only
- It does NOT diagnose conditions or replace professional medical advice
- Always consult a qualified healthcare provider for medical concerns
- We are not liable for any decisions made based on AI analysis

**Doctor-Patient Relationship:**
- Using our platform does not establish a doctor-patient relationship
- The relationship is between you and the healthcare provider
- We are not responsible for medical advice given by doctors

**Emergency Situations:**
- If you are experiencing a medical emergency, call your local emergency number immediately
- Do not rely on our platform for emergency medical services
- Our emergency features are for coordination only, not medical response

**Medical Information:**
- Health content on our platform is for general information only
- It should not be used for self-diagnosis or treatment
- Always seek professional medical advice for health concerns`,
    },
    {
      id: 'intellectual',
      icon: FiFileText,
      title: 'Intellectual Property',
      content: `**Our Content:**
- All content on ZyntraCare is owned by us or our licensors
- This includes text, graphics, logos, software, and AI models
- You may not reproduce, distribute, or create derivative works
- Limited license to use the platform for personal, non-commercial use

**Your Content:**
- You retain ownership of health records and personal data
- You grant us a limited license to process your data for service provision
- We will not use your health data for marketing without consent
- You may request deletion of your content at any time

**User-Generated Content:**
- Reviews and feedback you provide may be used for platform improvement
- We may anonymize and aggregate user feedback
- You are responsible for the content you submit
- We reserve the right to remove inappropriate content

**Trademarks:**
- ZyntraCare and related marks are our trademarks
- You may not use our trademarks without written permission
- Third-party trademarks are property of their respective owners`,
    },
    {
      id: 'limitation',
      icon: FiShield,
      title: 'Limitation of Liability',
      content: `**Disclaimer of Warranties:**
- The service is provided "as is" without warranties of any kind
- We do not guarantee the accuracy of information provided
- We do not guarantee uninterrupted or error-free service
- We are not responsible for third-party services or content

**Limitation of Damages:**
- To the maximum extent permitted by law, we shall not be liable for:
  - Indirect, incidental, or consequential damages
  - Loss of profits, data, or business opportunities
  - Personal injury resulting from use of the platform
  - Medical outcomes or health-related decisions

**Maximum Liability:**
- Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim
- This limitation applies to all causes of action

**Indemnification:**
- You agree to indemnify and hold us harmless from claims arising from:
  - Your use of the platform
  - Your violation of these Terms
  - Your violation of any rights of another party
  - Your provision of inaccurate information`,
    },
    {
      id: 'disputes',
      icon: FiClock,
      title: 'Dispute Resolution',
      content: `**Governing Law:**
- These Terms are governed by the laws of India
- Disputes shall be resolved in the courts of New Delhi, India

**Arbitration:**
- Any dispute arising from these Terms shall be resolved through binding arbitration
- The arbitration shall be conducted in English in New Delhi
- The decision of the arbitrator shall be final and binding

**Class Action Waiver:**
- You agree to resolve disputes on an individual basis
- You waive any right to participate in class action lawsuits
- This waiver applies to the maximum extent permitted by law

**Informal Resolution:**
- Before filing a formal dispute, you agree to contact us first
- We will attempt to resolve the dispute informally within 30 days
- If informal resolution fails, formal proceedings may begin`,
    },
    {
      id: 'general',
      icon: FiPhone,
      title: 'Contact & Address',
      content: `**Registered Address:**
- ZyntraCare Healthtech Pvt. Ltd.
- H-48, Sector 63, Noida
- Uttar Pradesh 201301, India

**Contact Information:**
- General Inquiries: contact.zenvyx@gmail.com
- Legal Notices: legal@zyntracare.com
- Privacy Concerns: dpo@zyntracare.com
- Phone: +91-11-4321-5678

**Grievance Officer:**
As required under the Information Technology Act, 2000 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the Grievance Officer can be contacted at:
- Email: grievance@zyntracare.com
- Response Time: 24 hours for initial acknowledgement, 15 days for resolution`,
    },
    {
      id: 'general',
      icon: FiFileText,
      title: 'General Provisions',
      content: `**Severability:**
- If any provision of these Terms is found invalid, the remaining provisions remain in effect

**Entire Agreement:**
- These Terms, together with our Privacy Policy, constitute the entire agreement
- Previous versions of these Terms are superseded

**Assignment:**
- You may not assign your rights under these Terms without our written consent
- We may assign our rights and obligations without restriction

**Waiver:**
- Our failure to enforce any provision does not constitute a waiver
- Waivers must be in writing to be effective

**Force Majeure:**
- We are not liable for failures due to circumstances beyond our control
- This includes natural disasters, pandemics, government actions, or technical failures

**Notices:**
- We may send notices via email, in-app notification, or postal mail
- You are responsible for keeping your contact information current`,
    },
  ];

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiFileText className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Terms & Conditions</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using ZyntraCare. By using our services, you agree to these terms.
          </p>
        </motion.div>

        <div className="text-center text-gray-500 mb-8 flex items-center justify-center gap-2">
          <FiClock size={14} />
          <span>Last updated: June 2026 | Effective: June 15, 2026</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <h3 className="text-white font-bold mb-2">Agreement to Terms</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Welcome to ZyntraCare. These Terms & Conditions govern your use of our healthcare platform, including our website, mobile applications, and related services. By accessing or using ZyntraCare, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
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
          <h3 className="text-xl font-bold text-white mb-2">Questions about Terms?</h3>
          <p className="text-gray-400 mb-4">Contact our legal team for any questions regarding these terms.</p>
          <a href="mailto:legal@zyntracare.com" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-full font-semibold transition">
            <FiFileText size={18} /> legal@zyntracare.com
          </a>
        </motion.div>
      </div>
    </main>
  );
}
