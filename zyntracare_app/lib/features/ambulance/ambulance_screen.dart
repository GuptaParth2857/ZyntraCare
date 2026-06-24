import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';

class AmbulanceScreen extends StatefulWidget {
  const AmbulanceScreen({super.key});
  @override State<AmbulanceScreen> createState() => _AmbulanceScreenState();
}

class _AmbulanceScreenState extends State<AmbulanceScreen> with SingleTickerProviderStateMixin {
  int? _selectedType;
  late AnimationController _pulseCtrl;

  final _types = [
    {'id': 0, 'name': 'BLS Ambulance', 'desc': 'Basic Life Support - AC, stretcher, first aid', 'price': '₹500', 'icon': Icons.medical_services_rounded, 'color': ZyntraColors.green},
    {'id': 1, 'name': 'ALS Ambulance', 'desc': 'Advanced Life Support - Ventilator, cardiac monitor, defibrillator', 'price': '₹1,000', 'icon': Icons.emergency_rounded, 'color': ZyntraColors.amber},
    {'id': 2, 'name': 'Neonatal Ambulance', 'desc': 'Neonatal ICU - Incubator, pediatric specialist, portable ventilator', 'price': '₹1,500', 'icon': Icons.child_care_rounded, 'color': ZyntraColors.pink},
  ];

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000))..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  void _callEmergency() async {
    final uri = Uri.parse('tel:102');
    if (await canLaunchUrl(uri)) launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
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
                  Text('Book Ambulance', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                ],
              ),
              const SizedBox(height: 24),

              // Emergency Banner
              AnimatedBuilder(
                animation: _pulseCtrl,
                builder: (_, _) => Container(
                  width: double.infinity,
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
                      Transform.scale(
                        scale: 0.8 + _pulseCtrl.value * 0.2,
                        child: const Icon(Icons.emergency_rounded, color: Colors.white, size: 60),
                      ),
                      const SizedBox(height: 12),
                      Text('24/7 Emergency Ambulance', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      Text('Call now for immediate assistance', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                      const SizedBox(height: 20),
                      GestureDetector(
                        onTap: _callEmergency,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(30),
                            boxShadow: [BoxShadow(color: Colors.white.withValues(alpha: 0.3), blurRadius: 12)],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.phone_rounded, color: Color(0xFFDC2626), size: 20),
                              const SizedBox(width: 8),
                              Text('Call 102 / 108', style: GoogleFonts.inter(color: const Color(0xFFDC2626), fontSize: 18, fontWeight: FontWeight.w800)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 28),

              // Or book online section
              Row(
                children: [
                  const Expanded(child: Divider(color: ZyntraColors.border)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text('OR BOOK ONLINE', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12, letterSpacing: 1.5)),
                  ),
                  const Expanded(child: Divider(color: ZyntraColors.border)),
                ],
              ),
              const SizedBox(height: 20),

              Text('Select Ambulance Type', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              const SizedBox(height: 14),

              // Ambulance types
              ..._types.map((t) => _ambulanceTypeCard(t)),

              const SizedBox(height: 28),

              // Book Now button
              GestureDetector(
                onTap: _selectedType != null ? () => _showBookingConfirm() : null,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    gradient: _selectedType != null
                        ? const LinearGradient(colors: [ZyntraColors.red, ZyntraColors.purple])
                        : LinearGradient(colors: [ZyntraColors.border, ZyntraColors.border]),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: _selectedType != null
                        ? [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 8))]
                        : null,
                  ),
                  child: Center(
                    child: Text(
                      _selectedType != null ? 'Book ${_types[_selectedType!]['name']}'.toUpperCase() : 'Select Ambulance Type',
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2, end: 0),
            ],
          ),
        ),
      ),
    );
  }

  Widget _ambulanceTypeCard(Map<String, dynamic> t) {
    final sel = _selectedType == t['id'];
    final color = t['color'] as Color;
    return GestureDetector(
      onTap: () => setState(() => _selectedType = t['id'] as int),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: sel
                ? [color.withValues(alpha: 0.2), color.withValues(alpha: 0.05)]
                : [ZyntraColors.card, ZyntraColors.surface],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: sel ? color : ZyntraColors.border,
            width: sel ? 1.5 : 1,
          ),
          boxShadow: sel
              ? [BoxShadow(color: color.withValues(alpha: 0.2), blurRadius: 16, offset: const Offset(0, 4))]
              : null,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: sel ? 0.3 : 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(t['icon'] as IconData, color: color, size: 26),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(t['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(t['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: sel ? color.withValues(alpha: 0.2) : ZyntraColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: sel ? color.withValues(alpha: 0.4) : ZyntraColors.border),
              ),
              child: Text(t['price'] as String, style: GoogleFonts.inter(color: sel ? color : ZyntraColors.white70, fontWeight: FontWeight.w700, fontSize: 14)),
            ),
            if (sel) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                child: const Icon(Icons.check_rounded, color: Colors.white, size: 14),
              ),
            ],
          ],
        ),
      ),
    ).animate().fadeIn(delay: ((t['id'] as int) * 80).ms).slideX(begin: 0.1, end: 0);
  }

  void _showBookingConfirm() {
    final t = _types[_selectedType!];
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: (t['color'] as Color).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(t['icon'] as IconData, color: t['color'] as Color, size: 36),
              ),
              const SizedBox(height: 16),
              Text('Booking ${t['name']}', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Text(t['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70), textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text('Price: ${t['price']}', style: GoogleFonts.inter(color: ZyntraColors.green, fontWeight: FontWeight.w700, fontSize: 18)),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Ambulance booked! Help is on the way.', style: GoogleFonts.inter(color: Colors.white)),
                    backgroundColor: ZyntraColors.green,
                    behavior: SnackBarBehavior.floating,
                  ));
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.red, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Center(
                    child: Text('Confirm Booking', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () => Navigator.pop(ctx),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: ZyntraColors.border.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Text('Cancel', style: GoogleFonts.inter(color: ZyntraColors.white70, fontWeight: FontWeight.w600)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
