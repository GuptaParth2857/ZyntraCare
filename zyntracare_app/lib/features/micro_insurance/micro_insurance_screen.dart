import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class MicroInsuranceScreen extends StatefulWidget {
  const MicroInsuranceScreen({super.key});
  @override State<MicroInsuranceScreen> createState() => _MicroInsuranceScreenState();
}

class _MicroInsuranceScreenState extends State<MicroInsuranceScreen> {
  bool _loading = true;
  List<dynamic> _plans = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().get('/api/micro-insurance');
      if (mounted && res is List) setState(() => _plans = res);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  final _placeholderPlans = [
    {'name': 'Health Shield', 'coverage': '₹2,00,000', 'premium': '₹199/mo', 'duration': '1 Year', 'features': ['Hospitalization', 'Day care procedures', 'Maternity', 'Critical illness'], 'color': ZyntraColors.cyan},
    {'name': 'Family Protect', 'coverage': '₹5,00,000', 'premium': '₹399/mo', 'duration': '2 Years', 'features': ['Hospitalization', 'Day care procedures', 'Maternity', 'Critical illness', 'OPD cover'], 'color': ZyntraColors.purple},
    {'name': 'Senior Care', 'coverage': '₹3,00,000', 'premium': '₹299/mo', 'duration': '1 Year', 'features': ['Hospitalization', 'Day care procedures', 'Pre-existing diseases', 'Ambulance cover'], 'color': ZyntraColors.green},
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
                  Text('Micro Insurance', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.cyan.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.shield_rounded, color: ZyntraColors.cyan, size: 22),
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
                            _activePolicyCard(),
                            const SizedBox(height: 20),
                            _sectionHeader('Available Plans', Icons.description_rounded),
                            const SizedBox(height: 12),
                            ...(_plans.isNotEmpty ? _plans : _placeholderPlans).map((p) => _planCard(p)),
                            const SizedBox(height: 24),
                            _sectionHeader('Claim Status', Icons.assignment_rounded),
                            const SizedBox(height: 12),
                            _claimTracker(),
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

  Widget _activePolicyCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ZyntraColors.cyan, ZyntraColors.purple],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.shield_rounded, color: Colors.white, size: 24),
              const SizedBox(width: 8),
              Text('Active Policy', style: GoogleFonts.poppins(color: Colors.white.withValues(alpha: 0.9), fontSize: 14)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                child: Text('Active', style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text('Health Shield Plus', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text('Policy: ZYN-HS-2026-0042', style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.7), fontSize: 11)),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Coverage Remaining', style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.7), fontSize: 10)),
                    const SizedBox(height: 4),
                    Text('₹1,75,000', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Expires', style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.7), fontSize: 10)),
                    const SizedBox(height: 4),
                    Text('Dec 2026', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: 0.125,
              backgroundColor: Colors.white.withValues(alpha: 0.2),
              valueColor: const AlwaysStoppedAnimation(Colors.white),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 4),
          Text('₹25,000 used of ₹2,00,000', style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.7), fontSize: 10)),
        ],
      ),
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

  Widget _planCard(dynamic p) {
    final color = p['color'] as Color? ?? ZyntraColors.cyan;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: Icon(Icons.shield_rounded, color: color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p['name'] ?? 'Plan', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text('${p['coverage']} coverage', style: GoogleFonts.inter(color: color, fontSize: 12, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(p['premium'] ?? '₹199/mo', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 14, fontWeight: FontWeight.w700)),
                  Text(p['duration'] ?? '1 Year', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...((p['features'] as List?) ?? []).map((f) => Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: color, size: 14),
                const SizedBox(width: 6),
                Text(f.toString(), style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ],
            ),
          )),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => _showBuySheet(p),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [color, color == ZyntraColors.cyan ? ZyntraColors.purple : color]),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))],
              ),
              child: Center(
                child: Text('Buy Now', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _claimTracker() {
    final claims = [
      {'id': 'CLM-001', 'date': '2026-06-10', 'type': 'Hospitalization', 'amount': '₹12,000', 'status': 'Approved', 'color': ZyntraColors.green},
      {'id': 'CLM-002', 'date': '2026-06-15', 'type': 'Day Care', 'amount': '₹4,500', 'status': 'Processing', 'color': ZyntraColors.amber},
      {'id': 'CLM-003', 'date': '2026-06-20', 'type': 'Pharmacy', 'amount': '₹2,800', 'status': 'Pending', 'color': ZyntraColors.red},
    ];
    return Column(
      children: claims.map((c) => Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: (c['color'] as Color).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(Icons.receipt_rounded, color: c['color'] as Color, size: 16),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(c['type'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(width: 6),
                      Text(c['id'] as String, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
                    ],
                  ),
                  Row(
                    children: [
                      Text(c['date'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                      const SizedBox(width: 8),
                      Text(c['amount'] as String, style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: (c['color'] as Color).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
              child: Text(c['status'] as String, style: GoogleFonts.inter(color: c['color'] as Color, fontSize: 10, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      )).toList(),
    );
  }

  void _showBuySheet(dynamic p) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.55,
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
              Text('Apply for ${p['name'] ?? 'Insurance'}', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              _sheetField('Full Name', Icons.person_rounded),
              const SizedBox(height: 12),
              _sheetField('Date of Birth', Icons.calendar_month_rounded),
              const SizedBox(height: 12),
              _sheetField('Aadhaar Number', Icons.badge_rounded),
              const SizedBox(height: 12),
              _sheetField('Phone Number', Icons.phone_rounded),
              const SizedBox(height: 12),
              _sheetField('Address', Icons.home_rounded),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Application submitted for ${p['name']}!', style: GoogleFonts.inter(color: Colors.white)),
                    backgroundColor: ZyntraColors.green,
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
                    child: Text('Submit Application', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
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
