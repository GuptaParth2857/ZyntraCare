import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class GodModeScreen extends StatefulWidget {
  const GodModeScreen({super.key});
  @override State<GodModeScreen> createState() => _GodModeScreenState();
}

class _GodModeScreenState extends State<GodModeScreen> with TickerProviderStateMixin {
  final List<_CityDot> _cities = [
    _CityDot('Mumbai', 19.0760, 72.8777, ZyntraColors.cyan),
    _CityDot('Delhi', 28.7041, 77.1025, ZyntraColors.purple),
    _CityDot('Bangalore', 12.9716, 77.5946, ZyntraColors.teal),
    _CityDot('Chennai', 13.0827, 80.2707, ZyntraColors.green),
    _CityDot('Kolkata', 22.5726, 88.3639, ZyntraColors.pink),
    _CityDot('Hyderabad', 17.3850, 78.4867, ZyntraColors.cyan),
    _CityDot('Ahmedabad', 23.0225, 72.5714, ZyntraColors.amber),
    _CityDot('Pune', 18.5204, 73.8567, ZyntraColors.indigo),
    _CityDot('Jaipur', 26.9124, 75.7873, ZyntraColors.green),
    _CityDot('Lucknow', 26.8467, 80.9462, ZyntraColors.purple),
    _CityDot('Surat', 21.1702, 72.8311, ZyntraColors.teal),
    _CityDot('Bhopal', 23.2599, 77.4126, ZyntraColors.amber),
    _CityDot('Chandigarh', 30.7333, 76.7794, ZyntraColors.pink),
    _CityDot('Patna', 25.5941, 85.1376, ZyntraColors.indigo),
  ];

