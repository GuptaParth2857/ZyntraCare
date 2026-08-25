import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';
import '../../data/models/models.dart';
import '../../providers/lab_provider.dart';

class LabsScreen extends StatefulWidget {
  const LabsScreen({super.key});
  @override State<LabsScreen> createState() => _LabsScreenState();
}

class _LabsScreenState extends State<LabsScreen> {
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<LabProvider>();
      if (p.labs.isEmpty) p.loadLabs();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _call(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) launchUrl(uri);
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
                      Text('Diagnostic Labs', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: ZyntraColors.teal.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: ZyntraColors.teal.withValues(alpha: 0.3)),
                        ),
                        child: const Icon(Icons.science_rounded, color: ZyntraColors.teal, size: 22),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _searchCtrl,
                    style: GoogleFonts.inter(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Search labs or tests...',
                      hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
                      prefixIcon: const Icon(Icons.search_rounded, color: ZyntraColors.teal),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.close_rounded, color: ZyntraColors.white40),
                              onPressed: () {
                                _searchCtrl.clear();
                                context.read<LabProvider>().setSearchQuery('');
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: ZyntraColors.surface,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: ZyntraColors.teal, width: 1.5)),
                    ),
                    onChanged: (v) => context.read<LabProvider>().setSearchQuery(v),
                  ),
                ],
              ),
            ),
            Expanded(child: Consumer<LabProvider>(
              builder: (ctx, provider, _) {
                if (provider.loading && provider.labs.isEmpty) return _buildShimmer();
                if (provider.error != null) return _buildError(provider.error!);
                final list = provider.filteredLabs;
                if (list.isEmpty) return _buildEmpty();
                return RefreshIndicator(
                  color: ZyntraColors.teal,
                  backgroundColor: ZyntraColors.card,
                  onRefresh: provider.loadLabs,
                  child: ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                    itemCount: list.length,
                    itemBuilder: (ctx, i) => _labCard(list[i], i),
                  ),
                );
              },
            )),
          ],
        ),
      ),
    );
  }

  Widget _labCard(Lab lab, int i) {
    final colors = [ZyntraColors.teal, ZyntraColors.cyan, ZyntraColors.purple, ZyntraColors.pink];
    final c = colors[i % colors.length];
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
        boxShadow: [BoxShadow(color: c.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: c.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: Icon(Icons.science_rounded, color: c, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(lab.name, style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text('${lab.address}, ${lab.city}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text('${lab.tests.take(4).join(' \u2022 ')}${lab.tests.length > 4 ? ' \u2022 +${lab.tests.length - 4} more' : ''}',
            style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
          const SizedBox(height: 12),
          Row(
            children: [
              if (lab.homeCollection)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.home_rounded, color: ZyntraColors.green, size: 12),
                    const SizedBox(width: 4),
                    Text('Home Collection', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 11, fontWeight: FontWeight.w500)),
                  ]),
                ),
              const Spacer(),
              Row(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.star_rounded, color: ZyntraColors.amber, size: 16),
                const SizedBox(width: 4),
                Text(lab.rating.toStringAsFixed(1), style: GoogleFonts.inter(color: ZyntraColors.amber, fontWeight: FontWeight.w600, fontSize: 13)),
              ]),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => _showBookTestSheet(lab),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [ZyntraColors.teal.withValues(alpha: 0.9), ZyntraColors.cyan.withValues(alpha: 0.9)]),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [BoxShadow(color: ZyntraColors.teal.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))],
                    ),
                    child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                      const Icon(Icons.calendar_today_rounded, color: Colors.white, size: 16),
                      const SizedBox(width: 6),
                      Text('Book Test', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                    ]),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: () => _call(lab.phone),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [ZyntraColors.green.withValues(alpha: 0.2), ZyntraColors.green.withValues(alpha: 0.05)]),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.3)),
                    ),
                    child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                      const Icon(Icons.call_rounded, color: ZyntraColors.green, size: 16),
                      const SizedBox(width: 6),
                      Text('Call', style: GoogleFonts.inter(color: ZyntraColors.green, fontWeight: FontWeight.w600, fontSize: 13)),
                    ]),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 60).ms).slideY(begin: 0.1, end: 0);
  }

  void _showBookTestSheet(Lab lab) {
    final tests = lab.tests;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.6,
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
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: ZyntraColors.teal.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.science_rounded, color: ZyntraColors.teal, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Book Test at ${lab.name}', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                        Text('Select test to book', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text('Available Tests', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.separated(
                  itemCount: tests.length,
                  separatorBuilder: (_, _) => const Divider(color: ZyntraColors.border),
                  itemBuilder: (_, i) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: ZyntraColors.teal.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.check_circle_outline_rounded, color: ZyntraColors.teal, size: 18),
                    ),
                    title: Text(tests[i], style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w500)),
                    trailing: const Icon(Icons.chevron_right_rounded, color: ZyntraColors.white40),
                    onTap: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text('${tests[i]} booked successfully', style: GoogleFonts.inter(color: Colors.white)),
                        backgroundColor: ZyntraColors.teal,
                        behavior: SnackBarBehavior.floating,
                      ));
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
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
          height: 160,
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20)),
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
              onTap: () => context.read<LabProvider>().loadLabs(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [ZyntraColors.teal, ZyntraColors.cyan]),
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
            decoration: BoxDecoration(color: ZyntraColors.teal.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: const Icon(Icons.science_rounded, color: ZyntraColors.teal, size: 50),
          ),
          const SizedBox(height: 16),
          Text('No labs found', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text('Try adjusting your search', style: GoogleFonts.inter(color: ZyntraColors.white70)),
        ],
      ),
    );
  }
}
