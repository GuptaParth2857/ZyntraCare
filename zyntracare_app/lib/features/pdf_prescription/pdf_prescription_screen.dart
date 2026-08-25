import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class PdfPrescriptionScreen extends StatefulWidget {
  const PdfPrescriptionScreen({super.key});
  @override State<PdfPrescriptionScreen> createState() => _PdfPrescriptionScreenState();
}

class _PdfPrescriptionScreenState extends State<PdfPrescriptionScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _prescriptions = [];
  Map<String, dynamic>? _selected;
  bool _showDetail = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.get('/api/prescriptions');
      if (mounted && res != null) {
        final list = (res is List ? res : (res['data'] ?? res['prescriptions'] ?? [])) as List;
        setState(() => _prescriptions = list.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList());
      }
    } catch (_) {}
    if (_prescriptions.isEmpty && mounted) {
      setState(() => _prescriptions = _placeholderData());
    }
    if (mounted) setState(() => _loading = false);
  }

  List<Map<String, dynamic>> _placeholderData() => [
    {'doctor': 'Dr. Sarah Mehta', 'specialty': 'Cardiologist', 'hospital': 'Apollo Hospitals', 'date': '2026-06-20', 'diagnosis': 'Hypertension, Stage 1', 'medicines': [
      {'name': 'Amlodipine', 'dosage': '5mg', 'frequency': 'Once daily', 'duration': '30 days'},
      {'name': 'Losartan', 'dosage': '50mg', 'frequency': 'Once daily', 'duration': '30 days'},
      {'name': 'Aspirin', 'dosage': '75mg', 'frequency': 'Once daily', 'duration': '90 days'},
    ], 'instructions': 'Take with food. Monitor BP daily. Avoid high sodium diet.'},
    {'doctor': 'Dr. Rajesh Kumar', 'specialty': 'Orthopedic', 'hospital': 'Fortis Hospital', 'date': '2026-06-15', 'diagnosis': 'Lumbar Spondylosis', 'medicines': [
      {'name': 'Accclofenac', 'dosage': '100mg', 'frequency': 'Twice daily', 'duration': '10 days'},
      {'name': 'Gabapentin', 'dosage': '300mg', 'frequency': 'Once at night', 'duration': '15 days'},
    ], 'instructions': 'Avoid heavy lifting. Use hot compress.'},
    {'doctor': 'Dr. Priya Sharma', 'specialty': 'General Physician', 'hospital': 'Max Healthcare', 'date': '2026-06-10', 'diagnosis': 'Acute Bronchitis', 'medicines': [
      {'name': 'Amoxicillin', 'dosage': '500mg', 'frequency': 'Three times daily', 'duration': '7 days'},
      {'name': 'Dextromethorphan', 'dosage': '15mg', 'frequency': 'Three times daily', 'duration': '5 days'},
    ], 'instructions': 'Complete the full course. Stay hydrated.'},
    {'doctor': 'Dr. Ananya Patel', 'specialty': 'Dermatologist', 'hospital': 'Artemis Hospital', 'date': '2026-06-05', 'diagnosis': 'Eczema', 'medicines': [
      {'name': 'Hydrocortisone', 'dosage': '1% cream', 'frequency': 'Apply twice daily', 'duration': '14 days'},
      {'name': 'Cetirizine', 'dosage': '10mg', 'frequency': 'Once daily', 'duration': '14 days'},
    ], 'instructions': 'Avoid harsh soaps. Moisturize regularly.'},
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
                        onTap: () {
                          if (_showDetail) {
                            setState(() => _showDetail = false);
                          } else {
                            Navigator.pop(context);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                          child: Icon(_showDetail ? Icons.arrow_back_rounded : Icons.arrow_back_rounded, color: Colors.white, size: 20),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(_showDetail ? 'Prescription Detail' : 'PDF Prescriptions',
                          style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      if (!_showDetail)
                        GestureDetector(
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                              content: Text('Upload prescription feature coming soon!', style: GoogleFonts.inter(color: Colors.white)),
                              backgroundColor: ZyntraColors.cyan,
                              behavior: SnackBarBehavior.floating,
                            ));
                          },
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                            child: const Icon(Icons.upload_file_rounded, color: Colors.white, size: 22),
                          ),
                        ),
                    ],
                  ),
                  if (!_showDetail) ...[
                    const SizedBox(height: 8),
                    Text('Access your medical prescriptions', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                  ],
                ],
              ),
            ),
            if (_loading)
              Expanded(child: _buildShimmer())
            else if (_showDetail && _selected != null)
              Expanded(child: _buildDetailView())
            else
              Expanded(
                child: RefreshIndicator(
                  color: ZyntraColors.cyan,
                  backgroundColor: ZyntraColors.card,
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                    children: [
                      Text('Recent Prescriptions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 14),
                      ...List.generate(_prescriptions.length, (i) => _prescriptionCard(_prescriptions[i], i)),
                      const SizedBox(height: 20),
                      // Upload new button
                      GestureDetector(
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            content: Text('Upload prescription feature coming soon!', style: GoogleFonts.inter(color: Colors.white)),
                            backgroundColor: ZyntraColors.cyan,
                            behavior: SnackBarBehavior.floating,
                          ));
                        },
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.upload_file_rounded, color: Colors.white, size: 20),
                              const SizedBox(width: 8),
                              Text('Upload New Prescription', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _prescriptionCard(Map<String, dynamic> p, int i) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _selected = p;
          _showDetail = true;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [ZyntraColors.card, ZyntraColors.surface], begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: ZyntraColors.teal.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.picture_as_pdf_rounded, color: ZyntraColors.teal, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p['doctor'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text('${p['specialty'] ?? ''} | ${p['hospital'] ?? ''}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                        child: Text(p['date'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 10, fontWeight: FontWeight.w500)),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(p['diagnosis'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10),
                          overflow: TextOverflow.ellipsis),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: ZyntraColors.white40),
          ],
        ),
      ).animate().fadeIn(delay: (i * 60).ms).slideX(begin: 0.05, end: 0),
    );
  }

  Widget _buildDetailView() {
    final p = _selected!;
    final meds = (p['medicines'] as List?)?.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList() ?? [];
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Doctor info card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                  ),
                  child: Center(child: Icon(Icons.person_rounded, color: Colors.white, size: 30)),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(p['doctor'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                      Text(p['specialty'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                      Text(p['hospital'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
                    ],
                  ),
                ),
                Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(
                    color: ZyntraColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: ZyntraColors.border, style: BorderStyle.solid),
                  ),
                  child: Center(
                    child: Text('SIG', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9, fontWeight: FontWeight.w500)),
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 300.ms),
          const SizedBox(height: 16),
          // Patient & Date info
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Patient', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
                      Text('John Doe', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Date', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
                      Text(p['date'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Diagnosis', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
                      Text(p['diagnosis'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 100.ms),
          const SizedBox(height: 20),
          // Medications table
          Text('Prescribed Medications', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                  decoration: BoxDecoration(
                    color: ZyntraColors.surface,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    border: Border(bottom: BorderSide(color: ZyntraColors.border)),
                  ),
                  child: Row(
                    children: [
                      Expanded(flex: 3, child: Text('Medicine', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11, fontWeight: FontWeight.w600))),
                      Expanded(flex: 2, child: Text('Dosage', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11, fontWeight: FontWeight.w600))),
                      Expanded(flex: 3, child: Text('Frequency', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11, fontWeight: FontWeight.w600))),
                      Expanded(flex: 2, child: Text('Duration', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11, fontWeight: FontWeight.w600), textAlign: TextAlign.right)),
                    ],
                  ),
                ),
                ...List.generate(meds.length, (i) {
                  final m = meds[i];
                  final isLast = i == meds.length - 1;
                  return Container(
                    padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                    decoration: isLast ? null : BoxDecoration(border: Border(bottom: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5)))),
                    child: Row(
                      children: [
                        Expanded(flex: 3, child: Text(m['name'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500))),
                        Expanded(flex: 2, child: Text(m['dosage'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12))),
                        Expanded(flex: 3, child: Text(m['frequency'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12))),
                        Expanded(flex: 2, child: Text(m['duration'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12), textAlign: TextAlign.right)),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ).animate().fadeIn(delay: 200.ms),
          const SizedBox(height: 16),
          // Additional instructions
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [ZyntraColors.amber.withValues(alpha: 0.08), ZyntraColors.amber.withValues(alpha: 0.02)],
                begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.15)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, color: ZyntraColors.amber, size: 18),
                    const SizedBox(width: 8),
                    Text('Additional Instructions', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(p['instructions'] ?? 'No additional instructions.', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, height: 1.5)),
              ],
            ),
          ).animate().fadeIn(delay: 300.ms),
          const SizedBox(height: 16),
          // QR code placeholder
          Center(
            child: Container(
              width: 100, height: 100,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.qr_code_rounded, color: Colors.black, size: 40),
                    Text('QR Code', style: GoogleFonts.inter(color: Colors.black54, fontSize: 8)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Center(child: Text('Scan to verify prescription', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10))),
          const SizedBox(height: 20),
          // Action buttons
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('Prescription shared!', style: GoogleFonts.inter(color: Colors.white)),
                      backgroundColor: ZyntraColors.green,
                      behavior: SnackBarBehavior.floating,
                    ));
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      color: ZyntraColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: ZyntraColors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.share_rounded, color: ZyntraColors.cyan, size: 18),
                        const SizedBox(width: 6),
                        Text('Share', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('PDF download started!', style: GoogleFonts.inter(color: Colors.white)),
                      backgroundColor: ZyntraColors.green,
                      behavior: SnackBarBehavior.floating,
                    ));
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4))],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.download_rounded, color: Colors.white, size: 18),
                        const SizedBox(width: 6),
                        Text('Download PDF', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ).animate().fadeIn(delay: 400.ms),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Container(height: 30, width: 200, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(8))),
        ),
        const SizedBox(height: 14),
        ...List.generate(4, (_) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Shimmer.fromColors(
            baseColor: ZyntraColors.card,
            highlightColor: ZyntraColors.border,
            child: Container(height: 100, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(18))),
          ),
        )),
      ],
    );
  }
}
