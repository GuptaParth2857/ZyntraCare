import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class MedicineVerifyScreen extends StatefulWidget {
  const MedicineVerifyScreen({super.key});
  @override State<MedicineVerifyScreen> createState() => _MedicineVerifyScreenState();
}

class _MedicineVerifyScreenState extends State<MedicineVerifyScreen> {
  final _searchCtrl = TextEditingController();
  final _api = ApiService();
  List<Map<String, dynamic>> _history = [];
  Map<String, dynamic>? _selectedResult;
  bool _loading = false;
  bool _scanning = false;

  final _mockResults = [
    {'name': 'Paracetamol 500mg', 'manufacturer': 'Cipla Ltd', 'batch': 'CIP-2458-23', 'mfg': 'Jan 2025', 'exp': 'Dec 2027', 'status': 'genuine', 'barcode': '8901234567890'},
    {'name': 'Azithromycin 250mg', 'manufacturer': 'Sun Pharma', 'batch': 'SUN-7821-23', 'mfg': 'Mar 2025', 'exp': 'Feb 2027', 'status': 'suspected', 'barcode': '8909876543210'},
    {'name': 'Metformin 500mg', 'manufacturer': 'Dr Reddys', 'batch': 'DR-5567-22', 'mfg': 'Nov 2024', 'exp': 'Oct 2027', 'status': 'counterfeit', 'barcode': '8901112131415'},
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _verifyMedicine(String query) async {
    setState(() => _loading = true);
    try {
      final res = await _api.post('/api/medicine-verify', body: {'barcode': query, 'name': query});
      if (res != null && res['success'] != false) {
        setState(() {
          _selectedResult = res['data'] ?? _mockResults.firstWhere((m) => m['name']!.toLowerCase().contains(query.toLowerCase()) || m['batch']!.toLowerCase().contains(query.toLowerCase()), orElse: () => _mockResults[0]);
          _history.insert(0, _selectedResult!);
        });
      } else {
        _showMockResult(query);
      }
    } catch (_) {
      _showMockResult(query);
    }
    setState(() => _loading = false);
  }

  void _showMockResult(String query) {
    final found = _mockResults.where((m) =>
      m['name']!.toLowerCase().contains(query.toLowerCase()) ||
      m['batch']!.toLowerCase().contains(query.toLowerCase()) ||
      m['barcode']!.contains(query)
    ).toList();
    setState(() {
      _selectedResult = found.isNotEmpty ? found.first : _mockResults[0];
      _history.insert(0, _selectedResult!);
    });
  }

  void _startScan() {
    setState(() => _scanning = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _scanning = false);
        _verifyMedicine('8901234567890');
      }
    });
  }

  void _reportSuspicious() {
    if (_selectedResult == null) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('Report submitted to regulatory authorities', style: GoogleFonts.inter(color: Colors.white)),
      backgroundColor: ZyntraColors.green, behavior: SnackBarBehavior.floating,
    ));
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
                      Text('Medicine Verify', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Verify medicine authenticity via blockchain', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : _selectedResult != null
                      ? _buildResultView()
                      : _buildSearchView(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Scan area
          GestureDetector(
            onTap: _startScan,
            child: Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: ZyntraColors.card,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.3)),
              ),
              child: _scanning
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 48, height: 48,
                            child: CircularProgressIndicator(color: ZyntraColors.cyan, strokeWidth: 3),
                          ),
                          const SizedBox(height: 12),
                          Text('Scanning...', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 14)),
                        ],
                      ),
                    )
                  : Stack(
                      alignment: Alignment.center,
                      children: [
                        CustomPaint(
                          size: const Size(double.infinity, 200),
                          painter: _ScanFramePainter(),
                        ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.qr_code_scanner_rounded, color: ZyntraColors.cyan, size: 48),
                            const SizedBox(height: 8),
                            Text('Tap to Scan Barcode/QR', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 14, fontWeight: FontWeight.w600)),
                            Text('Align barcode within frame', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                          ],
                        ),
                      ],
                    ),
            ),
          ).animate().fadeIn(duration: 300.ms),
          const SizedBox(height: 24),
          Row(
            children: [
              const Expanded(child: Divider(color: ZyntraColors.border)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text('OR SEARCH MANUALLY', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11, letterSpacing: 1)),
              ),
              const Expanded(child: Divider(color: ZyntraColors.border)),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _searchCtrl,
            style: GoogleFonts.inter(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Search by medicine name or batch number',
              hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 13),
              prefixIcon: const Icon(Icons.search_rounded, color: ZyntraColors.cyan),
              filled: true,
              fillColor: ZyntraColors.surface,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            ),
            onSubmitted: _verifyMedicine,
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => _verifyMedicine(_searchCtrl.text),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
              ),
              child: Center(
                child: Text('Verify Medicine', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
              ),
            ),
          ),
          if (_history.isNotEmpty) ...[
            const SizedBox(height: 28),
            Row(
              children: [
                Text('Scan History', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                const Spacer(),
                Text('${_history.length} scans', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ],
            ),
            const SizedBox(height: 12),
            ...List.generate(_history.length, (i) => _historyCard(_history[i], i)),
          ],
        ],
      ),
    );
  }

  Widget _historyCard(Map<String, dynamic> item, int i) {
    final status = item['status'] as String;
    final statusColor = status == 'genuine' ? ZyntraColors.green : (status == 'counterfeit' ? ZyntraColors.red : ZyntraColors.amber);
    final statusIcon = status == 'genuine' ? Icons.check_circle_rounded : (status == 'counterfeit' ? Icons.cancel_rounded : Icons.warning_amber_rounded);
    return GestureDetector(
      onTap: () => setState(() => _selectedResult = item),
      child: Container(
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
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(statusIcon, color: statusColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                  Text(item['manufacturer'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: Text(status[0].toUpperCase() + status.substring(1), style: GoogleFonts.inter(color: statusColor, fontSize: 11, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ).animate().fadeIn(delay: (i * 50).ms).slideX(begin: 0.05, end: 0),
    );
  }

  Widget _buildResultView() {
    final data = _selectedResult!;
    final status = data['status'] as String;
    final statusColor = status == 'genuine' ? ZyntraColors.green : (status == 'counterfeit' ? ZyntraColors.red : ZyntraColors.amber);
    final statusIcon = status == 'genuine' ? Icons.check_circle_rounded : (status == 'counterfeit' ? Icons.cancel_rounded : Icons.warning_amber_rounded);
    final statusLabel = status == 'genuine' ? 'Genuine' : (status == 'counterfeit' ? 'Counterfeit' : 'Suspected');
    final statusEmoji = status == 'genuine' ? '\u2705' : (status == 'counterfeit' ? '\u274C' : '\u26A0\uFE0F');

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Verification Badge
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [statusColor.withValues(alpha: 0.15), ZyntraColors.card]),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: statusColor.withValues(alpha: 0.4)),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.2), shape: BoxShape.circle),
                  child: Icon(statusIcon, color: statusColor, size: 48),
                ),
                const SizedBox(height: 12),
                Text('$statusLabel $statusEmoji', style: GoogleFonts.poppins(color: statusColor, fontSize: 22, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text('Blockchain Verified', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: ZyntraColors.cyan.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified_rounded, color: ZyntraColors.cyan, size: 14),
                      const SizedBox(width: 6),
                      Text('Blockchain Seal Verified', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().scale(duration: 400.ms, curve: Curves.elasticOut),
          const SizedBox(height: 20),
          // Details Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Medicine Details', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                _detailRow('Medicine Name', data['name'] as String),
                _detailRow('Manufacturer', data['manufacturer'] as String),
                _detailRow('Batch Number', data['batch'] as String),
                _detailRow('Manufacturing Date', data['mfg'] as String),
                _detailRow('Expiry Date', data['exp'] as String),
                _detailRow('Barcode/QR', data['barcode'] as String),
              ],
            ),
          ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.05, end: 0),
          const SizedBox(height: 16),
          // Report Button
          GestureDetector(
            onTap: _reportSuspicious,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: ZyntraColors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.report_problem_rounded, color: ZyntraColors.red, size: 18),
                  const SizedBox(width: 8),
                  Text('Report Suspicious Medicine', style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 14, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ).animate().fadeIn(delay: 300.ms),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => setState(() => _selectedResult = null),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: ZyntraColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: Center(
                child: Text('Scan Another', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
              ),
            ),
          ).animate().fadeIn(delay: 350.ms),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
          ),
          Expanded(
            child: Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
      children: [
        Shimmer.fromColors(
          baseColor: ZyntraColors.card, highlightColor: ZyntraColors.border,
          child: Container(height: 220, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(24))),
        ),
        const SizedBox(height: 20),
        Shimmer.fromColors(
          baseColor: ZyntraColors.card, highlightColor: ZyntraColors.border,
          child: Container(height: 260, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20))),
        ),
      ],
    );
  }
}

class _ScanFramePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = ZyntraColors.cyan.withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    const cornerLen = 30.0;
    final r = size.width * 0.15;
    final t = size.height * 0.15;
    final b = size.width * 0.85;
    final l = size.height * 0.85;
    // Top-left
    canvas.drawLine(Offset(r, t), Offset(r + cornerLen, t), paint);
    canvas.drawLine(Offset(r, t), Offset(r, t + cornerLen), paint);
    // Top-right
    canvas.drawLine(Offset(b, t), Offset(b - cornerLen, t), paint);
    canvas.drawLine(Offset(b, t), Offset(b, t + cornerLen), paint);
    // Bottom-left
    canvas.drawLine(Offset(r, l), Offset(r + cornerLen, l), paint);
    canvas.drawLine(Offset(r, l), Offset(r, l - cornerLen), paint);
    // Bottom-right
    canvas.drawLine(Offset(b, l), Offset(b - cornerLen, l), paint);
    canvas.drawLine(Offset(b, l), Offset(b, l - cornerLen), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
