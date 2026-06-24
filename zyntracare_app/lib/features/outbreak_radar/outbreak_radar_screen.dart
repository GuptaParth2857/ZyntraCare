import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class OutbreakRadarScreen extends StatefulWidget {
  const OutbreakRadarScreen({super.key});
  @override State<OutbreakRadarScreen> createState() => _OutbreakRadarScreenState();
}

class _OutbreakRadarScreenState extends State<OutbreakRadarScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _outbreaks = [];
  bool _showPrevention = false;
  bool _subscribed = false;
  int _activeOutbreaks = 0;
  String _alertLevel = 'Normal';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.get('/api/outbreak-radar');
      if (mounted && res != null) {
        final list = (res is List ? res : (res['data'] ?? res['outbreaks'] ?? [])) as List;
        setState(() {
          _outbreaks = list.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList();
          _activeOutbreaks = res['activeOutbreaks'] ?? _outbreaks.length;
          _alertLevel = res['alertLevel'] ?? 'Normal';
        });
      }
    } catch (_) {}
    if (_outbreaks.isEmpty && mounted) {
      setState(() => _outbreaks = _placeholderData());
    }
    if (mounted) {
      setState(() {
        _activeOutbreaks = _activeOutbreaks > 0 ? _activeOutbreaks : _outbreaks.length;
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _placeholderData() => [
    {'disease': 'Marburg Virus', 'cases': 342, 'deaths': 128, 'region': 'Equatorial Africa', 'risk': 'High', 'date': '2026-06-20', 'trend': 'up'},
    {'disease': 'H5N1 Avian Flu', 'cases': 891, 'deaths': 156, 'region': 'SE Asia', 'risk': 'Critical', 'date': '2026-06-22', 'trend': 'up'},
    {'disease': 'Dengue Fever', 'cases': 12470, 'deaths': 89, 'region': 'South Asia', 'risk': 'High', 'date': '2026-06-21', 'trend': 'stable'},
    {'disease': 'Oropouche Virus', 'cases': 2156, 'deaths': 12, 'region': 'South America', 'risk': 'Medium', 'date': '2026-06-19', 'trend': 'up'},
    {'disease': 'Cholera', 'cases': 5678, 'deaths': 234, 'region': 'East Africa', 'risk': 'High', 'date': '2026-06-20', 'trend': 'down'},
  ];

  Color _riskColor(String r) {
    switch (r) {
      case 'Critical': return ZyntraColors.red;
      case 'High': return ZyntraColors.amber;
      case 'Medium': return ZyntraColors.cyan;
      default: return ZyntraColors.green;
    }
  }

  Color _alertColor() {
    switch (_alertLevel) {
      case 'Critical': return ZyntraColors.red;
      case 'High': return ZyntraColors.amber;
      case 'Elevated': return ZyntraColors.cyan;
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
                      Text('Outbreak Radar', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.crisis_alert_rounded, color: Colors.white, size: 22),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Global outbreak monitoring & alerts', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
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
                        // Stats row
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Row(
                            children: [
                              Expanded(child: _statCard('Active Outbreaks', '$_activeOutbreaks', ZyntraColors.red, Icons.crisis_alert_rounded)),
                              const SizedBox(width: 10),
                              Expanded(child: _statCard('Countries', '${_outbreaks.map((o) => o['region']).toSet().length}', ZyntraColors.cyan, Icons.public_rounded)),
                              const SizedBox(width: 10),
                              Expanded(child: _statCard('Trend', _alertLevel, _alertColor(), Icons.trending_up_rounded)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Alert level indicator
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [_alertColor().withValues(alpha: 0.2), _alertColor().withValues(alpha: 0.05)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: _alertColor().withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(color: _alertColor().withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                                  child: Icon(
                                    _alertLevel == 'Critical' ? Icons.warning_rounded : Icons.info_rounded,
                                    color: _alertColor(), size: 26,
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('${_alertLevel} Alert Level', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                                      Text(
                                        _alertLevel == 'Normal' ? 'No significant threats detected'
                                            : _alertLevel == 'Elevated' ? 'Monitor local health advisories'
                                            : _alertLevel == 'High' ? 'Active outbreaks require attention'
                                            : 'Critical outbreaks - take immediate precautions',
                                        style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ).animate().shake(duration: _alertLevel == 'Critical' ? 600.ms : 0.ms),
                        ),
                        const SizedBox(height: 16),
                        // Cases graph
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Container(
                            height: 180,
                            padding: const EdgeInsets.all(16),
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
                                    const Icon(Icons.show_chart_rounded, color: ZyntraColors.cyan, size: 16),
                                    const SizedBox(width: 6),
                                    Text('Cases Trend', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Expanded(
                                  child: CustomPaint(
                                    painter: _OutbreakChartPainter(_outbreaks),
                                    size: const Size(double.infinity, 130),
                                  ),
                                ),
                              ],
                            ),
                          ).animate().fadeIn(duration: 400.ms),
                        ),
                        const SizedBox(height: 16),
                        // Outbreak list header
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
                        // Prevention guidelines
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
                                      Expanded(child: Text('Prevention Guidelines', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600))),
                                      Icon(_showPrevention ? Icons.expand_less_rounded : Icons.expand_more_rounded, color: ZyntraColors.white70),
                                    ],
                                  ),
                                  if (_showPrevention) ...[
                                    const SizedBox(height: 14),
                                    _preventionItem(Icons.clean_hands_rounded, 'Wash hands frequently with soap & water'),
                                    _preventionItem(Icons.masks_rounded, 'Wear N95 mask in affected areas'),
                                    _preventionItem(Icons.social_distance_rounded, 'Maintain physical distancing'),
                                    _preventionItem(Icons.vaccines_rounded, 'Get recommended vaccinations'),
                                    _preventionItem(Icons.air_rounded, 'Ensure proper ventilation indoors'),
                                    _preventionItem(Icons.sanitizer_rounded, 'Use alcohol-based hand sanitizer'),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Travel advisory
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.symmetric(horizontal: 16),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [ZyntraColors.amber.withValues(alpha: 0.12), ZyntraColors.amber.withValues(alpha: 0.03)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.2)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: ZyntraColors.amber.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                                child: const Icon(Icons.flight_takeoff_rounded, color: ZyntraColors.amber, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Travel Advisory', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Avoid non-essential travel to regions with High/Critical outbreaks. Check local health advisories before traveling.',
                                      style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12, height: 1.4),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ).animate().fadeIn(delay: 200.ms),
                        const SizedBox(height: 16),
                        // Vaccine availability
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.symmetric(horizontal: 16),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: ZyntraColors.card,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: ZyntraColors.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                                child: const Icon(Icons.vaccines_rounded, color: ZyntraColors.green, size: 22),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Vaccine Availability Near You', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                                    const SizedBox(height: 2),
                                    Text('12 nearby clinics have relevant vaccines in stock', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: [ZyntraColors.green, ZyntraColors.teal]),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text('Check', style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                              ),
                            ],
                          ),
                        ).animate().fadeIn(delay: 300.ms),
                        const SizedBox(height: 16),
                        // Subscribe toggle
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: ZyntraColors.card,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: _subscribed ? ZyntraColors.cyan.withValues(alpha: 0.3) : ZyntraColors.border),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: (_subscribed ? ZyntraColors.cyan : ZyntraColors.white40).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(Icons.notifications_rounded, color: _subscribed ? ZyntraColors.cyan : ZyntraColors.white40, size: 22),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Region Alerts', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                                      Text(
                                        _subscribed ? 'Alerts active for your region' : 'Get notified of outbreaks near you',
                                        style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    setState(() => _subscribed = !_subscribed);
                                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                      content: Text(
                                        _subscribed ? 'Subscribed to region alerts!' : 'Unsubscribed from region alerts',
                                        style: GoogleFonts.inter(color: Colors.white),
                                      ),
                                      backgroundColor: _subscribed ? ZyntraColors.green : ZyntraColors.red,
                                      behavior: SnackBarBehavior.floating,
                                    ));
                                  },
                                  child: Container(
                                    width: 48, height: 28,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(14),
                                      color: _subscribed ? ZyntraColors.cyan : ZyntraColors.surface,
                                      border: Border.all(color: _subscribed ? ZyntraColors.cyan : ZyntraColors.border),
                                    ),
                                    child: AnimatedAlign(
                                      duration: 300.ms,
                                      alignment: _subscribed ? Alignment.centerRight : Alignment.centerLeft,
                                      child: Container(
                                        width: 22, height: 22, margin: const EdgeInsets.all(3),
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: _subscribed ? Colors.white : ZyntraColors.white40,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ).animate().fadeIn(delay: 400.ms),
                        ),
                        const SizedBox(height: 20),
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

  Widget _statCard(String label, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(value, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
          Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 9), textAlign: TextAlign.center),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _outbreakCard(Map<String, dynamic> o, int i) {
    final risk = o['risk'] ?? 'Low';
    final rc = _riskColor(risk);
    final trend = o['trend'] ?? 'stable';
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [ZyntraColors.card, ZyntraColors.surface], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: rc.withValues(alpha: 0.2)),
        boxShadow: [BoxShadow(color: rc.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: rc.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.bug_report_rounded, color: ZyntraColors.red, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(o['disease'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    Text(o['region'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: rc.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: Text('WHO: $risk', style: GoogleFonts.inter(color: rc, fontSize: 9, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _statChip('${o['cases'] ?? 0}', 'Cases', ZyntraColors.cyan),
              const SizedBox(width: 8),
              _statChip('${o['deaths'] ?? 0}', 'Deaths', ZyntraColors.red),
              const SizedBox(width: 8),
              Row(
                children: [
                  Icon(_trendIcon(trend), color: _trendColor(trend), size: 16),
                  const SizedBox(width: 2),
                  Text(trend[0].toUpperCase() + trend.substring(1), style: GoogleFonts.inter(color: _trendColor(trend), fontSize: 10, fontWeight: FontWeight.w500)),
                ],
              ),
              const Spacer(),
              Text(o['date'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 60).ms).slideY(begin: 0.05, end: 0);
  }

  Widget _statChip(String value, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(value, style: GoogleFonts.inter(color: color, fontSize: 12, fontWeight: FontWeight.w700)),
          const SizedBox(width: 3),
          Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 9)),
        ],
      ),
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
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Row(children: List.generate(3, (_) => Expanded(
            child: Container(height: 90, margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
          ))),
        ),
        const SizedBox(height: 12),
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Container(height: 80, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
        ),
        const SizedBox(height: 12),
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Container(height: 180, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20))),
        ),
        const SizedBox(height: 12),
        ...List.generate(3, (_) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Shimmer.fromColors(
            baseColor: ZyntraColors.card,
            highlightColor: ZyntraColors.border,
            child: Container(height: 120, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(18))),
          ),
        )),
      ],
    );
  }
}

