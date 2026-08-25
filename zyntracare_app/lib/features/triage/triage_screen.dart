import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';

class TriageScreen extends StatefulWidget {
  const TriageScreen({super.key});
  @override State<TriageScreen> createState() => _TriageScreenState();
}

class _TriageScreenState extends State<TriageScreen> with TickerProviderStateMixin {
  bool _loading = true;
  int _currentStep = 0;
  final Map<int, String> _answers = {};
  String? _ageGroup;
  String? _triageResult;
  bool _showResult = false;

  late AnimationController _pulseCtrl;

  final _questions = [
    {'question': 'Is the patient experiencing breathing difficulty?', 'key': 'breathing'},
    {'question': 'Is the patient conscious and alert?', 'key': 'conscious'},
    {'question': 'Is there severe bleeding?', 'key': 'bleeding'},
    {'question': 'Is the patient experiencing chest pain or pressure?', 'key': 'chestPain'},
  ];

  final _ageGroups = ['Infant (0-1)', 'Child (2-12)', 'Teen (13-17)', 'Adult (18-60)', 'Senior (60+)'];

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: 1200.ms)..repeat(reverse: true);
    Future.delayed(1500.ms, () {
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  void _answer(String value) {
    _answers[_currentStep] = value;
    if (_currentStep < _questions.length - 1) {
      setState(() => _currentStep++);
    } else {
      _calculateResult();
    }
  }

  void _calculateResult() {
    final breathing = _answers[0];
    final conscious = _answers[1];
    final bleeding = _answers[2];
    final chestPain = _answers[3];

    String result;
    if (breathing == 'No' || conscious == 'No' || bleeding == 'Yes') {
      result = 'RED';
    } else if (chestPain == 'Yes') {
      result = 'YELLOW';
    } else {
      result = 'GREEN';
    }

    setState(() {
      _triageResult = result;
      _showResult = true;
    });
  }

  void _reset() {
    setState(() {
      _currentStep = 0;
      _answers.clear();
      _ageGroup = null;
      _triageResult = null;
      _showResult = false;
    });
  }

  Color get _resultColor {
    switch (_triageResult) {
      case 'RED': return ZyntraColors.red;
      case 'YELLOW': return ZyntraColors.amber;
      case 'GREEN': return ZyntraColors.green;
      default: return ZyntraColors.white70;
    }
  }

  IconData get _resultIcon {
    switch (_triageResult) {
      case 'RED': return Icons.warning_rounded;
      case 'YELLOW': return Icons.info_rounded;
      case 'GREEN': return Icons.check_circle_rounded;
      default: return Icons.help_rounded;
    }
  }

  String get _resultLabel {
    switch (_triageResult) {
      case 'RED': return 'Immediate — Call Ambulance Now';
      case 'YELLOW': return 'Urgent — Visit ER Within 1 Hour';
      case 'GREEN': return 'Non-Urgent — Schedule Appointment';
      default: return '';
    }
  }

  String get _resultInstruction {
    switch (_triageResult) {
      case 'RED':
        return '• Call 108 immediately\n'
            '• Keep patient lying down\n'
            '• Do not give food or water\n'
            '• Monitor breathing continuously\n'
            '• Gather medical history for paramedics';
      case 'YELLOW':
        return '• Visit nearest Emergency Room within 1 hour\n'
            '• Avoid strenuous activity\n'
            '• Take prescribed medications if any\n'
            '• Have someone drive you — do not drive yourself\n'
            '• Bring medical records and ID';
      case 'GREEN':
        return '• Schedule a non-urgent appointment with your doctor\n'
            '• Monitor symptoms for any changes\n'
            '• Rest and stay hydrated\n'
            '• Follow up if symptoms worsen\n'
            '• You can use ZyntraCare Telehealth for consultation';
      default: return '';
    }
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
              if (!_showResult) ...[
                const SizedBox(height: 20),
                _buildProgressBar(),
                const SizedBox(height: 28),
                _buildQuestionCard(),
                const SizedBox(height: 24),
                _buildAgeGroupSelector(),
              ],
              if (_showResult) ...[
                const SizedBox(height: 24),
                _buildResultCard(),
                const SizedBox(height: 24),
                _buildInstructionsCard(),
                const SizedBox(height: 24),
                _buildEmergencyActions(),
                const SizedBox(height: 24),
                _buildDisclaimer(),
                const SizedBox(height: 20),
                _buildResetButton(),
              ],
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
          onTap: () => _showResult ? _reset() : Navigator.pop(context),
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Icon(
              _showResult ? Icons.refresh_rounded : Icons.arrow_back_rounded,
              color: Colors.white, size: 20,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Triage', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
              Text(
                _showResult ? 'Assessment Complete' : 'Emergency Severity Assessment',
                style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12),
              ),
            ],
          ),
        ),
        if (!_showResult)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: ZyntraColors.red.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.25)),
            ),
            child: AnimatedBuilder(
              animation: _pulseCtrl,
              builder: (_, __) => Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6, height: 6,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: ZyntraColors.red,
                      boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.3 + _pulseCtrl.value * 0.5), blurRadius: 4, spreadRadius: 1)],
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text('EMERGENCY', style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1)),
                ],
              ),
            ),
          ),
      ],
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.05, end: 0);
  }

  Widget _buildProgressBar() {
    final progress = (_currentStep + 1) / _questions.length;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Step ${_currentStep + 1} of ${_questions.length}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
            Text('${(progress * 100).round()}%', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: ZyntraColors.border,
            valueColor: const AlwaysStoppedAnimation<Color>(ZyntraColors.cyan),
            minHeight: 5,
          ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildQuestionCard() {
    final q = _questions[_currentStep];
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
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
      child: Column(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: ZyntraColors.red.withValues(alpha: 0.1),
            ),
            child: const Icon(Icons.help_outline_rounded, color: ZyntraColors.red, size: 28),
          ),
          const SizedBox(height: 20),
          Text(
            q['question'] as String,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600, height: 1.4),
          ),
          const SizedBox(height: 28),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => _answer('Yes'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: ZyntraColors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.25)),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.check_rounded, color: ZyntraColors.green, size: 28),
                        const SizedBox(height: 4),
                        Text('Yes', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 16, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: GestureDetector(
                  onTap: () => _answer('No'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: ZyntraColors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.25)),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.close_rounded, color: ZyntraColors.red, size: 28),
                        const SizedBox(height: 4),
                        Text('No', style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 16, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildAgeGroupSelector() {
    if (_currentStep < _questions.length - 1) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
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
              const Icon(Icons.people_rounded, color: ZyntraColors.cyan, size: 22),
              const SizedBox(width: 10),
              Text('Age Group', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 16),
          ..._ageGroups.map((g) => GestureDetector(
            onTap: () {
              setState(() => _ageGroup = g);
              _calculateResult();
            },
            child: Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: _ageGroup == g ? ZyntraColors.cyan.withValues(alpha: 0.1) : ZyntraColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _ageGroup == g ? ZyntraColors.cyan : ZyntraColors.border,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 22, height: 22,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _ageGroup == g ? ZyntraColors.cyan : Colors.transparent,
                      border: Border.all(
                        color: _ageGroup == g ? ZyntraColors.cyan : ZyntraColors.border,
                        width: 2,
                      ),
                    ),
                    child: _ageGroup == g
                        ? const Icon(Icons.check, color: Colors.white, size: 14)
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Text(g, style: GoogleFonts.inter(
                    color: _ageGroup == g ? ZyntraColors.cyan : Colors.white,
                    fontSize: 14, fontWeight: FontWeight.w500,
                  )),
                ],
              ),
            ),
          )).toList(),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildResultCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _resultColor.withValues(alpha: 0.15),
            _resultColor.withValues(alpha: 0.03),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _resultColor.withValues(alpha: 0.3)),
        boxShadow: [BoxShadow(color: _resultColor.withValues(alpha: 0.08), blurRadius: 24, spreadRadius: 2)],
      ),
      child: Column(
        children: [
          AnimatedBuilder(
            animation: _pulseCtrl,
            builder: (_, __) {
              final scale = _triageResult == 'RED' ? 1.0 + _pulseCtrl.value * 0.1 : 1.0;
              return Transform.scale(
                scale: scale,
                child: Container(
                  width: 72, height: 72,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _resultColor.withValues(alpha: 0.15),
                    boxShadow: _triageResult == 'RED'
                        ? [BoxShadow(color: _resultColor.withValues(alpha: 0.2 + _pulseCtrl.value * 0.3), blurRadius: 20, spreadRadius: 2)]
                        : null,
                  ),
                  child: Icon(_resultIcon, color: _resultColor, size: 36),
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            decoration: BoxDecoration(
              color: _resultColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _triageResult == 'RED' ? 'CRITICAL' :
              _triageResult == 'YELLOW' ? 'URGENT' : 'STABLE',
              style: GoogleFonts.inter(color: _resultColor, fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 2),
            ),
          ),
          const SizedBox(height: 14),
          Text(_resultLabel, textAlign: TextAlign.center, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
          if (_ageGroup != null) ...[
            const SizedBox(height: 8),
            Text('Age Group: $_ageGroup', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
          ],
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).scale(begin: const Offset(0.9, 0.9), end: const Offset(1, 1), curve: Curves.elasticOut);
  }

  Widget _buildInstructionsCard() {
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
              const Icon(Icons.list_alt_rounded, color: ZyntraColors.cyan, size: 20),
              const SizedBox(width: 8),
              Text('Instructions', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            _resultInstruction,
            style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, height: 1.8),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildEmergencyActions() {
    return Column(
      children: [
        GestureDetector(
          onTap: () => ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Calling 108... Emergency services notified!', style: GoogleFonts.inter(color: Colors.white)),
              backgroundColor: ZyntraColors.red,
              behavior: SnackBarBehavior.floating,
            ),
          ),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 18),
            decoration: BoxDecoration(
              color: ZyntraColors.red,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 6))],
            ),
            child: AnimatedBuilder(
              animation: _pulseCtrl,
              builder: (_, __) {
                final glow = 0.0 + _pulseCtrl.value * 0.3;
                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 12, height: 12,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        boxShadow: [BoxShadow(color: Colors.white.withValues(alpha: glow), blurRadius: 6, spreadRadius: 2)],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text('Call 108 — Emergency', style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                  ],
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 14),
        GestureDetector(
          onTap: () => ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Location shared with emergency contacts!', style: GoogleFonts.inter(color: Colors.white)),
              backgroundColor: ZyntraColors.green,
              behavior: SnackBarBehavior.floating,
            ),
          ),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.share_location_rounded, color: ZyntraColors.cyan, size: 22),
                const SizedBox(width: 8),
                Text('Share Location', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 16, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  Widget _buildDisclaimer() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ZyntraColors.amber.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.12)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.warning_amber_rounded, color: ZyntraColors.amber, size: 16),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'This triage assessment is for guidance only. In any medical emergency, '
              'always call 108 or visit the nearest emergency room immediately.',
              style: GoogleFonts.inter(color: ZyntraColors.amber.withValues(alpha: 0.8), fontSize: 11, height: 1.5),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms, duration: 300.ms);
  }

  Widget _buildResetButton() {
    return Center(
      child: GestureDetector(
        onTap: _reset,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.refresh_rounded, color: ZyntraColors.white70, size: 18),
              const SizedBox(width: 6),
              Text('Start New Assessment', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    ).animate().fadeIn(delay: 400.ms, duration: 300.ms);
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
            Container(height: 40, width: 140, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12))),
            const SizedBox(height: 20),
            Container(height: 20, width: double.infinity, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(4))),
            const SizedBox(height: 20),
            Container(height: 320, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(24))),
          ],
        ),
      ),
    );
  }
}
