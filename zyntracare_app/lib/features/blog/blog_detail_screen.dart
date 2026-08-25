import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class BlogDetailScreen extends StatefulWidget {
  final Map<String, dynamic> article;

  const BlogDetailScreen({super.key, required this.article});

  @override
  State<BlogDetailScreen> createState() => _BlogDetailScreenState();
}

class _BlogDetailScreenState extends State<BlogDetailScreen> {
  final _api = ApiService();
  List<dynamic> _related = [];

  @override
  void initState() {
    super.initState();
    _fetchRelated();
  }

  Future<void> _fetchRelated() async {
    final data = await _api.getHealthContent();
    if (!mounted || data == null) return;
    final articles = data is List ? data : (data['data'] ?? []) as List;
    final category = widget.article['category'] ?? '';
    setState(() {
      _related = articles
          .where((a) =>
              a['category'] == category && a['title'] != widget.article['title'])
          .take(3)
          .toList();
    });
  }

  void _share() {
    final text = '''
${widget.article['title']}

${widget.article['excerpt'] ?? widget.article['content'] ?? ''}

Shared via ZyntraCare
''';
    Share.share(text);
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.article['title'] ?? 'Untitled';
    final content = widget.article['content'] ?? '';
    final excerpt = widget.article['excerpt'] ?? '';
    final category = widget.article['category'] ?? 'General';
    final author = widget.article['author'] ?? 'ZyntraCare';
    final image = widget.article['image'] ?? widget.article['thumbnail'] ?? '';
    final date = widget.article['date'] ?? widget.article['createdAt'] ?? '';

    String formattedDate = '';
    try {
      if (date is String && date.isNotEmpty) {
        formattedDate =
            DateFormat('MMMM dd, yyyy').format(DateTime.parse(date));
      }
    } catch (_) {}

    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_rounded, color: ZyntraColors.cyan),
            onPressed: _share,
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: ZyntraColors.gradientBg),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (image.toString().isNotEmpty)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(24),
                ),
                child: Image.network(
                  image.toString(),
                  height: 220,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => Container(
                    height: 120,
                    color: ZyntraColors.surface,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: ZyntraColors.cyan.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            category.toString(),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: ZyntraColors.cyan,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      title.toString(),
                      style: GoogleFonts.poppins(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Icon(Icons.person_outline, color: ZyntraColors.white70, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          author.toString(),
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: ZyntraColors.white70,
                          ),
                        ),
                        const SizedBox(width: 16),
                        if (formattedDate.isNotEmpty) ...[
                          Icon(Icons.calendar_today_outlined, color: ZyntraColors.white70, size: 14),
                          const SizedBox(width: 6),
                          Text(
                            formattedDate,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: ZyntraColors.white70,
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (excerpt.toString().isNotEmpty) ...[
                      const SizedBox(height: 20),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          color: ZyntraColors.card.withValues(alpha: 0.5),
                          child: Text(
                            excerpt.toString(),
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: ZyntraColors.white70,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),
                    Text(
                      content.toString(),
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        color: ZyntraColors.white70,
                        height: 1.7,
                      ),
                    ),
                    if (_related.isNotEmpty) ...[
                      const SizedBox(height: 36),
                      Text(
                        'Related Articles',
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 14),
                      ...List.generate(_related.length, (i) {
                        final r = _related[i];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: InkWell(
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => BlogDetailScreen(article: r),
                              ),
                            ),
                            borderRadius: BorderRadius.circular(12),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: BackdropFilter(
                                filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: ZyntraColors.card.withValues(alpha: 0.4),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: ZyntraColors.border.withValues(alpha: 0.15),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              r['title'] ?? '',
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: GoogleFonts.inter(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w500,
                                                color: Colors.white,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              r['category'] ?? '',
                                              style: GoogleFonts.inter(
                                                fontSize: 11,
                                                color: ZyntraColors.cyan,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const Icon(
                                        Icons.chevron_right_rounded,
                                        color: ZyntraColors.white70,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }),
                    ],
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
