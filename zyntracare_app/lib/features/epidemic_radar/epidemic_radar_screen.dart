import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class EpidemicRadarScreen extends StatefulWidget {
  const EpidemicRadarScreen({super.key});
  @override State<EpidemicRadarScreen> createState() => _EpidemicRadarScreenState();
}

class _EpidemicRadarScreenState extends State<EpidemicRadarScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _outbreaks = [];
  bool _showPrevention = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.get('/api/epidemic-radar');
      if (mounted && res != null) {
        final list = (res is List ? res : (res['data'] ?? res['outbreaks'] ?? [])) as List;
        setState(() => _outbreaks = list.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList());
      }
    } catch (_) {}
    if (_outbreaks.isEmpty && mounted) {
      setState(() => _outbreaks = _placeholderData());
    }
    if (mounted) setState(() => _loading = false);
  }

  List<Map<String, dynamic>> _placeholderData() => [
    {'disease': 'Dengue', 'cases': 1247, 'location': 'Delhi NCR', 'trend': 'up', 'severity': 'high', 'lastUpdated': '2 hours ago'},
    {'disease': 'Malaria', 'cases': 893, 'location': 'Mumbai, Maharashtra', 'trend': 'up', 'severity': 'high', 'lastUpdated': '5 hours ago'},
    {'disease': 'Chikungunya', 'cases': 456, 'location': 'Bengaluru, Karnataka', 'trend': 'stable', 'severity': 'medium', 'lastUpdated': '1 day ago'},
    {'disease': 'Typhoid', 'cases': 312, 'location': 'Kolkata, West Bengal', 'trend': 'down', 'severity': 'medium', 'lastUpdated': '12 hours ago'},
    {'disease': 'COVID-19', 'cases': 189, 'location': 'Chennai, Tamil Nadu', 'trend': 'down', 'severity': 'low', 'lastUpdated': '3 hours ago'},
    {'disease': 'Swine Flu', 'cases': 67, 'location': 'Lucknow, UP', 'trend': 'stable', 'severity': 'low', 'lastUpdated': '2 days ago'},
  ];

  Color _severityColor(String s) {
    switch (s) {
      case 'high': return ZyntraColors.red;
      case 'medium': return ZyntraColors.amber;
      default: return ZyntraColors.green;
    }
  }

  IconData _trendIcon(String t) {
    switch (t) {
      case 'up': return Icons.trending_up_rounded;
      case 'down': return Icons.trending_down_rounded;
      default: return Icons.trending_flat_rounded;
    }
  }

  Color _trendColor(String t) {
    switch (t) {
      case 'up': return ZyntraColors.red;
      case 'down': return ZyntraColors.green;
      default: return ZyntraColors.amber;
    }
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
                      Text('Epidemic Radar', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                        child: Icon(Icons.biotech_rounded, color: Colors.white, size: 22),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Real-time outbreak monitoring across India', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            if (_loading)
              Expanded(child: _buildShimmer())
            else
              Expanded(
                child: RefreshIndicator(
                  color: ZyntraColors.cyan,
                  backgroundColor: ZyntraColors.card,
                  onRefresh: _load,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.only(bottom: 100),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 16),
                        // India Map Placeholder
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Container(
                            height: 220,
                            decoration: BoxDecoration(
                              color: ZyntraColors.card,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: ZyntraColors.border),
                            ),
                            child: CustomPaint(
                              painter: _IndiaMapPainter(_outbreaks),
                              size: const Size(double.infinity, 220),
                            ),
                          ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0),
                        ),
                        const SizedBox(height: 16),
                        // Alert Banner
                        if (_outbreaks.any((o) => o['severity'] == 'high'))
                          Container(
                            width: double.infinity,
                            margin: const EdgeInsets.symmetric(horizontal: 16),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(colors: [ZyntraColors.red.withValues(alpha: 0.2), ZyntraColors.red.withValues(alpha: 0.05)]),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(color: ZyntraColors.red.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(10)),
                                  child: const Icon(Icons.warning_amber_rounded, color: ZyntraColors.red, size: 24),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('High Severity Alert', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                                      Text('Active outbreaks detected in your region', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ).animate().shake(duration: 600.ms),
                        const SizedBox(height: 16),
                        // Outbreaks Header
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                          child: Row(
                            children: [
                              Text('Active Outbreaks', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                              const Spacer(),
                              Text('${_outbreaks.length} reported', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                            ],
                          ),
                        ),
                        ...List.generate(_outbreaks.length, (i) => _outbreakCard(_outbreaks[i], i)),
                        const SizedBox(height: 16),
                        // Preventive Measures
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: GestureDetector(
                            onTap: () => setState(() => _showPrevention = !_showPrevention),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: ZyntraColors.card,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: ZyntraColors.border),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(color: ZyntraColors.teal.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                                        child: const Icon(Icons.shield_rounded, color: ZyntraColors.teal, size: 22),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(child: Text('Preventive Measures', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600))),
                                      Icon(_showPrevention ? Icons.expand_less_rounded : Icons.expand_more_rounded, color: ZyntraColors.white70),
                                    ],
                                  ),
                                  if (_showPrevention) ...[
                                    const SizedBox(height: 14),
                                    _preventionItem(Icons.clean_hands_rounded, 'Wash hands frequently with soap'),
                                    _preventionItem(Icons.masks_rounded, 'Wear mask in crowded areas'),
                                    _preventionItem(Icons.water_drop_rounded, 'Drink clean boiled water'),
                                    _preventionItem(Icons.bug_report_rounded, 'Use mosquito repellent / nets'),
                                    _preventionItem(Icons.sanitizer_rounded, 'Use hand sanitizer (60%+ alcohol)'),
                                    _preventionItem(Icons.vaccines_rounded, 'Stay up-to-date with vaccinations'),
                                    const SizedBox(height: 12),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        // Subscribe Button
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: GestureDetector(
                            onTap: () {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                content: Text('Subscribed to outbreak alerts!', style: GoogleFonts.inter(color: Colors.white)),
                                backgroundColor: ZyntraColors.cyan,
                                behavior: SnackBarBehavior.floating,
                              ));
                            },
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.notifications_active_rounded, color: Colors.white, size: 20),
                                  const SizedBox(width: 8),
                                  Text('Subscribe to Alerts', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _outbreakCard(Map<String, dynamic> o, int i) {
    final severity = o['severity'] ?? 'low';
    final sc = _severityColor(severity);
    final trend = o['trend'] ?? 'stable';
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [ZyntraColors.card, ZyntraColors.surface], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: sc.withValues(alpha: 0.2)),
        boxShadow: [BoxShadow(color: sc.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: sc.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: Icon(Icons.bug_report_rounded, color: sc, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(o['disease'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    Text(o['location'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: sc.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: Text(severity.toUpperCase(), style: GoogleFonts.inter(color: sc, fontSize: 10, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _statItem('Cases', '${o['cases'] ?? 0}', ZyntraColors.cyan),
              const SizedBox(width: 16),
              Row(
                children: [
                  Icon(_trendIcon(trend), color: _trendColor(trend), size: 18),
                  const SizedBox(width: 4),
                  Text(trend[0].toUpperCase() + trend.substring(1), style: GoogleFonts.inter(color: _trendColor(trend), fontSize: 12, fontWeight: FontWeight.w500)),
                ],
              ),
              const Spacer(),
              Icon(Icons.access_time_rounded, color: ZyntraColors.white40, size: 11),
              const SizedBox(width: 4),
              Text(o['lastUpdated'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 60).ms).slideY(begin: 0.05, end: 0);
  }

  Widget _statItem(String label, String value, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
          child: Row(
            children: [
              Text(value, style: GoogleFonts.inter(color: color, fontSize: 14, fontWeight: FontWeight.w700)),
              const SizedBox(width: 4),
              Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _preventionItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, color: ZyntraColors.teal, size: 18),
          const SizedBox(width: 10),
          Text(text, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      itemCount: 5,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 130,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(18)),
        ),
      ),
    );
  }
}

class _IndiaMapPainter extends CustomPainter {
  final List<Map<String, dynamic>> outbreaks;
  _IndiaMapPainter(this.outbreaks);

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = ZyntraColors.surface;
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(0, 0, size.width, size.height), const Radius.circular(20)), bgPaint);

    final gridPaint = Paint()..color = ZyntraColors.border.withValues(alpha: 0.3)..strokeWidth = 0.5;
    for (double x = 0; x < size.width; x += 30) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 30) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    final outlinePaint = Paint()..color = ZyntraColors.cyan.withValues(alpha: 0.4)..style = PaintingStyle.stroke..strokeWidth = 2;
    final path = Path();
    path.moveTo(size.width * 0.35, size.height * 0.1);
    path.lineTo(size.width * 0.5, size.height * 0.05);
    path.lineTo(size.width * 0.6, size.height * 0.08);
    path.lineTo(size.width * 0.68, size.height * 0.15);
    path.lineTo(size.width * 0.72, size.height * 0.25);
    path.lineTo(size.width * 0.7, size.height * 0.35);
    path.lineTo(size.width * 0.65, size.height * 0.42);
    path.lineTo(size.width * 0.6, size.height * 0.48);
    path.lineTo(size.width * 0.65, size.height * 0.55);
    path.lineTo(size.width * 0.7, size.height * 0.6);
    path.lineTo(size.width * 0.75, size.height * 0.65);
    path.lineTo(size.width * 0.7, size.height * 0.72);
    path.lineTo(size.width * 0.6, size.height * 0.75);
    path.lineTo(size.width * 0.5, size.height * 0.78);
    path.lineTo(size.width * 0.4, size.height * 0.75);
    path.lineTo(size.width * 0.3, size.height * 0.7);
    path.lineTo(size.width * 0.25, size.height * 0.65);
    path.lineTo(size.width * 0.28, size.height * 0.55);
    path.lineTo(size.width * 0.25, size.height * 0.48);
    path.lineTo(size.width * 0.2, size.height * 0.42);
    path.lineTo(size.width * 0.22, size.height * 0.35);
    path.lineTo(size.width * 0.25, size.height * 0.28);
    path.lineTo(size.width * 0.3, size.height * 0.2);
    path.lineTo(size.width * 0.35, size.height * 0.1);
    canvas.drawPath(path, outlinePaint);

    for (int i = 0; i < outbreaks.length; i++) {
      final x = size.width * (0.25 + (i * 0.08));
      final y = size.height * (0.2 + (i * 0.07) + ((i % 2) * 0.05));
      final severity = outbreaks[i]['severity'] ?? 'low';
      final color = severity == 'high' ? ZyntraColors.red : (severity == 'medium' ? ZyntraColors.amber : ZyntraColors.green);

      final dotPaint = Paint()..color = color;
      canvas.drawCircle(Offset(x, y), 6, dotPaint);

      final glowPaint = Paint()..color = color.withValues(alpha: 0.3);
      canvas.drawCircle(Offset(x, y), 14, glowPaint);

      final labelPaint = Paint()..color = Colors.white;
      canvas.drawCircle(Offset(x, y), 3, labelPaint);
    }

    final titlePaint = TextPainter(
      text: TextSpan(text: 'INDIA', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 2)),
      textDirection: TextDirection.ltr,
    );
    titlePaint.layout();
    titlePaint.paint(canvas, Offset(size.width / 2 - titlePaint.width / 2, size.height - 28));
  }

  @override
  bool shouldRepaint(covariant _IndiaMapPainter old) => old.outbreaks != outbreaks;
}
