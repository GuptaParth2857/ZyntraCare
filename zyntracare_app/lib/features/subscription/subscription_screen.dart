import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});
  @override State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  final _api = ApiService();
  bool _loading = true;
  Map<String, dynamic>? _data;
  final _couponCtrl = TextEditingController();

  final _plans = [
    {'name': 'Basic', 'price': 'Free', 'period': '', 'color': ZyntraColors.teal, 'features': ['Telehealth', 'AI Chat', 'Basic tracking']},
    {'name': 'Premium', 'price': '₹199', 'period': '/mo', 'color': ZyntraColors.cyan, 'features': ['All Basic +', 'Video Consult', 'Health Records', 'AI Vision']},
    {'name': 'Family', 'price': '₹499', 'period': '/mo', 'color': ZyntraColors.purple, 'features': ['All Premium +', 'Up to 5 family members', 'Pet health']},
    {'name': 'Enterprise', 'price': 'Custom', 'period': '', 'color': ZyntraColors.amber, 'features': ['All Family +', 'API access', 'White label', 'Priority support']},
  ];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  @override
  void dispose() {
    _couponCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/subscriptions');
    if (res != null && mounted) {
      setState(() {
        _data = res;
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  String? get _currentPlan => _data?['currentPlan'] as String?;
  String? get _planStatus => _data?['status'] as String?;
  String? get _renewalDate => _data?['renewalDate'] as String?;

  Color get _statusColor {
    switch (_planStatus) {
      case 'Active': return ZyntraColors.green;
      case 'Expired': return ZyntraColors.red;
      case 'Cancelled': return ZyntraColors.amber;
      default: return ZyntraColors.white70;
    }
  }

  void _applyCoupon() {
    if (_couponCtrl.text.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Coupon applied!', style: GoogleFonts.inter()),
        backgroundColor: ZyntraColors.green,
      ));
      _couponCtrl.clear();
    }
  }

  void _cancelSubscription() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: ZyntraColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: ZyntraColors.border)),
        title: Text('Cancel Subscription', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        content: Text('Are you sure you want to cancel? You will lose access to premium features at the end of the billing cycle.', style: GoogleFonts.inter(color: ZyntraColors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Keep Plan', style: GoogleFonts.inter(color: ZyntraColors.white70))),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Subscription cancelled', style: GoogleFonts.inter()), backgroundColor: ZyntraColors.red));
            },
            child: Text('Cancel Anyway', style: GoogleFonts.inter(color: ZyntraColors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        title: Text('Subscription', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight))),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _loading ? _buildShimmer() : _buildContent(),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: ZyntraColors.card,
      highlightColor: ZyntraColors.border,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(5, (_) => Container(
          height: 120,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
        )),
      ),
    );
  }

  Widget _buildContent() {
    return RefreshIndicator(
      onRefresh: _fetchData,
      color: ZyntraColors.cyan,
      backgroundColor: ZyntraColors.surface,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          _buildCurrentPlanCard(),
          const SizedBox(height: 24),
          _buildComparisonTable(),
          const SizedBox(height: 24),
          _buildCouponSection(),
          const SizedBox(height: 24),
          _buildPaymentHistory(),
          const SizedBox(height: 32),
        ]),
      ),
    );
  }

  Widget _buildCurrentPlanCard() {
    final plan = _plans.firstWhere((p) => p['name'] == _currentPlan, orElse: () => _plans[0]);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [(plan['color'] as Color).withValues(alpha: 0.15), ZyntraColors.card],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: (plan['color'] as Color).withValues(alpha: 0.3)),
      ),
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Current Plan', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
            const SizedBox(height: 4),
            Text(plan['name'] as String, style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w800, color: plan['color'] as Color)),
          ]),
          if (_planStatus != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: _statusColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(_planStatus!, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: _statusColor)),
            ),
        ]),
        const SizedBox(height: 16),
        Row(children: [
          Text(plan['price'] as String, style: GoogleFonts.inter(fontSize: 36, fontWeight: FontWeight.w800, color: Colors.white)),
          if ((plan['period'] as String).isNotEmpty)
            Text(plan['period'] as String, style: GoogleFonts.inter(fontSize: 16, color: ZyntraColors.white70)),
          if (_renewalDate != null) ...[
            const Spacer(),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text('Renewal', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
              Text(_renewalDate!, style: GoogleFonts.inter(fontSize: 13, color: Colors.white, fontWeight: FontWeight.w500)),
            ]),
          ],
        ]),
        const SizedBox(height: 16),
        if (_currentPlan != 'Enterprise' && _currentPlan != null)
          Row(children: [
            Expanded(
              child: SizedBox(
                height: 44,
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: ZyntraColors.border),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    foregroundColor: Colors.white,
                  ),
                  child: Text('Downgrade', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SizedBox(
                height: 44,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ZyntraColors.cyan,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: Text('Upgrade', style: GoogleFonts.inter(color: ZyntraColors.bg, fontWeight: FontWeight.w700)),
                ),
              ),
            ),
          ]),
        if (_currentPlan != 'Basic' && _currentPlan != null) ...[
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity, height: 44,
            child: TextButton(
              onPressed: _cancelSubscription,
              style: TextButton.styleFrom(foregroundColor: ZyntraColors.red),
              child: Text('Cancel Subscription', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
            ),
          ),
        ],
      ]),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildComparisonTable() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(children: [
        Text('Compare Plans', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
        const SizedBox(height: 16),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowColor: WidgetStateProperty.all(ZyntraColors.surface),
            border: TableBorder.all(color: ZyntraColors.border.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(8)),
            columnSpacing: 20,
            columns: [
              const DataColumn(label: SizedBox(width: 100, child: Text(''))),
              ..._plans.map((p) => DataColumn(
                label: SizedBox(
                  width: 90,
                  child: Column(children: [
                    Text(p['name'] as String, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: p['color'] as Color)),
                    Text(p['price'] as String, style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
                  ]),
                ),
              )),
            ],
            rows: [
              _featureRow('Telehealth', [true, true, true, true]),
              _featureRow('AI Chat', [true, true, true, true]),
              _featureRow('Basic Tracking', [true, true, true, true]),
              _featureRow('Video Consult', [false, true, true, true]),
              _featureRow('Health Records', [false, true, true, true]),
              _featureRow('AI Vision', [false, true, true, true]),
              _featureRow('Family Members', [false, false, 'Up to 5', 'Unlimited']),
              _featureRow('Pet Health', [false, false, true, true]),
              _featureRow('API Access', [false, false, false, true]),
              _featureRow('White Label', [false, false, false, true]),
              _featureRow('Priority Support', [false, false, false, true]),
            ],
          ),
        ),
      ]),
    ).animate().fadeIn(delay: 100.ms, duration: 400.ms);
  }

  DataRow _featureRow(String feature, List<dynamic> values) {
    return DataRow(cells: [
      DataCell(Text(feature, style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70))),
      ...values.map((v) => DataCell(
        SizedBox(
          width: 90,
          child: v == true
            ? Icon(Icons.check_rounded, color: ZyntraColors.green, size: 18)
            : v == false
              ? Icon(Icons.remove_rounded, color: ZyntraColors.white70.withValues(alpha: 0.3), size: 18)
              : Text(v.toString(), style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
        ),
      )),
    ]);
  }

  Widget _buildCouponSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(children: [
        Text('Have a Coupon Code?', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: TextField(
              controller: _couponCtrl,
              style: GoogleFonts.inter(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Enter coupon code',
                hintStyle: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.5)),
                filled: true,
                fillColor: ZyntraColors.surface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: ZyntraColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: ZyntraColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: ZyntraColors.cyan)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              ),
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            height: 48, width: 100,
            child: ElevatedButton(
              onPressed: _applyCoupon,
              style: ElevatedButton.styleFrom(
                backgroundColor: ZyntraColors.cyan,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: Text('Apply', style: GoogleFonts.inter(color: ZyntraColors.bg, fontWeight: FontWeight.w700)),
            ),
          ),
        ]),
      ]),
    ).animate().fadeIn(delay: 200.ms, duration: 400.ms);
  }

  Widget _buildPaymentHistory() {
    final history = (_data?['paymentHistory'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Payment History', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
      const SizedBox(height: 12),
      if (history.isEmpty)
        Container(
          width: double.infinity, padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: ZyntraColors.border)),
          child: Text('No payment history yet', style: GoogleFonts.inter(color: ZyntraColors.white70), textAlign: TextAlign.center),
        )
      else
        ...history.map((p) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5))),
          child: Row(children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(p['plan'] ?? '', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.white)),
              Text(p['date'] ?? '', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
            ])),
            Text('₹${p['amount'] ?? 0}', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
          ]),
        )),
    ]).animate().fadeIn(delay: 300.ms, duration: 400.ms);
  }
}
