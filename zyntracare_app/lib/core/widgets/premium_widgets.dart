import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:math' as math;
import '../main_screen.dart';

// ─── Premium Splash Screen ─────────────────────────────────────────────────
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  late AnimationController _rotCtrl;
  int _step = 0;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: 1500.ms)..repeat(reverse: true);
    _rotCtrl   = AnimationController(vsync: this, duration: 6000.ms)..repeat();
    _sequence();
  }

  Future<void> _sequence() async {
    await Future.delayed(600.ms);
    if (mounted) setState(() => _step = 1);
    await Future.delayed(700.ms);
    if (mounted) setState(() => _step = 2);
    await Future.delayed(600.ms);
    if (mounted) setState(() => _step = 3);
    await Future.delayed(900.ms);
    if (mounted) Navigator.pushReplacement(context, _fadeRoute(const MainScreen()));
  }

  @override
  void dispose() { _pulseCtrl.dispose(); _rotCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: Stack(children: [
        // Animated background rings
        AnimatedBuilder(animation: _rotCtrl, builder: (_, _) => CustomPaint(
          size: MediaQuery.of(context).size,
          painter: _RingPainter(_rotCtrl.value),
        )),
        Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          // Logo with pulse glow
          AnimatedBuilder(animation: _pulseCtrl, builder: (_, _) => Container(
            width: 110, height: 110,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(colors: [Color(0xFF00D4FF), Color(0xFF7B2FF7)], begin: Alignment.topLeft, end: Alignment.bottomRight),
              boxShadow: [BoxShadow(color: const Color(0xFF00D4FF).withOpacity(0.3 + 0.3 * _pulseCtrl.value), blurRadius: 30 + 20 * _pulseCtrl.value, spreadRadius: 2)],
            ),
            child: const Icon(Icons.favorite_rounded, color: Colors.white, size: 52),
          )).animate().scale(duration: 600.ms, curve: Curves.elasticOut),

          const SizedBox(height: 28),

          // Staggered text reveal
          if (_step >= 1) ShaderMask(
            shaderCallback: (b) => const LinearGradient(colors: [Color(0xFF00D4FF), Color(0xFF7B2FF7)]).createShader(b),
            child: const Text('ZyntraCare', style: TextStyle(fontSize: 34, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 1.2)),
          ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.3, end: 0),

          if (_step >= 2) const SizedBox(height: 6),
          if (_step >= 2) const Text("India's #1 Healthcare Platform",
            style: TextStyle(color: Colors.white54, fontSize: 14, letterSpacing: 0.5),
          ).animate().fadeIn(duration: 400.ms),

          const SizedBox(height: 48),

          if (_step >= 3) Column(children: [
            SizedBox(width: 180, child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: const LinearProgressIndicator(
                backgroundColor: Colors.white10,
                valueColor: AlwaysStoppedAnimation(Color(0xFF00D4FF)),
                minHeight: 3,
              ),
            )).animate().fadeIn(duration: 300.ms),
            const SizedBox(height: 12),
            const Text('Loading your health companion...', style: TextStyle(color: Colors.white38, fontSize: 11)),
          ]).animate().fadeIn(duration: 400.ms),
        ])),
      ]),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double t;
  _RingPainter(this.t);
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2, cy = size.height / 2;
    for (int i = 0; i < 3; i++) {
      final angle = t * 2 * math.pi + i * math.pi * 2 / 3;
      final r = 120.0 + i * 60;
      final paint = Paint()
        ..color = const Color(0xFF00D4FF).withOpacity(0.04 + i * 0.02)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1;
      canvas.drawCircle(Offset(cx + math.cos(angle) * 20, cy + math.sin(angle) * 20), r, paint);
    }
  }
  @override bool shouldRepaint(_) => true;
}

// ─── App Theme ────────────────────────────────────────────────────────────────
class AppTheme {
  static const bg       = Color(0xFF080E1A);
  static const surface  = Color(0xFF111827);
  static const card     = Color(0xFF1A2235);
  static const border   = Color(0xFF1E293B);
  static const cyan     = Color(0xFF00D4FF);
  static const purple   = Color(0xFF7B2FF7);
  static const green    = Color(0xFF10B981);
  static const red      = Color(0xFFEF4444);
  static const amber    = Color(0xFFF59E0B);
  static const pink     = Color(0xFFEC4899);
  static const indigo   = Color(0xFF6366F1);
  static const teal     = Color(0xFF14B8A6);

  static ThemeData get theme => ThemeData(
    brightness: Brightness.dark,
    primaryColor: cyan,
    scaffoldBackgroundColor: bg,
    fontFamily: 'Roboto',
    colorScheme: const ColorScheme.dark(primary: cyan, surface: surface),
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
Route _fadeRoute(Widget page) => PageRouteBuilder(
  pageBuilder: (_, a, _) => FadeTransition(opacity: a, child: page),
  transitionDuration: 400.ms,
);

Route _slideUpRoute(Widget page) => PageRouteBuilder(
  pageBuilder: (_, a, _) => SlideTransition(
    position: Tween(begin: const Offset(0, 1), end: Offset.zero).animate(CurvedAnimation(parent: a, curve: Curves.easeOutCubic)),
    child: page,
  ),
  transitionDuration: 350.ms,
);

// ─── Glass Card Widget ─────────────────────────────────────────────────────────
class GlassCard extends StatefulWidget {
  final Widget child;
  final EdgeInsets? padding;
  final Color? accent;
  final double radius;
  final VoidCallback? onTap;
  const GlassCard({super.key, required this.child, this.padding, this.accent, this.radius = 20, this.onTap});
  @override State<GlassCard> createState() => _GlassCardState();
}
class _GlassCardState extends State<GlassCard> {
  bool _pressed = false;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) { setState(() => _pressed = false); widget.onTap?.call(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.96 : 1.0,
        duration: 150.ms,
        child: Container(
          padding: widget.padding ?? const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.card,
            borderRadius: BorderRadius.circular(widget.radius),
            border: Border.all(color: (widget.accent ?? Colors.white).withOpacity(0.12), width: 1),
            boxShadow: [BoxShadow(color: (widget.accent ?? AppTheme.cyan).withOpacity(0.06), blurRadius: 16, spreadRadius: 0)],
          ),
          child: widget.child,
        ),
      ),
    );
  }
}

// ─── Gradient Button ──────────────────────────────────────────────────────────
class GradientButton extends StatefulWidget {
  final String label; final VoidCallback? onTap; final IconData? icon;
  final List<Color> colors; final double width;
  const GradientButton({super.key, required this.label, this.onTap, this.icon, this.colors = const [AppTheme.cyan, AppTheme.purple], this.width = double.infinity});
  @override State<GradientButton> createState() => _GradientButtonState();
}
class _GradientButtonState extends State<GradientButton> {
  bool _pressed = false;
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTapDown: (_) => setState(() => _pressed = true),
    onTapUp: (_) { setState(() => _pressed = false); widget.onTap?.call(); },
    onTapCancel: () => setState(() => _pressed = false),
    child: AnimatedScale(scale: _pressed ? 0.97 : 1.0, duration: 120.ms, child: Container(
      width: widget.width, height: 52,
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: widget.colors),
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: widget.colors.first.withOpacity(0.35), blurRadius: 16, offset: const Offset(0, 6))],
      ),
      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        if (widget.icon != null) ...[Icon(widget.icon, color: Colors.white, size: 18), const SizedBox(width: 8)],
        Text(widget.label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
      ]),
    )),
  );
}
