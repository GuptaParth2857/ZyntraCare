import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../data/services/auth_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final AuthService _authService = AuthService();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _authService.init().then((_) {
      if (mounted) setState(() {});
    });
  }

  Future<void> _handleSignIn() async {
    setState(() => _isLoading = true);
    await _authService.signInWithGoogle();
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSignOut() async {
    setState(() => _isLoading = true);
    await _authService.signOut();
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = _authService.currentUser;
    final isLoggedIn = user != null;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Header
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text('Profile'),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryDark],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_isLoading)
                        const CircularProgressIndicator(color: Colors.white)
                      else ...[
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: Colors.white,
                          backgroundImage: isLoggedIn && user.photoUrl != null
                              ? NetworkImage(user.photoUrl!)
                              : null,
                          child: !isLoggedIn || user.photoUrl == null
                              ? const Icon(Icons.person, size: 40, color: AppColors.primary)
                              : null,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          isLoggedIn ? (user.displayName ?? 'User') : 'Guest User',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        if (isLoggedIn && user.email != null)
                          Text(
                            user.email,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.white70,
                            ),
                          ),
                        TextButton(
                          onPressed: isLoggedIn ? _handleSignOut : _handleSignIn,
                          style: TextButton.styleFrom(
                            backgroundColor: Colors.white.withValues(alpha: 0.2),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(isLoggedIn ? Icons.logout : Icons.login, 
                                size: 16, color: Colors.white),
                              const SizedBox(width: 8),
                              Text(
                                isLoggedIn ? 'Sign Out' : 'Sign in with Google',
                                style: const TextStyle(color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ]
                    ],
                  ),
                ),
              ),
            ),
          ),
          
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Quick Stats
                  _buildQuickStats(),
                  const SizedBox(height: 24),
                  
                  // Menu Items
                  _buildSection('My Health'),
                  _buildMenuItem(Icons.calendar_today, 'Appointments', 'View and manage appointments'),
                  _buildMenuItem(Icons.folder, 'Health Records', 'Medical reports and documents'),
                  _buildMenuItem(Icons.monitor_heart, 'Health Tracker', 'Track your vitals'),
                  _buildMenuItem(Icons.medication, 'Medicines', 'Your prescriptions'),
                  
                  const SizedBox(height: 16),
                  _buildSection('My Account'),
                  _buildMenuItem(Icons.person, 'Edit Profile', 'Update your information'),
                  _buildMenuItem(Icons.location_on, 'Addresses', 'Manage saved locations'),
                  _buildMenuItem(Icons.payment, 'Payment Methods', 'UPI, Cards, Wallets'),
                  _buildMenuItem(Icons.notifications, 'Notifications', 'Manage alerts'),
                  
                  const SizedBox(height: 16),
                  _buildSection('Support'),
                  _buildMenuItem(Icons.help, 'Help Center', 'FAQs and support'),
                  _buildMenuItem(Icons.chat, 'Chat with Us', '24/7 customer support'),
                  _buildMenuItem(Icons.description, 'Terms & Privacy', 'Legal information'),
                  
                  const SizedBox(height: 16),
                  _buildSection('App'),
                  _buildMenuItem(Icons.dark_mode, 'Dark Mode', 'Toggle dark theme'),
                  _buildMenuItem(Icons.language, 'Language', 'Change language'),
                  _buildMenuItem(Icons.info, 'About', 'App version and info'),
                  
                  const SizedBox(height: 24),
                  Center(
                    child: Text(
                      'ZyntraCare v1.0.0',
                      style: TextStyle(
                        color: AppColors.textTertiary,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStats() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.08),
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem('Appointments', '3', Icons.calendar_today),
          _buildStatItem('Records', '12', Icons.folder),
          _buildStatItem('Prescriptions', '5', Icons.medication),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.accent.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppColors.accent),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildSection(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: AppColors.textTertiary,
        ),
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.accent.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppColors.accent, size: 20),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textTertiary),
        onTap: () {},
      ),
    );
  }
}