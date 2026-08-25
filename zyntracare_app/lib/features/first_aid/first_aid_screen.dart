import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';

class FirstAidScreen extends StatefulWidget {
  const FirstAidScreen({super.key});
  @override State<FirstAidScreen> createState() => _FirstAidScreenState();
}

class _FirstAidScreenState extends State<FirstAidScreen> {
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';

  final _categories = [
    {'name': 'CPR', 'icon': Icons.favorite_rounded, 'color': ZyntraColors.red, 'steps': ['Check responsiveness - tap and shout', 'Call 108/102 for ambulance', 'Open airway - tilt head back', 'Check breathing (look, listen, feel for 10s)', 'Start chest compressions (100-120/min)', '30 compressions + 2 rescue breaths', 'Continue until help arrives'], 'offline': true},
    {'name': 'Burns', 'icon': Icons.local_fire_department_rounded, 'color': ZyntraColors.amber, 'steps': ['Remove source of burn', 'Cool under running water for 10-20 min', 'Cover loosely with sterile gauze', 'Do NOT apply ice, butter, or cream', 'Do NOT pop blisters', 'Take pain reliever if needed', 'Seek medical help for severe burns'], 'offline': true},
    {'name': 'Cuts', 'icon': Icons.water_drop_rounded, 'color': ZyntraColors.red, 'steps': ['Wash hands with soap', 'Apply direct pressure with clean cloth', 'Elevate injured area above heart', 'Clean wound with water', 'Apply antibiotic ointment', 'Cover with sterile bandage', 'Seek stitches if deep or won\'t stop bleeding'], 'offline': true},
    {'name': 'Choking', 'icon': Icons.air_rounded, 'color': ZyntraColors.teal, 'steps': ['Ask "Are you choking?"', 'Give 5 back blows between shoulder blades', 'Perform 5 abdominal thrusts (Heimlich)', 'Alternate back blows & thrusts', 'Call 108 if object doesn\'t come out', 'Start CPR if person becomes unconscious'], 'offline': true},
    {'name': 'Poisoning', 'icon': Icons.science_rounded, 'color': ZyntraColors.purple, 'steps': ['Call Poison Control (1066) immediately', 'Check pulse and breathing', 'Do NOT induce vomiting unless told', 'Save poison container for reference', 'If person vomits, keep them leaning forward', 'Perform CPR if unconscious/not breathing'], 'offline': true},
    {'name': 'Fractures', 'icon': Icons.medical_services_rounded, 'color': ZyntraColors.indigo, 'steps': ['Keep injured area still', 'Apply ice pack wrapped in cloth', 'Do NOT try to realign bone', 'Splint area with board/rolled magazine', 'Support with sling for arm fractures', 'Elevate if possible', 'Seek immediate medical help'], 'offline': true},
    {'name': 'Allergic Reactions', 'icon': Icons.medication_rounded, 'color': ZyntraColors.pink, 'steps': ['Remove trigger if possible', 'Administer antihistamine', 'Apply calamine lotion for itching', 'Monitor breathing closely', 'Use epinephrine auto-injector if available', 'Call 108 if swelling/wheezing', 'Lie person flat if dizzy'], 'offline': true},
    {'name': 'Snake Bite', 'icon': Icons.pets_rounded, 'color': ZyntraColors.green, 'steps': ['Keep person calm and still', 'Remove jewelry/tight clothing near bite', 'Keep bitten area below heart level', 'Do NOT cut wound or suck venom', 'Do NOT apply tourniquet', 'Note snake color/size if safe', 'Rush to nearest hospital immediately'], 'offline': true},
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filtered {
    if (_searchQuery.isEmpty) return _categories;
    return _categories.where((c) => c['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase())).toList();
  }

  void _callAmbulance() async {
    final uri = Uri.parse('tel:102');
    if (await canLaunchUrl(uri)) launchUrl(uri);
  }

  void _showDetail(Map<String, dynamic> cat) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.7,
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
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: (cat['color'] as Color).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(cat['icon'] as IconData, color: cat['color'] as Color, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(cat['name'] as String, style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
                        Row(
                          children: [
                            const Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 12),
                            const SizedBox(width: 4),
                            Text('Offline Available', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 11)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: _callAmbulance,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: ZyntraColors.red.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.call_rounded, color: ZyntraColors.red, size: 16),
                          const SizedBox(width: 4),
                          Text('102', style: GoogleFonts.inter(color: ZyntraColors.red, fontWeight: FontWeight.w700, fontSize: 14)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text('Call Ambulance', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              const SizedBox(height: 20),
              Expanded(
                child: ListView.separated(
                  itemCount: (cat['steps'] as List).length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (_, i) {
                    final steps = cat['steps'] as List;
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 28, height: 28,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                            shape: BoxShape.circle,
                          ),
                          child: Center(child: Text('${i + 1}', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12))),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: ZyntraColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: ZyntraColors.border),
                            ),
                            child: Text(steps[i] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, height: 1.4)),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.topLeft, end: Alignment.bottomRight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          GestureDetector(
                            onTap: () => Navigator.pop(context),
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                              child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text('First Aid', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                            child: const Icon(Icons.medical_information_rounded, color: Colors.white, size: 22),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('Step-by-step emergency procedures', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                // Search
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: TextField(
                    controller: _searchCtrl,
                    onChanged: (v) => setState(() => _searchQuery = v),
                    style: GoogleFonts.inter(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Search first aid procedures...',
                      hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
                      prefixIcon: const Icon(Icons.search_rounded, color: ZyntraColors.white40),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? GestureDetector(
                              onTap: () {
                                _searchCtrl.clear();
                                setState(() => _searchQuery = '');
                              },
                              child: const Icon(Icons.clear_rounded, color: ZyntraColors.white40),
                            )
                          : null,
                      filled: true,
                      fillColor: ZyntraColors.surface,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Category Grid
                Expanded(
                  child: _filtered.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.search_off_rounded, color: ZyntraColors.white40, size: 48),
                              const SizedBox(height: 12),
                              Text('No procedures found', style: GoogleFonts.inter(color: ZyntraColors.white70)),
                            ],
                          ),
                        )
                      : GridView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 120),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 1.0,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: _filtered.length,
                          itemBuilder: (_, i) => _categoryCard(_filtered[i], i),
                        ),
                ),
              ],
            ),
            // SOS Button
            Positioned(
              bottom: 24,
              left: 16,
              right: 16,
              child: Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: GestureDetector(
                      onTap: _callAmbulance,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFFDC2626), Color(0xFF991B1B)]),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 6))],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.call_rounded, color: Colors.white, size: 22),
                            const SizedBox(width: 8),
                            Text('Call Ambulance 102', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: _callAmbulance,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: ZyntraColors.red,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.3), blurRadius: 12)],
                      ),
                      child: const Icon(Icons.emergency_rounded, color: Colors.white, size: 28),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _categoryCard(Map<String, dynamic> cat, int i) {
    final color = cat['color'] as Color;
    return GestureDetector(
      onTap: () => _showDetail(cat),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color.withValues(alpha: 0.12), color.withValues(alpha: 0.03)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withValues(alpha: 0.2)),
          boxShadow: [BoxShadow(color: color.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: color.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                    child: Icon(cat['icon'] as IconData, color: color, size: 26),
                  ),
                  const Spacer(),
                  Text(cat['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  if (cat['offline'] == true)
                    Row(
                      children: [
                        const Icon(Icons.wifi_off_rounded, color: ZyntraColors.green, size: 10),
                        const SizedBox(width: 3),
                        Text('Offline', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 9)),
                      ],
                    ),
                ],
              ),
            ),
          ],
        ),
      ).animate().fadeIn(delay: (i * 60).ms).scale(begin: const Offset(0.9, 0.9), end: const Offset(1, 1), duration: 300.ms),
    );
  }
}
