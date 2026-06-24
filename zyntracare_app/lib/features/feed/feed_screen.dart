import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});
  @override State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final _api = ApiService();
  bool _loading = true;
  List<Map<String, dynamic>> _posts = [];
  final _postCtrl = TextEditingController();
  bool _submittingPost = false;

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  @override
  void dispose() {
    _postCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchPosts() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/communities/posts');
    if (mounted) {
      setState(() {
        if (res is List) {
          _posts = res.cast<Map<String, dynamic>>();
        } else if (res is Map && res['data'] != null) {
          _posts = (res['data'] as List).cast<Map<String, dynamic>>();
        } else {
          _posts = _mockPosts();
        }
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _mockPosts() {
    return [
      {'username': 'Dr. Ananya Sharma', 'initials': 'AS', 'content': 'Just completed a free health checkup camp in rural Maharashtra. Over 200 patients screened! #CommunityHealth #RuralIndia', 'timestamp': DateTime.now().subtract(const Duration(minutes: 15)).toIso8601String(), 'likes': 42, 'comments': 8, 'shares': 5, 'liked': false},
      {'username': 'Rahul Verma', 'initials': 'RV', 'content': 'Anyone tried the new AI symptom checker on ZyntraCare? It accurately predicted my condition! Highly recommend checking it out.', 'timestamp': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(), 'likes': 28, 'comments': 15, 'shares': 3, 'liked': true},
      {'username': 'Priya HealthWorks', 'initials': 'PH', 'content': 'Organizing a blood donation drive this Saturday at Sector 18, Noida. Please come and donate! Every drop counts.', 'timestamp': DateTime.now().subtract(const Duration(hours: 5)).toIso8601String(), 'likes': 67, 'comments': 23, 'shares': 12, 'liked': false},
      {'username': 'Dr. Suresh Patel', 'initials': 'SP', 'content': 'Monsoon is here! Here are 5 tips to stay healthy: 1) Drink boiled water, 2) Avoid street food, 3) Use mosquito repellent, 4) Wash hands frequently, 5) Get enough sleep.', 'timestamp': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(), 'likes': 103, 'comments': 12, 'shares': 34, 'liked': false},
      {'username': 'Neha Fitness', 'initials': 'NF', 'content': 'Morning yoga at the park! Who else loves starting their day with some stretching and meditation? 🧘‍♀️', 'timestamp': DateTime.now().subtract(const Duration(days: 2)).toIso8601String(), 'likes': 55, 'comments': 9, 'shares': 7, 'liked': true},
    ];
  }

  Future<void> _createPost() async {
    if (_postCtrl.text.trim().isEmpty) return;
    setState(() => _submittingPost = true);
    final res = await _api.post('/api/communities/posts', body: {'content': _postCtrl.text.trim()});
    if (mounted) {
      setState(() => _submittingPost = false);
      if (res is Map && res['success'] == false) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res['error'] ?? 'Failed to post'), backgroundColor: ZyntraColors.red));
      } else {
        final newPost = {
          'username': 'You',
          'initials': 'YO',
          'content': _postCtrl.text.trim(),
          'timestamp': DateTime.now().toIso8601String(),
          'likes': 0, 'comments': 0, 'shares': 0, 'liked': false,
        };
        setState(() => _posts.insert(0, newPost));
        _postCtrl.clear();
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Text('Post created!'), backgroundColor: ZyntraColors.green));
      }
    }
  }

  void _toggleLike(int index) {
    setState(() {
      _posts[index]['liked'] = !(_posts[index]['liked'] as bool);
      _posts[index]['likes'] = (_posts[index]['likes'] as int) + (_posts[index]['liked'] ? 1 : -1);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface,
        elevation: 0,
        title: Text('Community Feed', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: ZyntraColors.cyan.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.3)),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.people_rounded, color: ZyntraColors.cyan, size: 16),
              const SizedBox(width: 4),
              Text('${_posts.length}', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12, fontWeight: FontWeight.w600)),
            ]),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreatePostSheet(),
        backgroundColor: ZyntraColors.cyan,
        child: const Icon(Icons.edit_rounded, color: Colors.black),
      ),
      body: RefreshIndicator(
        color: ZyntraColors.cyan,
        onRefresh: _fetchPosts,
        child: _loading
            ? ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: 4,
                itemBuilder: (_, _) => _shimmerCard(),
              )
            : _posts.isEmpty
                ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.article_outlined, size: 64, color: ZyntraColors.white70.withValues(alpha: 0.4)),
                    const SizedBox(height: 12),
                    Text('No posts yet', style: GoogleFonts.inter(color: ZyntraColors.white70)),
                  ]))
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
                    itemCount: _posts.length,
                    itemBuilder: (_, i) => _buildPostCard(i),
                  ),
      ),
    );
  }

  void _showCreatePostSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: ZyntraColors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text('Create Post', style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                GestureDetector(onTap: () => Navigator.pop(ctx), child: Icon(Icons.close, color: ZyntraColors.white70)),
              ]),
              const SizedBox(height: 16),
              TextField(
                controller: _postCtrl,
                maxLines: 4,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Share your health journey...',
                  hintStyle: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.5)),
                  filled: true,
                  fillColor: ZyntraColors.card,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: _submittingPost ? null : () { _createPost(); Navigator.pop(ctx); },
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Center(
                    child: _submittingPost
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text('Post', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPostCard(int index) {
    final post = _posts[index];
    final ts = post['timestamp']?.toString() ?? '';
    DateTime? dt;
    try { dt = DateTime.parse(ts); } catch (_) {}
    final timeStr = dt != null ? DateFormat('d MMM, h:mm a').format(dt) : '';
    final initials = post['initials']?.toString() ?? (post['username']?.toString().substring(0, 2).toUpperCase() ?? '?');
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: ZyntraColors.cyan.withValues(alpha: 0.15),
                child: Text(initials, style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12, fontWeight: FontWeight.w700)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(post['username']?.toString() ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                    Text(timeStr, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(post['content']?.toString() ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, height: 1.5)),
          const SizedBox(height: 12),
          Container(
            height: 120,
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.3)),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.image_outlined, color: ZyntraColors.white70.withValues(alpha: 0.3), size: 32),
                  const SizedBox(height: 4),
                  Text('Image', style: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.3), fontSize: 11)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _actionButton(Icons.favorite_rounded, post['likes']?.toString() ?? '0', ZyntraColors.red, post['liked'] == true, () => _toggleLike(index)),
              const SizedBox(width: 16),
              _actionButton(Icons.chat_bubble_outline_rounded, post['comments']?.toString() ?? '0', ZyntraColors.white70, false, () {}),
              const SizedBox(width: 16),
              _actionButton(Icons.share_rounded, post['shares']?.toString() ?? '0', ZyntraColors.white70, false, () {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Text('Shared!'), backgroundColor: ZyntraColors.cyan));
              }),
            ],
          ),
        ],
      ),
    );
  }

  Widget _actionButton(IconData icon, String count, Color color, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: active ? color : ZyntraColors.white70, size: 18),
          const SizedBox(width: 4),
          Text(count, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _shimmerCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(width: 40, height: 40, decoration: const BoxDecoration(shape: BoxShape.circle, color: ZyntraColors.surface)),
            const SizedBox(width: 10),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(height: 12, width: 100, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
              const SizedBox(height: 4),
              Container(height: 8, width: 60, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
            ]),
          ]),
          const SizedBox(height: 12),
          Container(height: 10, width: double.infinity, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
          const SizedBox(height: 6),
          Container(height: 10, width: 200, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
          const SizedBox(height: 12),
          Container(height: 120, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12))),
        ],
      ),
    ).animate(onPlay: (ctrl) => ctrl.repeat()).shimmer(duration: 1500.ms, color: ZyntraColors.border.withValues(alpha: 0.3));
  }
}
