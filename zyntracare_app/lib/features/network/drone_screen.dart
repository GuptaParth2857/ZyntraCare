import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class DroneScreen extends StatefulWidget {
  const DroneScreen({super.key});
  @override State<DroneScreen> createState() => _DroneScreenState();
}

class _DroneScreenState extends State<DroneScreen> {
  final _api = ApiService();
  bool _loading = true;
  List<Map<String, dynamic>> _drones = [];
  int _deliveriesToday = 0;
  double _totalDistance = 0;
  bool _tracking = false;
  double _trackProgress = 0;
  Timer? _trackTimer;

  final _pickupCtrl = TextEditingController();
  final _dropCtrl = TextEditingController();
  String _packageType = 'Medical Kit';
  String _urgency = 'Normal';
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _fetchDrones();
  }

  @override
  void dispose() {
    _trackTimer?.cancel();
    _pickupCtrl.dispose();
    _dropCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchDrones() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/drone-network');
    if (mounted) {
      setState(() {
        if (res is List) {
          _drones = res.cast<Map<String, dynamic>>();
        } else if (res is Map && res['data'] != null) {
          _drones = (res['data'] as List).cast<Map<String, dynamic>>();
        } else {
          _drones = _mockDrones();
        }
        _deliveriesToday = 47;
        _totalDistance = 183.5;
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _mockDrones() {
    return [
      {'id': 'DRN-001', 'battery': 87, 'status': 'Available', 'location': 'Sector 18, Noida'},
      {'id': 'DRN-002', 'battery': 92, 'status': 'Available', 'location': 'Hauz Khas, Delhi'},
      {'id': 'DRN-003', 'battery': 45, 'status': 'In-Flight', 'location': 'En route to AIIMS'},
      {'id': 'DRN-004', 'battery': 15, 'status': 'Charging', 'location': 'Base Station - Noida'},
      {'id': 'DRN-005', 'battery': 73, 'status': 'Available', 'location': 'Connaught Place, Delhi'},
    ];
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Available': return ZyntraColors.green;
      case 'In-Flight': return ZyntraColors.cyan;
      case 'Charging': return ZyntraColors.amber;
      default: return ZyntraColors.white70;
    }
  }

  void _startDeliveryTracking() {
    setState(() {
      _tracking = true;
      _trackProgress = 0;
    });
    _trackTimer = Timer.periodic(const Duration(milliseconds: 50), (t) {
      setState(() {
        _trackProgress += 0.01;
        if (_trackProgress >= 1) {
          _trackProgress = 1;
          _trackTimer?.cancel();
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: const Text('Package delivered successfully!'),
            backgroundColor: ZyntraColors.green,
          ));
        }
      });
    });
  }

  void _showRequestDeliverySheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: ZyntraColors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Request Drone Delivery', style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              TextField(
                controller: _pickupCtrl,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                decoration: InputDecoration(
                  labelText: 'Pickup Location',
                  labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
                  prefixIcon: Icon(Icons.takeout_dining_rounded, color: ZyntraColors.cyan, size: 20),
                  filled: true, fillColor: ZyntraColors.card,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.cyan.withValues(alpha: 0.6))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _dropCtrl,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                decoration: InputDecoration(
                  labelText: 'Drop Location',
                  labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
                  prefixIcon: Icon(Icons.location_on_rounded, color: ZyntraColors.purple, size: 20),
                  filled: true, fillColor: ZyntraColors.card,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.purple.withValues(alpha: 0.6))),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _packageType,
                items: ['Medical Kit', 'Medicine', 'Lab Sample', 'Blood Unit', 'Equipment'].map((e) =>
                    DropdownMenuItem(value: e, child: Text(e, style: GoogleFonts.inter(color: Colors.white)))).toList(),
                onChanged: (v) => setState(() => _packageType = v!),
                style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                dropdownColor: ZyntraColors.card,
                decoration: InputDecoration(
                  labelText: 'Package Type',
                  labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
                  prefixIcon: Icon(Icons.inventory_2_rounded, color: ZyntraColors.teal, size: 20),
                  filled: true, fillColor: ZyntraColors.card,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.teal.withValues(alpha: 0.6))),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _urgency,
                items: ['Normal', 'Urgent', 'Emergency'].map((e) =>
                    DropdownMenuItem(value: e, child: Text(e, style: GoogleFonts.inter(color: Colors.white)))).toList(),
                onChanged: (v) => setState(() => _urgency = v!),
                style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                dropdownColor: ZyntraColors.card,
                decoration: InputDecoration(
                  labelText: 'Urgency',
                  labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
                  prefixIcon: Icon(Icons.warning_amber_rounded, color: _urgency == 'Emergency' ? ZyntraColors.red : ZyntraColors.amber, size: 20),
                  filled: true, fillColor: ZyntraColors.card,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.amber.withValues(alpha: 0.6))),
                ),
              ),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: _submitting ? null : () {
                  setState(() => _submitting = true);
                  Future.delayed(const Duration(seconds: 1), () {
                    if (!mounted) return;
                    setState(() => _submitting = false);
                    if (mounted) Navigator.pop(context);
                    _startDeliveryTracking();
                  });
                },
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Center(
                    child: _submitting
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text('Request Delivery', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface,
        elevation: 0,
        title: Text('Drone Network', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        actions: [
          GestureDetector(
            onTap: _fetchDrones,
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.refresh_rounded, color: ZyntraColors.cyan, size: 20),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: ZyntraColors.cyan,
        onRefresh: _fetchDrones,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildStatsRow(),
              const SizedBox(height: 16),
              if (_tracking) ...[
                _buildDeliveryTracker(),
                const SizedBox(height: 16),
              ],
              _buildDroneList(),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: _showRequestDeliverySheet,
                child: Container(
                  width: double.infinity,
                  height: 52,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.2), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.flight_rounded, color: Colors.white, size: 20),
                        const SizedBox(width: 8),
                        Text('Request Delivery', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsRow() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _statItem('Deliveries', '$_deliveriesToday', 'today', ZyntraColors.cyan),
          _statItem('Distance', _totalDistance.toStringAsFixed(1), 'km', ZyntraColors.purple),
          _statItem('Active', '${_drones.where((d) => d['status'] == 'In-Flight').length}', 'drones', ZyntraColors.green),
          _statItem('Available', '${_drones.where((d) => d['status'] == 'Available').length}', 'drones', ZyntraColors.teal),
        ],
      ),
    );
  }

  Widget _statItem(String label, String value, String unit, Color color) {
    return Column(
      children: [
        Text(value, style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
        Text(unit, style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.white70)),
        const SizedBox(height: 2),
        Text(label, style: GoogleFonts.inter(fontSize: 10, color: color)),
      ],
    );
  }

  Widget _buildDeliveryTracker() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.flight_takeoff_rounded, color: ZyntraColors.cyan, size: 18),
              const SizedBox(width: 8),
              Text('Delivery in Progress', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 80,
            child: CustomPaint(
              size: const Size(double.infinity, 80),
              painter: _PathPainter(progress: _trackProgress),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Pickup', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              Text('${(_trackProgress * 100).toStringAsFixed(0)}%', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 14, fontWeight: FontWeight.w700)),
              Text('Drop', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: _trackProgress,
              backgroundColor: ZyntraColors.surface,
              valueColor: const AlwaysStoppedAnimation<Color>(ZyntraColors.cyan),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDroneList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Drone Fleet', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 10),
        if (_loading) ...List.generate(3, (_) => _shimmerCard()),
        if (!_loading && _drones.isEmpty)
          Center(child: Padding(
            padding: const EdgeInsets.all(32),
            child: Text('No drones available', style: GoogleFonts.inter(color: ZyntraColors.white70)),
          )),
        if (!_loading)
          ..._drones.map((d) => _buildDroneCard(d)),
      ],
    );
  }

  Widget _buildDroneCard(Map<String, dynamic> drone) {
    final status = drone['status']?.toString() ?? 'Unknown';
    final sColor = _statusColor(status);
    final battery = drone['battery'] as int? ?? 0;
    final Color batColor = battery > 60 ? ZyntraColors.green : battery > 30 ? ZyntraColors.amber : ZyntraColors.red;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: sColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(Icons.flight_rounded, color: sColor, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(drone['id']?.toString() ?? '', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 2),
                Text(drone['location']?.toString() ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: sColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                child: Text(status, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600, color: sColor)),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.battery_std_rounded, color: batColor, size: 14),
                  const SizedBox(width: 3),
                  Text('$battery%', style: GoogleFonts.inter(fontSize: 11, color: batColor, fontWeight: FontWeight.w600)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _shimmerCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5))),
      child: Row(
        children: [
          Container(width: 42, height: 42, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12))),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(height: 12, width: 100, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
            const SizedBox(height: 4),
            Container(height: 10, width: 140, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
          ])),
        ],
      ),
    ).animate(onPlay: (ctrl) => ctrl.repeat()).shimmer(duration: 1500.ms, color: ZyntraColors.border.withValues(alpha: 0.3));
  }
}

