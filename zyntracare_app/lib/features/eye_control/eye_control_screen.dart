import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class EyeControlScreen extends StatefulWidget {
  const EyeControlScreen({super.key});
  @override State<EyeControlScreen> createState() => _EyeControlScreenState();
}

class _EyeControlScreenState extends State<EyeControlScreen> with TickerProviderStateMixin {
  int _currentStep = 0;
  bool _calibrated = false;
  double _sensitivity = 0.7;
  double _dwellTime = 1.0;
  bool _feedbackEnabled = true;
  int _selectedAction = -1;
  bool _showTutorial = true;
  late AnimationController _selectAnimCtrl;

  final _steps = [
    {'title': 'Position Yourself', 'desc': 'Sit 50-70 cm away from the screen. Ensure your face is well-lit.', 'icon': Icons.airline_seat_flat_rounded},
    {'title': 'Enable Camera', 'desc': 'Allow camera access for eye tracking. Your privacy is protected.', 'icon': Icons.camera_alt_rounded},
    {'title': 'Calibrate', 'desc': 'Follow the dots on screen with your eyes to calibrate the gaze tracker.', 'icon': Icons.my_location_rounded},
    {'title': 'Start Using', 'desc': 'You\'re all set! Look at the buttons to select them.', 'icon': Icons.check_circle_rounded},
  ];

  final _quickActions = [
    {'label': 'Call', 'icon': Icons.phone_rounded, 'color': ZyntraColors.green},
    {'label': 'Message', 'icon': Icons.message_rounded, 'color': ZyntraColors.cyan},
    {'label': 'Emergency', 'icon': Icons.warning_rounded, 'color': ZyntraColors.red},
    {'label': 'Home', 'icon': Icons.home_rounded, 'color': ZyntraColors.purple},
  ];

  @override
  void initState() {
    super.initState();
    _selectAnimCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
  }

