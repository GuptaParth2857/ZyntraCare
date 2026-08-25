import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class WearablesScreen extends StatefulWidget {
  const WearablesScreen({super.key});
  @override State<WearablesScreen> createState() => _WearablesScreenState();
}

class _WearablesScreenState extends State<WearablesScreen> with TickerProviderStateMixin {
  List<ScanResult> _scanResults = [];
  bool _isScanning = false;
  bool _bluetoothOn = false;
  String? _connectedDeviceId;

  int _heartRate = 72;
  int _steps = 8432;
  double _spo2 = 98;
  double _temperature = 98.6;
  String _bloodPressure = '120/80';
  String _lastSynced = '2 min ago';
  int _batteryLevel = 78;

  late AnimationController _hrAnimCtrl;
  late AnimationController _stepsAnimCtrl;
  late AnimationController _spo2AnimCtrl;
  late AnimationController _tempAnimCtrl;
  late Timer _metricsTimer;
  StreamSubscription<List<ScanResult>>? _scanSub;

  final List<FlSpot> _heartRateHistory = List.generate(24, (i) => FlSpot(i.toDouble(), 68 + math.Random().nextInt(20).toDouble()));

  @override
  void initState() {
    super.initState();
    _hrAnimCtrl = AnimationController(vsync: this, duration: 1200.ms);
    _stepsAnimCtrl = AnimationController(vsync: this, duration: 1500.ms);
    _spo2AnimCtrl = AnimationController(vsync: this, duration: 1000.ms);
    _tempAnimCtrl = AnimationController(vsync: this, duration: 800.ms);
    _checkBluetooth();
    _startMetricsSimulation();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _hrAnimCtrl.forward();
      _stepsAnimCtrl.forward();
      _spo2AnimCtrl.forward();
      _tempAnimCtrl.forward();
    });
  }

  Future<void> _checkBluetooth() async {
    try {
      final state = await FlutterBluePlus.adapterState.first;
      setState(() => _bluetoothOn = state == BluetoothAdapterState.on);
    } catch (_) {
      setState(() => _bluetoothOn = false);
    }
  }

  Future<void> _startScan() async {
    if (_isScanning) return;
    setState(() { _isScanning = true; _scanResults = []; });
    try {
      _scanSub = FlutterBluePlus.scanResults.listen((results) {
        if (mounted) setState(() => _scanResults = results);
      });
      await FlutterBluePlus.startScan(timeout: const Duration(seconds: 10));
    } catch (_) {}
    if (mounted) setState(() => _isScanning = false);
  }

  void _connectToDevice(String deviceId) {
    setState(() => _connectedDeviceId = deviceId);
    _hrAnimCtrl.forward(from: 0);
    _stepsAnimCtrl.forward(from: 0);
    _spo2AnimCtrl.forward(from: 0);
    _tempAnimCtrl.forward(from: 0);
  }

  void _disconnectDevice() => setState(() => _connectedDeviceId = null);

  void _startMetricsSimulation() {
    _metricsTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (mounted && _connectedDeviceId != null) {
        setState(() {
          _heartRate = 68 + math.Random().nextInt(12);
          _steps += math.Random().nextInt(5);
          _spo2 = 96 + math.Random().nextInt(3).toDouble();
          _temperature = 97.8 + math.Random().nextInt(12) / 10;
          _bloodPressure = '${115 + math.Random().nextInt(10)}/${75 + math.Random().nextInt(10)}';
          _lastSynced = 'Just now';
          _batteryLevel = math.max(10, _batteryLevel - math.Random().nextInt(3));
          _heartRateHistory.removeAt(0);
          _heartRateHistory.add(FlSpot(23, _heartRate.toDouble()));
          for (int i = 0; i < 24; i++) {
            _heartRateHistory[i] = FlSpot(i.toDouble(), _heartRateHistory[i].y);
          }
        });
        _hrAnimCtrl.forward(from: 0);
        _stepsAnimCtrl.forward(from: 0);
        _spo2AnimCtrl.forward(from: 0);
        _tempAnimCtrl.forward(from: 0);
      }
    });
  }

  @override
  void dispose() {
    _hrAnimCtrl.dispose();
    _stepsAnimCtrl.dispose();
    _spo2AnimCtrl.dispose();
    _tempAnimCtrl.dispose();
    _metricsTimer.cancel();
    _scanSub?.cancel();
    try { FlutterBluePlus.stopScan(); } catch (_) {}
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface,
        elevation: 0,
        title: Text('Wearables', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        actions: [
          IconButton(
            icon: Icon(_bluetoothOn ? Icons.bluetooth_connected : Icons.bluetooth_disabled, color: _bluetoothOn ? ZyntraColors.cyan : ZyntraColors.red),
            onPressed: _checkBluetooth,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _buildSectionHeader('Devices', Icons.bluetooth),
          const SizedBox(height: 8),
          _buildBluetoothSection(),
          const SizedBox(height: 24),
          if (_connectedDeviceId != null) ...[
            _buildSectionHeader('Live Metrics', Icons.monitor_heart),
            const SizedBox(height: 8), _buildMetricsGrid(),
            const SizedBox(height: 24),
            _buildSectionHeader('Heart Rate History', Icons.show_chart),
            const SizedBox(height: 8), _buildHeartRateChart(),
            const SizedBox(height: 24),
            _buildSectionHeader('Sync Status', Icons.sync),
            const SizedBox(height: 8), _buildSyncStatus(),
          ],
        ]),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(children: [
      Icon(icon, color: ZyntraColors.cyan, size: 20),
      const SizedBox(width: 8),
      Text(title, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
    ]);
  }

  Widget _buildBluetoothSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card, borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.4)),
        boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.04), blurRadius: 16)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (!_bluetoothOn)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: ZyntraColors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Row(children: [
              Icon(Icons.warning, color: ZyntraColors.red, size: 20),
              const SizedBox(width: 8),
              Expanded(child: Text('Bluetooth is disabled. Enable it to scan for devices.', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13))),
            ]),
          )
        else
          GestureDetector(
            onTap: _isScanning ? null : _startScan,
            child: Container(
              height: 44,
              decoration: BoxDecoration(gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]), borderRadius: BorderRadius.circular(12)),
              child: Center(
                child: _isScanning
                    ? Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                        const SizedBox(width: 8),
                        Text('Scanning...', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                      ])
                    : Text('Scan for Devices', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
              ),
            ),
          ),
        const SizedBox(height: 12),
        if (_scanResults.isEmpty && _bluetoothOn && !_isScanning)
          Center(child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(children: [
              Icon(Icons.bluetooth_searching, size: 40, color: ZyntraColors.white70.withValues(alpha: 0.4)),
              const SizedBox(height: 6),
              Text('Tap scan to discover nearby devices', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
            ]),
          )),
        ..._scanResults.map((r) => _buildDeviceTile(r)),
        if (_connectedDeviceId != null)
          Container(
            margin: const EdgeInsets.only(top: 8), padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Row(children: [
              Container(width: 10, height: 10, decoration: const BoxDecoration(shape: BoxShape.circle, color: ZyntraColors.green)),
              const SizedBox(width: 8),
              Text('Connected', style: GoogleFonts.inter(color: ZyntraColors.green, fontWeight: FontWeight.w500, fontSize: 13)),
            ]),
          ),
      ]),
    );
  }

  Widget _buildDeviceTile(ScanResult result) {
    final device = result.device;
    final name = device.platformName.isNotEmpty ? device.platformName : 'Unknown Device';
    final rssi = result.rssi;
    final signalColor = rssi > -60 ? ZyntraColors.green : (rssi > -80 ? ZyntraColors.amber : ZyntraColors.red);
    final bars = rssi > -50 ? 4 : (rssi > -65 ? 3 : (rssi > -80 ? 2 : 1));
    final isConnected = device.remoteId.str == _connectedDeviceId;
    return Container(
      margin: const EdgeInsets.only(top: 8), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isConnected ? ZyntraColors.green.withValues(alpha: 0.4) : ZyntraColors.border.withValues(alpha: 0.3)),
      ),
      child: Row(children: [
        Container(width: 40, height: 40, decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
          child: Icon(Icons.watch, color: ZyntraColors.cyan, size: 22)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(name, style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w500, fontSize: 14)),
          const SizedBox(height: 2),
          Row(children: [
            ...List.generate(4, (i) => Container(width: 4, height: 10, margin: const EdgeInsets.only(right: 2),
              decoration: BoxDecoration(color: i < bars ? signalColor : ZyntraColors.border, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(width: 6),
            Text('$rssi dBm', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
          ]),
        ])),
        GestureDetector(
          onTap: isConnected ? _disconnectDevice : () => _connectToDevice(device.remoteId.str),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: isConnected ? ZyntraColors.red.withValues(alpha: 0.15) : ZyntraColors.green.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(isConnected ? 'Disconnect' : 'Connect', style: GoogleFonts.inter(color: isConnected ? ZyntraColors.red : ZyntraColors.green, fontWeight: FontWeight.w600, fontSize: 12)),
          ),
        ),
      ]),
    );
  }

  Widget _buildMetricsGrid() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.4)),
        boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.04), blurRadius: 16)]),
      child: Column(children: [
        Row(children: [
          Expanded(child: _buildMetricTile('Heart Rate', '$_heartRate', 'BPM', Icons.favorite, ZyntraColors.red, _hrAnimCtrl)),
          const SizedBox(width: 12),
          Expanded(child: _buildMetricTile('Blood Pressure', _bloodPressure, 'mmHg', Icons.monitor_heart, ZyntraColors.purple, null)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _buildMetricTile('SpO2', '${_spo2.toInt()}', '%', Icons.air, ZyntraColors.cyan, _spo2AnimCtrl)),
          const SizedBox(width: 12),
          Expanded(child: _buildMetricTile('Temperature', _temperature.toStringAsFixed(1), '°F', Icons.device_thermostat, ZyntraColors.amber, _tempAnimCtrl)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _buildMetricTile('Steps', '$_steps', 'steps', Icons.directions_walk, ZyntraColors.green, _stepsAnimCtrl)),
          const SizedBox(width: 12),
          Expanded(child: _buildMetricTile('Battery', '$_batteryLevel', '%', Icons.battery_std, _batteryLevel > 20 ? ZyntraColors.teal : ZyntraColors.red, null)),
        ]),
      ]),
    );
  }

  Widget _buildMetricTile(String label, String value, String unit, IconData icon, Color color, AnimationController? animCtrl) {
    Widget content = Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.15))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon, color: color, size: 16), const SizedBox(width: 6),
          Expanded(child: Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11), overflow: TextOverflow.ellipsis)),
        ]),
        const SizedBox(height: 8),
        Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(value, style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(width: 4),
          Padding(padding: const EdgeInsets.only(bottom: 2), child: Text(unit, style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70))),
        ]),
      ]),
    );
    if (animCtrl != null) {
      return AnimatedBuilder(animation: animCtrl, builder: (_, child) => child!, child: content).animate().fadeIn(duration: 600.ms).scaleXY(begin: 0.92, end: 1, duration: 600.ms, curve: Curves.elasticOut);
    }
    return content;
  }

  Widget _buildHeartRateChart() {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 16, 16, 16),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.4)),
        boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.04), blurRadius: 16)]),
      child: SizedBox(height: 180, child: LineChart(LineChartData(
        gridData: FlGridData(show: true, drawVerticalLine: false, horizontalInterval: 10, getDrawingHorizontalLine: (_) => FlLine(color: ZyntraColors.border.withValues(alpha: 0.3), strokeWidth: 1)),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 32, interval: 10, getTitlesWidget: (v, _) => Text(v.toInt().toString(), style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.white70)))),
          bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, interval: 4, getTitlesWidget: (v, _) => Text('${v.toInt()}h', style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.white70)))),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false), minX: 0, maxX: 23, minY: 50, maxY: 100,
        lineBarsData: [
          LineChartBarData(spots: _heartRateHistory, isCurved: true, color: ZyntraColors.red, barWidth: 2.5,
            isStrokeCapRound: true, dotData: FlDotData(show: false),
            belowBarData: BarAreaData(show: true, color: ZyntraColors.red.withValues(alpha: 0.1)),
            gradient: const LinearGradient(colors: [ZyntraColors.red, ZyntraColors.purple])),
        ],
        lineTouchData: LineTouchData(touchTooltipData: LineTouchTooltipData(
          getTooltipItems: (spots) => spots.map((s) => LineTooltipItem('${s.y.toInt()} BPM', TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12))).toList(),
        )),
      ))),
    );
  }

  Widget _buildSyncStatus() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.4)),
        boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.04), blurRadius: 16)]),
      child: Row(children: [
        Container(width: 44, height: 44, decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
          child: const Icon(Icons.cloud_done, color: ZyntraColors.green, size: 24)),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Last Synced', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
          const SizedBox(height: 2),
          Text(_lastSynced, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
        ])),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(color: _batteryLevel > 20 ? ZyntraColors.green.withValues(alpha: 0.15) : ZyntraColors.red.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.battery_std, size: 16, color: _batteryLevel > 20 ? ZyntraColors.green : ZyntraColors.red),
            const SizedBox(width: 4),
            Text('$_batteryLevel%', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: _batteryLevel > 20 ? ZyntraColors.green : ZyntraColors.red)),
          ]),
        ),
      ]),
    );
  }
}
