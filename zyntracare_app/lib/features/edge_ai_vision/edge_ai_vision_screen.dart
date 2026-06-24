
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';

class EdgeAiVisionScreen extends StatefulWidget {
  const EdgeAiVisionScreen({super.key});
  @override State<EdgeAiVisionScreen> createState() => _EdgeAiVisionScreenState();
}

class _EdgeAiVisionScreenState extends State<EdgeAiVisionScreen> with TickerProviderStateMixin {
  bool _loading = true;
  bool _captured = false;
  bool _analyzing = false;
  bool _batchMode = false;
  String _processingMode = 'on-device';

  late AnimationController _scanLineCtrl;

  @override
  void initState() {
    super.initState();
    _scanLineCtrl = AnimationController(vsync: this, duration: 2000.ms)..repeat();
    Future.delayed(1500.ms, () {
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  void dispose() {
    _scanLineCtrl.dispose();
    super.dispose();
  }

  void _capture() {
    setState(() {
      _captured = true;
      _analyzing = true;
    });
    Future.delayed(2.seconds, () {
      if (mounted) setState(() => _analyzing = false);
    });
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
              const SizedBox(height: 20),
              _buildCameraPreview(),
              const SizedBox(height: 20),
              _buildCaptureAndImport(),
              const SizedBox(height: 20),
              _buildBatchToggle(),
              if (_analyzing) ...[
                const SizedBox(height: 24),
                _buildAnalyzingOverlay(),
              ],
              if (_captured && !_analyzing) ...[
                const SizedBox(height: 24),
                _buildAnalysisResults(),
              ],
              if (!_captured && !_analyzing) ...[
                const SizedBox(height: 24),
                _buildProcessingIndicator(),
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
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Edge AI Vision', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
              Text('On-device visual intelligence', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: ZyntraColors.cyan.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.25)),
          ),
          child: Text('AI', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1)),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.05, end: 0);
  }

