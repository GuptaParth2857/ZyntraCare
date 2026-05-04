import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class SearchTab extends StatefulWidget {
  const SearchTab({super.key});
  @override State<SearchTab> createState() => _SearchTabState();
}

class _SearchTabState extends State<SearchTab> {
  final _ctrl = TextEditingController();
  List<dynamic> _results = [];
  bool _loading = false;
  bool _hasSearched = false;

  final _categories = [
    {'icon': Icons.local_hospital_rounded, 'label': 'Hospitals', 'color': ZyntraColors.cyan},
    {'icon': Icons.person_rounded,         'label': 'Doctors',   'color': ZyntraColors.green},
    {'icon': Icons.science_rounded,        'label': 'Labs',      'color': ZyntraColors.teal},
    {'icon': Icons.medication_rounded,     'label': 'Pharmacy',  'color': ZyntraColors.purple},
  ];

  Future<void> _search(String q) async {
    if (q.trim().isEmpty) return;
    setState(() { _loading = true; _hasSearched = true; });
    final r = await apiService.searchAll(q);
    if (mounted) setState(() { _results = r; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // ── Header & Search Bar ───────────────────────────────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Search', style: GoogleFonts.poppins(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            Text('Find the best healthcare facilities', style: GoogleFonts.inter(color: ZyntraColors.white70)),
            const SizedBox(height: 24),
            TextField(
              controller: _ctrl,
              style: GoogleFonts.inter(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search for doctors, hospitals...',
                hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
                prefixIcon: const Icon(Icons.search_rounded, color: ZyntraColors.purple),
                suffixIcon: _ctrl.text.isNotEmpty ? IconButton(
                  icon: const Icon(Icons.close_rounded, color: ZyntraColors.white40),
                  onPressed: () { _ctrl.clear(); setState(() { _results = []; _hasSearched = false; }); },
                ) : null,
                filled: true,
                fillColor: ZyntraColors.surface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: ZyntraColors.purple, width: 1.5)),
              ),
              onSubmitted: _search,
              onChanged: (v) => setState(() {}),
            ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1, end: 0),
          ]),
        ),

        // ── Categories (show if not searched) ─────────────────────────────────
        if (!_hasSearched) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
            child: Text('Categories', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
          ),
          SizedBox(
            height: 100,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              itemBuilder: (_, i) {
                final c = _categories[i];
                final color = c['color'] as Color;
                return Container(
                  width: 90,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    color: ZyntraColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: ZyntraColors.border),
                  ),
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Container(padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: color.withOpacity(0.15), shape: BoxShape.circle),
                      child: Icon(c['icon'] as IconData, color: color, size: 24)),
                    const SizedBox(height: 8),
                    Text(c['label'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500)),
                  ]),
                ).animate().fadeIn(delay: (200 + i * 50).ms).slideX(begin: 0.1, end: 0);
              },
            ),
          ),
          const Spacer(),
          Center(
            child: Icon(Icons.manage_search_rounded, color: ZyntraColors.border.withOpacity(0.5), size: 100),
          ).animate().fadeIn(delay: 500.ms),
          const Spacer(flex: 2),
        ],

        // ── Results ───────────────────────────────────────────────────────────
        if (_hasSearched)
          Expanded(child: _loading
            ? const Center(child: CircularProgressIndicator(color: ZyntraColors.purple))
            : _results.isEmpty
              ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.search_off_rounded, color: ZyntraColors.border, size: 60),
                  const SizedBox(height: 16),
                  Text('No results found for "${_ctrl.text}"', style: GoogleFonts.inter(color: ZyntraColors.white70)),
                ]))
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                  itemCount: _results.length,
                  itemBuilder: (_, i) {
                    final r = _results[i];
                    Color iconColor; IconData icon;
                    switch (r['type']) {
                      case 'hospital': iconColor = ZyntraColors.cyan; icon = Icons.local_hospital_rounded; break;
                      case 'doctor':   iconColor = ZyntraColors.green; icon = Icons.person_rounded; break;
                      case 'pharmacy': iconColor = ZyntraColors.purple; icon = Icons.medication_rounded; break;
                      default:         iconColor = ZyntraColors.teal; icon = Icons.science_rounded; break;
                    }
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: ZyntraColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: ZyntraColors.border),
                      ),
                      child: Row(children: [
                        Container(padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: iconColor.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                          child: Icon(icon, color: iconColor, size: 20)),
                        const SizedBox(width: 14),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(r['name'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text(r['sub'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                        ])),
                        const Icon(Icons.chevron_right_rounded, color: ZyntraColors.white40),
                      ]),
                    ).animate().fadeIn(delay: (i * 50).ms).slideY(begin: 0.1, end: 0);
                  },
                )),
      ]),
    );
  }
}
