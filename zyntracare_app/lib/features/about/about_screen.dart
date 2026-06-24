import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';

class AboutScreen extends StatefulWidget {
  const AboutScreen({super.key});
  @override State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    Future.delayed(1500.ms, () {
      if (mounted) setState(() => _loading = false);
    });
  }

  final _stats = [
    {'label': 'Users', 'value': '10M+', 'icon': Icons.people_rounded, 'color': ZyntraColors.cyan},
    {'label': 'Hospitals', 'value': '5K+', 'icon': Icons.local_hospital_rounded, 'color': ZyntraColors.purple},
    {'label': 'Doctors', 'value': '25K+', 'icon': Icons.medical_services_rounded, 'color': ZyntraColors.green},
    {'label': 'Lives Saved', 'value': '50K+', 'icon': Icons.favorite_rounded, 'color': ZyntraColors.red},
  ];

  final _features = [
    {'title': 'AI Vision', 'desc': 'Edge-based diagnostic imaging analysis', 'icon': Icons.visibility_rounded, 'color': ZyntraColors.cyan},
    {'title': 'Blockchain', 'desc': 'Tamper-proof health record storage', 'icon': Icons.link_rounded, 'color': ZyntraColors.purple},
    {'title': 'Telehealth', 'desc': '24/7 video consultations with specialists', 'icon': Icons.videocam_rounded, 'color': ZyntraColors.green},
    {'title': 'AI Diagnostics', 'desc': 'Clinical-grade ML diagnostic support', 'icon': Icons.psychology_rounded, 'color': ZyntraColors.amber},
    {'title': 'IoT Integration', 'desc': 'Connect wearables & smart devices', 'icon': Icons.watch_rounded, 'color': ZyntraColors.teal},
    {'title': 'Emergency Response', 'desc': 'Real-time triage & ambulance dispatch', 'icon': Icons.emergency_rounded, 'color': ZyntraColors.red},
    {'title': 'Health Analytics', 'desc': 'Personalized health insights & trends', 'icon': Icons.analytics_rounded, 'color': ZyntraColors.pink},
    {'title': 'Digital Twin', 'desc': 'AI-powered virtual health replica', 'icon': Icons.copy_all_rounded, 'color': ZyntraColors.indigo},
  ];

  final _team = [
    {'name': 'Dr. Aarav Mehta', 'role': 'CEO & Founder', 'color': ZyntraColors.cyan},
    {'name': 'Dr. Priya Sharma', 'role': 'Chief Medical Officer', 'color': ZyntraColors.purple},
    {'name': 'Rahul Verma', 'role': 'CTO', 'color': ZyntraColors.green},
    {'name': 'Ananya Gupta', 'role': 'Head of AI Research', 'color': ZyntraColors.teal},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading ? _buildShimmer() : _buildContent(),
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 28),
          _buildAppInfo(),
          const SizedBox(height: 24),
          _buildStatsRow(),
          const SizedBox(height: 28),
          _buildFeaturesSection(),
          const SizedBox(height: 28),
          _buildMissionSection(),
          const SizedBox(height: 28),
          _buildTeamSection(),
          const SizedBox(height: 28),
          _buildVersionInfo(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
          ),
        ),
        const SizedBox(width: 12),
        Text('About', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
      ],
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.05, end: 0);
  }

  Widget _buildAppInfo() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: ZyntraColors.border),
        boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.06), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Container(
            width: 90, height: 90,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
              boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 24, spreadRadius: 2)],
            ),
            child: const Icon(Icons.favorite_rounded, color: Colors.white, size: 44),
          ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),
          const SizedBox(height: 20),
          ShaderMask(
            shaderCallback: (b) => const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]).createShader(b),
            child: Text('ZyntraCare', style: GoogleFonts.poppins(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
          ),
          const SizedBox(height: 6),
          Text('AI-Powered Healthcare for Bharat', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 15, fontWeight: FontWeight.w400)),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.08, end: 0);
  }

  Widget _buildStatsRow() {
    return Row(
      children: _stats.map((s) => Expanded(
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            children: [
              Icon(s['icon'] as IconData, color: s['color'] as Color, size: 22),
              const SizedBox(height: 8),
              Text(s['value'] as String, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(s['label'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
            ],
          ),
        ),
      )).toList(),
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }

  Widget _buildFeaturesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Core Features', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 14),
        ..._features.map((f) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: (f['color'] as Color).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(f['icon'] as IconData, color: f['color'] as Color, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(f['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(f['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: ZyntraColors.white40, size: 20),
            ],
          ),
        )).toList(),
      ],
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  Widget _buildMissionSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.purple.withValues(alpha: 0.12), ZyntraColors.cyan.withValues(alpha: 0.06)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.purple.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.flag_rounded, color: ZyntraColors.cyan, size: 22),
              const SizedBox(width: 10),
              Text('Our Mission', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'To democratize healthcare access across India using cutting-edge AI, blockchain, and telemedicine technologies. '
            'We envision a Bharat where quality healthcare is not a privilege but a fundamental right for every citizen.',
            style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, height: 1.6),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms, duration: 300.ms);
  }

  Widget _buildTeamSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Our Team', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 14),
        ..._team.map((t) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: (t['color'] as Color).withValues(alpha: 0.2),
                child: Text(
                  (t['name'] as String).split(' ').last[0],
                  style: GoogleFonts.inter(color: t['color'] as Color, fontSize: 18, fontWeight: FontWeight.w700),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(t['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    Text(t['role'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
        )).toList(),
      ],
    ).animate().fadeIn(delay: 400.ms, duration: 300.ms);
  }

  Widget _buildVersionInfo() {
    return Center(
      child: Column(
        children: [
          Text('Version 2.0.0', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 12)),
          const SizedBox(height: 4),
          Text('Made with ❤️ in India', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
        ],
      ),
    ).animate().fadeIn(delay: 500.ms);
  }

  Widget _buildShimmer() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
      child: Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(height: 40, width: 120, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12))),
            const SizedBox(height: 20),
            Container(height: 200, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(24))),
            const SizedBox(height: 20),
            Row(children: List.generate(4, (_) => Expanded(child: Container(height: 80, margin: const EdgeInsets.symmetric(horizontal: 4), decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)))))),
            const SizedBox(height: 20),
            Container(height: 40, width: 180, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(8))),
            const SizedBox(height: 14),
            ...List.generate(4, (_) => Padding(padding: const EdgeInsets.only(bottom: 10), child: Container(height: 60, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))))),
          ],
        ),
      ),
    );
  }
}
