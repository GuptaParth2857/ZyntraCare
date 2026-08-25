import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class AIVisionScreen extends StatefulWidget {
  const AIVisionScreen({super.key});
  @override State<AIVisionScreen> createState() => _AIVisionScreenState();
}

class _AIVisionScreenState extends State<AIVisionScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  final _api = ApiService();

  // Pill Scanner
  final _scannerCtrl = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
    returnImage: false,
  );
  bool _pillLoading = false;
  Map<String, dynamic>? _pillData;
  String? _pillError;
  String? _lastBarcode;
  bool _pillResultVisible = false;

  // AI Vision
  CameraController? _camCtrl;
  bool _camReady = false;
  bool _visionLoading = false;
  Map<String, dynamic>? _visionData;
  String? _visionError;
  bool _visionResultVisible = false;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    _tabCtrl.addListener(_onTabChanged);
    _requestPermission().then((_) => _initCam());
  }

  @override
  void dispose() {
    _tabCtrl.removeListener(_onTabChanged);
    _tabCtrl.dispose();
    _scannerCtrl.dispose();
    _camCtrl?.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (!_tabCtrl.indexIsChanging) setState(() {});
  }

  Future<void> _requestPermission() async => await Permission.camera.request();

  Future<void> _initCam() async {
    final cams = await availableCameras();
    if (cams.isEmpty) return;
    _camCtrl = CameraController(cams.first, ResolutionPreset.ultraHigh, enableAudio: false);
    await _camCtrl!.initialize();
    if (mounted) setState(() => _camReady = true);
  }

  void _onBarcodeDetect(BarcodeCapture cap) {
    if (_pillLoading || _pillResultVisible) return;
    final v = cap.barcodes.firstOrNull?.rawValue;
    if (v == null || v == _lastBarcode) return;
    _lastBarcode = v;
    _verifyPill(v);
  }

  Future<void> _verifyPill(String barcode) async {
    setState(() { _pillLoading = true; _pillError = null; _pillData = null; });
    final res = await _api.verifyMedicine(barcode);
    if (mounted) {
      setState(() {
        _pillLoading = false;
        final data = (res is Map<String, dynamic>) ? res : null;
        if (data != null && data['success'] != false) {
          _pillData = data['data'] is Map<String, dynamic> ? data['data'] : data;
          _pillResultVisible = true;
        } else {
          _pillError = data?['error'] ?? 'Could not verify medicine';
        }
      });
    }
  }

  Future<void> _captureAndAnalyze() async {
    if (_camCtrl == null || !_camReady || _visionLoading || _visionResultVisible) return;
    setState(() { _visionLoading = true; _visionError = null; _visionData = null; });
    try {
      final file = await _camCtrl!.takePicture();
      final input = InputImage.fromFilePath(file.path);
      final recognizer = TextRecognizer();
      final result = await recognizer.processImage(input);
      final text = result.text;
      await recognizer.close();
      if (text.isEmpty) {
        if (mounted) setState(() { _visionLoading = false; _visionError = 'No text detected'; });
        return;
      }
      final bytes = await File(file.path).readAsBytes();
      final res = await _api.post('/api/vision', body: {'image': base64Encode(bytes)});
      if (mounted) {
        setState(() {
          _visionLoading = false;
          final data = (res is Map<String, dynamic>) ? res : null;
          if (data != null && data['success'] != false) {
            _visionData = data['data'] is Map<String, dynamic> ? data['data'] : data;
            _visionResultVisible = true;
          } else {
            _visionError = data?['error'] ?? 'Analysis failed';
          }
        });
      }
    } catch (e) {
      if (mounted) setState(() { _visionLoading = false; _visionError = e.toString(); });
    }
  }

  void _resetPillScanner() {
    setState(() {
      _pillData = null;
      _pillError = null;
      _lastBarcode = null;
      _pillResultVisible = false;
    });
  }

  void _resetVision() {
    setState(() {
      _visionData = null;
      _visionError = null;
      _visionResultVisible = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface.withValues(alpha: 0.95),
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text('AI Vision & Scanner', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w600)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5))),
            ),
            child: TabBar(
              controller: _tabCtrl,
              indicatorColor: ZyntraColors.cyan,
              indicatorSize: TabBarIndicatorSize.tab,
              indicatorWeight: 3,
              labelColor: ZyntraColors.cyan,
              unselectedLabelColor: ZyntraColors.white70,
              labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
              unselectedLabelStyle: GoogleFonts.inter(fontWeight: FontWeight.w500, fontSize: 13),
              tabs: const [
                Tab(icon: Icon(Icons.qr_code_scanner_rounded), text: 'Pill Scanner'),
                Tab(icon: Icon(Icons.visibility_rounded), text: 'AI Vision'),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: [
          _buildPillScanner(),
          _buildAIVision(),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────
  // Pill Scanner Tab
  // ──────────────────────────────────────────────

  Widget _buildPillScanner() {
    return Stack(
      children: [
        MobileScanner(
          controller: _scannerCtrl,
          onDetect: _onBarcodeDetect,
          fit: BoxFit.cover,
        ),
        // Dim overlay with scan area highlight
        IgnorePointer(
          child: Container(
            color: Colors.black.withValues(alpha: 0.3),
            child: Center(
              child: Container(
                width: 260,
                height: 260,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.6), width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: ZyntraColors.cyan.withValues(alpha: 0.15),
                      blurRadius: 30,
                      spreadRadius: 8,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        // Corner brackets
        IgnorePointer(
          child: Center(
            child: SizedBox(
              width: 260,
              height: 260,
              child: CustomPaint(
                painter: _ScannerCornerPainter(
                  color: ZyntraColors.cyan,
                  lineWidth: 4,
                  cornerLength: 24,
                ),
              ),
            ),
          ),
        ),
        // Hint
        Positioned(
          top: MediaQuery.of(context).padding.top + 100,
          left: 0,
          right: 0,
          child: Center(
            child: _glassCard(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.qr_code_scanner_rounded, color: ZyntraColors.cyan, size: 18),
                  const SizedBox(width: 8),
                  Text('Align barcode within the frame', style: ZyntraText.label(13)),
                ],
              ),
            ),
          ),
        ),
        // Loading
        if (_pillLoading) _buildFullLoading('Verifying medicine...'),
        // Error banner
        if (_pillError != null && !_pillLoading)
          Positioned(
            bottom: 120,
            left: 20,
            right: 20,
            child: _glassCard(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.error_outline_rounded, color: ZyntraColors.red, size: 20),
                  const SizedBox(width: 12),
                  Expanded(child: Text(_pillError!, style: ZyntraText.body(13, color: ZyntraColors.red))),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: ZyntraColors.white70, size: 20),
                    onPressed: () => setState(() => _pillError = null),
                  ),
                ],
              ),
            ),
          ),
        // Result sheet
        if (_pillResultVisible && _pillData != null)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildMedicineSheet(),
          ),
      ],
    );
  }

  Widget _buildMedicineSheet() {
    final d = _pillData!;
    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.55),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            ZyntraColors.surface.withValues(alpha: 0.95),
            ZyntraColors.surface,
          ],
        ),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: ZyntraColors.border)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Padding(
            padding: const EdgeInsets.only(top: 12, bottom: 4),
            child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.white40, borderRadius: BorderRadius.circular(2))),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: ZyntraColors.green.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.medication_rounded, color: ZyntraColors.green, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(d['name'] ?? 'Medicine', style: ZyntraText.heading(18)),
                      if (d['manufacturer'] != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(d['manufacturer'], style: ZyntraText.body(12)),
                        ),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: _resetPillScanner,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.card,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: ZyntraColors.border),
                    ),
                    child: const Icon(Icons.close_rounded, color: ZyntraColors.white70, size: 20),
                  ),
                ),
              ],
            ),
          ),
          // Body
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (d['composition'] != null) _pillField('Composition', d['composition']),
                  if (d['uses'] != null) _pillField('Uses', d['uses']),
                  if (d['sideEffects'] != null) _pillField('Side Effects', d['sideEffects']),
                  if (d['warnings'] != null) _pillField('Warnings', d['warnings']),
                  if (d['price'] != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Row(
                        children: [
                          Text('Price: ', style: ZyntraText.body(16)),
                          Text('\u20B9${d['price']}', style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700, color: ZyntraColors.green)),
                        ],
                      ),
                    ),
                  if (d['verified'] == true)
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Row(
                        children: [
                          Icon(Icons.verified_rounded, color: ZyntraColors.cyan, size: 18),
                          const SizedBox(width: 6),
                          Text('Verified by ZyntraCare', style: ZyntraText.body(13, color: ZyntraColors.cyan)),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate().slideY(begin: 1, end: 0, duration: 350.ms, curve: Curves.easeOutCubic);
  }

  Widget _pillField(String label, dynamic value) {
    final text = value is String ? value : value.toString();
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: ZyntraColors.cyan, letterSpacing: 0.5)),
          const SizedBox(height: 4),
          Text(text, style: ZyntraText.body(14)),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────
  // AI Vision Tab
  // ──────────────────────────────────────────────

  Widget _buildAIVision() {
    if (!_camReady) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: ZyntraColors.card,
                shape: BoxShape.circle,
                border: Border.all(color: ZyntraColors.border),
              ),
              child: const SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(strokeWidth: 3, color: ZyntraColors.cyan),
              ),
            ),
            const SizedBox(height: 20),
            Text('Initializing camera...', style: ZyntraText.body(14)),
            const SizedBox(height: 6),
            Text('Grant camera permission when prompted', style: ZyntraText.body(12)),
          ],
        ),
      );
    }
    return Stack(
      children: [
        CameraPreview(_camCtrl!),
        // Top hint
        Positioned(
          top: 16,
          left: 20,
          right: 20,
          child: _glassCard(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.text_fields_rounded, color: ZyntraColors.cyan, size: 16),
                const SizedBox(width: 8),
                Text('Capture an image to recognize text & analyze', style: ZyntraText.label(12)),
              ],
            ),
          ),
        ),
        // Loading
        if (_visionLoading) _buildFullLoading('Analyzing image...'),
        // Error
        if (_visionError != null && !_visionLoading)
          Positioned(
            bottom: 120,
            left: 20,
            right: 20,
            child: _glassCard(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.error_outline_rounded, color: ZyntraColors.red, size: 20),
                  const SizedBox(width: 12),
                  Expanded(child: Text(_visionError!, style: ZyntraText.body(13, color: ZyntraColors.red))),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: ZyntraColors.white70, size: 20),
                    onPressed: () => setState(() => _visionError = null),
                  ),
                ],
              ),
            ),
          ),
        // Capture button
        Positioned(
          bottom: 40,
          left: 0,
          right: 0,
          child: Column(
            children: [
              GestureDetector(
                onTap: _captureAndAnalyze,
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 4),
                    boxShadow: [
                      BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 20, spreadRadius: 2),
                    ],
                  ),
                  child: Container(
                    margin: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                    child: const Icon(Icons.camera_alt_rounded, color: ZyntraColors.cyan, size: 32),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text('Tap to capture', style: GoogleFonts.inter(fontSize: 12, color: Colors.white70)),
            ],
          ),
        ),
        // Result sheet
        if (_visionResultVisible && _visionData != null)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildVisionSheet(),
          ),
      ],
    );
  }

  Widget _buildVisionSheet() {
    final d = _visionData!;
    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.55),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            ZyntraColors.surface.withValues(alpha: 0.95),
            ZyntraColors.surface,
          ],
        ),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: ZyntraColors.border)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Padding(
            padding: const EdgeInsets.only(top: 12, bottom: 4),
            child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.white40, borderRadius: BorderRadius.circular(2))),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: ZyntraColors.purple.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.visibility_rounded, color: ZyntraColors.purple, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text('Vision Analysis', style: ZyntraText.heading(18)),
                ),
                GestureDetector(
                  onTap: _resetVision,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.card,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: ZyntraColors.border),
                    ),
                    child: const Icon(Icons.close_rounded, color: ZyntraColors.white70, size: 20),
                  ),
                ),
              ],
            ),
          ),
          // Body
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (d['label'] != null || d['title'] != null)
                    _visionField('Label', d['label'] ?? d['title']),
                  if (d['description'] != null || d['summary'] != null)
                    _visionField('Description', d['description'] ?? d['summary']),
                  if (d['analysis'] != null || d['result'] != null)
                    _visionField('Analysis', d['analysis'] ?? d['result']),
                  if (d['recommendations'] != null || d['suggestions'] != null)
                    _visionField('Recommendations', d['recommendations'] ?? d['suggestions']),
                  // Show all remaining fields
                  ...d.entries
                    .where((e) => !['label', 'title', 'description', 'summary', 'analysis', 'result', 'recommendations', 'suggestions', 'success', 'data'].contains(e.key))
                    .map((e) => _visionField(e.key, e.value)),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate().slideY(begin: 1, end: 0, duration: 350.ms, curve: Curves.easeOutCubic);
  }

  Widget _visionField(String label, dynamic value) {
    final text = value is String ? value : value.toString();
    if (text.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: ZyntraColors.purple, letterSpacing: 0.5)),
          const SizedBox(height: 4),
          Text(text, style: ZyntraText.body(14)),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────
  // Shared Widgets
  // ──────────────────────────────────────────────

  Widget _glassCard({required Widget child, EdgeInsetsGeometry? padding}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: ZyntraColors.card.withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.4)),
          ),
          child: child,
        ),
      ),
    );
  }

  Widget _buildFullLoading(String message) {
    return Positioned.fill(
      child: Container(
        color: ZyntraColors.bg.withValues(alpha: 0.7),
        child: Center(
          child: _glassCard(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(
                  width: 32,
                  height: 32,
                  child: CircularProgressIndicator(strokeWidth: 3, color: ZyntraColors.cyan),
                ),
                const SizedBox(height: 16),
                Text(message, style: ZyntraText.body(14)),
              ],
            ),
          ),
        ),
      ),
    );
  }

}

// ──────────────────────────────────────────────
// Scanner Corner Painter
// ──────────────────────────────────────────────

class _ScannerCornerPainter extends CustomPainter {
  final Color color;
  final double lineWidth;
  final double cornerLength;

  _ScannerCornerPainter({
    required this.color,
    this.lineWidth = 4,
    this.cornerLength = 24,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = lineWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    // Top-left
    path.moveTo(0, cornerLength);
    path.lineTo(0, 0);
    path.lineTo(cornerLength, 0);
    // Top-right
    path.moveTo(size.width - cornerLength, 0);
    path.lineTo(size.width, 0);
    path.lineTo(size.width, cornerLength);
    // Bottom-right
    path.moveTo(size.width, size.height - cornerLength);
    path.lineTo(size.width, size.height);
    path.lineTo(size.width - cornerLength, size.height);
    // Bottom-left
    path.moveTo(cornerLength, size.height);
    path.lineTo(0, size.height);
    path.lineTo(0, size.height - cornerLength);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _ScannerCornerPainter old) =>
      old.color != color || old.lineWidth != lineWidth || old.cornerLength != cornerLength;
}
