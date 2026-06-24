import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class OrganMatchingScreen extends StatefulWidget {
  const OrganMatchingScreen({super.key});
  @override State<OrganMatchingScreen> createState() => _OrganMatchingScreenState();
}

class _OrganMatchingScreenState extends State<OrganMatchingScreen> {
  final _api = ApiService();
  bool _loading = false;
  bool _registered = false;
  bool _showForm = false;

  final Set<String> _selectedOrgans = {};
  String _bloodGroup = 'A+';
  String _tissueType = 'HLA-A1';
  bool _hasMedicalHistory = false;

  final _organs = ['Kidney', 'Heart', 'Liver', 'Lungs', 'Pancreas', 'Cornea'];
  final _bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  final _tissueTypes = ['HLA-A1', 'HLA-A2', 'HLA-B7', 'HLA-B8', 'HLA-DR3', 'HLA-DR4'];

  final _matchResults = [
    {'code': 'DON-7845', 'recipient': 'REC-2310', 'organ': 'Kidney', 'match': 94, 'location': 'Mumbai', 'status': 'matched'},
    {'code': 'DON-5621', 'recipient': 'REC-8976', 'organ': 'Heart', 'match': 87, 'location': 'Delhi', 'status': 'pending'},
    {'code': 'DON-3390', 'recipient': 'REC-4523', 'organ': 'Liver', 'match': 72, 'location': 'Bangalore', 'status': 'pending'},
  ];

  final _stats = {
    'donors': '12,458',
    'recipients': '8,234',
    'matches': '3,891',
  };