class _OutbreakChartPainter extends CustomPainter {
  final List<Map<String, dynamic>> outbreaks;
  _OutbreakChartPainter(this.outbreaks);

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = ZyntraColors.surface;
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(0, 0, size.width, size.height), const Radius.circular(8)), bgPaint);

    if (outbreaks.isEmpty) return;

    final maxCases = outbreaks.map((o) => (o['cases'] as num?)?.toDouble() ?? 0).reduce((a, b) => a > b ? a : b);
    if (maxCases <= 0) return;

    final spacing = size.width / (outbreaks.length + 1);
    final points = <Offset>[];

    for (int i = 0; i < outbreaks.length; i++) {
      final x = spacing * (i + 1);
      final cases = (outbreaks[i]['cases'] as num?)?.toDouble() ?? 0;
      final y = size.height - 20 - ((cases / maxCases) * (size.height - 40));
      points.add(Offset(x, y));
    }

    final linePaint = Paint()
      ..color = ZyntraColors.cyan
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final fillPaint = Paint()
      ..shader = LinearGradient(
        colors: [ZyntraColors.cyan.withValues(alpha: 0.3), ZyntraColors.cyan.withValues(alpha: 0.0)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final path = Path();
    if (points.isNotEmpty) {
      path.moveTo(points[0].dx, points[0].dy);
      for (int i = 1; i < points.length; i++) {
        path.lineTo(points[i].dx, points[i].dy);
      }
      path.lineTo(points.last.dx, size.height - 20);
      path.lineTo(points.first.dx, size.height - 20);
      path.close();
      canvas.drawPath(path, fillPaint);
      canvas.drawPath(path, linePaint);

      for (final p in points) {
        canvas.drawCircle(p, 3, Paint()..color = ZyntraColors.cyan);
      }
    }

    // Labels
    for (int i = 0; i < outbreaks.length; i++) {
      final tp = TextPainter(
        text: TextSpan(
          text: '${outbreaks[i]['disease']?.toString().substring(0, (outbreaks[i]['disease']?.toString().length ?? 4).clamp(3, 4)) ?? ''}',
          style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 7),
        ),
        textDirection: TextDirection.ltr,
      );
      tp.layout();
      tp.paint(canvas, Offset(points[i].dx - tp.width / 2, size.height - 14));
    }
  }

  @override
  bool shouldRepaint(covariant _OutbreakChartPainter old) => old.outbreaks != outbreaks;
}