  Widget _buildCameraPreview() {
    return Container(
      width: double.infinity,
      height: 240,
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.camera_alt_rounded, color: ZyntraColors.white40, size: 56),
                const SizedBox(height: 12),
                Text('Camera Preview', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 14)),
                const SizedBox(height: 4),
                Text('Point camera at object or document', style: GoogleFonts.inter(color: ZyntraColors.white40.withValues(alpha: 0.6), fontSize: 11)),
              ],
            ),
          ),
          // Corner brackets
          Positioned(
            top: 12, left: 12,
            child: _buildCorner(Alignment.topLeft),
          ),
          Positioned(
            top: 12, right: 12,
            child: _buildCorner(Alignment.topRight),
          ),
          Positioned(
            bottom: 12, left: 12,
            child: _buildCorner(Alignment.bottomLeft),
          ),
          Positioned(
            bottom: 12, right: 12,
            child: _buildCorner(Alignment.bottomRight),
          ),
          // Scan line animation
          if (!_captured)
            AnimatedBuilder(
              animation: _scanLineCtrl,
              builder: (_, __) {
                return Positioned(
                  top: _scanLineCtrl.value * 220,
                  left: 20, right: 20,
                  child: Container(
                    height: 2,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Colors.transparent, ZyntraColors.cyan, Colors.transparent],
                      ),
                      boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.4), blurRadius: 8, spreadRadius: 1)],
                    ),
                  ),
                );
              },
            ),
          // Overlay on captured
          if (_captured)
            Positioned.fill(
              child: Container(
                color: ZyntraColors.green.withValues(alpha: 0.08),
                child: const Center(
                  child: Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 48),
                ),
              ),
            ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildCorner(Alignment align) {
    final isTop = align == Alignment.topLeft || align == Alignment.topRight;
    final isLeft = align == Alignment.topLeft || align == Alignment.bottomLeft;
    return SizedBox(
      width: 24, height: 24,
      child: CustomPaint(
        painter: _CornerPainter(isTop, isLeft, ZyntraColors.cyan),
      ),
    );
  }

  Widget _buildCaptureAndImport() {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: _captured && !_analyzing ? null : _capture,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(_captured ? Icons.refresh_rounded : Icons.camera_alt_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text(_captured ? 'Recapture' : 'Capture', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GestureDetector(
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Opening gallery...', style: GoogleFonts.inter(color: Colors.white)),
                backgroundColor: ZyntraColors.card,
                behavior: SnackBarBehavior.floating,
              ),
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: ZyntraColors.card,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.photo_library_rounded, color: ZyntraColors.cyan, size: 20),
                  const SizedBox(width: 8),
                  Text('Gallery', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 16, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildBatchToggle() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.batch_prediction_rounded, color: ZyntraColors.purple, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Batch Scan Mode', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                Text('Process multiple images sequentially', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              ],
            ),
          ),
          Transform.scale(
            scale: 0.8,
            child: Switch(
              value: _batchMode,
              onChanged: (v) => setState(() => _batchMode = v),
              activeColor: ZyntraColors.purple,
              activeTrackColor: ZyntraColors.purple.withValues(alpha: 0.3),
              inactiveTrackColor: ZyntraColors.border,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }

  Widget _buildAnalyzingOverlay() {
    return Column(
      children: [
        SizedBox(
          width: 60, height: 60,
          child: CircularProgressIndicator(
            strokeWidth: 4,
            backgroundColor: ZyntraColors.border,
            valueColor: const AlwaysStoppedAnimation<Color>(ZyntraColors.cyan),
          ),
        ).animate(onPlay: (c) => c.repeat()).shimmer(duration: 1000.ms),
        const SizedBox(height: 16),
        Text('Analyzing with Edge AI...', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14)),
        const SizedBox(height: 6),
        Text('Processing on-device ($_processingMode)', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
      ],
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildProcessingIndicator() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.teal.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.teal.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          Container(
            width: 10, height: 10,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: ZyntraColors.teal,
              boxShadow: [BoxShadow(color: ZyntraColors.teal.withValues(alpha: 0.5), blurRadius: 6, spreadRadius: 1)],
            ),
          ),
          const SizedBox(width: 12),
          Text('Edge Processing: $_processingMode', style: GoogleFonts.inter(color: ZyntraColors.teal, fontSize: 13, fontWeight: FontWeight.w500)),
          const Spacer(),
          const Icon(Icons.security_rounded, color: ZyntraColors.teal, size: 16),
          const SizedBox(width: 4),
          Text('Private', style: GoogleFonts.inter(color: ZyntraColors.teal, fontSize: 11, fontWeight: FontWeight.w600)),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  Widget _buildAnalysisResults() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Analysis Results', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600))
            .animate().fadeIn(duration: 300.ms),
        const SizedBox(height: 16),
        _buildObjectDetectionCard(),
        const SizedBox(height: 14),
        _buildTextExtractionCard(),
        const SizedBox(height: 14),
        _buildSceneDescriptionCard(),
      ],
    );
  }

  Widget _buildObjectDetectionCard() {
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
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: ZyntraColors.cyan.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.visibility_rounded, color: ZyntraColors.cyan, size: 20),
              ),
              const SizedBox(width: 12),
              Text('Object Detection', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text('3 objects', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 14),
          ...([
            {'label': 'Human', 'confidence': 0.98},
            {'label': 'Mobile Phone', 'confidence': 0.92},
            {'label': 'Prescription', 'confidence': 0.87},
          ] as List<Map<String, dynamic>>).map((obj) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: ZyntraColors.surface,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: ZyntraColors.border),
                  ),
                  child: Text(obj['label'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                ),
                const Spacer(),
                Text('${((obj['confidence'] as double) * 100).round()}%', style: GoogleFonts.inter(
                  color: (obj['confidence'] as double) > 0.9 ? ZyntraColors.green : ZyntraColors.amber,
                  fontSize: 12, fontWeight: FontWeight.w600,
                )),
              ],
            ),
          )),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: 0.98,
              backgroundColor: ZyntraColors.border,
              valueColor: const AlwaysStoppedAnimation<Color>(ZyntraColors.green),
              minHeight: 3,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildTextExtractionCard() {
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
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: ZyntraColors.purple.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.text_fields_rounded, color: ZyntraColors.purple, size: 20),
              ),
              const SizedBox(width: 12),
              Text('Text Extraction', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Text(
              'Patient: Rahul Sharma\nDOB: 15/03/1985\nRx: Amoxicillin 500mg - 1 cap TDS x 7 days\nParacetamol 650mg - 1 tab SOS\nDr. Priya Mehta (MBBS, MD)',
              style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12, height: 1.6),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  Widget _buildSceneDescriptionCard() {
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
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: ZyntraColors.green.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.description_rounded, color: ZyntraColors.green, size: 20),
              ),
              const SizedBox(width: 12),
              Text('Scene Description', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            'A person holding a smartphone with a prescription paper visible on a wooden table. '
            'Well-lit indoor environment, likely a clinic or home setting. '
            'The prescription contains handwritten medical instructions.',
            style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12, height: 1.6),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms, duration: 300.ms);
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
            Container(height: 40, width: 200, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12))),
            const SizedBox(height: 20),
            Container(height: 240, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20))),
            const SizedBox(height: 20),
            Row(children: [
              Expanded(child: Container(height: 52, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14)))),
              const SizedBox(width: 12),
              Expanded(child: Container(height: 52, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14)))),
            ]),
          ],
        ),
      ),
    );
  }
}

class _CornerPainter extends CustomPainter {
  final bool isTop;
  final bool isLeft;
  final Color color;

  _CornerPainter(this.isTop, this.isLeft, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    final path = Path();
    if (isTop && isLeft) {
      path.moveTo(0, size.height - 4);
      path.lineTo(0, 0);
      path.lineTo(size.width - 4, 0);
    } else if (isTop && !isLeft) {
      path.moveTo(4, 0);
      path.lineTo(size.width, 0);
      path.lineTo(size.width, size.height - 4);
    } else if (!isTop && isLeft) {
      path.moveTo(0, 4);
      path.lineTo(0, size.height);
      path.lineTo(size.width - 4, size.height);
    } else {
      path.moveTo(4, size.height);
      path.lineTo(size.width, size.height);
      path.lineTo(size.width, 4);
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _CornerPainter old) => old.color != color;
}
