import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:shimmer/shimmer.dart';
import 'package:web3dart/web3dart.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class BlockchainScreen extends StatefulWidget {
  const BlockchainScreen({super.key});
  @override State<BlockchainScreen> createState() => _BlockchainScreenState();
}

class _BlockchainScreenState extends State<BlockchainScreen> {
  bool _loading = true;
  // ignore: unused_field
  Web3Client? _client;
  List<Map<String, dynamic>> _records = [];
  List<Map<String, dynamic>> _transactions = [];

  @override
  void initState() {
    super.initState();
    _initWeb3();
    _loadData();
  }

  Future<void> _initWeb3() async {
    try {
      _client = Web3Client('https://mainnet.infura.io/v3/demo', http.Client());
    } catch (_) {}
    if (mounted) setState(() {});
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      await apiService.getPatientRecords('current', {});
    } catch (_) {}
    if (mounted) {
      setState(() {
        _records = _placeholderRecords();
        _transactions = _placeholderTransactions();
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _placeholderRecords() => [
    {'date': '2026-06-20', 'type': 'Prescription', 'hospital': 'Apollo Hospital', 'doctor': 'Dr. Rajesh Kumar', 'hash': '0x7a3f…c9e2'},
    {'date': '2026-06-15', 'type': 'Lab Report', 'hospital': 'AIIMS Bhubaneswar', 'doctor': 'Dr. Priya Sharma', 'hash': '0x9b1d…f4a7'},
    {'date': '2026-06-10', 'type': 'Vaccination', 'hospital': 'Care Hospital', 'doctor': 'Dr. Sunita Das', 'hash': '0x4e8c…b12d'},
    {'date': '2026-05-28', 'type': 'Prescription', 'hospital': 'Sum Hospital', 'doctor': 'Dr. Amit Panda', 'hash': '0xf23a…e671'},
    {'date': '2026-05-01', 'type': 'Lab Report', 'hospital': 'Kalinga Hospital', 'doctor': 'Dr. Sneha Verma', 'hash': '0xd45b…c908'},
  ];

  List<Map<String, dynamic>> _placeholderTransactions() => [
    {'type': 'Received', 'from': 'Health Insurance', 'amount': '250 ZYN', 'date': '2026-06-21', 'status': 'confirmed'},
    {'type': 'Sent', 'from': 'Apollo Hospital', 'amount': '50 ZYN', 'date': '2026-06-20', 'status': 'confirmed'},
    {'type': 'Received', 'from': 'Reward Program', 'amount': '100 ZYN', 'date': '2026-06-18', 'status': 'confirmed'},
    {'type': 'Sent', 'from': 'Pharmacy Plus', 'amount': '30 ZYN', 'date': '2026-06-15', 'status': 'pending'},
    {'type': 'Received', 'from': 'Staking Rewards', 'amount': '15 ZYN', 'date': '2026-06-10', 'status': 'confirmed'},
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
                  Text('Blockchain Health', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 22),
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
                      onRefresh: _loadData,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _healthIdCard(),
                            const SizedBox(height: 20),
                            _sectionHeader('Health Records', Icons.folder_rounded),
                            const SizedBox(height: 10),
                            ..._records.map((r) => _recordCard(r)),
                            const SizedBox(height: 20),
                            _sectionHeader('Health Wallet', Icons.account_balance_wallet_rounded),
                            const SizedBox(height: 10),
                            _walletCard(),
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

  Widget _healthIdCard() {
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
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: Colors.white.withValues(alpha: 0.2),
                child: Text('PG', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Parth Gupta', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                    Text('ZYN-9F8A-2D1C-7E3B', style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.8), fontSize: 11, letterSpacing: 1)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.verified_rounded, color: Colors.white, size: 14),
                    const SizedBox(width: 4),
                    Text('Verified', style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Text('Scan to verify health ID', style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.7), fontSize: 10)),
                const SizedBox(height: 8),
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: CustomPaint(
                    size: const Size(80, 80),
                    painter: _QrPlaceholderPainter(),
                  ),
                ),
              ],
            ),
          ),
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

  Widget _recordCard(Map<String, dynamic> r) {
    final typeColor = _typeColor(r['type'] as String);
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
            decoration: BoxDecoration(
              color: typeColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(Icons.description_rounded, color: typeColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(r['type'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: ZyntraColors.green.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Icon(Icons.verified_rounded, color: ZyntraColors.green, size: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text('${r['hospital']} • ${r['doctor']}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                Row(
                  children: [
                    Text(r['date'] as String, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
                    const SizedBox(width: 8),
                    Text(r['hash'] as String, style: GoogleFonts.inter(color: ZyntraColors.cyan.withValues(alpha: 0.6), fontSize: 9).copyWith(fontFamily: 'monospace')),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _walletCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.purple.withValues(alpha: 0.2), ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.purple.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Balance', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: ZyntraColors.green.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text('+12.5%', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 10, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('2,450', style: GoogleFonts.poppins(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w700)),
              const SizedBox(width: 6),
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text('ZYN', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 14, fontWeight: FontWeight.w600)),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: ZyntraColors.cyan.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.qr_code_rounded, color: ZyntraColors.cyan, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _walletAction(Icons.add_rounded, 'Send'),
              const SizedBox(width: 12),
              _walletAction(Icons.call_received_rounded, 'Receive'),
              const SizedBox(width: 12),
              _walletAction(Icons.swap_horiz_rounded, 'Swap'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _walletAction(IconData icon, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: ZyntraColors.cyan, size: 16),
            const SizedBox(width: 4),
            Text(label, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _transactionCard(Map<String, dynamic> txn) {
    final isSent = txn['type'] == 'Sent';
    final color = isSent ? ZyntraColors.pink : ZyntraColors.green;
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
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(isSent ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded, color: color, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(txn['type'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                Text(txn['from'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(txn['amount'] as String, style: GoogleFonts.inter(color: color, fontSize: 13, fontWeight: FontWeight.w700)),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(txn['date'] as String, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
                  const SizedBox(width: 4),
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: txn['status'] == 'confirmed' ? ZyntraColors.green : ZyntraColors.amber,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'Prescription': return ZyntraColors.purple;
      case 'Lab Report': return ZyntraColors.cyan;
      case 'Vaccination': return ZyntraColors.green;
      default: return ZyntraColors.teal;
    }
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

class _QrPlaceholderPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = ZyntraColors.bg
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final s = size.width / 8;
    for (int r = 0; r < 8; r++) {
      for (int c = 0; c < 8; c++) {
        if ((r + c) % 3 == 0 || (r == c)) {
          canvas.drawRect(Rect.fromLTWH(c * s + 2, r * s + 2, s - 4, s - 4), paint..style = PaintingStyle.fill);
        }
      }
    }

    paint
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(4, 4, size.width - 8, size.height - 8), const Radius.circular(6)), paint);
    canvas.drawRect(Rect.fromLTWH(s, s, s * 2, s * 2), paint);
    canvas.drawRect(Rect.fromLTWH(s * 5, s, s * 2, s * 2), paint);
    canvas.drawRect(Rect.fromLTWH(s, s * 5, s * 2, s * 2), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
