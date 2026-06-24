import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});
  @override State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  bool _loading = true;
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _subjectCtrl = TextEditingController();
  final _messageCtrl = TextEditingController();

  final _contacts = [
    {'icon': Icons.phone_rounded, 'label': 'Phone', 'value': '+91 1800-123-HELP', 'action': 'tel:+9118001234357'},
    {'icon': Icons.email_rounded, 'label': 'Email', 'value': 'support@zyntracare.com', 'action': 'mailto:support@zyntracare.com'},
    {'icon': Icons.location_on_rounded, 'label': 'Address', 'value': 'Zyntra Health Pvt. Ltd.\nBengaluru, Karnataka 560001', 'action': null},
    {'icon': Icons.access_time_rounded, 'label': 'Business Hours', 'value': 'Mon-Sat: 9:00 AM - 8:00 PM\nSun: 10:00 AM - 4:00 PM', 'action': null},
  ];

  final _socials = [
    {'icon': Icons.chat_rounded, 'label': 'WhatsApp', 'color': ZyntraColors.green},
    {'icon': Icons.tag_rounded, 'label': 'Twitter', 'color': ZyntraColors.cyan},
    {'icon': Icons.camera_alt_rounded, 'label': 'Instagram', 'color': ZyntraColors.pink},
    {'icon': Icons.business_rounded, 'label': 'LinkedIn', 'color': ZyntraColors.cyan},
  ];

  @override
  void initState() {
    super.initState();
    Future.delayed(1500.ms, () {
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _subjectCtrl.dispose();
    _messageCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Message sent! We\'ll get back to you soon.', style: GoogleFonts.inter(color: Colors.white)),
          backgroundColor: ZyntraColors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
      _nameCtrl.clear();
      _emailCtrl.clear();
      _subjectCtrl.clear();
      _messageCtrl.clear();
    }
  }

  Future<void> _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading ? _buildShimmer() : SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 24),
                _buildEmergencyBanner(),
                const SizedBox(height: 24),
                _buildContactForm(),
                const SizedBox(height: 24),
                _buildContactInfoCards(),
                const SizedBox(height: 24),
                _buildSocialSection(),
                const SizedBox(height: 24),
                _buildMapPlaceholder(),
                const SizedBox(height: 24),
                _buildEmergencySection(),
              ],
            ),
          ),
        ),
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
        Text('Contact Us', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
      ],
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.05, end: 0);
  }

  Widget _buildEmergencyBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [ZyntraColors.red.withValues(alpha: 0.15), ZyntraColors.red.withValues(alpha: 0.05)]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.emergency_rounded, color: ZyntraColors.red, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('24x7 Emergency Helpline', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                Text('Call 108 for immediate medical assistance', style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 12)),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _launch('tel:108'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: ZyntraColors.red,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text('CALL', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildContactForm() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.send_rounded, color: ZyntraColors.cyan, size: 22),
              const SizedBox(width: 10),
              Text('Send us a message', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 16),
          _buildField('Full Name', _nameCtrl, Icons.person_rounded, 'Enter your full name'),
          const SizedBox(height: 12),
          _buildField('Email Address', _emailCtrl, Icons.email_rounded, 'Enter your email', keyboardType: TextInputType.emailAddress),
          const SizedBox(height: 12),
          _buildField('Subject', _subjectCtrl, Icons.subject_rounded, 'What is this about?'),
          const SizedBox(height: 12),
          _buildField('Message', _messageCtrl, Icons.message_rounded, 'Describe your query...', maxLines: 4),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: _submit,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
              ),
              child: Center(
                child: Text('Send Message', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildField(String label, TextEditingController ctrl, IconData icon, String hint, {int maxLines = 1, TextInputType? keyboardType}) {
    return TextFormField(
      controller: ctrl,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 13),
        hintText: hint,
        hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 12),
        prefixIcon: Icon(icon, color: ZyntraColors.cyan, size: 20),
        filled: true,
        fillColor: ZyntraColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
    );
  }

  Widget _buildContactInfoCards() {
    return Column(
      children: _contacts.map((c) => Container(
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
                color: ZyntraColors.cyan.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(c['icon'] as IconData, color: ZyntraColors.cyan, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(c['label'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  const SizedBox(height: 2),
                  Text(c['value'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
            if (c['action'] != null)
              GestureDetector(
                onTap: () => _launch(c['action'] as String),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: ZyntraColors.cyan.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.open_in_new_rounded, color: ZyntraColors.cyan, size: 18),
                ),
              ),
          ],
        ),
      )).toList(),
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }

  Widget _buildSocialSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Follow Us', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 14),
        Row(
          children: _socials.map((s) => Expanded(
            child: GestureDetector(
              onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Opening ${s['label']}', style: GoogleFonts.inter(color: Colors.white)),
                  backgroundColor: ZyntraColors.card,
                  behavior: SnackBarBehavior.floating,
                ),
              ),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: (s['color'] as Color).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: (s['color'] as Color).withValues(alpha: 0.2)),
                ),
                child: Column(
                  children: [
                    Icon(s['icon'] as IconData, color: s['color'] as Color, size: 24),
                    const SizedBox(height: 6),
                    Text(s['label'] as String, style: GoogleFonts.inter(color: s['color'] as Color, fontSize: 10, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
          )).toList(),
        ),
      ],
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  Widget _buildMapPlaceholder() {
    return Container(
      width: double.infinity,
      height: 180,
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.map_rounded, color: ZyntraColors.cyan.withValues(alpha: 0.3), size: 48),
          const SizedBox(height: 12),
          Text('Zyntra Health Pvt. Ltd.', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text('Bengaluru, Karnataka, India', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 12)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: ZyntraColors.cyan.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.location_on_rounded, color: ZyntraColors.cyan, size: 16),
                const SizedBox(width: 4),
                Text('View on Map', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms, duration: 300.ms);
  }

  Widget _buildEmergencySection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.red.withValues(alpha: 0.12), ZyntraColors.red.withValues(alpha: 0.03)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          const Icon(Icons.emergency_rounded, color: ZyntraColors.red, size: 40),
          const SizedBox(height: 12),
          Text('Emergency? We\'re here 24x7', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Text('Call our toll-free helpline for immediate assistance', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => _launch('tel:108'),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: ZyntraColors.red,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.4), blurRadius: 16, offset: const Offset(0, 6))],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.call_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text('Call 108 — 24x7 Helpline', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 400.ms, duration: 300.ms);
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
            Container(height: 40, width: 160, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12))),
            const SizedBox(height: 20),
            Container(height: 60, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
            const SizedBox(height: 20),
            Container(height: 340, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20))),
            const SizedBox(height: 20),
            ...List.generate(4, (_) => Container(height: 70, margin: const EdgeInsets.only(bottom: 10), decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)))),
          ],
        ),
      ),
    );
  }
}
