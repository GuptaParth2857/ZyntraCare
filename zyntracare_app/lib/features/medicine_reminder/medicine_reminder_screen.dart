import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class MedicineReminderScreen extends StatefulWidget {
  const MedicineReminderScreen({super.key});
  @override State<MedicineReminderScreen> createState() => _MedicineReminderScreenState();
}

class _MedicineReminderScreenState extends State<MedicineReminderScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _reminders = [];
  final Set<int> _taken = {};
  int? _snoozeIndex;
  String _alarmSound = 'Default';
  final Map<int, DateTime> _takenTimestamps = {};

  final _alarmSounds = ['Default', 'Gentle Bell', 'Morning Melody', 'Urgent Alarm', 'Vibration Only'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().get('/api/medicine-reminders');
      if (mounted && res != null) {
        final data = res is Map ? res : {'data': res is List ? res : []};
        final list = (data['reminders'] ?? data['data'] ?? []) as List;
        setState(() {
          _reminders = list.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList();
        });
      }
    } catch (_) {}
    if (_reminders.isEmpty && mounted) setState(() => _reminders = _placeholderReminders());
    if (mounted) setState(() => _loading = false);
  }

  List<Map<String, dynamic>> _placeholderReminders() => [
    {'name': 'Amlodipine 5mg', 'dosage': '5mg', 'time': '08:00', 'period': 'Morning', 'frequency': 'Daily', 'repeatDays': 'All days', 'refillDate': '2026-07-15', 'notes': 'Take with breakfast'},
    {'name': 'Metformin 500mg', 'dosage': '500mg', 'time': '08:00', 'period': 'Morning', 'frequency': 'Daily', 'repeatDays': 'All days', 'refillDate': '2026-08-01', 'notes': 'After breakfast'},
    {'name': 'Metformin 500mg', 'dosage': '500mg', 'time': '20:00', 'period': 'Evening', 'frequency': 'Daily', 'repeatDays': 'All days', 'refillDate': '2026-08-01', 'notes': 'After dinner'},
    {'name': 'Vitamin D3', 'dosage': '60K IU', 'time': '10:00', 'period': 'Morning', 'frequency': 'Weekly', 'repeatDays': 'Sunday', 'refillDate': '2026-08-20', 'notes': 'With fatty food'},
    {'name': 'Asthalin Inhaler', 'dosage': '100mcg', 'time': 'As needed', 'period': 'PRN', 'frequency': 'As needed', 'repeatDays': 'As required', 'refillDate': '2026-07-10', 'notes': 'Use for wheezing'},
  ];

  List<Map<String, dynamic>> get _sortedReminders {
    final sorted = List<Map<String, dynamic>>.from(_reminders);
    sorted.sort((a, b) {
      final tA = _timeToMinutes(a['time'] as String? ?? '00:00');
      final tB = _timeToMinutes(b['time'] as String? ?? '00:00');
      return tA.compareTo(tB);
    });
    return sorted;
  }

  int _timeToMinutes(String time) {
    if (time == 'As needed') return 1440;
    final parts = time.split(':');
    if (parts.length == 2) return int.tryParse(parts[0])! * 60 + int.tryParse(parts[1])!;
    return 0;
  }

  String _formatTime(String time) {
    if (time == 'As needed') return 'As needed';
    final parts = time.split(':');
    if (parts.length != 2) return time;
    final h = int.tryParse(parts[0]) ?? 0;
    final m = parts[1];
    final period = h >= 12 ? 'PM' : 'AM';
    final hour = h > 12 ? h - 12 : (h == 0 ? 12 : h);
    return '$hour:$m $period';
  }

  bool _isTimePassed(String time) {
    if (time == 'As needed') return false;
    final parts = time.split(':');
    if (parts.length != 2) return false;
    final h = int.tryParse(parts[0]) ?? 0;
    final m = int.tryParse(parts[1]) ?? 0;
    final now = DateTime.now();
    final medTime = DateTime(now.year, now.month, now.day, h, m);
    return now.isAfter(medTime.add(const Duration(hours: 1)));
  }

  String _takenTime(int i) {
    final ts = _takenTimestamps[i];
    if (ts == null) return '';
    return 'Taken at ${ts.hour.toString().padLeft(2, '0')}:${ts.minute.toString().padLeft(2, '0')}';
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
                      Text('Medicine Reminder', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      GestureDetector(
                        onTap: _showAddReminderSheet,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.add_alarm_rounded, color: Colors.white, size: 22),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('${_taken.length}/${_reminders.length} taken today', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
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
                          _buildProgressBar(),
                          const SizedBox(height: 20),
                          _sectionHeader("Today's Schedule", Icons.schedule_rounded),
                          const SizedBox(height: 12),
                          ...List.generate(_sortedReminders.length, (i) => _buildTimelineItem(i)),
                          const SizedBox(height: 24),
                          _buildAlarmSelector(),
                          const SizedBox(height: 16),
                          _buildRefillTracker(),
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
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: ZyntraColors.cyan, size: 16),
          ),
          const SizedBox(width: 8),
          Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildProgressBar() {
    final total = _reminders.length;
    final taken = _taken.length;
    final progress = total > 0 ? taken / total : 0.0;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
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
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Daily Progress', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              Text('$taken/$total', style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 20, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: ZyntraColors.surface,
              valueColor: const AlwaysStoppedAnimation<Color>(ZyntraColors.cyan),
              minHeight: 8,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildTimelineItem(int i) {
    final r = _sortedReminders[i];
    final time = r['time'] as String? ?? '00:00';
    final name = r['name'] as String? ?? '';
    final dosage = r['dosage'] as String? ?? '';
    final period = r['period'] as String? ?? '';
    final isTaken = _taken.contains(i);
    final isMissed = !isTaken && _isTimePassed(time) && time != 'As needed';
    final isSnoozed = _snoozeIndex == i;

    Color statusColor = ZyntraColors.cyan;
    IconData statusIcon = Icons.schedule_rounded;

    if (isTaken) {
      statusColor = ZyntraColors.green;
      statusIcon = Icons.check_circle_rounded;
    } else if (isMissed) {
      statusColor = ZyntraColors.red;
      statusIcon = Icons.error_rounded;
    } else if (isSnoozed) {
      statusColor = ZyntraColors.amber;
      statusIcon = Icons.alarm_rounded;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              width: 60,
              child: Column(
                children: [
                  Text(_formatTime(time).split(' ')[0], style: GoogleFonts.poppins(color: statusColor, fontSize: 14, fontWeight: FontWeight.w700)),
                  Text(_formatTime(time).contains(' ') ? _formatTime(time).split(' ')[1] : '', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
                  const SizedBox(height: 4),
                  Expanded(
                    child: Container(
                      width: 2,
                      color: ZyntraColors.border,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.only(top: 4),
              child: Container(
                width: 14, height: 14,
                decoration: BoxDecoration(
                  color: statusColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: ZyntraColors.bg, width: 2),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: ZyntraColors.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isMissed ? ZyntraColors.red.withValues(alpha: 0.3) : (isTaken ? ZyntraColors.green.withValues(alpha: 0.2) : ZyntraColors.border),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                          child: Icon(statusIcon, color: statusColor, size: 16),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(name, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                              Text('$dosage - $period', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                            ],
                          ),
                        ),
                        if (isMissed)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: ZyntraColors.red.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(width: 6, height: 6, decoration: const BoxDecoration(color: ZyntraColors.red, shape: BoxShape.circle)),
                                const SizedBox(width: 3),
                                Text('Missed', style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 8, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        if (isTaken)
                          Text(_takenTime(i), style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 9)),
                      ],
                    ),
                    if (!isTaken) ...[
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _taken.add(i);
                                _takenTimestamps[i] = DateTime.now();
                              });
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                content: Text('$name marked as taken', style: GoogleFonts.inter(color: Colors.white)),
                                backgroundColor: ZyntraColors.green,
                                behavior: SnackBarBehavior.floating,
                                duration: const Duration(seconds: 1),
                              ));
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.check_rounded, color: Colors.white, size: 16),
                                  const SizedBox(width: 4),
                                  Text('Mark Taken', style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () => _showSnoozeOptions(i),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                              decoration: BoxDecoration(
                                color: ZyntraColors.amber.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.2)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.snooze_rounded, color: ZyntraColors.amber, size: 16),
                                  const SizedBox(width: 4),
                                  Text('Snooze', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 11, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: (i * 80).ms).slideX(begin: 0.02, end: 0);
  }

  void _showSnoozeOptions(int i) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)))),
            const SizedBox(height: 16),
            Text('Snooze Reminder', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 20),
            ...[5, 10, 30].map((m) => GestureDetector(
              onTap: () {
                setState(() => _snoozeIndex = i);
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text('Reminder snoozed for $m minutes', style: GoogleFonts.inter(color: Colors.white)),
                  backgroundColor: ZyntraColors.amber,
                  behavior: SnackBarBehavior.floating,
                ));
              },
              child: Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: ZyntraColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: ZyntraColors.border),
                ),
                child: Center(
                  child: Text('$m minutes', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w500)),
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildAlarmSelector() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: ZyntraColors.purple.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.notifications_active_rounded, color: ZyntraColors.purple, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Alarm Sound', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                  Text(_alarmSound, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                ],
              ),
            ),
            DropdownButton<String>(
              value: _alarmSound,
              dropdownColor: ZyntraColors.card,
              style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
              underline: const SizedBox(),
              icon: const Icon(Icons.expand_more_rounded, color: ZyntraColors.cyan),
              items: _alarmSounds.map((s) => DropdownMenuItem(value: s, child: Text(s, style: GoogleFonts.inter(fontSize: 13)))).toList(),
              onChanged: (v) => setState(() => _alarmSound = v!),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRefillTracker() {
    final needsRefill = _reminders.where((r) => r['refillDate'] != null).toList();
    if (needsRefill.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.refresh_rounded, color: ZyntraColors.amber, size: 18),
                const SizedBox(width: 8),
                Text('Refill Date Tracker', style: GoogleFonts.poppins(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
              ],
            ),
            const SizedBox(height: 10),
            ...needsRefill.map((r) => Container(
              margin: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  Expanded(
                    child: Text('${r['name']}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                  ),
                  Text('Refill: ${r['refillDate']}', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 11, fontWeight: FontWeight.w500)),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  void _showAddReminderSheet() {
    final nameCtrl = TextEditingController();
    final dosageCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    String frequency = 'Daily';
    final timeCtrl = TextEditingController(text: '08:00');
    String period = 'Morning';
    String repeatDays = 'All days';
    final refillCtrl = TextEditingController(text: '2026-07-30');

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
                Text('Add Reminder', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                Expanded(
                  child: ListView(
                    children: [
                      _reminderField(nameCtrl, 'Medication Name'),
                      const SizedBox(height: 10),
                      _reminderField(dosageCtrl, 'Dosage (e.g. 500mg)'),
                      const SizedBox(height: 10),
                      _reminderField(timeCtrl, 'Time (HH:MM, 24h format)'),
                      const SizedBox(height: 10),
_reminderDropdown(frequency, ['Daily', 'Twice daily', 'Weekly', 'As needed'], (v) => setSheetState(() => frequency = v)),
                      const SizedBox(height: 10),
                      _reminderDropdown(period, ['Morning', 'Afternoon', 'Evening', 'Night', 'PRN'], (v) => setSheetState(() => period = v)),
                      const SizedBox(height: 10),
                      _reminderDropdown(repeatDays, ['All days', 'Weekdays', 'Weekends', 'Mon-Wed-Fri', 'Tue-Thu-Sat'], (v) => setSheetState(() => repeatDays = v)),
                      const SizedBox(height: 10),
                      _reminderField(refillCtrl, 'Refill Date (YYYY-MM-DD)'),
                      const SizedBox(height: 10),
                      _reminderField(notesCtrl, 'Notes (optional)'),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _reminders.add({
                        'name': nameCtrl.text,
                        'dosage': dosageCtrl.text,
                        'time': timeCtrl.text,
                        'period': period,
                        'frequency': frequency,
                        'repeatDays': repeatDays,
                        'refillDate': refillCtrl.text,
                        'notes': notesCtrl.text,
                      });
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('Reminder added', style: GoogleFonts.inter(color: Colors.white)),
                      backgroundColor: ZyntraColors.green,
                      behavior: SnackBarBehavior.floating,
                    ));
                  },
                  child: Container(
                    width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]), borderRadius: BorderRadius.circular(16)),
                    child: Center(child: Text('Add Reminder', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16))),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _reminderField(TextEditingController ctrl, String label) {
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

  Widget _reminderDropdown(String value, List<String> items, ValueChanged<String> onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          dropdownColor: ZyntraColors.card,
          isExpanded: true,
          style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
          items: items.map((f) => DropdownMenuItem(value: f, child: Text(f))).toList(),
          onChanged: (v) => onChanged(v!),
        ),
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
            height: 80,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
          )),
        ),
      ),
    );
  }
}
