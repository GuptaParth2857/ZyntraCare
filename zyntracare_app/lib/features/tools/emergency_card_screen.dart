import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:math' as math;
import 'package:zyntracare/core/theme.dart';

class EmergencyCardScreen extends StatefulWidget {
  const EmergencyCardScreen({super.key});

  @override
  State<EmergencyCardScreen> createState() => _EmergencyCardScreenState();
}

class _EmergencyCardScreenState extends State<EmergencyCardScreen> {
  final _nameController = TextEditingController();
  final _bloodGroupController = TextEditingController();
  final _allergiesController = TextEditingController();
  final _emergencyContactController = TextEditingController();
  final _medicalConditionsController = TextEditingController();
  final _insuranceController = TextEditingController();
  bool _isEditing = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _bloodGroupController.dispose();
    _allergiesController.dispose();
    _emergencyContactController.dispose();
    _medicalConditionsController.dispose();
    _insuranceController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _nameController.text = prefs.getString('ec_name') ?? '';
      _bloodGroupController.text = prefs.getString('ec_blood') ?? '';
      _allergiesController.text = prefs.getString('ec_allergies') ?? '';
      _emergencyContactController.text = prefs.getString('ec_emergency') ?? '';
      _medicalConditionsController.text = prefs.getString('ec_conditions') ?? '';
      _insuranceController.text = prefs.getString('ec_insurance') ?? '';
      _isLoading = false;
    });
  }

  Future<void> _saveData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('ec_name', _nameController.text.trim());
    await prefs.setString('ec_blood', _bloodGroupController.text.trim());
    await prefs.setString('ec_allergies', _allergiesController.text.trim());
    await prefs.setString('ec_emergency', _emergencyContactController.text.trim());
    await prefs.setString('ec_conditions', _medicalConditionsController.text.trim());
    await prefs.setString('ec_insurance', _insuranceController.text.trim());
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Emergency card saved'),
        backgroundColor: ZyntraColors.green,
      ),
    );
    setState(() => _isEditing = false);
  }

  void _shareCard() {
    final text = '''
🚨 EMERGENCY CARD
Name: ${_nameController.text}
Blood Group: ${_bloodGroupController.text}
Allergies: ${_allergiesController.text}
Emergency Contact: ${_emergencyContactController.text}
Medical Conditions: ${_medicalConditionsController.text}
Insurance: ${_insuranceController.text}
''';
    Share.share(text);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: ZyntraColors.bg,
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Emergency Card',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              _isEditing ? Icons.check_rounded : Icons.edit_rounded,
              color: ZyntraColors.cyan,
            ),
            onPressed: () {
              if (_isEditing) {
                _saveData();
              } else {
                setState(() => _isEditing = true);
              }
            },
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: ZyntraColors.gradientBg),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: Column(
            children: [
              _buildCard(),
              const SizedBox(height: 20),
              _buildQrPlaceholder(),
              const SizedBox(height: 20),
              _buildFields(),
              const SizedBox(height: 20),
              _buildActionButtons(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                ZyntraColors.card.withValues(alpha: 0.7),
                ZyntraColors.surface.withValues(alpha: 0.5),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.3)),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: ZyntraColors.red.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.emergency_rounded, color: ZyntraColors.red, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          'EMERGENCY CARD',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: ZyntraColors.red,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              _detailRow(Icons.person_outline, 'Name', _nameController.text),
              const Divider(color: ZyntraColors.border, height: 16),
              _detailRow(Icons.bloodtype_outlined, 'Blood Group', _bloodGroupController.text),
              const Divider(color: ZyntraColors.border, height: 16),
              _detailRow(Icons.warning_amber_rounded, 'Allergies', _allergiesController.text),
              const Divider(color: ZyntraColors.border, height: 16),
              _detailRow(Icons.phone_outlined, 'Emergency Contact', _emergencyContactController.text),
              const Divider(color: ZyntraColors.border, height: 16),
              _detailRow(Icons.medical_services_outlined, 'Medical Conditions', _medicalConditionsController.text),
              const Divider(color: ZyntraColors.border, height: 16),
              _detailRow(Icons.assured_workload_outlined, 'Insurance', _insuranceController.text),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: ZyntraColors.white70, size: 18),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                color: ZyntraColors.white40,
              ),
            ),
            Text(
              value.isNotEmpty ? value : 'Not set',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: value.isNotEmpty ? Colors.white : ZyntraColors.white40,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQrPlaceholder() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: ZyntraColors.card.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.2)),
          ),
          child: Column(
            children: [
              Text(
                'QR Code',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: CustomPaint(
                  painter: _QrGridPainter(),
                  size: const Size(140, 140),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Scan to view emergency info',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: ZyntraColors.white40,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFields() {
    if (!_isEditing) return const SizedBox.shrink();
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.2)),
          ),
          child: Column(
            children: [
              _editField('Full Name', _nameController),
              const SizedBox(height: 12),
              _editField('Blood Group', _bloodGroupController),
              const SizedBox(height: 12),
              _editField('Allergies', _allergiesController),
              const SizedBox(height: 12),
              _editField('Emergency Contact', _emergencyContactController),
              const SizedBox(height: 12),
              _editField('Medical Conditions', _medicalConditionsController),
              const SizedBox(height: 12),
              _editField('Insurance Info', _insuranceController),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _saveData,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ZyntraColors.green,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Save Card',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _editField(String label, TextEditingController controller) {
    return TextFormField(
      controller: controller,
      style: GoogleFonts.inter(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
        filled: true,
        fillColor: ZyntraColors.surface.withValues(alpha: 0.5),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: SizedBox(
            height: 50,
            child: ElevatedButton.icon(
              onPressed: _shareCard,
              icon: const Icon(Icons.share_rounded, size: 20),
              label: Text(
                'Share Card',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: ZyntraColors.cyan,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: SizedBox(
            height: 50,
            child: OutlinedButton.icon(
              onPressed: _saveData,
              icon: const Icon(Icons.download_rounded, size: 20),
              label: Text(
                'Save to Device',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: ZyntraColors.cyan,
                side: const BorderSide(color: ZyntraColors.cyan),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _QrGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1a1a2e)
      ..style = PaintingStyle.fill;

    final cellSize = size.width / 21;
    final rng = math.Random(42);
    for (int i = 0; i < 21; i++) {
      for (int j = 0; j < 21; j++) {
        if (rng.nextDouble() > 0.55) {
          final isPosition = (i < 7 && j < 7) ||
              (i < 7 && j > 13) ||
              (i > 13 && j < 7);
          if (!isPosition) {
            canvas.drawRect(
              Rect.fromLTWH(
                i * cellSize,
                j * cellSize,
                cellSize,
                cellSize,
              ),
              paint,
            );
          }
        }
      }
    }
    final posPaint = Paint()
      ..color = const Color(0xFF1a1a2e)
      ..style = PaintingStyle.fill;
    canvas.drawRect(
      Rect.fromLTWH(0, 0, 7 * cellSize, 7 * cellSize),
      posPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(0, 14 * cellSize, 7 * cellSize, 7 * cellSize),
      posPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(14 * cellSize, 0, 7 * cellSize, 7 * cellSize),
      posPaint,
    );
    final innerPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawRect(
      Rect.fromLTWH(cellSize, cellSize, 5 * cellSize, 5 * cellSize),
      innerPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(cellSize, 15 * cellSize, 5 * cellSize, 5 * cellSize),
      innerPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(15 * cellSize, cellSize, 5 * cellSize, 5 * cellSize),
      innerPaint,
    );
    final inner2Paint = Paint()
      ..color = const Color(0xFF1a1a2e)
      ..style = PaintingStyle.fill;
    canvas.drawRect(
      Rect.fromLTWH(2 * cellSize, 2 * cellSize, 3 * cellSize, 3 * cellSize),
      inner2Paint,
    );
    canvas.drawRect(
      Rect.fromLTWH(2 * cellSize, 16 * cellSize, 3 * cellSize, 3 * cellSize),
      inner2Paint,
    );
    canvas.drawRect(
      Rect.fromLTWH(16 * cellSize, 2 * cellSize, 3 * cellSize, 3 * cellSize),
      inner2Paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}


