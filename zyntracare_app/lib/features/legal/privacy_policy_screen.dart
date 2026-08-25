import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface,
        title: Text('Privacy Policy', style: GoogleFonts.poppins(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Privacy Policy', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text('Last updated: June 2026', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
          const SizedBox(height: 24),
          _section('1. Information We Collect',
            'We collect information you provide directly, including name, email, phone number, health records, '
            'and location data when you use our services. We also automatically collect device information, '
            'usage data, and crash reports.'),
          _section('2. How We Use Your Information',
            'Your information is used to provide and improve healthcare services, process appointments, '
            'facilitate telemedicine consultations, send reminders, and comply with legal obligations. '
            'Health data is processed in accordance with applicable healthcare regulations.'),
          _section('3. Data Sharing',
            'We may share your data with healthcare providers, diagnostic labs, pharmacies, and insurance '
            'partners solely for service delivery. We do not sell your personal information to third parties.'),
          _section('4. Data Security',
            'We implement encryption (AES-256), secure APIs, and access controls to protect your health information. '
            'Blockchain-based records use cryptographic hashing for tamper-proof audit trails.'),
          _section('5. Your Rights',
            'You can access, update, delete your data, or export your health records anytime from the app settings. '
            'You may also withdraw consent for data processing.'),
          _section('6. Contact',
            'For privacy-related inquiries, contact us at:\nprivacy@zyntracare.com\n\n'
            'ZyntraCare Health Pvt. Ltd.\nDelhi, India'),
        ]),
      ),
    );
  }

  Widget _section(String title, String body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Text(body, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, height: 1.6)),
        const SizedBox(height: 4),
        Divider(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ]),
    );
  }
}
