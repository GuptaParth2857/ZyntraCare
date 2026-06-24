import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';

class ClinicalAiScreen extends StatefulWidget {
  const ClinicalAiScreen({super.key});
  @override State<ClinicalAiScreen> createState() => _ClinicalAiScreenState();
}

class _ClinicalAiScreenState extends State<ClinicalAiScreen> {
  bool _loading = true;
  bool _analyzing = false;
  bool _showResults = false;

  String _selectedModel = 'ZyntraDX-v1';
  final _symptomsController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  final _models = ['ZyntraDX-v1', 'MedLLM-Pro', 'PathAI', 'RadioAssist'];

  Map<String, dynamic>? _results;

  @override
  void initState() {
    super.initState();
    Future.delayed(1500.ms, () {
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  void dispose() {
    _symptomsController.dispose();
    super.dispose();
  }

  void _runAnalysis() {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() {
      _analyzing = true;
      _showResults = false;
      _results = null;
    });

    Future.delayed(3.seconds, () {
      if (!mounted) return;
      setState(() {
        _analyzing = false;
        _showResults = true;
        _results = _getMockResults();
      });
    });
  }

  Map<String, dynamic> _getMockResults() {
    return {
      'primaryDiagnosis': 'Acute Upper Respiratory Tract Infection',
      'confidence': 87,
      'differentials': [
        'Seasonal Allergic Rhinitis (72%)',
        'Acute Bronchitis (45%)',
        'COVID-19 (18%)',
        'Influenza (15%)',
      ],
      'recommendedTests': [
        {'name': 'Complete Blood Count (CBC)', 'priority': 'High'},
        {'name': 'Chest X-Ray PA View', 'priority': 'Medium'},
        {'name': 'CRP Quantitative', 'priority': 'Medium'},
        {'name': 'COVID-19 RT-PCR', 'priority': 'Low'},
      ],
      'medications': [
        'Paracetamol 500mg — 1 tab every 6 hrs',
        'Azithromycin 500mg — 1 tab daily for 3 days',
        'Antihistamine (Cetirizine 10mg) — at bedtime',
        'Warm saline gargles — 3 times daily',
      ],
    };
  }

  Color _confidenceColor(int conf) {
    if (conf >= 80) return ZyntraColors.green;
    if (conf >= 60) return ZyntraColors.amber;
    return ZyntraColors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading ? _buildShimmer() : SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 20),
                _buildModelSelector(),
                const SizedBox(height: 20),
                _buildInputSection(),
                const SizedBox(height: 20),
                _buildAnalyzeButton(),
                if (_analyzing) ...[
                  const SizedBox(height: 32),
                  _buildAnalysisAnimation(),
                ],
                if (_showResults && _results != null) ...[
                  const SizedBox(height: 28),
                  _buildResults(),
                ],
                if (_showResults || _analyzing) ...[
                  const SizedBox(height: 28),
                  _buildDisclaimer(),
                ],
              ],
            ),
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
        Text('Clinical AI', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: ZyntraColors.cyan.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.25)),
          ),
          child: Text('BETA', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1)),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.05, end: 0);
  }

  Widget _buildModelSelector() {
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
              const Icon(Icons.psychology_rounded, color: ZyntraColors.purple, size: 22),
              const SizedBox(width: 10),
              Text('AI Model', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedModel,
                isExpanded: true,
                dropdownColor: ZyntraColors.surface,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                items: _models.map((m) => DropdownMenuItem(
                  value: m,
                  child: Row(
                    children: [
                      Icon(Icons.smart_toy_rounded, color: ZyntraColors.cyan, size: 16),
                      const SizedBox(width: 8),
                      Text(m, style: GoogleFonts.inter(color: Colors.white, fontSize: 14)),
                    ],
                  ),
                )).toList(),
                onChanged: (v) {
                  if (v != null) setState(() => _selectedModel = v);
                },
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildInputSection() {
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
              const Icon(Icons.edit_note_rounded, color: ZyntraColors.cyan, size: 22),
              const SizedBox(width: 10),
              Text('Patient Symptoms', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _symptomsController,
            maxLines: 5,
            style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'Describe the patient\'s symptoms in detail...\ne.g., "Fever of 101°F for 3 days, dry cough, body ache"',
              hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 13),
              filled: true,
              fillColor: ZyntraColors.surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.all(16),
            ),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter symptoms' : null,
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildAnalyzeButton() {
    return GestureDetector(
      onTap: _analyzing ? null : _runAnalysis,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(_analyzing ? Icons.hourglass_top_rounded : Icons.rocket_launch_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(
              _analyzing ? 'Analyzing...' : 'Analyze with $_selectedModel',
              style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildAnalysisAnimation() {
    return Column(
      children: [
        SizedBox(
          width: 80, height: 80,
          child: CircularProgressIndicator(
            strokeWidth: 4,
            backgroundColor: ZyntraColors.border,
            valueColor: const AlwaysStoppedAnimation<Color>(ZyntraColors.cyan),
          ),
        ).animate(onPlay: (c) => c.repeat(), onComplete: (c) => c.reset()).shimmer(duration: 1200.ms),
        const SizedBox(height: 16),
        Text('Running $_selectedModel analysis...', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13))
            .animate().fadeIn().then(delay: 800.ms).fadeOut(),
        const SizedBox(height: 6),
        Text('Processing clinical data', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildResults() {
    final r = _results!;
    final conf = r['confidence'] as int;
    final confColor = _confidenceColor(conf);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Analysis Results', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600))
            .animate().fadeIn(duration: 300.ms),

        const SizedBox(height: 16),

        // Primary Diagnosis
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [confColor.withValues(alpha: 0.1), ZyntraColors.card],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: confColor.withValues(alpha: 0.25)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Primary Diagnosis', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: confColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text('$conf% confidence', style: GoogleFonts.inter(color: confColor, fontSize: 11, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(r['primaryDiagnosis'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            ],
          ),
        ).animate().fadeIn(delay: 100.ms, duration: 300.ms).slideY(begin: 0.05, end: 0),

        const SizedBox(height: 16),

        // Differential Diagnoses
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Differential Diagnoses', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
              ...(r['differentials'] as List).map((d) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Container(
                      width: 6, height: 6,
                      decoration: const BoxDecoration(shape: BoxShape.circle, color: ZyntraColors.purple),
                    ),
                    const SizedBox(width: 10),
                    Text(d as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                  ],
                ),
              )),
            ],
          ),
        ).animate().fadeIn(delay: 200.ms, duration: 300.ms),

        const SizedBox(height: 16),

        // Recommended Tests
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Recommended Tests', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
              ...(r['recommendedTests'] as List).map((t) {
                final test = t as Map<String, dynamic>;
                final priorityColor = test['priority'] == 'High' ? ZyntraColors.red :
                                     test['priority'] == 'Medium' ? ZyntraColors.amber : ZyntraColors.green;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: priorityColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(Icons.science_rounded, color: priorityColor, size: 16),
                      ),
                      const SizedBox(width: 10),
                      Expanded(child: Text(test['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13))),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: priorityColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(test['priority'] as String, style: GoogleFonts.inter(color: priorityColor, fontSize: 10, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ).animate().fadeIn(delay: 300.ms, duration: 300.ms),

        const SizedBox(height: 16),

        // Suggested Medications
        Container(
          width: double.infinity,
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
                  const Icon(Icons.medication_rounded, color: ZyntraColors.green, size: 20),
                  const SizedBox(width: 8),
                  Text('Suggested Medications', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 12),
              ...(r['medications'] as List).map((m) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('•', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 14)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(m as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13))),
                  ],
                ),
              )),
            ],
          ),
        ).animate().fadeIn(delay: 400.ms, duration: 300.ms),
      ],
    );
  }

  Widget _buildDisclaimer() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.amber.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.15)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.warning_amber_rounded, color: ZyntraColors.amber, size: 18),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'AI-generated clinical suggestions are for assistance only. '
              'All diagnoses must be verified by a licensed medical professional. '
              'Do not make medical decisions solely based on AI output.',
              style: GoogleFonts.inter(color: ZyntraColors.amber.withValues(alpha: 0.8), fontSize: 11, height: 1.5),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
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
            Container(height: 40, width: 160, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12))),
            const SizedBox(height: 20),
            Container(height: 100, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
            const SizedBox(height: 20),
            Container(height: 160, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
            const SizedBox(height: 20),
            Container(height: 56, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
          ],
        ),
      ),
    );
  }
}
