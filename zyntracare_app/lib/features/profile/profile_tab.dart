import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});
  @override State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  bool _loggedIn = false;
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _login() async {
    if (_emailCtrl.text.isEmpty || _passCtrl.text.isEmpty) return;
    setState(() => _loading = true);
    final res = await apiService.login(_emailCtrl.text, _passCtrl.text);
    if (mounted) {
      setState(() => _loading = false);
      if (res != null && res['success'] == true) {
        setState(() => _loggedIn = true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Login failed - Invalid credentials', style: GoogleFonts.inter(color: Colors.white)),
          backgroundColor: ZyntraColors.red,
          behavior: SnackBarBehavior.floating,
        ));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: _loggedIn ? _buildProfile() : _buildLogin(),
    );
  }

  Widget _buildLogin() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            width: 90, height: 90,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(30),
              boxShadow: [BoxShadow(color: ZyntraColors.cyan.withOpacity(0.3), blurRadius: 24, offset: const Offset(0, 8))],
            ),
            child: const Icon(Icons.favorite_rounded, color: Colors.white, size: 46),
          ).animate().scale(delay: 100.ms, duration: 400.ms, curve: Curves.easeOutBack),
          
          const SizedBox(height: 24),
          Text('Welcome to ZyntraCare', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2, end: 0),
          const SizedBox(height: 8),
          Text('Sign in to access your medical records', style: GoogleFonts.inter(color: ZyntraColors.white70)).animate().fadeIn(delay: 300.ms),
          const SizedBox(height: 40),

          _buildField(Icons.email_rounded, 'Email Address', _emailCtrl, false).animate().fadeIn(delay: 400.ms).slideX(begin: 0.1, end: 0),
          const SizedBox(height: 16),
          _buildField(Icons.lock_rounded, 'Password', _passCtrl, true).animate().fadeIn(delay: 500.ms).slideX(begin: 0.1, end: 0),
          
          const SizedBox(height: 32),
          GestureDetector(
            onTap: _loading ? null : _login,
            child: Container(
              width: double.infinity,
              height: 56,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 4))],
              ),
              child: Center(
                child: _loading 
                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text('Sign In', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.2, end: 0),
        ]),
      ),
    );
  }

  Widget _buildField(IconData icon, String hint, TextEditingController ctrl, bool obs) {
    return TextField(
      controller: ctrl,
      obscureText: obs,
      style: GoogleFonts.inter(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
        prefixIcon: Icon(icon, color: ZyntraColors.cyan),
        filled: true,
        fillColor: ZyntraColors.surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: ZyntraColors.cyan, width: 1.5)),
      ),
    );
  }

  Widget _buildProfile() {
    return Column(children: [
      Padding(
        padding: const EdgeInsets.all(24),
        child: Row(children: [
          Container(
            width: 70, height: 70,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Center(child: Text('JD', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold))),
          ),
          const SizedBox(width: 20),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('John Doe', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
            Text('john.doe@example.com', style: GoogleFonts.inter(color: ZyntraColors.white70)),
          ])),
          IconButton(icon: const Icon(Icons.edit_rounded, color: ZyntraColors.white70), onPressed: () {}),
        ]),
      ),
      
      Expanded(child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
        children: [
          _profileCard([
            _tile(Icons.history_rounded, 'Appointment History', ZyntraColors.cyan),
            _tile(Icons.folder_rounded, 'Medical Records', ZyntraColors.teal),
            _tile(Icons.monitor_heart_rounded, 'My Health Stats', ZyntraColors.red),
          ]),
          const SizedBox(height: 16),
          _profileCard([
            _tile(Icons.payment_rounded, 'Payment Methods', ZyntraColors.green),
            _tile(Icons.settings_rounded, 'Settings', ZyntraColors.white70),
            _tile(Icons.help_outline_rounded, 'Help & Support', ZyntraColors.amber),
          ]),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => setState(() => _loggedIn = false),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(20), border: Border.all(color: ZyntraColors.red.withOpacity(0.3))),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Icon(Icons.logout_rounded, color: ZyntraColors.red),
                const SizedBox(width: 8),
                Text('Sign Out', style: GoogleFonts.inter(color: ZyntraColors.red, fontWeight: FontWeight.w600)),
              ]),
            ),
          ),
        ],
      )),
    ]);
  }

  Widget _profileCard(List<Widget> children) => Container(
    decoration: BoxDecoration(
      color: ZyntraColors.surface,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: ZyntraColors.border),
    ),
    child: Column(children: children),
  );

  Widget _tile(IconData icon, String label, Color color) => ListTile(
    leading: Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
      child: Icon(icon, color: color, size: 20),
    ),
    title: Text(label, style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w500)),
    trailing: const Icon(Icons.chevron_right_rounded, color: ZyntraColors.white40),
    onTap: () {},
  );
}
