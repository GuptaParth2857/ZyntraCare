import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:zyntracare/core/theme.dart';

class WaterIntakeScreen extends StatefulWidget {
  const WaterIntakeScreen({super.key});

  @override
  State<WaterIntakeScreen> createState() => _WaterIntakeScreenState();
}

class _WaterIntakeScreenState extends State<WaterIntakeScreen>
    with SingleTickerProviderStateMixin {
  double _dailyGoal = 2.0;
  double _currentIntake = 0.0;
  late AnimationController _animCtrl;
  late Animation<double> _progressAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _progressAnim = CurvedAnimation(
      parent: _animCtrl,
      curve: Curves.easeOutCubic,
    );
    _loadData();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final savedDate = prefs.getString('water_date') ?? '';
    if (savedDate != today) {
      await prefs.setString('water_date', today);
      await prefs.setDouble('water_intake', 0);
      await prefs.setDouble('water_goal', 2.0);
      setState(() {
        _currentIntake = 0;
        _dailyGoal = 2.0;
      });
    } else {
      setState(() {
        _currentIntake = prefs.getDouble('water_intake') ?? 0;
        _dailyGoal = prefs.getDouble('water_goal') ?? 2.0;
      });
    }
    _animCtrl.forward(from: 0);
  }

  Future<void> _addWater(double amount) async {
    final newIntake = _currentIntake + amount;
    setState(() => _currentIntake = newIntake);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('water_intake', newIntake);
    _animCtrl.forward(from: 0);
  }

  Future<void> _setGoal(double goal) async {
    setState(() => _dailyGoal = goal);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('water_goal', goal);
  }

  double get _progress => (_currentIntake / _dailyGoal).clamp(0.0, 1.0);

  List<_WaterEntry> get _todayEntries {
    final now = DateTime.now();
    final entries = <_WaterEntry>[];
    var remaining = _currentIntake;
    final amounts = [1.0, 0.5, 0.25];
    while (remaining > 0.01) {
      for (final a in amounts) {
        if (remaining >= a) {
          entries.add(_WaterEntry(
            amount: a,
            label: a == 1.0 ? 'Jug' : a == 0.5 ? 'Bottle' : 'Glass',
            icon: a == 1.0
                ? Icons.water_drop
                : a == 0.5
                    ? Icons.local_drink_rounded
                    : Icons.water_drop_outlined,
            time: now.subtract(Duration(minutes: entries.length * 15)),
          ));
          remaining -= a;
          break;
        }
      }
      if (remaining < 0.25) {
        entries.add(_WaterEntry(
          amount: remaining,
          label: 'Sip',
          icon: Icons.water_drop_outlined,
          time: now.subtract(Duration(minutes: entries.length * 15)),
        ));
        break;
      }
    }
    return entries.reversed.toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Water Intake',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: ZyntraColors.gradientBg),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: Column(
            children: [
              _buildGoalSlider(),
              const SizedBox(height: 20),
              _buildProgressCircle(),
              const SizedBox(height: 24),
              _buildAddButtons(),
              const SizedBox(height: 24),
              _buildHistory(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGoalSlider() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: ZyntraColors.border.withValues(alpha: 0.2),
            ),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  const Icon(Icons.flag_outlined, color: ZyntraColors.cyan, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Daily Goal',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: ZyntraColors.white70,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${_dailyGoal.toStringAsFixed(1)}L',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              SliderTheme(
                data: SliderTheme.of(context).copyWith(
                  activeTrackColor: ZyntraColors.cyan,
                  inactiveTrackColor: ZyntraColors.border,
                  thumbColor: ZyntraColors.cyan,
                  overlayColor: ZyntraColors.cyan.withValues(alpha: 0.15),
                  trackHeight: 4,
                  thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
                ),
                child: Slider(
                  value: _dailyGoal,
                  min: 1,
                  max: 5,
                  divisions: 16,
                  onChanged: _setGoal,
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('1L', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white40)),
                  Text('3L', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white40)),
                  Text('5L', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white40)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressCircle() {
    return AnimatedBuilder(
      animation: _progressAnim,
      builder: (context, child) {
        final displayProgress = _progress * _progressAnim.value;
        return ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 30),
              decoration: BoxDecoration(
                color: ZyntraColors.card.withValues(alpha: 0.55),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: ZyntraColors.border.withValues(alpha: 0.3),
                ),
              ),
              child: Column(
                children: [
                  SizedBox(
                    width: 180,
                    height: 180,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 180,
                          height: 180,
                          child: CircularProgressIndicator(
                            value: displayProgress,
                            strokeWidth: 14,
                            backgroundColor: ZyntraColors.border.withValues(alpha: 0.3),
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              ZyntraColors.cyan,
                            ),
                          ),
                        ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              '${(_currentIntake).toStringAsFixed(1)}L',
                              style: GoogleFonts.poppins(
                                fontSize: 32,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'of ${_dailyGoal.toStringAsFixed(1)}L',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: ZyntraColors.white70,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${(_progress * 100).toInt()}%',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: ZyntraColors.cyan,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildAddButtons() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: ZyntraColors.border.withValues(alpha: 0.2),
            ),
          ),
          child: Column(
            children: [
              Text(
                'Add Water',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: _addButton(
                      icon: Icons.water_drop_outlined,
                      label: 'Glass',
                      amount: 0.25,
                      color: ZyntraColors.cyan,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _addButton(
                      icon: Icons.local_drink_rounded,
                      label: 'Bottle',
                      amount: 0.5,
                      color: ZyntraColors.teal,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _addButton(
                      icon: Icons.water_drop,
                      label: 'Jug',
                      amount: 1.0,
                      color: ZyntraColors.indigo,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _addButton({
    required IconData icon,
    required String label,
    required double amount,
    required Color color,
  }) {
    return InkWell(
      onTap: () => _addWater(amount),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 6),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              '${amount.toStringAsFixed(2).replaceAll(RegExp(r'\.?0+$'), '')}L',
              style: GoogleFonts.inter(
                fontSize: 11,
                color: ZyntraColors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistory() {
    final entries = _todayEntries;
    if (entries.isEmpty && _currentIntake == 0) {
      return const SizedBox.shrink();
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: ZyntraColors.border.withValues(alpha: 0.2),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.history_rounded, color: ZyntraColors.white70, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    "Today's Intake",
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${entries.length} entries',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: ZyntraColors.white70,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ...List.generate(entries.length.clamp(0, 20), (i) {
                final entry = entries[i];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Icon(entry.icon, color: ZyntraColors.cyan, size: 18),
                      const SizedBox(width: 10),
                      Text(
                        entry.label,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: Colors.white,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '${entry.amount.toStringAsFixed(2)}L',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: ZyntraColors.white70,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        DateFormat('HH:mm').format(entry.time),
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: ZyntraColors.white40,
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}

class _WaterEntry {
  final double amount;
  final String label;
  final IconData icon;
  final DateTime time;

  const _WaterEntry({
    required this.amount,
    required this.label,
    required this.icon,
    required this.time,
  });
}


