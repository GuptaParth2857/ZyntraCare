import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class HealthRiskScreen extends StatefulWidget {
  const HealthRiskScreen({super.key});
  @override State<HealthRiskScreen> createState() => _HealthRiskScreenState();
}

class _HealthRiskScreenState extends State<HealthRiskScreen> with SingleTickerProviderStateMixin {
  final _ageCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _heightCtrl = TextEditingController();
  String _smoking = 'Never';
  String _alcohol = 'Never';
  String _exercise = 'Daily';
  final Set<String> _familyHistory = {};
  final Set<String> _existingConditions = {};
  bool _showResults = false;
  bool _loading = false;

  final _smokingOptions = ['Never', 'Occasionally', 'Regularly'];
  final _alcoholOptions = ['Never', 'Occasionally', 'Regularly'];
  final _exerciseOptions = ['Daily', 'Weekly', 'Rarely', 'Never'];
  final _familyOptions = ['Diabetes', 'Heart Disease', 'Cancer', 'High BP'];
  final _existingOptions = ['Diabetes', 'Heart Disease', 'Cancer', 'High BP', 'Asthma', 'Thyroid', 'None'];

  @override
  void dispose() {
    _ageCtrl.dispose();
    _weightCtrl.dispose();
    _heightCtrl.dispose();
    super.dispose();
  }

  double? get _bmi {
    final w = double.tryParse(_weightCtrl.text);
    final h = double.tryParse(_heightCtrl.text);
    if (w == null || h == null || h <= 0) return null;
    return double.parse((w / ((h / 100) * (h / 100))).toStringAsFixed(1));
  }

  int _calcRiskScore() {
    int score = 0;
    final age = int.tryParse(_ageCtrl.text) ?? 25;
    if (age > 50) score += 20;
    else if (age > 40) score += 15;
    else if (age > 30) score += 10;

    final bmi = _bmi;
    if (bmi != null) {
      if (bmi > 30) score += 20;
      else if (bmi > 25) score += 10;
    }

    if (_smoking == 'Regularly') score += 20;
    else if (_smoking == 'Occasionally') score += 10;
    if (_alcohol == 'Regularly') score += 15;
    else if (_alcohol == 'Occasionally') score += 8;
    if (_exercise == 'Never') score += 10;
    else if (_exercise == 'Rarely') score += 5;
    score += _familyHistory.length * 8;
    score += _existingConditions.length * 12;
    return score.clamp(0, 100);
  }

  Map<String, double> _diseaseRisks() {
    final base = _calcRiskScore().toDouble();
    return {
      'Diabetes': (base * 0.8 + (_familyHistory.contains('Diabetes') ? 15 : 0)).clamp(0, 100),
      'Heart Disease': (base * 0.85 + (_familyHistory.contains('Heart Disease') ? 18 : 0) + (_smoking == 'Regularly' ? 10 : 0)).clamp(0, 100),
      'Cancer': (base * 0.5 + (_familyHistory.contains('Cancer') ? 20 : 0) + (_smoking == 'Regularly' ? 12 : 0)).clamp(0, 100),
      'High BP': (base * 0.7 + (_familyHistory.contains('High BP') ? 15 : 0) + (_alcohol == 'Regularly' ? 8 : 0)).clamp(0, 100),
    };
  }

  List<String> _recommendations() {
    final list = <String>[];
    final bmi = _bmi;
    if (bmi != null && bmi > 25) list.add('Maintain a healthy BMI through diet and exercise');
    if (_smoking != 'Never') list.add('Consider a smoking cessation program');
    if (_alcohol != 'Never') list.add('Limit alcohol consumption to recommended levels');
    if (_exercise == 'Never' || _exercise == 'Rarely') list.add('Increase physical activity to at least 30 min/day');
    if (_familyHistory.contains('Diabetes')) list.add('Regular blood sugar screening recommended');
    if (_familyHistory.contains('Heart Disease')) list.add('Regular cardiac checkups recommended');
    if (_familyHistory.contains('Cancer')) list.add('Annual cancer screenings recommended');
    if (_familyHistory.contains('High BP')) list.add('Monitor blood pressure regularly');
    list.add('Schedule annual preventive health checkup');
    list.add('Maintain a balanced diet rich in fruits and vegetables');
    return list;
  }

