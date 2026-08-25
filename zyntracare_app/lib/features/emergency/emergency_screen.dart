import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';
import '../../providers/emergency_provider.dart';

class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({super.key});
  @override State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> with SingleTickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  late AnimationController _sosCtrl;
  bool _sosActivated = false;
  final _api = ApiService();

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat(reverse: true);
    _sosCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 500))..repeat(reverse: true);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<EmergencyProvider>();
      if (p.donors.isEmpty) p.loadBloodDonors();
    });
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _sosCtrl.dispose();
    super.dispose();
  }

  void _callEmergency(String number) async {
    final uri = Uri.parse('tel:$number');
    if (await canLaunchUrl(uri)) launchUrl(uri);
  }

  Future<void> _triggerSOS() async {
    setState(() => _sosActivated = !_sosActivated);
    if (_sosActivated) {
      // Auto-send emergency to API
      try {
        await _api.createEmergencyCase({
          'type': 'sos',
          'message': 'Emergency SOS activated',
          'timestamp': DateTime.now().toIso8601String(),
        });
      } catch (_) {}

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text('SOS sent! Help is on the way.', style: GoogleFonts.inter(color: Colors.white))),
          ],
        ),
        backgroundColor: ZyntraColors.green,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ));

      // Auto-disable after 10s
      Future.delayed(const Duration(seconds: 10), () {
        if (mounted) setState(() => _sosActivated = false);
      });
    }
  }

  final _emergencyContacts = [
    {'name': 'Police', 'number': '100', 'icon': Icons.local_police_rounded, 'color': ZyntraColors.indigo},
    {'name': 'Fire', 'number': '101', 'icon': Icons.fire_extinguisher_rounded, 'color': ZyntraColors.amber},
    {'name': 'Women Helpline', 'number': '1091', 'icon': Icons.female_rounded, 'color': ZyntraColors.pink},
    {'name': 'Poison Control', 'number': '1066', 'icon': Icons.science_rounded, 'color': ZyntraColors.teal},
  ];

  final _firstAidSteps = [
    {'title': 'Heart Attack', 'icon': Icons.favorite_rounded, 'steps': '1. Call ambulance immediately\n2. Keep person sitting upright\n3. Help them chew aspirin (if not allergic)\n4. Perform CPR if unconscious'},
    {'title': 'Burns', 'icon': Icons.local_fire_department_rounded, 'steps': '1. Cool burn under running water for 10+ min\n2. Cover loosely with sterile gauze\n3. Do NOT apply ice, butter, or cream\n4. Seek medical help for severe burns'},
    {'title': 'Bleeding', 'icon': Icons.water_drop_rounded, 'steps': '1. Apply direct pressure with clean cloth\n2. Elevate injured limb above heart\n3. Keep pressure until bleeding stops\n4. Seek emergency care if severe'},
    {'title': 'Choking', 'icon': Icons.air_rounded, 'steps': '1. Perform Heimlich maneuver (abdominal thrusts)\n2. Give 5 back blows between shoulder blades\n3. Check mouth for visible object\n4. Call emergency if unsuccessful'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top bar
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
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
                    Text('Emergency', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                    const Spacer(),
                    AnimatedBuilder(
                      animation: _pulseCtrl,
                      builder: (_, _) => GestureDetector(
                        onTap: _triggerSOS,
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: _sosActivated
                                ? ZyntraColors.red
                                : ZyntraColors.red.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: ZyntraColors.red.withValues(alpha: _pulseCtrl.value * 0.5 + 0.5),
                              width: 2,
                            ),
                            boxShadow: _sosActivated
                                ? [BoxShadow(color: ZyntraColors.red.withValues(alpha: _pulseCtrl.value * 0.6), blurRadius: 20, spreadRadius: 4)]
                                : null,
                          ),
                          child: Text(
                            'SOS',
                            style: GoogleFonts.poppins(
                              color: _sosActivated ? Colors.white : ZyntraColors.red,
                              fontSize: 16, fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // SOS Activation Banner
              if (_sosActivated)
                AnimatedBuilder(
                  animation: _sosCtrl,
                  builder: (_, _) => Container(
                    width: double.infinity,
                    margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          ZyntraColors.red.withValues(alpha: 0.8 + _sosCtrl.value * 0.2),
                          ZyntraColors.red,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: _sosCtrl.value * 0.5), blurRadius: 30, spreadRadius: 4)],
                    ),
                    child: Row(
                      children: [
                        Transform.scale(scale: 0.8 + _sosCtrl.value * 0.2,
                          child: const Icon(Icons.emergency_rounded, color: Colors.white, size: 40)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('SOS ACTIVATED', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                              Text('Help has been notified', style: GoogleFonts.inter(color: Colors.white70, fontSize: 12)),
                            ],
                          ),
                        ),
                        GestureDetector(
                          onTap: _triggerSOS,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text('CANCEL', style: GoogleFonts.inter(color: ZyntraColors.red, fontWeight: FontWeight.w800, fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
                  ).animate().scale(duration: 300.ms, curve: Curves.elasticOut),
                ),

              // Emergency Banner
              AnimatedBuilder(
                animation: _pulseCtrl,
                builder: (_, _) => Container(
                  width: double.infinity,
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFFDC2626), Color(0xFFB91C1C)]),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: ZyntraColors.red.withValues(alpha: _pulseCtrl.value * 0.5),
                        blurRadius: 20 + _pulseCtrl.value * 10,
                        spreadRadius: _pulseCtrl.value * 2,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Transform.scale(scale: 0.8 + _pulseCtrl.value * 0.2,
                        child: const Icon(Icons.emergency_rounded, color: Colors.white, size: 56)),
                      const SizedBox(height: 12),
                      Text('Need Immediate Help?', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      Text('24/7 Emergency Hotline', style: GoogleFonts.inter(color: Colors.white70, fontSize: 14)),
                      const SizedBox(height: 20),
                      GestureDetector(
                        onTap: () => _callEmergency('102'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(30),
                            boxShadow: [BoxShadow(color: Colors.white.withValues(alpha: 0.3), blurRadius: 12)],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.phone_rounded, color: Color(0xFFDC2626), size: 22),
                              const SizedBox(width: 8),
                              Text('Call 102 / 108', style: GoogleFonts.inter(color: const Color(0xFFDC2626), fontSize: 20, fontWeight: FontWeight.w800)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(duration: 400.ms),
              const SizedBox(height: 24),

              // Quick Actions
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Text('Quick Actions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(child: _actionCard(Icons.medical_services_rounded, 'Book Ambulance', ZyntraColors.red, () => _callEmergency('102'))),
                    const SizedBox(width: 12),
                    Expanded(child: _actionCard(Icons.local_hospital_rounded, 'Nearest Hospital', ZyntraColors.cyan, () {})),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(child: _actionCard(Icons.my_location_rounded, 'Share Location', ZyntraColors.purple, _triggerSOS)),
                    const SizedBox(width: 12),
                    Expanded(child: _actionCard(Icons.medical_information_rounded, 'First Aid Guide', ZyntraColors.teal, () {})),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // First Aid Guide
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Text('First Aid Guide', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              ),
              ..._firstAidSteps.map((guide) => Container(
                margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: ZyntraColors.card,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: ZyntraColors.border),
                ),
                child: ExpansionTile(
                  tilePadding: EdgeInsets.zero,
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: ZyntraColors.red.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                    child: Icon(guide['icon'] as IconData, color: ZyntraColors.red, size: 22),
                  ),
                  title: Text(guide['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 8, bottom: 4),
                      child: Text(guide['steps'] as String,
                        style: GoogleFonts.inter(color: ZyntraColors.white70, height: 1.6, fontSize: 13)),
                    ),
                  ],
                ),
              )),

              const SizedBox(height: 24),

              // Emergency Contacts
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Text('Emergency Contacts', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              ),
              ..._emergencyContacts.map((c) => GestureDetector(
                onTap: () => _callEmergency(c['number'] as String),
                child: Container(
                  margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: ZyntraColors.card,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: ZyntraColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: (c['color'] as Color).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(c['icon'] as IconData, color: c['color'] as Color, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                            Text(c['number'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: ZyntraColors.green.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.call_rounded, color: ZyntraColors.green, size: 18),
                      ),
                    ],
                  ),
                ),
              )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _actionCard(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color.withValues(alpha: 0.15), color.withValues(alpha: 0.05)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: color.withValues(alpha: 0.25)),
          boxShadow: [BoxShadow(color: color.withValues(alpha: 0.08), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(label, style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
