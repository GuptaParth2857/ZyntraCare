import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';

class EdgeAiSymptomsScreen extends StatefulWidget {
  const EdgeAiSymptomsScreen({super.key});
  @override State<EdgeAiSymptomsScreen> createState() => _EdgeAiSymptomsScreenState();
}

class _EdgeAiSymptomsScreenState extends State<EdgeAiSymptomsScreen> with TickerProviderStateMixin {
  bool _loading = true;
  bool _analyzing = false;
  bool _showResults = false;

  String? _selectedRegion;
  double _severity = 5;
  String _duration = 'Today';

  late AnimationController _pulseCtrl;
  late AnimationController _scanCtrl;

  final _regions = ['Head', 'Chest', 'Abdomen', 'Arms', 'Legs'];
  final _durations = ['Today', '2-3 days', 'Week', 'Month+'];

  final _regionIcons = {
    'Head': Icons.face_rounded,
    'Chest': Icons.accessibility_new_rounded,
    'Abdomen': Icons.accessibility_new_rounded,
    'Arms': Icons.pan_tool_rounded,
    'Legs': Icons.directions_walk_rounded,
  };

  List<Map<String, dynamic>> _results = [];

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: 1500.ms)..repeat(reverse: true);
    _scanCtrl = AnimationController(vsync: this, duration: 800.ms)..repeat();
    Future.delayed(1500.ms, () {
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _scanCtrl.dispose();
    super.dispose();
  }

  void _startAnalysis() {
    setState(() {
      _analyzing = true;
      _showResults = false;
      _results = [];
    });

    Future.delayed(3.seconds, () {
      if (!mounted) return;
      setState(() {
        _analyzing = false;
        _showResults = true;
        _results = _getMockResults();
      });
    });
  }

  List<Map<String, dynamic>> _getMockResults() {
    final region = _selectedRegion ?? 'General';
    final allResults = {
      'Head': [
        {'condition': 'Tension Headache', 'match': 92, 'color': ZyntraColors.amber},
        {'condition': 'Migraine', 'match': 68, 'color': ZyntraColors.purple},
        {'condition': 'Sinusitis', 'match': 45, 'color': ZyntraColors.cyan},
      ],
      'Chest': [
        {'condition': 'Mild Bronchitis', 'match': 78, 'color': ZyntraColors.amber},
        {'condition': 'Costochondritis', 'match': 55, 'color': ZyntraColors.purple},
        {'condition': 'GERD', 'match': 42, 'color': ZyntraColors.cyan},
      ],
      'Abdomen': [
        {'condition': 'Indigestion', 'match': 85, 'color': ZyntraColors.amber},
        {'condition': 'Gastritis', 'match': 62, 'color': ZyntraColors.purple},
        {'condition': 'IBS', 'match': 38, 'color': ZyntraColors.cyan},
      ],
      'Arms': [
        {'condition': 'Muscle Strain', 'match': 88, 'color': ZyntraColors.amber},
        {'condition': 'Tendonitis', 'match': 52, 'color': ZyntraColors.purple},
        {'condition': 'Arthritis', 'match': 30, 'color': ZyntraColors.cyan},
      ],
      'Legs': [
        {'condition': 'Muscle Fatigue', 'match': 82, 'color': ZyntraColors.amber},
        {'condition': 'Sprain', 'match': 58, 'color': ZyntraColors.purple},
        {'condition': 'Sciatica', 'match': 35, 'color': ZyntraColors.cyan},
      ],
    };
    return allResults[region] ?? [
      {'condition': 'General Malaise', 'match': 70, 'color': ZyntraColors.amber},
      {'condition': 'Viral Infection', 'match': 55, 'color': ZyntraColors.purple},
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading ? _buildShimmer() : SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 20),
              _buildStartButton(),
              const SizedBox(height: 24),
              _buildBodyMap(),
              const SizedBox(height: 24),
              _buildRegionSelector(),
              const SizedBox(height: 20),
              _buildSeveritySlider(),
              const SizedBox(height: 20),
              _buildDurationSelector(),
              if (_analyzing) ...[
                const SizedBox(height: 28),
                _buildAnalyzingAnimation(),
              ],
              if (_showResults) ...[
                const SizedBox(height: 28),
                _buildResultsSection(),
                const SizedBox(height: 24),
                _buildActionButtons(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
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
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Edge AI Symptoms', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
              Text('On-device symptom analysis', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: ZyntraColors.teal.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: ZyntraColors.teal.withValues(alpha: 0.25)),
          ),
          child: Text('OFFLINE', style: GoogleFonts.inter(color: ZyntraColors.teal, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1)),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.05, end: 0);
  }

  Widget _buildStartButton() {
    return GestureDetector(
      onTap: (_selectedRegion == null || _analyzing) ? null : _startAnalysis,
      child: AnimatedBuilder(
        animation: _pulseCtrl,
        builder: (_, __) {
          final glow = _selectedRegion != null && !_analyzing ? 0.2 + _pulseCtrl.value * 0.3 : 0.0;
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 18),
            decoration: BoxDecoration(
              gradient: (_selectedRegion != null && !_analyzing)
                  ? const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple])
                  : const LinearGradient(colors: [ZyntraColors.border, ZyntraColors.card]),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: ZyntraColors.cyan.withValues(alpha: glow),
                  blurRadius: 20 + _pulseCtrl.value * 10,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _analyzing ? Icons.hourglass_top_rounded : Icons.search_rounded,
                  color: _selectedRegion != null && !_analyzing ? Colors.white : ZyntraColors.white40,
                  size: 22,
                ),
                const SizedBox(width: 10),
                Text(
                  _analyzing ? 'Analyzing...' :
                  _selectedRegion == null ? 'Select a body region first' : 'Start Symptom Analysis',
                  style: GoogleFonts.inter(
                    color: _selectedRegion != null && !_analyzing ? Colors.white : ZyntraColors.white40,
                    fontSize: 16, fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildBodyMap() {
    return Container(
      width: double.infinity,
      height: 200,
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: CustomPaint(
          size: const Size(double.infinity, 200),
          painter: _BodyMapPainter(_selectedRegion, ZyntraColors.cyan),
        ),
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildRegionSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Body Region', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Row(
          children: _regions.map((r) => Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedRegion = r),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 3),
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 6),
                decoration: BoxDecoration(
                  color: _selectedRegion == r ? ZyntraColors.cyan.withValues(alpha: 0.12) : ZyntraColors.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _selectedRegion == r ? ZyntraColors.cyan : ZyntraColors.border,
                  ),
                ),
                child: Column(
                  children: [
                    Icon(
                      _regionIcons[r] ?? Icons.circle_rounded,
                      color: _selectedRegion == r ? ZyntraColors.cyan : ZyntraColors.white40,
                      size: 22,
                    ),
                    const SizedBox(height: 4),
                    Text(r, style: GoogleFonts.inter(
                      color: _selectedRegion == r ? ZyntraColors.cyan : ZyntraColors.white70,
                      fontSize: 10, fontWeight: FontWeight.w600,
                    )),
                  ],
                ),
              ),
            ),
          )).toList(),
        ),
      ],
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }

  Widget _buildSeveritySlider() {
    final severityColor = _severity <= 3 ? ZyntraColors.green :
                          _severity <= 6 ? ZyntraColors.amber : ZyntraColors.red;
    final severityLabel = _severity <= 3 ? 'Mild' : _severity <= 6 ? 'Moderate' : 'Severe';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.speed_rounded, color: ZyntraColors.amber, size: 20),
              const SizedBox(width: 8),
              Text('Symptom Severity', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text('${_severity.toInt()}/10 • $severityLabel', style: GoogleFonts.inter(color: severityColor, fontSize: 13, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 8),
          Slider(
            value: _severity,
            min: 1, max: 10,
            divisions: 9,
            activeColor: severityColor,
            inactiveColor: ZyntraColors.border,
            onChanged: (v) => setState(() => _severity = v),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('1 — Mild', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
              Text('10 — Severe', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  Widget _buildDurationSelector() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.calendar_today_rounded, color: ZyntraColors.purple, size: 20),
              const SizedBox(width: 8),
              Text('Duration', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10, runSpacing: 10,
            children: _durations.map((d) => GestureDetector(
              onTap: () => setState(() => _duration = d),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: _duration == d ? ZyntraColors.purple.withValues(alpha: 0.15) : ZyntraColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _duration == d ? ZyntraColors.purple : ZyntraColors.border,
                  ),
                ),
                child: Text(d, style: GoogleFonts.inter(
                  color: _duration == d ? ZyntraColors.purple : ZyntraColors.white70,
                  fontSize: 13, fontWeight: FontWeight.w500,
                )),
              ),
            )).toList(),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms, duration: 300.ms);
  }

  Widget _buildAnalyzingAnimation() {
    return Column(
      children: [
        AnimatedBuilder(
          animation: _scanCtrl,
          builder: (_, __) {
            return Transform.rotate(
              angle: _scanCtrl.value * 2 * math.pi,
              child: const Icon(Icons.radar_rounded, color: ZyntraColors.cyan, size: 60),
            );
          },
        ),
        const SizedBox(height: 16),
        Text('Running Edge AI analysis...', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14)),
        const SizedBox(height: 6),
        Text('Processing on-device • No data sent to cloud', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildResultsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Possible Conditions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600))
            .animate().fadeIn(duration: 300.ms),
        const SizedBox(height: 14),
        ..._results.asMap().entries.map((entry) {
          final r = entry.value;
          final i = entry.key;
          final matchColor = (r['match'] as int) >= 80 ? ZyntraColors.green :
                            (r['match'] as int) >= 60 ? ZyntraColors.amber : ZyntraColors.cyan;
          return Container(
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
                  width: 48, height: 48,
                  decoration: BoxDecoration(
                    color: matchColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text('${r['match']}%', style: GoogleFonts.poppins(color: matchColor, fontSize: 14, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${i + 1}. ${r['condition']}', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 2),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: (r['match'] as int) / 100,
                          backgroundColor: ZyntraColors.border,
                          valueColor: AlwaysStoppedAnimation<Color>(matchColor),
                          minHeight: 4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: (100 * i).ms, duration: 300.ms).slideX(begin: 0.05, end: 0);
        }),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Analysis sent to your doctor!', style: GoogleFonts.inter(color: Colors.white)),
                backgroundColor: ZyntraColors.green,
                behavior: SnackBarBehavior.floating,
              ),
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 6))],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.local_hospital_rounded, color: Colors.white, size: 18),
                  const SizedBox(width: 6),
                  Text('Send to Doctor', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GestureDetector(
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Saved to health records!', style: GoogleFonts.inter(color: Colors.white)),
                backgroundColor: ZyntraColors.green,
                behavior: SnackBarBehavior.floating,
              ),
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: ZyntraColors.card,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.save_alt_rounded, color: ZyntraColors.cyan, size: 18),
                  const SizedBox(width: 6),
                  Text('Save to Records', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 14, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 400.ms, duration: 300.ms);
  }

  Widget _buildShimmer() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
      child: Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(height: 40, width: 200, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12))),
            const SizedBox(height: 20),
            Container(height: 56, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
            const SizedBox(height: 20),
            Container(height: 200, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20))),
            const SizedBox(height: 20),
            Row(
              children: List.generate(5, (_) {
                return Expanded(
                  child: Container(
                    height: 70,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14)),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}

class _BodyMapPainter extends CustomPainter {
  final String? selectedRegion;
  final Color activeColor;

  _BodyMapPainter(this.selectedRegion, this.activeColor);

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final paint = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final fillPaint = Paint()
      ..color = const Color(0xFF1A2235)
      ..style = PaintingStyle.fill;

    final glowPaint = Paint()
      ..color = activeColor.withValues(alpha: 0.1)
      ..style = PaintingStyle.fill;

    // Head
    canvas.drawCircle(Offset(cx, 30), 25, paint);
    canvas.drawCircle(Offset(cx, 30), 25, fillPaint);
    if (selectedRegion == 'Head') {
      canvas.drawCircle(Offset(cx, 30), 28, glowPaint);
      canvas.drawCircle(Offset(cx, 30), 25, Paint()..color = activeColor..style = PaintingStyle.stroke..strokeWidth = 2);
    }

    // Neck
    canvas.drawLine(Offset(cx, 55), Offset(cx, 65), paint);

    // Chest / Torso
    final torsoPath = Path()
      ..moveTo(cx - 35, 65)
      ..lineTo(cx - 30, 120)
      ..lineTo(cx - 20, 150)
      ..lineTo(cx + 20, 150)
      ..lineTo(cx + 30, 120)
      ..lineTo(cx + 35, 65)
      ..close();
    canvas.drawPath(torsoPath, fillPaint);
    canvas.drawPath(torsoPath, paint);
    if (selectedRegion == 'Chest') {
      canvas.drawPath(torsoPath, glowPaint);
      canvas.drawPath(torsoPath, Paint()..color = activeColor..style = PaintingStyle.stroke..strokeWidth = 2);
    }

    // Arms
    final leftArm = Path()
      ..moveTo(cx - 35, 70)
      ..lineTo(cx - 55, 105)
      ..lineTo(cx - 50, 130)
      ..lineTo(cx - 40, 128)
      ..lineTo(cx - 45, 105)
      ..lineTo(cx - 30, 80)
      ..close();
    canvas.drawPath(leftArm, fillPaint);
    canvas.drawPath(leftArm, paint);
    if (selectedRegion == 'Arms') {
      canvas.drawPath(leftArm, glowPaint);
      canvas.drawPath(leftArm, Paint()..color = activeColor..style = PaintingStyle.stroke..strokeWidth = 2);
    }

    final rightArm = Path()
      ..moveTo(cx + 35, 70)
      ..lineTo(cx + 55, 105)
      ..lineTo(cx + 50, 130)
      ..lineTo(cx + 40, 128)
      ..lineTo(cx + 45, 105)
      ..lineTo(cx + 30, 80)
      ..close();
    canvas.drawPath(rightArm, fillPaint);
    canvas.drawPath(rightArm, paint);
    if (selectedRegion == 'Arms') {
      canvas.drawPath(rightArm, glowPaint);
      canvas.drawPath(rightArm, Paint()..color = activeColor..style = PaintingStyle.stroke..strokeWidth = 2);
    }

    // Abdomen
    final abdomenPath = Path()
      ..moveTo(cx - 25, 150)
      ..lineTo(cx - 22, 175)
      ..lineTo(cx - 20, 185)
      ..lineTo(cx + 20, 185)
      ..lineTo(cx + 22, 175)
      ..lineTo(cx + 25, 150)
      ..close();
    canvas.drawPath(abdomenPath, fillPaint);
    canvas.drawPath(abdomenPath, paint);
    if (selectedRegion == 'Abdomen') {
      canvas.drawPath(abdomenPath, glowPaint);
      canvas.drawPath(abdomenPath, Paint()..color = activeColor..style = PaintingStyle.stroke..strokeWidth = 2);
    }

    // Legs
    final leftLeg = Path()
      ..moveTo(cx - 18, 185)
      ..lineTo(cx - 22, 200)
      ..lineTo(cx - 12, 200)
      ..lineTo(cx - 12, 185)
      ..close();
    canvas.drawPath(leftLeg, fillPaint);
    canvas.drawPath(leftLeg, paint);
    if (selectedRegion == 'Legs') {
      canvas.drawPath(leftLeg, glowPaint);
      canvas.drawPath(leftLeg, Paint()..color = activeColor..style = PaintingStyle.stroke..strokeWidth = 2);
    }

    final rightLeg = Path()
      ..moveTo(cx + 18, 185)
      ..lineTo(cx + 22, 200)
      ..lineTo(cx + 12, 200)
      ..lineTo(cx + 12, 185)
      ..close();
    canvas.drawPath(rightLeg, fillPaint);
    canvas.drawPath(rightLeg, paint);
    if (selectedRegion == 'Legs') {
      canvas.drawPath(rightLeg, glowPaint);
      canvas.drawPath(rightLeg, Paint()..color = activeColor..style = PaintingStyle.stroke..strokeWidth = 2);
    }
  }

  @override
  bool shouldRepaint(covariant _BodyMapPainter old) => old.selectedRegion != selectedRegion;
}
