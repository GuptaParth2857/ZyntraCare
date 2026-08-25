import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class DnaVisualsScreen extends StatefulWidget {
  const DnaVisualsScreen({super.key});
  @override State<DnaVisualsScreen> createState() => _DnaVisualsScreenState();
}

class _DnaVisualsScreenState extends State<DnaVisualsScreen> with TickerProviderStateMixin {
  late TabController _tabCtrl;
  late AnimationController _dnaCtrl;
  late AnimationController _heartCtrl;
  late AnimationController _moleculeCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    _tabCtrl.addListener(() {
      if (!_tabCtrl.indexIsChanging) setState(() {});
    });
    _dnaCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat();
    _heartCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
    _moleculeCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 6))..repeat();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _dnaCtrl.dispose();
    _heartCtrl.dispose();
    _moleculeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
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
                  Text('DNA Visuals', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: ZyntraColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: TabBar(
                controller: _tabCtrl,
                indicator: BoxDecoration(
                  gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                  borderRadius: BorderRadius.circular(12),
                ),
                indicatorPadding: const EdgeInsets.all(4),
                labelColor: Colors.white,
                unselectedLabelColor: ZyntraColors.white70,
                labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 11),
                tabs: const [
                  Tab(text: 'DNA Helix'),
                  Tab(text: 'Holographic\nHeart'),
                  Tab(text: 'Medical\nMolecules'),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: TabBarView(
                controller: _tabCtrl,
                children: [
                  _dnaHelixTab(),
                  _holographicHeartTab(),
                  _moleculesTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _dnaHelixTab() {
    return Column(
      children: [
        Expanded(
          child: AnimatedBuilder(
            animation: _dnaCtrl,
            builder: (_, _) => CustomPaint(
              size: const Size(double.infinity, double.infinity),
              painter: _DnaHelixPainter(_dnaCtrl.value),
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 24),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card.withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            children: [
              Text('DNA Double Helix', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text('Animated 3D representation of DNA structure with rotating base pairs',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _holographicHeartTab() {
    return Column(
      children: [
        Expanded(
          child: AnimatedBuilder(
            animation: _heartCtrl,
            builder: (_, _) => CustomPaint(
              size: const Size(double.infinity, double.infinity),
              painter: _HeartPainter(_heartCtrl.value),
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 24),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card.withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            children: [
              Text('Holographic Heart', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text('Pulsing holographic heart with cyan glow and particle effects',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _moleculesTab() {
    return Column(
      children: [
        Expanded(
          child: AnimatedBuilder(
            animation: _moleculeCtrl,
            builder: (_, _) => CustomPaint(
              size: const Size(double.infinity, double.infinity),
              painter: _MoleculePainter(_moleculeCtrl.value),
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 24),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card.withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            children: [
              Text('Medical Molecules', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text('Floating 3D molecular structures with orbital electron effects',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }
}

class _DnaHelixPainter extends CustomPainter {
  final double t;
  _DnaHelixPainter(this.t);

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final radius = 60.0;
    final len = 180.0;
    final steps = 32;
    final half = steps ~/ 2;

    final primaryPaint = Paint()
      ..color = ZyntraColors.cyan
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;
    final secondaryPaint = Paint()
      ..color = ZyntraColors.purple
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;

    final glowPaint = Paint()
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    final rungPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    for (int i = 0; i < steps; i++) {
      final f = i / steps;
      final y = cy - len / 2 + f * len;
      final angle = (f * math.pi * 4 + t * math.pi * 2);
      final x1 = cx + math.cos(angle) * radius;
      final x2 = cx + math.cos(angle + math.pi) * radius;
      final zFactor = (math.sin(angle).abs() * 0.4 + 0.6);
      final alpha = (zFactor * 255).round();

      primaryPaint.color = ZyntraColors.cyan.withValues(alpha: alpha / 255.0);
      glowPaint.color = ZyntraColors.cyan.withValues(alpha: (alpha / 255.0) * 0.3);

      canvas.drawCircle(Offset(x1, y), 3 * zFactor, primaryPaint);
      canvas.drawCircle(Offset(x1, y), 6 * zFactor, glowPaint..color = ZyntraColors.cyan.withValues(alpha: (alpha / 255.0) * 0.2));

      secondaryPaint.color = ZyntraColors.purple.withValues(alpha: alpha / 255.0);
      canvas.drawCircle(Offset(x2, y), 3 * zFactor, secondaryPaint);
      canvas.drawCircle(Offset(x2, y), 6 * zFactor, glowPaint..color = ZyntraColors.purple.withValues(alpha: (alpha / 255.0) * 0.2));

      if (i < half) {
        final f2 = (i + half) / steps;
        final y2 = cy - len / 2 + f2 * len;
        final angle2 = (f2 * math.pi * 4 + t * math.pi * 2);
        final x1b = cx + math.cos(angle2) * radius;

        rungPaint.color = ZyntraColors.white70.withValues(alpha: (alpha / 255.0) * 0.4);
        canvas.drawLine(Offset(x1, y), Offset(x1b, y2), rungPaint);
      }
    }

    final label = TextPainter(
      text: TextSpan(
        text: '3D DNA Helix',
        style: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.3), fontSize: 12, fontWeight: FontWeight.w500),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    label.paint(canvas, Offset(cx - label.width / 2, cy + len / 2 + 24));
  }

  @override
  bool shouldRepaint(_DnaHelixPainter old) => old.t != t;
}

class _HeartPainter extends CustomPainter {
  final double t;
  _HeartPainter(this.t);

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final pulse = 1.0 + 0.08 * math.sin(t * math.pi * 2);
    final baseSize = 80.0 * pulse;

    final heartPaint = Paint()
      ..color = ZyntraColors.cyan
      ..style = PaintingStyle.fill;

    final glowPaint = Paint()
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 20)
      ..color = ZyntraColors.cyan.withValues(alpha: 0.4 * (0.7 + 0.3 * math.sin(t * math.pi * 2)));

    final outerGlow = Paint()
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 40)
      ..color = ZyntraColors.purple.withValues(alpha: 0.2 * (0.5 + 0.5 * math.sin(t * math.pi * 2)));

    canvas.save();
    canvas.translate(cx, cy + 10);

    canvas.drawCircle(Offset.zero, baseSize * 1.4, outerGlow);
    canvas.drawCircle(Offset.zero, baseSize * 0.8, glowPaint);

    final path = Path();
    path.moveTo(0, baseSize * 0.3);
    path.cubicTo(
      -baseSize * 0.8, -baseSize * 0.4,
      -baseSize * 1.0, -baseSize * 0.9,
      0, -baseSize * 0.6,
    );
    path.cubicTo(
      baseSize * 1.0, -baseSize * 0.9,
      baseSize * 0.8, -baseSize * 0.4,
      0, baseSize * 0.3,
    );
    path.close();

    canvas.drawPath(path, heartPaint);

    final highlightPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.15 * (0.6 + 0.4 * math.sin(t * math.pi * 2)))
      ..style = PaintingStyle.fill;
    final highlight = Path();
    highlight.moveTo(0, -baseSize * 0.5);
    highlight.cubicTo(
      -baseSize * 0.3, -baseSize * 0.7,
      -baseSize * 0.4, -baseSize * 0.5,
      0, -baseSize * 0.4,
    );
    highlight.cubicTo(
      baseSize * 0.4, -baseSize * 0.5,
      baseSize * 0.3, -baseSize * 0.7,
      0, -baseSize * 0.5,
    );
    highlight.close();
    canvas.drawPath(highlight, highlightPaint);

    canvas.restore();

    final label = TextPainter(
      text: TextSpan(
        text: 'Holographic Heart',
        style: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.3), fontSize: 12, fontWeight: FontWeight.w500),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    label.paint(canvas, Offset(cx - label.width / 2, cy + 80));
  }

  @override
  bool shouldRepaint(_HeartPainter old) => old.t != t;
}

class _MoleculePainter extends CustomPainter {
  final double t;
  _MoleculePainter(this.t);

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;

    final molecules = [
      MoleculeData(Offset(cx - 60, cy - 40), 30, 0.0, ZyntraColors.cyan),
      MoleculeData(Offset(cx + 50, cy - 30), 25, 1.5, ZyntraColors.purple),
      MoleculeData(Offset(cx - 30, cy + 50), 35, 3.0, ZyntraColors.teal),
      MoleculeData(Offset(cx + 40, cy + 40), 28, 4.5, ZyntraColors.pink),
      MoleculeData(Offset(cx, cy), 20, 2.0, ZyntraColors.amber),
    ];

    final bondPaint = Paint()
      ..color = ZyntraColors.white70.withValues(alpha: 0.1)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    for (int i = 0; i < molecules.length; i++) {
      for (int j = i + 1; j < molecules.length; j++) {
        final dist = (molecules[i].pos - molecules[j].pos).distance;
        if (dist < 120) {
          canvas.drawLine(molecules[i].pos, molecules[j].pos, bondPaint);
        }
      }
    }

    for (final mol in molecules) {
      final wobble = math.sin(t * math.pi * 2 + mol.phase) * 4;
      final pos = mol.pos + Offset(wobble, math.cos(t * math.pi * 2 + mol.phase * 0.7) * 4);
      final r = mol.radius;

      final glow = Paint()
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 16)
        ..color = mol.color.withValues(alpha: 0.2);

      canvas.drawCircle(pos, r * 1.5, glow);

      final fill = Paint()
        ..shader = RadialGradient(
          colors: [mol.color.withValues(alpha: 0.6), mol.color.withValues(alpha: 0.1)],
        ).createShader(Rect.fromCircle(center: pos, radius: r));

      canvas.drawCircle(pos, r, fill);

      final border = Paint()
        ..color = mol.color.withValues(alpha: 0.5)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;

      canvas.drawCircle(pos, r, border);

      final orbitAngle = t * math.pi * 2 * 1.5 + mol.phase;
      final orbitRadius = r + 12;
      final electron = Paint()
        ..color = mol.color
        ..style = PaintingStyle.fill;

      canvas.drawCircle(
        pos + Offset(math.cos(orbitAngle) * orbitRadius, math.sin(orbitAngle) * orbitRadius * 0.5),
        2.5,
        electron,
      );

      final orbitPaint = Paint()
        ..color = mol.color.withValues(alpha: 0.15)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 0.5
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2);

      canvas.drawOval(
        Rect.fromCenter(center: pos, width: orbitRadius * 2, height: orbitRadius),
        orbitPaint,
      );
    }

    final label = TextPainter(
      text: TextSpan(
        text: 'Medical Molecules',
        style: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.3), fontSize: 12, fontWeight: FontWeight.w500),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    label.paint(canvas, Offset(cx - label.width / 2, cy + 90));
  }

  @override
  bool shouldRepaint(_MoleculePainter old) => old.t != t;
}

class MoleculeData {
  final Offset pos;
  final double radius;
  final double phase;
  final Color color;
  const MoleculeData(this.pos, this.radius, this.phase, this.color);
}
