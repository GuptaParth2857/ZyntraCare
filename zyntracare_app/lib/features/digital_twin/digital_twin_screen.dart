import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';

class DigitalTwinScreen extends StatefulWidget {
  const DigitalTwinScreen({super.key});
  @override State<DigitalTwinScreen> createState() => _DigitalTwinScreenState();
}

class _DigitalTwinScreenState extends State<DigitalTwinScreen> with TickerProviderStateMixin {
  bool _loading = true;
  double _healthScore = 85.0;
  late AnimationController _scoreCtrl;

  final _organs = [
    {'name': 'Heart', 'health': 85, 'icon': Icons.favorite_rounded, 'color': ZyntraColors.red},
    {'name': 'Lungs', 'health': 78, 'icon': Icons.air_rounded, 'color': ZyntraColors.cyan},
    {'name': 'Liver', 'health': 92, 'icon': Icons.blur_on_rounded, 'color': ZyntraColors.purple},
    {'name': 'Kidneys', 'health': 88, 'icon': Icons.water_drop_rounded, 'color': ZyntraColors.teal},
    {'name': 'Brain', 'health': 95, 'icon': Icons.psychology_rounded, 'color': ZyntraColors.indigo},
    {'name': 'Stomach', 'health': 72, 'icon': Icons.restaurant_rounded, 'color': ZyntraColors.amber},
  ];

  final Map<String, bool> _habits = {
    'Exercise': false, 'Sleep 8hrs': true, 'Water 2L+': true, 'Meditation': false,
    'Smoking': false, 'Alcohol': false, 'Junk Food': true, 'Stress': true,
  };

  final Map<String, _HabitEffect> _habitEffects = {
    'Exercise': _HabitEffect('Heart', 20),
    'Sleep 8hrs': _HabitEffect('Brain', 30),
    'Water 2L+': _HabitEffect('Kidneys', 25),
    'Meditation': _HabitEffect('Brain', 25),
    'Smoking': _HabitEffect('Lungs', -35),
    'Alcohol': _HabitEffect('Liver', -40),
    'Junk Food': _HabitEffect('Stomach', -30),
    'Stress': _HabitEffect('Brain', -25),
  };

  double _projectionYears = 1;

  // ignore: unused_element
  bool get _smoking => _habits['Smoking'] ?? false;
  // ignore: unused_element
  bool get _alcohol => _habits['Alcohol'] ?? false;
  // ignore: unused_element
  bool get _junkFood => _habits['Junk Food'] ?? false;
  // ignore: unused_element
  bool get _stress => _habits['Stress'] ?? false;

  double get _projectedScore {
    double base = _organs.fold(0.0, (sum, o) => sum + (o['health'] as num).toDouble()) / _organs.length;
    double delta = 0;
    _habits.forEach((name, enabled) {
      if (enabled) {
        final effect = _habitEffects[name]!;
        delta += effect.change;
      }
    });
    delta = delta * _projectionYears * 0.15;
    return (base + delta).clamp(0, 100);
  }

  final _biometrics = [
    {'label': 'Heart Rate', 'value': '72', 'unit': 'bpm', 'icon': Icons.favorite_rounded, 'color': ZyntraColors.red, 'status': 'Normal'},
    {'label': 'Blood Pressure', 'value': '118/78', 'unit': 'mmHg', 'icon': Icons.speed_rounded, 'color': ZyntraColors.cyan, 'status': 'Normal'},
    {'label': 'SpO2', 'value': '98', 'unit': '%', 'icon': Icons.air_rounded, 'color': ZyntraColors.teal, 'status': 'Excellent'},
    {'label': 'Glucose', 'value': '94', 'unit': 'mg/dL', 'icon': Icons.water_drop_rounded, 'color': ZyntraColors.purple, 'status': 'Normal'},
    {'label': 'Temperature', 'value': '98.6', 'unit': '\u00B0F', 'icon': Icons.thermostat_rounded, 'color': ZyntraColors.amber, 'status': 'Normal'},
  ];

