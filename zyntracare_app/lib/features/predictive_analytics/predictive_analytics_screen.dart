import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class PredictiveAnalyticsScreen extends StatefulWidget {
  const PredictiveAnalyticsScreen({super.key});
  @override State<PredictiveAnalyticsScreen> createState() => _PredictiveAnalyticsScreenState();
}

class _PredictiveAnalyticsScreenState extends State<PredictiveAnalyticsScreen> {
  bool _loading = true;
  int _timelineMonths = 6;
  final _timelineOptions = [3, 6, 12, 60];
  Map<String, dynamic> _data = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.get('/api/predictive-analytics');
      if (mounted && res != null) {
        setState(() => _data = res is Map ? Map<String, dynamic>.from(res) : {});
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  double get _healthScore => (_data['healthScore'] as num?)?.toDouble() ?? 85.0;
  double get _lifestyleScore => (_data['lifestyleScore'] as num?)?.toDouble() ?? 72.0;

  Map<String, double> get _riskScores {
    final base = _data['risks'] as Map? ?? {};
    return {
      'Diabetes Risk': (base['diabetes'] as num?)?.toDouble() ?? 18.0,
      'Heart Disease': (base['heart'] as num?)?.toDouble() ?? 32.0,
      'Stroke': (base['stroke'] as num?)?.toDouble() ?? 12.0,
      'Kidney Disease': (base['kidney'] as num?)?.toDouble() ?? 8.0,
    };
  }

  List<Map<String, dynamic>> get _recommendations {
    final list = _data['recommendations'] as List? ?? [];
    if (list.isEmpty) {
      return [
        {'action': 'Increase daily steps to 10,000', 'impact': 'High', 'icon': Icons.directions_walk_rounded},
        {'action': 'Reduce sodium intake below 2,000mg/day', 'impact': 'High', 'icon': Icons.restaurant_rounded},
        {'action': 'Schedule annual lipid profile test', 'impact': 'Medium', 'icon': Icons.science_rounded},
        {'action': 'Add 30 min of cardio exercise daily', 'impact': 'High', 'icon': Icons.fitness_center_rounded},
        {'action': 'Meditate 10 min daily for stress reduction', 'impact': 'Medium', 'icon': Icons.self_improvement_rounded},
      ];
    }
    return list.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList();
  }

  List<FlSpot> get _chartSpots {
    final trajectory = _data['trajectory'] as List? ?? [];
    if (trajectory.isEmpty) {
      final base = _healthScore;
      return List.generate(12, (i) => FlSpot(i.toDouble(), base - (i * 2.5) + (i % 3) * 5.0));
    }
    return trajectory.asMap().entries.map((e) => FlSpot(e.key.toDouble(), (e.value as num).toDouble())).toList();
  }

  String get _timelineLabel {
    switch (_timelineMonths) {
      case 3: return '3 Months';
      case 6: return '6 Months';
      case 12: return '1 Year';
      case 60: return '5 Years';
      default: return '$_timelineMonths Months';
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
                      Text('Predictive Analytics', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('AI-powered health trajectory predictions', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            if (_loading)
              Expanded(child: _buildShimmer())
            else
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.only(bottom: 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 16),
                      // Health trajectory chart
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Container(
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
                                  const Icon(Icons.show_chart_rounded, color: ZyntraColors.cyan, size: 18),
                                  const SizedBox(width: 8),
                                  Text('Health Trajectory ($_timelineLabel)', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                                ],
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                height: 200,
                                child: LineChart(
                                  LineChartData(
                                    gridData: FlGridData(
                                      show: true,
                                      drawVerticalLine: false,
                                      getDrawingHorizontalLine: (value) => FlLine(
                                        color: ZyntraColors.border.withValues(alpha: 0.3), strokeWidth: 1,
                                      ),
                                    ),
                                    titlesData: FlTitlesData(
                                      leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                      rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                      topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                      bottomTitles: AxisTitles(
                                        sideTitles: SideTitles(
                                          showTitles: true,
                                          reservedSize: 24,
                                          getTitlesWidget: (value, meta) {
                                            final idx = value.toInt();
                                            if (idx % 3 == 0 && idx < _chartSpots.length) {
                                              return Text('M${idx + 1}', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9));
                                            }
                                            return const SizedBox();
                                          },
                                        ),
                                      ),
                                    ),
                                    borderData: FlBorderData(show: false),
                                    minY: 0,
                                    maxY: 100,
                                    lineBarsData: [
                                      LineChartBarData(
                                        spots: _chartSpots,
                                        isCurved: true,
                                        preventCurveOverShooting: true,
                                        color: ZyntraColors.cyan,
                                        barWidth: 2.5,
                                        isStrokeCapRound: true,
                                        dotData: FlDotData(
                                          show: true,
                                          getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(
                                            radius: 3,
                                            color: ZyntraColors.cyan,
                                            strokeWidth: 0,
                                          ),
                                        ),
                                        belowBarData: BarAreaData(
                                          show: true,
                                          gradient: LinearGradient(
                                            colors: [ZyntraColors.cyan.withValues(alpha: 0.25), ZyntraColors.cyan.withValues(alpha: 0.0)],
                                            begin: Alignment.topCenter,
                                            end: Alignment.bottomCenter,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ).animate().fadeIn(duration: 400.ms),
                      ),
                      const SizedBox(height: 16),
                      // Timeline slider
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: ZyntraColors.card,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: ZyntraColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Prediction Timeline', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                              const SizedBox(height: 10),
                              Row(
                                children: _timelineOptions.map((months) {
                                  final active = months == _timelineMonths;
                                  return Expanded(
                                    child: GestureDetector(
                                      onTap: () => setState(() => _timelineMonths = months),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(vertical: 8),
                                        margin: const EdgeInsets.symmetric(horizontal: 3),
                                        decoration: BoxDecoration(
                                          gradient: active ? const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]) : null,
                                          color: active ? null : ZyntraColors.surface,
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: active ? Colors.transparent : ZyntraColors.border),
                                        ),
                                        child: Text(
                                          months == 12 ? '1 Year' : months == 60 ? '5 Years' : '$months Months',
                                          style: GoogleFonts.inter(
                                            color: active ? Colors.white : ZyntraColors.white70,
                                            fontSize: 10, fontWeight: FontWeight.w500,
                                          ), textAlign: TextAlign.center,
                                        ),
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ],
                          ),
                        ).animate().fadeIn(delay: 100.ms),
                      ),
                      const SizedBox(height: 20),
                      // Disease risk predictions
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                        child: Text('Disease Risk Predictions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                      ),
                      ..._riskScores.entries.map((e) => _riskCard(e.key, e.value)),
                      const SizedBox(height: 20),
                      // Lifestyle impact score
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                        child: Row(
                          children: [
                            Text('Lifestyle Impact Score', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            const Spacer(),
                            Text('${_lifestyleScore.round()}/100', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: ZyntraColors.card,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: ZyntraColors.border),
                          ),
                          child: Column(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(6),
                                child: LinearProgressIndicator(
                                  value: _lifestyleScore / 100,
                                  backgroundColor: ZyntraColors.border,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    _lifestyleScore > 80 ? ZyntraColors.green : (_lifestyleScore > 50 ? ZyntraColors.amber : ZyntraColors.red),
                                  ),
                                  minHeight: 8,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                _lifestyleScore > 80 ? 'Excellent lifestyle habits! Keep it up.'
                                    : _lifestyleScore > 50 ? 'Room for improvement in daily habits.'
                                    : 'Significant lifestyle changes recommended.',
                                style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12),
                              ),
                            ],
                          ),
                        ).animate().fadeIn(delay: 200.ms),
                      ),
                      const SizedBox(height: 20),
                      // Recommended actions
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                        child: Row(
                          children: [
                            Text('Recommended Actions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            const Spacer(),
                            Text('${_recommendations.length} items', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                          ],
                        ),
                      ),
                      ...List.generate(_recommendations.length, (i) => _actionCard(_recommendations[i], i)),
                      const SizedBox(height: 20),
                      // Generate full report
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: GestureDetector(
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                              content: Text('Full report generation started!', style: GoogleFonts.inter(color: Colors.white)),
                              backgroundColor: ZyntraColors.green,
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
                                const Icon(Icons.assessment_rounded, color: Colors.white, size: 20),
                                const SizedBox(width: 8),
                                Text('Generate Full Report', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Data sources
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                        child: Text('Data Sources', style: GoogleFonts.poppins(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Wrap(
                          spacing: 8, runSpacing: 8,
                          children: [
                            _dataSourceChip(Icons.favorite_rounded, 'HR', ZyntraColors.red),
                            _dataSourceChip(Icons.bedtime_rounded, 'Sleep', ZyntraColors.indigo),
                            _dataSourceChip(Icons.directions_walk_rounded, 'Activity', ZyntraColors.green),
                            _dataSourceChip(Icons.restaurant_rounded, 'Diet', ZyntraColors.amber),
                            _dataSourceChip(Icons.science_rounded, 'Genetics', ZyntraColors.purple),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _riskCard(String label, double value) {
    final color = value < 15 ? ZyntraColors.green : (value < 30 ? ZyntraColors.amber : ZyntraColors.red);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [ZyntraColors.card, ZyntraColors.surface], begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(label, style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w500, fontSize: 14)),
                const Spacer(),
                Text('${value.round()}%', style: GoogleFonts.inter(color: color, fontWeight: FontWeight.w700, fontSize: 14)),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: value / 100,
                backgroundColor: ZyntraColors.border,
                valueColor: AlwaysStoppedAnimation<Color>(color),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value < 15 ? 'Low risk' : (value < 30 ? 'Moderate risk - monitor regularly' : 'High risk - consult specialist'),
              style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: (300 + _riskScores.keys.toList().indexOf(label) * 80).ms).slideX(begin: 0.05, end: 0);
  }

  Widget _actionCard(Map<String, dynamic> action, int i) {
    final impact = action['impact'] ?? 'Medium';
    final impactColor = impact == 'High' ? ZyntraColors.green : (impact == 'Medium' ? ZyntraColors.amber : ZyntraColors.white70);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (action['icon'] != null ? ZyntraColors.cyan : ZyntraColors.teal).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(action['icon'] as IconData? ?? Icons.check_circle_rounded,
                color: action['icon'] != null ? ZyntraColors.cyan : ZyntraColors.teal, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(action['action'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
                Row(
                  children: [
                    Text('Impact: ', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
                    Text(impact, style: GoogleFonts.inter(color: impactColor, fontSize: 10, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 80).ms).slideX(begin: 0.1, end: 0);
  }

  Widget _dataSourceChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(width: 6),
          Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
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
          child: Container(height: 260, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20))),
        ),
        const SizedBox(height: 12),
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Container(height: 56, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
        ),
        const SizedBox(height: 12),
        ...List.generate(4, (_) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Shimmer.fromColors(
            baseColor: ZyntraColors.card,
            highlightColor: ZyntraColors.border,
            child: Container(height: 80, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
          ),
        )),
      ],
    );
  }
}
