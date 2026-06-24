import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../../../data/api_service.dart';

class HomeModals {
  static void showNotif(BuildContext ctx) => _bottom(ctx, _Notif());
  static void showSearch(BuildContext ctx) => _bottom(ctx, _Search(ctx), height: 0.7);
  static void showHospitals(BuildContext ctx) => _listSheet(ctx, 'Hospitals', () => apiService.getHospitals(), ZyntraColors.cyan, Icons.local_hospital_rounded);
  static void showDoctors(BuildContext ctx)   => _listSheet(ctx, 'Doctors', () => apiService.getDoctors(), ZyntraColors.green, Icons.person_rounded);
  static void showBlood(BuildContext ctx)     => _listSheet(ctx, 'Blood Donors', () => apiService.getBloodDonors(), ZyntraColors.red, Icons.bloodtype_rounded);
  static void showPharmacy(BuildContext ctx)  => _listSheet(ctx, 'Pharmacies', () => apiService.getPharmacies(), ZyntraColors.purple, Icons.medication_rounded);
  static void showLabs(BuildContext ctx)      => _listSheet(ctx, 'Labs', () => apiService.getLabs(), ZyntraColors.teal, Icons.science_rounded);
  static void showVideo(BuildContext ctx)     => _listSheet(ctx, 'Video Consult', () => apiService.getTelehealth(), ZyntraColors.indigo, Icons.video_call_rounded);
  static void showAIChat(BuildContext ctx)    => _bottom(ctx, _AIChat(), height: 0.75);
  static void showSymptom(BuildContext ctx)   => _bottom(ctx, _Symptom(ctx));

  static void _bottom(BuildContext ctx, Widget child, {double height = 0.5}) {
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(ctx).size.height * height,
        decoration: const BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: child,
      ),
    );
  }

  static void _listSheet(BuildContext ctx, String title, Future<List<dynamic>> Function() fetcher, Color color, IconData icon) {
    _bottom(ctx, _ListSheet(title: title, fetcher: fetcher, color: color, icon: icon), height: 0.82);
  }
}

// ── Shared sheet header ──────────────────────────────────────────────────────
Widget _sheetHeader(String title) => Padding(
  padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
  child: Column(children: [
    Container(width: 40, height: 4, decoration: BoxDecoration(
      color: ZyntraColors.border, borderRadius: BorderRadius.circular(4))),
    const SizedBox(height: 14),
    Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
    const SizedBox(height: 12),
  ]),
);

// ── Notifications ─────────────────────────────────────────────────────────────
class _Notif extends StatelessWidget {
  @override Widget build(BuildContext ctx) => Column(children: [
    _sheetHeader('Notifications'),
    const Expanded(child: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      Icon(Icons.notifications_off_rounded, color: ZyntraColors.border, size: 52),
      SizedBox(height: 12),
      Text('No new notifications', style: TextStyle(color: ZyntraColors.white70)),
    ]))),
  ]);
}

// ── Search ────────────────────────────────────────────────────────────────────
class _Search extends StatefulWidget {
  final BuildContext parentCtx;
  const _Search(this.parentCtx);
  @override State<_Search> createState() => _SearchState();
}
class _SearchState extends State<_Search> {
  final _ctrl = TextEditingController();
  List<dynamic> _results = [];
  bool _loading = false;

  Future<void> _search(String q) async {
    if (q.isEmpty) return;
    setState(() => _loading = true);
    final r = await apiService.searchAll(q);
    setState(() { _results = r; _loading = false; });
  }

  @override Widget build(BuildContext ctx) => Column(children: [
    _sheetHeader('Search'),
    Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: TextField(
        controller: _ctrl,
        style: GoogleFonts.inter(color: Colors.white),
        autofocus: true,
        decoration: InputDecoration(
          hintText: 'Search hospitals, doctors…',
          hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
          prefixIcon: const Icon(Icons.search_rounded, color: ZyntraColors.cyan),
          filled: true,
          fillColor: ZyntraColors.surface,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        ),
        onSubmitted: _search,
      ),
    ),
    const SizedBox(height: 12),
    if (_loading) const Expanded(child: Center(child: CircularProgressIndicator(color: ZyntraColors.cyan)))
    else Expanded(child: _results.isEmpty
      ? Center(child: Text('Type to search…', style: GoogleFonts.inter(color: ZyntraColors.white70)))
      : ListView.builder(
          itemCount: _results.length,
          itemBuilder: (_, i) {
            final r = _results[i];
            return ListTile(
              leading: const Icon(Icons.search_rounded, color: ZyntraColors.cyan),
              title: Text(r['name'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w500)),
              subtitle: Text(r['type'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
            );
          },
        )),
  ]);
}

// ── Generic list sheet ────────────────────────────────────────────────────────
class _ListSheet extends StatelessWidget {
  final String title;
  final Future<List<dynamic>> Function() fetcher;
  final Color color;
  final IconData icon;
  const _ListSheet({required this.title, required this.fetcher, required this.color, required this.icon});

