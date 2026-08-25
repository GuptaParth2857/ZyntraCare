import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class DoctorRegisterScreen extends StatefulWidget {
  const DoctorRegisterScreen({super.key});
  @override State<DoctorRegisterScreen> createState() => _DoctorRegisterScreenState();
}

class _DoctorRegisterScreenState extends State<DoctorRegisterScreen> {
  int _currentStep = 0;
  bool _loading = false;
  bool _submitted = false;
  bool _acceptTerms = false;
  final _api = ApiService();

  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _licenseCtrl = TextEditingController();
  final _experienceCtrl = TextEditingController();
  final _qualificationsCtrl = TextEditingController();
  final _clinicCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _pincodeCtrl = TextEditingController();
  final _feeCtrl = TextEditingController();

  String _specialty = 'Cardiology';
  final _specialties = [
    'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics',
    'Neurology', 'Psychiatry', 'Gynecology', 'ENT',
    'Ophthalmology', 'General Medicine', 'Surgery', 'Dentistry',
  ];

  final _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  final _selectedDays = <String>{'Mon', 'Tue', 'Wed', 'Thu', 'Fri'};
  bool _homeVisit = false;

  TimeOfDay _startTime = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 17, minute: 0);

  final _stepLabels = ['Personal', 'Professional', 'Practice', 'Services', 'Documents'];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _licenseCtrl.dispose();
    _experienceCtrl.dispose();
    _qualificationsCtrl.dispose();
    _clinicCtrl.dispose();
    _addressCtrl.dispose();
    _cityCtrl.dispose();
    _pincodeCtrl.dispose();
    _feeCtrl.dispose();
    super.dispose();
  }

  bool get _canProceed {
    switch (_currentStep) {
      case 0: return _nameCtrl.text.trim().isNotEmpty && _emailCtrl.text.trim().isNotEmpty && _phoneCtrl.text.trim().isNotEmpty && _passwordCtrl.text.trim().isNotEmpty;
      case 1: return _licenseCtrl.text.trim().isNotEmpty && _experienceCtrl.text.trim().isNotEmpty && _qualificationsCtrl.text.trim().isNotEmpty;
      case 2: return _clinicCtrl.text.trim().isNotEmpty && _addressCtrl.text.trim().isNotEmpty && _cityCtrl.text.trim().isNotEmpty && _pincodeCtrl.text.trim().isNotEmpty;
      case 3: return _selectedDays.isNotEmpty && _feeCtrl.text.trim().isNotEmpty;
      case 4: return _acceptTerms;
      default: return false;
    }
  }

  void _next() {
    if (_currentStep < 4 && _canProceed) {
      setState(() => _currentStep++);
    }
  }

  void _back() {
    if (_currentStep > 0) setState(() => _currentStep--);
  }

  Future<void> _submit() async {
    if (!_acceptTerms) return;
    setState(() => _loading = true);
    try {
      final data = {
        'name': _nameCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'password': _passwordCtrl.text.trim(),
        'specialty': _specialty,
        'licenseNumber': _licenseCtrl.text.trim(),
        'experience': _experienceCtrl.text.trim(),
        'qualifications': _qualificationsCtrl.text.trim(),
        'clinic': _clinicCtrl.text.trim(),
        'address': _addressCtrl.text.trim(),
        'city': _cityCtrl.text.trim(),
        'pincode': _pincodeCtrl.text.trim(),
        'fee': _feeCtrl.text.trim(),
        'availableDays': _selectedDays.join(','),
        'startTime': '${_startTime.hour.toString().padLeft(2, '0')}:${_startTime.minute.toString().padLeft(2, '0')}',
        'endTime': '${_endTime.hour.toString().padLeft(2, '0')}:${_endTime.minute.toString().padLeft(2, '0')}',
        'homeVisit': _homeVisit,
      };
      await _api.post('/api/doctors/register', body: data);
      if (mounted) setState(() => _submitted = true);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Registration failed. Please try again.', style: GoogleFonts.inter(color: Colors.white)),
          backgroundColor: ZyntraColors.red, behavior: SnackBarBehavior.floating,
        ));
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _pickTime(bool isStart) async {
    final current = isStart ? _startTime : _endTime;
    final picked = await showTimePicker(
      context: context,
      initialTime: current,
      builder: (ctx, child) => Theme(data: Theme.of(ctx).copyWith(
        colorScheme: const ColorScheme.dark(primary: ZyntraColors.cyan, surface: ZyntraColors.card),
      ), child: child!),
    );
    if (picked != null) {
      setState(() {
        if (isStart) _startTime = picked; else _endTime = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) return _buildSuccessScreen();
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildStepIndicator(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
                child: _buildStepContent(),
              ),
            ),
            _buildBottomNav(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight)),
      child: Row(
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
          Text('Doctor Registration', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
      color: ZyntraColors.card,
      child: Row(
        children: List.generate(_stepLabels.length, (i) {
          final isActive = i == _currentStep;
          final isDone = i < _currentStep;
          return Expanded(
            child: GestureDetector(
              onTap: i <= _currentStep ? () => setState(() => _currentStep = i) : null,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      if (i > 0)
                        Expanded(
                          child: Container(
                            height: 2,
                            color: isDone ? ZyntraColors.cyan : ZyntraColors.border,
                          ),
                        ),
                      Container(
                        width: 28, height: 28,
                        decoration: BoxDecoration(
                          color: isDone ? ZyntraColors.cyan : (isActive ? ZyntraColors.purple : ZyntraColors.border),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: isDone
                              ? const Icon(Icons.check_rounded, color: Colors.white, size: 16)
                              : Text('${i + 1}', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                        ),
                      ),
                      if (i < _stepLabels.length - 1)
                        Expanded(
                          child: Container(
                            height: 2,
                            color: isDone ? ZyntraColors.cyan : ZyntraColors.border,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(_stepLabels[i], style: GoogleFonts.inter(
                    color: isActive ? ZyntraColors.cyan : ZyntraColors.white40,
                    fontSize: 9, fontWeight: FontWeight.w500,
                  )),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0: return _buildPersonalInfo();
      case 1: return _buildProfessionalDetails();
      case 2: return _buildPracticeInfo();
      case 3: return _buildServicesAvailability();
      case 4: return _buildDocuments();
      default: return const SizedBox();
    }
  }

  Widget _buildPersonalInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Personal Information', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        Text('Enter your basic personal details', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
        const SizedBox(height: 24),
        _buildField('Full Name', _nameCtrl, Icons.person_rounded, hint: 'Dr. John Doe'),
        const SizedBox(height: 16),
        _buildField('Email Address', _emailCtrl, Icons.email_rounded, hint: 'doctor@hospital.com', keyboardType: TextInputType.emailAddress),
        const SizedBox(height: 16),
        _buildField('Phone Number', _phoneCtrl, Icons.phone_rounded, hint: '+91 98765 43210', keyboardType: TextInputType.phone),
        const SizedBox(height: 16),
        _buildField('Password', _passwordCtrl, Icons.lock_rounded, hint: 'Minimum 8 characters', obscure: true),
      ],
    );
  }

  Widget _buildProfessionalDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Professional Details', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        Text('Your medical credentials and specialization', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
        const SizedBox(height: 24),
        Text('Specialty', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _specialty,
              dropdownColor: ZyntraColors.card,
              isExpanded: true,
              style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
              items: _specialties.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
              onChanged: (v) => setState(() => _specialty = v!),
            ),
          ),
        ),
        const SizedBox(height: 16),
        _buildField('License Number', _licenseCtrl, Icons.badge_rounded, hint: 'MMC-12345'),
        const SizedBox(height: 16),
        _buildField('Years of Experience', _experienceCtrl, Icons.timeline_rounded, hint: '10', keyboardType: TextInputType.number),
        const SizedBox(height: 16),
        _buildField('Qualifications', _qualificationsCtrl, Icons.school_rounded, hint: 'MBBS, MD, DM Cardiology', maxLines: 2),
      ],
    );
  }

  Widget _buildPracticeInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Practice Information', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        Text('Where do you practice?', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
        const SizedBox(height: 24),
        _buildField('Clinic / Hospital Name', _clinicCtrl, Icons.local_hospital_rounded, hint: 'City Hospital'),
        const SizedBox(height: 16),
        _buildField('Clinic Address', _addressCtrl, Icons.location_on_rounded, hint: '123, Main Street, Area', maxLines: 2),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: _buildField('City', _cityCtrl, Icons.location_city_rounded, hint: 'Mumbai')),
            const SizedBox(width: 12),
            Expanded(child: _buildField('Pincode', _pincodeCtrl, Icons.pin_drop_rounded, hint: '400001', keyboardType: TextInputType.number)),
          ],
        ),
      ],
    );
  }

  Widget _buildServicesAvailability() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Services & Availability', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        Text('Set your consultation services and availability', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
        const SizedBox(height: 24),
        _buildField('Consultation Fee (₹)', _feeCtrl, Icons.currency_rupee_rounded, hint: '500', keyboardType: TextInputType.number),
        const SizedBox(height: 20),
        Text('Available Days', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8, runSpacing: 8,
          children: _days.map((d) {
            final sel = _selectedDays.contains(d);
            return GestureDetector(
              onTap: () => setState(() {
                if (sel) { _selectedDays.remove(d); } else { _selectedDays.add(d); }
              }),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                decoration: BoxDecoration(
                  color: sel ? ZyntraColors.cyan.withValues(alpha: 0.15) : ZyntraColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: sel ? ZyntraColors.cyan : ZyntraColors.border),
                ),
                child: Text(d, style: GoogleFonts.inter(
                  color: sel ? ZyntraColors.cyan : ZyntraColors.white70,
                  fontSize: 13, fontWeight: FontWeight.w600,
                )),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 20),
        Text('Available Time Slots', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => _pickTime(true),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
                  child: Row(
                    children: [
                      const Icon(Icons.access_time_rounded, color: ZyntraColors.cyan, size: 18),
                      const SizedBox(width: 8),
                      Text('Start: ${_startTime.format(context)}', style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: GestureDetector(
                onTap: () => _pickTime(false),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
                  child: Row(
                    children: [
                      const Icon(Icons.access_time_rounded, color: ZyntraColors.red, size: 18),
                      const SizedBox(width: 8),
                      Text('End: ${_endTime.format(context)}', style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
          child: Row(
            children: [
              const Icon(Icons.home_rounded, color: ZyntraColors.white70, size: 20),
              const SizedBox(width: 12),
              Expanded(child: Text('Home Visit Available', style: GoogleFonts.inter(color: Colors.white, fontSize: 14))),
              Switch(
                value: _homeVisit,
                activeColor: ZyntraColors.cyan,
                onChanged: (v) => setState(() => _homeVisit = v),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDocuments() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Documents', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        Text('Upload your credentials for verification', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
        const SizedBox(height: 24),
        _buildUploadCard(Icons.badge_rounded, 'Medical License', 'Upload your medical license certificate', ZyntraColors.cyan),
        const SizedBox(height: 12),
        _buildUploadCard(Icons.school_rounded, 'Degree Certificate', 'Upload your MBBS/degree certificate', ZyntraColors.purple),
        const SizedBox(height: 12),
        _buildUploadCard(Icons.photo_rounded, 'Profile Photo', 'Upload a recent passport-size photo', ZyntraColors.green),
        const SizedBox(height: 24),
        GestureDetector(
          onTap: () => setState(() => _acceptTerms = !_acceptTerms),
          child: Row(
            children: [
              Container(
                width: 22, height: 22,
                decoration: BoxDecoration(
                  color: _acceptTerms ? ZyntraColors.cyan : Colors.transparent,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: _acceptTerms ? ZyntraColors.cyan : ZyntraColors.border),
                ),
                child: _acceptTerms ? const Icon(Icons.check_rounded, color: Colors.white, size: 16) : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'I confirm that all information provided is accurate and I agree to the Terms of Service',
                  style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12, height: 1.4),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildUploadCard(IconData icon, String title, String subtitle, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border, strokeAlign: BorderSide.strokeAlignInside),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(subtitle, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text('Upload', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideX(begin: 0.05, end: 0);
  }

  Widget _buildField(String label, TextEditingController ctrl, IconData icon, {String? hint, bool obscure = false, TextInputType? keyboardType, int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: ZyntraColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: TextField(
            controller: ctrl,
            obscureText: obscure,
            keyboardType: keyboardType,
            maxLines: maxLines,
            style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 14),
              prefixIcon: Icon(icon, color: ZyntraColors.white40, size: 20),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomNav() {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 16),
      decoration: BoxDecoration(color: ZyntraColors.card, border: Border(top: BorderSide(color: ZyntraColors.border))),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: GestureDetector(
                onTap: _back,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
                  child: Center(child: Text('Back', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600))),
                ),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: 12),
          Expanded(
            flex: _currentStep == 0 ? 1 : 2,
            child: GestureDetector(
              onTap: _currentStep == 4 ? _submit : (_canProceed ? _next : null),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  gradient: _canProceed || _currentStep == 4
                      ? const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple])
                      : LinearGradient(colors: [ZyntraColors.border, ZyntraColors.border]),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: _canProceed
                      ? [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))]
                      : null,
                ),
                child: Center(
                  child: _loading
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(_currentStep == 4 ? 'Submit for Verification' : 'Next', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessScreen() {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 100, height: 100,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.green, ZyntraColors.teal]),
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: ZyntraColors.green.withValues(alpha: 0.3), blurRadius: 30)],
                  ),
                  child: const Icon(Icons.check_rounded, color: Colors.white, size: 56),
                ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
                const SizedBox(height: 32),
                Text('Registration Submitted!', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                Text('Your application has been submitted for verification.', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14), textAlign: TextAlign.center),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  decoration: BoxDecoration(
                    color: ZyntraColors.amber.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: ZyntraColors.amber.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.hourglass_bottom_rounded, color: ZyntraColors.amber, size: 22),
                      const SizedBox(width: 10),
                      Text('Verification Pending', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 16, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(child: Text('Back to Home', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600))),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
