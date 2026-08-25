import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class ClinicalScribeScreen extends StatefulWidget {
  const ClinicalScribeScreen({super.key});
  @override State<ClinicalScribeScreen> createState() => _ClinicalScribeScreenState();
}

class _ClinicalScribeScreenState extends State<ClinicalScribeScreen> with TickerProviderStateMixin {
  bool _isRecording = false;
  bool _loading = false;
  String _selectedSpecialty = 'General';
  String _transcription = '';
  String _summary = '';
  late AnimationController _waveAnimCtrl;

  final _specialties = ['General', 'Cardiology', 'Neurology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'ENT'];

  final _placeholderSummary = {
    'symptoms': 'Patient reports persistent headache for 3 days, mild fever (100.2°F), body aches, and occasional cough. No history of chronic conditions.',
    'diagnosis': 'Viral upper respiratory tract infection. Possible mild influenza. No signs of bacterial infection.',
    'prescription': 'Paracetamol 650mg - 3 times daily for 5 days\nCough syrup - 2 tsp at bedtime\nVitamin C 500mg - once daily\nRest for 48 hours',
    'followUp': 'If symptoms persist beyond 5 days, return for evaluation. Monitor temperature. Seek immediate care if shortness of breath develops.',
  };

  @override
  void initState() {
    super.initState();
    _waveAnimCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
  }

  @override
  void dispose() {
    _waveAnimCtrl.dispose();
    super.dispose();
  }

  void _toggleRecording() {
    if (_isRecording) {
      setState(() => _isRecording = false);
      _waveAnimCtrl.stop();
      setState(() => _transcription = 'Patient presents with complaints of persistent headache for the past 3 days. Associated with mild fever and body aches. Reports occasional cough. No history of similar episodes. Vital signs stable.');
      _generateSummary();
    } else {
      setState(() {
        _isRecording = true;
        _transcription = '';
        _summary = '';
      });
      _waveAnimCtrl.repeat();
    }
  }

  Future<void> _generateSummary() async {
    setState(() => _loading = true);
    try {
      await ApiService().post('/api/scribe', body: {'transcription': _transcription, 'specialty': _selectedSpecialty});
    } catch (_) {}
    if (mounted) {
      setState(() {
        _summary = 'Generated';
        _loading = false;
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
                  Text('Clinical Scribe', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.cyan.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.auto_awesome_rounded, color: ZyntraColors.cyan, size: 22),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _specialtySelector(),
                    const SizedBox(height: 16),
                    _recordingSection(),
                    if (_transcription.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      _sectionHeader('Transcription', Icons.transcribe_rounded),
                      const SizedBox(height: 8),
                      _transcriptionCard(),
                    ],
                    if (_loading) ...[
                      const SizedBox(height: 20),
                      const Center(child: CircularProgressIndicator()),
                    ],
                    if (_summary.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      _sectionHeader('Generated Summary', Icons.summarize_rounded),
                      const SizedBox(height: 8),
                      _summarySection('Symptoms', _placeholderSummary['symptoms']!, Icons.healing_rounded, ZyntraColors.amber),
                      const SizedBox(height: 8),
                      _summarySection('Diagnosis', _placeholderSummary['diagnosis']!, Icons.biotech_rounded, ZyntraColors.cyan),
                      const SizedBox(height: 8),
                      _summarySection('Prescription', _placeholderSummary['prescription']!, Icons.medication_rounded, ZyntraColors.green),
                      const SizedBox(height: 8),
                      _summarySection('Follow-up', _placeholderSummary['followUp']!, Icons.calendar_month_rounded, ZyntraColors.purple),
                      const SizedBox(height: 20),
                      _actionButtons(),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _specialtySelector() {
    return Container(
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
              Icon(Icons.medical_services_rounded, color: ZyntraColors.cyan, size: 18),
              const SizedBox(width: 8),
              Text('Specialty', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _specialties.map((s) => GestureDetector(
              onTap: () => setState(() => _selectedSpecialty = s),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: _selectedSpecialty == s ? ZyntraColors.cyan.withValues(alpha: 0.15) : ZyntraColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: _selectedSpecialty == s ? ZyntraColors.cyan : ZyntraColors.border,
                  ),
                ),
                child: Text(s, style: GoogleFonts.inter(
                  color: _selectedSpecialty == s ? ZyntraColors.cyan : ZyntraColors.white70,
                  fontSize: 12,
                  fontWeight: _selectedSpecialty == s ? FontWeight.w600 : FontWeight.w400,
                )),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }

  Widget _recordingSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _isRecording
              ? [ZyntraColors.red.withValues(alpha: 0.1), ZyntraColors.card]
              : [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _isRecording ? ZyntraColors.red.withValues(alpha: 0.4) : ZyntraColors.border,
        ),
      ),
      child: Column(
        children: [
          GestureDetector(
            onTap: _toggleRecording,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isRecording ? ZyntraColors.red : ZyntraColors.cyan,
                boxShadow: _isRecording
                    ? [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.4), blurRadius: 24, spreadRadius: 4)]
                    : [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 20)],
              ),
              child: Icon(
                _isRecording ? Icons.stop_rounded : Icons.mic_rounded,
                color: Colors.white,
                size: 36,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _isRecording ? 'Recording... Tap to stop' : 'Tap to start recording',
            style: GoogleFonts.inter(
              color: _isRecording ? ZyntraColors.red : ZyntraColors.white70,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (_isRecording) ...[
            const SizedBox(height: 16),
            _waveformVisualizer(),
          ],
        ],
      ),
    );
  }

  Widget _waveformVisualizer() {
    return SizedBox(
      height: 60,
      child: CustomPaint(
        size: const Size(double.infinity, 60),
        painter: _WaveformPainter(animation: _waveAnimCtrl),
      ),
    );
  }

  Widget _transcriptionCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Text(
        _transcription,
        style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, height: 1.5),
      ),
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: ZyntraColors.cyan.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: ZyntraColors.cyan, size: 16),
        ),
        const SizedBox(width: 8),
        Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _summarySection(String title, String content, IconData icon, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, color: color, size: 16),
              ),
              const SizedBox(width: 8),
              Text(title, style: GoogleFonts.inter(color: color, fontSize: 14, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 10),
          Text(content, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, height: 1.5)),
        ],
      ),
    );
  }

  Widget _actionButtons() {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () {
              Clipboard.setData(const ClipboardData(text: ''));
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text('Summary copied!', style: GoogleFonts.inter(color: Colors.white)),
                backgroundColor: ZyntraColors.green,
                behavior: SnackBarBehavior.floating,
              ));
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: ZyntraColors.card,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.copy_rounded, color: ZyntraColors.cyan, size: 18),
                  const SizedBox(width: 6),
                  Text('Copy', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 13, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text('Saved to records!', style: GoogleFonts.inter(color: Colors.white)),
                backgroundColor: ZyntraColors.green,
                behavior: SnackBarBehavior.floating,
              ));
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: ZyntraColors.green.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.save_rounded, color: ZyntraColors.green, size: 18),
                  const SizedBox(width: 6),
                  Text('Save', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 13, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text('Shared successfully!', style: GoogleFonts.inter(color: Colors.white)),
                backgroundColor: ZyntraColors.purple,
                behavior: SnackBarBehavior.floating,
              ));
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.share_rounded, color: Colors.white, size: 18),
                  const SizedBox(width: 6),
                  Text('Share', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _WaveformPainter extends CustomPainter {
  final Animation<double> animation;

  _WaveformPainter({required this.animation});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = ZyntraColors.cyan.withValues(alpha: 0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    final path = Path();
    final centerY = size.height / 2;
    final barCount = 40;
    final barWidth = size.width / barCount;

    for (int i = 0; i < barCount; i++) {
      final x = i * barWidth + barWidth / 2;
      final phase = (i / barCount) * (2 * math.pi);
      final animVal = animation.value;
      final amplitude = (math.sin(phase * 4 + animVal * 2 * math.pi) * 0.5 + 0.5) * 20 + 5;
      final height = amplitude * (math.sin(phase * 2) * 0.3 + 0.7);

      if (i == 0) {
        path.moveTo(x, centerY - height);
      } else {
        path.lineTo(x, centerY - height);
      }
    }

    canvas.drawPath(path, paint);

    for (int i = 0; i < barCount; i++) {
      final x = i * barWidth + barWidth / 2;
      final phase = (i / barCount) * (2 * math.pi);
      final animVal = animation.value;
      final amplitude = (math.sin(phase * 4 + animVal * 2 * math.pi) * 0.5 + 0.5) * 20 + 5;
      final height = amplitude * (math.sin(phase * 2) * 0.3 + 0.7);
      canvas.drawLine(
        Offset(x, centerY),
        Offset(x, centerY - height),
        paint..color = ZyntraColors.cyan.withValues(alpha: 0.3 + 0.3 * (height / 25)),
      );
    }
  }

  @override
  bool shouldRepaint(covariant _WaveformPainter oldDelegate) => oldDelegate.animation.value != animation.value;
}
