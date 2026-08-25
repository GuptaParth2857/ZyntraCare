import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:zyntracare/core/theme.dart';

class SetupAdminScreen extends StatefulWidget {
  const SetupAdminScreen({super.key});
  @override State<SetupAdminScreen> createState() => _SetupAdminScreenState();
}

class _SetupAdminScreenState extends State<SetupAdminScreen> {
  int _currentStep = 0;
  bool _completed = false;

  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  final _orgNameCtrl = TextEditingController();
  final _orgAddressCtrl = TextEditingController();
  final _orgPhoneCtrl = TextEditingController();
  final _staffNameCtrl = TextEditingController();
  final _staffRoleCtrl = TextEditingController();
  final _staffEmailCtrl = TextEditingController();
  final List<Map<String, String>> _staffMembers = [];
  final List<String> _selectedServices = [];
  final _apiKeyCtrl = TextEditingController();
  final _paymentKeyCtrl = TextEditingController();
  final _smsKeyCtrl = TextEditingController();

  final _orgTypes = ['Hospital', 'Clinic', 'Diagnostic Center', 'Pharmacy', 'Nursing Home'];
  String? _selectedOrgType;
  final _budgetRanges = ['₹25K-₹1L', '₹1L-₹5L', '₹5L-₹10L', '₹10L+'];
  String? _selectedBudget;

