import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class BloodCampaignScreen extends StatefulWidget {
  const BloodCampaignScreen({super.key});
  @override State<BloodCampaignScreen> createState() => _BloodCampaignScreenState();
}

class _BloodCampaignScreenState extends State<BloodCampaignScreen> {
  final _api = ApiService();
  bool _loading = true;
  List<Map<String, dynamic>> _campaigns = [];
  final Set<String> _registeredIds = {};

  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _targetUnitsCtrl = TextEditingController();
  DateTime? _selectedDate;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _fetchCampaigns();
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _locationCtrl.dispose();
    _targetUnitsCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchCampaigns() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/blood-campaigns');
    if (mounted) {
      setState(() {
        if (res is List) {
          _campaigns = res.cast<Map<String, dynamic>>();
        } else if (res is Map && res['data'] != null) {
          _campaigns = (res['data'] as List).cast<Map<String, dynamic>>();
        } else {
          _campaigns = _mockCampaigns();
        }
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _mockCampaigns() {
    return [
      {'id': '1', 'title': 'Red Drop Marathon 2026', 'organizer': 'Indian Red Cross Society', 'date': '2026-07-15', 'location': 'India Gate, New Delhi', 'slots': 45, 'totalSlots': 200, 'targetUnits': 500, 'description': 'Annual blood donation drive at India Gate. Free health checkup for all donors.', 'featured': true},
      {'id': '2', 'title': 'Campus Blood Drive - IIT Delhi', 'organizer': 'IIT Delhi NSS', 'date': '2026-07-22', 'location': 'IIT Delhi Campus', 'slots': 28, 'totalSlots': 150, 'targetUnits': 300, 'description': 'Blood donation camp organized by NSS IIT Delhi.', 'featured': false},
      {'id': '3', 'title': 'Saving Lives - Corporate Camp', 'organizer': 'ZyntraCare Foundation', 'date': '2026-08-05', 'location': 'Sector 62, Noida', 'slots': 12, 'totalSlots': 100, 'targetUnits': 200, 'description': 'Corporate blood donation drive. Join us and save lives!', 'featured': false},
      {'id': '4', 'title': 'Health & Donate Camp', 'organizer': 'Apollo Hospitals', 'date': '2026-08-12', 'location': 'Apollo Hospitals, Delhi', 'slots': 67, 'totalSlots': 250, 'targetUnits': 400, 'description': 'Free health screening and blood donation camp.', 'featured': false},
      {'id': '5', 'title': 'Rural Health Initiative', 'organizer': 'Gram Vikas Trust', 'date': '2026-08-20', 'location': 'Meerut, UP', 'slots': 33, 'totalSlots': 80, 'targetUnits': 160, 'description': 'Taking blood donation to rural areas.', 'featured': false},
    ];
  }

  void _toggleRegister(String id) {
    setState(() {
      if (_registeredIds.contains(id)) {
        _registeredIds.remove(id);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Text('Registration cancelled'), backgroundColor: ZyntraColors.amber));
      } else {
        _registeredIds.add(id);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Text('Registered for campaign!'), backgroundColor: ZyntraColors.green));
      }
    });
  }

  Future<void> _createCampaign() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Text('Please select a date'), backgroundColor: ZyntraColors.red));
      return;
    }
    setState(() => _submitting = true);
    final body = {
      'title': _titleCtrl.text,
      'description': _descCtrl.text,
      'date': DateFormat('yyyy-MM-dd').format(_selectedDate!),
      'location': _locationCtrl.text,
      'targetUnits': int.tryParse(_targetUnitsCtrl.text) ?? 0,
    };
    final res = await _api.post('/api/blood-campaigns', body: body);
    if (mounted) {
      setState(() => _submitting = false);
      if (res is Map && res['success'] == false) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res['error'] ?? 'Failed'), backgroundColor: ZyntraColors.red));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Campaign created!'), backgroundColor: ZyntraColors.green));
        Navigator.pop(context);
        _fetchCampaigns();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface,
        elevation: 0,
        title: Text('Blood Campaigns', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        actions: [
          GestureDetector(
            onTap: _showCreateForm,
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: ZyntraColors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.3)),
              ),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.add_rounded, color: ZyntraColors.red, size: 16),
                const SizedBox(width: 4),
                Text('Create', style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 12, fontWeight: FontWeight.w600)),
              ]),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: ZyntraColors.red,
        onRefresh: _fetchCampaigns,
        child: _loading
            ? ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: 3,
                itemBuilder: (_, _) => _shimmerCard(),
              )
            : _campaigns.isEmpty
                ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.bloodtype_outlined, size: 64, color: ZyntraColors.white70.withValues(alpha: 0.4)),
                    const SizedBox(height: 12),
                    Text('No campaigns yet', style: GoogleFonts.inter(color: ZyntraColors.white70)),
                  ]))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _campaigns.length,
                    itemBuilder: (_, i) => _buildCampaignCard(_campaigns[i]),
                  ),
      ),
    );
  }

  Widget _buildCampaignCard(Map<String, dynamic> campaign) {
    final id = campaign['id']?.toString() ?? '';
    final isRegistered = _registeredIds.contains(id);
    final isFeatured = campaign['featured'] == true;
    final slots = campaign['slots'] as int? ?? 0;
    final totalSlots = campaign['totalSlots'] as int? ?? 100;
    final fillPercent = (totalSlots - slots) / totalSlots;
    final dateStr = campaign['date']?.toString() ?? '';
    String formattedDate = dateStr;
    try { formattedDate = DateFormat('d MMM yyyy').format(DateTime.parse(dateStr)); } catch (_) {}

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isFeatured ? ZyntraColors.red.withValues(alpha: 0.5) : ZyntraColors.border.withValues(alpha: 0.5),
          width: isFeatured ? 1.5 : 1,
        ),
        boxShadow: isFeatured
            ? [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.1), blurRadius: 20, spreadRadius: 2)]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isFeatured)
            Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.star_rounded, color: Colors.white, size: 14),
                  const SizedBox(width: 4),
                  Text('FEATURED CAMPAIGN', style: GoogleFonts.inter(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 80, height: 80,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [ZyntraColors.red.withValues(alpha: 0.2), ZyntraColors.red.withValues(alpha: 0.05)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.2)),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.bloodtype_rounded, color: ZyntraColors.red, size: 28),
                      Text('${campaign['targetUnits'] ?? 0}', style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.red, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(campaign['title']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
                    const SizedBox(height: 4),
                    Row(children: [
                      Icon(Icons.person_outline_rounded, size: 12, color: ZyntraColors.white70),
                      const SizedBox(width: 4),
                      Expanded(child: Text(campaign['organizer']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70), overflow: TextOverflow.ellipsis)),
                    ]),
                    const SizedBox(height: 2),
                    Row(children: [
                      Icon(Icons.calendar_today_rounded, size: 12, color: ZyntraColors.white70),
                      const SizedBox(width: 4),
                      Text(formattedDate, style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
                    ]),
                    const SizedBox(height: 2),
                    Row(children: [
                      Icon(Icons.location_on_rounded, size: 12, color: ZyntraColors.white70),
                      const SizedBox(width: 4),
                      Expanded(child: Text(campaign['location']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70), overflow: TextOverflow.ellipsis)),
                    ]),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('$slots slots available', style: GoogleFonts.inter(fontSize: 11, color: slots > 20 ? ZyntraColors.green : ZyntraColors.amber, fontWeight: FontWeight.w600)),
                  Text('${(fillPercent * 100).toStringAsFixed(0)}% filled', style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.white70)),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: fillPercent.clamp(0.0, 1.0),
                  backgroundColor: ZyntraColors.surface,
                  valueColor: AlwaysStoppedAnimation<Color>(slots > 20 ? ZyntraColors.green : ZyntraColors.amber),
                  minHeight: 6,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => _toggleRegister(id),
            child: Container(
              width: double.infinity,
              height: 42,
              decoration: BoxDecoration(
                gradient: isRegistered ? null : const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]),
                color: isRegistered ? ZyntraColors.card : null,
                borderRadius: BorderRadius.circular(12),
                border: isRegistered ? Border.all(color: ZyntraColors.border) : null,
              ),
              child: Center(
                child: Text(
                  isRegistered ? 'Registered ✓' : 'Register to Donate',
                  style: GoogleFonts.inter(
                    fontSize: 13, fontWeight: FontWeight.w600,
                    color: isRegistered ? ZyntraColors.white70 : Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showCreateForm() {
    _titleCtrl.clear();
    _descCtrl.clear();
    _locationCtrl.clear();
    _targetUnitsCtrl.clear();
    setState(() => _selectedDate = null);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: ZyntraColors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Create Campaign', style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _titleCtrl,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  decoration: _inputDec('Campaign Title', Icons.title),
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _descCtrl,
                  maxLines: 3,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  decoration: _inputDec('Description', Icons.description),
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now().add(const Duration(days: 7)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                      builder: (ctx, child) => Theme(
                        data: ThemeData.dark().copyWith(
                          colorScheme: const ColorScheme.dark(primary: ZyntraColors.red, surface: ZyntraColors.surface),
                        ),
                        child: child!,
                      ),
                    );
                    if (picked != null) setState(() => _selectedDate = picked);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: ZyntraColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.calendar_today_rounded, color: ZyntraColors.red, size: 20),
                        const SizedBox(width: 10),
                        Text(
                          _selectedDate != null ? DateFormat('d MMM yyyy').format(_selectedDate!) : 'Select Date',
                          style: GoogleFonts.inter(color: _selectedDate != null ? Colors.white : ZyntraColors.white70, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _locationCtrl,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  decoration: _inputDec('Location', Icons.location_on_rounded),
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _targetUnitsCtrl,
                  keyboardType: TextInputType.number,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  decoration: _inputDec('Target Units', Icons.bloodtype_rounded),
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: _submitting ? null : _createCampaign,
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Center(
                      child: _submitting
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : Text('Create Campaign', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDec(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
      prefixIcon: Icon(icon, color: ZyntraColors.red, size: 20),
      filled: true,
      fillColor: ZyntraColors.card,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.red.withValues(alpha: 0.6))),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }

  Widget _shimmerCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20), border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5))),
      child: Row(
        children: [
          Container(width: 80, height: 80, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14))),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(height: 14, width: 140, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
            const SizedBox(height: 6),
            Container(height: 10, width: 100, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
            const SizedBox(height: 4),
            Container(height: 10, width: 120, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
          ])),
        ],
      ),
    ).animate(onPlay: (ctrl) => ctrl.repeat()).shimmer(duration: 1500.ms, color: ZyntraColors.border.withValues(alpha: 0.3));
  }
}
