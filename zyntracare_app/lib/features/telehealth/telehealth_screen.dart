import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class TelehealthScreen extends StatefulWidget {
  const TelehealthScreen({super.key});
  @override State<TelehealthScreen> createState() => _TelehealthScreenState();
}

class _TelehealthScreenState extends State<TelehealthScreen> {
  List<dynamic> _doctors = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await apiService.getTelehealth();
      if (mounted) setState(() => _doctors = res);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _loading = false);
  }

  final _features = [
    {'icon': Icons.video_call_rounded, 'title': 'Video Consultation', 'desc': 'Face-to-face with doctors', 'color': ZyntraColors.cyan},
    {'icon': Icons.message_rounded, 'title': 'Chat with Doctor', 'desc': 'Text-based consultation', 'color': ZyntraColors.purple},
    {'icon': Icons.description_rounded, 'title': 'E-Prescription', 'desc': 'Get digital prescriptions', 'color': ZyntraColors.teal},
    {'icon': Icons.calendar_month_rounded, 'title': 'Schedule Visit', 'desc': 'Plan ahead', 'color': ZyntraColors.pink},
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
                  Text('Telehealth', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.indigo.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: ZyntraColors.indigo.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.video_call_rounded, color: ZyntraColors.indigo, size: 22),
                  ),
                ],
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                color: ZyntraColors.indigo,
                backgroundColor: ZyntraColors.card,
                onRefresh: _load,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Hero banner
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [ZyntraColors.indigo, ZyntraColors.purple],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [BoxShadow(color: ZyntraColors.indigo.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 6))],
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.video_call_rounded, color: Colors.white, size: 28),
                                const SizedBox(width: 8),
                                Text('Consult Online', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text('Talk to top doctors from the comfort of your home',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.inter(color: Colors.white70, fontSize: 12),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                _statItem('50+', 'Doctors'),
                                _statItem('15 min', 'Avg. Wait'),
                                _statItem('4.8', 'Rating'),
                              ],
                            ),
                          ],
                        ),
                      ).animate().fadeIn(duration: 300.ms),

                      const SizedBox(height: 24),
                      Text('Features', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 12),
                      Row(
                        children: _features.map((f) => Expanded(
                          child: Container(
                            margin: const EdgeInsets.only(right: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: ZyntraColors.card,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: ZyntraColors.border),
                            ),
                            child: Column(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: (f['color'] as Color).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(f['icon'] as IconData, color: f['color'] as Color, size: 20),
                                ),
                                const SizedBox(height: 8),
                                Text(f['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
                                const SizedBox(height: 2),
                                Text(f['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 8), textAlign: TextAlign.center),
                              ],
                            ),
                          ),
                        )).toList(),
                      ).animate().fadeIn(delay: 200.ms),

                      const SizedBox(height: 24),
                      Text('Available Doctors', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 12),
                      if (_loading)
                        ...List.generate(3, (_) => Shimmer.fromColors(
                          baseColor: ZyntraColors.card,
                          highlightColor: ZyntraColors.border,
                          child: Container(
                            height: 100, margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
                          ),
                        ))
                      else if (_error != null)
                        Center(child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text('Unable to load doctors. Pull to retry.', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                        ))
                      else if (_doctors.isEmpty)
                        _buildPlaceholderDoctors()
                      else
                        ..._doctors.map((d) => _doctorCard(d)),

                      const SizedBox(height: 24),
                      // Coming soon
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [ZyntraColors.indigo.withValues(alpha: 0.1), ZyntraColors.purple.withValues(alpha: 0.05)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: ZyntraColors.indigo.withValues(alpha: 0.2)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(color: ZyntraColors.indigo.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                              child: const Icon(Icons.auto_awesome_rounded, color: ZyntraColors.indigo, size: 28),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Coming Soon', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                  Text('AI-powered diagnosis, health monitoring, and more',
                                    style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.1, end: 0),
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

  Widget _statItem(String val, String label) {
    return Column(
      children: [
        Text(val, style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
        Text(label, style: GoogleFonts.inter(color: Colors.white70, fontSize: 10)),
      ],
    );
  }

  Widget _doctorCard(dynamic d) {
    final name = d['name'] ?? 'Dr. Specialist';
    final specialty = d['specialty'] ?? 'General Physician';
    final rating = d['rating'] ?? 4.5;
    final fee = d['consultingFee'] ?? 500;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: ZyntraColors.indigo.withValues(alpha: 0.2),
            child: Text(name.toString()[0].toUpperCase(),
              style: GoogleFonts.poppins(color: ZyntraColors.indigo, fontSize: 22, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name.toString(), style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(specialty.toString(), style: GoogleFonts.inter(color: ZyntraColors.indigo, fontSize: 12)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star_rounded, color: ZyntraColors.amber, size: 14),
                    const SizedBox(width: 2),
                    Text('$rating', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 8),
                    Text('\u20B9$fee', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _showConsultSheet(d),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.indigo, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: ZyntraColors.indigo.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))],
              ),
              child: Text('Consult', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderDoctors() {
    final placeholder = [
      {'name': 'Dr. Priya Sharma', 'specialty': 'Cardiologist', 'rating': 4.9, 'consultingFee': 800},
      {'name': 'Dr. Amit Patel', 'specialty': 'Neurologist', 'rating': 4.8, 'consultingFee': 1000},
      {'name': 'Dr. Sneha Verma', 'specialty': 'Dermatologist', 'rating': 4.7, 'consultingFee': 600},
    ];
    return Column(children: placeholder.map((d) => _doctorCard(d)).toList());
  }

  void _showConsultSheet(dynamic d) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.5,
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
              Text('Book Consultation', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: ZyntraColors.indigo.withValues(alpha: 0.2),
                    child: Text((d['name'] ?? 'D').toString()[0], style: GoogleFonts.poppins(color: ZyntraColors.indigo, fontSize: 20)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(d['name'] ?? 'Doctor', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                        Text(d['specialty'] ?? 'Specialist', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                      ],
                    ),
                  ),
                  Text('\u20B9${d['consultingFee'] ?? 500}', style: GoogleFonts.inter(color: ZyntraColors.green, fontWeight: FontWeight.w700, fontSize: 18)),
                ],
              ),
              const SizedBox(height: 24),
              Text('Select Time Slot', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8, runSpacing: 8,
                children: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map((t) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: ZyntraColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: ZyntraColors.border),
                  ),
                  child: Text(t, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                )).toList(),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Consultation booked!', style: GoogleFonts.inter(color: Colors.white)),
                    backgroundColor: ZyntraColors.green,
                    behavior: SnackBarBehavior.floating,
                  ));
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.indigo, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: ZyntraColors.indigo.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Center(
                    child: Text('Book Now', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
