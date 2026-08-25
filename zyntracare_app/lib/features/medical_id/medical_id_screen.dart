import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class MedicalIdScreen extends StatefulWidget {
  const MedicalIdScreen({super.key});
  @override State<MedicalIdScreen> createState() => _MedicalIdScreenState();
}

class _MedicalIdScreenState extends State<MedicalIdScreen> {
  bool _loading = true;
  bool _showOnLockScreen = false;
  bool _showQR = false;
  Map<String, dynamic> _medicalData = {};
  List<Map<String, dynamic>> _accessLog = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().get('/api/medical-id');
      if (mounted && res != null) {
        final data = res is Map ? res : (res['data'] ?? {});
        setState(() {
          _medicalData = Map<String, dynamic>.from(data is Map ? data : {});
          final log = data['accessLog'] ?? data['logs'] ?? [];
          _accessLog = (log is List ? log : []).map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList();
        });
      }
    } catch (_) {}
    if (_medicalData.isEmpty && mounted) setState(() => _medicalData = _placeholderData());
    if (mounted) setState(() => _loading = false);
  }

  Map<String, dynamic> _placeholderData() => {
    'fullName': 'Rahul Sharma',
    'dob': '1996-04-15',
    'bloodGroup': 'O+',
    'organDonor': true,
    'allergies': ['Penicillin', 'Peanuts', 'Dust'],
    'chronicConditions': ['Asthma', 'Hypertension'],
    'emergencyContact': '+91 98765 43210',
    'emergencyName': 'Priya Sharma (Mother)',
    'medications': ['Asthalin Inhaler', 'Amlodipine 5mg'],
    'height': '175 cm',
    'weight': '72 kg',
    'medicalId': 'MID-ZYN-2026-00A7B3',
  };

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
                      Text('Medical ID', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.medical_services_rounded, color: Colors.white, size: 20),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Your emergency medical information', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : _showQR
                      ? _buildFullQR()
                      : SingleChildScrollView(
                          padding: const EdgeInsets.only(bottom: 100),
                          child: Column(
                            children: [
                              const SizedBox(height: 16),
                              _buildMedicalCard(),
                              const SizedBox(height: 20),
                              _buildActions(),
                              const SizedBox(height: 24),
                              _buildLockScreenToggle(),
                              const SizedBox(height: 24),
                              if (_accessLog.isNotEmpty) ...[
                                Padding(
                                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                                  child: Row(
                                    children: [
                                      Text('Emergency Access Log', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                      const Spacer(),
                                      Text('${_accessLog.length} entries', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                                    ],
                                  ),
                                ),
                                ...List.generate(_accessLog.length, (i) => _accessLogCard(_accessLog[i], i)),
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

  Widget _buildMedicalCard() {
    final data = _medicalData;
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
                        child: Text('Medical ID', style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                      ),
                      const Spacer(),
                      Text(data['medicalId'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 9, fontWeight: FontWeight.w500)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Container(
                        width: 72, height: 72,
                        decoration: BoxDecoration(
                          color: ZyntraColors.cyan.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.2)),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.person_rounded, color: ZyntraColors.cyan, size: 28),
                            Text('Photo', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 7)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(data['fullName'] ?? '', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 4),
                            _infoRow(Icons.cake_rounded, 'DOB: ${data['dob'] ?? ''}', ZyntraColors.white70),
                            _infoRow(Icons.water_drop_rounded, 'Blood: ${data['bloodGroup'] ?? ''}', ZyntraColors.red),
                            _infoRow(Icons.favorite_rounded, 'Organ Donor: ${data['organDonor'] == true ? 'Yes' : 'No'}', data['organDonor'] == true ? ZyntraColors.green : ZyntraColors.white70),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Divider(color: ZyntraColors.border),
                  const SizedBox(height: 10),
                  if (data['allergies'] != null) ...[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: ZyntraColors.amber, size: 14),
                        const SizedBox(width: 6),
                        Text('Allergies: ', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                        Expanded(
                          child: Text(
                            (data['allergies'] as List).join(', '),
                            style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 11, fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                  ],
                  if (data['chronicConditions'] != null) ...[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.healing_rounded, color: ZyntraColors.red, size: 14),
                        const SizedBox(width: 6),
                        Text('Chronic: ', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                        Expanded(
                          child: Text(
                            (data['chronicConditions'] as List).join(', '),
                            style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 11, fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                  ],
                  _infoRow(Icons.phone_rounded, '${data['emergencyName'] ?? ''}: ${data['emergencyContact'] ?? ''}', ZyntraColors.green),
                  if (data['medications'] != null) ...[
                    const SizedBox(height: 6),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.medication_rounded, color: ZyntraColors.cyan, size: 14),
                        const SizedBox(width: 6),
                        Text('Medications: ', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                        Expanded(
                          child: Text(
                            (data['medications'] as List).join(', '),
                            style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 11, fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                  ],
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

  Widget _buildActions() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(child: _actionBtn(Icons.qr_code_rounded, 'QR Code', ZyntraColors.cyan, () => setState(() => _showQR = true))),
          const SizedBox(width: 10),
          Expanded(child: _actionBtn(Icons.share_rounded, 'Share', ZyntraColors.purple, () {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text('Medical ID shared successfully!', style: GoogleFonts.inter(color: Colors.white)),
              backgroundColor: ZyntraColors.green,
              behavior: SnackBarBehavior.floating,
            ));
          })),
          const SizedBox(width: 10),
          Expanded(child: _actionBtn(Icons.edit_rounded, 'Edit', ZyntraColors.teal, _showEditSheet)),
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

  Widget _buildLockScreenToggle() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.lock_outline_rounded, color: ZyntraColors.cyan, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Show on Lock Screen', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                  Text('Emergency access without unlocking', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                ],
              ),
            ),
            Switch(
              value: _showOnLockScreen,
              activeColor: ZyntraColors.cyan,
              onChanged: (v) => setState(() => _showOnLockScreen = v),
            ),
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
                  Text('ZyntraCare Medical ID', style: GoogleFonts.inter(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(_medicalData['medicalId'] ?? '', style: GoogleFonts.inter(color: Colors.black54, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(_medicalData['fullName'] ?? '', style: GoogleFonts.inter(color: Colors.black87, fontSize: 14)),
                  Text('Blood: ${_medicalData['bloodGroup'] ?? ''}', style: GoogleFonts.inter(color: Colors.black54, fontSize: 12)),
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
    final nameCtrl = TextEditingController(text: _medicalData['fullName'] ?? '');
    final bloodCtrl = TextEditingController(text: _medicalData['bloodGroup'] ?? '');
    final emergencyCtrl = TextEditingController(text: _medicalData['emergencyContact'] ?? '');
    bool organDonor = _medicalData['organDonor'] == true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
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
                Text('Edit Medical ID', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                _sheetField(nameCtrl, 'Full Name'),
                const SizedBox(height: 10),
                _sheetField(bloodCtrl, 'Blood Group'),
                const SizedBox(height: 10),
                _sheetField(emergencyCtrl, 'Emergency Contact'),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: () => setSheetState(() => organDonor = !organDonor),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: organDonor ? ZyntraColors.green.withValues(alpha: 0.1) : ZyntraColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: organDonor ? ZyntraColors.green.withValues(alpha: 0.3) : ZyntraColors.border),
                    ),
                    child: Row(
                      children: [
                        Icon(organDonor ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded, color: organDonor ? ZyntraColors.green : ZyntraColors.white40, size: 22),
                        const SizedBox(width: 10),
                        Text('Organ Donor', style: GoogleFonts.inter(color: Colors.white, fontSize: 14)),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _medicalData['fullName'] = nameCtrl.text;
                      _medicalData['bloodGroup'] = bloodCtrl.text;
                      _medicalData['emergencyContact'] = emergencyCtrl.text;
                      _medicalData['organDonor'] = organDonor;
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('Medical ID updated!', style: GoogleFonts.inter(color: Colors.white)),
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
      ),
    );
  }

  Widget _sheetField(TextEditingController ctrl, String label) {
    return TextField(
      controller: ctrl,
      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
        filled: true,
        fillColor: ZyntraColors.surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _accessLogCard(Map<String, dynamic> log, int i) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: ZyntraColors.amber.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.visibility_rounded, color: ZyntraColors.amber, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(log['facility'] ?? log['name'] ?? 'Unknown', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                Text('${log['date'] ?? ''} ${log['time'] ?? ''}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: (log['status'] == 'Granted' ? ZyntraColors.green : ZyntraColors.red).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(log['status'] ?? 'Granted', style: GoogleFonts.inter(color: log['status'] == 'Granted' ? ZyntraColors.green : ZyntraColors.red, fontSize: 9, fontWeight: FontWeight.w500)),
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
            Row(children: List.generate(3, (_) => Expanded(child: Container(height: 60, margin: const EdgeInsets.only(right: 8), decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14))))),
            ),
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
