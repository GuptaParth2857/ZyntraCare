import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class SymptomCheckerScreen extends StatefulWidget {
  const SymptomCheckerScreen({super.key});
  @override State<SymptomCheckerScreen> createState() => _SymptomCheckerScreenState();
}

class _SymptomCheckerScreenState extends State<SymptomCheckerScreen> {
  final _api = ApiService();
  final _searchCtrl = TextEditingController();
  final _selectedSymptoms = <Map<String, dynamic>>[];
  String? _selectedDuration;
  bool _loading = false;
  List<Map<String, dynamic>>? _results;

  final _commonSymptoms = [
    'Fever', 'Cough', 'Headache', 'Fatigue', 'Nausea', 'Body Pain', 'Sore Throat', 'Dizziness',
  ];

  final _durations = ['1-3 days', '4-7 days', '1-2 weeks', '2+ weeks'];

  final _bodyRegions = [
    {'name': 'Head', 'offset': const Offset(0.5, 0.1)},
    {'name': 'Chest', 'offset': const Offset(0.5, 0.35)},
    {'name': 'Abdomen', 'offset': const Offset(0.5, 0.52)},
    {'name': 'Arms', 'offset': const Offset(0.2, 0.45)},
    {'name': 'Legs', 'offset': const Offset(0.5, 0.78)},
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _toggleSymptom(String symptom) {
    setState(() {
      final idx = _selectedSymptoms.indexWhere((s) => s['name'] == symptom);
      if (idx >= 0) {
        _selectedSymptoms.removeAt(idx);
      } else {
        _selectedSymptoms.add({'name': symptom, 'severity': 'Mild'});
      }
    });
  }

  void _setSeverity(int index, String severity) {
    setState(() => _selectedSymptoms[index]['severity'] = severity);
  }

  Future<void> _checkConditions() async {
    if (_selectedSymptoms.isEmpty) return;
    setState(() => _loading = true);
    final res = await _api.checkSymptoms(_selectedSymptoms.map((s) => s['name'] as String).toList());
    if (mounted) {
      setState(() {
        if (res is String) {
          _results = [
            {'name': 'AI Suggestion', 'match': '—', 'description': res, 'treatments': ['Consult a healthcare provider']}
          ];
        } else if (res is Map && res['conditions'] != null) {
          _results = (res['conditions'] as List<dynamic>).cast<Map<String, dynamic>>();
        } else {
          _results = [
            {'name': 'Consult Doctor', 'match': '100%', 'description': 'Based on your symptoms, please consult a healthcare provider.', 'treatments': ['Medical consultation recommended']}
          ];
        }
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        title: Text('Symptom Checker', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight))),
        iconTheme: const IconThemeData(color: Colors.white),
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
          height: 100,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
        )),
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(children: [
        _buildBodyDiagram(),
        const SizedBox(height: 20),
        _buildSearchBar(),
        const SizedBox(height: 16),
        _buildQuickAddGrid(),
        const SizedBox(height: 20),
        if (_selectedSymptoms.isNotEmpty) _buildSelectedSymptoms(),
        if (_selectedSymptoms.isNotEmpty) const SizedBox(height: 16),
        _buildDurationSelector(),
        const SizedBox(height: 20),
        _buildCheckButton(),
        if (_results != null) ...[
          const SizedBox(height: 20),
          _buildResults(),
        ],
        const SizedBox(height: 16),
        _buildDisclaimer(),
        const SizedBox(height: 32),
      ]),
    );
  }

  Widget _buildBodyDiagram() {
    return Container(
      width: double.infinity,
      height: 200,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Stack(children: [
        Center(
          child: CustomPaint(
            size: const Size(120, 180),
            painter: _BodyPainter(_selectedSymptoms.map((s) => s['name'] as String).toList()),
          ),
        ),
        ..._bodyRegions.map((r) => Positioned(
          left: ((r['offset'] as Offset).dx - 0.05) * MediaQuery.of(context).size.width,
          top: (r['offset'] as Offset).dy * 180 + 16,
          child: GestureDetector(
            onTap: () => _toggleSymptom(r['name'] as String),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _selectedSymptoms.any((s) => s['name'] == r['name'])
                  ? ZyntraColors.cyan.withValues(alpha: 0.2)
                  : ZyntraColors.surface.withValues(alpha: 0.8),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: _selectedSymptoms.any((s) => s['name'] == r['name'])
                    ? ZyntraColors.cyan
                    : ZyntraColors.border,
                ),
              ),
              child: Text(r['name'] as String, style: GoogleFonts.inter(fontSize: 10, color: Colors.white)),
            ),
          ),
        )),
      ]),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildSearchBar() {
    return TextField(
      controller: _searchCtrl,
      style: GoogleFonts.inter(color: Colors.white),
      decoration: InputDecoration(
        hintText: 'Search symptoms...',
        hintStyle: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.5)),
        prefixIcon: Icon(Icons.search, color: ZyntraColors.white70),
        suffixIcon: _searchCtrl.text.isNotEmpty
          ? IconButton(
              icon: Icon(Icons.clear, color: ZyntraColors.white70),
              onPressed: () { _searchCtrl.clear(); setState(() {}); },
            )
          : null,
        filled: true,
        fillColor: ZyntraColors.card,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: ZyntraColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: ZyntraColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: ZyntraColors.cyan)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      onChanged: (_) => setState(() {}),
    );
  }

  Widget _buildQuickAddGrid() {
    final filtered = _commonSymptoms
        .where((s) => s.toLowerCase().contains(_searchCtrl.text.toLowerCase()))
        .toList();
    return Wrap(spacing: 8, runSpacing: 8,
      children: filtered.map((s) => GestureDetector(
        onTap: () => _toggleSymptom(s),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: _selectedSymptoms.any((e) => e['name'] == s)
              ? ZyntraColors.cyan.withValues(alpha: 0.15)
              : ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _selectedSymptoms.any((e) => e['name'] == s)
                ? ZyntraColors.cyan
                : ZyntraColors.border,
            ),
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Text(s, style: GoogleFonts.inter(fontSize: 13, color: _selectedSymptoms.any((e) => e['name'] == s) ? ZyntraColors.cyan : ZyntraColors.white70)),
            if (_selectedSymptoms.any((e) => e['name'] == s)) ...[
              const SizedBox(width: 4),
              Icon(Icons.close, size: 14, color: ZyntraColors.cyan),
            ],
          ]),
        ),
      )).toList(),
    );
  }

  Widget _buildSelectedSymptoms() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Selected Symptoms (${_selectedSymptoms.length})', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
      const SizedBox(height: 8),
      ..._selectedSymptoms.asMap().entries.map((e) => Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
        child: Row(children: [
          Expanded(
            child: Text('${e.key + 1}. ${e.value['name']}', style: GoogleFonts.inter(fontSize: 14, color: Colors.white)),
          ),
          Row(children: ['Mild', 'Moderate', 'Severe'].map((sev) => GestureDetector(
            onTap: () => _setSeverity(e.key, sev),
            child: Container(
              margin: const EdgeInsets.only(left: 4),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: e.value['severity'] == sev
                  ? _severityColor(sev).withValues(alpha: 0.2)
                  : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: e.value['severity'] == sev
                    ? _severityColor(sev)
                    : ZyntraColors.border,
                ),
              ),
              child: Text(sev, style: GoogleFonts.inter(fontSize: 10, color: e.value['severity'] == sev ? _severityColor(sev) : ZyntraColors.white70)),
            ),
          )).toList()),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: () => setState(() => _selectedSymptoms.removeAt(e.key)),
            child: Icon(Icons.close, color: ZyntraColors.red, size: 18),
          ),
        ]),
      )),
    ]).animate().fadeIn(duration: 300.ms);
  }

  Color _severityColor(String sev) {
    switch (sev) {
      case 'Mild': return ZyntraColors.green;
      case 'Moderate': return ZyntraColors.amber;
      case 'Severe': return ZyntraColors.red;
      default: return ZyntraColors.white70;
    }
  }

  Widget _buildDurationSelector() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Duration of Symptoms', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
      const SizedBox(height: 8),
      Row(children: _durations.map((d) => Expanded(
        child: GestureDetector(
          onTap: () => setState(() => _selectedDuration = d),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: _selectedDuration == d ? ZyntraColors.purple.withValues(alpha: 0.15) : ZyntraColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _selectedDuration == d ? ZyntraColors.purple : ZyntraColors.border),
            ),
            child: Text(d, style: GoogleFonts.inter(fontSize: 11, color: _selectedDuration == d ? ZyntraColors.purple : ZyntraColors.white70), textAlign: TextAlign.center),
          ),
        ),
      )).toList()),
    ]).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }

  Widget _buildCheckButton() {
    return SizedBox(
      width: double.infinity, height: 54,
      child: ElevatedButton.icon(
        onPressed: _selectedSymptoms.isEmpty ? null : _checkConditions,
        icon: const Icon(Icons.search_rounded, size: 22),
        label: Text('Check Possible Conditions', style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 15)),
        style: ElevatedButton.styleFrom(
          backgroundColor: ZyntraColors.cyan,
          disabledBackgroundColor: ZyntraColors.border,
          disabledForegroundColor: ZyntraColors.white70,
          foregroundColor: ZyntraColors.bg,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 0,
        ),
      ),
    ).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  Widget _buildResults() {
    if (_results == null || _results!.isEmpty) return const SizedBox();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Icon(Icons.medical_information_rounded, color: ZyntraColors.purple, size: 22),
        const SizedBox(width: 8),
        Text('Possible Conditions', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
      ]),
      const SizedBox(height: 12),
      ..._results!.asMap().entries.map((e) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: ZyntraColors.purple.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('${e.value['match'] ?? '—'} match', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: ZyntraColors.purple)),
            ),
            const SizedBox(width: 8),
            Expanded(child: Text(e.value['name'] ?? '', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white))),
          ]),
          const SizedBox(height: 8),
          Text(e.value['description'] ?? '', style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70)),
          if (e.value['treatments'] != null) ...[
            const SizedBox(height: 8),
            Text('Common treatments:', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: ZyntraColors.cyan)),
            ...(e.value['treatments'] as List<dynamic>).map((t) => Padding(
              padding: const EdgeInsets.only(left: 8, top: 2),
              child: Text('• $t', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
            )),
          ],
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
              child: SizedBox(
                height: 40,
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.video_call_rounded, size: 16),
                  label: Text('Consult Doctor', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ZyntraColors.purple,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: SizedBox(
                height: 40,
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.info_rounded, size: 16),
                  label: Text('Learn More', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: ZyntraColors.border),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ),
          ]),
        ]),
      )),
    ]).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildDisclaimer() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ZyntraColors.amber.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.2)),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(Icons.info_rounded, color: ZyntraColors.amber, size: 18),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            'This is an AI-assisted suggestion tool and does not replace professional medical advice. Always consult a healthcare provider for accurate diagnosis.',
            style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.amber),
          ),
        ),
      ]),
    );
  }
}

