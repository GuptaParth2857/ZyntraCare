import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../providers/health_provider.dart';

class HealthTrackerScreen extends StatefulWidget {
  const HealthTrackerScreen({super.key});
  @override State<HealthTrackerScreen> createState() => _HealthTrackerScreenState();
}

class _HealthTrackerScreenState extends State<HealthTrackerScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<HealthProvider>();
      if (p.healthData == null) p.loadHealthData();
    });
  }

  final _metrics = [
    _MetricDef('Heart Rate', 'bpm', Icons.favorite_rounded, ZyntraColors.red, 'heartRate', 'heartRate'),
    _MetricDef('Blood Pressure', 'mmHg', Icons.speed_rounded, ZyntraColors.cyan, 'bloodPressure', 'bloodPressure'),
    _MetricDef('Blood Sugar', 'mg/dL', Icons.water_drop_rounded, ZyntraColors.purple, 'bloodSugar', 'bloodSugar'),
    _MetricDef('Temperature', '\u00B0F', Icons.thermostat_rounded, ZyntraColors.amber, 'temperature', 'temperature'),
    _MetricDef('Oxygen Level', '%', Icons.air_rounded, ZyntraColors.teal, 'oxygenLevel', 'oxygenLevel'),
    _MetricDef('Weight', 'kg', Icons.monitor_weight_rounded, ZyntraColors.green, 'weight', 'weight'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<HealthProvider>(
          builder: (ctx, provider, _) {
            return Column(
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
                      Text('Health Tracker', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      GestureDetector(
                        onTap: _showAddReading,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.add_rounded, color: Colors.white, size: 22),
                        ),
                      ),
                    ],
                  ),
                ),
                if (provider.loading && provider.healthData == null)
                  Expanded(child: _buildShimmer())
                else
                  Expanded(
                    child: RefreshIndicator(
                      color: ZyntraColors.cyan,
                      backgroundColor: ZyntraColors.card,
                      onRefresh: provider.loadHealthData,
                      child: ListView(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        children: [
                          // Overview summary
                          _buildSummaryCard(provider.healthData),
                          const SizedBox(height: 20),
                          Text('Vitals Overview', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 14),
                          ..._metrics.map((m) => _buildMetricCard(m, provider)),
                          const SizedBox(height: 24),
                          GestureDetector(
                            onTap: _showAddReading,
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                              ),
                              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                                const Icon(Icons.add_rounded, color: Colors.white, size: 20),
                                const SizedBox(width: 8),
                                Text('Add New Reading', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                              ]),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildSummaryCard(Map<String, dynamic>? data) {
    final score = data?['healthScore'] ?? 85;
    final trend = data?['trend'] ?? 'stable';
    final trendColor = trend == 'improving' ? ZyntraColors.green : (trend == 'declining' ? ZyntraColors.red : ZyntraColors.amber);
    final trendIcon = trend == 'improving' ? Icons.trending_up_rounded : (trend == 'declining' ? Icons.trending_down_rounded : Icons.trending_flat_rounded);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: ZyntraColors.border),
        boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.06), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 80, height: 80,
                child: CircularProgressIndicator(
                  value: score / 100,
                  strokeWidth: 6,
                  backgroundColor: ZyntraColors.border,
                  valueColor: const AlwaysStoppedAnimation<Color>(ZyntraColors.cyan),
                ),
              ),
              Text('$score', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Health Score', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                const SizedBox(height: 4),
                Text('Your health is looking good!', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(trendIcon, color: trendColor, size: 16),
                    const SizedBox(width: 4),
                    Text(trend.toUpperCase(), style: GoogleFonts.inter(color: trendColor, fontSize: 11, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 12),
                    Container(width: 1, height: 12, color: ZyntraColors.border),
                    const SizedBox(width: 12),
                    Text('Updated today', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildMetricCard(_MetricDef m, HealthProvider provider) {
    final val = provider.healthData?[m.key] ?? _getDefaultValue(m.key);
    final display = val != null ? val.toString() : '--';
    final unitVal = (val is num) ? val : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: m.color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
            child: Icon(m.icon, color: m.color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(m.label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Text(display, style: GoogleFonts.inter(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                    const SizedBox(width: 4),
                    Text(m.unit, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          if (unitVal != null)
            Container(
              width: 4, height: 40,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [m.color.withValues(alpha: 0.5), m.color],
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                ),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms).slideX(begin: 0.05, end: 0);
  }

  String? _getDefaultValue(String key) {
    const defaults = {
      'heartRate': '78',
      'bloodPressure': '120/80',
      'bloodSugar': '100',
      'temperature': '98.6',
      'oxygenLevel': '98',
      'weight': '70',
    };
    return defaults[key];
  }

  void _showAddReading() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.65,
        decoration: const BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)),
                ),
              ),
              const SizedBox(height: 20),
              Text('Add New Reading', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 20),
              Expanded(
                child: ListView.separated(
                  itemCount: _metrics.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (_, i) {
                    final m = _metrics[i];
                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: ZyntraColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: ZyntraColors.border),
                      ),
                      child: Row(
                        children: [
                          Icon(m.icon, color: m.color, size: 22),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(m.label, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
                                Text(m.unit, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
                              ],
                            ),
                          ),
                          SizedBox(
                            width: 100,
                            child: TextField(
                              style: GoogleFonts.inter(color: Colors.white),
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: 'Value',
                                hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 13),
                                filled: true,
                                fillColor: ZyntraColors.card,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Reading saved!', style: GoogleFonts.inter(color: Colors.white)),
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
                  child: Center(
                    child: Text('Save Reading', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      children: [
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Container(height: 120, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(24))),
        ),
        const SizedBox(height: 20),
        ...List.generate(6, (_) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Shimmer.fromColors(
            baseColor: ZyntraColors.card,
            highlightColor: ZyntraColors.border,
            child: Container(height: 72, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
          ),
        )),
      ],
    );
  }
}

class _MetricDef {
  final String label;
  final String unit;
  final IconData icon;
  final Color color;
  final String key;
  final String chartKey;
  const _MetricDef(this.label, this.unit, this.icon, this.color, this.key, this.chartKey);
}
