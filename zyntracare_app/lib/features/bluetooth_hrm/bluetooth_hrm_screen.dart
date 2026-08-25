import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';

class BluetoothHrmScreen extends StatefulWidget {
  const BluetoothHrmScreen({super.key});
  @override State<BluetoothHrmScreen> createState() => _BluetoothHrmScreenState();
}

class _BluetoothHrmScreenState extends State<BluetoothHrmScreen> with TickerProviderStateMixin {
  bool _loading = true;
  bool _scanning = false;
  bool _autoScan = false;
  bool _connected = false;
  String? _connectedDevice;
  int _heartRate = 72;
  late AnimationController _pulseCtrl;
  late AnimationController _scanCtrl;

  final _devices = [
    {'name': 'ZyntraBand v2', 'id': '00:1A:7D:DA:71:01', 'rssi': -45},
    {'name': 'PulseSensor Pro', 'id': '00:1A:7D:DA:71:02', 'rssi': -62},
    {'name': 'HeartMate', 'id': '00:1A:7D:DA:71:03', 'rssi': -78},
  ];

  final List<int> _hrHistory = List.generate(60, (i) => 65 + (i % 15));

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: 600.ms)..repeat(reverse: true);
    _scanCtrl = AnimationController(vsync: this, duration: 1200.ms)..repeat();
    Future.delayed(1800.ms, () {
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _scanCtrl.dispose();
    super.dispose();
  }

  int get _avgHr => _hrHistory.reduce((a, b) => a + b) ~/ _hrHistory.length;
  int get _minHr => _hrHistory.reduce(math.min);
  int get _maxHr => _hrHistory.reduce(math.max);
  int get _calories => ((_avgHr * 0.15) * 10).round();

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
              _buildConnectButton(),
              const SizedBox(height: 24),
              _buildHeartRateDisplay(),
              const SizedBox(height: 24),
              _buildChart(),
              const SizedBox(height: 24),
              _buildStatsRow(),
              const SizedBox(height: 24),
              _buildDeviceList(),
              const SizedBox(height: 20),
              _buildAutoScanToggle(),
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
              Text('Bluetooth HRM', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
              if (_connected && _connectedDevice != null)
                Text('Connected to $_connectedDevice', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 11, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.05, end: 0);
  }

  Widget _buildConnectButton() {
    return GestureDetector(
      onTap: _scanning ? null : () {
        setState(() => _scanning = true);
        Future.delayed(3.seconds, () {
          if (mounted) setState(() => _scanning = false);
        });
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          gradient: _scanning
              ? const LinearGradient(colors: [ZyntraColors.green, ZyntraColors.teal])
              : const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(
            color: (_scanning ? ZyntraColors.green : ZyntraColors.cyan).withValues(alpha: 0.3),
            blurRadius: 16, offset: const Offset(0, 6),
          )],
        ),
        child: AnimatedBuilder(
          animation: _scanCtrl,
          builder: (_, __) {
            final angle = _scanning ? _scanCtrl.value * 2 * math.pi : 0.0;
            return Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Transform.rotate(
                  angle: angle,
                  child: Icon(_scanning ? Icons.bluetooth_searching_rounded : Icons.bluetooth_rounded, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 10),
                Text(
                  _scanning ? 'Scanning for devices...' : 'Connect Device',
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                ),
              ],
            );
          },
        ),
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildHeartRateDisplay() {
    final hrColor = _heartRate < 60 ? ZyntraColors.teal :
                    _heartRate > 100 ? ZyntraColors.red : ZyntraColors.green;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _connected ? hrColor.withValues(alpha: 0.3) : ZyntraColors.border),
        boxShadow: _connected ? [BoxShadow(color: hrColor.withValues(alpha: 0.08), blurRadius: 24, spreadRadius: 1)] : null,
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedBuilder(
                animation: _pulseCtrl,
                builder: (_, __) {
                  final pulseSize = _connected ? 14.0 + _pulseCtrl.value * 8 : 14.0;
                  return Container(
                    width: pulseSize, height: pulseSize,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _connected ? hrColor : ZyntraColors.white40,
                      boxShadow: _connected ? [BoxShadow(color: hrColor.withValues(alpha: 0.4), blurRadius: 8, spreadRadius: 2)] : null,
                    ),
                  );
                },
              ),
              const SizedBox(width: 10),
              Text('LIVE', style: GoogleFonts.inter(color: hrColor, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 2)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AnimatedBuilder(
                animation: _pulseCtrl,
                builder: (_, __) {
                  final scale = _connected ? 1.0 + _pulseCtrl.value * 0.03 : 1.0;
                  return Transform.scale(
                    scale: scale,
                    child: Text(
                      '$_heartRate',
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 72, fontWeight: FontWeight.w800, height: 1.0),
                    ),
                  );
                },
              ),
              const SizedBox(width: 6),
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text('BPM', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 18, fontWeight: FontWeight.w500)),
              ),
            ],
          ),
          if (!_connected) ...[
            const SizedBox(height: 12),
            Text('Connect a device to see live heart rate', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 12)),
          ],
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildChart() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Heart Rate (Last 60s)', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          SizedBox(
            height: 120,
            child: CustomPaint(
              size: Size.infinite,
              painter: _HRChartPainter(_hrHistory, _connected ? ZyntraColors.cyan : ZyntraColors.white40),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildStatsRow() {
    final stats = [
      {'label': 'Avg HR', 'value': '${_avgHr}', 'unit': 'bpm', 'color': ZyntraColors.purple},
      {'label': 'Min', 'value': '$_minHr', 'unit': 'bpm', 'color': ZyntraColors.teal},
      {'label': 'Max', 'value': '$_maxHr', 'unit': 'bpm', 'color': ZyntraColors.amber},
      {'label': 'Calories', 'value': '$_calories', 'unit': 'kcal', 'color': ZyntraColors.pink},
    ];

    return Row(
      children: stats.map((s) => Expanded(
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 6),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            children: [
              Text(s['value'] as String, style: GoogleFonts.poppins(color: s['color'] as Color, fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(s['unit'] as String, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
              const SizedBox(height: 4),
              Text(s['label'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
            ],
          ),
        ),
      )).toList(),
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }

  Widget _buildDeviceList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Available Devices', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 14),
        ..._devices.map((d) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _connectedDevice == d['name'] ? ZyntraColors.green : ZyntraColors.border,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 10, height: 10,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _connectedDevice == d['name'] ? ZyntraColors.green : ZyntraColors.white40,
                  boxShadow: _connectedDevice == d['name']
                      ? [BoxShadow(color: ZyntraColors.green.withValues(alpha: 0.5), blurRadius: 6, spreadRadius: 1)]
                      : null,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(d['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                    Text('${d['id']}  •  ${d['rssi']} dBm', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
                  ],
                ),
              ),
              GestureDetector(
                onTap: () {
                  setState(() {
                    if (_connectedDevice == d['name']) {
                      _connected = false;
                      _connectedDevice = null;
                    } else {
                      _connected = true;
                      _connectedDevice = d['name'] as String;
                      _heartRate = 68 + math.Random().nextInt(30);
                    }
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: _connectedDevice == d['name']
                        ? ZyntraColors.red.withValues(alpha: 0.15)
                        : ZyntraColors.cyan.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: _connectedDevice == d['name']
                          ? ZyntraColors.red.withValues(alpha: 0.3)
                          : ZyntraColors.cyan.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Text(
                    _connectedDevice == d['name'] ? 'Disconnect' : 'Connect',
                    style: GoogleFonts.inter(
                      color: _connectedDevice == d['name'] ? ZyntraColors.red : ZyntraColors.cyan,
                      fontSize: 12, fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        )).toList(),
      ],
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  Widget _buildAutoScanToggle() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.bluetooth_searching_rounded, color: ZyntraColors.cyan, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Auto-Scan', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                Text('Automatically scan for nearby devices', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              ],
            ),
          ),
          Transform.scale(
            scale: 0.8,
            child: Switch(
              value: _autoScan,
              onChanged: (v) => setState(() => _autoScan = v),
              activeColor: ZyntraColors.cyan,
              activeTrackColor: ZyntraColors.cyan.withValues(alpha: 0.3),
              inactiveTrackColor: ZyntraColors.border,
            ),
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
            Container(height: 56, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
            const SizedBox(height: 20),
            Container(height: 200, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(24))),
            const SizedBox(height: 20),
            Container(height: 140, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20))),
            const SizedBox(height: 20),
            Container(height: 40, width: 160, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(8))),
            const SizedBox(height: 14),
            ...List.generate(3, (_) => Container(height: 60, margin: const EdgeInsets.only(bottom: 10), decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)))),
          ],
        ),
      ),
    );
  }
}

