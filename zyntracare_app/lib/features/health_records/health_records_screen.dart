import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';
import '../../data/models/models.dart';

class HealthRecordsScreen extends StatefulWidget {
  const HealthRecordsScreen({super.key});
  @override State<HealthRecordsScreen> createState() => _HealthRecordsScreenState();
}

class _HealthRecordsScreenState extends State<HealthRecordsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  List<HealthRecord> _records = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    _loadRecords();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadRecords() async {
    setState(() => _loading = true);
    try {
      final list = await apiService.getPatientRecords('current', {});
      if (mounted) {
        setState(() {
          _records = list.map((e) => HealthRecord.fromJson(e is Map<String, dynamic> ? e : {})).toList();
        });
      }
    } catch (e) {
      // Use placeholder data if API fails
      if (mounted) setState(() => _records = _placeholderRecords());
    }
    if (mounted) setState(() => _loading = false);
  }

  List<HealthRecord> _placeholderRecords() {
    return [
      HealthRecord(id: '1', title: 'Blood Test Report', type: 'report', date: '2026-06-20', hospital: 'Apollo Hospital', doctor: 'Dr. Rajesh Kumar', notes: 'All values normal'),
      HealthRecord(id: '2', title: 'Chest X-Ray', type: 'scan', date: '2026-06-15', hospital: 'AIIMS Bhubaneswar', doctor: 'Dr. Priya Sharma', notes: 'No abnormalities detected'),
      HealthRecord(id: '3', title: 'Prescription - Amoxicillin', type: 'prescription', date: '2026-06-10', hospital: 'Sum Hospital', doctor: 'Dr. Amit Panda'),
      HealthRecord(id: '4', title: 'COVID Vaccination', type: 'vaccination', date: '2026-05-01', hospital: 'Care Hospital', doctor: 'Dr. Sunita Das'),
      HealthRecord(id: '5', title: 'Full Body Checkup', type: 'report', date: '2026-04-15', hospital: 'Apollo Hospital', doctor: 'Dr. Rajesh Kumar', notes: 'Lipid profile, LFT, KFT done'),
    ];
  }

  List<HealthRecord> get _filteredRecords {
    final ind = _tabCtrl.index;
    if (ind == 0) return _records;
    final types = {1: 'report', 2: 'prescription'};
    return _records.where((r) => r.type == types[ind]).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: ZyntraColors.card,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: ZyntraColors.border),
                      ),
                      child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text('Health Records', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  GestureDetector(
                    onTap: _showUploadSheet,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.cloud_upload_rounded, color: Colors.white, size: 22),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Tab bar
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: ZyntraColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: TabBar(
                controller: _tabCtrl,
                indicator: BoxDecoration(
                  gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                  borderRadius: BorderRadius.circular(12),
                ),
                indicatorPadding: const EdgeInsets.all(4),
                labelColor: Colors.white,
                unselectedLabelColor: ZyntraColors.white70,
                labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 12),
                tabs: const [
                  Tab(text: 'All'),
                  Tab(text: 'Reports'),
                  Tab(text: 'Prescriptions'),
                ],
                onTap: (_) => setState(() {}),
              ),
            ),
            const SizedBox(height: 16),
            // Records list
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : _filteredRecords.isEmpty
                      ? _buildEmpty()
                      : RefreshIndicator(
                          color: ZyntraColors.cyan,
                          backgroundColor: ZyntraColors.card,
                          onRefresh: _loadRecords,
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                            itemCount: _filteredRecords.length,
                            itemBuilder: (_, i) => _recordCard(_filteredRecords[i], i),
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _recordCard(HealthRecord r, int i) {
    final def = _recordTypeDef(r.type);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: def.color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(def.icon, color: def.color, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(r.title, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.calendar_today_rounded, color: ZyntraColors.white40, size: 11),
                    const SizedBox(width: 4),
                    Text(r.date, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                    const SizedBox(width: 8),
                    Icon(Icons.local_hospital_rounded, color: ZyntraColors.white40, size: 11),
                    const SizedBox(width: 4),
                    Text(r.hospital, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ],
                ),
                if (r.notes != null && r.notes!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(r.notes!, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
                ],
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: def.color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(def.label, style: GoogleFonts.inter(color: def.color, fontSize: 9, fontWeight: FontWeight.w500)),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: () => _showRecordDetail(r),
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: ZyntraColors.cyan.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.visibility_rounded, color: ZyntraColors.cyan, size: 16),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 60).ms).slideY(begin: 0.1, end: 0);
  }

  _TypeDef _recordTypeDef(String type) {
    switch (type) {
      case 'report': return _TypeDef('Report', Icons.description_rounded, ZyntraColors.cyan);
      case 'prescription': return _TypeDef('Prescription', Icons.medication_rounded, ZyntraColors.purple);
      case 'scan': return _TypeDef('Scan', Icons.emergency_rounded, ZyntraColors.teal);
      case 'vaccination': return _TypeDef('Vaccination', Icons.vaccines_rounded, ZyntraColors.green);
      default: return _TypeDef('Record', Icons.folder_rounded, ZyntraColors.white70);
    }
  }

  void _showRecordDetail(HealthRecord r) {
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
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)),
                ),
              ),
              const SizedBox(height: 20),
              Text(r.title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              _detailRow(Icons.calendar_today_rounded, 'Date', r.date),
              _detailRow(Icons.local_hospital_rounded, 'Hospital', r.hospital),
              _detailRow(Icons.person_rounded, 'Doctor', r.doctor),
              if (r.notes != null && r.notes!.isNotEmpty) _detailRow(Icons.notes_rounded, 'Notes', r.notes!),
              const SizedBox(height: 20),
              const Divider(color: ZyntraColors.border),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Downloading ${r.title}...', style: GoogleFonts.inter(color: Colors.white)),
                    backgroundColor: ZyntraColors.cyan,
                    behavior: SnackBarBehavior.floating,
                  ));
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    const Icon(Icons.download_rounded, color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                    Text('Download Record', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, color: ZyntraColors.cyan, size: 16),
          const SizedBox(width: 8),
          Text('$label: ', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
          Expanded(child: Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }

  void _showUploadSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.4,
        decoration: const BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)),
                ),
              ),
              const SizedBox(height: 20),
              Text('Upload Record', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              _uploadOption(Icons.description_rounded, 'Upload Report', 'PDF, JPG, PNG', ZyntraColors.cyan),
              const SizedBox(height: 12),
              _uploadOption(Icons.image_rounded, 'Upload Scan', 'JPG, PNG, DICOM', ZyntraColors.purple),
              const SizedBox(height: 12),
              _uploadOption(Icons.camera_alt_rounded, 'Take Photo', 'Use camera to capture', ZyntraColors.teal),
            ],
          ),
        ),
      ),
    );
  }

  Widget _uploadOption(IconData icon, String title, String subtitle, Color color) {
    return GestureDetector(
      onTap: () => Navigator.pop(context),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: ZyntraColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                  Text(subtitle, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: ZyntraColors.white40),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: 4,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 80,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(18)),
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: const Icon(Icons.folder_open_rounded, color: ZyntraColors.cyan, size: 50),
          ),
          const SizedBox(height: 16),
          Text('No records found', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text('Upload your health records', style: GoogleFonts.inter(color: ZyntraColors.white70)),
        ],
      ),
    );
  }
}

class _TypeDef {
  final String label;
  final IconData icon;
  final Color color;
  const _TypeDef(this.label, this.icon, this.color);
}
