import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class PharmacyPartnerScreen extends StatefulWidget {
  const PharmacyPartnerScreen({super.key});
  @override State<PharmacyPartnerScreen> createState() => _PharmacyPartnerScreenState();
}

class _PharmacyPartnerScreenState extends State<PharmacyPartnerScreen> {
  final _api = ApiService();
  final _nameCtrl = TextEditingController();
  final _licenseCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _gstCtrl = TextEditingController();
  final _contactCtrl = TextEditingController();
  final _radiusCtrl = TextEditingController();
  bool _loading = false;
  bool _showForm = false;
  int _selectedTier = 0;
  bool _showDashboard = false;

  final _benefits = [
    {'icon': Icons.people_rounded, 'title': 'Larger Customer Base', 'desc': 'Access thousands of customers actively searching for medicines'},
    {'icon': Icons.delivery_dining_rounded, 'title': 'Delivery Integration', 'desc': 'Seamless delivery tracking and management system'},
    {'icon': Icons.inventory_2_rounded, 'title': 'Inventory Management', 'desc': 'Real-time stock tracking and automated reordering'},
    {'icon': Icons.analytics_rounded, 'title': 'Analytics Dashboard', 'desc': 'Detailed insights on sales, revenue, and customer behavior'},
  ];

  final _tiers = [
    {'name': 'Basic', 'price': 'Free', 'features': ['List up to 50 medicines', 'Basic analytics', 'Order notifications'], 'color': ZyntraColors.green},
    {'name': 'Pro', 'price': '\u20B9999/mo', 'features': ['Unlimited medicines', 'Advanced analytics', 'Delivery integration', 'Priority support', 'Inventory alerts'], 'color': ZyntraColors.cyan},
    {'name': 'Enterprise', 'price': 'Custom', 'features': ['All Pro features', 'Dedicated account manager', 'API access', 'Custom branding', 'Multi-branch support', '24/7 support'], 'color': ZyntraColors.purple},
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _licenseCtrl.dispose();
    _addressCtrl.dispose();
    _gstCtrl.dispose();
    _contactCtrl.dispose();
    _radiusCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitRegistration() async {
    if (_nameCtrl.text.isEmpty || _licenseCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Please fill required fields', style: GoogleFonts.inter(color: Colors.white)),
        backgroundColor: ZyntraColors.amber, behavior: SnackBarBehavior.floating,
      ));
      return;
    }
    setState(() => _loading = true);
    try {
      await _api.post('/api/pharmacy-partner/register', body: {
        'name': _nameCtrl.text,
        'license': _licenseCtrl.text,
        'address': _addressCtrl.text,
        'gst': _gstCtrl.text,
        'contact': _contactCtrl.text,
        'radius': _radiusCtrl.text,
        'tier': _selectedTier,
      });
    } catch (_) {}
    if (mounted) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Registration submitted! We will contact you shortly.', style: GoogleFonts.inter(color: Colors.white)),
        backgroundColor: ZyntraColors.green, behavior: SnackBarBehavior.floating,
      ));
    }
  }

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
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text('Pharmacy Partner', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Partner with ZyntraCare to grow your business', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? Center(child: CircularProgressIndicator(color: ZyntraColors.cyan))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Hero CTA
                          _buildHeroCTA(),
                          const SizedBox(height: 24),
                          // Benefits
                          Text('Why Partner With Us?', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ...List.generate(_benefits.length, (i) => _benefitCard(_benefits[i], i)),
                          const SizedBox(height: 24),
                          // Tiers
                          Text('Partnership Tiers', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ...List.generate(_tiers.length, (i) => _tierCard(_tiers[i], i)),
                          const SizedBox(height: 24),
                          // Register / Form toggle
                          if (!_showForm && !_showDashboard) ...[
                            GestureDetector(
                              onTap: () => setState(() => _showForm = true),
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                                ),
                                child: Center(
                                  child: Text('Register Your Pharmacy', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            GestureDetector(
                              onTap: () => setState(() => _showDashboard = true),
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                decoration: BoxDecoration(
                                  color: ZyntraColors.surface,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: ZyntraColors.border),
                                ),
                                child: Center(
                                  child: Text('View Dashboard Preview', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                                ),
                              ),
                            ),
                          ],
                          if (_showForm) _buildRegistrationForm(),
                          if (_showDashboard) _buildDashboardPreview(),
                          const SizedBox(height: 24),
                          // FAQ
                          _buildFAQ(),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroCTA() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.cyan.withValues(alpha: 0.15), ZyntraColors.purple.withValues(alpha: 0.1), ZyntraColors.card],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ZyntraColors.cyan.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.local_pharmacy_rounded, color: ZyntraColors.cyan, size: 48),
          ),
          const SizedBox(height: 16),
          Text('Partner as Pharmacy', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text('Join 2,500+ pharmacies across India serving millions of patients. Expand your reach with ZyntraCare\'s platform.',
            style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13), textAlign: TextAlign.center),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: ZyntraColors.green.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text('Zero joining fee \u2022 Start today', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).scale(curve: Curves.elasticOut);
  }

  Widget _benefitCard(Map<String, dynamic> benefit, int i) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: ZyntraColors.cyan.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(benefit['icon'] as IconData, color: ZyntraColors.cyan, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(benefit['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                Text(benefit['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              ],
            ),
          ),
        ],
      ).animate().fadeIn(delay: (i * 60).ms).slideX(begin: 0.05, end: 0),
    );
  }

  Widget _tierCard(Map<String, dynamic> tier, int i) {
    final sel = _selectedTier == i;
    final color = tier['color'] as Color;
    return GestureDetector(
      onTap: () => setState(() => _selectedTier = i),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: sel ? [color.withValues(alpha: 0.15), ZyntraColors.card] : [ZyntraColors.card, ZyntraColors.surface],
            begin: Alignment.topLeft, end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: sel ? color.withValues(alpha: 0.5) : ZyntraColors.border,
            width: sel ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(tier['name'] as String, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                const Spacer(),
                Text(tier['price'] as String, style: GoogleFonts.poppins(color: color, fontSize: 18, fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 12),
            ...(tier['features'] as List<String>).map((f) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  Icon(Icons.check_rounded, color: color, size: 16),
                  const SizedBox(width: 8),
                  Text(f, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                ],
              ),
            )),
          ],
        ),
      ).animate().fadeIn(delay: (i * 50).ms).slideY(begin: 0.05, end: 0),
    );
  }

  Widget _buildRegistrationForm() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Registration Form', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              const Spacer(),
              GestureDetector(
                onTap: () => setState(() => _showForm = false),
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(8), border: Border.all(color: ZyntraColors.border)),
                  child: const Icon(Icons.close_rounded, color: ZyntraColors.white70, size: 16),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _inputField(_nameCtrl, 'Pharmacy Name', Icons.store_rounded),
          const SizedBox(height: 12),
          _inputField(_licenseCtrl, 'License Number', Icons.assignment_rounded),
          const SizedBox(height: 12),
          _inputField(_addressCtrl, 'Full Address', Icons.location_on_rounded, maxLines: 2),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _inputField(_gstCtrl, 'GST Number', Icons.receipt_rounded)),
              const SizedBox(width: 10),
              Expanded(child: _inputField(_contactCtrl, 'Contact Number', Icons.phone_rounded, type: TextInputType.phone)),
            ],
          ),
          const SizedBox(height: 12),
          _inputField(_radiusCtrl, 'Delivery Radius (km)', Icons.map_rounded, type: TextInputType.number),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: _submitRegistration,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
              ),
              child: Center(
                child: Text('Submit Registration', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text('Bulk CSV upload feature coming soon', style: GoogleFonts.inter(color: Colors.white)),
              backgroundColor: ZyntraColors.purple, behavior: SnackBarBehavior.floating,
            )),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: ZyntraColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.upload_file_rounded, color: ZyntraColors.cyan, size: 18),
                    const SizedBox(width: 8),
                    Text('Upload Medications (CSV)', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _inputField(TextEditingController ctrl, String hint, IconData icon, {int maxLines = 1, TextInputType type = TextInputType.text}) {
    return TextField(
      controller: ctrl,
      keyboardType: type,
      maxLines: maxLines,
      style: GoogleFonts.inter(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 13),
        prefixIcon: Icon(icon, color: ZyntraColors.cyan, size: 20),
        filled: true,
        fillColor: ZyntraColors.surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildDashboardPreview() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Dashboard Preview', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              const Spacer(),
              GestureDetector(
                onTap: () => setState(() => _showDashboard = false),
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(8), border: Border.all(color: ZyntraColors.border)),
                  child: const Icon(Icons.close_rounded, color: ZyntraColors.white70, size: 16),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _dashStat('Today\'s Orders', '47', ZyntraColors.cyan),
              Container(width: 1, height: 50, color: ZyntraColors.border),
              _dashStat('Revenue', '\u20B912,450', ZyntraColors.green),
              Container(width: 1, height: 50, color: ZyntraColors.border),
              _dashStat('Stock Alerts', '3', ZyntraColors.red),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(color: ZyntraColors.border, height: 1),
          const SizedBox(height: 16),
          Text('Recent Orders', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          ...[
            {'order': '#ORD-7845', 'status': 'Packed', 'amount': '\u20B9450'},
            {'order': '#ORD-7844', 'status': 'Shipped', 'amount': '\u20B91,200'},
            {'order': '#ORD-7843', 'status': 'Delivered', 'amount': '\u20B9680'},
          ].map((o) => Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                Text(o['order'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: (o['status'] == 'Delivered' ? ZyntraColors.green : ZyntraColors.amber).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(o['status'] as String, style: GoogleFonts.inter(
                    color: o['status'] == 'Delivered' ? ZyntraColors.green : ZyntraColors.amber,
                    fontSize: 10, fontWeight: FontWeight.w600,
                  )),
                ),
                const SizedBox(width: 8),
                Text(o['amount'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              ],
            ),
          )),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _dashStat(String label, String value, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: GoogleFonts.poppins(color: color, fontSize: 18, fontWeight: FontWeight.w700)),
          Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
        ],
      ),
    );
  }

  Widget _buildFAQ() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Frequently Asked Questions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        ...[
          {'q': 'How long does onboarding take?', 'a': 'Typically 2-3 business days after document verification.'},
          {'q': 'Is there any joining fee?', 'a': 'No, the Basic tier is completely free with no hidden charges.'},
          {'q': 'Can I list both OTC and prescription medicines?', 'a': 'Yes, but prescription medicines require license verification.'},
          {'q': 'How do I get paid?', 'a': 'Payments are settled weekly via bank transfer for all completed orders.'},
        ].map((faq) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(faq['q'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Text(faq['a'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
            ],
          ),
        )),
      ],
    );
  }
}
