import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class ToolsHubScreen extends StatefulWidget {
  const ToolsHubScreen({super.key});
  @override State<ToolsHubScreen> createState() => _ToolsHubScreenState();
}

class _ToolsHubScreenState extends State<ToolsHubScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  final _api = ApiService();
  bool _loading = true;
  List<String> _recentTools = [];
  String _category = 'All';

  final _tools = [
    _ToolDef('BMI Calculator', Icons.monitor_weight_rounded, ZyntraColors.cyan, 'Calculate your Body Mass Index', 'Health'),
    _ToolDef('Water Intake Tracker', Icons.water_drop_rounded, ZyntraColors.cyan, 'Track daily water consumption', 'Health'),
    _ToolDef('Emergency Card', Icons.emergency_rounded, ZyntraColors.red, 'Quick access emergency info', 'Emergency'),
    _ToolDef('First Aid Guide', Icons.medical_services_rounded, ZyntraColors.green, 'Step-by-step first aid instructions', 'Emergency'),
    _ToolDef('Symptom Checker', Icons.search_rounded, ZyntraColors.purple, 'Check your symptoms', 'Health'),
    _ToolDef('Medicine Reminder', Icons.alarm_rounded, ZyntraColors.amber, 'Never miss your medications', 'Daily'),
    _ToolDef('Pill Scanner', Icons.qr_code_scanner_rounded, ZyntraColors.teal, 'Scan pills for info', 'Daily'),
    _ToolDef('Health Risk Assessment', Icons.assessment_rounded, ZyntraColors.pink, 'Assess your health risks', 'Health'),
    _ToolDef('PDF Prescription', Icons.picture_as_pdf_rounded, ZyntraColors.indigo, 'Generate prescription PDFs', 'Daily'),
    _ToolDef('Medical ID', Icons.badge_rounded, ZyntraColors.teal, 'Your digital medical identity', 'Emergency'),
  ];

  final _categories = ['All', 'Health', 'Emergency', 'Daily'];

  List<_ToolDef> get _filteredTools => _category == 'All' ? _tools : _tools.where((t) => t.category == _category).toList();
  List<_ToolDef> get _recentToolDefs => _recentTools.map((name) => _tools.firstWhere((t) => t.name == name, orElse: () => _tools[0])).toList();

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: _categories.length, vsync: this);
    _tabCtrl.addListener(() {
      if (!_tabCtrl.indexIsChanging) {
        setState(() => _category = _categories[_tabCtrl.index]);
      }
    });
    _loadData();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final data = await _api.get('/api/tools/recent');
      if (data is Map && data['success'] == false) throw Exception();
      if (data is Map && data['recent'] is List) {
        setState(() => _recentTools = List<String>.from(data['recent']));
      }
    } catch (_) {
      _recentTools = ['BMI Calculator', 'Water Intake Tracker', 'Symptom Checker'];
    }
    if (mounted) setState(() => _loading = false);
  }

  void _openTool(_ToolDef tool) {
    if (!_recentTools.contains(tool.name)) {
      setState(() => _recentTools.insert(0, tool.name));
      if (_recentTools.length > 5) _recentTools.removeLast();
    }
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('Opening ${tool.name}...', style: GoogleFonts.inter(color: Colors.white)),
      backgroundColor: ZyntraColors.card,
      behavior: SnackBarBehavior.floating,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight),
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
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text('Tools Hub', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.search_rounded, color: Colors.white, size: 20),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  TabBar(
                    controller: _tabCtrl,
                    isScrollable: true,
                    indicatorColor: Colors.white,
                    indicatorWeight: 3,
                    indicatorSize: TabBarIndicatorSize.label,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white60,
                    labelStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
                    unselectedLabelStyle: GoogleFonts.inter(fontSize: 14),
                    tabs: _categories.map((c) => Tab(text: c)).toList(),
                  ),
                ],
              ),
            ),
            if (_loading)
              Expanded(child: _buildShimmer())
            else
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                  children: [
                    if (_recentToolDefs.isNotEmpty) ...[
                      Text('Recently Used', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 100,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: _recentToolDefs.length,
                          separatorBuilder: (_, _) => const SizedBox(width: 12),
                          itemBuilder: (_, i) {
                            final t = _recentToolDefs[i];
                            return GestureDetector(
                              onTap: () => _openTool(t),
                              child: Container(
                                width: 100,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: ZyntraColors.card,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: ZyntraColors.border),
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(t.icon, color: t.color, size: 28),
                                    const SizedBox(height: 6),
                                    Text(t.name.split(' ').first, style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500), textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                    Text('All Tools', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 12),
                    ..._filteredTools.map((t) => _buildToolCard(t)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildToolCard(_ToolDef tool) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: tool.color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(14)),
            child: Icon(tool.icon, color: tool.color, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tool.name, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(tool.description, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: () => _openTool(tool),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text('Open', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideX(begin: 0.05, end: 0);
  }

  Widget _buildShimmer() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: SizedBox(
            height: 100,
            child: Row(children: List.generate(3, (_) => Container(width: 100, margin: const EdgeInsets.only(right: 12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))),
            ),
          ),
        ),
        const SizedBox(height: 24),
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Column(children: List.generate(5, (_) => Container(height: 76, margin: const EdgeInsets.only(bottom: 12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))),
          ),
        ),
      ],
    );
  }
}

class _ToolDef {
  final String name;
  final IconData icon;
  final Color color;
  final String description;
  final String category;
  const _ToolDef(this.name, this.icon, this.color, this.description, this.category);
}