  @override Widget build(BuildContext ctx) => Column(children: [
    _sheetHeader(title),
    Expanded(child: FutureBuilder<List<dynamic>>(
      future: fetcher(),
      builder: (_, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: ZyntraColors.cyan));
        }
        final data = snap.data ?? [];
        if (data.isEmpty) {
          return Center(child: Text('No results found', style: GoogleFonts.inter(color: ZyntraColors.white70)));
        }
        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: data.length,
          itemBuilder: (_, i) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Row(children: [
              Container(padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: Icon(icon, color: color, size: 18)),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(data[i]['name'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                Text(data[i]['city'] ?? data[i]['specialty'] ?? data[i]['address'] ?? '',
                  style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              ])),
              if (data[i]['rating'] != null)
                Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.star_rounded, color: ZyntraColors.amber, size: 14),
                  Text(' ${data[i]['rating']}', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 12)),
                ]),
            ]),
          ),
        );
      },
    )),
  ]);
}

// ── AI Chat ───────────────────────────────────────────────────────────────────
class _AIChat extends StatefulWidget {
  @override State<_AIChat> createState() => _AIChatState();
}
class _AIChatState extends State<_AIChat> {
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();
  final _msgs = <Map<String, String>>[
    {'role': 'assistant', 'content': "Hi! I'm your AI Health Assistant. How can I help you today?"},
  ];
  bool _typing = false;

  Future<void> _send() async {
    final txt = _ctrl.text.trim();
    if (txt.isEmpty) return;
    _ctrl.clear();
    setState(() { _msgs.add({'role': 'user', 'content': txt}); _typing = true; });
    final reply = await apiService.aiChat(txt);
    if (mounted) setState(() { _msgs.add({'role': 'assistant', 'content': reply}); _typing = false; });
    await Future.delayed(const Duration(milliseconds: 100));
    _scroll.animateTo(_scroll.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
  }

  @override Widget build(BuildContext ctx) => Column(children: [
    _sheetHeader('AI Health Assistant'),
    Expanded(child: ListView.builder(
      controller: _scroll,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _msgs.length + (_typing ? 1 : 0),
      itemBuilder: (_, i) {
        if (i == _msgs.length) {
          return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Align(alignment: Alignment.centerLeft,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14)),
              child: const SizedBox(width: 40, height: 16, child: CircularProgressIndicator(color: ZyntraColors.cyan, strokeWidth: 2)),
            )),
        );
        }
        final m = _msgs[i]; final isUser = m['role'] == 'user';
        return Align(
          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            constraints: BoxConstraints(maxWidth: MediaQuery.of(ctx).size.width * 0.75),
            decoration: BoxDecoration(
              gradient: isUser ? const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]) : null,
              color: isUser ? null : ZyntraColors.surface,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(m['content'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
          ),
        );
      },
    )),
    Padding(
      padding: EdgeInsets.fromLTRB(16, 8, 16, MediaQuery.of(ctx).viewInsets.bottom + 16),
      child: Row(children: [
        Expanded(child: TextField(
          controller: _ctrl,
          style: GoogleFonts.inter(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Ask about your health…',
            hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
            filled: true, fillColor: ZyntraColors.surface,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          onSubmitted: (_) => _send(),
        )),
        const SizedBox(width: 10),
        GestureDetector(
          onTap: _send,
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
          ),
        ),
      ]),
    ),
  ]);
}

// ── Symptom checker ───────────────────────────────────────────────────────────
class _Symptom extends StatefulWidget {
  final BuildContext parentCtx;
  const _Symptom(this.parentCtx);
  @override State<_Symptom> createState() => _SymptomState();
}
class _SymptomState extends State<_Symptom> {
  final _selected = <String>{};
  final _symptoms = ['Fever','Cough','Headache','Fatigue','Nausea','Body Pain','Sore Throat','Runny Nose','Chest Pain','Dizziness'];

  @override Widget build(BuildContext ctx) => Column(children: [
    _sheetHeader('Symptom Checker'),
    Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 8, runSpacing: 8,
        children: _symptoms.map((s) {
          final sel = _selected.contains(s);
          return GestureDetector(
            onTap: () => setState(() => sel ? _selected.remove(s) : _selected.add(s)),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: sel ? ZyntraColors.cyan.withValues(alpha: 0.2) : ZyntraColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: sel ? ZyntraColors.cyan : ZyntraColors.border),
              ),
              child: Text(s, style: GoogleFonts.inter(color: sel ? ZyntraColors.cyan : ZyntraColors.white70, fontSize: 13, fontWeight: sel ? FontWeight.w600 : FontWeight.normal)),
            ),
          );
        }).toList(),
      ),
    ),
    const SizedBox(height: 20),
    Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GestureDetector(
        onTap: _selected.isEmpty ? null : () async {
          final result = await apiService.checkSymptoms(_selected.toList());
          if (widget.parentCtx.mounted) {
            showModalBottomSheet(context: widget.parentCtx, backgroundColor: ZyntraColors.card,
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
              builder: (_) => Padding(
                padding: const EdgeInsets.all(24),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Container(width: 52, height: 52,
                    decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), shape: BoxShape.circle),
                    child: const Icon(Icons.check_circle_rounded, color: ZyntraColors.cyan, size: 32)),
                  const SizedBox(height: 16),
                  Text('Analysis Complete', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Text(result, style: GoogleFonts.inter(color: ZyntraColors.white70), textAlign: TextAlign.center),
                ]),
              ));
          }
        },
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            gradient: _selected.isEmpty ? null : const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
            color: _selected.isEmpty ? ZyntraColors.border : null,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Center(child: Text('Analyse Symptoms', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600))),
        ),
      ),
    ),
    const SizedBox(height: 20),
  ]);
}
