import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';
import 'signin_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen>
    with SingleTickerProviderStateMixin {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _otpControllers = List.generate(6, (_) => TextEditingController());
  final _otpFocusNodes = List.generate(6, (_) => FocusNode());
  final _formKey = GlobalKey<FormState>();
  final _api = ApiService();
  bool _isLoading = false;
  bool _isOtpLoading = false;
  int _currentStep = 0;
  late AnimationController _animCtrl;
  late Animation<double> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _slideAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    for (final c in _otpControllers) {
      c.dispose();
    }
    for (final f in _otpFocusNodes) {
      f.dispose();
    }
    _animCtrl.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep == 0 && !_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    if (_currentStep == 0) {
      _api.sendOtp(_phoneController.text.trim()).then((res) {
        if (!mounted) return;
        setState(() {
          _isLoading = false;
          if (res['success'] == true) {
            _currentStep = 1;
            _animCtrl.forward(from: 0);
          } else {
            _showError(res['error'] ?? 'Failed to send OTP');
          }
        });
      });
    } else if (_currentStep == 1) {
      final otp = _otpControllers.map((c) => c.text).join();
      if (otp.length < 6) {
        _showError('Enter complete OTP');
        setState(() => _isLoading = false);
        return;
      }
      setState(() => _isOtpLoading = true);
      _api
          .register({
            'name': _nameController.text.trim(),
            'email': _emailController.text.trim(),
            'phone': _phoneController.text.trim(),
            'password': _passwordController.text,
            'otp': otp,
          })
          .then((res) {
            if (!mounted) return;
            setState(() {
              _isLoading = false;
              _isOtpLoading = false;
              if (res['success'] == true) {
                _currentStep = 2;
                _animCtrl.forward(from: 0);
              } else {
                _showError(res['error'] ?? 'Registration failed');
              }
            });
          });
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: ZyntraColors.red),
    );
  }

  void _onOtpChange(int index, String value) {
    if (value.isNotEmpty && index < 5) {
      _otpFocusNodes[index + 1].requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      body: Container(
        decoration: const BoxDecoration(gradient: ZyntraColors.gradientBg),
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 16),
              _buildProgressIndicator(),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: AnimatedBuilder(
                    animation: _slideAnim,
                    builder: (context, child) => SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.05, 0),
                        end: Offset.zero,
                      ).animate(_slideAnim),
                      child: FadeTransition(
                        opacity: _slideAnim,
                        child: child,
                      ),
                    ),
                    child: _currentStep == 0
                        ? _buildDetailsForm()
                        : _currentStep == 1
                            ? _buildOtpStep()
                            : _buildSuccessStep(),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Row(
        children: List.generate(3, (i) {
          final isActive = i <= _currentStep;
          return Expanded(
            child: Container(
              height: 4,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(2),
                gradient: isActive
                    ? ZyntraColors.gradientPrimary
                    : LinearGradient(
                        colors: [
                          ZyntraColors.border.withValues(alpha: 0.3),
                          ZyntraColors.border.withValues(alpha: 0.3),
                        ],
                      ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildDetailsForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          Text(
            'Create Account',
            style: GoogleFonts.poppins(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Fill in your details to get started',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: ZyntraColors.white70,
            ),
          ),
          const SizedBox(height: 28),
          _buildField('Full Name', Icons.person_outline, _nameController,
              (v) => v == null || v.isEmpty ? 'Required' : null),
          const SizedBox(height: 14),
          _buildField('Email', Icons.email_outlined, _emailController,
              (v) {
            if (v == null || v.isEmpty) return 'Required';
            if (!v.contains('@')) return 'Invalid email';
            return null;
          }),
          const SizedBox(height: 14),
          _buildField('Phone', Icons.phone_outlined, _phoneController,
              (v) {
            if (v == null || v.isEmpty) return 'Required';
            if (v.length < 10) return 'Invalid phone';
            return null;
          }, keyboardType: TextInputType.phone),
          const SizedBox(height: 14),
          _buildField('Password', Icons.lock_outlined, _passwordController,
              (v) {
            if (v == null || v.isEmpty) return 'Required';
            if (v.length < 6) return 'Min 6 characters';
            return null;
          }, obscure: true),
          const SizedBox(height: 14),
          _buildField('Confirm Password', Icons.lock_outlined,
              _confirmPasswordController, (v) {
            if (v == null || v.isEmpty) return 'Confirm your password';
            if (v != _passwordController.text) return 'Passwords do not match';
            return null;
          }, obscure: true),
          const SizedBox(height: 28),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _nextStep,
              style: ElevatedButton.styleFrom(
                backgroundColor: ZyntraColors.cyan,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: _isLoading
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.black,
                      ),
                    )
                  : Text(
                      'Send OTP',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Already have an account?',
                style: GoogleFonts.inter(color: ZyntraColors.white70),
              ),
              TextButton(
                onPressed: () => Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const SignInScreen()),
                ),
                child: Text(
                  'Sign In',
                  style: GoogleFonts.inter(
                    color: ZyntraColors.cyan,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOtpStep() {
    return Column(
      children: [
        const SizedBox(height: 24),
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: ZyntraColors.gradientPrimary,
          ),
          child: const Icon(
            Icons.smartphone_rounded,
            size: 36,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 20),
        Text(
          'Verify Phone',
          style: GoogleFonts.poppins(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Enter the 6-digit code sent to\n${_phoneController.text.trim()}',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: 14,
            color: ZyntraColors.white70,
          ),
        ),
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(6, (i) {
            return SizedBox(
              width: 48,
              height: 56,
              child: TextField(
                controller: _otpControllers[i],
                focusNode: _otpFocusNodes[i],
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
                keyboardType: TextInputType.number,
                maxLength: 1,
                decoration: InputDecoration(
                  counterText: '',
                  filled: true,
                  fillColor: ZyntraColors.surface.withValues(alpha: 0.7),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: ZyntraColors.border,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: ZyntraColors.border.withValues(alpha: 0.5),
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: ZyntraColors.cyan,
                      width: 2,
                    ),
                  ),
                ),
                onChanged: (v) => _onOtpChange(i, v),
              ),
            );
          }),
        ),
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _isOtpLoading ? null : _nextStep,
            style: ElevatedButton.styleFrom(
              backgroundColor: ZyntraColors.cyan,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: _isOtpLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.black,
                    ),
                  )
                : Text(
                    'Verify & Register',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () {
            setState(() => _currentStep = 0);
          },
          child: Text(
            'Change phone number',
            style: GoogleFonts.inter(color: ZyntraColors.white70),
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessStep() {
    return Column(
      children: [
        const SizedBox(height: 48),
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              colors: [ZyntraColors.green, Color(0xFF059669)],
            ),
          ),
          child: const Icon(
            Icons.check_rounded,
            size: 50,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'Registration Successful!',
          style: GoogleFonts.poppins(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Your account has been created.\nYou can now sign in.',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: 14,
            color: ZyntraColors.white70,
          ),
        ),
        const SizedBox(height: 36),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: () => Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (_) => const SignInScreen()),
              (route) => false,
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: ZyntraColors.cyan,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: Text(
              'Go to Sign In',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildField(
    String label,
    IconData icon,
    TextEditingController controller,
    String? Function(String?)? validator, {
    bool obscure = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: TextFormField(
          controller: controller,
          obscureText: obscure,
          keyboardType: keyboardType,
          style: GoogleFonts.inter(color: Colors.white),
          decoration: InputDecoration(
            labelText: label,
            labelStyle: GoogleFonts.inter(
              color: ZyntraColors.white70,
              fontSize: 14,
            ),
            prefixIcon: Icon(icon, color: ZyntraColors.cyan, size: 20),
            filled: true,
            fillColor: ZyntraColors.card.withValues(alpha: 0.4),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
          ),
          validator: validator,
        ),
      ),
    );
  }
}
