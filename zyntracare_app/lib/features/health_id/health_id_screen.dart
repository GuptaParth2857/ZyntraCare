import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class HealthIdScreen extends StatefulWidget {
  const HealthIdScreen({super.key});
  @override State<HealthIdScreen> createState() => _HealthIdScreenState();
}

class _HealthIdScreenState extends State<HealthIdScreen> {
  bool _loading = true;
  bool _showQR = false;
  Map<String, dynamic> _healthData = {};
  List<Map<String, dynamic>> _scanHistory = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.get('/api/health-id');
      if (mounted && res != null) {
        final data = res is Map ? res : (res['data'] ?? {});
        setState(() {
          _healthData = Map<String, dynamic>.from(data);
          final history = data['scanHistory'] ?? data['scans'] ?? [];
          _scanHistory = (history is List ? history : []).map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList();
        });
      }
    } catch (_) {}
    if (_healthData.isEmpty && mounted) setState(() => _healthData = _placeholderData());
    if (mounted) setState(() => _loading = false);
  }

  Map<String, dynamic> _placeholderData() => {
    'healthId': 'ZYN-HID-2026-00A7B3',
    'name': 'Rahul Sharma',
    'bloodGroup': 'O+',
    'age': 28,
    'gender': 'Male',
    'allergies': ['Pollen', 'Penicillin', 'Peanuts'],
    'emergencyContact': '+91 9876543210',
    'emergencyName': 'Priya Sharma (Mother)',
    'insuranceProvider': 'Star Health Insurance',
    'insurancePolicyNo': 'SHI-2026-8842-91',
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading
            ? _buildShimmer()
            : _showQR
                ? _buildFullQR()
                : Column(
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
                                Text('Health ID', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                                  child: const Icon(Icons.health_and_safety_rounded, color: Colors.white, size: 22),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text('Your digital health identity', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                          ],
                        ),
                      ),
                      Expanded(
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.only(bottom: 100),
                          child: Column(
                            children: [
                              const SizedBox(height: 16),
                              // Health ID Card
                              _buildIdCard(),
                              const SizedBox(height: 20),
                              // Action Buttons
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                child: Row(
                                  children: [
                                    Expanded(child: _actionBtn(Icons.qr_code_rounded, 'Show QR', ZyntraColors.cyan, () => setState(() => _showQR = true))),
                                    const SizedBox(width: 10),
                                    Expanded(child: _actionBtn(Icons.share_rounded, 'Share', ZyntraColors.purple, () {
                                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                        content: Text('Health ID shared!', style: GoogleFonts.inter(color: Colors.white)),
                                        backgroundColor: ZyntraColors.green,
                                        behavior: SnackBarBehavior.floating,
                                      ));
                                    })),
                                    const SizedBox(width: 10),
                                    Expanded(child: _actionBtn(Icons.edit_rounded, 'Edit', ZyntraColors.teal, _showEditSheet)),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 24),
                              // Scan History
                              if (_scanHistory.isNotEmpty) ...[
                                Padding(
                                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                                  child: Row(
                                    children: [
                                      Text('Scan History', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                      const Spacer(),
                                      Text('${_scanHistory.length} accesses', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                                    ],
                                  ),
                                ),
                                ...List.generate(_scanHistory.length, (i) => _scanHistoryCard(_scanHistory[i], i)),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
      ),
    );
  }

  Widget _buildIdCard() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF0F2145), Color(0xFF1A1A3E)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.3)),
          boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 8))],
        ),
        child: Stack(
          children: [
            Positioned(top: -20, right: -20, child: Icon(Icons.medical_services_rounded, color: ZyntraColors.cyan.withValues(alpha: 0.05), size: 120)),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text('Health ID', style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                      ),
                      const Spacer(),
                      Text(_healthData['healthId'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 10, fontWeight: FontWeight.w500)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: ZyntraColors.border),
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 72, height: 72,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: CustomPaint(
                                painter: _QRPainter(),
                                size: const Size(72, 72),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text('QR Code', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 8)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_healthData['name'] ?? '', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 4),
                            _infoRow(Icons.water_drop_rounded, 'Blood: ${_healthData['bloodGroup'] ?? ''}', ZyntraColors.red),
                            _infoRow(Icons.cake_rounded, 'Age: ${_healthData['age'] ?? ''}, ${_healthData['gender'] ?? ''}', ZyntraColors.white70),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Divider(color: ZyntraColors.border),
                  const SizedBox(height: 10),
                  // Allergies
                  Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: ZyntraColors.amber, size: 14),
                      const SizedBox(width: 6),
                      Text('Allergies: ', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                      Expanded(
                        child: Text(
                          (_healthData['allergies'] as List?)?.join(', ') ?? 'None',
                          style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 11, fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  _infoRow(Icons.phone_rounded, '${_healthData['emergencyName'] ?? ''} - ${_healthData['emergencyContact'] ?? ''}', ZyntraColors.green),
                  const SizedBox(height: 6),
                  _infoRow(Icons.verified_rounded, '${_healthData['insuranceProvider'] ?? ''} (${_healthData['insurancePolicyNo'] ?? ''})', ZyntraColors.cyan),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _infoRow(IconData icon, String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(icon, color: color, size: 13),
          const SizedBox(width: 5),
          Expanded(child: Text(text, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11))),
        ],
      ),
    );
  }

  Widget _actionBtn(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 4),
            Text(label, style: GoogleFonts.inter(color: color, fontSize: 11, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildFullQR() {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      body: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(),
            Container(
              margin: const EdgeInsets.all(32),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 200, height: 200,
                    color: Colors.white,
                    child: CustomPaint(painter: _QRPainter(size: 7), size: const Size(200, 200)),
                  ),
                  const SizedBox(height: 20),
                  Text('ZyantraCare Health ID', style: GoogleFonts.inter(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(_healthData['healthId'] ?? '', style: GoogleFonts.inter(color: Colors.black54, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(_healthData['name'] ?? '', style: GoogleFonts.inter(color: Colors.black87, fontSize: 14)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: () => setState(() => _showQR = false),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
                decoration: BoxDecoration(
                  color: ZyntraColors.red.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.3)),
                ),
                child: Text('Close', style: GoogleFonts.inter(color: ZyntraColors.red, fontWeight: FontWeight.w600)),
              ),
            ),
            const Spacer(),
          ],
        ),
      ),
    );
  }

  void _showEditSheet() {
    final nameCtrl = TextEditingController(text: _healthData['name'] ?? '');
    final ageCtrl = TextEditingController(text: '${_healthData['age'] ?? ''}');
    final emergencyCtrl = TextEditingController(text: _healthData['emergencyContact'] ?? '');
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
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4))),
              ),
              const SizedBox(height: 20),
              Text('Edit Health ID', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              TextField(controller: nameCtrl, style: GoogleFonts.inter(color: Colors.white), decoration: InputDecoration(hintText: 'Full Name', hintStyle: GoogleFonts.inter(color: ZyntraColors.white40), filled: true, fillColor: ZyntraColors.surface, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
              const SizedBox(height: 12),
              TextField(controller: ageCtrl, style: GoogleFonts.inter(color: Colors.white), keyboardType: TextInputType.number, decoration: InputDecoration(hintText: 'Age', hintStyle: GoogleFonts.inter(color: ZyntraColors.white40), filled: true, fillColor: ZyntraColors.surface, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
              const SizedBox(height: 12),
              TextField(controller: emergencyCtrl, style: GoogleFonts.inter(color: Colors.white), keyboardType: TextInputType.phone, decoration: InputDecoration(hintText: 'Emergency Contact', hintStyle: GoogleFonts.inter(color: ZyntraColors.white40), filled: true, fillColor: ZyntraColors.surface, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () {
                  setState(() {
                    _healthData['name'] = nameCtrl.text;
                    _healthData['age'] = int.tryParse(ageCtrl.text) ?? _healthData['age'];
                    _healthData['emergencyContact'] = emergencyCtrl.text;
                  });
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Health ID updated!', style: GoogleFonts.inter(color: Colors.white)),
                    backgroundColor: ZyntraColors.green,
                    behavior: SnackBarBehavior.floating,
                  ));
                },
                child: Container(
                  width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]), borderRadius: BorderRadius.circular(16)),
                  child: Center(child: Text('Save Changes', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _scanHistoryCard(Map<String, dynamic> scan, int i) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: ZyntraColors.indigo.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.qr_code_scanner_rounded, color: ZyntraColors.indigo, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(scan['facility'] ?? scan['hospital'] ?? scan['name'] ?? 'Unknown', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                Text('${scan['date'] ?? ''} at ${scan['time'] ?? ''}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
            child: Text(scan['purpose'] ?? 'Verified', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 9, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 60).ms);
  }

  Widget _buildShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Column(
          children: [
            Container(height: 300, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(24))),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(child: Container(height: 60, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14)))),
              const SizedBox(width: 10),
              Expanded(child: Container(height: 60, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14)))),
              const SizedBox(width: 10),
              Expanded(child: Container(height: 60, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14)))),
            ]),
          ],
        ),
      ),
    );
  }
}

class _QRPainter extends CustomPainter {
  final int size;
  _QRPainter({this.size = 5});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.black;
    final cellW = size.width / (this.size * 4 + 1);
    final cellH = size.height / (this.size * 4 + 1);

    final rng = Random(42);
    for (int r = 0; r < this.size * 4 + 1; r++) {
      for (int c = 0; c < this.size * 4 + 1; c++) {
        final isFinder = (r < this.size + 1 && c < this.size + 1) ||
            (r < this.size + 1 && c > this.size * 3) ||
            (r > this.size * 3 && c < this.size + 1);
        if (isFinder) {
          if (r == 0 || r == this.size || c == 0 || c == this.size ||
              (r > 0 && r < this.size && c > 0 && c < this.size && (r == 1 || r == this.size - 1 || c == 1 || c == this.size - 1))) {
            canvas.drawRect(Rect.fromLTWH(c * cellW, r * cellH, cellW, cellH), paint);
          }
        } else {
          if (rng.nextBool()) {
            canvas.drawRect(Rect.fromLTWH(c * cellW, r * cellH, cellW, cellH), paint);
          }
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}
