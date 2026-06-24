import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class SymptomsScreen extends StatefulWidget {
  const SymptomsScreen({super.key});
  @override State<SymptomsScreen> createState() => _SymptomsScreenState();
}

class _SymptomsScreenState extends State<SymptomsScreen> {
  final _api = ApiService();
  bool _loading = true;
  List<Map<String, dynamic>> _allSymptoms = [];
  List<Map<String, dynamic>> _filteredSymptoms = [];
  String _searchQuery = '';
  String _selectedCategory = 'All';
  String _selectedLetter = '';
  Map<String, dynamic>? _selectedSymptom;

  final _categories = ['All', 'Pain', 'Respiratory', 'Digestive', 'Neurological', 'Skin', 'Cardiovascular'];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/symptoms');
    if (res != null && mounted) {
      setState(() {
        _allSymptoms = (res['data'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
        _filteredSymptoms = _allSymptoms;
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  void _filter() {
    setState(() {
      _filteredSymptoms = _allSymptoms.where((s) {
        final name = (s['name'] ?? '').toString().toLowerCase();
        final cat = (s['category'] ?? '').toString();
        final matchesSearch = name.contains(_searchQuery.toLowerCase());
        final matchesCategory = _selectedCategory == 'All' || cat == _selectedCategory;
        final matchesLetter = _selectedLetter.isEmpty || name.startsWith(_selectedLetter.toLowerCase());
        return matchesSearch && matchesCategory && matchesLetter;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        title: Text('Symptom Encyclopedia', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight))),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _loading
        ? _buildShimmer()
        : _selectedSymptom != null
          ? _buildSymptomDetail()
          : _buildList(),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: ZyntraColors.card,
      highlightColor: ZyntraColors.border,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(8, (_) => Container(
          height: 80,
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
        )),
      ),
    );
  }

  Widget _buildList() {
    return RefreshIndicator(
      onRefresh: _fetchData,
      color: ZyntraColors.cyan,
      backgroundColor: ZyntraColors.surface,
      child: Column(children: [
        _buildSearchBar(),
        _buildCategoryFilter(),
        Expanded(
          child: Row(children: [
            Expanded(child: _buildSymptomList()),
            _buildAlphabetIndex(),
          ]),
        ),
      ]),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: TextField(
        onChanged: (v) { _searchQuery = v; _filter(); },
        style: GoogleFonts.inter(color: Colors.white),
        decoration: InputDecoration(
          hintText: 'Search symptoms A-Z...',
          hintStyle: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.5)),
          prefixIcon: Icon(Icons.search, color: ZyntraColors.white70),
          suffixIcon: _searchQuery.isNotEmpty
            ? IconButton(
                icon: Icon(Icons.clear, color: ZyntraColors.white70),
                onPressed: () { _searchQuery = ''; _filter(); },
              )
            : null,
          filled: true,
          fillColor: ZyntraColors.card,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: ZyntraColors.border)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: ZyntraColors.border)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: ZyntraColors.cyan)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView.separated(
        scrollDirection: Axis.horizontal, itemCount: _categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (_, i) => GestureDetector(
          onTap: () { _selectedCategory = _categories[i]; _filter(); },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
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
    );
  }

  Widget _buildSymptomList() {
    if (_filteredSymptoms.isEmpty) {
      return Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(Icons.search_off_rounded, color: ZyntraColors.white70, size: 48),
          const SizedBox(height: 16),
          Text('No symptoms found', style: GoogleFonts.inter(color: ZyntraColors.white70)),
        ]),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 0, 16),
      itemCount: _filteredSymptoms.length,
      itemBuilder: (_, i) => GestureDetector(
        onTap: () => setState(() => _selectedSymptom = _filteredSymptoms[i]),
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
          ),
          child: Row(children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: _getCategoryColor(_filteredSymptoms[i]['category'] ?? '').withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(_getCategoryIcon(_filteredSymptoms[i]['category'] ?? ''), color: _getCategoryColor(_filteredSymptoms[i]['category'] ?? ''), size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(_filteredSymptoms[i]['name'] ?? '', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
              Text(_filteredSymptoms[i]['briefDescription'] ?? _filteredSymptoms[i]['description'] ?? '', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70), maxLines: 1, overflow: TextOverflow.ellipsis),
            ])),
            Icon(Icons.chevron_right_rounded, color: ZyntraColors.white70, size: 20),
          ]),
        ).animate().fadeIn(delay: (i * 30).ms, duration: 200.ms).slideX(begin: 0.05, end: 0),
      ),
    );
  }

  Widget _buildAlphabetIndex() {
    return Container(
      width: 28,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListView.builder(
        itemCount: 26,
        itemBuilder: (_, i) {
          final letter = String.fromCharCode(65 + i);
          final hasSymptoms = _allSymptoms.any((s) => (s['name'] ?? '').toString().startsWith(letter));
          return GestureDetector(
            onTap: hasSymptoms ? () { _selectedLetter = letter; _filter(); } : null,
            child: Container(
              height: 18,
              alignment: Alignment.center,
              child: Text(
                letter,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: _selectedLetter == letter ? FontWeight.w800 : FontWeight.w500,
                  color: hasSymptoms
                    ? _selectedLetter == letter ? ZyntraColors.cyan : ZyntraColors.white70
                    : ZyntraColors.white70.withValues(alpha: 0.2),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSymptomDetail() {
    final s = _selectedSymptom!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        GestureDetector(
          onTap: () => setState(() => _selectedSymptom = null),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.arrow_back_rounded, color: ZyntraColors.cyan, size: 18),
              const SizedBox(width: 6),
              Text('Back to list', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 13)),
            ]),
          ),
        ),
        const SizedBox(height: 20),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: _getCategoryColor(s['category'] ?? '').withValues(alpha: 0.3)),
          ),
          child: Column(children: [
            Container(
              width: 64, height: 64,
              decoration: BoxDecoration(
                color: _getCategoryColor(s['category'] ?? '').withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(_getCategoryIcon(s['category'] ?? ''), color: _getCategoryColor(s['category'] ?? ''), size: 32),
            ),
            const SizedBox(height: 16),
            Text(s['name'] ?? '', style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
            Container(
              margin: const EdgeInsets.only(top: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: _getCategoryColor(s['category'] ?? '').withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(s['category'] ?? '', style: GoogleFonts.inter(fontSize: 12, color: _getCategoryColor(s['category'] ?? ''), fontWeight: FontWeight.w500)),
            ),
          ]),
        ),
        const SizedBox(height: 20),
        _buildDetailSection('Full Description', Icons.description_rounded, s['description'] ?? 'No description available'),
        const SizedBox(height: 16),
        _buildDetailSection('Common Causes', Icons.search_rounded, s['commonCauses'] ?? s['causes'] ?? 'Varies by individual'),
        const SizedBox(height: 16),
        _buildDetailSection('When to See a Doctor', Icons.warning_rounded, s['whenToSeeDoctor'] ?? s['doctorAdvice'] ?? 'Consult a doctor if symptoms persist or worsen'),
        const SizedBox(height: 16),
        _buildDetailSection('Home Remedies', Icons.home_rounded, s['homeRemedies'] ?? s['remedies'] ?? 'Rest, hydration, and over-the-counter medication as needed'),
        const SizedBox(height: 16),
        if (s['relatedSymptoms'] != null) _buildListSection('Related Symptoms', Icons.link_rounded, s['relatedSymptoms'] as List<dynamic>),
        if (s['relatedSymptoms'] != null) const SizedBox(height: 16),
        if (s['relatedConditions'] != null) _buildListSection('Related Conditions', Icons.medical_services_rounded, s['relatedConditions'] as List<dynamic>),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity, height: 50,
          child: ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.video_call_rounded),
            label: Text('Consult a Doctor', style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 15)),
            style: ElevatedButton.styleFrom(
              backgroundColor: ZyntraColors.cyan,
              foregroundColor: ZyntraColors.bg,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
          ),
        ),
        const SizedBox(height: 32),
      ]),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildDetailSection(String title, IconData icon, String content) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon, color: ZyntraColors.cyan, size: 18),
          const SizedBox(width: 8),
          Text(title, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
        ]),
        const SizedBox(height: 8),
        Text(content, style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70, height: 1.5)),
      ]),
    );
  }

  Widget _buildListSection(String title, IconData icon, List<dynamic> items) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon, color: ZyntraColors.cyan, size: 18),
          const SizedBox(width: 8),
          Text(title, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
        ]),
        const SizedBox(height: 8),
        ...items.map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 4),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('• ', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontWeight: FontWeight.w700)),
            Expanded(child: Text(item.toString(), style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70, height: 1.4))),
          ]),
        )),
      ]),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Pain': return ZyntraColors.red;
      case 'Respiratory': return ZyntraColors.cyan;
      case 'Digestive': return ZyntraColors.amber;
      case 'Neurological': return ZyntraColors.purple;
      case 'Skin': return ZyntraColors.pink;
      case 'Cardiovascular': return ZyntraColors.teal;
      default: return ZyntraColors.green;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'Pain': return Icons.healing_rounded;
      case 'Respiratory': return Icons.air_rounded;
      case 'Digestive': return Icons.restaurant_rounded;
      case 'Neurological': return Icons.psychology_rounded;
      case 'Skin': return Icons.face_rounded;
      case 'Cardiovascular': return Icons.favorite_rounded;
      default: return Icons.medical_services_rounded;
    }
  }
}
