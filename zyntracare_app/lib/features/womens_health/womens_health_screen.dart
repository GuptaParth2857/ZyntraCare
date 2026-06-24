import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class WomensHealthScreen extends StatefulWidget {
  const WomensHealthScreen({super.key});
  @override State<WomensHealthScreen> createState() => _WomensHealthScreenState();
}

class _WomensHealthScreenState extends State<WomensHealthScreen> {
  bool _loading = true;
  int _currentMonth = 6;
  int _currentYear = 2026;
  final Set<int> _periodDays = {5, 6, 7, 8, 9, 23, 24, 25};
  final Set<int> _ovulationDays = {14, 15};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      await ApiService().get('/api/womens-health');
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  final _symptoms = [
    {'icon': Icons.battery_alert_rounded, 'label': 'Fatigue', 'color': ZyntraColors.amber},
    {'icon': Icons.face_rounded, 'label': 'Mood', 'color': ZyntraColors.pink},
    {'icon': Icons.healing_rounded, 'label': 'Cramps', 'color': ZyntraColors.red},
    {'icon': Icons.wb_sunny_rounded, 'label': 'Hot Flashes', 'color': ZyntraColors.amber},
    {'icon': Icons.headphones_rounded, 'label': 'Headache', 'color': ZyntraColors.purple},
    {'icon': Icons.food_bank_rounded, 'label': 'Cravings', 'color': ZyntraColors.teal},
  ];

  final _tips = [
    {'title': 'Stay Hydrated', 'desc': 'Drink at least 8 glasses of water daily to reduce bloating', 'icon': Icons.water_drop_rounded, 'color': ZyntraColors.cyan},
    {'title': 'Light Exercise', 'desc': '15-min walks can help ease menstrual cramps', 'icon': Icons.directions_walk_rounded, 'color': ZyntraColors.green},
    {'title': 'Iron Rich Diet', 'desc': 'Include spinach, lentils & nuts in your meals', 'icon': Icons.restaurant_rounded, 'color': ZyntraColors.purple},
  ];

