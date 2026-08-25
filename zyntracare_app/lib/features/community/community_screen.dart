import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});
  @override State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  final _api = ApiService();
  bool _loading = true;
  List<Map<String, dynamic>> _communities = [];
  final _searchCtrl = TextEditingController();
  final Set<String> _joinedIds = {};

  @override
  void initState() {
    super.initState();
    _fetchCommunities();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchCommunities() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/communities');
    if (mounted) {
      setState(() {
        if (res is List) {
          _communities = res.cast<Map<String, dynamic>>();
        } else if (res is Map && res['data'] != null) {
          _communities = (res['data'] as List).cast<Map<String, dynamic>>();
        } else {
          _communities = _mockCommunities();
        }
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _mockCommunities() {
    return [
      {'id': '1', 'name': 'Diabetes Support India', 'category': 'Chronic Disease', 'members': 12540, 'active': true, 'description': 'Support group for diabetes management'},
      {'id': '2', 'name': 'Mental Health Warriors', 'category': 'Mental Health', 'members': 8930, 'active': true, 'description': 'A safe space for mental health discussions'},
      {'id': '3', 'name': 'Fitness Freaks India', 'category': 'Fitness', 'members': 15200, 'active': true, 'description': 'Stay fit, stay healthy!'},
      {'id': '4', 'name': 'Yoga & Meditation', 'category': 'Wellness', 'members': 22100, 'active': true, 'description': 'Find your inner peace'},
      {'id': '5', 'name': 'Moms & Babies Care', 'category': 'Parenting', 'members': 18760, 'active': true, 'description': 'Everything about pregnancy and childcare'},
      {'id': '6', 'name': 'Senior Citizens Health', 'category': 'Elder Care', 'members': 6540, 'active': false, 'description': 'Health tips for senior citizens'},
      {'id': '7', 'name': 'Heart Health Club', 'category': 'Cardiology', 'members': 9870, 'active': true, 'description': 'Heart disease prevention and support'},
    ];
  }

  void _toggleJoin(String id) {
    setState(() {
      if (_joinedIds.contains(id)) {
        _joinedIds.remove(id);
      } else {
        _joinedIds.add(id);
      }
    });
  }

  List<Map<String, dynamic>> get _filtered => _searchCtrl.text.isEmpty
      ? _communities
      : _communities.where((c) =>
          (c['name']?.toString() ?? '').toLowerCase().contains(_searchCtrl.text.toLowerCase()) ||
          (c['category']?.toString() ?? '').toLowerCase().contains(_searchCtrl.text.toLowerCase())).toList();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface,
        elevation: 0,
        title: Text('Health Communities', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _searchCtrl,
              style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search communities...',
                hintStyle: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.5)),
                prefixIcon: Icon(Icons.search_rounded, color: ZyntraColors.cyan, size: 20),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? GestureDetector(onTap: () { _searchCtrl.clear(); setState(() {}); }, child: Icon(Icons.clear, color: ZyntraColors.white70))
                    : null,
                filled: true,
                fillColor: ZyntraColors.card,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.cyan.withValues(alpha: 0.6))),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          Expanded(
            child: _loading
                ? ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: 4,
                    itemBuilder: (_, _) => _shimmerCard(),
                  )
                : _filtered.isEmpty
                    ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Icon(Icons.search_off_rounded, size: 64, color: ZyntraColors.white70.withValues(alpha: 0.4)),
                        const SizedBox(height: 12),
                        Text('No communities found', style: GoogleFonts.inter(color: ZyntraColors.white70)),
                      ]))
                    : RefreshIndicator(
                        color: ZyntraColors.cyan,
                        onRefresh: _fetchCommunities,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filtered.length,
                          itemBuilder: (_, i) => _buildCommunityCard(_filtered[i]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommunityCard(Map<String, dynamic> community) {
    final id = community['id']?.toString() ?? '';
    final isJoined = _joinedIds.contains(id);
    final isActive = community['active'] == true;
    final category = community['category']?.toString() ?? 'General';
    final Color catColor;
    switch (category) {
      case 'Chronic Disease': catColor = ZyntraColors.red; break;
      case 'Mental Health': catColor = ZyntraColors.purple; break;
      case 'Fitness': catColor = ZyntraColors.green; break;
      case 'Wellness': catColor = ZyntraColors.teal; break;
      case 'Parenting': catColor = ZyntraColors.amber; break;
      case 'Elder Care': catColor = ZyntraColors.indigo; break;
      default: catColor = ZyntraColors.cyan; break;
    }
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          Container(
            width: 52, height: 52,
            decoration: BoxDecoration(
              color: catColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: catColor.withValues(alpha: 0.3)),
            ),
            child: Center(
              child: Text(community['name']?.toString().substring(0, 1).toUpperCase() ?? '?',
                  style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: catColor)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(community['name']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
                    ),
                    if (isActive)
                      Container(
                        width: 8, height: 8,
                        decoration: const BoxDecoration(shape: BoxShape.circle, color: ZyntraColors.green),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: catColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                      child: Text(category, style: GoogleFonts.inter(fontSize: 9, color: catColor, fontWeight: FontWeight.w500)),
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.people_rounded, size: 12, color: ZyntraColors.white70),
                    const SizedBox(width: 3),
                    Text(_formatNumber(community['members'] ?? 0), style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(community['description']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70.withValues(alpha: 0.7)),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => _toggleJoin(id),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                gradient: isJoined ? null : const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                color: isJoined ? ZyntraColors.card : null,
                borderRadius: BorderRadius.circular(12),
                border: isJoined ? Border.all(color: ZyntraColors.border) : null,
              ),
              child: Text(
                isJoined ? 'Leave' : 'Join',
                style: GoogleFonts.inter(
                  fontSize: 12, fontWeight: FontWeight.w600,
                  color: isJoined ? ZyntraColors.white70 : Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatNumber(dynamic num) {
    final n = (num is int ? num : int.tryParse(num.toString()) ?? 0);
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}k';
    return n.toString();
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
      child: Row(
        children: [
          Container(width: 52, height: 52, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14))),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(height: 12, width: 140, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
                const SizedBox(height: 6),
                Container(height: 10, width: 100, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
              ],
            ),
          ),
        ],
      ),
    ).animate(onPlay: (ctrl) => ctrl.repeat()).shimmer(duration: 1500.ms, color: ZyntraColors.border.withValues(alpha: 0.3));
  }
}
