import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:flutter/services.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});
  @override State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  final _api = ApiService();
  bool _loading = true;
  Map<String, dynamic>? _data;
  int _totalPoints = 0;
  String _tier = 'Bronze';
  int _pointsToNextTier = 500;
  int _streakDays = 0;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/rewards');
    if (res != null && mounted) {
      setState(() {
        _data = res;
        _totalPoints = res['totalPoints'] ?? 0;
        _tier = res['tier'] ?? 'Bronze';
        _pointsToNextTier = res['pointsToNextTier'] ?? 500;
        _streakDays = res['streakDays'] ?? 0;
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  String get _tierIcon {
    switch (_tier) {
      case 'Platinum': return '🏆';
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      default: return '🥉';
    }
  }

  Color get _tierColor {
    switch (_tier) {
      case 'Platinum': return ZyntraColors.cyan;
      case 'Gold': return ZyntraColors.amber;
      case 'Silver': return ZyntraColors.white70;
      default: return ZyntraColors.teal;
    }
  }

  double get _tierProgress {
    switch (_tier) {
      case 'Platinum': return 1.0;
      case 'Gold': return 0.85;
      case 'Silver': return 0.55;
      default: return 0.25;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        title: Text('Rewards', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
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
        children: List.generate(6, (_) => Container(
          height: 100,
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
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _buildTierHeader(),
          const SizedBox(height: 20),
          _buildStreakTracker(),
          const SizedBox(height: 20),
          _buildPointsHistory(),
          const SizedBox(height: 20),
          _buildRewardsCatalog(),
          const SizedBox(height: 20),
          _buildBonusTasks(),
          const SizedBox(height: 20),
          _buildReferralSection(),
          const SizedBox(height: 32),
        ]),
      ),
    );
  }

  Widget _buildTierHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.card.withValues(alpha: 0.6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _tierColor.withValues(alpha: 0.3)),
        boxShadow: [BoxShadow(color: _tierColor.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('$_tierIcon $_tier Tier', style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: _tierColor)),
            const SizedBox(height: 4),
            Text('$_totalPoints pts', style: GoogleFonts.inter(fontSize: 36, fontWeight: FontWeight.w800, color: Colors.white)),
          ]),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(color: _tierColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
            child: Text('Lvl ${_tier == 'Platinum' ? 4 : _tier == 'Gold' ? 3 : _tier == 'Silver' ? 2 : 1}', style: GoogleFonts.inter(color: _tierColor, fontWeight: FontWeight.w600)),
          ),
        ]),
        const SizedBox(height: 16),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: _tierProgress,
            backgroundColor: ZyntraColors.border,
            valueColor: AlwaysStoppedAnimation<Color>(_tierColor),
            minHeight: 8,
          ),
        ),
        const SizedBox(height: 8),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('$_totalPoints pts', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
          if (_tier != 'Platinum')
            Text('$_pointsToNextTier pts to next tier', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.amber)),
        ]),
      ]),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildStreakTracker() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(children: [
        Container(
          width: 56, height: 56,
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [ZyntraColors.amber, ZyntraColors.pink]),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Center(child: Text('🔥', style: TextStyle(fontSize: 28))),
        ),
        const SizedBox(width: 16),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Daily Streak', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
          const SizedBox(height: 4),
          Text('$_streakDays consecutive days', style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.amber, fontWeight: FontWeight.w500)),
        ]),
        const Spacer(),
        ...List.generate(5, (i) => Container(
          width: 32, height: 32,
          margin: const EdgeInsets.only(left: 4),
          decoration: BoxDecoration(
            color: i < _streakDays % 7 ? ZyntraColors.green.withValues(alpha: 0.3) : ZyntraColors.border,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(child: Text(i < _streakDays % 7 ? '✅' : '○', style: TextStyle(fontSize: 14, color: i < _streakDays % 7 ? ZyntraColors.green : ZyntraColors.white70))),
        )),
      ]),
    ).animate().fadeIn(delay: 100.ms, duration: 400.ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildPointsHistory() {
    final history = (_data?['history'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Points History', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
      const SizedBox(height: 12),
      if (history.isEmpty)
        Container(
          width: double.infinity, padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: ZyntraColors.border)),
          child: Text('No activity yet', style: GoogleFonts.inter(color: ZyntraColors.white70), textAlign: TextAlign.center),
        )
      else
        ...history.take(5).map((item) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5))),
          child: Row(children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: (item['points'] ?? 0) > 0 ? ZyntraColors.green.withValues(alpha: 0.15) : ZyntraColors.red.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon((item['points'] ?? 0) > 0 ? Icons.add_circle_outline : Icons.remove_circle_outline, color: (item['points'] ?? 0) > 0 ? ZyntraColors.green : ZyntraColors.red, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item['action'] ?? '', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.white)),
              Text(item['date'] ?? '', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
            ])),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text('${(item['points'] ?? 0) > 0 ? '+' : ''}${item['points'] ?? 0}', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: (item['points'] ?? 0) > 0 ? ZyntraColors.green : ZyntraColors.red)),
              Text('${item['balance'] ?? 0} pts', style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.white70)),
            ]),
          ]),
        )),
    ]).animate().fadeIn(delay: 200.ms, duration: 400.ms);
  }

  Widget _buildRewardsCatalog() {
    final items = (_data?['catalog'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Rewards Catalog', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
      const SizedBox(height: 12),
      SizedBox(
        height: 220,
        child: items.isEmpty
          ? Center(child: Text('No rewards available', style: GoogleFonts.inter(color: ZyntraColors.white70)))
          : ListView.separated(
              scrollDirection: Axis.horizontal, itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(width: 12),
              itemBuilder: (_, i) => _buildRewardItem(items[i], i),
            ),
      ),
    ]).animate().fadeIn(delay: 300.ms, duration: 400.ms);
  }

  Widget _buildRewardItem(Map<String, dynamic> item, int index) {
    final points = item['pointsRequired'] ?? 0;
    final canRedeem = _totalPoints >= points;
    return Container(
      width: 160,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: canRedeem ? ZyntraColors.cyan.withValues(alpha: 0.3) : ZyntraColors.border),
      ),
      child: Column(children: [
        Container(
          width: 64, height: 64,
          decoration: BoxDecoration(
            color: ZyntraColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Center(child: Icon(Icons.card_giftcard_rounded, color: ZyntraColors.cyan.withValues(alpha: 0.6), size: 28)),
        ),
        const SizedBox(height: 12),
        Text(item['name'] ?? '', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white), maxLines: 1, overflow: TextOverflow.ellipsis),
        const SizedBox(height: 4),
        Text('$points pts', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.amber, fontWeight: FontWeight.w600)),
        const Spacer(),
        SizedBox(
          width: double.infinity, height: 36,
          child: ElevatedButton(
            onPressed: canRedeem ? () => _showRedeemConfirm(item) : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: canRedeem ? ZyntraColors.cyan : ZyntraColors.border,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            child: Text(canRedeem ? 'Redeem' : 'Locked', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ),
      ]),
    ).animate().fadeIn(delay: (index * 80).ms, duration: 400.ms).slideX(begin: 0.1, end: 0);
  }

  void _showRedeemConfirm(Map<String, dynamic> item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: ZyntraColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: ZyntraColors.border)),
        title: Text('Confirm Redemption', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        content: Text('Redeem ${item['name']} for ${item['pointsRequired']} pts?', style: GoogleFonts.inter(color: ZyntraColors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: GoogleFonts.inter(color: ZyntraColors.white70))),
          TextButton(onPressed: () { Navigator.pop(ctx); _redeemItem(item); }, child: Text('Redeem', style: GoogleFonts.inter(color: ZyntraColors.cyan))),
        ],
      ),
    );
  }

  void _redeemItem(Map<String, dynamic> item) async {
    final res = await _api.post('/api/rewards/redeem', body: {'itemId': item['id']});
    if (res != null && mounted) {
      _fetchData();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${item['name']} redeemed!', style: GoogleFonts.inter()), backgroundColor: ZyntraColors.green));
    }
  }

  Widget _buildBonusTasks() {
    final tasks = (_data?['bonusTasks'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [
      {'name': 'Complete Health Checkup', 'points': 500, 'done': false},
      {'name': 'Visit Doctor', 'points': 200, 'done': false},
      {'name': 'Log Meals Daily', 'points': 50, 'done': false},
    ];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Bonus Tasks', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
      const SizedBox(height: 12),
      ...tasks.map((task) => Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
        ),
        child: Row(children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: (task['done'] == true) ? ZyntraColors.green.withValues(alpha: 0.15) : ZyntraColors.purple.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon((task['done'] == true) ? Icons.check_circle : Icons.stars_rounded, color: (task['done'] == true) ? ZyntraColors.green : ZyntraColors.purple, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(task['name'] ?? '', style: GoogleFonts.inter(fontSize: 14, color: Colors.white))),
          Text('+${task['points']}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: ZyntraColors.amber)),
        ]),
      )),
    ]).animate().fadeIn(delay: 400.ms, duration: 400.ms);
  }

  Widget _buildReferralSection() {
    final referralCode = _data?['referralCode'] ?? 'ZYNTRA${DateTime.now().year}';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.purple.withValues(alpha: 0.2), ZyntraColors.cyan.withValues(alpha: 0.1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.purple.withValues(alpha: 0.3)),
      ),
      child: Column(children: [
        Text('Refer & Earn', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
        const SizedBox(height: 4),
        Text('Share your code & earn 200 pts per referral', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: ZyntraColors.bg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: ZyntraColors.purple.withValues(alpha: 0.4)),
          ),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Text(referralCode, style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800, color: ZyntraColors.cyan, letterSpacing: 2)),
            const SizedBox(width: 16),
            GestureDetector(
              onTap: () {
                Clipboard.setData(ClipboardData(text: 'Join ZyntraCare with my referral code: $referralCode'));
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Referral code copied!')));
              },
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.share_rounded, color: ZyntraColors.cyan, size: 22),
              ),
            ),
          ]),
        ),
      ]),
    ).animate().fadeIn(delay: 500.ms, duration: 400.ms);
  }
}
