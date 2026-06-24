import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class HospitalDashboardScreen extends StatefulWidget {
  const HospitalDashboardScreen({super.key});
  @override State<HospitalDashboardScreen> createState() => _HospitalDashboardScreenState();
}

class _HospitalDashboardScreenState extends State<HospitalDashboardScreen> {
  bool _loading = true;
  Map<String, dynamic> _data = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.get('/api/hospital-dashboard');
      if (mounted && res != null) {
        setState(() => _data = res is Map ? Map<String, dynamic>.from(res) : (res['data'] ?? {}));
      }
    } catch (_) {}
    if (_data.isEmpty && mounted) setState(() => _data = _placeholderData());
    if (mounted) setState(() => _loading = false);
  }

  Map<String, dynamic> _placeholderData() => {
    'totalBeds': 500,
    'occupiedBeds': 380,
    'availableBeds': 120,
    'opdToday': 342,
    'bedOccupancy': [65, 68, 72, 70, 75, 78, 76, 80, 82, 78, 76, 74],
    'recentAdmissions': [
      {'name': 'Rajesh Kumar', 'age': 45, 'condition': 'Cardiac', 'room': '201', 'time': '10:30 AM', 'severity': 'critical'},
      {'name': 'Priya Singh', 'age': 28, 'condition': 'Maternity', 'room': '305', 'time': '11:00 AM', 'severity': 'stable'},
      {'name': 'Amit Verma', 'age': 60, 'condition': 'Orthopedic', 'room': '112', 'time': '11:30 AM', 'severity': 'moderate'},
      {'name': 'Sunita Patil', 'age': 52, 'condition': 'Neurology', 'room': '408', 'time': '12:00 PM', 'severity': 'critical'},
      {'name': 'Vikram Joshi', 'age': 35, 'condition': 'General', 'room': '215', 'time': '12:30 PM', 'severity': 'stable'},
    ],
    'surgeries': [
      {'patient': 'Meera Devi', 'procedure': 'C-Section', 'time': '09:00 AM', 'doctor': 'Dr. Sharma'},
      {'patient': 'Rohan Das', 'procedure': 'Knee Replacement', 'time': '11:00 AM', 'doctor': 'Dr. Verma'},
      {'patient': 'Anita Gupta', 'procedure': 'Gallbladder Removal', 'time': '02:00 PM', 'doctor': 'Dr. Patel'},
    ],
    'staffOnDuty': {'doctors': 45, 'nurses': 120, 'support': 80},
    'lowStock': ['Paracetamol Inj.', 'Surgical Gloves', 'IV Drip Sets', 'Bandages'],
  };

  Color _severityColor(String s) {
    switch (s) {
      case 'critical': return ZyntraColors.red;
      case 'moderate': return ZyntraColors.amber;
      default: return ZyntraColors.green;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading
            ? _buildShimmer()
            : Column(
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
                            Text('Hospital Dashboard', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                              child: const Icon(Icons.local_hospital_rounded, color: Colors.white, size: 22),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: RefreshIndicator(
                      color: ZyntraColors.cyan,
                      backgroundColor: ZyntraColors.card,
                      onRefresh: _load,
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.only(bottom: 100),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 16),
                            // Stats Row
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Row(
                                children: [
                                  Expanded(child: _statCard('Total Beds', '${_data['totalBeds'] ?? 0}', ZyntraColors.cyan, Icons.bed_rounded)),
                                  const SizedBox(width: 8),
                                  Expanded(child: _statCard('Occupied', '${_data['occupiedBeds'] ?? 0}', ZyntraColors.amber, Icons.person_rounded)),
                                  const SizedBox(width: 8),
                                  Expanded(child: _statCard('Available', '${_data['availableBeds'] ?? 0}', ZyntraColors.green, Icons.check_circle_rounded)),
                                  const SizedBox(width: 8),
                                  Expanded(child: _statCard('OPD Today', '${_data['opdToday'] ?? 0}', ZyntraColors.purple, Icons.people_rounded)),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),
                            // Bed Occupancy Chart
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                              child: Text('Bed Occupancy (Last 12 Months)', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Container(
                                height: 220,
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20), border: Border.all(color: ZyntraColors.border)),
                                child: LineChart(
                                  LineChartData(
                                    gridData: FlGridData(
                                      show: true,
                                      drawVerticalLine: false,
                                      horizontalInterval: 20,
                                      getDrawingHorizontalLine: (v) => FlLine(color: ZyntraColors.border.withValues(alpha: 0.3), strokeWidth: 0.5),
                                    ),
                                    titlesData: FlTitlesData(
                                      leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 32, getTitlesWidget: (v, _) => Text('${v.toInt()}%', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)))),
                                      bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: (v, _) {
                                        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                                        final i = v.toInt();
                                        if (i < 0 || i >= months.length) return const SizedBox.shrink();
                                        return Padding(padding: const EdgeInsets.only(top: 4), child: Text(months[i], style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 8)));
                                      }, reservedSize: 20)),
                                      topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                      rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                    ),
                                    borderData: FlBorderData(show: false),
                                    lineBarsData: [
                                      LineChartBarData(
                                        spots: (_data['bedOccupancy'] as List?)?.asMap().entries.map((e) => FlSpot(e.key.toDouble(), (e.value as num).toDouble())).toList() ?? [],
                                        isCurved: true,
                                        color: ZyntraColors.cyan,
                                        barWidth: 3,
                                        dotData: FlDotData(show: false),
                                        belowBarData: BarAreaData(show: true, color: ZyntraColors.cyan.withValues(alpha: 0.1)),
                                        gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                                      ),
                                    ],
                                    minY: 0,
                                    maxY: 100,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            // Recent Admissions
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                              child: Row(
                                children: [
                                  Text('Recent Admissions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                  const Spacer(),
                                  Text('Last 5', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                                ],
                              ),
                            ),
                            ...((_data['recentAdmissions'] as List?)?.map((a) => _admissionCard(a)).toList() ?? []),
                            const SizedBox(height: 20),
                            // Today's Surgeries
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                              child: Text("Today's Surgeries", style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            ),
                            ...((_data['surgeries'] as List?)?.map((s) => _surgeryCard(s)).toList() ?? []),
                            const SizedBox(height: 20),
                            // Staff + Inventory Alerts
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(child: _staffCard()),
                                  const SizedBox(width: 12),
                                  Expanded(child: _inventoryAlertCard()),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),
                            // Quick Actions
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                              child: Text('Quick Actions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Row(
                                children: [
                                  Expanded(child: _quickAction(Icons.person_add_rounded, 'Add Patient', ZyntraColors.cyan)),
                                  const SizedBox(width: 8),
                                  Expanded(child: _quickAction(Icons.checklist_rounded, 'Discharge', ZyntraColors.green)),
                                  const SizedBox(width: 8),
                                  Expanded(child: _quickAction(Icons.swap_horiz_rounded, 'Transfer', ZyntraColors.amber)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _statCard(String label, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
          Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 8)),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _admissionCard(Map<String, dynamic> a) {
    final severity = a['severity'] ?? 'stable';
    final sc = _severityColor(severity);
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
      child: Row(
        children: [
          Container(
            width: 4, height: 40,
            decoration: BoxDecoration(color: sc, borderRadius: BorderRadius.circular(4)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(a['name'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                Row(
                  children: [
                    Text('${a['age'] ?? ''} yrs', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                    const SizedBox(width: 8),
                    Text(a['condition'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                    const SizedBox(width: 8),
                    Text('Rm ${a['room'] ?? ''}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                  ],
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: sc.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                child: Text(severity, style: GoogleFonts.inter(color: sc, fontSize: 9, fontWeight: FontWeight.w600)),
              ),
              Text(a['time'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _surgeryCard(Map<String, dynamic> s) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: ZyntraColors.purple.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.local_hospital_rounded, color: ZyntraColors.purple, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(s['patient'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                Text(s['procedure'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(s['time'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 11, fontWeight: FontWeight.w600)),
              Text(s['doctor'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _staffCard() {
    final staff = _data['staffOnDuty'] as Map? ?? {};
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: ZyntraColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.people_rounded, color: ZyntraColors.teal, size: 16),
              const SizedBox(width: 6),
              Text('Staff On Duty', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 10),
          _staffRow('Doctors', '${staff['doctors'] ?? 0}', ZyntraColors.cyan),
          _staffRow('Nurses', '${staff['nurses'] ?? 0}', ZyntraColors.purple),
          _staffRow('Support', '${staff['support'] ?? 0}', ZyntraColors.teal),
        ],
      ),
    );
  }

  Widget _staffRow(String label, String count, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Container(
            width: 8, height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
          const Spacer(),
          Text(count, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _inventoryAlertCard() {
    final lowStock = _data['lowStock'] as List? ?? [];
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ZyntraColors.red.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: ZyntraColors.amber, size: 16),
              const SizedBox(width: 6),
              Text('Inventory Alerts', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 10),
          ...lowStock.take(3).map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                const Icon(Icons.fiber_manual_record_rounded, color: ZyntraColors.red, size: 6),
                const SizedBox(width: 6),
                Expanded(child: Text(item.toString(), style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10))),
              ],
            ),
          )),
          if (lowStock.length > 3)
            Text('+${lowStock.length - 3} more', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
        ],
      ),
    );
  }

  Widget _quickAction(IconData icon, String label, Color color) {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('$label - Coming soon', style: GoogleFonts.inter(color: Colors.white)),
          backgroundColor: color,
          behavior: SnackBarBehavior.floating,
        ));
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 4),
            Text(label, style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Column(
          children: [
            Row(children: [
              Expanded(child: Container(height: 80, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)))),
              SizedBox(width: 8),
              Expanded(child: Container(height: 80, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)))),
              SizedBox(width: 8),
              Expanded(child: Container(height: 80, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)))),
              SizedBox(width: 8),
              Expanded(child: Container(height: 80, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)))),
            ]),
            const SizedBox(height: 12),
            Container(height: 220, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20))),
            const SizedBox(height: 12),
            Container(height: 70, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14))),
            const SizedBox(height: 8),
            Container(height: 70, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14))),
          ],
        ),
      ),
    );
  }
}
