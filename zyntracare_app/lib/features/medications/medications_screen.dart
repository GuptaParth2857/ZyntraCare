import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class MedicationsScreen extends StatefulWidget {
  const MedicationsScreen({super.key});
  @override State<MedicationsScreen> createState() => _MedicationsScreenState();
}

class _MedicationsScreenState extends State<MedicationsScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _medications = [];
  Map<String, dynamic>? _drugInteraction;

  final _statusColors = <String, Color>{
    'Active': ZyntraColors.green,
    'Completed': ZyntraColors.cyan,
    'Upcoming': ZyntraColors.amber,
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().get('/api/medications');
      if (mounted && res != null) {
        final data = res is Map ? res : {'data': res is List ? res : []};
        final meds = (data['medications'] ?? data['data'] ?? []) as List;
        setState(() {
          _medications = meds.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList();
          _drugInteraction = data['interactions'] is Map ? Map<String, dynamic>.from(data['interactions']) : null;
        });
      }
    } catch (_) {}
    if (_medications.isEmpty && mounted) setState(() => _medications = _placeholderMeds());
    if (mounted) setState(() => _loading = false);
  }

  List<Map<String, dynamic>> _placeholderMeds() => [
    {'name': 'Amlodipine 5mg', 'dosage': '5mg', 'frequency': 'Once daily', 'time': '08:00 AM', 'duration': '30 days', 'status': 'Active', 'notes': 'Take with breakfast', 'refillDate': '2026-07-15', 'prescriber': 'Dr. Sharma'},
    {'name': 'Metformin 500mg', 'dosage': '500mg', 'frequency': 'Twice daily', 'time': '08:00 AM, 08:00 PM', 'duration': '90 days', 'status': 'Active', 'notes': 'Take after meals', 'refillDate': '2026-08-01', 'prescriber': 'Dr. Patel'},
    {'name': 'Asthalin Inhaler', 'dosage': '100mcg', 'frequency': 'As needed', 'time': 'As required', 'duration': '30 days', 'status': 'Active', 'notes': 'Use for wheezing', 'refillDate': '2026-07-10', 'prescriber': 'Dr. Verma'},
    {'name': 'Vitamin D3 60K', 'dosage': '60K IU', 'frequency': 'Weekly', 'time': 'Sunday 10:00 AM', 'duration': '8 weeks', 'status': 'Upcoming', 'notes': 'Take with fatty food', 'refillDate': '2026-08-20', 'prescriber': 'Dr. Gupta'},
    {'name': 'Amoxicillin 250mg', 'dosage': '250mg', 'frequency': 'Three times daily', 'time': '07:00 AM, 02:00 PM, 09:00 PM', 'duration': '7 days', 'status': 'Completed', 'notes': 'Complete full course', 'refillDate': null, 'prescriber': 'Dr. Singh'},
  ];

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
                      Text('Medications', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      GestureDetector(
                        onTap: _showAddSheet,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.add_rounded, color: Colors.white, size: 22),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('${_medications.length} medications tracked', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildTodaySchedule(),
                          const SizedBox(height: 24),
                          _sectionHeader('All Medications', Icons.medication_rounded),
                          const SizedBox(height: 12),
                          ...List.generate(_medications.length, (i) => _buildMedCard(i)),
                          if (_drugInteraction != null) ...[
                            const SizedBox(height: 24),
                            _buildInteractions(),
                          ],
                          _buildRefillReminders(),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: ZyntraColors.cyan, size: 16),
        ),
        const SizedBox(width: 8),
        Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildTodaySchedule() {
    final todayMeds = _medications.where((m) => m['status'] == 'Active').toList();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.cyan.withValues(alpha: 0.1), ZyntraColors.purple.withValues(alpha: 0.05)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.today_rounded, color: ZyntraColors.cyan, size: 20),
              const SizedBox(width: 8),
              Text('Today\'s Schedule', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text('${todayMeds.length} medications', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
            ],
          ),
          const SizedBox(height: 12),
          ...todayMeds.map((m) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: ZyntraColors.surface.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    color: ZyntraColors.green.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.medication_rounded, color: ZyntraColors.green, size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(m['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                      Text('${m['dosage']} - ${m['time']}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                  child: Text(('${m['frequency']}').split(' ').first, style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 9, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          )),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildMedCard(int i) {
    final m = _medications[i];
    final status = m['status'] as String? ?? 'Active';
    final color = _statusColors[status] ?? ZyntraColors.cyan;
    return GestureDetector(
      onTap: () => _showDetailSheet(i),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: ZyntraColors.border),
          boxShadow: [BoxShadow(color: color.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Row(
          children: [
            Container(
              width: 4, height: 48,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(Icons.medication_rounded, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(m['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text('${m['dosage']} • ${m['frequency']}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  Text(m['time'] as String, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                  child: Text(status, style: GoogleFonts.inter(color: color, fontSize: 9, fontWeight: FontWeight.w600)),
                ),
                if (m['refillDate'] != null) ...[
                  const SizedBox(height: 4),
                  Text('Refill: ${m['refillDate']}', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 8)),
                ],
              ],
            ),
          ],
        ),
      ).animate().fadeIn(delay: (i * 60).ms).slideX(begin: 0.02, end: 0),
    );
  }

  void _showDetailSheet(int i) {
    final m = _medications[i];
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.55,
        decoration: const BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)))),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(14)),
                    child: const Icon(Icons.medication_rounded, color: ZyntraColors.cyan, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(m['name'] as String, style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
                        Text('${m['dosage']} • ${m['frequency']}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              _detailField('Time', m['time'] as String, Icons.schedule_rounded),
              _detailField('Duration', m['duration'] as String, Icons.date_range_rounded),
              _detailField('Prescriber', m['prescriber'] as String, Icons.person_rounded),
              if (m['refillDate'] != null) _detailField('Refill Date', m['refillDate'] as String, Icons.refresh_rounded),
              if (m['notes'] != null && (m['notes'] as String).isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.notes_rounded, color: ZyntraColors.amber, size: 16),
                      const SizedBox(width: 8),
                      Expanded(child: Text(m['notes'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12))),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailField(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, color: ZyntraColors.cyan, size: 16),
          const SizedBox(width: 8),
          Text('$label: ', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
          Expanded(child: Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }

  void _showAddSheet() {
    final nameCtrl = TextEditingController();
    final dosageCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    String frequency = 'Once daily';
    final times = ['08:00 AM'];
    String duration = '30 days';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
          height: MediaQuery.of(ctx).size.height * 0.7,
          decoration: const BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Padding(
            padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)))),
                const SizedBox(height: 16),
                Text('Add Medication', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                Expanded(
                  child: ListView(
                    children: [
                      _addField(nameCtrl, 'Medication Name'),
                      const SizedBox(height: 10),
                      _addField(dosageCtrl, 'Dosage (e.g. 500mg)'),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: frequency,
                            dropdownColor: ZyntraColors.card,
                            isExpanded: true,
                            style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                            items: ['Once daily', 'Twice daily', 'Three times daily', 'Weekly', 'As needed'].map((f) => DropdownMenuItem(value: f, child: Text(f))).toList(),
                            onChanged: (v) => setSheetState(() => frequency = v!),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      _addField(TextEditingController(text: times.first), 'Time (e.g. 08:00 AM)'),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: duration,
                            dropdownColor: ZyntraColors.card,
                            isExpanded: true,
                            style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                            items: ['7 days', '14 days', '30 days', '60 days', '90 days'].map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                            onChanged: (v) => setSheetState(() => duration = v!),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      _addField(notesCtrl, 'Notes (optional)'),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _medications.insert(0, {
                        'name': nameCtrl.text,
                        'dosage': dosageCtrl.text,
                        'frequency': frequency,
                        'time': times.first,
                        'duration': duration,
                        'status': 'Active',
                        'notes': notesCtrl.text,
                        'refillDate': 'N/A',
                        'prescriber': 'Self',
                      });
                    });
                    Navigator.pop(ctx);
                  },
                  child: Container(
                    width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]), borderRadius: BorderRadius.circular(16)),
                    child: Center(child: Text('Add Medication', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16))),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _addField(TextEditingController ctrl, String label) {
    return TextField(
      controller: ctrl,
      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
        filled: true,
        fillColor: ZyntraColors.surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildInteractions() {
    if (_drugInteraction == null) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.red.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.warning_rounded, color: ZyntraColors.red, size: 20),
              const SizedBox(width: 8),
              Text('Drug Interaction Warnings', style: GoogleFonts.poppins(color: ZyntraColors.red, fontSize: 14, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          ...(_drugInteraction!['warnings'] as List? ?? ['No known interactions']).map((w) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.fiber_manual_record_rounded, color: ZyntraColors.red, size: 6),
                const SizedBox(width: 8),
                Expanded(child: Text(w.toString(), style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11))),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildRefillReminders() {
    final needsRefill = _medications.where((m) => m['refillDate'] != null && m['status'] == 'Active').toList();
    if (needsRefill.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionHeader('Refill Reminders', Icons.refresh_rounded),
          const SizedBox(height: 12),
          ...needsRefill.map((m) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.2))),
            child: Row(
              children: [
                const Icon(Icons.refresh_rounded, color: ZyntraColors.amber, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(m['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                      Text('Refill by ${m['refillDate']}', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 11)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                  child: Text('Order Refill', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 9, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Column(
          children: List.generate(5, (_) => Container(
            height: 70,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
          )),
        ),
      ),
    );
  }
}
