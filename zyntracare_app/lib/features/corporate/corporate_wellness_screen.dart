import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class CorporateWellnessScreen extends StatefulWidget {
  const CorporateWellnessScreen({super.key});
  @override State<CorporateWellnessScreen> createState() => _CorporateWellnessScreenState();
}

class _CorporateWellnessScreenState extends State<CorporateWellnessScreen> {
  bool _loading = true;
  Map<String, dynamic>? _data;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().get('/api/corporate-wellness');
      if (mounted) setState(() => _data = res is Map ? Map<String, dynamic>.from(res) : null);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  final _features = [
    {'icon': Icons.favorite_rounded, 'title': 'Health Checkups', 'desc': 'Annual & bi-annual checkups', 'color': ZyntraColors.green},
    {'icon': Icons.psychology_rounded, 'title': 'Mental Health', 'desc': 'Counseling & therapy sessions', 'color': ZyntraColors.purple},
    {'icon': Icons.fitness_center_rounded, 'title': 'Fitness Challenges', 'desc': 'Team step challenges & yoga', 'color': ZyntraColors.cyan},
    {'icon': Icons.restaurant_rounded, 'title': 'Nutrition Counseling', 'desc': 'Diet plans & consultations', 'color': ZyntraColors.amber},
  ];

  final _testimonials = [
    {'name': 'Rajan Mishra', 'company': 'TechCorp India', 'text': 'Our employees love the wellness program. Absenteeism dropped by 40%.'},
    {'name': 'Anita Desai', 'company': 'GreenFields Ltd.', 'text': 'The mental health support has been invaluable for our team.'},
    {'name': 'Vikram Singh', 'company': 'Apex Solutions', 'text': 'Fitness challenges boosted team morale like never before.'},
  ];

  final _tiers = [
    {'name': 'Basic', 'price': '₹199', 'per': 'per employee/month', 'features': ['Health checkups', 'Mental health helpline', 'Fitness challenges', 'Health newsletter'], 'color': ZyntraColors.teal, 'popular': false},
    {'name': 'Premium', 'price': '₹399', 'per': 'per employee/month', 'features': ['Everything in Basic', 'Nutrition counseling', 'Mental health sessions', 'Annual health report', '24/7 doctor chat'], 'color': ZyntraColors.cyan, 'popular': true},
    {'name': 'Enterprise', 'price': 'Custom', 'per': 'contact for pricing', 'features': ['Everything in Premium', 'On-site health camps', 'Dedicated wellness manager', 'Spouse & family coverage', 'Custom integrations', 'HR analytics dashboard'], 'color': ZyntraColors.purple, 'popular': false},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
              child: Row(
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
                  Text('Corporate Wellness', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.business_rounded, color: ZyntraColors.green, size: 22),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : RefreshIndicator(
                      color: ZyntraColors.cyan,
                      backgroundColor: ZyntraColors.card,
                      onRefresh: _load,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _heroBanner(),
                            const SizedBox(height: 24),
                            _sectionHeader('Program Features', Icons.star_rounded),
                            const SizedBox(height: 12),
                            _featuresGrid(),
                            const SizedBox(height: 24),
                            _statsRow(),
                            const SizedBox(height: 24),
                            _sectionHeader('Pricing Tiers', Icons.monetization_on_rounded),
                            const SizedBox(height: 12),
                            ..._tiers.map((t) => _tierCard(t)),
                            const SizedBox(height: 24),
                            _sectionHeader('What Companies Say', Icons.format_quote_rounded),
                            const SizedBox(height: 12),
                            _testimonialsCarousel(),
                            const SizedBox(height: 24),
                            _enrollCta(),
                          ],
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _heroBanner() {
    final c = _data;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ZyntraColors.green, ZyntraColors.teal],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: ZyntraColors.green.withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Column(
        children: [
          const Icon(Icons.health_and_safety_rounded, color: Colors.white, size: 40),
          const SizedBox(height: 10),
          Text('Wellness at Work', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text('Comprehensive health programs for your organization',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.9), fontSize: 13),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _statItem(c != null ? '${c['companyCount'] ?? 150}' : '150', 'Companies'),
              _statItem(c != null ? '${c['employeesEnrolled'] ?? '12K+'}' : '12K+', 'Employees'),
              _statItem(c != null ? '${c['avgSatisfaction'] ?? 4.8}' : '4.8', 'Rating'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statItem(String val, String label) {
    return Column(
      children: [
        Text(val, style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
        Text(label, style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.8), fontSize: 10)),
      ],
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: ZyntraColors.cyan.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: ZyntraColors.cyan, size: 16),
        ),
        const SizedBox(width: 8),
        Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _featuresGrid() {
    return Row(
      children: _features.map((f) => Expanded(
        child: Container(
          margin: const EdgeInsets.only(right: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (f['color'] as Color).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(f['icon'] as IconData, color: f['color'] as Color, size: 20),
              ),
              const SizedBox(height: 8),
              Text(f['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
              const SizedBox(height: 2),
              Text(f['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 8), textAlign: TextAlign.center),
            ],
          ),
        ),
      )).toList(),
    );
  }

  Widget _statsRow() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.green.withValues(alpha: 0.1), ZyntraColors.teal.withValues(alpha: 0.05)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _infoCol('40%', 'Less absenteeism'),
          _infoCol('60%', 'Better productivity'),
          _infoCol('85%', 'Employee satisfaction'),
        ],
      ),
    );
  }

  Widget _infoCol(String val, String label) {
    return Column(
      children: [
        Text(val, style: GoogleFonts.poppins(color: ZyntraColors.green, fontSize: 22, fontWeight: FontWeight.w700)),
        Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10), textAlign: TextAlign.center),
      ],
    );
  }

