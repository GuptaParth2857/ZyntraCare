import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';

class TermsScreen extends StatefulWidget {
  const TermsScreen({super.key});
  @override State<TermsScreen> createState() => _TermsScreenState();
}

class _TermsScreenState extends State<TermsScreen> {
  bool _loading = true;
  final Set<int> _expandedSections = {};

  final _sections = [
    {
      'title': 'Acceptance of Terms',
      'icon': Icons.how_to_reg_rounded,
      'content': '''By accessing or using ZyntraCare, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.

These terms constitute a legally binding agreement between you (the user) and ZyntraCare Health Technologies Pvt. Ltd. Your continued use of the platform constitutes acceptance of any updates to these terms.

We reserve the right to modify these terms at any time. Users will be notified of material changes via email or in-app notification. Continued use after changes constitutes acceptance.''',
    },
    {
      'title': 'User Responsibilities',
      'icon': Icons.person_pin_rounded,
      'content': '''As a user of ZyntraCare, you agree to:
• Provide accurate and truthful information
• Maintain the confidentiality of your account credentials
• Not share your account with others
• Use the platform for lawful purposes only
• Not attempt to access other users' data
• Not misuse the platform for spam or fraudulent activities
• Report any security vulnerabilities immediately

You are responsible for all activities under your account. ZyntraCare is not liable for losses resulting from unauthorized use of your account.''',
    },
    {
      'title': 'Medical Disclaimer',
      'icon': Icons.medical_services_rounded,
      'content': '''IMPORTANT: ZyntraCare is a technology platform that facilitates healthcare services. We do not provide medical advice, diagnosis, or treatment.

• AI-powered features are for informational purposes only and do not replace professional medical judgment
• Always consult a qualified healthcare provider for medical decisions
• In case of emergency, call your local emergency services immediately
• Lab results and health reports should be interpreted by your doctor
• Telehealth consultations are subject to the provider's professional judgment

ZyntraCare disclaims all warranties regarding the accuracy, completeness, or reliability of AI-generated health insights.''',
    },
    {
      'title': 'Intellectual Property',
      'icon': Icons.copyright_rounded,
      'content': '''All content, features, and functionality of ZyntraCare are owned by ZyntraCare Health Technologies Pvt. Ltd. and are protected by applicable intellectual property laws.

• The ZyntraCare name, logo, and branding are registered trademarks
• Platform code, algorithms, and AI models are proprietary
• User-generated content remains the property of the user
• You may not reproduce, distribute, modify, or create derivative works without written permission
• License to use the platform is revocable and non-transferable

Unauthorized use of our intellectual property may result in legal action.''',
    },
    {
      'title': 'Limitation of Liability',
      'icon': Icons.shield_rounded,
      'content': '''To the maximum extent permitted by law, ZyntraCare shall not be liable for:
• Indirect, incidental, or consequential damages
• Loss of data, profits, or business opportunities
• Damages arising from third-party services accessed through our platform
• Medical outcomes resulting from user decisions
• Service interruptions due to maintenance or technical issues

Our total liability is limited to the amount paid by you in the 12 months preceding the claim. This limitation does not apply to liability for death, personal injury, or fraud.''',
    },
    {
      'title': 'Termination',
      'icon': Icons.cancel_schedule_send_rounded,
      'content': '''Either party may terminate this agreement:
• Users may delete their account at any time through settings
• We may suspend or terminate accounts for:
  - Violation of these terms
  - Illegal or fraudulent activity
  - Non-payment of fees
  - Extended inactivity (over 12 months)

Upon termination:
• Your access to the platform will be revoked
• Data will be retained as required by applicable law
• Outstanding fees remain payable
• Certain obligations survive termination (e.g., dispute resolution)

You may request data export before account deletion by contacting support@zyntracare.com.''',
    },
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 400));
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
                      Expanded(child: Text('Terms of Service', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700))),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Last updated: June 10, 2026', style: GoogleFonts.inter(color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : Row(
                      children: [
                        Container(
                          width: 44,
                          decoration: BoxDecoration(
                            color: ZyntraColors.surface,
                            border: Border(right: BorderSide(color: ZyntraColors.border)),
                          ),
                          child: ListView(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            children: List.generate(_sections.length, (i) {
                              final s = _sections[i];
                              return Tooltip(
                                message: s['title'] as String,
                                child: GestureDetector(
                                  onTap: () => _scrollToSection(i),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    alignment: Alignment.center,
                                    child: Icon(s['icon'] as IconData, color: ZyntraColors.cyan, size: 20),
                                  ),
                                ),
                              );
                            }),
                          ),
                        ),
                        Expanded(
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                            itemCount: _sections.length,
                            itemBuilder: (_, i) => _buildSection(i),
                          ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _scrollToSection(int index) {
    setState(() {
      if (!_expandedSections.contains(index)) {
        _expandedSections.add(index);
      }
    });
  }

  Widget _buildSection(int i) {
    final s = _sections[i];
    final expanded = _expandedSections.contains(i);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: expanded ? ZyntraColors.purple.withValues(alpha: 0.3) : ZyntraColors.border),
      ),
      child: Column(
        children: [
          GestureDetector(
            onTap: () {
              setState(() {
                if (expanded) { _expandedSections.remove(i); } else { _expandedSections.add(i); }
              });
            },
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: ZyntraColors.purple.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(s['icon'] as IconData, color: ZyntraColors.purple, size: 16),
                  ),
                  const SizedBox(width: 10),
                  Expanded(child: Text(s['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600))),
                  AnimatedRotation(
                    turns: expanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: const Icon(Icons.expand_more_rounded, color: ZyntraColors.purple, size: 22),
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            crossFadeState: expanded ? CrossFadeState.showFirst : CrossFadeState.showSecond,
            duration: const Duration(milliseconds: 250),
            firstChild: Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Text(
                s['content'] as String,
                style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12, height: 1.5),
              ),
            ),
            secondChild: const SizedBox.shrink(),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.02, end: 0);
  }

  Widget _buildShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Column(
          children: List.generate(5, (_) => Container(
            height: 60,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14)),
          )),
        ),
      ),
    );
  }
}
