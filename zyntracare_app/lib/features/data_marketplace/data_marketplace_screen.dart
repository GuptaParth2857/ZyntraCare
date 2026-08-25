import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class DataMarketplaceScreen extends StatefulWidget {
  const DataMarketplaceScreen({super.key});
  @override State<DataMarketplaceScreen> createState() => _DataMarketplaceScreenState();
}

class _DataMarketplaceScreenState extends State<DataMarketplaceScreen> {
  bool _loading = true;
  List<dynamic> _categories = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().get('/api/data-marketplace');
      if (mounted && res is List) setState(() => _categories = res);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  final _categoriesData = [
    {'title': 'Genomic Data', 'desc': 'DNA sequences & genetic markers', 'reward': '500 ZYN', 'contributors': '1,230', 'icon': Icons.biotech_rounded, 'color': ZyntraColors.purple},
    {'title': 'Fitness Data', 'desc': 'Activity logs, steps, workouts', 'reward': '200 ZYN', 'contributors': '4,560', 'icon': Icons.fitness_center_rounded, 'color': ZyntraColors.green},
    {'title': 'Sleep Patterns', 'desc': 'Sleep duration, quality, cycles', 'reward': '300 ZYN', 'contributors': '3,210', 'icon': Icons.nightlight_round, 'color': ZyntraColors.indigo},
    {'title': 'Nutrition Data', 'desc': 'Diet logs, meal preferences', 'reward': '250 ZYN', 'contributors': '2,890', 'icon': Icons.restaurant_rounded, 'color': ZyntraColors.amber},
    {'title': 'Mental Health', 'desc': 'Mood tracking, stress levels', 'reward': '350 ZYN', 'contributors': '1,870', 'icon': Icons.psychology_rounded, 'color': ZyntraColors.pink},
  ];

  final _transactions = [
    {'type': 'Genomic Data', 'amount': '+500 ZYN', 'date': '2026-06-21', 'status': 'completed'},
    {'type': 'Fitness Data', 'amount': '+200 ZYN', 'date': '2026-06-19', 'status': 'completed'},
    {'type': 'Sleep Patterns', 'amount': '+300 ZYN', 'date': '2026-06-15', 'status': 'pending'},
    {'type': 'Nutrition Data', 'amount': '+250 ZYN', 'date': '2026-06-10', 'status': 'completed'},
    {'type': 'Mental Health', 'amount': '+350 ZYN', 'date': '2026-06-05', 'status': 'completed'},
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
                  Text('Data Marketplace', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.cyan.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.bar_chart_rounded, color: ZyntraColors.cyan, size: 22),
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
                            _earningsDashboard(),
                            const SizedBox(height: 24),
                            _sectionHeader('Data Categories', Icons.category_rounded),
                            const SizedBox(height: 12),
                            ...(_categories.isNotEmpty ? _categories : _categoriesData).map((c) => _categoryCard(c)),
                            const SizedBox(height: 24),
                            _sectionHeader('Transaction History', Icons.swap_horiz_rounded),
                            const SizedBox(height: 12),
                            ..._transactions.map((t) => _transactionCard(t)),
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

  Widget _earningsDashboard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ZyntraColors.purple, ZyntraColors.indigo],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: ZyntraColors.purple.withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 10),
              Text('Earnings Dashboard', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _earningsItem('Total Earned', '1,600 ZYN', Icons.trending_up_rounded),
              const SizedBox(width: 12),
              _earningsItem('This Month', '500 ZYN', Icons.calendar_month_rounded),
              const SizedBox(width: 12),
              _earningsItem('Available', '1,050 ZYN', Icons.check_circle_rounded),
            ],
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text('Withdrawal requested!', style: GoogleFonts.inter(color: Colors.white)),
                backgroundColor: ZyntraColors.green,
                behavior: SnackBarBehavior.floating,
              ));
            },
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text('Withdraw Earnings', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _earningsItem(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: Colors.white.withValues(alpha: 0.7), size: 12),
                const SizedBox(width: 4),
                Text(label, style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.7), fontSize: 9)),
              ],
            ),
            const SizedBox(height: 6),
            Text(value, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
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

  Widget _categoryCard(dynamic c) {
    final color = c['color'] as Color? ?? ZyntraColors.cyan;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
            child: Icon(c['icon'] as IconData? ?? Icons.storage_rounded, color: color, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(c['title'] ?? 'Category', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(c['desc'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.people_rounded, color: ZyntraColors.white40, size: 12),
                    const SizedBox(width: 4),
                    Text('${c['contributors'] ?? '0'} contributors', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
                  ],
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(c['reward'] ?? '0 ZYN', style: GoogleFonts.inter(color: color, fontSize: 13, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () => _showConsentSheet(c),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('Contribute', style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _transactionCard(Map<String, dynamic> t) {
    return Container(
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
            decoration: BoxDecoration(
              color: ZyntraColors.green.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.arrow_downward_rounded, color: ZyntraColors.green, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t['type'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                Text(t['date'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(t['amount'] as String, style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 13, fontWeight: FontWeight.w700)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: t['status'] == 'completed' ? ZyntraColors.green.withValues(alpha: 0.15) : ZyntraColors.amber.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(t['status'] as String, style: GoogleFonts.inter(color: t['status'] == 'completed' ? ZyntraColors.green : ZyntraColors.amber, fontSize: 9, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showConsentSheet(dynamic c) {
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
              Text('Contribute Data', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Text('Share your ${c['title'] ?? 'data'} and earn ${c['reward'] ?? 'rewards'}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
                child: Row(
                  children: [
                    Icon(Icons.info_rounded, color: ZyntraColors.cyan, size: 20),
                    const SizedBox(width: 10),
                    Expanded(child: Text('Your data will be anonymized and encrypted. You retain full ownership and can revoke access anytime.', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11))),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              _consentOption('Share anonymously', true),
              const SizedBox(height: 8),
              _consentOption('Allow research use only', true),
              const SizedBox(height: 8),
              _consentOption('Receive notifications for data usage', false),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Data contribution submitted! You earned ${c['reward'] ?? 'rewards'}', style: GoogleFonts.inter(color: Colors.white)),
                    backgroundColor: ZyntraColors.green,
                    behavior: SnackBarBehavior.floating,
                  ));
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.purple, ZyntraColors.indigo]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: ZyntraColors.purple.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Center(
                    child: Text('Agree & Submit', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _consentOption(String label, bool defaultValue) {
    return StatefulBuilder(
      builder: (ctx, setLocalState) {
        bool value = defaultValue;
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: ZyntraColors.border)),
          child: Row(
            children: [
              Expanded(child: Text(label, style: GoogleFonts.inter(color: Colors.white, fontSize: 12))),
              Switch(
                value: value,
                activeThumbColor: ZyntraColors.cyan,
                onChanged: (v) => setLocalState(() => value = v),
              ),
            ],
          ),
        );
      },
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
