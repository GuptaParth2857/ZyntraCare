import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class SchemesScreen extends StatefulWidget {
  const SchemesScreen({super.key});
  @override State<SchemesScreen> createState() => _SchemesScreenState();
}

class _SchemesScreenState extends State<SchemesScreen> {
  final _api = ApiService();
  bool _loading = true;
  List<Map<String, dynamic>> _schemes = [];
  String _selectedCategory = 'All';
  int? _expandedIndex;
  bool _showQuiz = false;
  int _quizScore = 0;
  bool _quizCompleted = false;
  bool _showApplyForm = false;

  final List<String> _categories = ['All', 'Central', 'State', 'Insurance', 'Preventive'];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/schemes');
    if (res != null && mounted) {
      setState(() {
        _schemes = (res['data'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  List<Map<String, dynamic>> get _filteredSchemes {
    if (_selectedCategory == 'All') return _schemes;
    return _schemes.where((s) => (s['category'] ?? '') == _selectedCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        title: Text('Health Schemes', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight))),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.quiz_rounded),
            onPressed: () => setState(() => _showQuiz = !_showQuiz),
            tooltip: 'Check Eligibility',
          ),
        ],
      ),
      body: _loading ? _buildShimmer() : _buildContent(),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: ZyntraColors.card,
      highlightColor: ZyntraColors.border,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(5, (_) => Container(
          height: 120,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
        )),
      ),
    );
  }

  Widget _buildContent() {
    return RefreshIndicator(
      onRefresh: _fetchData,
      color: ZyntraColors.cyan,
      backgroundColor: ZyntraColors.surface,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          _buildCategoryFilter(),
          const SizedBox(height: 16),
          if (_showQuiz) _buildEligibilityQuiz(),
          if (_showQuiz) const SizedBox(height: 16),
          if (_showApplyForm) _buildApplyForm(),
          if (_showApplyForm) const SizedBox(height: 16),
          ..._filteredSchemes.asMap().entries.map((e) => _buildSchemeCard(e.key, e.value)),
        ]),
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return Container(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal, itemCount: _categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (_, i) => GestureDetector(
          onTap: () => setState(() { _selectedCategory = _categories[i]; _expandedIndex = null; }),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: _selectedCategory == _categories[i] ? ZyntraColors.cyan.withValues(alpha: 0.15) : ZyntraColors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: _selectedCategory == _categories[i] ? ZyntraColors.cyan : ZyntraColors.border),
            ),
            child: Text(_categories[i], style: GoogleFonts.inter(
              fontSize: 13, fontWeight: FontWeight.w500,
              color: _selectedCategory == _categories[i] ? ZyntraColors.cyan : ZyntraColors.white70,
            )),
          ),
        ),
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildEligibilityQuiz() {
    final questions = [
      {'q': 'Is your annual family income below ₹3 lakh?', 'yes': 10, 'no': 0},
      {'q': 'Do you belong to a scheduled caste/tribe?', 'yes': 10, 'no': 0},
      {'q': 'Are you a senior citizen (60+)?', 'yes': 10, 'no': 0},
      {'q': 'Do you have a BPL (Below Poverty Line) card?', 'yes': 10, 'no': 0},
    ];
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.purple.withValues(alpha: 0.3)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(Icons.quiz_rounded, color: ZyntraColors.purple, size: 22),
          const SizedBox(width: 8),
          Text('Check Eligibility', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
        ]),
        const SizedBox(height: 12),
        if (!_quizCompleted) ...questions.asMap().entries.map((e) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(children: [
            Expanded(child: Text(e.value['q'] as String, style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70))),
            const SizedBox(width: 8),
            GestureDetector(onTap: () => setState(() => _quizScore += (e.value['yes'] as int)), child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)), child: Text('Yes', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.green)))),
            const SizedBox(width: 4),
            GestureDetector(onTap: () => setState(() {}), child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: ZyntraColors.red.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)), child: Text('No', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.red)))),
          ]),
        )),
        if (!_quizCompleted)
          SizedBox(
            width: double.infinity, height: 44,
            child: ElevatedButton(
              onPressed: () => setState(() => _quizCompleted = true),
              style: ElevatedButton.styleFrom(backgroundColor: ZyntraColors.purple, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0),
              child: Text('See Results', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
            ),
          ),
        if (_quizCompleted)
          Column(children: [
            Text('Your Eligibility Score: $_quizScore/40', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: _quizScore >= 20 ? ZyntraColors.green : ZyntraColors.amber)),
            Text(_quizScore >= 20 ? 'You may qualify for government schemes!' : 'Consider applying for applicable schemes', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
            const SizedBox(height: 8),
            TextButton(onPressed: () => setState(() { _quizScore = 0; _quizCompleted = false; }), child: Text('Retake Quiz', style: GoogleFonts.inter(color: ZyntraColors.cyan))),
          ]),
      ]),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildSchemeCard(int index, Map<String, dynamic> scheme) {
    final expanded = _expandedIndex == index;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: expanded ? ZyntraColors.cyan.withValues(alpha: 0.3) : ZyntraColors.border),
      ),
      child: Column(children: [
        GestureDetector(
          onTap: () => setState(() => _expandedIndex = expanded ? null : index),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(
                  color: _getCategoryColor(scheme['category'] ?? '').withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(_getCategoryIcon(scheme['category'] ?? ''), color: _getCategoryColor(scheme['category'] ?? ''), size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(scheme['name'] ?? '', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
                const SizedBox(height: 4),
                Text(scheme['description'] ?? '', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70), maxLines: 2, overflow: TextOverflow.ellipsis),
              ])),
              Icon(expanded ? Icons.expand_less : Icons.expand_more, color: ZyntraColors.white70),
            ]),
          ),
        ),
        if (expanded) _buildSchemeDetail(scheme),
      ]),
    ).animate().fadeIn(delay: (index * 60).ms, duration: 300.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildSchemeDetail(Map<String, dynamic> scheme) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Divider(color: ZyntraColors.border),
        const SizedBox(height: 8),
        _detailRow(Icons.people_rounded, 'Eligibility', scheme['eligibility'] ?? 'Check official guidelines'),
        const SizedBox(height: 8),
        _detailRow(Icons.card_giftcard_rounded, 'Benefits', scheme['benefits'] ?? ''),
        const SizedBox(height: 8),
        _detailRow(Icons.monetization_on_rounded, 'Coverage', '₹${scheme['coverageAmount'] ?? '—'}'),
        const SizedBox(height: 8),
        if (scheme['documents'] != null) ...[
          Text('Required Documents', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: ZyntraColors.white70)),
          const SizedBox(height: 4),
          ...(scheme['documents'] as List<dynamic>).map((d) => Padding(
            padding: const EdgeInsets.only(bottom: 4, left: 8),
            child: Row(children: [
              Text('• ', style: GoogleFonts.inter(color: ZyntraColors.cyan)),
              Text(d.toString(), style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
            ]),
          )),
        ],
        if (scheme['applicationStatus'] != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: _getStatusColor(scheme['applicationStatus'] as String).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(children: [
              Icon(Icons.circle, color: _getStatusColor(scheme['applicationStatus'] as String), size: 10),
              const SizedBox(width: 8),
              Text('Status: ${scheme['applicationStatus']}', style: GoogleFonts.inter(fontSize: 13, color: _getStatusColor(scheme['applicationStatus'] as String), fontWeight: FontWeight.w500)),
            ]),
          ),
        ],
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity, height: 46,
          child: ElevatedButton(
            onPressed: () => setState(() => _showApplyForm = true),
            style: ElevatedButton.styleFrom(
              backgroundColor: ZyntraColors.cyan,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            child: Text('Apply Now', style: GoogleFonts.inter(color: ZyntraColors.bg, fontWeight: FontWeight.w700)),
          ),
        ),
      ]),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Icon(icon, color: ZyntraColors.cyan, size: 16),
      const SizedBox(width: 8),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70, fontWeight: FontWeight.w500)),
        Text(value, style: GoogleFonts.inter(fontSize: 13, color: Colors.white)),
      ]),
    ]);
  }

  Widget _buildApplyForm() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.2)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Application Form', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
        const SizedBox(height: 16),
        TextField(
          decoration: _inputDecoration('Full Name'),
          style: GoogleFonts.inter(color: Colors.white),
        ),
        const SizedBox(height: 12),
        TextField(
          decoration: _inputDecoration('Aadhaar Number'),
          style: GoogleFonts.inter(color: Colors.white),
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: 12),
        TextField(
          decoration: _inputDecoration('Phone Number'),
          style: GoogleFonts.inter(color: Colors.white),
          keyboardType: TextInputType.phone,
        ),
        const SizedBox(height: 12),
        TextField(
          decoration: _inputDecoration('Address'),
          style: GoogleFonts.inter(color: Colors.white),
          maxLines: 3,
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity, height: 48,
          child: ElevatedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Application submitted!', style: GoogleFonts.inter()), backgroundColor: ZyntraColors.green));
              setState(() => _showApplyForm = false);
            },
            style: ElevatedButton.styleFrom(backgroundColor: ZyntraColors.green, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), elevation: 0),
            child: Text('Submit Application', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ),
      ]),
    ).animate().fadeIn(duration: 300.ms);
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.5)),
      filled: true,
      fillColor: ZyntraColors.surface,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: ZyntraColors.border)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: ZyntraColors.border)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: ZyntraColors.cyan)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Central': return ZyntraColors.cyan;
      case 'State': return ZyntraColors.green;
      case 'Insurance': return ZyntraColors.amber;
      case 'Preventive': return ZyntraColors.purple;
      default: return ZyntraColors.teal;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'Central': return Icons.account_balance_rounded;
      case 'State': return Icons.map_rounded;
      case 'Insurance': return Icons.verified_rounded;
      case 'Preventive': return Icons.health_and_safety_rounded;
      default: return Icons.medical_services_rounded;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Approved': return ZyntraColors.green;
      case 'Pending': return ZyntraColors.amber;
      case 'Rejected': return ZyntraColors.red;
      default: return ZyntraColors.white70;
    }
  }
}