  Future<void> _calculateRisk() async {
    if (_ageCtrl.text.isEmpty || _weightCtrl.text.isEmpty || _heightCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Please fill all required fields', style: GoogleFonts.inter(color: Colors.white)),
        backgroundColor: ZyntraColors.amber,
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }
    setState(() => _loading = true);
    try {
      await apiService.post('/api/health-risk', body: {
        'age': int.tryParse(_ageCtrl.text),
        'weight': double.tryParse(_weightCtrl.text),
        'height': double.tryParse(_heightCtrl.text),
        'smoking': _smoking,
        'alcohol': _alcohol,
        'exercise': _exercise,
        'familyHistory': _familyHistory.toList(),
        'existingConditions': _existingConditions.toList(),
      });
    } catch (_) {}
    if (mounted) {
      setState(() {
        _loading = false;
        _showResults = true;
      });
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
                      Text('Health Risk', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Assess your health risks and get recommendations', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? Center(child: CircularProgressIndicator(color: ZyntraColors.cyan))
                  : _showResults
                      ? _buildResults()
                      : _buildQuestionnaire(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestionnaire() {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          // Age, Weight, Height
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Text('Basic Information', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(child: _inputField(_ageCtrl, 'Age', TextInputType.number)),
                const SizedBox(width: 10),
                Expanded(child: _inputField(_weightCtrl, 'Weight (kg)', TextInputType.number)),
                const SizedBox(width: 10),
                Expanded(child: _inputField(_heightCtrl, 'Height (cm)', TextInputType.number)),
              ],
            ),
          ),
          if (_bmi != null) ...[
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text('BMI: ', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                  Text(_bmi!.toStringAsFixed(1), style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: (_bmi! > 25 ? ZyntraColors.amber : (_bmi! < 18.5 ? ZyntraColors.red : ZyntraColors.green)).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _bmi! > 30 ? 'Obese' : (_bmi! > 25 ? 'Overweight' : (_bmi! < 18.5 ? 'Underweight' : 'Normal')),
                      style: GoogleFonts.inter(
                        color: _bmi! > 25 ? ZyntraColors.amber : (_bmi! < 18.5 ? ZyntraColors.red : ZyntraColors.green),
                        fontSize: 11, fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),
          // Smoking / Alcohol
          _dropdownSection('Smoking Habits', _smoking, _smokingOptions, (v) => setState(() => _smoking = v)),
          const SizedBox(height: 12),
          _dropdownSection('Alcohol Consumption', _alcohol, _alcoholOptions, (v) => setState(() => _alcohol = v)),
          const SizedBox(height: 12),
          _dropdownSection('Exercise Frequency', _exercise, _exerciseOptions, (v) => setState(() => _exercise = v)),
          const SizedBox(height: 20),
          // Family History
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Text('Family History', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Wrap(
              spacing: 8, runSpacing: 8,
              children: _familyOptions.map((opt) => GestureDetector(
                onTap: () => setState(() => _familyHistory.contains(opt) ? _familyHistory.remove(opt) : _familyHistory.add(opt)),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: _familyHistory.contains(opt) ? ZyntraColors.cyan.withValues(alpha: 0.15) : ZyntraColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _familyHistory.contains(opt) ? ZyntraColors.cyan.withValues(alpha: 0.4) : ZyntraColors.border),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(_familyHistory.contains(opt) ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded,
                        color: _familyHistory.contains(opt) ? ZyntraColors.cyan : ZyntraColors.white40, size: 16),
                      const SizedBox(width: 6),
                      Text(opt, style: GoogleFonts.inter(color: _familyHistory.contains(opt) ? Colors.white : ZyntraColors.white70, fontSize: 13)),
                    ],
                  ),
                ),
              )).toList(),
            ),
          ),
          const SizedBox(height: 20),
          // Existing Conditions
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Text('Existing Conditions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Wrap(
              spacing: 8, runSpacing: 8,
              children: _existingOptions.map((opt) => GestureDetector(
                onTap: () => setState(() => _existingConditions.contains(opt) ? _existingConditions.remove(opt) : _existingConditions.add(opt)),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: _existingConditions.contains(opt) ? ZyntraColors.purple.withValues(alpha: 0.15) : ZyntraColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _existingConditions.contains(opt) ? ZyntraColors.purple.withValues(alpha: 0.4) : ZyntraColors.border),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(_existingConditions.contains(opt) ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded,
                        color: _existingConditions.contains(opt) ? ZyntraColors.purple : ZyntraColors.white40, size: 16),
                      const SizedBox(width: 6),
                      Text(opt, style: GoogleFonts.inter(color: _existingConditions.contains(opt) ? Colors.white : ZyntraColors.white70, fontSize: 13)),
                    ],
                  ),
                ),
              )).toList(),
            ),
          ),
          const SizedBox(height: 24),
          // Calculate Button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GestureDetector(
              onTap: _calculateRisk,
              child: Container(
                width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                ),
                child: Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.analytics_rounded, color: Colors.white, size: 20),
                      const SizedBox(width: 8),
                      Text('Calculate Risk', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _inputField(TextEditingController ctrl, String hint, TextInputType type) {
    return TextField(
      controller: ctrl,
      keyboardType: type,
      style: GoogleFonts.inter(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
        filled: true,
        fillColor: ZyntraColors.surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
    );
  }

  Widget _dropdownSection(String title, String value, List<String> options, ValueChanged<String> onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: value,
                dropdownColor: ZyntraColors.card,
                isExpanded: true,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                items: options.map((o) => DropdownMenuItem(value: o, child: Text(o))).toList(),
                onChanged: (v) => onChanged(v!),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResults() {
    final score = _calcRiskScore();
    final risks = _diseaseRisks();
    final recs = _recommendations();
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 100),
      child: Column(
        children: [
          const SizedBox(height: 20),
          // Score Gauge
          Center(
            child: Container(
              width: 200, height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(colors: [
                  score < 30 ? ZyntraColors.green : (score < 60 ? ZyntraColors.amber : ZyntraColors.red),
                  ZyntraColors.surface,
                ].map((c) => c.withValues(alpha: 0.3)).toList()),
                border: Border.all(
                  color: score < 30 ? ZyntraColors.green : (score < 60 ? ZyntraColors.amber : ZyntraColors.red),
                  width: 6,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('$score', style: GoogleFonts.poppins(color: Colors.white, fontSize: 48, fontWeight: FontWeight.w700)),
                  Text(
                    score < 30 ? 'Low Risk' : (score < 60 ? 'Moderate Risk' : 'High Risk'),
                    style: GoogleFonts.inter(color: score < 30 ? ZyntraColors.green : (score < 60 ? ZyntraColors.amber : ZyntraColors.red), fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  Text('Overall Risk Score', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                ],
              ),
            ),
          ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),
          const SizedBox(height: 24),
          // Disease-specific Risks
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Text('Disease-Specific Risk', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          ),
          ...risks.entries.map((e) => _riskBar(e.key, e.value)),
          const SizedBox(height: 20),
          // Recommendations
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: [
                Text('Recommendations', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                const Spacer(),
                Text('${recs.length} tips', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ],
            ),
          ),
          ...List.generate(recs.length, (i) => _recCard(i, recs[i])),
          const SizedBox(height: 20),
          // Back Button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GestureDetector(
              onTap: () => setState(() => _showResults = false),
              child: Container(
                width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: ZyntraColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: ZyntraColors.border),
                ),
                child: Center(child: Text('Recalculate', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600))),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _riskBar(String label, double value) {
    final color = value < 30 ? ZyntraColors.green : (value < 60 ? ZyntraColors.amber : ZyntraColors.red);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
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
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: value / 100,
                backgroundColor: ZyntraColors.border,
                valueColor: AlwaysStoppedAnimation<Color>(color),
                minHeight: 8,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _recCard(int i, String text) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(color: ZyntraColors.teal.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.check_circle_rounded, color: ZyntraColors.teal, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, height: 1.4))),
        ],
      ),
    ).animate().fadeIn(delay: (i * 80).ms).slideX(begin: 0.1, end: 0);
  }
}