  final List<_Alert> _alerts = [];
  Timer? _alertTimer;
  late AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: 2.seconds, lowerBound: 0.7, upperBound: 1.0)
      ..repeat(reverse: true);
    _alertTimer = Timer.periodic(5.seconds, (_) {
      if (!mounted) return;
      _generateAlert();
    });
    _generateAlert();
    _generateAlert();
  }

  void _generateAlert() {
    final city = _cities[DateTime.now().millisecondsSinceEpoch % _cities.length];
    final types = [
      _AlertType('Emergency', 'Cardiac arrest reported', ZyntraColors.red),
      _AlertType('Critical', 'ICU bed shortage', ZyntraColors.red),
      _AlertType('Warning', 'Ambulance delayed 5 min', ZyntraColors.amber),
      _AlertType('Success', 'Drone delivered supplies', ZyntraColors.green),
    ];
    final type = types[DateTime.now().millisecondsSinceEpoch % types.length];
    setState(() {
      _alerts.insert(0, _Alert(city.name, type.message, type.color));
      if (_alerts.length > 20) _alerts.removeLast();
    });
  }

  @override
  void dispose() {
    _alertTimer?.cancel();
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildCityGrid(),
                    const SizedBox(height: 24),
                    _buildStatsRow(),
                    const SizedBox(height: 24),
                    _buildAlertFeed(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ZyntraColors.cyan, ZyntraColors.purple],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('God Mode', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
              Text('Admin Command Center', style: GoogleFonts.inter(color: Colors.white70, fontSize: 11)),
            ],
          ),
          const Spacer(),
          ScaleTransition(
            scale: _pulseCtrl,
            child: Container(
              width: 12, height: 12,
              decoration: BoxDecoration(
                color: ZyntraColors.green,
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: ZyntraColors.green.withValues(alpha: 0.6), blurRadius: 12)],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCityGrid() {
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
              const Icon(Icons.location_on_rounded, color: ZyntraColors.cyan, size: 16),
              const SizedBox(width: 8),
              Text('Coverage Map — Indian Cities', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text('14 cities', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: _cities.map((c) => GestureDetector(
              onTap: () => _showCityInfo(c),
              child: AnimatedContainer(
                duration: 300.ms,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: c.color.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: c.color.withValues(alpha: 0.25)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8, height: 8,
                      decoration: BoxDecoration(color: c.color, shape: BoxShape.circle, boxShadow: [BoxShadow(color: c.color.withValues(alpha: 0.4), blurRadius: 6)]),
                    ),
                    const SizedBox(width: 8),
                    Text(c.name, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }

  void _showCityInfo(_CityDot city) {
    showModalBottomSheet(
      context: context,
      backgroundColor: ZyntraColors.card,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: city.color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(16)),
              child: Icon(Icons.location_city_rounded, color: city.color, size: 36),
            ),
            const SizedBox(height: 16),
            Text(city.name, style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text('${city.lat}, ${city.lng}', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
            const SizedBox(height: 20),
            Row(
              children: [
                _statChip('Drones', '12', ZyntraColors.cyan),
                _statChip('Emergencies', '5', ZyntraColors.red),
                _statChip('Hospitals', '48', ZyntraColors.green),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _statChip(String label, String value, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: ZyntraColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Column(
          children: [
            Text(value, style: GoogleFonts.poppins(color: color, fontSize: 18, fontWeight: FontWeight.w700)),
            Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 9)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsRow() {
    final stats = [
      _StatItem('Active Users', '24,580', Icons.people_rounded, ZyntraColors.cyan),
      _StatItem('Drones Active', '1,247', Icons.flight_rounded, ZyntraColors.purple),
      _StatItem('Emergencies', '342', Icons.warning_rounded, ZyntraColors.red),
      _StatItem('Health Records', '1.2M', Icons.folder_rounded, ZyntraColors.teal),
      _StatItem('Response Time', '4.2m', Icons.timer_rounded, ZyntraColors.green),
      _StatItem('Uptime', '99.97%', Icons.cloud_done_rounded, ZyntraColors.amber),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.analytics_rounded, color: ZyntraColors.purple, size: 16),
            const SizedBox(width: 8),
            Text('Global Stats', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: stats.map((s) => SizedBox(
            width: (MediaQuery.of(context).size.width - 56) / 3,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [ZyntraColors.card, ZyntraColors.surface],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: s.color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                    child: Icon(s.icon, color: s.color, size: 14),
                  ),
                  const SizedBox(height: 6),
                  Text(s.value, style: GoogleFonts.poppins(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                  Text(s.label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 7), textAlign: TextAlign.center),
                ],
              ),
            ),
          )).toList(),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [ZyntraColors.card, ZyntraColors.surface],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _globalCounter('Active Connections', '45.2K', ZyntraColors.cyan),
              _globalCounter('Drone Count', '1,247', ZyntraColors.purple),
              _globalCounter('Emergencies', '342', ZyntraColors.red),
              _globalCounter('Health Records', '1.2M', ZyntraColors.teal),
            ],
          ),
        ),
      ],
    );
  }

  Widget _globalCounter(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: GoogleFonts.poppins(color: color, fontSize: 16, fontWeight: FontWeight.w700)),
        Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 8), textAlign: TextAlign.center),
      ],
    );
  }

  Widget _buildAlertFeed() {
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
              const Icon(Icons.notifications_active_rounded, color: ZyntraColors.amber, size: 16),
              const SizedBox(width: 8),
              Text('Live Alert Feed', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: ZyntraColors.red.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text('${_alerts.length} alerts', style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 9, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...(_alerts.isEmpty
              ? [Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Center(child: Text('No active alerts', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 12))),
                )]
              : _alerts.take(12).toList().asMap().entries.map((entry) {
                  final alert = entry.value;
                  return Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      border: Border(bottom: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.3))),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8, height: 8,
                          decoration: BoxDecoration(color: alert.color, shape: BoxShape.circle, boxShadow: [BoxShadow(color: alert.color.withValues(alpha: 0.4), blurRadius: 4)]),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(alert.city, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                    decoration: BoxDecoration(
                                      color: alert.color.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(alert.message.split(' ').first, style: GoogleFonts.inter(color: alert.color, fontSize: 8, fontWeight: FontWeight.w600)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(alert.message, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                            ],
                          ),
                        ),
                        Text(alert.time, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 8)),
                      ],
                    ),
                  );
                })),
        ],
      ),
    );
  }
}

class _CityDot {
  final String name;
  final double lat;
  final double lng;
  final Color color;
  const _CityDot(this.name, this.lat, this.lng, this.color);
}

class _AlertType {
  final String label;
  final String message;
  final Color color;
  const _AlertType(this.label, this.message, this.color);
}

class _Alert {
  final String city;
  final String message;
  final Color color;
  final String time;
  _Alert(this.city, this.message, this.color) : time = _formatTime(DateTime.now());

  static String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}

class _StatItem {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _StatItem(this.label, this.value, this.icon, this.color);
}