  final _lifestyle = [
    {'label': 'Steps', 'value': '7,842', 'target': '10,000', 'icon': Icons.directions_walk_rounded, 'color': ZyntraColors.green, 'progress': 0.78},
    {'label': 'Sleep', 'value': '6.2', 'target': '8 hrs', 'icon': Icons.bedtime_rounded, 'color': ZyntraColors.indigo, 'progress': 0.78},
    {'label': 'Water', 'value': '4', 'target': '8 glasses', 'icon': Icons.water_drop_rounded, 'color': ZyntraColors.cyan, 'progress': 0.5},
    {'label': 'Exercise', 'value': '25', 'target': '45 min', 'icon': Icons.fitness_center_rounded, 'color': ZyntraColors.pink, 'progress': 0.56},
  ];

  @override
  void initState() {
    super.initState();
    _scoreCtrl = AnimationController(vsync: this, duration: 2000.ms);
    Future.delayed(1500.ms, () {
      if (mounted) {
        setState(() => _loading = false);
        _scoreCtrl.forward();
      }
    });
  }

  @override
  void dispose() {
    _scoreCtrl.dispose();
    super.dispose();
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
              const SizedBox(height: 24),
              _buildAvatarAndScore(),
              const SizedBox(height: 28),
              _buildBiometricsSection(),
              const SizedBox(height: 24),
              _buildLifestyleSection(),
              const SizedBox(height: 24),
              _buildInsightsSection(),
              const SizedBox(height: 24),
              _buildActionsSection(),
              const SizedBox(height: 24),
              _buildOrgansSection(),
              const SizedBox(height: 24),
              _buildHabitToggles(),
              const SizedBox(height: 24),
              _buildTimeProjection(),
              const SizedBox(height: 24),
              _buildProjectedScore(),
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
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Digital Twin', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
            Text('Your AI Health Replica', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
          ],
        ),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: ZyntraColors.green.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.2)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 6, height: 6, decoration: const BoxDecoration(shape: BoxShape.circle, color: ZyntraColors.green)),
              const SizedBox(width: 6),
              Text('Synced', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 11, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.05, end: 0);
  }

  Widget _buildAvatarAndScore() {
    return Row(
      children: [
        // Avatar
        Container(
          width: 100, height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
            boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.2), blurRadius: 20, spreadRadius: 2)],
          ),
          child: const CircleAvatar(
            radius: 50,
            backgroundColor: Colors.transparent,
            child: Icon(Icons.person_rounded, color: Colors.white, size: 52),
          ),
        ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),

        const SizedBox(width: 24),

        // Health Score Gauge
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Column(
              children: [
                AnimatedBuilder(
                  animation: _scoreCtrl,
                  builder: (_, __) {
                    final score = _healthScore * _scoreCtrl.value;
                    return SizedBox(
                      width: 80, height: 80,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          CircularProgressIndicator(
                            value: score / 100,
                            strokeWidth: 6,
                            backgroundColor: ZyntraColors.border,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              score > 80 ? ZyntraColors.green : (score > 60 ? ZyntraColors.amber : ZyntraColors.red),
                            ),
                          ),
                          Text('${score.round()}', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    );
                  },
                ),
                const SizedBox(height: 8),
                Text('Health Score', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              ],
            ),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildBiometricsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.monitor_heart_rounded, color: ZyntraColors.cyan, size: 20),
            const SizedBox(width: 8),
            Text('Biometric Data', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: _biometrics.sublist(0, 3).map((b) => Expanded(
            child: _buildBiometricCard(b),
          )).toList(),
        ),
        const SizedBox(height: 10),
        Row(
          children: _biometrics.sublist(3).map((b) => Expanded(
            child: _buildBiometricCard(b),
          )).toList(),
        ),
      ],
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }

  Widget _buildBiometricCard(Map<String, dynamic> b) {
    final statusColor = b['status'] == 'Excellent' ? ZyntraColors.green : ZyntraColors.white70;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        children: [
          Icon(b['icon'] as IconData, color: b['color'] as Color, size: 22),
          const SizedBox(height: 8),
          Text(b['value'] as String, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
          Text(b['unit'] as String, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
          const SizedBox(height: 4),
          Text(b['label'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 9)),
          if (b['status'] != null) ...[
            const SizedBox(height: 2),
            Text(b['status'] as String, style: GoogleFonts.inter(color: statusColor, fontSize: 8, fontWeight: FontWeight.w600)),
          ],
        ],
      ),
    );
  }

  Widget _buildLifestyleSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Lifestyle Metrics', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 14),
        ..._lifestyle.map((l) => Container(
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
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (l['color'] as Color).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(l['icon'] as IconData, color: l['color'] as Color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(l['label'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
                        const Spacer(),
                        Text('${l['value']} / ${l['target']}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: l['progress'] as double,
                        backgroundColor: ZyntraColors.border,
                        valueColor: AlwaysStoppedAnimation<Color>(l['color'] as Color),
                        minHeight: 4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        )).toList(),
      ],
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  Widget _buildInsightsSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.amber.withValues(alpha: 0.08), ZyntraColors.amber.withValues(alpha: 0.02)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.15)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ZyntraColors.amber.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.lightbulb_rounded, color: ZyntraColors.amber, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI Insights', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(
                  'Your cardiovascular health needs attention. '
                  'Consider increasing daily step count to 10,000 and monitoring BP regularly. '
                  'Schedule a cardiac check-up if symptoms persist.',
                  style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12, height: 1.5),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms, duration: 300.ms);
  }

  Widget _buildActionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: double.infinity,
          child: GestureDetector(
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Health profile update started!', style: GoogleFonts.inter(color: Colors.white)),
                backgroundColor: ZyntraColors.green,
                behavior: SnackBarBehavior.floating,
              ),
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.edit_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text('Update Health Profile', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),
        Center(
          child: Text('Last synced: 2 minutes ago', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
        ),
      ],
    ).animate().fadeIn(delay: 400.ms, duration: 300.ms);
  }

  Widget _buildOrgansSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.biotech_rounded, color: ZyntraColors.red, size: 20),
            const SizedBox(width: 8),
            Text('Organs', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: _organs.sublist(0, 3).map((o) => Expanded(
            child: _buildOrganCard(o),
          )).toList(),
        ),
        const SizedBox(height: 10),
        Row(
          children: _organs.sublist(3).map((o) => Expanded(
            child: _buildOrganCard(o),
          )).toList(),
        ),
      ],
    );
  }

  Widget _buildOrganCard(Map<String, dynamic> organ) {
    final health = (organ['health'] as num).toDouble();
    final color = organ['color'] as Color;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        children: [
          Icon(organ['icon'] as IconData, color: color, size: 22),
          const SizedBox(height: 8),
          Text('${health.round()}%', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: health / 100,
              backgroundColor: ZyntraColors.border,
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 4,
            ),
          ),
          const SizedBox(height: 4),
          Text(organ['name'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 9)),
        ],
      ),
    );
  }

  Widget _buildHabitToggles() {
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
              const Icon(Icons.toggle_on_rounded, color: ZyntraColors.purple, size: 20),
              const SizedBox(width: 8),
              Text('Habit Toggles', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text('${_habits.values.where((v) => v).length} active', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
            ],
          ),
          const SizedBox(height: 14),
          ..._habits.entries.map((entry) {
            final effect = _habitEffects[entry.key]!;
            final isPositive = effect.change > 0;
            return Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.3))),
              ),
              child: Row(
                children: [
                  Icon(
                    entry.key == 'Exercise' ? Icons.fitness_center_rounded :
                    entry.key == 'Sleep 8hrs' ? Icons.bedtime_rounded :
                    entry.key == 'Water 2L+' ? Icons.water_drop_rounded :
                    entry.key == 'Meditation' ? Icons.self_improvement_rounded :
                    entry.key == 'Smoking' ? Icons.smoking_rooms_rounded :
                    entry.key == 'Alcohol' ? Icons.liquor_rounded :
                    entry.key == 'Junk Food' ? Icons.fastfood_rounded :
                    Icons.psychology_rounded,
                    color: entry.value ? (isPositive ? ZyntraColors.green : ZyntraColors.red) : ZyntraColors.white40,
                    size: 18,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(entry.key, style: GoogleFonts.inter(color: entry.value ? Colors.white : ZyntraColors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
                        Text('${isPositive ? "+" : ""}${effect.change} ${effect.target}', style: GoogleFonts.inter(color: isPositive ? ZyntraColors.green : ZyntraColors.red, fontSize: 9)),
                      ],
                    ),
                  ),
                  Switch(
                    value: entry.value,
                    onChanged: (v) => setState(() => _habits[entry.key] = v),
                    activeColor: ZyntraColors.cyan,
                    activeTrackColor: ZyntraColors.cyan.withValues(alpha: 0.3),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildTimeProjection() {
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
              const Icon(Icons.timeline_rounded, color: ZyntraColors.cyan, size: 20),
              const SizedBox(width: 8),
              Text('Time Projection', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text('${_projectionYears.toInt()} yr${_projectionYears.toInt() == 1 ? '' : 's'}', style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 16, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 14),
          SliderTheme(
            data: SliderThemeData(
              activeTrackColor: ZyntraColors.cyan,
              inactiveTrackColor: ZyntraColors.border,
              thumbColor: ZyntraColors.cyan,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
              overlayColor: ZyntraColors.cyan.withValues(alpha: 0.15),
              valueIndicatorTextStyle: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
              valueIndicatorColor: ZyntraColors.cyan,
            ),
            child: Slider(
              value: _projectionYears,
              min: 1,
              max: 10,
              divisions: 9,
              label: '${_projectionYears.toInt()} years',
              onChanged: (v) => setState(() => _projectionYears = v),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('1 year', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
              Text('5 years', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
              Text('10 years', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline_rounded, color: ZyntraColors.cyan, size: 16),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Current habits compound over time. Positive habits boost organ health, negative ones degrade it.',
                    style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProjectedScore() {
    final score = _projectedScore;
    final scoreColor = score > 80 ? ZyntraColors.green : (score > 60 ? ZyntraColors.amber : ZyntraColors.red);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [scoreColor.withValues(alpha: 0.08), scoreColor.withValues(alpha: 0.02)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: scoreColor.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 72, height: 72,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CircularProgressIndicator(
                  value: score / 100,
                  strokeWidth: 5,
                  backgroundColor: ZyntraColors.border,
                  valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
                ),
                Text('${score.round()}', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Projected Health Score', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(
                  'Over ${_projectionYears.toInt()} year${_projectionYears.toInt() == 1 ? '' : 's'} with current habits',
                  style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(
                      score > _organs.fold(0.0, (s, o) => s + (o['health'] as num).toDouble()) / _organs.length
                          ? Icons.trending_up_rounded : Icons.trending_down_rounded,
                      color: scoreColor, size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      score > _organs.fold(0.0, (s, o) => s + (o['health'] as num).toDouble()) / _organs.length
                          ? 'Improving' : 'Declining',
                      style: GoogleFonts.inter(color: scoreColor, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
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
            Container(height: 40, width: 180, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12))),
            const SizedBox(height: 20),
            Row(children: [
              Container(width: 100, height: 100, decoration: BoxDecoration(shape: BoxShape.circle, color: ZyntraColors.card)),
              const SizedBox(width: 24),
              Expanded(child: Container(height: 140, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20)))),
            ]),
            const SizedBox(height: 20),
            Container(height: 30, width: 160, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(8))),
            const SizedBox(height: 14),
            Row(
              children: List.generate(3, (_) {
                return Expanded(
                  child: Container(
                    height: 110,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14)),
                  ),
                );
              }),
            ),
            const SizedBox(height: 20),
            ...List.generate(4, (_) {
              return Container(
                height: 70,
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _HabitEffect {
  final String target;
  final int change;
  const _HabitEffect(this.target, this.change);
}
