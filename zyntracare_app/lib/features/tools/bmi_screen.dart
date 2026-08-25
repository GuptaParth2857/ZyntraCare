import 'dart:math';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:zyntracare/core/theme.dart';

class BmiScreen extends StatefulWidget {
  const BmiScreen({super.key});

  @override
  State<BmiScreen> createState() => _BmiScreenState();
}

class _BmiScreenState extends State<BmiScreen>
    with SingleTickerProviderStateMixin {
  double _height = 170;
  double _weight = 70;
  double? _bmi;
  String? _category;
  Color _categoryColor = ZyntraColors.cyan;
  late AnimationController _animCtrl;
  late Animation<double> _bounceAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _bounceAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.elasticOut);
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  void _calculateBmi() {
    final bmi = _weight / pow(_height / 100, 2);
    String category;
    Color color;

    if (bmi < 18.5) {
      category = 'Underweight';
      color = ZyntraColors.amber;
    } else if (bmi < 25) {
      category = 'Normal';
      color = ZyntraColors.green;
    } else if (bmi < 30) {
      category = 'Overweight';
      color = ZyntraColors.amber;
    } else {
      category = 'Obese';
      color = ZyntraColors.red;
    }

    setState(() {
      _bmi = bmi;
      _category = category;
      _categoryColor = color;
    });
    _animCtrl.forward(from: 0);
  }

  String get _bmiCategoryLabel {
    if (_bmi == null) return '';
    if (_bmi! < 18.5) return 'You are underweight. Consider a nutritious diet.';
    if (_bmi! < 25) return 'You are at a healthy weight. Keep it up!';
    if (_bmi! < 30) return 'You are overweight. Regular exercise is recommended.';
    return 'You are obese. Please consult a healthcare provider.';
  }

  List<String> get _healthTips {
    if (_bmi == null) return [];
    if (_bmi! < 18.5) {
      return [
        'Include protein-rich foods in your diet',
        'Eat smaller, frequent meals',
        'Add healthy fats like nuts and avocados',
        'Strength training can help build muscle',
      ];
    } else if (_bmi! < 25) {
      return [
        'Maintain a balanced diet',
        'Regular physical activity (30 min/day)',
        'Stay hydrated throughout the day',
        'Get adequate sleep each night',
      ];
    } else if (_bmi! < 30) {
      return [
        'Incorporate daily cardiovascular exercise',
        'Reduce processed food intake',
        'Control portion sizes during meals',
        'Consult a nutritionist for a plan',
      ];
    } else {
      return [
        'Seek professional medical guidance',
        'Start with low-impact exercises like walking',
        'Focus on gradual, sustainable weight loss',
        'Join a support group for motivation',
      ];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'BMI Calculator',
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
              _buildGaugeCard(),
              const SizedBox(height: 20),
              if (_bmi != null) _buildResultCard(),
              const SizedBox(height: 20),
              _buildSliderCard(
                icon: Icons.height_rounded,
                label: 'Height',
                value: _height,
                unit: 'cm',
                min: 100,
                max: 250,
                onChanged: (v) => setState(() => _height = v),
              ),
              const SizedBox(height: 16),
              _buildSliderCard(
                icon: Icons.monitor_weight_rounded,
                label: 'Weight',
                value: _weight,
                unit: 'kg',
                min: 30,
                max: 200,
                onChanged: (v) => setState(() => _weight = v),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _calculateBmi,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ZyntraColors.cyan,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Calculate BMI',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              if (_bmi != null) ...[
                const SizedBox(height: 24),
                _buildHealthTips(),
              ],
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGaugeCard() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: ZyntraColors.card.withValues(alpha: 0.55),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: ZyntraColors.border.withValues(alpha: 0.3),
            ),
          ),
          child: Column(
            children: [
              Text(
                'Your BMI',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: ZyntraColors.white70,
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 140,
                child: _bmi != null
                    ? PieChart(
                        PieChartData(
                          sections: [
                            PieChartSectionData(
                              value: _bmi!.clamp(10, 40).toDouble(),
                              color: _categoryColor,
                              radius: 50,
                              title: _bmi!.toStringAsFixed(1),
                              titleStyle: GoogleFonts.poppins(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            PieChartSectionData(
                              value: (40 - _bmi!.clamp(10, 40)).clamp(5, 30).toDouble(),
                              color: ZyntraColors.border.withValues(alpha: 0.3),
                              radius: 40,
                            ),
                          ],
                          sectionsSpace: 2,
                          centerSpaceRadius: 40,
                          startDegreeOffset: -90,
                        ),
                      )
                    : Center(
                        child: Text(
                          '--',
                          style: GoogleFonts.poppins(
                            fontSize: 36,
                            fontWeight: FontWeight.w700,
                            color: ZyntraColors.white70,
                          ),
                        ),
                      ),
              ),
              if (_bmi != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _categoryColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _categoryColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    _category!,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _categoryColor,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultCard() {
    return ScaleTransition(
      scale: _bounceAnim,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _categoryColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: _categoryColor.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, color: _categoryColor, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _bmiCategoryLabel,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: ZyntraColors.white70,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSliderCard({
    required IconData icon,
    required String label,
    required double value,
    required String unit,
    required double min,
    required double max,
    required ValueChanged<double> onChanged,
  }) {
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
                  Icon(icon, color: ZyntraColors.cyan, size: 22),
                  const SizedBox(width: 10),
                  Text(
                    label,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: ZyntraColors.white70,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${value.toInt()} $unit',
                    style: GoogleFonts.poppins(
                      fontSize: 20,
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
                  thumbShape: const RoundSliderThumbShape(
                    enabledThumbRadius: 8,
                  ),
                ),
                child: Slider(
                  value: value,
                  min: min,
                  max: max,
                  onChanged: onChanged,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHealthTips() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: double.infinity,
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
                  const Icon(
                    Icons.lightbulb_outline,
                    color: ZyntraColors.amber,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Health Tips',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ...List.generate(_healthTips.length, (i) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${i + 1}. ',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: ZyntraColors.cyan,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Expanded(
                        child: Text(
                          _healthTips[i],
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: ZyntraColors.white70,
                          ),
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
