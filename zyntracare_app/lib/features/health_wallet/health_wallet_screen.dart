import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';

class HealthWalletScreen extends StatefulWidget {
  const HealthWalletScreen({super.key});
  @override State<HealthWalletScreen> createState() => _HealthWalletScreenState();
}

class _HealthWalletScreenState extends State<HealthWalletScreen> with SingleTickerProviderStateMixin {
  bool _loading = true;
  String _filter = 'All';
  List<Map<String, dynamic>> _transactions = [];
  int _zynBalance = 2500;
  double _inrBalance = 75000.0;
  int _rewardPoints = 1250;

  final _filterOptions = ['All', 'Credits', 'Debits'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) {
      setState(() {
        _transactions = _placeholderTx();
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _placeholderTx() => [
    {'type': 'credit', 'label': 'ZYN Reward - Health Checkup', 'amount': 500, 'date': '2026-06-24', 'status': 'completed', 'icon': Icons.card_giftcard_rounded},
    {'type': 'credit', 'label': 'Referral Bonus', 'amount': 200, 'date': '2026-06-22', 'status': 'completed', 'icon': Icons.person_add_rounded},
    {'type': 'debit', 'label': 'Medicine Purchase - Apollo Pharmacy', 'amount': 350, 'date': '2026-06-20', 'status': 'completed', 'icon': Icons.medication_rounded},
    {'type': 'credit', 'label': 'Insurance Claim Approved', 'amount': 15000, 'date': '2026-06-18', 'status': 'completed', 'icon': Icons.verified_rounded},
    {'type': 'debit', 'label': 'Lab Test Payment - Dr. Lal PathLabs', 'amount': 1200, 'date': '2026-06-15', 'status': 'pending', 'icon': Icons.science_rounded},
    {'type': 'credit', 'label': 'Daily Step Challenge Reward', 'amount': 50, 'date': '2026-06-14', 'status': 'completed', 'icon': Icons.directions_walk_rounded},
    {'type': 'debit', 'label': 'Telehealth Consultation', 'amount': 800, 'date': '2026-06-12', 'status': 'completed', 'icon': Icons.videocam_rounded},
    {'type': 'credit', 'label': 'ZYN Airdrop - Health Awareness', 'amount': 100, 'date': '2026-06-10', 'status': 'completed', 'icon': Icons.send_rounded},
  ];

  List<Map<String, dynamic>> get _filteredTx {
    if (_filter == 'All') return _transactions;
    return _transactions.where((t) => t['type'] == _filter.toLowerCase()).toList();
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
                      Text('Health Wallet', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : SingleChildScrollView(
                      padding: const EdgeInsets.only(bottom: 100),
                      child: Column(
                        children: [
                          const SizedBox(height: 16),
                          // Balance Card
                          _balanceCard(),
                          const SizedBox(height: 16),
                          // Quick Actions
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Row(
                              children: [
                                Expanded(child: _actionBtn(Icons.add_circle_rounded, 'Add Funds', ZyntraColors.green, _showAddFunds)),
                                const SizedBox(width: 8),
                                Expanded(child: _actionBtn(Icons.qr_code_scanner_rounded, 'Pay', ZyntraColors.cyan, () {
                                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                    content: Text('Scan QR to pay', style: GoogleFonts.inter(color: Colors.white)),
                                    backgroundColor: ZyntraColors.cyan,
                                    behavior: SnackBarBehavior.floating,
                                  ));
                                })),
                                const SizedBox(width: 8),
                                Expanded(child: _actionBtn(Icons.upload_rounded, 'Withdraw', ZyntraColors.amber, _showWithdraw)),
                                const SizedBox(width: 8),
                                Expanded(child: _actionBtn(Icons.card_giftcard_rounded, 'Rewards', ZyntraColors.pink, () {})),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                          // Insurance Claims
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                            child: Row(
                              children: [
                                Text('Insurance Claims', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                                  child: Text('2 Active', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 10, fontWeight: FontWeight.w600)),
                                ),
                              ],
                            ),
                          ),
                          _claimCard('Star Health - IPD Claim', '₹45,000', 'Under Review', ZyntraColors.amber),
                          const SizedBox(height: 8),
                          _claimCard('LIC Health - OPD Reimbursement', '₹2,500', 'Approved', ZyntraColors.green),
                          const SizedBox(height: 24),
                          // Transactions
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                            child: Row(
                              children: [
                                Text('Transactions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                const Spacer(),
                                Text('${_filteredTx.length} entries', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                              ],
                            ),
                          ),
                          // Filter Chips
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Row(
                              children: _filterOptions.map((f) => GestureDetector(
                                onTap: () => setState(() => _filter = f),
                                child: Container(
                                  margin: const EdgeInsets.only(right: 8),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: _filter == f ? ZyntraColors.cyan.withValues(alpha: 0.15) : ZyntraColors.surface,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: _filter == f ? ZyntraColors.cyan.withValues(alpha: 0.3) : ZyntraColors.border),
                                  ),
                                  child: Text(f, style: GoogleFonts.inter(color: _filter == f ? ZyntraColors.cyan : ZyntraColors.white70, fontSize: 12, fontWeight: FontWeight.w500)),
                                ),
                              )).toList(),
                            ),
                          ),
                          const SizedBox(height: 12),
                          ...List.generate(_filteredTx.length, (i) => _txCard(_filteredTx[i], i)),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _balanceCard() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF0F2145), Color(0xFF0D1A33)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.2)),
          boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.08), blurRadius: 20, offset: const Offset(0, 8))],
        ),
        child: Stack(
          children: [
            Positioned(top: -30, right: -30, child: Icon(Icons.account_balance_wallet_rounded, color: ZyntraColors.cyan.withValues(alpha: 0.05), size: 140)),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.currency_bitcoin_rounded, color: ZyntraColors.cyan, size: 20),
                      ),
                      const SizedBox(width: 10),
                      Text('ZYN Balance', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: ZyntraColors.purple.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text('$_rewardPoints pts', style: GoogleFonts.inter(color: ZyntraColors.purple, fontSize: 11, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('$_zynBalance', style: GoogleFonts.poppins(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w700)),
                      const SizedBox(width: 8),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text('ZYN', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 14, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                  Text('= ₹${_inrBalance.toStringAsFixed(0)} INR', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 500.ms);
  }

  Widget _actionBtn(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 4),
            Text(label, style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _claimCard(String title, String amount, String status, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(Icons.verified_rounded, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                  Text(amount, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
              child: Text(status, style: GoogleFonts.inter(color: color, fontSize: 9, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _txCard(Map<String, dynamic> tx, int i) {
    final isCredit = tx['type'] == 'credit';
    final color = isCredit ? ZyntraColors.green : ZyntraColors.red;
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (tx['icon'] == null ? ZyntraColors.cyan : ZyntraColors.cyan).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(tx['icon'] as IconData? ?? Icons.receipt_rounded, color: ZyntraColors.cyan, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tx['label'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                Text(tx['date'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('${isCredit ? '+' : '-'}₹${tx['amount'] ?? 0}', style: GoogleFonts.inter(color: color, fontSize: 14, fontWeight: FontWeight.w700)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: (tx['status'] == 'completed' ? ZyntraColors.green : ZyntraColors.amber).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(tx['status'] ?? '', style: GoogleFonts.inter(color: tx['status'] == 'completed' ? ZyntraColors.green : ZyntraColors.amber, fontSize: 8)),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 40).ms).slideY(begin: 0.05, end: 0);
  }

  void _showAddFunds() {
    final ctrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.4,
        decoration: const BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        child: Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)))),
              const SizedBox(height: 20),
              Text('Add Funds', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              Row(
                children: [1000, 2000, 5000, 10000].map((amount) {
                  return GestureDetector(
                    onTap: () => ctrl.text = amount.toString(),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
                      child: Text('₹$amount', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontWeight: FontWeight.w600)),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 12),
              TextField(controller: ctrl, style: GoogleFonts.inter(color: Colors.white), keyboardType: TextInputType.number, decoration: InputDecoration(hintText: 'Enter amount', hintStyle: GoogleFonts.inter(color: ZyntraColors.white40), filled: true, fillColor: ZyntraColors.surface, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: () => Navigator.pop(ctx),
                child: Container(
                  width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]), borderRadius: BorderRadius.circular(16)),
                  child: Center(child: Text('Add ₹${ctrl.text.isEmpty ? '0' : ctrl.text}', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showWithdraw() {
    final ctrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.35,
        decoration: const BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        child: Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)))),
              const SizedBox(height: 20),
              Text('Withdraw ZYN', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Text('Available: $_zynBalance ZYN (₹$_inrBalance)', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              const SizedBox(height: 12),
              TextField(controller: ctrl, style: GoogleFonts.inter(color: Colors.white), keyboardType: TextInputType.number, decoration: InputDecoration(hintText: 'ZYN tokens to withdraw', hintStyle: GoogleFonts.inter(color: ZyntraColors.white40), filled: true, fillColor: ZyntraColors.surface, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: () => Navigator.pop(ctx),
                child: Container(
                  width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(gradient: const LinearGradient(colors: [ZyntraColors.amber, ZyntraColors.pink]), borderRadius: BorderRadius.circular(16)),
                  child: Center(child: Text('Withdraw', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      itemCount: 5,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 70,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14)),
        ),
      ),
    );
  }
}
