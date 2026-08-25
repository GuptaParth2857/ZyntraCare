import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class BloodRequestsScreen extends StatefulWidget {
  const BloodRequestsScreen({super.key});
  @override
  State<BloodRequestsScreen> createState() => _BloodRequestsScreenState();
}

class _BloodRequestsScreenState extends State<BloodRequestsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final _formKey = GlobalKey<FormState>();
  final _patientNameCtrl = TextEditingController();
  final _unitsCtrl = TextEditingController();
  final _hospitalCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _contactCtrl = TextEditingController();

  String _selectedBloodGroup = 'A+';
  String _selectedUrgency = 'Normal';

  bool _submitting = false;
  bool _loadingRequests = true;
  List<Map<String, dynamic>> _requests = [];

  final List<String> _bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  final List<String> _urgencies = ['Normal', 'Urgent', 'Emergency'];

  Color _bloodGroupColor(String bg) {
    switch (bg) {
      case 'O+': case 'O-': return ZyntraColors.red;
      case 'A+': case 'A-': return Colors.blue;
      case 'B+': case 'B-': return ZyntraColors.amber;
      case 'AB+': case 'AB-': return ZyntraColors.purple;
      default: return Colors.grey;
    }
  }

  Color _urgencyColor(String u) {
    switch (u) {
      case 'Emergency': return ZyntraColors.red;
      case 'Urgent': return ZyntraColors.amber;
      default: return ZyntraColors.green;
    }
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (_tabController.index == 1 && _requests.isEmpty) {
        _fetchRequests();
      }
    });
    _fetchRequests();
  }

  Future<void> _fetchRequests() async {
    setState(() => _loadingRequests = true);
    final api = ApiService();
    final res = await api.get('/api/blood-requests');
    if (mounted) {
      setState(() {
        if (res is List) {
          _requests = res.cast<Map<String, dynamic>>();
        } else if (res is Map && res['data'] != null) {
          _requests = (res['data'] as List).cast<Map<String, dynamic>>();
        } else {
          _requests = _mockRequests();
        }
        _loadingRequests = false;
      });
    }
  }

  List<Map<String, dynamic>> _mockRequests() {
    return [
      {'patientName': 'Ravi S.', 'bloodGroup': 'O+', 'hospital': 'AIIMS Delhi', 'city': 'Delhi', 'units': 2, 'urgency': 'Emergency', 'contact': '9876543210'},
      {'patientName': 'Priya M.', 'bloodGroup': 'B-', 'hospital': 'Fortis Mumbai', 'city': 'Mumbai', 'units': 1, 'urgency': 'Urgent', 'contact': '9876543211'},
      {'patientName': 'Ananya K.', 'bloodGroup': 'AB+', 'hospital': 'Apollo Chennai', 'city': 'Chennai', 'units': 3, 'urgency': 'Normal', 'contact': '9876543212'},
      {'patientName': 'Vikram J.', 'bloodGroup': 'A+', 'hospital': 'Max Gurgaon', 'city': 'Gurgaon', 'units': 2, 'urgency': 'Urgent', 'contact': '9876543213'},
      {'patientName': 'Neha W.', 'bloodGroup': 'O-', 'hospital': 'Medanta Lucknow', 'city': 'Lucknow', 'units': 1, 'urgency': 'Emergency', 'contact': '9876543214'},
    ];
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    final api = ApiService();
    final body = {
      'patientName': _patientNameCtrl.text,
      'bloodGroup': _selectedBloodGroup,
      'units': int.tryParse(_unitsCtrl.text) ?? 1,
      'hospital': _hospitalCtrl.text,
      'city': _cityCtrl.text,
      'contact': _contactCtrl.text,
      'urgency': _selectedUrgency,
    };
    final res = await api.post('/api/blood-requests', body: body);
    if (mounted) {
      setState(() => _submitting = false);
      if (res is Map && res['success'] == false) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res['error'] ?? 'Request failed'), backgroundColor: ZyntraColors.red));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Text('Blood request submitted successfully'), backgroundColor: ZyntraColors.green));
        _clearForm();
      }
    }
  }

  void _clearForm() {
    _patientNameCtrl.clear();
    _unitsCtrl.clear();
    _hospitalCtrl.clear();
    _cityCtrl.clear();
    _contactCtrl.clear();
    setState(() {
      _selectedBloodGroup = 'A+';
      _selectedUrgency = 'Normal';
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _patientNameCtrl.dispose();
    _unitsCtrl.dispose();
    _hospitalCtrl.dispose();
    _cityCtrl.dispose();
    _contactCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface,
        elevation: 0,
        title: Text('Blood Requests', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: ZyntraColors.red,
          labelColor: ZyntraColors.red,
          unselectedLabelColor: ZyntraColors.white70,
          labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600),
          tabs: const [
            Tab(text: 'Request Blood'),
            Tab(text: 'Donate Blood'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildRequestTab(),
          _buildDonateTab(),
        ],
      ),
    );
  }

  Widget _buildRequestTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _glassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.bloodtype, color: ZyntraColors.red, size: 28),
                      const SizedBox(width: 8),
                      Text('Request Blood', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('Fill the details below to request blood', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildTextField(_patientNameCtrl, 'Patient Name', Icons.person, validator: (v) => v == null || v.isEmpty ? 'Required' : null),
            const SizedBox(height: 12),
            _buildDropdown('Blood Group', _selectedBloodGroup, _bloodGroups, (v) => setState(() => _selectedBloodGroup = v!), Icons.bloodtype),
            const SizedBox(height: 12),
            _buildTextField(_unitsCtrl, 'Units Needed', Icons.numbers, keyboardType: TextInputType.number, validator: (v) => v == null || v.isEmpty ? 'Required' : null),
            const SizedBox(height: 12),
            _buildTextField(_hospitalCtrl, 'Hospital Name', Icons.local_hospital, validator: (v) => v == null || v.isEmpty ? 'Required' : null),
            const SizedBox(height: 12),
            _buildTextField(_cityCtrl, 'City', Icons.location_city, validator: (v) => v == null || v.isEmpty ? 'Required' : null),
            const SizedBox(height: 12),
            _buildTextField(_contactCtrl, 'Contact Number', Icons.phone, keyboardType: TextInputType.phone, validator: (v) => v == null || v.isEmpty ? 'Required' : null),
            const SizedBox(height: 12),
            _buildDropdown('Urgency', _selectedUrgency, _urgencies, (v) => setState(() => _selectedUrgency = v!), Icons.warning_amber),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: _submitting ? null : _submitRequest,
              child: Container(
                height: 52,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6))],
                ),
                child: Center(
                  child: _submitting
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                      : Text('Submit Request', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDonateTab() {
    if (_loadingRequests) {
      return ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        itemBuilder: (_, _) => _shimmerCard(),
      );
    }
    if (_requests.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 64, color: ZyntraColors.white70.withValues(alpha: 0.4)),
            const SizedBox(height: 12),
            Text('No blood requests at the moment', style: GoogleFonts.inter(color: ZyntraColors.white70)),
          ],
        ),
      );
    }
    return RefreshIndicator(
      color: ZyntraColors.red,
      onRefresh: _fetchRequests,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _requests.length,
        itemBuilder: (context, index) {
          final req = _requests[index];
          return _buildRequestCard(req);
        },
      ),
    );
  }

  Widget _buildRequestCard(Map<String, dynamic> req) {
    final bg = req['bloodGroup'] ?? 'O+';
    final urgency = req['urgency'] ?? 'Normal';
    final uColor = _urgencyColor(urgency);
    final bgColor = _bloodGroupColor(bg);
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: bgColor.withValues(alpha: 0.06), blurRadius: 16, spreadRadius: 0)],
      ),
      child: Row(
        children: [
          Container(
            width: 60, height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: bgColor.withValues(alpha: 0.15),
              border: Border.all(color: bgColor.withValues(alpha: 0.3), width: 2),
            ),
            child: Center(
              child: Text(bg, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w800, color: bgColor)),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(req['patientName'] ?? 'Anonymous', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.local_hospital, size: 13, color: ZyntraColors.white70),
                    const SizedBox(width: 4),
                    Expanded(child: Text('${req['hospital'] ?? ''}', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70), overflow: TextOverflow.ellipsis)),
                  ],
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Icon(Icons.location_on, size: 13, color: ZyntraColors.white70),
                    const SizedBox(width: 4),
                    Text('${req['city'] ?? ''}', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
                    const SizedBox(width: 12),
                    Text('${req['units'] ?? 1} unit(s)', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.cyan)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: uColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                child: Text(urgency, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600, color: uColor)),
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Donation offer sent for ${req['patientName']}'), backgroundColor: ZyntraColors.green),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text('I Can Donate', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(TextEditingController ctrl, String label, IconData icon, {TextInputType? keyboardType, String? Function(String?)? validator}) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboardType,
      validator: validator,
      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
        prefixIcon: Icon(icon, color: ZyntraColors.red, size: 20),
        filled: true,
        fillColor: ZyntraColors.card,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.red.withValues(alpha: 0.6))),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildDropdown(String label, String value, List<String> items, ValueChanged<String?> onChanged, IconData icon) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      items: items.map((e) => DropdownMenuItem(value: e, child: Text(e, style: GoogleFonts.inter(color: Colors.white)))).toList(),
      onChanged: onChanged,
      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
      dropdownColor: ZyntraColors.card,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
        prefixIcon: Icon(icon, color: ZyntraColors.red, size: 20),
        filled: true,
        fillColor: ZyntraColors.card,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.red.withValues(alpha: 0.6))),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _glassCard({required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.4)),
        boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: 0.06), blurRadius: 16, spreadRadius: 0)],
      ),
      child: child,
    );
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
          Container(width: 60, height: 60, decoration: const BoxDecoration(shape: BoxShape.circle, color: ZyntraColors.surface)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(height: 14, width: 120, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
                const SizedBox(height: 8),
                Container(height: 10, width: 160, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
                const SizedBox(height: 4),
                Container(height: 10, width: 100, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
              ],
            ),
          ),
        ],
      ),
    ).animate(onPlay: (ctrl) => ctrl.repeat()).shimmer(duration: 1500.ms, color: ZyntraColors.border.withValues(alpha: 0.3));
  }
}
