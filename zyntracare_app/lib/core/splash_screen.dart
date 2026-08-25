import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme.dart';
import 'main_screen.dart';

// ─── Particle model ───────────────────────────────────────────────────────────
class _Particle {
  final double angle, speed, radius;
  final Color color;
  _Particle({required this.angle, required this.speed, required this.radius, required this.color});
}

// ─── Particle painter ─────────────────────────────────────────────────────────
class _ParticlePainter extends CustomPainter {
  final List<_Particle> particles;
  final double progress; // 0..1
  _ParticlePainter(this.particles, this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2, cy = size.height / 2;
    for (final p in particles) {
      final dist = p.speed * progress * 180;
      final opacity = (1 - progress).clamp(0.0, 1.0);
      final paint = Paint()
        ..color = p.color.withValues(alpha: opacity * 0.85)
        ..style = PaintingStyle.fill;
      final x = cx + cos(p.angle) * dist;
      final y = cy + sin(p.angle) * dist;
      canvas.drawCircle(Offset(x, y), p.radius * (1 - progress * 0.5), paint);
    }
  }

  @override
  bool shouldRepaint(_ParticlePainter o) => o.progress != progress;
}

// ─── Ring painter ─────────────────────────────────────────────────────────────
class _RingPainter extends CustomPainter {
  final double progress;
  final Color color;
  _RingPainter(this.progress, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final radius = 60 + progress * 100;
    final opacity = (1 - progress).clamp(0.0, 1.0);
    final paint = Paint()
      ..color = color.withValues(alpha: opacity * 0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;
    canvas.drawCircle(Offset(size.width / 2, size.height / 2), radius, paint);
  }

  @override
  bool shouldRepaint(_RingPainter o) => o.progress != progress;
}

// ─── Heartbeat painter ────────────────────────────────────────────────────────
class _HeartbeatPainter extends CustomPainter {
  final double progress;
  _HeartbeatPainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = ZyntraColors.cyan.withValues(alpha: 0.9)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    final path = Path();
    final w = size.width;
    final h = size.height / 2;
    path.moveTo(0, h);
    // flat → spike → flat
    const segments = [0.3, 0.4, 0.45, 0.5, 0.55, 0.6, 0.7];
    const heights  = [0.0, 0.0, -1.0,  1.5, -0.5,  0.0, 0.0];
    for (var i = 0; i < segments.length - 1; i++) {
      path.lineTo(w * segments[i], h + heights[i] * h * 0.5);
    }
    path.lineTo(w, h);
    // Clip to progress
    canvas.save();
    canvas.clipRect(Rect.fromLTWH(0, 0, w * progress, size.height));
    canvas.drawPath(path, paint);
    canvas.restore();
  }

  @override
  bool shouldRepaint(_HeartbeatPainter o) => o.progress != progress;
}

