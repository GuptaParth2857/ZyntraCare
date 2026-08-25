import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../hospitals/hospitals_screen.dart';
import '../doctors/doctors_screen.dart';
import '../blood_donors/blood_donors_screen.dart';
import '../pharmacies/pharmacies_screen.dart';
import '../labs/labs_screen.dart';
import '../ai_chat/ai_chat_screen.dart';
import '../ambulance/ambulance_screen.dart';
import '../emergency/emergency_screen.dart';
import '../health_tracker/health_tracker_screen.dart';
import '../telehealth/telehealth_screen.dart';
import '../maps/maps_screen.dart';
import '../bed_availability/bed_availability_screen.dart';
import '../ai_vision/ai_vision_screen.dart';
import '../wearables/wearables_screen.dart';
import '../blockchain/blockchain_screen.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});
  @override State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  List<Map<String, dynamic>> hospitals = [];
  List<Map<String, dynamic>> doctors = [];
  bool loading = true;

  static const _quickItems = [
    {'icon': Icons.local_hospital_rounded, 'label': 'Hospitals', 'color': ZyntraColors.cyan},
    {'icon': Icons.person_rounded,         'label': 'Doctors',   'color': ZyntraColors.green},
    {'icon': Icons.science_rounded,        'label': 'Labs',      'color': ZyntraColors.teal},
    {'icon': Icons.medication_rounded,     'label': 'Pharmacy',  'color': ZyntraColors.purple},
    {'icon': Icons.smart_toy_rounded,      'label': 'AI Chat',   'color': ZyntraColors.pink},
    {'icon': Icons.monitor_heart_rounded,  'label': 'Tracker',   'color': ZyntraColors.amber},
    {'icon': Icons.video_call_rounded,     'label': 'Telehealth','color': ZyntraColors.indigo},
    {'icon': Icons.map_rounded,            'label': 'Nearby',    'color': ZyntraColors.green},
    {'icon': Icons.bloodtype_rounded,      'label': 'Blood',     'color': ZyntraColors.red},
    {'icon': Icons.warning_rounded,        'label': 'Emergency', 'color': ZyntraColors.red},
    {'icon': Icons.airport_shuttle_rounded,'label': 'Ambulance', 'color': ZyntraColors.amber},
    {'icon': Icons.hotel_rounded,          'label': 'Beds',      'color': ZyntraColors.pink},
    {'icon': Icons.visibility_rounded,     'label': 'AI Vision', 'color': ZyntraColors.purple},
    {'icon': Icons.watch_rounded,          'label': 'Wearables', 'color': ZyntraColors.teal},
    {'icon': Icons.link_rounded,           'label': 'Blockchain','color': ZyntraColors.cyan},
  ];

  static const _screenMap = <String, Widget>{
    'Hospitals': HospitalsScreen(),
    'Doctors': DoctorsScreen(),
    'Labs': LabsScreen(),
    'Pharmacy': PharmaciesScreen(),
    'AI Chat': AIChatScreen(),
    'Tracker': HealthTrackerScreen(),
    'Telehealth': TelehealthScreen(),
    'Nearby': MapsScreen(),
    'Blood': BloodDonorsScreen(),
    'Emergency': EmergencyScreen(),
    'Ambulance': AmbulanceScreen(),
    'Beds': BedAvailabilityScreen(),
    'AI Vision': AIVisionScreen(),
    'Wearables': WearablesScreen(),
    'Blockchain': BlockchainScreen(),
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => loading = true);
    await Future.delayed(const Duration(milliseconds: 400));
    if (mounted) {
      setState(() {
        hospitals = [
          {'name': 'AIIMS Delhi', 'city': 'New Delhi', 'beds': 2500, 'rating': '4.8'},
          {'name': 'Apollo Hospital', 'city': 'Delhi', 'beds': 1200, 'rating': '4.7'},
          {'name': 'Fortis Escorts', 'city': 'Delhi', 'beds': 800, 'rating': '4.6'},
        ];
        doctors = [
          {'name': 'Dr. Priya Sharma', 'specialty': 'Cardiologist', 'rating': '4.9'},
          {'name': 'Dr. Rajesh Kumar', 'specialty': 'Neurologist', 'rating': '4.8'},
          {'name': 'Dr. Sunita Das', 'specialty': 'Pediatrician', 'rating': '4.9'},
          {'name': 'Dr. Amit Panda', 'specialty': 'Orthopedic', 'rating': '4.7'},
        ];
        loading = false;
      });
    }
  }

  void _open(BuildContext ctx, String label) {
    final screen = _screenMap[label];
    if (screen != null) {
      Navigator.push(ctx, MaterialPageRoute(builder: (_) => screen));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: _header()),
          SliverToBoxAdapter(child: _quickGrid()),
          SliverToBoxAdapter(child: _emergencyBanner()),
          SliverToBoxAdapter(child: _sectionTitle('Nearby Hospitals')),
          SliverToBoxAdapter(child: _hospitalList()),
          SliverToBoxAdapter(child: _sectionTitle('Top Doctors')),
          SliverToBoxAdapter(child: _doctorList()),
          SliverToBoxAdapter(child: _healthTips()),
          const SliverToBoxAdapter(child: SizedBox(height: 120)),
        ],
      ),
    );
  }

  Widget _header() {
    return Container(
      height: 180,
      decoration: const BoxDecoration(gradient: ZyntraColors.gradientHeader),
      child: Stack(children: [
        Positioned(right: -30, top: -30,
          child: Container(width: 140, height: 140,
            decoration: BoxDecoration(shape: BoxShape.circle,
              color: ZyntraColors.cyan.withValues(alpha: 0.07)))),
        Positioned(left: -20, bottom: -40,
          child: Container(width: 120, height: 120,
            decoration: BoxDecoration(shape: BoxShape.circle,
              color: ZyntraColors.purple.withValues(alpha: 0.07)))),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                const Icon(Icons.location_on_rounded, color: ZyntraColors.cyan, size: 16),
                const SizedBox(width: 4),
                Text('Delhi, India', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                const Spacer(),
                GestureDetector(
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: ZyntraColors.border),
                    ),
                    child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 20),
                  ),
                ),
              ]),
              const SizedBox(height: 16),
              Text('Find Your', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 15)),
              Text('Healthcare Solution', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
            ]),
          ),
        ),
      ]),
    );
  }

  Widget _quickGrid() {
    final items = _quickItems;
    return Padding(
      padding: const EdgeInsets.all(16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.82,
        ),
        itemBuilder: (_, i) {
          final item = items[i];
          final color = item['color'] as Color;
          final label = item['label'] as String;
          final icon = item['icon'] as IconData;
          return GestureDetector(
            onTap: () => _open(context, label),
            child: Container(
              decoration: BoxDecoration(
                color: ZyntraColors.card,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.2), shape: BoxShape.circle),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(height: 7),
                Text(label, style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
              ]),
            ),
          );
        },
      ),
    );
  }

  Widget _emergencyBanner() {
    return GestureDetector(
      onTap: () => _open(context, 'Emergency'),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          height: 80,
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: const Color(0xFFEF4444).withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 10))],
          ),
          child: Stack(children: [
            Positioned(right: -20, top: -20, child: Container(width: 100, height: 100, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.1)))),
            Padding(padding: const EdgeInsets.symmetric(horizontal: 20), child: Row(children: [
              Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle), child: const Icon(Icons.emergency, color: Colors.white, size: 28)),
              const SizedBox(width: 16),
              const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text('Medical Emergency?', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)), Text('Tap for immediate help', style: TextStyle(color: Colors.white70, fontSize: 12))])),
              Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: const Text('102', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold, fontSize: 18))),
            ])),
          ]),
        ),
      ),
    );
  }

  Widget _sectionTitle(String t) => Padding(
    padding: const EdgeInsets.fromLTRB(20, 22, 20, 10),
    child: Text(t, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
  );

  Widget _hospitalList() {
    if (loading) return _shimmerRow(180);
    final list = hospitals.isEmpty ? [{'name': 'AIIMS Delhi', 'city': 'New Delhi', 'beds': 2500, 'rating': '4.8'}] : hospitals;
    return SizedBox(
      height: 168,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: list.length,
        itemBuilder: (_, i) => _hospCard(list[i], i),
      ),
    );
  }

  Widget _hospCard(Map<String, dynamic> h, int i) => Container(
    width: 178,
    margin: const EdgeInsets.only(right: 12),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      gradient: LinearGradient(colors: [ZyntraColors.card, ZyntraColors.surface],
        begin: Alignment.topLeft, end: Alignment.bottomRight),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: ZyntraColors.border),
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Container(padding: const EdgeInsets.all(7),
          decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.local_hospital_rounded, color: ZyntraColors.cyan, size: 16)),
        const SizedBox(width: 8),
        Expanded(child: Text(h['name'] ?? 'Hospital',
          style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
          overflow: TextOverflow.ellipsis)),
      ]),
      const Spacer(),
      Text(h['city'] ?? 'Delhi',
        style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
      const SizedBox(height: 8),
      Row(children: [
        _chip('${h['beds'] ?? 0} beds', Colors.green),
        const SizedBox(width: 6),
        _chip('\u2605 ${h['rating'] ?? '4.0'}', ZyntraColors.amber),
      ]),
    ]),
  );

  Widget _chip(String text, Color c) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(color: c.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
    child: Text(text, style: GoogleFonts.inter(color: c, fontSize: 10, fontWeight: FontWeight.w500)),
  );

  Widget _doctorList() {
    if (loading) return _shimmerRow(110);
    final list = doctors.isEmpty
        ? [{'name': 'Dr. Priya Sharma', 'specialty': 'Cardiologist', 'rating': '4.9'}]
        : doctors;
    return SizedBox(
      height: 118,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: list.length,
        itemBuilder: (_, i) => _docCard(list[i], i),
      ),
    );
  }

  Widget _docCard(Map<String, dynamic> d, int i) {
    final initial = (d['name'] ?? 'D').toString()[0].toUpperCase();
    final colors = [ZyntraColors.cyan, ZyntraColors.purple, ZyntraColors.green, ZyntraColors.pink];
    final c = colors[i % colors.length];
    return Container(
      width: 125,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        CircleAvatar(radius: 22, backgroundColor: c.withValues(alpha: 0.2),
          child: Text(initial, style: GoogleFonts.poppins(color: c, fontSize: 18, fontWeight: FontWeight.w700))),
        const SizedBox(height: 7),
        Text(d['name'] ?? 'Doctor',
          style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
          overflow: TextOverflow.ellipsis),
        Text(d['specialty'] ?? 'Specialist',
          style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 9)),
        const SizedBox(height: 4),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Icon(Icons.star_rounded, color: ZyntraColors.amber, size: 12),
          Text(' ${d['rating'] ?? '4.5'}', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 10)),
        ]),
      ]),
    );
  }

  Widget _healthTips() {
    final tips = [
      _Tip('Heart Care', Icons.favorite_rounded, ZyntraColors.red),
      _Tip('Mental Health', Icons.psychology_rounded, ZyntraColors.purple),
      _Tip('Nutrition', Icons.restaurant_rounded, Colors.green),
      _Tip('Fitness', Icons.fitness_center_rounded, ZyntraColors.amber),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Health Tips', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Row(children: tips.map((t) => Expanded(
          child: Container(
            margin: const EdgeInsets.only(right: 10),
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [t.color.withValues(alpha: 0.18), t.color.withValues(alpha: 0.05)],
                begin: Alignment.topCenter, end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: t.color.withValues(alpha: 0.25)),
            ),
            child: Column(children: [
              Icon(t.icon, color: t.color, size: 22),
              const SizedBox(height: 6),
              Text(t.label, style: GoogleFonts.inter(color: Colors.white, fontSize: 9), textAlign: TextAlign.center),
            ]),
          ),
        )).toList()),
      ]),
    );
  }

  Widget _shimmerRow(double height) => SizedBox(
    height: height,
    child: ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: 3,
      itemBuilder: (_, _) => Container(
        width: height == 180 ? 178 : 125, height: height,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20)),
      ),
    ),
  );
}

class _Tip { final String label; final IconData icon; final Color color;
  _Tip(this.label, this.icon, this.color); }
