import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class CampsScreen extends StatefulWidget {
  const CampsScreen({super.key});
  @override State<CampsScreen> createState() => _CampsScreenState();
}

class _CampsScreenState extends State<CampsScreen> {
  List<Map<String, dynamic>> _camps = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.getCamps();
      if (mounted) {
        setState(() => _camps = (res).map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList());
      }
    } catch (e) {
      if (mounted) setState(() => _camps = _placeholderCamps());
    }
    if (mounted) setState(() => _loading = false);
  }

  List<Map<String, dynamic>> _placeholderCamps() {
    return [
      {'name': 'Free Health Checkup Camp', 'organizer': 'Apollo Hospital', 'date': '2026-07-15', 'time': '09:00 AM - 04:00 PM', 'location': 'Community Hall, Saheed Nagar', 'city': 'Bhubaneswar', 'type': 'Checkup', 'slots': 100, 'booked': 45},
      {'name': 'Blood Donation Camp', 'organizer': 'Red Cross Society', 'date': '2026-07-20', 'time': '08:00 AM - 02:00 PM', 'location': 'Red Cross Building', 'city': 'Bhubaneswar', 'type': 'Blood Donation', 'slots': 200, 'booked': 120},
      {'name': 'Eye Checkup Camp', 'organizer': 'AIIMS Bhubaneswar', 'date': '2026-07-25', 'time': '10:00 AM - 05:00 PM', 'location': 'AIIMS Campus', 'city': 'Bhubaneswar', 'type': 'Eye Care', 'slots': 150, 'booked': 60},
      {'name': 'Diabetes Awareness Camp', 'organizer': 'Sum Hospital', 'date': '2026-08-01', 'time': '09:00 AM - 03:00 PM', 'location': 'Kalinga Nagar Park', 'city': 'Bhubaneswar', 'type': 'Diabetes', 'slots': 80, 'booked': 30},
      {'name': 'Vaccination Drive', 'organizer': 'Health Department', 'date': '2026-08-05', 'time': '08:00 AM - 06:00 PM', 'location': 'City Hospital', 'city': 'Cuttack', 'type': 'Vaccination', 'slots': 500, 'booked': 200},
    ];
  }

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
                  Text('Health Camps', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.medical_services_rounded, color: ZyntraColors.green, size: 22),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text('Free and low-cost health camps near you',
                style: GoogleFonts.inter(color: ZyntraColors.white70)),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : RefreshIndicator(
                      color: ZyntraColors.green,
                      backgroundColor: ZyntraColors.card,
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        itemCount: _camps.length,
                        itemBuilder: (_, i) => _campCard(_camps[i], i),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _campCard(Map<String, dynamic> camp, int i) {
    final colors = [ZyntraColors.green, ZyntraColors.cyan, ZyntraColors.purple, ZyntraColors.pink, ZyntraColors.teal];
    final c = colors[i % colors.length];
    final slots = camp['slots'] ?? 100;
    final booked = camp['booked'] ?? 0;
    final remaining = slots - booked;
    final pct = slots > 0 ? booked / slots : 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
        boxShadow: [BoxShadow(color: c.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: c.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: Icon(Icons.medical_services_rounded, color: c, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(camp['name'] ?? 'Health Camp', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(camp['organizer'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: c.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(camp['type'] ?? 'General', style: GoogleFonts.inter(color: c, fontSize: 10, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _iconText(Icons.calendar_today_rounded, camp['date'] ?? ''),
              const SizedBox(width: 16),
              _iconText(Icons.access_time_rounded, camp['time'] ?? ''),
            ],
          ),
          const SizedBox(height: 6),
          _iconText(Icons.location_on_rounded, '${camp['location'] ?? ''}, ${camp['city'] ?? ''}'),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: pct,
                        backgroundColor: ZyntraColors.border,
                        valueColor: AlwaysStoppedAnimation<Color>(remaining > 20 ? ZyntraColors.green : ZyntraColors.red),
                        minHeight: 6,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text('$remaining slots remaining out of $slots',
                      style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: () => _showRegisterSheet(camp),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [c, c.withValues(alpha: 0.7)]),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [BoxShadow(color: c.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))],
                  ),
                  child: Text('Register', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 60).ms).slideY(begin: 0.05, end: 0);
  }

  Widget _iconText(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: ZyntraColors.white40, size: 13),
        const SizedBox(width: 4),
        Text(text, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
      ],
    );
  }

  void _showRegisterSheet(Map<String, dynamic> camp) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.45,
        decoration: const BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.medical_services_rounded, color: ZyntraColors.green, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Register for Camp', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                        Text(camp['name'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              TextField(
                style: GoogleFonts.inter(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Full Name',
                  hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
                  filled: true,
                  fillColor: ZyntraColors.surface,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                style: GoogleFonts.inter(color: Colors.white),
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  hintText: 'Phone Number',
                  hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
                  filled: true,
                  fillColor: ZyntraColors.surface,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Registered for ${camp['name']}!', style: GoogleFonts.inter(color: Colors.white)),
                    backgroundColor: ZyntraColors.green,
                    behavior: SnackBarBehavior.floating,
                  ));
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.green, ZyntraColors.teal]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: ZyntraColors.green.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Center(
                    child: Text('Confirm Registration', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
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
          height: 200,
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20)),
        ),
      ),
    );
  }
}
