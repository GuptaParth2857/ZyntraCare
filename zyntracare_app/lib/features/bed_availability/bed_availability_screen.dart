import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/models/models.dart';
import '../../providers/hospital_provider.dart';

class BedAvailabilityScreen extends StatefulWidget {
  const BedAvailabilityScreen({super.key});
  @override State<BedAvailabilityScreen> createState() => _BedAvailabilityScreenState();
}

class _BedAvailabilityScreenState extends State<BedAvailabilityScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<HospitalProvider>();
      if (p.hospitals.isEmpty) p.loadHospitals();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<HospitalProvider>(
          builder: (ctx, provider, _) {
            return Column(
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
                      Text('Bed Availability', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: ZyntraColors.green.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.3)),
                        ),
                        child: const Icon(Icons.hotel_rounded, color: ZyntraColors.green, size: 22),
                      ),
                    ],
                  ),
                ),
                // Summary strip
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [ZyntraColors.card, ZyntraColors.surface],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: ZyntraColors.border),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _summaryItem(Icons.hotel_rounded, 'Total Beds', provider.hospitals.fold(0, (s, h) => s + h.totalBeds).toString(), ZyntraColors.cyan),
                      Container(width: 1, height: 40, color: ZyntraColors.border),
                      _summaryItem(Icons.check_circle_rounded, 'Available', provider.hospitals.fold(0, (s, h) => s + h.availableBeds).toString(), ZyntraColors.green),
                      Container(width: 1, height: 40, color: ZyntraColors.border),
                      _summaryItem(Icons.medical_services_rounded, 'ICU Beds', provider.hospitals.fold(0, (s, h) => s + h.icuBeds).toString(), ZyntraColors.purple),
                    ],
                  ),
                ).animate().fadeIn(duration: 300.ms),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
                  child: Text('Hospital-wise Bed Status', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                ),
                Expanded(
                  child: provider.loading && provider.hospitals.isEmpty
                      ? _buildShimmer()
                      : RefreshIndicator(
                          color: ZyntraColors.green,
                          backgroundColor: ZyntraColors.card,
                          onRefresh: provider.loadHospitals,
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                            itemCount: provider.hospitals.length,
                            itemBuilder: (ctx, i) => _hospitalBedCard(provider.hospitals[i], i),
                          ),
                        ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _summaryItem(IconData icon, String label, String value, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
        Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
      ],
    );
  }

  Widget _hospitalBedCard(Hospital h, int i) {
    final occupancy = h.occupancyPercent;
    final occColor = occupancy > 80 ? ZyntraColors.red : (occupancy > 60 ? ZyntraColors.amber : ZyntraColors.green);

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
        boxShadow: [BoxShadow(color: ZyntraColors.green.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: occColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.local_hospital_rounded, color: occColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(h.name, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text('${h.city} \u2022 ${h.workingHours}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: h.availableBeds > 0 ? ZyntraColors.green.withValues(alpha: 0.15) : ZyntraColors.red.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  h.availableBeds > 0 ? '${h.availableBeds} Available' : 'Full',
                  style: GoogleFonts.inter(
                    color: h.availableBeds > 0 ? ZyntraColors.green : ZyntraColors.red,
                    fontSize: 11, fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Bed counts
          Row(
            children: [
              _bedCount('Total', h.totalBeds.toString(), ZyntraColors.cyan),
              _bedCount('Available', h.availableBeds.toString(), ZyntraColors.green),
              _bedCount('ICU', h.icuBeds.toString(), ZyntraColors.purple),
              _bedCount('Occupancy', '$occupancy%', occColor),
            ],
          ),
          const SizedBox(height: 14),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: occupancy / 100,
              backgroundColor: ZyntraColors.border,
              valueColor: AlwaysStoppedAnimation<Color>(occColor),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '$occupancy% occupied \u2022 ${h.totalBeds - h.availableBeds} beds in use',
            style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10),
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 60).ms).slideY(begin: 0.05, end: 0);
  }

  Widget _bedCount(String label, String value, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: GoogleFonts.poppins(color: color, fontSize: 16, fontWeight: FontWeight.w700)),
          Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
        ],
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
          height: 180,
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20)),
        ),
      ),
    );
  }
}