  Widget _tierCard(Map<String, dynamic> tier) {
    final color = tier['color'] as Color;
    final popular = tier['popular'] as bool;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, popular ? color.withValues(alpha: 0.08) : ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: popular ? color.withValues(alpha: 0.5) : ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(tier['name'] as String, style: GoogleFonts.poppins(color: color, fontSize: 16, fontWeight: FontWeight.w700)),
              const Spacer(),
              if (popular)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                  child: Text('Popular', style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w600)),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(tier['price'] as String, style: GoogleFonts.poppins(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
              const SizedBox(width: 6),
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(tier['per'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...((tier['features'] as List).map((f) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: color, size: 16),
                const SizedBox(width: 8),
                Text(f.toString(), style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              ],
            ),
          ))),
        ],
      ),
    );
  }

  Widget _testimonialsCarousel() {
    return SizedBox(
      height: 130,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _testimonials.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (ctx, i) {
          final t = _testimonials[i];
          return Container(
            width: 280,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: ZyntraColors.green.withValues(alpha: 0.2),
                      child: Text((t['name'] as String)[0], style: GoogleFonts.poppins(color: ZyntraColors.green, fontSize: 14)),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(t['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                        Text(t['company'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text('"${t['text']}"', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11, fontStyle: FontStyle.italic)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _enrollCta() {
    return GestureDetector(
      onTap: () => _showEnrollSheet(),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [ZyntraColors.green, ZyntraColors.teal]),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: ZyntraColors.green.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
        ),
        child: Center(
          child: Text('Enroll Your Company', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
        ),
      ),
    );
  }

  void _showEnrollSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.6,
        decoration: const BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)))),
              const SizedBox(height: 20),
              Text('Enroll Your Company', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              _sheetField('Company Name', Icons.business_rounded),
              const SizedBox(height: 12),
              _sheetField('Contact Email', Icons.email_rounded),
              const SizedBox(height: 12),
              _sheetField('Employee Count', Icons.people_rounded),
              const SizedBox(height: 12),
              _sheetField('Phone Number', Icons.phone_rounded),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Enrollment request submitted!', style: GoogleFonts.inter(color: Colors.white)),
                    backgroundColor: ZyntraColors.green,
                    behavior: SnackBarBehavior.floating,
                  ));
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.green, ZyntraColors.teal]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: ZyntraColors.green.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Center(
                    child: Text('Submit Request', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sheetField(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: ZyntraColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: TextField(
        style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          icon: Icon(icon, color: ZyntraColors.cyan, size: 20),
          labelText: label,
          labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: 6,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 80,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}