  Future<void> _registerDonor() async {
    if (_selectedOrgans.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Select at least one organ', style: GoogleFonts.inter(color: Colors.white)),
        backgroundColor: ZyntraColors.amber, behavior: SnackBarBehavior.floating,
      ));
      return;
    }
    setState(() => _loading = true);
    try {
      await _api.post('/api/organ-matching/register', body: {
        'organs': _selectedOrgans.toList(),
        'bloodGroup': _bloodGroup,
        'tissueType': _tissueType,
        'medicalHistory': _hasMedicalHistory,
      });
    } catch (_) {}
    if (mounted) {
      setState(() {
        _loading = false;
        _registered = true;
        _showForm = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Registered as organ donor successfully!', style: GoogleFonts.inter(color: Colors.white)),
        backgroundColor: ZyntraColors.green, behavior: SnackBarBehavior.floating,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
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
                      Text('Organ Matching', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Donate life, find matches', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Registration Status
                          _buildRegistrationStatus(),
                          const SizedBox(height: 20),
                          if (_showForm) _buildRegistrationForm(),
                          // Stats
                          _buildStatsRow(),
                          const SizedBox(height: 24),
                          // Match Results
                          Row(
                            children: [
                              Text('Match Results', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                              const Spacer(),
                              Text('${_matchResults.length} matches', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ...List.generate(_matchResults.length, (i) => _matchCard(_matchResults[i], i)),
                          const SizedBox(height: 24),
                          // CTAs
                          if (!_showForm) ...[
                            GestureDetector(
                              onTap: () => setState(() => _showForm = true),
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                                ),
                                child: Center(
                                  child: Text('Register as Donor', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            GestureDetector(
                              onTap: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                content: Text('Finding matches...', style: GoogleFonts.inter(color: Colors.white)),
                                backgroundColor: ZyntraColors.purple, behavior: SnackBarBehavior.floating,
                              )),
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                decoration: BoxDecoration(
                                  color: ZyntraColors.surface,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: ZyntraColors.border),
                                ),
                                child: Center(
                                  child: Text('Find Match for Recipient', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRegistrationStatus() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _registered
              ? [ZyntraColors.green.withValues(alpha: 0.15), ZyntraColors.card]
              : [ZyntraColors.amber.withValues(alpha: 0.1), ZyntraColors.card],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _registered ? ZyntraColors.green.withValues(alpha: 0.4) : ZyntraColors.border,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _registered ? ZyntraColors.green.withValues(alpha: 0.2) : ZyntraColors.amber.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              _registered ? Icons.check_circle_rounded : Icons.favorite_border_rounded,
              color: _registered ? ZyntraColors.green : ZyntraColors.amber,
              size: 32,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Donor Status', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                Text(
                  _registered ? 'Registered' : 'Not Registered',
                  style: GoogleFonts.poppins(
                    color: _registered ? ZyntraColors.green : ZyntraColors.amber,
                    fontSize: 20, fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  _registered ? 'You are a registered organ donor' : 'Register to save lives',
                  style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildRegistrationForm() {
    return Container(
      padding: const EdgeInsets.all(20),
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Registration Form', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          Text('Select Organs to Donate', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: _organs.map((organ) => GestureDetector(
              onTap: () => setState(() => _selectedOrgans.contains(organ) ? _selectedOrgans.remove(organ) : _selectedOrgans.add(organ)),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: _selectedOrgans.contains(organ) ? ZyntraColors.green.withValues(alpha: 0.15) : ZyntraColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _selectedOrgans.contains(organ) ? ZyntraColors.green.withValues(alpha: 0.4) : ZyntraColors.border),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _selectedOrgans.contains(organ) ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded,
                      color: _selectedOrgans.contains(organ) ? ZyntraColors.green : ZyntraColors.white40,
                      size: 16,
                    ),
                    const SizedBox(width: 6),
                    Text(organ, style: GoogleFonts.inter(
                      color: _selectedOrgans.contains(organ) ? Colors.white : ZyntraColors.white70,
                      fontSize: 13,
                    )),
                  ],
                ),
              ),
            )).toList(),
          ),
          const SizedBox(height: 16),
          _dropdownField('Blood Group', _bloodGroup, _bloodGroups, (v) => setState(() => _bloodGroup = v)),
          const SizedBox(height: 12),
          _dropdownField('Tissue Type', _tissueType, _tissueTypes, (v) => setState(() => _tissueType = v)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Medical History', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                      Text('Any chronic conditions?', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                    ],
                  ),
                ),
                Switch(
                  value: _hasMedicalHistory,
                  onChanged: (v) => setState(() => _hasMedicalHistory = v),
                  activeColor: ZyntraColors.green,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: _registerDonor,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.green, ZyntraColors.teal]),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: ZyntraColors.green.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
              ),
              child: Center(
                child: Text('Submit Registration', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
              ),
            ),
          ),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: () => setState(() => _showForm = false),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: ZyntraColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: Center(child: Text('Cancel', style: GoogleFonts.inter(color: ZyntraColors.white70, fontWeight: FontWeight.w600))),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _dropdownField(String label, String value, List<String> items, ValueChanged<String> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              dropdownColor: ZyntraColors.card,
              isExpanded: true,
              style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
              items: items.map((o) => DropdownMenuItem(value: o, child: Text(o))).toList(),
              onChanged: (v) => onChanged(v!),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsRow() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [ZyntraColors.card, ZyntraColors.surface]),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Matching Statistics', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          Row(
            children: [
              _statItem(Icons.people_rounded, 'Donors', _stats['donors']!, ZyntraColors.green),
              Container(width: 1, height: 50, color: ZyntraColors.border),
              _statItem(Icons.hourglass_empty_rounded, 'Waiting', _stats['recipients']!, ZyntraColors.amber),
              Container(width: 1, height: 50, color: ZyntraColors.border),
              _statItem(Icons.favorite_rounded, 'Matches', _stats['matches']!, ZyntraColors.pink),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms);
  }

  Widget _statItem(IconData icon, String label, String value, Color color) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
          Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
        ],
      ),
    );
  }

  Widget _matchCard(Map<String, dynamic> match, int i) {
    final matchPct = match['match'] as int;
    final matchColor = matchPct >= 85 ? ZyntraColors.green : (matchPct >= 70 ? ZyntraColors.amber : ZyntraColors.red);
    final status = match['status'] as String;
    final statusColor = status == 'matched' ? ZyntraColors.green : ZyntraColors.amber;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: matchColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.favorite_rounded, color: matchColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${match['organ']} Match', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    Text('Donor: ${match['code']}  \u2022  Recipient: ${match['recipient']}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: Text(status[0].toUpperCase() + status.substring(1), style: GoogleFonts.inter(color: statusColor, fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: matchPct / 100,
                    backgroundColor: ZyntraColors.border,
                    valueColor: AlwaysStoppedAnimation<Color>(matchColor),
                    minHeight: 8,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text('$matchPct%', style: GoogleFonts.inter(color: matchColor, fontSize: 14, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.location_on_rounded, color: ZyntraColors.white70, size: 14),
              const SizedBox(width: 4),
              Text(match['location'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 60).ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildShimmer() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
      children: [
        Shimmer.fromColors(baseColor: ZyntraColors.card, highlightColor: ZyntraColors.border,
          child: Container(height: 100, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20)))),
        const SizedBox(height: 20),
        Shimmer.fromColors(baseColor: ZyntraColors.card, highlightColor: ZyntraColors.border,
          child: Container(height: 120, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20)))),
        const SizedBox(height: 24),
        ...List.generate(3, (_) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Shimmer.fromColors(baseColor: ZyntraColors.card, highlightColor: ZyntraColors.border,
            child: Container(height: 140, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)))),
        )),
      ],
    );
  }
}