  final _steps = ['Account', 'Organization', 'Team', 'Services', 'Integration'];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmPassCtrl.dispose();
    _orgNameCtrl.dispose();
    _orgAddressCtrl.dispose();
    _orgPhoneCtrl.dispose();
    _staffNameCtrl.dispose();
    _staffRoleCtrl.dispose();
    _staffEmailCtrl.dispose();
    _apiKeyCtrl.dispose();
    _paymentKeyCtrl.dispose();
    _smsKeyCtrl.dispose();
    super.dispose();
  }

  bool get _canProceed {
    switch (_currentStep) {
      case 0:
        return _nameCtrl.text.isNotEmpty &&
               _emailCtrl.text.isNotEmpty &&
               _passCtrl.text.isNotEmpty &&
               _passCtrl.text == _confirmPassCtrl.text;
      case 1:
        return _orgNameCtrl.text.isNotEmpty && _selectedOrgType != null && _orgPhoneCtrl.text.isNotEmpty;
      case 2:
        return true;
      case 3:
        return _selectedServices.isNotEmpty;
      case 4:
        return true;
      default:
        return true;
    }
  }

  void _next() {
    if (_currentStep < _steps.length - 1) {
      setState(() => _currentStep++);
    } else {
      setState(() => _completed = true);
    }
  }

  void _back() {
    if (_currentStep > 0) setState(() => _currentStep--);
  }

  void _addStaff() {
    if (_staffNameCtrl.text.isNotEmpty && _staffRoleCtrl.text.isNotEmpty) {
      setState(() {
        _staffMembers.add({
          'name': _staffNameCtrl.text,
          'role': _staffRoleCtrl.text,
          'email': _staffEmailCtrl.text,
        });
        _staffNameCtrl.clear();
        _staffRoleCtrl.clear();
        _staffEmailCtrl.clear();
      });
    }
  }

  final _serviceOptions = [
    {'name': 'OPD', 'icon': Icons.person_search_rounded},
    {'name': 'IPD', 'icon': Icons.hotel_rounded},
    {'name': 'Pharmacy', 'icon': Icons.medication_rounded},
    {'name': 'Lab', 'icon': Icons.science_rounded},
    {'name': 'Ambulance', 'icon': Icons.airport_shuttle_rounded},
  ];

  @override
  Widget build(BuildContext context) {
    if (_completed) return _buildCompletionScreen();
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        title: Text('Admin Setup', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight))),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(children: [
        _buildStepIndicator(),
        _buildProgressBar(),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: _buildStepContent(),
          ),
        ),
        _buildNavigation(),
      ]),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Row(
        children: List.generate(_steps.length, (i) {
          final isActive = i <= _currentStep;
          final isCurrent = i == _currentStep;
          return Expanded(child: Row(
            children: [
              if (i > 0) Expanded(child: Container(height: 2, color: isActive ? ZyntraColors.cyan : ZyntraColors.border)),
              Container(
                width: 32, height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isCurrent ? ZyntraColors.cyan : isActive ? ZyntraColors.green : ZyntraColors.border,
                ),
                child: Center(child: Text('${i + 1}', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: isActive ? Colors.white : ZyntraColors.white70))),
              ),
              if (i < _steps.length - 1) Expanded(child: Container(height: 2, color: isActive ? ZyntraColors.cyan : ZyntraColors.border)),
            ],
          ));
        }),
      ),
    );
  }

  Widget _buildProgressBar() {
    final progress = (_currentStep + 1) / _steps.length;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: LinearProgressIndicator(
          value: progress,
          backgroundColor: ZyntraColors.border,
          valueColor: const AlwaysStoppedAnimation<Color>(ZyntraColors.cyan),
          minHeight: 4,
        ),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0: return _step1Account();
      case 1: return _step2Organization();
      case 2: return _step3Team();
      case 3: return _step4Services();
      case 4: return _step5Integration();
      default: return const SizedBox();
    }
  }

  Widget _step1Account() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Admin Account', style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
      const SizedBox(height: 8),
      Text('Set up your administrator credentials', style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70)),
      const SizedBox(height: 24),
      _buildTextField(_nameCtrl, 'Full Name', Icons.person_rounded),
      const SizedBox(height: 16),
      _buildTextField(_emailCtrl, 'Email Address', Icons.email_rounded, keyboardType: TextInputType.emailAddress),
      const SizedBox(height: 16),
      _buildTextField(_passCtrl, 'Password', Icons.lock_rounded, obscure: true),
      const SizedBox(height: 16),
      _buildTextField(_confirmPassCtrl, 'Confirm Password', Icons.lock_rounded, obscure: true),
      if (_confirmPassCtrl.text.isNotEmpty && _passCtrl.text != _confirmPassCtrl.text)
        Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Text('Passwords do not match', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.red)),
        ),
    ]).animate().fadeIn(duration: 300.ms).slideX(begin: 0.1, end: 0);
  }

  Widget _step2Organization() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Organization Info', style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
      const SizedBox(height: 8),
      Text('Tell us about your healthcare facility', style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70)),
      const SizedBox(height: 24),
      _buildTextField(_orgNameCtrl, 'Hospital/Clinic Name', Icons.business_rounded),
      const SizedBox(height: 16),
      Text('Organization Type', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: ZyntraColors.white70)),
      const SizedBox(height: 8),
      Wrap(spacing: 8, runSpacing: 8, children: _orgTypes.map((t) => GestureDetector(
        onTap: () => setState(() => _selectedOrgType = t),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: _selectedOrgType == t ? ZyntraColors.cyan.withValues(alpha: 0.15) : ZyntraColors.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _selectedOrgType == t ? ZyntraColors.cyan : ZyntraColors.border),
          ),
          child: Text(t, style: GoogleFonts.inter(fontSize: 13, color: _selectedOrgType == t ? ZyntraColors.cyan : ZyntraColors.white70)),
        ),
      )).toList()),
      const SizedBox(height: 16),
      _buildTextField(_orgAddressCtrl, 'Address', Icons.location_on_rounded, maxLines: 2),
      const SizedBox(height: 16),
      _buildTextField(_orgPhoneCtrl, 'Phone Number', Icons.phone_rounded, keyboardType: TextInputType.phone),
    ]).animate().fadeIn(duration: 300.ms).slideX(begin: 0.1, end: 0);
  }

  Widget _step3Team() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Team Setup', style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
      const SizedBox(height: 8),
      Text('Add staff members to your organization', style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70)),
      const SizedBox(height: 20),
      _buildTextField(_staffNameCtrl, 'Staff Name', Icons.person_rounded),
      const SizedBox(height: 12),
      _buildTextField(_staffRoleCtrl, 'Role (e.g., Doctor, Nurse)', Icons.work_rounded),
      const SizedBox(height: 12),
      _buildTextField(_staffEmailCtrl, 'Email (optional)', Icons.email_rounded),
      const SizedBox(height: 12),
      SizedBox(
        width: double.infinity, height: 44,
        child: ElevatedButton.icon(
          onPressed: _addStaff,
          icon: const Icon(Icons.person_add_rounded, size: 18),
          label: Text('Add Staff Member', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          style: ElevatedButton.styleFrom(
            backgroundColor: ZyntraColors.purple,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            elevation: 0,
          ),
        ),
      ),
      const SizedBox(height: 16),
      if (_staffMembers.isNotEmpty) ...[
        Text('${_staffMembers.length} staff added', style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.green, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        ..._staffMembers.asMap().entries.map((e) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
          child: Row(children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(color: ZyntraColors.purple.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: Center(child: Text(e.value['name']![0].toUpperCase(), style: GoogleFonts.inter(color: ZyntraColors.purple, fontWeight: FontWeight.w700))),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(e.value['name'] ?? '', style: GoogleFonts.inter(fontSize: 14, color: Colors.white)),
              Text(e.value['role'] ?? '', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
            ])),
            GestureDetector(
              onTap: () => setState(() => _staffMembers.removeAt(e.key)),
              child: Icon(Icons.close, color: ZyntraColors.red, size: 18),
            ),
          ]),
        )),
      ],
    ]).animate().fadeIn(duration: 300.ms).slideX(begin: 0.1, end: 0);
  }

  Widget _step4Services() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Select Services', style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
      const SizedBox(height: 8),
      Text('Choose the services your facility offers', style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70)),
      const SizedBox(height: 24),
      ..._serviceOptions.map((svc) {
        final isSelected = _selectedServices.contains(svc['name']);
        return GestureDetector(
          onTap: () => setState(() {
            if (isSelected) { _selectedServices.remove(svc['name']); }
            else { _selectedServices.add(svc['name'] as String); }
          }),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isSelected ? ZyntraColors.cyan.withValues(alpha: 0.08) : ZyntraColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isSelected ? ZyntraColors.cyan : ZyntraColors.border, width: isSelected ? 1.5 : 1),
            ),
            child: Row(children: [
              Icon(svc['icon'] as IconData, color: isSelected ? ZyntraColors.cyan : ZyntraColors.white70, size: 28),
              const SizedBox(width: 16),
              Expanded(child: Text(svc['name'] as String, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500, color: isSelected ? Colors.white : ZyntraColors.white70))),
              if (isSelected) Icon(Icons.check_circle, color: ZyntraColors.cyan, size: 24),
            ]),
          ),
        );
      }),
    ]).animate().fadeIn(duration: 300.ms).slideX(begin: 0.1, end: 0);
  }

  Widget _step5Integration() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Integration', style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
      const SizedBox(height: 8),
      Text('Configure API keys and gateways', style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70)),
      const SizedBox(height: 24),
      _buildTextField(_apiKeyCtrl, 'API Key', Icons.vpn_key_rounded),
      const SizedBox(height: 16),
      _buildTextField(_paymentKeyCtrl, 'Payment Gateway Key', Icons.payment_rounded),
      const SizedBox(height: 16),
      _buildTextField(_smsKeyCtrl, 'SMS Gateway Key', Icons.sms_rounded),
      const SizedBox(height: 24),
      Text('Budget Range', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: ZyntraColors.white70)),
      const SizedBox(height: 8),
      Wrap(spacing: 8, runSpacing: 8, children: _budgetRanges.map((b) => GestureDetector(
        onTap: () => setState(() => _selectedBudget = b),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: _selectedBudget == b ? ZyntraColors.cyan.withValues(alpha: 0.15) : ZyntraColors.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _selectedBudget == b ? ZyntraColors.cyan : ZyntraColors.border),
          ),
          child: Text(b, style: GoogleFonts.inter(fontSize: 13, color: _selectedBudget == b ? ZyntraColors.cyan : ZyntraColors.white70)),
        ),
      )).toList()),
    ]).animate().fadeIn(duration: 300.ms).slideX(begin: 0.1, end: 0);
  }

  Widget _buildTextField(TextEditingController ctrl, String hint, IconData icon, {bool obscure = false, TextInputType? keyboardType, int maxLines = 1}) {
    return TextField(
      controller: ctrl,
      obscureText: obscure,
      keyboardType: keyboardType,
      maxLines: maxLines,
      style: GoogleFonts.inter(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.5)),
        prefixIcon: Icon(icon, color: ZyntraColors.white70),
        filled: true,
        fillColor: ZyntraColors.surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: ZyntraColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: ZyntraColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: ZyntraColors.cyan)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      onChanged: (_) => setState(() {}),
    );
  }

  Widget _buildNavigation() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.surface,
        border: Border(top: BorderSide(color: ZyntraColors.border)),
      ),
      child: Row(children: [
        if (_currentStep > 0)
          Expanded(
            child: SizedBox(
              height: 48,
              child: OutlinedButton(
                onPressed: _back,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: ZyntraColors.border),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  foregroundColor: Colors.white,
                ),
                child: Text('Back', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
              ),
            ),
          ),
        if (_currentStep > 0) const SizedBox(width: 12),
        Expanded(
          flex: 2,
          child: SizedBox(
            height: 48,
            child: ElevatedButton(
              onPressed: _canProceed ? _next : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: _canProceed ? ZyntraColors.cyan : ZyntraColors.border,
                disabledBackgroundColor: ZyntraColors.border,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: Text(
                _currentStep < _steps.length - 1 ? 'Next' : 'Complete Setup',
                style: GoogleFonts.inter(color: _canProceed ? ZyntraColors.bg : ZyntraColors.white70, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ),
      ]),
    );
  }

  Widget _buildCompletionScreen() {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        title: Text('Setup Complete', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight))),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('🎉 🎊 🎉', style: TextStyle(fontSize: 72)),
          const SizedBox(height: 24),
          Text('Setup Complete!', style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.white)),
          const SizedBox(height: 8),
          Text('Your organization is ready to go', style: GoogleFonts.inter(fontSize: 14, color: ZyntraColors.white70)),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(20),
            margin: const EdgeInsets.symmetric(horizontal: 40),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.3)),
            ),
            child: Column(children: [
              Icon(Icons.check_circle, color: ZyntraColors.green, size: 48),
              const SizedBox(height: 12),
              Text(_orgNameCtrl.text, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
              Text('${_staffMembers.length} staff members • ${_selectedServices.length} services', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
            ]),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: 200, height: 50,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: ZyntraColors.cyan,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: Text('Go to Dashboard', style: GoogleFonts.inter(color: ZyntraColors.bg, fontWeight: FontWeight.w700)),
            ),
          ),
        ]),
      ).animate().fadeIn(duration: 600.ms).scaleXY(begin: 0.8, end: 1, curve: Curves.elasticOut),
    );
  }
}
