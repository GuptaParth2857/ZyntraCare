import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class BookingsTab extends StatelessWidget {
  const BookingsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('My Bookings', style: GoogleFonts.poppins(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            Text('Manage your upcoming appointments', style: GoogleFonts.inter(color: ZyntraColors.white70)),
          ]),
        ),
        
        Expanded(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Animated empty state icon
                Container(
                  width: 120, height: 120,
                  decoration: BoxDecoration(
                    color: ZyntraColors.surface,
                    shape: BoxShape.circle,
                    border: Border.all(color: ZyntraColors.pink.withOpacity(0.3), width: 2),
                    boxShadow: [BoxShadow(color: ZyntraColors.pink.withOpacity(0.1), blurRadius: 30)],
                  ),
                  child: const Icon(Icons.calendar_month_rounded, color: ZyntraColors.pink, size: 50),
                ).animate(onPlay: (ctrl) => ctrl.repeat(reverse: true)).scaleXY(end: 1.05, duration: 1500.ms),
                
                const SizedBox(height: 32),
                Text('No Upcoming Bookings', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),
                Text('You haven\'t booked any appointments yet.\nFind a doctor and book your first visit.',
                  style: GoogleFonts.inter(color: ZyntraColors.white70),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 40),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [BoxShadow(color: ZyntraColors.cyan.withOpacity(0.4), blurRadius: 16, offset: const Offset(0, 4))],
                  ),
                  child: Text('Book an Appointment', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2, end: 0),
              ],
            ),
          ),
        ),
      ]),
    );
  }
}
