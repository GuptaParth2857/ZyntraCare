import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';
import 'blog_detail_screen.dart';

class BlogListScreen extends StatefulWidget {
  const BlogListScreen({super.key});

  @override
  State<BlogListScreen> createState() => _BlogListScreenState();
}

class _BlogListScreenState extends State<BlogListScreen> {
  final _api = ApiService();
  final _searchController = TextEditingController();
  List<dynamic> _articles = [];
  List<dynamic> _filteredArticles = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchArticles();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchArticles() async {
    setState(() => _isLoading = true);
    final data = await _api.getHealthContent();
    if (!mounted) return;
    setState(() {
      _articles = data is List ? data : (data['data'] ?? []);
      _filteredArticles = List.from(_articles);
      _isLoading = false;
    });
  }

  void _search(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredArticles = List.from(_articles);
      } else {
        _filteredArticles = _articles.where((a) {
          final title = (a['title'] ?? '').toString().toLowerCase();
          final excerpt = (a['excerpt'] ?? a['content'] ?? '').toString().toLowerCase();
          final q = query.toLowerCase();
          return title.contains(q) || excerpt.contains(q);
        }).toList();
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
          'Blog',
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
            _buildSearchBar(),
            const SizedBox(height: 8),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: ZyntraColors.cyan))
                  : _filteredArticles.isEmpty
                      ? Center(
                          child: Text(
                            'No articles found',
                            style: GoogleFonts.inter(color: ZyntraColors.white70),
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _fetchArticles,
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _filteredArticles.length,
                            itemBuilder: (context, i) => _buildArticleCard(
                              _filteredArticles[i],
                            ),
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: TextField(
            controller: _searchController,
            style: GoogleFonts.inter(color: Colors.white),
            onChanged: _search,
            decoration: InputDecoration(
              hintText: 'Search articles...',
              hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 14),
              prefixIcon: const Icon(Icons.search_rounded, color: ZyntraColors.white70),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, color: ZyntraColors.white70),
                      onPressed: () {
                        _searchController.clear();
                        _search('');
                      },
                    )
                  : null,
              filled: true,
              fillColor: ZyntraColors.card.withValues(alpha: 0.6),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ),
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
        formattedDate = DateFormat('MMM dd, yyyy')
            .format(DateTime.parse(date));
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (image.toString().isNotEmpty)
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(16),
                      ),
                      child: Image.network(
                        image.toString(),
                        height: 160,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => Container(
                          height: 80,
                          color: ZyntraColors.surface,
                        ),
                      ),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: ZyntraColors.cyan.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                category.toString(),
                                style: GoogleFonts.inter(
                                  fontSize: 11,
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
                                  fontSize: 11,
                                  color: ZyntraColors.white40,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          title.toString(),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          excerpt.toString(),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: ZyntraColors.white70,
                          ),
                        ),
                      ],
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
