import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class FamilyCareScreen extends StatefulWidget {
  const FamilyCareScreen({super.key});
  @override State<FamilyCareScreen> createState() => _FamilyCareScreenState();
}

class _FamilyCareScreenState extends State<FamilyCareScreen> {
  bool _loading = true;
  List<dynamic> _members = [];
  final Set<int> _expandedIndices = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().get('/api/family-members');
      if (mounted && res is List) setState(() => _members = res);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  final _placeholderMembers = [
    {'name': 'Anita Gupta', 'relation': 'Spouse', 'age': 32, 'bloodGroup': 'B+', 'medicalConditions': 'None', 'avatar': 'A'},
    {'name': 'Rahul Gupta', 'relation': 'Son', 'age': 8, 'bloodGroup': 'O+', 'medicalConditions': 'Asthma', 'avatar': 'R'},
    {'name': 'Suresh Gupta', 'relation': 'Father', 'age': 62, 'bloodGroup': 'A+', 'medicalConditions': 'Diabetes, BP', 'avatar': 'S'},
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
                  Text('Family Care', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  GestureDetector(
                    onTap: _showAddMemberSheet,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: ZyntraColors.green.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.person_add_rounded, color: ZyntraColors.green, size: 22),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : RefreshIndicator(
                      color: ZyntraColors.cyan,
                      backgroundColor: ZyntraColors.card,
                      onRefresh: _load,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _familySummary(),
                            const SizedBox(height: 20),
                            _sectionHeader('Family Members', Icons.people_rounded),
                            const SizedBox(height: 12),
                            ...(_members.isNotEmpty ? _members : _placeholderMembers).asMap().entries.map((e) => _memberCard(e.key, e.value)),
                            const SizedBox(height: 16),
                            GestureDetector(
                              onTap: _showAddMemberSheet,
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                decoration: BoxDecoration(
                                  color: ZyntraColors.card,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: ZyntraColors.border, style: BorderStyle.solid),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.person_add_rounded, color: ZyntraColors.cyan, size: 20),
                                    const SizedBox(width: 8),
                                    Text('Add Family Member', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 14, fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              ),
                            ),
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

  Widget _familySummary() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ZyntraColors.teal, ZyntraColors.green],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: ZyntraColors.teal.withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Column(
        children: [
          const Icon(Icons.family_restroom_rounded, color: Colors.white, size: 36),
          const SizedBox(height: 8),
          Text('Family Health Summary', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _summaryItem('3', 'Members'),
              _summaryItem('2', 'Upcoming Checkups'),
              _summaryItem('1', 'Pending Vaccinations'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _summaryItem(String val, String label) {
    return Column(
      children: [
        Text(val, style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
        Text(label, style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.8), fontSize: 10)),
      ],
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: ZyntraColors.teal.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: ZyntraColors.teal, size: 16),
        ),
        const SizedBox(width: 8),
        Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _memberCard(int index, dynamic m) {
    final expanded = _expandedIndices.contains(index);
    final initials = (m['name'] ?? '?').toString().split(' ').map((s) => s.isNotEmpty ? s[0] : '').take(2).join();
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          expandedCrossAxisAlignment: CrossAxisAlignment.start,
          onExpansionChanged: (val) {
            setState(() {
              if (val) { _expandedIndices.add(index); }
              else { _expandedIndices.remove(index); }
            });
          },
          leading: CircleAvatar(
            radius: 22,
            backgroundColor: ZyntraColors.teal.withValues(alpha: 0.2),
            child: Text(initials, style: GoogleFonts.poppins(color: ZyntraColors.teal, fontSize: 16, fontWeight: FontWeight.w700)),
          ),
          title: Text(m['name'] ?? 'Member', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          subtitle: Text('${m['relation'] ?? 'Family'} • ${m['age'] ?? ''} yrs • ${m['bloodGroup'] ?? ''}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
          trailing: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(color: ZyntraColors.teal.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
            child: Icon(expanded ? Icons.expand_less_rounded : Icons.expand_more_rounded, color: ZyntraColors.teal, size: 20),
          ),
          collapsedBackgroundColor: ZyntraColors.card,
          backgroundColor: ZyntraColors.surface,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (m['medicalConditions'] != null && (m['medicalConditions'] as String).isNotEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(10),
                      margin: const EdgeInsets.only(bottom: 8),
                      decoration: BoxDecoration(color: ZyntraColors.amber.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10), border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.2))),
                      child: Row(
                        children: [
                          Icon(Icons.info_rounded, color: ZyntraColors.amber, size: 14),
                          const SizedBox(width: 6),
                          Text('Medical conditions: ${m['medicalConditions']}', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 11)),
                        ],
                      ),
                    ),
                  _expandRow(Icons.folder_rounded, 'Health Records', '3 records available'),
                  const SizedBox(height: 6),
                  _expandRow(Icons.calendar_month_rounded, 'Upcoming Appointments', 'Jun 28 - Dr. Sharma'),
                  const SizedBox(height: 6),
                  _expandRow(Icons.medication_rounded, 'Medications', '2 active prescriptions'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _expandRow(IconData icon, String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(10)),
      child: Row(
        children: [
          Icon(icon, color: ZyntraColors.cyan, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                Text(subtitle, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
              ],
            ),
          ),
          Icon(Icons.chevron_right_rounded, color: ZyntraColors.white40, size: 16),
        ],
      ),
    );
  }

  void _showAddMemberSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocalState) => Container(
          height: MediaQuery.of(ctx).size.height * 0.65,
          decoration: const BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)))),
                const SizedBox(height: 20),
                Text('Add Family Member', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                _sheetField('Full Name', Icons.person_rounded),
                const SizedBox(height: 12),
                _sheetField('Relation', Icons.family_restroom_rounded),
                const SizedBox(height: 12),
                _sheetField('Age', Icons.calendar_month_rounded),
                const SizedBox(height: 12),
                _sheetField('Blood Group', Icons.bloodtype_rounded),
                const SizedBox(height: 12),
                _sheetField('Medical Conditions', Icons.info_rounded),
                const Spacer(),
                GestureDetector(
                  onTap: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('Family member added!', style: GoogleFonts.inter(color: Colors.white)),
                      backgroundColor: ZyntraColors.green,
                      behavior: SnackBarBehavior.floating,
                    ));
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [ZyntraColors.teal, ZyntraColors.green]),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: ZyntraColors.teal.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                    ),
                    child: Center(
                      child: Text('Add Member', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _sheetField(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: ZyntraColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: TextField(
        style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          icon: Icon(icon, color: ZyntraColors.teal, size: 20),
          labelText: label,
          labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: 6,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 80,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}