class _HRChartPainter extends CustomPainter {
  final List<int> data;
  final Color lineColor;

  _HRChartPainter(this.data, this.lineColor);

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final paint = Paint()
      ..color = lineColor
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final fillPaint = Paint()
      ..shader = LinearGradient(
        colors: [lineColor.withValues(alpha: 0.3), lineColor.withValues(alpha: 0.0)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final path = Path();
    final fillPath = Path();
    final min = data.reduce(math.min) - 5;
    final max = data.reduce(math.max) + 5;
    final range = (max - min).toDouble();

    for (int i = 0; i < data.length; i++) {
      final x = (i / (data.length - 1)) * size.width;
      final y = size.height - ((data[i] - min) / range) * (size.height - 20) - 10;
      if (i == 0) {
        path.moveTo(x, y);
        fillPath.moveTo(x, y);
      } else {
        path.lineTo(x, y);
        fillPath.lineTo(x, y);
      }
    }

    fillPath.lineTo(size.width, size.height);
    fillPath.lineTo(0, size.height);
    fillPath.close();

    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, paint);

    final dotPaint = Paint()
      ..color = lineColor
      ..style = PaintingStyle.fill;
    final lastX = size.width;
    final lastY = size.height - ((data.last - min) / range) * (size.height - 20) - 10;
    canvas.drawCircle(Offset(lastX, lastY), 4, dotPaint);
  }

  @override
  bool shouldRepaint(covariant _HRChartPainter old) => old.data != data;
}
