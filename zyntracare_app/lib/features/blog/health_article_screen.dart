import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';
import 'blog_detail_screen.dart';

class HealthArticleScreen extends StatefulWidget {
  const HealthArticleScreen({super.key});

  @override
  State<HealthArticleScreen> createState() => _HealthArticleScreenState();
}

class _HealthArticleScreenState extends State<HealthArticleScreen> {
  final _api = ApiService();
  List<dynamic> _articles = [];
  List<dynamic> _filtered = [];
  bool _isLoading = true;
  String _selectedCategory = 'All';
  late List<String> _categories;

  @override
  void initState() {
    super.initState();
    _categories = ['All'];
    _fetchArticles();
  }

  Future<void> _fetchArticles() async {
    setState(() => _isLoading = true);
    final data = await _api.getHealthContent();
    if (!mounted) return;
    final articles = data is List ? data : (data['data'] ?? []) as List;
    final cats = <String>{'All'};
    for (final a in articles) {
      final c = a['category']?.toString();
      if (c != null && c.isNotEmpty) cats.add(c);
    }
    setState(() {
      _articles = articles;
      _categories = cats.toList();
      _applyFilter();
      _isLoading = false;
    });
  }

  void _applyFilter() {
    setState(() {
      if (_selectedCategory == 'All') {
        _filtered = List.from(_articles);
      } else {
        _filtered = _articles
            .where((a) => a['category']?.toString() == _selectedCategory)
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Health Articles',
          style: GoogleFonts.poppins(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: ZyntraColors.gradientBg),
        child: Column(
          children: [
            _buildCategoryChips(),
            const SizedBox(height: 8),
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: ZyntraColors.cyan),
                    )
                  : _filtered.isEmpty
                      ? Center(
                          child: Text(
                            'No articles in this category',
                            style: GoogleFonts.inter(color: ZyntraColors.white70),
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _fetchArticles,
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _filtered.length,
                            itemBuilder: (context, i) =>
                                _buildArticleCard(_filtered[i]),
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChips() {
    return SizedBox(
      height: 44,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        itemCount: _categories.length,
        itemBuilder: (context, i) {
          final cat = _categories[i];
          final isSelected = cat == _selectedCategory;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(
                cat,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: isSelected ? Colors.black : ZyntraColors.white70,
                ),
              ),
              selected: isSelected,
              onSelected: (_) {
                setState(() => _selectedCategory = cat);
                _applyFilter();
              },
              backgroundColor: ZyntraColors.card.withValues(alpha: 0.5),
              selectedColor: ZyntraColors.cyan,
              side: BorderSide.none,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 8),
            ),
          );
        },
      ),
    );
  }

  Widget _buildArticleCard(Map<String, dynamic> article) {
    final title = article['title'] ?? 'Untitled';
    final excerpt = article['excerpt'] ?? article['content'] ?? '';
    final category = article['category'] ?? 'General';
    final date = article['date'] ?? article['createdAt'] ?? '';
    final image = article['image'] ?? article['thumbnail'] ?? '';

    String formattedDate = '';
    try {
      if (date is String && date.isNotEmpty) {
        formattedDate =
            DateFormat('MMM dd, yyyy').format(DateTime.parse(date));
      }
    } catch (_) {}

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: InkWell(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => BlogDetailScreen(article: article),
          ),
        ),
        borderRadius: BorderRadius.circular(16),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
            child: Container(
              decoration: BoxDecoration(
                color: ZyntraColors.card.withValues(alpha: 0.55),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: ZyntraColors.border.withValues(alpha: 0.2),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (image.toString().isNotEmpty)
                    ClipRRect(
                      borderRadius: const BorderRadius.horizontal(
                        left: Radius.circular(16),
                      ),
                      child: Image.network(
                        image.toString(),
                        width: 100,
                        height: 110,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => Container(
                          width: 100,
                          height: 110,
                          color: ZyntraColors.surface,
                          child: const Icon(
                            Icons.article_outlined,
                            color: ZyntraColors.white40,
                          ),
                        ),
                      ),
                    ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color:
                                      ZyntraColors.cyan.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(5),
                                ),
                                child: Text(
                                  category.toString(),
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: ZyntraColors.cyan,
                                  ),
                                ),
                              ),
                              const Spacer(),
                              if (formattedDate.isNotEmpty)
                                Text(
                                  formattedDate,
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    color: ZyntraColors.white40,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            title.toString(),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            excerpt.toString(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: ZyntraColors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
