import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/models/models.dart';
import '../../providers/doctor_provider.dart';

class SpecialistsScreen extends StatefulWidget {
  const SpecialistsScreen({super.key});
  @override State<SpecialistsScreen> createState() => _SpecialistsScreenState();
}

class _SpecialistsScreenState extends State<SpecialistsScreen> {
  String? _selectedCategory;

  final _categories = [
    {'name': 'Cardiology', 'icon': Icons.favorite_rounded, 'color': ZyntraColors.red},
    {'name': 'Neurology', 'icon': Icons.psychology_rounded, 'color': ZyntraColors.purple},
    {'name': 'Orthopedics', 'icon': Icons.directions_walk_rounded, 'color': ZyntraColors.teal},
    {'name': 'Pediatrics', 'icon': Icons.child_care_rounded, 'color': ZyntraColors.pink},
    {'name': 'Dermatology', 'icon': Icons.face_rounded, 'color': ZyntraColors.amber},
    {'name': 'Gynecology', 'icon': Icons.woman_rounded, 'color': ZyntraColors.cyan},
    {'name': 'Ophthalmology', 'icon': Icons.visibility_rounded, 'color': ZyntraColors.indigo},
    {'name': 'ENT', 'icon': Icons.hearing_rounded, 'color': ZyntraColors.green},
    {'name': 'Psychiatry', 'icon': Icons.psychology_rounded, 'color': ZyntraColors.purple},
    {'name': 'Oncology', 'icon': Icons.health_and_safety_rounded, 'color': ZyntraColors.red},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<DoctorProvider>();
      if (p.doctors.isEmpty) p.loadDoctors();
    });
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
                  Text('Specialists', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.cyan.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.person_search_rounded, color: ZyntraColors.cyan, size: 22),
                  ),
                ],
              ),
            ),
            // Categories horizontal scroll
            SizedBox(
              height: 120,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _categories.length,
                itemBuilder: (_, i) {
                  final cat = _categories[i];
                  final sel = _selectedCategory == cat['name'];
                  final color = cat['color'] as Color;
                  return GestureDetector(
                    onTap: () {
                      setState(() => _selectedCategory = sel ? null : cat['name'] as String);
                      context.read<DoctorProvider>().setSelectedSpecialty(_selectedCategory);
                    },
                    child: Container(
                      width: 90,
                      margin: const EdgeInsets.only(right: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        gradient: sel
                            ? LinearGradient(colors: [color.withValues(alpha: 0.25), color.withValues(alpha: 0.05)])
                            : null,
                        color: sel ? null : ZyntraColors.card,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: sel ? color : ZyntraColors.border,
                          width: sel ? 1.5 : 1,
                        ),
                        boxShadow: sel
                            ? [BoxShadow(color: color.withValues(alpha: 0.2), blurRadius: 12, offset: const Offset(0, 4))]
                            : null,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: sel ? 0.3 : 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(cat['icon'] as IconData, color: color, size: 22),
                          ),
                          const SizedBox(height: 6),
                          Text(cat['name'] as String, style: GoogleFonts.inter(
                            color: sel ? color : Colors.white,
                            fontSize: 10, fontWeight: FontWeight.w500,
                          ), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ).animate().fadeIn(delay: (i * 50).ms).slideY(begin: 0.1, end: 0),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),
            // Doctor list
            Expanded(
              child: Consumer<DoctorProvider>(
                builder: (ctx, provider, _) {
                  if (provider.loading && provider.doctors.isEmpty) return _buildShimmer();
                  if (provider.error != null) return _buildError(provider.error!);
                  final list = provider.filteredDoctors;
                  if (list.isEmpty) return _buildEmpty();
                  return RefreshIndicator(
                    color: ZyntraColors.cyan,
                    backgroundColor: ZyntraColors.card,
                    onRefresh: provider.loadDoctors,
                    child: ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                      itemCount: list.length,
                      itemBuilder: (_, i) => _doctorCard(list[i], i),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _doctorCard(Doctor doc, int i) {
    final initial = doc.name.isNotEmpty ? doc.name[0].toUpperCase() : 'D';
    final colors = [ZyntraColors.cyan, ZyntraColors.purple, ZyntraColors.green, ZyntraColors.pink, ZyntraColors.teal];
    final c = colors[i % colors.length];

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
        boxShadow: [BoxShadow(color: c.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: c.withValues(alpha: 0.2),
            child: Text(initial, style: GoogleFonts.poppins(color: c, fontSize: 22, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(doc.name, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(doc.specialty, style: GoogleFonts.inter(color: c, fontSize: 12)),
                if (doc.hospitalName != null) ...[
                  const SizedBox(height: 2),
                  Text(doc.hospitalName!, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                ],
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star_rounded, color: ZyntraColors.amber, size: 14),
                    const SizedBox(width: 2),
                    Text(doc.rating.toString(), style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 6),
                    Container(width: 1, height: 10, color: ZyntraColors.border),
                    const SizedBox(width: 6),
                    Text('\u20B9${doc.consultingFee.toInt()}', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: doc.isAvailable ? ZyntraColors.green.withValues(alpha: 0.15) : ZyntraColors.red.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(doc.isAvailable ? 'Available' : 'Busy', style: GoogleFonts.inter(
                        color: doc.isAvailable ? ZyntraColors.green : ZyntraColors.red,
                        fontSize: 9, fontWeight: FontWeight.w500,
                      )),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [c, c.withValues(alpha: 0.7)]),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [BoxShadow(color: c.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))],
                ),
                child: Text('Book', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 11)),
              ),
              const SizedBox(height: 4),
              GestureDetector(
                onTap: () {},
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: ZyntraColors.green.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.call_rounded, color: ZyntraColors.green, size: 14),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 50).ms).slideX(begin: 0.05, end: 0);
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: 4,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 100,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(18)),
        ),
      ),
    );
  }

  Widget _buildError(String err) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, color: ZyntraColors.red, size: 60),
            const SizedBox(height: 16),
            Text('Something went wrong', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(err, style: GoogleFonts.inter(color: ZyntraColors.white70), textAlign: TextAlign.center),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: () => context.read<DoctorProvider>().loadDoctors(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text('Retry', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: const Icon(Icons.person_search_rounded, color: ZyntraColors.cyan, size: 50),
          ),
          const SizedBox(height: 16),
          Text('No specialists found', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text('Select a category above', style: GoogleFonts.inter(color: ZyntraColors.white70)),
        ],
      ),
    );
  }
}