  final _articles = [
    {'title': 'Understanding PCOS', 'desc': 'Symptoms, diagnosis & management strategies', 'readTime': '5 min', 'color': ZyntraColors.pink},
    {'title': 'Menstrual Cycle 101', 'desc': 'What happens during each phase of your cycle', 'readTime': '4 min', 'color': ZyntraColors.cyan},
    {'title': 'Bone Health After 30', 'desc': 'Calcium needs and exercises for strong bones', 'readTime': '6 min', 'color': ZyntraColors.green},
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
                  Text("Women's Health", style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.pink.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.female_rounded, color: ZyntraColors.pink, size: 22),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : RefreshIndicator(
                      color: ZyntraColors.pink,
                      backgroundColor: ZyntraColors.card,
                      onRefresh: _load,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _cycleSummary(),
                            const SizedBox(height: 20),
                            _calendarView(),
                            const SizedBox(height: 20),
                            _sectionHeader('Log Symptoms', Icons.edit_note_rounded),
                            const SizedBox(height: 12),
                            _symptomsGrid(),
                            const SizedBox(height: 24),
                            _sectionHeader('Health Tips', Icons.lightbulb_rounded),
                            const SizedBox(height: 12),
                            ..._tips.map((t) => _tipCard(t)),
                            const SizedBox(height: 24),
                            _sectionHeader('Appointments', Icons.calendar_month_rounded),
                            const SizedBox(height: 12),
                            _appointmentCard(),
                            const SizedBox(height: 24),
                            _sectionHeader('Articles', Icons.article_rounded),
                            const SizedBox(height: 12),
                            ..._articles.map((a) => _articleCard(a)),
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

  Widget _cycleSummary() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ZyntraColors.pink, ZyntraColors.purple],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: ZyntraColors.pink.withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Column(
        children: [
          const Icon(Icons.female_rounded, color: Colors.white, size: 36),
          const SizedBox(height: 8),
          Text('Cycle Day 8', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text('Next period expected in 18 days', style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.8), fontSize: 12)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _cycleStat('28 days', 'Avg. Cycle'),
              _cycleStat('5 days', 'Period'),
              _cycleStat('June 23', 'Next Period'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _cycleStat(String val, String label) {
    return Column(
      children: [
        Text(val, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
        Text(label, style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.8), fontSize: 10)),
      ],
    );
  }

  Widget _calendarView() {
    final daysInMonth = DateTime(_currentYear, _currentMonth + 1, 0).day;
    final firstWeekday = DateTime(_currentYear, _currentMonth, 1).weekday % 7;
    final monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: () => setState(() {
                  if (_currentMonth == 1) { _currentMonth = 12; _currentYear--; } else { _currentMonth--; }
                }),
                child: Icon(Icons.chevron_left_rounded, color: ZyntraColors.cyan, size: 24),
              ),
              Text('${monthNames[_currentMonth - 1]} $_currentYear', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              GestureDetector(
                onTap: () => setState(() {
                  if (_currentMonth == 12) { _currentMonth = 1; _currentYear++; } else { _currentMonth++; }
                }),
                child: Icon(Icons.chevron_right_rounded, color: ZyntraColors.cyan, size: 24),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => SizedBox(
              width: 32,
              child: Center(child: Text(d, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11, fontWeight: FontWeight.w600))),
            )).toList(),
          ),
          const SizedBox(height: 8),
          ...List.generate((daysInMonth + firstWeekday + 6) ~/ 7, (week) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(7, (day) {
                  final dayNum = week * 7 + day - firstWeekday + 1;
                  if (dayNum < 1 || dayNum > daysInMonth) return const SizedBox(width: 32, height: 32);
                  final isPeriod = _periodDays.contains(dayNum);
                  final isOvulation = _ovulationDays.contains(dayNum);
                  return Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: isPeriod ? ZyntraColors.pink.withValues(alpha: 0.3) : (isOvulation ? ZyntraColors.cyan.withValues(alpha: 0.2) : null),
                      borderRadius: BorderRadius.circular(8),
                      border: isPeriod ? Border.all(color: ZyntraColors.pink.withValues(alpha: 0.5)) : (isOvulation ? Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.4)) : null),
                    ),
                    child: Center(
                      child: Text(
                        '$dayNum',
                        style: GoogleFonts.inter(
                          color: isPeriod ? ZyntraColors.pink : (isOvulation ? ZyntraColors.cyan : ZyntraColors.white70),
                          fontSize: 11,
                          fontWeight: isPeriod || isOvulation ? FontWeight.w700 : FontWeight.w400,
                        ),
                      ),
                    ),
                  );
                }),
              ),
            );
          }),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _legend(ZyntraColors.pink, 'Period'),
              const SizedBox(width: 16),
              _legend(ZyntraColors.cyan, 'Ovulation'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _legend(Color color, String label) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(3), border: Border.all(color: color.withValues(alpha: 0.5)))),
        const SizedBox(width: 4),
        Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
      ],
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: ZyntraColors.pink.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: ZyntraColors.pink, size: 16),
        ),
        const SizedBox(width: 8),
        Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _symptomsGrid() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _symptoms.map((s) => GestureDetector(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('${s['label']} logged!', style: GoogleFonts.inter(color: Colors.white)),
            backgroundColor: s['color'] as Color,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 1),
          ));
        },
        child: Container(
          width: (MediaQuery.of(context).size.width - 16 * 2 - 8 * 2) / 3,
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            children: [
              Icon(s['icon'] as IconData, color: s['color'] as Color, size: 24),
              const SizedBox(height: 6),
              Text(s['label'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      )).toList(),
    );
  }

  Widget _tipCard(Map<String, dynamic> tip) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: (tip['color'] as Color).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
            child: Icon(tip['icon'] as IconData, color: tip['color'] as Color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tip['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                Text(tip['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _appointmentCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.pink.withValues(alpha: 0.1), ZyntraColors.purple.withValues(alpha: 0.05)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.pink.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: ZyntraColors.pink.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.calendar_month_rounded, color: ZyntraColors.pink, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Upcoming Appointment', style: GoogleFonts.poppins(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text('Dr. Priya Sharma • Gynecology', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                Text('June 28, 2026 at 10:00 AM', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [ZyntraColors.pink, ZyntraColors.purple]),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text('Remind', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Widget _articleCard(Map<String, dynamic> a) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
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
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: (a['color'] as Color).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
            child: Icon(Icons.article_rounded, color: a['color'] as Color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(a['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(a['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ],
            ),
          ),
          Text(a['readTime'] as String, style: GoogleFonts.inter(color: ZyntraColors.pink, fontSize: 10, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: 6,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 80,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}