class _PathPainter extends CustomPainter {
  final double progress;

  _PathPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = ZyntraColors.border
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final path = Path()
      ..moveTo(0, size.height * 0.5)
      ..quadraticBezierTo(size.width * 0.3, 0, size.width * 0.5, size.height * 0.4)
      ..quadraticBezierTo(size.width * 0.7, size.height * 0.8, size.width, size.height * 0.5);

    canvas.drawPath(path, paint);

    // Animated drone position along the path
    final progressPaint = Paint()
      ..color = ZyntraColors.cyan
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;

    final progressPath = Path();
    final metrics = path.computeMetrics();
    double totalLength = 0;
    for (final m in metrics) {
      totalLength += m.length;
    }
    double drawn = 0;
    final target = totalLength * progress;
    for (final m in metrics) {
      final segmentLength = m.length;
      if (drawn + segmentLength <= target) {
        progressPath.addPath(m.extractPath(0, segmentLength), Offset.zero);
      } else {
        progressPath.addPath(m.extractPath(0, target - drawn), Offset.zero);
        break;
      }
      drawn += segmentLength;
    }
    canvas.drawPath(progressPath, progressPaint);

    // Drone icon at current position
    for (final m in metrics) {
      final pos = m.getTangentForOffset(target.clamp(0, m.length));
      if (pos != null) {
        canvas.drawCircle(pos.position, 6, Paint()..color = ZyntraColors.cyan);
        canvas.drawCircle(pos.position, 3, Paint()..color = Colors.white);
        break;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _PathPainter old) => old.progress != progress;
}