// ─── Splash Screen ────────────────────────────────────────────────────────────
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _particleCtrl;
  late AnimationController _logoCtrl;
  late AnimationController _ringCtrl;
  late AnimationController _barCtrl;
  late AnimationController _bgCtrl;

  late List<_Particle> _particles;

  final _rng = Random();

  @override
  void initState() {
    super.initState();

    // Generate 20 particles
    final colors = [ZyntraColors.cyan, ZyntraColors.purple, ZyntraColors.pink, ZyntraColors.teal];
    _particles = List.generate(20, (i) => _Particle(
      angle: (i / 20) * 2 * pi,
      speed: 0.7 + _rng.nextDouble() * 0.6,
      radius: 3 + _rng.nextDouble() * 4,
      color: colors[i % colors.length],
    ));

    _bgCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 6))..repeat(reverse: true);

    _particleCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
      ..forward();

    _logoCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));
    Future.delayed(const Duration(milliseconds: 500), () { if (mounted) _logoCtrl.forward(); });

    _ringCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400));
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) _ringCtrl.repeat();
    });

    _barCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1600));
    Future.delayed(const Duration(milliseconds: 700), () { if (mounted) _barCtrl.forward(); });

    Future.delayed(const Duration(milliseconds: 3400), () {
      if (mounted) Navigator.pushReplacement(context, _fadeRoute(const MainScreen()));
    });
  }

  @override
  void dispose() {
    _particleCtrl.dispose();
    _logoCtrl.dispose();
    _ringCtrl.dispose();
    _barCtrl.dispose();
    _bgCtrl.dispose();
    super.dispose();
  }

  Route _fadeRoute(Widget page) => PageRouteBuilder(
    pageBuilder: (_, _, _) => page,
    transitionDuration: const Duration(milliseconds: 600),
    transitionsBuilder: (_, anim, _, child) => FadeTransition(opacity: anim, child: child),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBuilder(
        animation: Listenable.merge([_bgCtrl, _particleCtrl, _logoCtrl, _ringCtrl, _barCtrl]),
        builder: (ctx, _) {
          // Animated bg hue shift
          final bgColor1 = Color.lerp(const Color(0xFF080C14), const Color(0xFF060D1F), _bgCtrl.value)!;
          final bgColor2 = Color.lerp(const Color(0xFF0A1020), const Color(0xFF0D0920), _bgCtrl.value)!;

          // 3D logo flip: π → 0
          final flipAngle = (1 - _logoCtrl.value) * pi;
          final logoScale = Curves.elasticOut.transform(_logoCtrl.value.clamp(0.0, 1.0));

          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [bgColor1, bgColor2],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: Stack(children: [
              // ── Particle burst ──
              Positioned.fill(
                child: CustomPaint(
                  painter: _ParticlePainter(_particles, _particleCtrl.value),
                ),
              ),
              // ── Pulsing rings ──
              Positioned.fill(
                child: CustomPaint(
                  painter: _RingPainter(_ringCtrl.value, ZyntraColors.cyan),
                ),
              ),
              Positioned.fill(
                child: CustomPaint(
                  painter: _RingPainter((_ringCtrl.value + 0.4) % 1.0, ZyntraColors.purple),
                ),
              ),
              // ── Center content ──
              Center(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  // ── 3D Logo Flip ──
                  Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.identity()
                      ..setEntry(3, 2, 0.002)
                      ..rotateY(flipAngle),
                    child: Transform.scale(
                      scale: logoScale.clamp(0.01, 1.0),
                      child: Container(
                        width: 110, height: 110,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [ZyntraColors.cyan, ZyntraColors.purple],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(30),
                          boxShadow: [
                            BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.5), blurRadius: 40, spreadRadius: 4),
                            BoxShadow(color: ZyntraColors.purple.withValues(alpha: 0.3), blurRadius: 60, spreadRadius: 8),
                          ],
                        ),
                        child: const Icon(Icons.favorite_rounded, color: Colors.white, size: 52),
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // ── Text with flutter_animate stagger ──
                  ShaderMask(
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [ZyntraColors.cyan, ZyntraColors.purple],
                    ).createShader(bounds),
                    child: Text('ZyntraCare',
                      style: GoogleFonts.poppins(
                        fontSize: 36, fontWeight: FontWeight.w800, color: Colors.white,
                      ),
                    ),
                  ).animate(controller: _logoCtrl).fadeIn(duration: 400.ms).slideY(begin: 0.3, end: 0),

                  const SizedBox(height: 6),
                  Text('India\'s #1 Healthcare Platform',
                    style: GoogleFonts.inter(fontSize: 14, color: ZyntraColors.white70),
                  ).animate(controller: _logoCtrl).fadeIn(delay: 150.ms, duration: 400.ms),

                  const SizedBox(height: 48),

                  // ── Glowing progress bar ──
                  SizedBox(
                    width: 220,
                    child: Column(children: [
                      Container(
                        height: 3,
                        decoration: BoxDecoration(
                          color: ZyntraColors.border,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: FractionallySizedBox(
                          widthFactor: Curves.easeInOut.transform(_barCtrl.value),
                          alignment: Alignment.centerLeft,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                              borderRadius: BorderRadius.circular(4),
                              boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.8), blurRadius: 8)],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _barCtrl.value < 0.4 ? 'Initializing...'
                          : _barCtrl.value < 0.8 ? 'Loading services...'
                          : 'Ready!',
                        style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white40),
                      ),
                    ]),
                  ).animate(controller: _logoCtrl).fadeIn(delay: 200.ms),

                  const SizedBox(height: 24),

                  // ── Heartbeat line ──
                  SizedBox(
                    width: 180, height: 32,
                    child: CustomPaint(
                      painter: _HeartbeatPainter(_barCtrl.value),
                    ),
                  ).animate(controller: _logoCtrl).fadeIn(delay: 300.ms),
                ]),
              ),
            ]),
          );
        },
      ),
    );
  }
}
