import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class BlockchainDetailScreen extends StatefulWidget {
  final Map<String, dynamic> record;
  const BlockchainDetailScreen({super.key, required this.record});
  @override State<BlockchainDetailScreen> createState() => _BlockchainDetailScreenState();
}

class _BlockchainDetailScreenState extends State<BlockchainDetailScreen> {
  bool _verifying = false;
  bool _verified = false;

  final _prevRecords = [
    {'date': '2026-06-15', 'type': 'Lab Report', 'hospital': 'AIIMS Bhubaneswar', 'doctor': 'Dr. Priya Sharma', 'hash': '0x9b1d…f4a7'},
    {'date': '2026-06-10', 'type': 'Vaccination', 'hospital': 'Care Hospital', 'doctor': 'Dr. Sunita Das', 'hash': '0x4e8c…b12d'},
    {'date': '2026-05-28', 'type': 'Prescription', 'hospital': 'Sum Hospital', 'doctor': 'Dr. Amit Panda', 'hash': '0xf23a…e671'},
  ];

  @override
  Widget build(BuildContext context) {
    final r = widget.record;
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
                  Text('Blockchain Record', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  if (_verified)
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: ZyntraColors.green.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.verified_rounded, color: ZyntraColors.green, size: 22),
                    ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _verificationBadge(),
                    const SizedBox(height: 20),
                    _recordDetails(r),
                    const SizedBox(height: 20),
                    _blockchainInfo(r),
                    const SizedBox(height: 20),
                    _sectionHeader('Previous Records Chain', Icons.link_rounded),
                    const SizedBox(height: 12),
                    _chainVisualization(),
                    const SizedBox(height: 12),
                    ..._prevRecords.asMap().entries.map((entry) => _prevRecordCard(entry.key, entry.value)),
                    const SizedBox(height: 20),
                    _verifyButton(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _verificationBadge() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _verified
              ? [ZyntraColors.green.withValues(alpha: 0.2), ZyntraColors.teal.withValues(alpha: 0.1)]
              : [ZyntraColors.cyan.withValues(alpha: 0.1), ZyntraColors.purple.withValues(alpha: 0.05)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _verified ? ZyntraColors.green.withValues(alpha: 0.4) : ZyntraColors.border,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _verified ? ZyntraColors.green.withValues(alpha: 0.15) : ZyntraColors.cyan.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              _verified ? Icons.verified_rounded : Icons.fingerprint_rounded,
              color: _verified ? ZyntraColors.green : ZyntraColors.cyan,
              size: 32,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _verified ? 'Verified on Blockchain' : 'Pending Verification',
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(
                  _verified
                      ? 'This record is cryptographically secured and tamper-proof'
                      : 'Tap verify to check authenticity on the blockchain',
                  style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _recordDetails(Map<String, dynamic> r) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Record Details', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          _detailRow('Record Type', r['type'] ?? 'General', Icons.description_rounded),
          _divider(),
          _detailRow('Hospital', r['hospital'] ?? 'N/A', Icons.local_hospital_rounded),
          _divider(),
          _detailRow('Doctor', r['doctor'] ?? 'N/A', Icons.person_rounded),
          _divider(),
          _detailRow('Date', r['date'] ?? 'N/A', Icons.calendar_month_rounded),
          _divider(),
          _detailRow('Record ID', r['recordId'] ?? 'REC-2026-0042', Icons.tag_rounded),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: ZyntraColors.cyan, size: 16),
          const SizedBox(width: 10),
          SizedBox(width: 100, child: Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12))),
          Expanded(child: Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }

  Widget _divider() {
    return Divider(color: ZyntraColors.border, height: 1);
  }

  Widget _blockchainInfo(Map<String, dynamic> r) {
    final hash = r['hash'] ?? '0x7a3f1b2c9d8e4f5a6b7c8d9e0f1a2b3c4d5e6f7a';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Blockchain Info', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          _blockchainRow('Transaction Hash', hash.toString(), Icons.tag_rounded, copyable: true),
          _divider(),
          _blockchainRow('Timestamp', r['timestamp'] ?? '2026-06-20 14:32:45 UTC', Icons.access_time_rounded),
          _divider(),
          _blockchainRow('Block Number', r['blockNumber'] ?? '#12,845,932', Icons.link_rounded),
          _divider(),
          _blockchainRow('Network', r['network'] ?? 'Ethereum Mainnet', Icons.language_rounded),
        ],
      ),
    );
  }

  Widget _blockchainRow(String label, String value, IconData icon, {bool copyable = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: ZyntraColors.purple, size: 16),
          const SizedBox(width: 10),
          SizedBox(width: 110, child: Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11))),
          Expanded(
            child: Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500).copyWith(fontFamily: copyable ? 'monospace' : 'inter')),
          ),
          if (copyable)
            GestureDetector(
              onTap: () {
                Clipboard.setData(ClipboardData(text: value));
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text('Hash copied!', style: GoogleFonts.inter(color: Colors.white)),
                  backgroundColor: ZyntraColors.green,
                  behavior: SnackBarBehavior.floating,
                  duration: const Duration(seconds: 1),
                ));
              },
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                child: const Icon(Icons.copy_rounded, color: ZyntraColors.cyan, size: 14),
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

  Widget _chainVisualization() {
    return SizedBox(
      height: 60,
      child: CustomPaint(
        size: const Size(double.infinity, 60),
        painter: _ChainLinkPainter(),
      ),
    );
  }

  Widget _prevRecordCard(int index, Map<String, dynamic> r) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: ZyntraColors.cyan.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(child: Text('#${index + 1}', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 11, fontWeight: FontWeight.w700))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(r['type'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 6),
                    Text(r['date'] as String, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
                  ],
                ),
                Text('${r['hospital']} • ${r['doctor']}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
            child: Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 14),
          ),
        ],
      ),
    );
  }

  Widget _verifyButton() {
    return GestureDetector(
      onTap: _verifying ? null : () async {
        setState(() => _verifying = true);
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) setState(() { _verifying = false; _verified = true; });
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          gradient: _verified
              ? const LinearGradient(colors: [ZyntraColors.green, ZyntraColors.teal])
              : const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(
            color: _verified ? ZyntraColors.green.withValues(alpha: 0.3) : ZyntraColors.cyan.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          )],
        ),
        child: Center(
          child: _verifying
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                    const SizedBox(width: 10),
                    Text('Verifying...', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  ],
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(_verified ? Icons.verified_rounded : Icons.fingerprint_rounded, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      _verified ? 'Verified on Blockchain' : 'Verify on Blockchain',
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

class _ChainLinkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = ZyntraColors.cyan.withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final path = Path();
    final centerY = size.height / 2;
    final segmentW = size.width / 4;

    for (int i = 0; i < 4; i++) {
      final x = segmentW * i + segmentW / 2;
      if (i > 0) {
        path.moveTo(segmentW * (i - 1) + segmentW / 2 + 10, centerY);
        path.lineTo(x - 10, centerY);
      }
      canvas.drawCircle(Offset(x, centerY), 12, paint);
      paint.style = PaintingStyle.fill;
      canvas.drawCircle(Offset(x, centerY), 4, paint..color = ZyntraColors.cyan.withValues(alpha: 0.2));
      paint.style = PaintingStyle.stroke;
      paint.color = ZyntraColors.cyan.withValues(alpha: 0.3);
    }

    paint.style = PaintingStyle.stroke;
    paint.color = ZyntraColors.cyan.withValues(alpha: 0.5);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
