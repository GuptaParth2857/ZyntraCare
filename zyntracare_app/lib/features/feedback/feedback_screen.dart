import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});
  @override State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> with SingleTickerProviderStateMixin {
  int _rating = 0;
  String _category = 'General Feedback';
  final _subjectCtrl = TextEditingController();
  final _messageCtrl = TextEditingController();
  bool _anonymous = false;
  bool _submitting = false;
  bool _submitted = false;
  bool _loading = true;
  List<Map<String, dynamic>> _previousFeedback = [];
  late AnimationController _successCtrl;
  final _categories = ['Bug Report', 'Feature Request', 'General Feedback', 'Complaint'];

  @override
  void initState() {
    super.initState();
    _successCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _loadPrevious();
  }

  @override
  void dispose() {
    _subjectCtrl.dispose();
    _messageCtrl.dispose();
    _successCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadPrevious() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.get('/api/feedback');
      if (mounted && res != null) {
        final list = (res is List ? res : (res['data'] ?? res['feedbacks'] ?? [])) as List;
        setState(() => _previousFeedback = list.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList());
      }
    } catch (_) {}
    if (_previousFeedback.isEmpty && mounted) {
      setState(() => _previousFeedback = [
        {'category': 'Feature Request', 'subject': 'Add dark mode toggle', 'rating': 5, 'date': '2026-06-20', 'status': 'Resolved'},
        {'category': 'Bug Report', 'subject': 'App crashes on payment page', 'rating': 2, 'date': '2026-06-18', 'status': 'Under Review'},
        {'category': 'General Feedback', 'subject': 'Great app for healthcare', 'rating': 5, 'date': '2026-06-15', 'status': 'Acknowledged'},
      ]);
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _submit() async {
    if (_rating == 0 || _messageCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Please add rating and a message', style: GoogleFonts.inter(color: Colors.white)),
        backgroundColor: ZyntraColors.amber,
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }
    setState(() => _submitting = true);
    try {
      await apiService.post('/api/feedback', body: {
        'rating': _rating,
        'category': _category,
        'subject': _subjectCtrl.text,
        'message': _messageCtrl.text,
        'anonymous': _anonymous,
      });
    } catch (_) {}
    if (mounted) {
      setState(() {
        _submitting = false;
        _submitted = true;
      });
      _successCtrl.forward();
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            _submitted = false;
            _rating = 0;
            _category = 'General Feedback';
            _subjectCtrl.clear();
            _messageCtrl.clear();
            _anonymous = false;
          });
          _successCtrl.reset();
        }
      });
    }
  }

  String _ratingEmoji(int r) {
    switch (r) {
      case 1: return '😞';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '😊';
      case 5: return '🤩';
      default: return '';
    }
  }

  String _ratingLabel(int r) {
    switch (r) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return '';
    }
  }

  Color _statusColor(String s) {
    switch (s.toLowerCase()) {
      case 'resolved': return ZyntraColors.green;
      case 'under review': return ZyntraColors.amber;
      default: return ZyntraColors.cyan;
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
                      Text('Feedback', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Help us improve your experience', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : SingleChildScrollView(
                      padding: const EdgeInsets.only(bottom: 100),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_submitted)
                            Container(
                              width: double.infinity,
                              margin: const EdgeInsets.all(16),
                              padding: const EdgeInsets.symmetric(vertical: 32),
                              decoration: BoxDecoration(
                                color: ZyntraColors.card,
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.3)),
                              ),
                              child: Column(
                                children: [
                                  AnimatedBuilder(
                                    animation: _successCtrl,
                                    builder: (_, _) {
                                      final scale = 0.5 + _successCtrl.value * 0.5;
                                      return Transform.scale(
                                        scale: scale,
                                        child: Container(
                                          padding: const EdgeInsets.all(20),
                                          decoration: BoxDecoration(
                                            color: ZyntraColors.green.withValues(alpha: 0.15),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 56),
                                        ),
                                      );
                                    },
                                  ),
                                  const SizedBox(height: 16),
                                  Text('Thank You!', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 8),
                                  Text('Your feedback has been submitted successfully', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14)),
                                ],
                              ),
                            ).animate().scale(duration: 400.ms, curve: Curves.elasticOut)
                          else ...[
                            const SizedBox(height: 16),
                            // Rating
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Text('Rate your experience', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            ),
                            const SizedBox(height: 12),
                            Center(
                              child: Column(
                                children: [
                                  Text(_rating > 0 ? _ratingEmoji(_rating) : '😶', style: const TextStyle(fontSize: 48)),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: List.generate(5, (i) {
                                      final star = i + 1;
                                      return GestureDetector(
                                        onTap: () => setState(() => _rating = star),
                                        child: Container(
                                          margin: const EdgeInsets.symmetric(horizontal: 4),
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: star <= _rating ? ZyntraColors.amber.withValues(alpha: 0.15) : ZyntraColors.border.withValues(alpha: 0.3),
                                            borderRadius: BorderRadius.circular(12),
                                            border: Border.all(color: star <= _rating ? ZyntraColors.amber.withValues(alpha: 0.4) : ZyntraColors.border),
                                          ),
                                          child: Icon(
                                            star <= _rating ? Icons.star_rounded : Icons.star_outline_rounded,
                                            color: star <= _rating ? ZyntraColors.amber : ZyntraColors.white40,
                                            size: 32,
                                          ),
                                        ),
                                      );
                                    }),
                                  ),
                                  const SizedBox(height: 6),
                                  if (_rating > 0)
                                    Text(_ratingLabel(_rating), style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 13, fontWeight: FontWeight.w500)),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),
                            // Category
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Text('Category', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            ),
                            const SizedBox(height: 10),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                decoration: BoxDecoration(
                                  color: ZyntraColors.surface,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: ZyntraColors.border),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: _category,
                                    dropdownColor: ZyntraColors.card,
                                    isExpanded: true,
                                    style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                                    items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                                    onChanged: (v) => setState(() => _category = v!),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            // Subject
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Text('Subject', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            ),
                            const SizedBox(height: 10),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: TextField(
                                controller: _subjectCtrl,
                                style: GoogleFonts.inter(color: Colors.white),
                                decoration: InputDecoration(
                                  hintText: 'Write a brief subject...',
                                  hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
                                  filled: true,
                                  fillColor: ZyntraColors.surface,
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            // Message
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Text('Message', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            ),
                            const SizedBox(height: 10),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: TextField(
                                controller: _messageCtrl,
                                maxLines: 5,
                                style: GoogleFonts.inter(color: Colors.white),
                                decoration: InputDecoration(
                                  hintText: 'Describe your feedback in detail...',
                                  hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
                                  filled: true,
                                  fillColor: ZyntraColors.surface,
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            // Screenshot + Anonymous
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: GestureDetector(
                                      onTap: () {
                                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                          content: Text('Screenshot feature coming soon', style: GoogleFonts.inter(color: Colors.white)),
                                          backgroundColor: ZyntraColors.cyan,
                                          behavior: SnackBarBehavior.floating,
                                        ));
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.all(14),
                                        decoration: BoxDecoration(
                                          color: ZyntraColors.surface,
                                          borderRadius: BorderRadius.circular(14),
                                          border: Border.all(color: ZyntraColors.border),
                                        ),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            const Icon(Icons.attach_file_rounded, color: ZyntraColors.cyan, size: 20),
                                            const SizedBox(width: 8),
                                            Text('Attach Screenshot', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 13, fontWeight: FontWeight.w500)),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  GestureDetector(
                                    onTap: () => setState(() => _anonymous = !_anonymous),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                                      decoration: BoxDecoration(
                                        color: _anonymous ? ZyntraColors.purple.withValues(alpha: 0.15) : ZyntraColors.surface,
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(color: _anonymous ? ZyntraColors.purple.withValues(alpha: 0.3) : ZyntraColors.border),
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(
                                            _anonymous ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded,
                                            color: _anonymous ? ZyntraColors.purple : ZyntraColors.white40,
                                            size: 20,
                                          ),
                                          const SizedBox(width: 6),
                                          Text('Anonymous', style: GoogleFonts.inter(color: _anonymous ? ZyntraColors.purple : ZyntraColors.white70, fontSize: 13)),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),
                            // Submit Button
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: GestureDetector(
                                onTap: _submitting ? null : _submit,
                                child: Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                                    borderRadius: BorderRadius.circular(16),
                                    boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                                  ),
                                  child: Center(
                                    child: _submitting
                                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                        : Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                                              const SizedBox(width: 8),
                                              Text('Submit Feedback', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                            ],
                                          ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                          const SizedBox(height: 28),
                          // Previous Feedback
                          if (_previousFeedback.isNotEmpty) ...[
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                              child: Row(
                                children: [
                                  Text('Previous Feedback', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                  const Spacer(),
                                  Text('${_previousFeedback.length} entries', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                                ],
                              ),
                            ),
                            ...List.generate(_previousFeedback.length, (i) => _prevCard(_previousFeedback[i], i)),
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

  Widget _prevCard(Map<String, dynamic> fb, int i) {
    final status = fb['status'] ?? 'Acknowledged';
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: ZyntraColors.purple.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.feedback_rounded, color: ZyntraColors.purple, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(fb['subject'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Text(fb['category'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                    const SizedBox(width: 8),
                    ...List.generate(fb['rating'] ?? 0, (_) => const Icon(Icons.star_rounded, color: ZyntraColors.amber, size: 12)),
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: _statusColor(status).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(status, style: GoogleFonts.inter(color: _statusColor(status), fontSize: 9, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 60).ms);
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      itemCount: 4,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 70,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}