  @override
  void dispose() {
    _selectAnimCtrl.dispose();
    super.dispose();
  }

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
                  Text('Eye Control', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => setState(() => _showTutorial = !_showTutorial),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: ZyntraColors.cyan.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(Icons.help_rounded, color: ZyntraColors.cyan, size: 22),
                    ),
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
                    _setupGuide(),
                    const SizedBox(height: 20),
                    if (_calibrated) ...[
                      _quickActionsGrid(),
                      const SizedBox(height: 24),
                      _settingsSection(),
                    ],
                    if (_showTutorial && _calibrated) ...[
                      const SizedBox(height: 24),
                      _tutorialOverlay(),
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

  Widget _setupGuide() {
    return Container(
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
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.touch_app_rounded, color: ZyntraColors.cyan, size: 20),
              ),
              const SizedBox(width: 10),
              Text('Gaze Tracking Setup', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text('${_currentStep + 1}/${_steps.length}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 20),
          ..._steps.asMap().entries.map((entry) {
            final i = entry.key;
            final s = entry.value;
            final isActive = i == _currentStep;
            final isDone = i < _currentStep;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isDone ? ZyntraColors.green : (isActive ? ZyntraColors.cyan : ZyntraColors.card),
                      border: Border.all(color: isDone ? ZyntraColors.green : (isActive ? ZyntraColors.cyan : ZyntraColors.border), width: 2),
                    ),
                    child: Center(
                      child: isDone
                          ? const Icon(Icons.check_rounded, color: Colors.white, size: 18)
                          : Text('${i + 1}', style: GoogleFonts.inter(color: isActive ? ZyntraColors.cyan : ZyntraColors.white70, fontWeight: FontWeight.w600)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                        if (isActive)
                          Text(s['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                      ],
                    ),
                  ),
                  if (isActive && !isDone)
                    GestureDetector(
                      onTap: () {
                        if (i == _steps.length - 1) {
                          setState(() { _calibrated = true; _currentStep = i + 1; });
                        } else if (i == 2) {
                          _showCalibrationDialog();
                        } else {
                          setState(() => _currentStep = i + 1);
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(i == _steps.length - 1 ? 'Done' : (i == 2 ? 'Calibrate' : 'Next'), style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                      ),
                    ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _quickActionsGrid() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.flash_on_rounded, color: ZyntraColors.cyan, size: 16),
            ),
            const SizedBox(width: 8),
            Text('Quick Actions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: _quickActions.asMap().entries.map((entry) {
            final i = entry.key;
            final a = entry.value;
            final isSelected = _selectedAction == i;
            return Expanded(
              child: GestureDetector(
                onTap: () {
                  setState(() => _selectedAction = i);
                  _selectAnimCtrl.forward(from: 0);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('${a['label']} selected', style: GoogleFonts.inter(color: Colors.white)),
                    backgroundColor: a['color'] as Color,
                    behavior: SnackBarBehavior.floating,
                    duration: const Duration(seconds: 1),
                  ));
                },
                child: AnimatedBuilder(
                  animation: _selectAnimCtrl,
                  builder: (ctx, child) {
                    final scale = isSelected ? (1.0 + 0.05 * _selectAnimCtrl.value) : 1.0;
                    return Transform.scale(
                      scale: scale,
                      child: Container(
                        margin: const EdgeInsets.only(right: 10),
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        decoration: BoxDecoration(
                          color: isSelected ? (a['color'] as Color).withValues(alpha: 0.2) : ZyntraColors.card,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: isSelected ? a['color'] as Color : ZyntraColors.border,
                            width: isSelected ? 2 : 1,
                          ),
                          boxShadow: isSelected ? [BoxShadow(color: (a['color'] as Color).withValues(alpha: 0.3), blurRadius: 12)] : null,
                        ),
                        child: Column(
                          children: [
                            Icon(a['icon'] as IconData, color: a['color'] as Color, size: 36),
                            const SizedBox(height: 8),
                            Text(a['label'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _settingsSection() {
    return Container(
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
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.settings_rounded, color: ZyntraColors.cyan, size: 16),
              ),
              const SizedBox(width: 8),
              Text('Settings', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 16),
          _sliderSetting('Sensitivity', _sensitivity, Icons.touch_app_rounded, ZyntraColors.cyan, (v) => setState(() => _sensitivity = v)),
          const SizedBox(height: 12),
          _sliderSetting('Dwell Time', _dwellTime, Icons.timer_rounded, ZyntraColors.purple, (v) => setState(() => _dwellTime = v), min: 0.5, max: 2.0),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
            child: Row(
              children: [
                Icon(Icons.vibration_rounded, color: ZyntraColors.teal, size: 20),
                const SizedBox(width: 10),
                Expanded(child: Text('Haptic Feedback', style: GoogleFonts.inter(color: Colors.white, fontSize: 13))),
                Switch(
                  value: _feedbackEnabled,
                  activeThumbColor: ZyntraColors.teal,
                  onChanged: (v) => setState(() => _feedbackEnabled = v),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sliderSetting(String label, double value, IconData icon, Color color, ValueChanged<double> onChanged, {double min = 0.1, double max = 1.0}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 18),
              const SizedBox(width: 8),
              Text(label, style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
              const Spacer(),
              Text(value.toStringAsFixed(1), style: GoogleFonts.inter(color: color, fontSize: 13, fontWeight: FontWeight.w600)),
            ],
          ),
          Slider(
            value: value,
            min: min,
            max: max,
            activeColor: color,
            inactiveColor: ZyntraColors.border,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  Widget _tutorialOverlay() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.cyan.withValues(alpha: 0.1), ZyntraColors.purple.withValues(alpha: 0.05)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.school_rounded, color: ZyntraColors.cyan, size: 16),
              ),
              const SizedBox(width: 8),
              Text('Tutorial', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              const Spacer(),
              GestureDetector(
                onTap: () => setState(() => _showTutorial = false),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(6)),
                  child: const Icon(Icons.close_rounded, color: ZyntraColors.white70, size: 16),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _tutorialTip('Look at a button to highlight it', Icons.remove_red_eye_rounded),
          _tutorialTip('Keep your gaze steady to select', Icons.timer_rounded),
          _tutorialTip('Blink twice for emergency', Icons.warning_rounded),
          _tutorialTip('Look away to cancel selection', Icons.cancel_rounded),
        ],
      ),
    );
  }

  Widget _tutorialTip(String text, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, color: ZyntraColors.cyan, size: 16),
          const SizedBox(width: 8),
          Text(text, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
        ],
      ),
    );
  }

  void _showCalibrationDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Calibration', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              Text('Follow the dots with your eyes', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14)),
              const SizedBox(height: 20),
              _calibrationGrid(),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: () {
                  Navigator.pop(ctx);
                  setState(() => _currentStep = 3);
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Center(
                    child: Text('Done', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _calibrationGrid() {
    return Container(
      width: 240,
      height: 240,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: CustomPaint(
        size: const Size(208, 208),
        painter: _CalibrationGridPainter(),
      ),
    );
  }
}

class _CalibrationGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final dotPaint = Paint()..color = ZyntraColors.cyan;
    final linePaint = Paint()
      ..color = ZyntraColors.border.withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    final w = size.width;
    final h = size.height;

    for (int r = 0; r < 5; r++) {
      for (int c = 0; c < 5; c++) {
        final x = w * c / 4;
        final y = h * r / 4;
        canvas.drawCircle(Offset(x, y), 6, dotPaint..color = ZyntraColors.cyan.withValues(alpha: r == 0 && c == 0 ? 1.0 : 0.3));
        if (r < 4) canvas.drawLine(Offset(x, y), Offset(x, h * (r + 1) / 4), linePaint);
        if (c < 4) canvas.drawLine(Offset(x, y), Offset(w * (c + 1) / 4, y), linePaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