class _BodyPainter extends CustomPainter {
  final List<String> selectedSymptoms;
  _BodyPainter(this.selectedSymptoms);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = ZyntraColors.border.withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final fillPaint = Paint()
      ..color = ZyntraColors.cyan.withValues(alpha: 0.08)
      ..style = PaintingStyle.fill;

    final cx = size.width / 2;
    final cy = size.height / 2;
    canvas.drawOval(Rect.fromCircle(center: Offset(cx, cy - 50), radius: 22), paint);
    if (selectedSymptoms.contains('Head')) canvas.drawOval(Rect.fromCircle(center: Offset(cx, cy - 50), radius: 22), fillPaint);

    final bodyPath = Path()
      ..moveTo(cx - 30, cy - 25)
      ..lineTo(cx + 30, cy - 25)
      ..lineTo(cx + 25, cy + 40)
      ..lineTo(cx - 25, cy + 40)
      ..close();
    canvas.drawPath(bodyPath, paint);
    canvas.drawPath(bodyPath, fillPaint);

    final leftArm = Path()
      ..moveTo(cx - 30, cy - 20)
      ..lineTo(cx - 55, cy + 10)
      ..lineTo(cx - 55, cy + 20)
      ..lineTo(cx - 30, cy + 5);
    canvas.drawPath(leftArm, paint);

    final rightArm = Path()
      ..moveTo(cx + 30, cy - 20)
      ..lineTo(cx + 55, cy + 10)
      ..lineTo(cx + 55, cy + 20)
      ..lineTo(cx + 30, cy + 5);
    canvas.drawPath(rightArm, paint);

    final legPath = Path()
      ..moveTo(cx - 20, cy + 40)
      ..lineTo(cx - 18, cy + 80)
      ..lineTo(cx + 18, cy + 80)
      ..lineTo(cx + 20, cy + 40);
    canvas.drawPath(legPath, paint);

    if (selectedSymptoms.contains('Legs')) {
      canvas.drawPath(legPath, fillPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _BodyPainter old) => old.selectedSymptoms != selectedSymptoms;
}
