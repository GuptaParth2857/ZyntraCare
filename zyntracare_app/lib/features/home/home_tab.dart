import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';
import 'widgets/tilt_card.dart';
import 'widgets/emergency_banner.dart';
import 'widgets/modals.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});
  @override State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  List<dynamic> hospitals = [], doctors = [], donors = [];
  bool loading = true;
  final _scrollCtrl = ScrollController();
  double _headerOffset = 0;

  @override
  void initState() {
    super.initState();
    _load();
    _scrollCtrl.addListener(() {
      setState(() => _headerOffset = _scrollCtrl.offset.clamp(0, 80));
    });
  }

  Future<void> _load() async {
    setState(() => loading = true);
    final h = await apiService.getHospitals();
    final d = await apiService.getDoctors();
    final b = await apiService.getBloodDonors();
    if (mounted) setState(() { hospitals = h; doctors = d; donors = b; loading = false; });
  }

  @override
  void dispose() { _scrollCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: ZyntraColors.cyan,
      backgroundColor: ZyntraColors.card,
      onRefresh: _load,
      child: CustomScrollView(
        controller: _scrollCtrl,
        slivers: [
          SliverToBoxAdapter(child: _header(context)),
          SliverToBoxAdapter(child: _quickGrid(context)),
          SliverToBoxAdapter(child: const EmergencyBanner()),
          SliverToBoxAdapter(child: _sectionTitle('Nearby Hospitals')),
          SliverToBoxAdapter(child: _hospitalList()),
          SliverToBoxAdapter(child: _sectionTitle('Top Doctors')),
          SliverToBoxAdapter(child: _doctorList()),
          SliverToBoxAdapter(child: _sectionTitle('Blood Donors')),
          SliverToBoxAdapter(child: _donorList()),
          SliverToBoxAdapter(child: _healthTips()),
          const SliverToBoxAdapter(child: SizedBox(height: 120)),
        ],
      ),
    );
  }

  // ── Header ──────────────────────────────────────────────────────────────────
  Widget _header(BuildContext ctx) {
    return Container(
      height: 200,
      decoration: const BoxDecoration(gradient: ZyntraColors.gradientHeader),
      child: Stack(children: [
        // Decorative orbs
        Positioned(right: -30, top: -30,
          child: Container(width: 140, height: 140,
            decoration: BoxDecoration(shape: BoxShape.circle,
              color: ZyntraColors.cyan.withOpacity(0.07)))),
        Positioned(left: -20, bottom: -40,
          child: Container(width: 120, height: 120,
            decoration: BoxDecoration(shape: BoxShape.circle,
              color: ZyntraColors.purple.withOpacity(0.07)))),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                const Icon(Icons.location_on_rounded, color: ZyntraColors.cyan, size: 16),
                const SizedBox(width: 4),
                Text('Delhi, India', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                const Spacer(),
                _iconBtn(Icons.notifications_outlined, () => HomeModals.showNotif(ctx)),
              ]),
              const SizedBox(height: 16),
              Text('Find Your', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 15)),
              Text('Healthcare Solution', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
              const SizedBox(height: 14),
              _searchBar(ctx),
            ]),
          ),
        ),
      ]),
    ).animate().fadeIn(duration: 500.ms).slideY(begin: -0.05, end: 0);
  }

  Widget _iconBtn(IconData icon, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Icon(icon, color: Colors.white, size: 20),
    ),
  );

  Widget _searchBar(BuildContext ctx) => GestureDetector(
    onTap: () => HomeModals.showSearch(ctx),
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.07),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(children: [
        const Icon(Icons.search_rounded, color: ZyntraColors.cyan, size: 20),
        const SizedBox(width: 10),
        Text('Search hospitals, doctors...', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 14)),
      ]),
    ),
  );

  // ── Quick access 3D tilt grid ────────────────────────────────────────────────
  Widget _quickGrid(BuildContext ctx) {
    final items = [
      _QI(Icons.local_hospital_rounded, 'Hospitals', ZyntraColors.cyan,       () => HomeModals.showHospitals(ctx)),
      _QI(Icons.person_rounded,         'Doctors',   ZyntraColors.green,       () => HomeModals.showDoctors(ctx)),
      _QI(Icons.bloodtype_rounded,      'Blood',     ZyntraColors.red,         () => HomeModals.showBlood(ctx)),
      _QI(Icons.medication_rounded,     'Pharmacy',  ZyntraColors.purple,      () => HomeModals.showPharmacy(ctx)),
      _QI(Icons.science_rounded,        'Labs',      ZyntraColors.teal,        () => HomeModals.showLabs(ctx)),
      _QI(Icons.smart_toy_rounded,      'AI Chat',   ZyntraColors.pink,        () => HomeModals.showAIChat(ctx)),
      _QI(Icons.monitor_heart_rounded,  'Symptoms',  ZyntraColors.amber,       () => HomeModals.showSymptom(ctx)),
      _QI(Icons.video_call_rounded,     'Video',     ZyntraColors.indigo,      () => HomeModals.showVideo(ctx)),
    ];
    return Padding(
      padding: const EdgeInsets.all(16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.82,
        ),
        itemBuilder: (_, i) => TiltCard(
          color: items[i].color,
          onTap: items[i].onTap,
          child: _qiContent(items[i]),
        ).animate().fadeIn(delay: (i * 50).ms).slideY(begin: 0.2, end: 0),
      ),
    );
  }

  Widget _qiContent(_QI item) => Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    Container(
      padding: const EdgeInsets.all(9),
      decoration: BoxDecoration(color: item.color.withOpacity(0.2), shape: BoxShape.circle),
      child: Icon(item.icon, color: item.color, size: 22),
    ),
    const SizedBox(height: 7),
    Text(item.label, style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
  ]);

  // ── Section title ────────────────────────────────────────────────────────────
  Widget _sectionTitle(String t) => Padding(
    padding: const EdgeInsets.fromLTRB(20, 22, 20, 10),
    child: Text(t, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
  );

  // ── Hospitals ────────────────────────────────────────────────────────────────
  Widget _hospitalList() {
    if (loading) return _shimmerRow(180, 180);
    final list = hospitals.isEmpty
        ? [{'name': 'AIIMS Delhi', 'city': 'New Delhi', 'beds': 2500, 'rating': '4.8'}]
        : hospitals;
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

  Widget _hospCard(dynamic h, int i) => Container(
    width: 178,
    margin: const EdgeInsets.only(right: 12),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      gradient: LinearGradient(colors: [ZyntraColors.card, ZyntraColors.surface],
        begin: Alignment.topLeft, end: Alignment.bottomRight),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: ZyntraColors.border),
      boxShadow: [BoxShadow(color: ZyntraColors.cyan.withOpacity(0.04), blurRadius: 12)],
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Container(padding: const EdgeInsets.all(7),
          decoration: BoxDecoration(color: ZyntraColors.cyan.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.local_hospital_rounded, color: ZyntraColors.cyan, size: 16)),
        const SizedBox(width: 8),
        Expanded(child: Text(h['name'] ?? 'Hospital',
          style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
          overflow: TextOverflow.ellipsis)),
      ]),
      const Spacer(),
      Text(h['city'] ?? h['address'] ?? 'Delhi',
        style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
      const SizedBox(height: 8),
      Row(children: [
        _chip('${h['beds'] ?? h['totalBeds'] ?? 0} beds', Colors.green),
        const SizedBox(width: 6),
        _chip('★ ${h['rating'] ?? '4.0'}', ZyntraColors.amber),
      ]),
    ]),
  ).animate().fadeIn(delay: (i * 60).ms).slideX(begin: 0.15, end: 0);

  Widget _chip(String text, Color c) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(color: c.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
    child: Text(text, style: GoogleFonts.inter(color: c, fontSize: 10, fontWeight: FontWeight.w500)),
  );

  // ── Doctors ──────────────────────────────────────────────────────────────────
  Widget _doctorList() {
    if (loading) return _shimmerRow(110, 120);
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

  Widget _docCard(dynamic d, int i) {
    final initial = (d['name'] ?? 'D')[0].toString().toUpperCase();
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
        CircleAvatar(radius: 22, backgroundColor: c.withOpacity(0.2),
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
    ).animate().fadeIn(delay: (i * 60).ms).slideX(begin: 0.15, end: 0);
  }

  // ── Blood donors ─────────────────────────────────────────────────────────────
  Widget _donorList() {
    if (loading) return _shimmerRow(80, 105);
    final list = donors.isEmpty
        ? [{'name': 'Rahul K.', 'bloodType': 'O+', 'available': true}]
        : donors;
    return SizedBox(
      height: 88,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: list.length,
        itemBuilder: (_, i) {
          final d = list[i]; final avail = d['available'] ?? true;
          return Container(
            width: 100,
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              CircleAvatar(radius: 16, backgroundColor: ZyntraColors.red.withOpacity(0.2),
                child: Text(d['bloodType'] ?? d['blood_group'] ?? 'O+',
                  style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 9, fontWeight: FontWeight.w700))),
              const SizedBox(height: 5),
              Text(d['name'] ?? 'Donor',
                style: GoogleFonts.inter(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w600),
                overflow: TextOverflow.ellipsis),
              const SizedBox(height: 3),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: (avail ? Colors.green : ZyntraColors.red).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(avail ? 'Avail' : 'Busy',
                  style: GoogleFonts.inter(color: avail ? Colors.green : ZyntraColors.red, fontSize: 8)),
              ),
            ]),
          ).animate().fadeIn(delay: (i * 50).ms);
        },
      ),
    );
  }

  // ── Health tips ───────────────────────────────────────────────────────────────
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
                colors: [t.color.withOpacity(0.18), t.color.withOpacity(0.05)],
                begin: Alignment.topCenter, end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: t.color.withOpacity(0.25)),
            ),
            child: Column(children: [
              Icon(t.icon, color: t.color, size: 22),
              const SizedBox(height: 6),
              Text(t.label, style: GoogleFonts.inter(color: Colors.white, fontSize: 9), textAlign: TextAlign.center),
            ]),
          ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2, end: 0),
        )).toList()),
      ]),
    );
  }

  Widget _shimmerRow(double height, double width) => SizedBox(
    height: height,
    child: ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: 4,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          width: width, height: height,
          margin: const EdgeInsets.only(right: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20)),
        ),
      ),
    ),
  );
}

class _QI { final IconData icon; final String label; final Color color; final VoidCallback onTap;
  _QI(this.icon, this.label, this.color, this.onTap); }
class _Tip { final String label; final IconData icon; final Color color;
  _Tip(this.label, this.icon, this.color); }
