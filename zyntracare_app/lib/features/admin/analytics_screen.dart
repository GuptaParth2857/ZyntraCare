import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  static const _stats = [
    _StatItem('Total Users', '24,580', Icons.people_rounded, ZyntraColors.cyan),
    _StatItem('Active Sessions', '1,234', Icons.timeline_rounded, ZyntraColors.purple),
    _StatItem('Revenue', '₹12,45,000', Icons.currency_rupee_rounded, ZyntraColors.teal),
    _StatItem('Growth', '18.5%', Icons.trending_up_rounded, ZyntraColors.green),
  ];

  static const _userGrowthSpots = [
    FlSpot(0, 12), FlSpot(1, 15), FlSpot(2, 18), FlSpot(3, 20),
    FlSpot(4, 19), FlSpot(5, 22), FlSpot(6, 24), FlSpot(7, 20),
    FlSpot(8, 22), FlSpot(9, 24), FlSpot(10, 22), FlSpot(11, 24),
  ];

  static final _pieData = [
    _PieItem('Android', 55, ZyntraColors.cyan),
    _PieItem('iOS', 30, ZyntraColors.purple),
    _PieItem('Web', 10, ZyntraColors.teal),
    _PieItem('Others', 5, ZyntraColors.amber),
  ];

  static const _hospitals = [
    _HospitalRow('AIIMS Delhi', '12,450', '₹2,45,000'),
    _HospitalRow('Apollo Hyderabad', '10,230', '₹1,98,000'),
    _HospitalRow('Fortis Mumbai', '8,940', '₹1,75,500'),
    _HospitalRow('Max Saket', '7,820', '₹1,52,300'),
    _HospitalRow('Medanta Gurgaon', '6,750', '₹1,34,200'),
  ];

  static const _activities = [
    _ActivityItem('New user registered', 'Rohit Sharma', '2 hours ago', Icons.person_add_rounded, ZyntraColors.cyan),
    _ActivityItem('Hospital verified', 'Apollo Hospital', '3 hours ago', Icons.local_hospital_rounded, ZyntraColors.purple),
    _ActivityItem('Appointment booked', 'Dr. Priya Sharma', '5 hours ago', Icons.calendar_today_rounded, ZyntraColors.teal),
    _ActivityItem('Blood request created', 'SUM Hospital', '6 hours ago', Icons.bloodtype_rounded, ZyntraColors.red),
    _ActivityItem('Camp registered', 'Care Hospital', '1 day ago', Icons.campaign_rounded, ZyntraColors.amber),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Analytics', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatsRow(),
            const SizedBox(height: 24),
            _sectionHeader('User Growth', Icons.show_chart_rounded, ZyntraColors.cyan),
            const SizedBox(height: 12),
            _buildLineChart(),
            const SizedBox(height: 24),
            _sectionHeader('Platform Distribution', Icons.pie_chart_rounded, ZyntraColors.purple),
            const SizedBox(height: 12),
            _buildPieChart(),
            const SizedBox(height: 24),
            _sectionHeader('Top Hospitals', Icons.local_hospital_rounded, ZyntraColors.teal),
            const SizedBox(height: 12),
            _buildHospitalsTable(),
            const SizedBox(height: 24),
            _sectionHeader('Recent Activity', Icons.history_rounded, ZyntraColors.amber),
            const SizedBox(height: 12),
            _buildActivityFeed(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: _stats.map((s) => Expanded(
        child: Container(
          margin: const EdgeInsets.only(right: 6),
          padding: const EdgeInsets.all(10),
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
                decoration: BoxDecoration(
                  color: s.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(s.icon, color: s.color, size: 16),
              ),
              const SizedBox(height: 6),
              Text(s.value, style: GoogleFonts.poppins(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
              Text(s.label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 7), textAlign: TextAlign.center),
            ],
          ),
        ),
      )).toList(),
    );
  }

  Widget _sectionHeader(String title, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 16),
        ),
        const SizedBox(width: 10),
        Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildLineChart() {
    return Container(
      height: 220,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: 5,
            getDrawingHorizontalLine: (value) => FlLine(
              color: ZyntraColors.border.withValues(alpha: 0.3),
              strokeWidth: 1,
            ),
          ),
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 28,
                getTitlesWidget: (value, meta) => Text(
                  '${value.toInt()}K',
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
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
          maxY: 30,
          lineBarsData: [
            LineChartBarData(
              spots: _userGrowthSpots,
              isCurved: true,
              color: ZyntraColors.cyan,
              barWidth: 2.5,
              isStrokeCapRound: true,
              dotData: FlDotData(
                show: true,
                getDotPainter: (spot, percent, bar, index) => FlDotCirclePainter(
                  radius: 3,
                  color: ZyntraColors.cyan,
                  strokeWidth: 1.5,
                  strokeColor: ZyntraColors.card,
                ),
              ),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    ZyntraColors.cyan.withValues(alpha: 0.2),
                    ZyntraColors.cyan.withValues(alpha: 0.0),
                  ],
                ),
              ),
            ),
          ],
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipItems: (spots) => spots.map((s) => LineTooltipItem(
                '${s.y.toInt()}K users',
                TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
              )).toList(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPieChart() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 140,
            height: 140,
            child: PieChart(
              PieChartData(
                sections: _pieData.map((p) => PieChartSectionData(
                  value: p.percent,
                  color: p.color,
                  radius: 45,
                  title: '${p.percent.toInt()}%',
                  titleStyle: GoogleFonts.poppins(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                )).toList(),
                sectionsSpace: 2,
                centerSpaceRadius: 30,
                startDegreeOffset: -90,
              ),
            ),
          ),
          const SizedBox(width: 24),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: _pieData.map((p) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  children: [
                    Container(width: 10, height: 10, decoration: BoxDecoration(color: p.color, borderRadius: BorderRadius.circular(2))),
                    const SizedBox(width: 8),
                    Text(p.label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                    const Spacer(),
                    Text('${p.percent.toInt()}%', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              )).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHospitalsTable() {
    return Container(
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: ZyntraColors.border)),
            ),
            child: Row(
              children: [
                Expanded(flex: 3, child: Text('Hospital', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10, fontWeight: FontWeight.w600))),
                Expanded(flex: 2, child: Text('Patients', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10, fontWeight: FontWeight.w600), textAlign: TextAlign.center)),
                Expanded(flex: 2, child: Text('Revenue', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10, fontWeight: FontWeight.w600), textAlign: TextAlign.end)),
              ],
            ),
          ),
          ..._hospitals.map((h) => Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.3))),
            ),
            child: Row(
              children: [
                Expanded(flex: 3, child: Text(h.name, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500))),
                Expanded(flex: 2, child: Text(h.patients, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12), textAlign: TextAlign.center)),
                Expanded(flex: 2, child: Text(h.revenue, style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 12, fontWeight: FontWeight.w600), textAlign: TextAlign.end)),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildActivityFeed() {
    return Container(
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        children: _activities.map((a) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.3))),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: a.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(a.icon, color: a.color, size: 14),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(a.action, style: GoogleFonts.inter(color: Colors.white, fontSize: 12)),
                    Text(a.user, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                  ],
                ),
              ),
              Text(a.time, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
            ],
          ),
        )).toList(),
      ),
    );
  }
}

class _StatItem {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _StatItem(this.label, this.value, this.icon, this.color);
}

class _PieItem {
  final String label;
  final double percent;
  final Color color;
  const _PieItem(this.label, this.percent, this.color);
}

class _HospitalRow {
  final String name;
  final String patients;
  final String revenue;
  const _HospitalRow(this.name, this.patients, this.revenue);
}

class _ActivityItem {
  final String action;
  final String user;
  final String time;
  final IconData icon;
  final Color color;
  const _ActivityItem(this.action, this.user, this.time, this.icon, this.color);
}
