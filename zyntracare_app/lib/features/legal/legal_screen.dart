import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'privacy_policy_screen.dart';
import 'terms_screen.dart';

class LegalScreen extends StatefulWidget {
  const LegalScreen({super.key});
  @override State<LegalScreen> createState() => _LegalScreenState();
}

class _LegalScreenState extends State<LegalScreen> {
  bool _loading = true;

  final _policies = [
    {'icon': Icons.privacy_tip_rounded, 'title': 'Privacy Policy', 'desc': 'How we collect, use, and protect your personal data and health information.', 'updated': 'June 15, 2026', 'color': ZyntraColors.cyan, 'route': const PrivacyPolicyScreen()},
    {'icon': Icons.description_rounded, 'title': 'Terms of Service', 'desc': 'Rules, guidelines, and terms governing your use of the ZyntraCare platform.', 'updated': 'June 10, 2026', 'color': ZyntraColors.purple, 'route': const TermsScreen()},
    {'icon': Icons.cookie_rounded, 'title': 'Cookie Policy', 'desc': 'How we use cookies and similar tracking technologies on our platform.', 'updated': 'May 28, 2026', 'color': ZyntraColors.amber, 'route': null},
    {'icon': Icons.assignment_rounded, 'title': 'Data Processing Agreement', 'desc': 'Terms for processing personal data on behalf of our enterprise partners.', 'updated': 'June 01, 2026', 'color': ZyntraColors.teal, 'route': null},
    {'icon': Icons.health_and_safety_rounded, 'title': 'HIPAA Compliance', 'desc': 'Our commitment to HIPAA standards for protecting sensitive patient health information.', 'updated': 'June 12, 2026', 'color': ZyntraColors.green, 'route': null},
    {'icon': Icons.gavel_rounded, 'title': 'GDPR Compliance', 'desc': 'How we comply with the General Data Protection Regulation for EU users.', 'updated': 'May 20, 2026', 'color': ZyntraColors.indigo, 'route': null},
  ];

  final _companyInfo = {
    'name': 'ZyntraCare Health Technologies Pvt. Ltd.',
    'address': 'No. 42, Tech Park Boulevard, Bangalore - 560001, Karnataka, India',
    'gst': '29AAACZ1234H1Z5',
    'cin': 'U85100KA2026PTC123456',
    'contact': 'legal@zyntracare.com',
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.topLeft, end: Alignment.bottomRight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text('Legal', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Policies, compliance, and terms of use', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _sectionHeader('Legal Information Hub', Icons.library_books_rounded),
                          const SizedBox(height: 12),
                          ...List.generate(_policies.length, (i) => _buildPolicyCard(i)),
                          const SizedBox(height: 24),
                          _sectionHeader('Company Information', Icons.business_rounded),
                          const SizedBox(height: 12),
                          _buildCompanyInfo(),
                          const SizedBox(height: 24),
                          _buildContactLegal(),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: ZyntraColors.cyan, size: 16),
        ),
        const SizedBox(width: 8),
        Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildPolicyCard(int i) {
    final p = _policies[i];
    final color = p['color'] as Color;
    final hasRoute = p['route'] != null;
    return GestureDetector(
      onTap: () {
        if (hasRoute) {
          Navigator.push(context, MaterialPageRoute(builder: (_) => p['route'] as Widget));
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(p['icon'] as IconData, color: color, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(p['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.update_rounded, color: ZyntraColors.white40, size: 12),
                      const SizedBox(width: 4),
                      Text('Updated: ${p['updated'] as String}', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
                      if (hasRoute) ...[
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('View Full Policy', style: GoogleFonts.inter(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ).animate().fadeIn(delay: (i * 60).ms).slideX(begin: 0.03, end: 0),
    );
  }

  Widget _buildCompanyInfo() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_companyInfo['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          _infoRow(Icons.location_on_rounded, _companyInfo['address'] as String),
          const SizedBox(height: 6),
          _infoRow(Icons.card_membership_rounded, 'GST: ${_companyInfo['gst']}'),
          const SizedBox(height: 6),
          _infoRow(Icons.assignment_rounded, 'CIN: ${_companyInfo['cin']}'),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: ZyntraColors.cyan, size: 14),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11))),
      ],
    );
  }

  Widget _buildContactLegal() {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Legal team contacted. We will respond within 24 hours at ${_companyInfo['contact']}', style: GoogleFonts.inter(color: Colors.white)),
          backgroundColor: ZyntraColors.cyan,
          behavior: SnackBarBehavior.floating,
        ));
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
        ),
        child: Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.email_rounded, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Text('Contact Legal Team', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Column(
          children: List.generate(6, (_) => Container(
            height: 90,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
          )),
        ),
      ),
    );
  }
}
