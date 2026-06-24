import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});
  @override State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _users = [];
  List<Map<String, dynamic>> _activityLog = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      await Future.wait([
        apiService.getHospitals(),
        apiService.getDoctors(),
      ]);
    } catch (_) {}
    if (mounted) {
      setState(() {
        _users = _placeholderUsers();
        _activityLog = _placeholderActivity();
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _placeholderUsers() => [
    {'name': 'Rajesh Kumar', 'email': 'rajesh@email.com', 'role': 'Patient', 'status': 'active', 'date': '2026-06-20'},
    {'name': 'Dr. Priya Sharma', 'email': 'priya@hospital.com', 'role': 'Doctor', 'status': 'active', 'date': '2026-06-19'},
    {'name': 'Sunita Das', 'email': 'sunita@email.com', 'role': 'Patient', 'status': 'active', 'date': '2026-06-18'},
    {'name': 'Amit Patel', 'email': 'amit@hospital.com', 'role': 'Doctor', 'status': 'inactive', 'date': '2026-06-15'},
    {'name': 'Sneha Verma', 'email': 'sneha@email.com', 'role': 'Patient', 'status': 'active', 'date': '2026-06-14'},
    {'name': 'Vikram Singh', 'email': 'vikram@admin.com', 'role': 'Admin', 'status': 'active', 'date': '2026-06-12'},
    {'name': 'Ananya Gupta', 'email': 'ananya@hospital.com', 'role': 'Doctor', 'status': 'pending', 'date': '2026-06-10'},
    {'name': 'Rohit Sharma', 'email': 'rohit@email.com', 'role': 'Patient', 'status': 'active', 'date': '2026-06-08'},
    {'name': 'Dr. Meera Reddy', 'email': 'meera@hospital.com', 'role': 'Doctor', 'status': 'active', 'date': '2026-06-05'},
    {'name': 'Karan Patel', 'email': 'karan@email.com', 'role': 'Patient', 'status': 'suspended', 'date': '2026-06-01'},
  ];

  List<Map<String, dynamic>> _placeholderActivity() => [
    {'action': 'New user registered', 'user': 'Rohit Sharma', 'date': '2 hours ago', 'type': 'user'},
    {'action': 'Hospital verified', 'user': 'Apollo Hospital', 'date': '3 hours ago', 'type': 'hospital'},
    {'action': 'Appointment booked', 'user': 'Dr. Priya Sharma', 'date': '5 hours ago', 'type': 'booking'},
    {'action': 'Blood request created', 'user': 'Sum Hospital', 'date': '6 hours ago', 'type': 'blood'},
    {'action': 'New doctor onboarded', 'user': 'Dr. Meera Reddy', 'date': '1 day ago', 'type': 'doctor'},
    {'action': 'Camp registered', 'user': 'Care Hospital', 'date': '1 day ago', 'type': 'camp'},
    {'action': 'Pharmacy verified', 'user': 'MedPlus Pharmacy', 'date': '2 days ago', 'type': 'pharmacy'},
    {'action': 'Symptom check completed', 'user': 'Ananya Gupta', 'date': '2 days ago', 'type': 'symptom'},
  ];

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
                  Text('Admin Panel', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.cyan.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.admin_panel_settings_rounded, color: ZyntraColors.cyan, size: 22),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : RefreshIndicator(
                      color: ZyntraColors.cyan,
                      backgroundColor: ZyntraColors.card,
                      onRefresh: _loadData,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _statsRow(),
                            const SizedBox(height: 24),
                            _expansionSection(
                              'Users Management',
                              Icons.people_rounded,
                              ZyntraColors.cyan,
                              _usersSection(),
                            ),
                            const SizedBox(height: 12),
                            _expansionSection(
                              'Data Management',
                              Icons.storage_rounded,
                              ZyntraColors.purple,
                              _activitySection(),
                            ),
                            const SizedBox(height: 12),
                            _expansionSection(
                              'Analytics',
                              Icons.analytics_rounded,
                              ZyntraColors.teal,
                              _analyticsSection(),
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

  Widget _statsRow() {
    final stats = [
      {'label': 'Total Users', 'value': '24,580', 'icon': Icons.people_rounded, 'color': ZyntraColors.cyan},
      {'label': 'Hospitals', 'value': '1,247', 'icon': Icons.local_hospital_rounded, 'color': ZyntraColors.purple},
      {'label': 'Doctors', 'value': '4,892', 'icon': Icons.person_rounded, 'color': ZyntraColors.teal},
      {'label': 'Bookings', 'value': '12,356', 'icon': Icons.calendar_month_rounded, 'color': ZyntraColors.amber},
    ];

    return Row(
      children: stats.map((s) => Expanded(
        child: Container(
          margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [ZyntraColors.card, ZyntraColors.surface],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: (s['color'] as Color).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(s['icon'] as IconData, color: s['color'] as Color, size: 16),
              ),
              const SizedBox(height: 6),
              Text(s['value'] as String, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
              Text(s['label'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 8), textAlign: TextAlign.center),
            ],
          ),
        ),
      )).toList(),
    );
  }

  Widget _expansionSection(String title, IconData icon, Color color, Widget content) {
    return Container(
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: ExpansionTile(
        initiallyExpanded: true,
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        expandedCrossAxisAlignment: CrossAxisAlignment.start,
        shape: const Border(),
        collapsedShape: const Border(),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 18),
        ),
        title: Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
        children: [content],
      ),
    );
  }

  Widget _usersSection() {
    return Column(
      children: [
        Row(
          children: [
            _filterChip('All', true),
            const SizedBox(width: 6),
            _filterChip('Active', false),
            const SizedBox(width: 6),
            _filterChip('Pending', false),
          ],
        ),
        const SizedBox(height: 12),
        ..._users.map((u) => _userRow(u)),
      ],
    );
  }

  Widget _filterChip(String label, bool selected) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: selected ? ZyntraColors.cyan.withValues(alpha: 0.2) : ZyntraColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: selected ? ZyntraColors.cyan : ZyntraColors.border),
      ),
      child: Text(label, style: GoogleFonts.inter(color: selected ? ZyntraColors.cyan : ZyntraColors.white70, fontSize: 11, fontWeight: FontWeight.w500)),
    );
  }

  Widget _userRow(Map<String, dynamic> user) {
    final roleColor = _roleColor(user['role'] as String);
    final statusColor = _statusColor(user['status'] as String);
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.3))),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: roleColor.withValues(alpha: 0.2),
            child: Text((user['name'] as String)[0].toUpperCase(), style: GoogleFonts.poppins(color: roleColor, fontSize: 14, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                Text(user['email'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: roleColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(user['role'] as String, style: GoogleFonts.inter(color: roleColor, fontSize: 9, fontWeight: FontWeight.w600)),
          ),
          const SizedBox(width: 6),
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
          ),
        ],
      ),
    );
  }

  Color _roleColor(String role) {
    switch (role) {
      case 'Admin': return ZyntraColors.pink;
      case 'Doctor': return ZyntraColors.cyan;
      default: return ZyntraColors.white70;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'active': return ZyntraColors.green;
      case 'pending': return ZyntraColors.amber;
      case 'suspended': return ZyntraColors.red;
      default: return ZyntraColors.white40;
    }
  }

  Widget _activitySection() {
    return Column(
      children: _activityLog.map((a) => _activityRow(a)).toList(),
    );
  }

  Widget _activityRow(Map<String, dynamic> activity) {
    final typeIcon = _activityIcon(activity['type'] as String);
    final typeColor = _activityColor(activity['type'] as String);
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.3))),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: typeColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(typeIcon, color: typeColor, size: 14),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(activity['action'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 12)),
                Text(activity['user'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
              ],
            ),
          ),
          Text(activity['date'] as String, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
        ],
      ),
    );
  }

  IconData _activityIcon(String type) {
    switch (type) {
      case 'user': return Icons.person_add_rounded;
      case 'hospital': return Icons.local_hospital_rounded;
      case 'booking': return Icons.calendar_today_rounded;
      case 'blood': return Icons.bloodtype_rounded;
      case 'doctor': return Icons.person_rounded;
      case 'camp': return Icons.campaign_rounded;
      case 'pharmacy': return Icons.local_pharmacy_rounded;
      case 'symptom': return Icons.healing_rounded;
      default: return Icons.circle_rounded;
    }
  }

  Color _activityColor(String type) {
    switch (type) {
      case 'user': return ZyntraColors.cyan;
      case 'hospital': return ZyntraColors.purple;
      case 'booking': return ZyntraColors.teal;
      case 'blood': return ZyntraColors.red;
      case 'doctor': return ZyntraColors.indigo;
      case 'camp': return ZyntraColors.amber;
      case 'pharmacy': return ZyntraColors.green;
      case 'symptom': return ZyntraColors.pink;
      default: return ZyntraColors.white70;
    }
  }

  Widget _analyticsSection() {
    return Column(
      children: [
        Container(
          height: 200,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: _buildChart(),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _legendItem(ZyntraColors.cyan, 'Users'),
            _legendItem(ZyntraColors.purple, 'Hospitals'),
            _legendItem(ZyntraColors.teal, 'Doctors'),
            _legendItem(ZyntraColors.amber, 'Bookings'),
          ],
        ),
      ],
    );
  }

  Widget _buildChart() {
    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: 25,
          getDrawingHorizontalLine: (value) => FlLine(
            color: ZyntraColors.border.withValues(alpha: 0.3),
            strokeWidth: 1,
          ),
        ),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 32,
              getTitlesWidget: (value, meta) => Text(
                '${value.toInt()}',
                style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 24,
              interval: 1,
              getTitlesWidget: (value, meta) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                final i = value.toInt();
                return Text(
                  i >= 0 && i < months.length ? months[i] : '',
                  style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9),
                );
              },
            ),
          ),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        minY: 0,
        maxY: 100,
        lineBarsData: [
          _lineSet(_userSpots, ZyntraColors.cyan),
          _lineSet(_hospitalSpots, ZyntraColors.purple),
          _lineSet(_doctorSpots, ZyntraColors.teal),
          _lineSet(_bookingSpots, ZyntraColors.amber),
        ],
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            getTooltipItems: (spots) => spots.map((s) => LineTooltipItem(
              '${s.y.toInt()}',
              TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
            )).toList(),
          ),
        ),
      ),
    );
  }

  LineChartBarData _lineSet(List<FlSpot> spots, Color color) {
    return LineChartBarData(
      spots: spots,
      isCurved: true,
      color: color,
      barWidth: 2,
      isStrokeCapRound: true,
      dotData: FlDotData(show: false),
      belowBarData: BarAreaData(
        show: true,
        color: color.withValues(alpha: 0.1),
      ),
    );
  }

  List<FlSpot> get _userSpots => const [
    FlSpot(0, 12), FlSpot(1, 18), FlSpot(2, 25), FlSpot(3, 30), FlSpot(4, 42), FlSpot(5, 58),
  ];

  List<FlSpot> get _hospitalSpots => const [
    FlSpot(0, 8), FlSpot(1, 12), FlSpot(2, 15), FlSpot(3, 20), FlSpot(4, 28), FlSpot(5, 35),
  ];

  List<FlSpot> get _doctorSpots => const [
    FlSpot(0, 15), FlSpot(1, 22), FlSpot(2, 30), FlSpot(3, 38), FlSpot(4, 45), FlSpot(5, 55),
  ];

  List<FlSpot> get _bookingSpots => const [
    FlSpot(0, 5), FlSpot(1, 10), FlSpot(2, 18), FlSpot(3, 25), FlSpot(4, 35), FlSpot(5, 48),
  ];

  Widget _legendItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 4),
        Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
      ],
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: 4,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 100,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}
