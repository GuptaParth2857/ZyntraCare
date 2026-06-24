import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class SponsorScreen extends StatefulWidget {
  const SponsorScreen({super.key});
  @override State<SponsorScreen> createState() => _SponsorScreenState();
}

class _SponsorScreenState extends State<SponsorScreen> {
  final _api = ApiService();
  bool _loading = true;
  Map<String, dynamic>? _data;
  bool _showForm = false;

  final _companyCtrl = TextEditingController();
  final _contactCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _messageCtrl = TextEditingController();
  String? _selectedBudget;

  final _budgetOptions = ['₹25K - ₹1L', '₹1L - ₹5L', '₹5L - ₹10L', '₹10L+'];

  final _opportunities = [
    {'name': 'Healthcare Brands', 'icon': Icons.local_hospital_rounded, 'desc': 'Promote your brand to our 50K+ users', 'color': ZyntraColors.cyan},
    {'name': 'Research Partnerships', 'icon': Icons.science_rounded, 'desc': 'Clinical trials and research collaborations', 'color': ZyntraColors.purple},
    {'name': 'CSR Initiatives', 'icon': Icons.volunteer_activism_rounded, 'desc': 'Corporate social responsibility programs', 'color': ZyntraColors.green},
    {'name': 'Event Sponsorships', 'icon': Icons.event_rounded, 'desc': 'Health camps and community events', 'color': ZyntraColors.amber},
  ];

  final _sponsorTiers = [
    {'name': 'Platinum', 'min': '₹10L+', 'color': ZyntraColors.cyan, 'featured': true, 'benefits': ['Priority placement', 'Monthly performance report', 'Co-branded campaigns', 'Dedicated account manager', 'API integration support', 'VIP event access']},
    {'name': 'Gold', 'min': '₹5L+', 'color': ZyntraColors.amber, 'featured': false, 'benefits': ['Premium placement', 'Bi-weekly reports', 'Social media mentions', 'Event participation', 'Email campaigns']},
    {'name': 'Silver', 'min': '₹1L+', 'color': ZyntraColors.white70, 'featured': false, 'benefits': ['Standard placement', 'Monthly reports', 'Social media mentions', 'Event discounts']},
    {'name': 'Bronze', 'min': '₹25K+', 'color': ZyntraColors.teal, 'featured': false, 'benefits': ['Basic placement', 'Quarterly reports', 'Community access']},
  ];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  @override
  void dispose() {
    _companyCtrl.dispose();
    _contactCtrl.dispose();
    _emailCtrl.dispose();
    _messageCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/sponsors');
    if (res != null && mounted) {
      setState(() {
        _data = res;
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  void _submitForm() {
    if (_companyCtrl.text.isNotEmpty && _emailCtrl.text.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Sponsorship enquiry submitted! We will contact you soon.', style: GoogleFonts.inter()),
        backgroundColor: ZyntraColors.green,
      ));
      setState(() => _showForm = false);
      _companyCtrl.clear();
      _contactCtrl.clear();
      _emailCtrl.clear();
      _messageCtrl.clear();
      _selectedBudget = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        title: Text('Sponsorship', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight))),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.handshake_rounded),
            onPressed: () => setState(() => _showForm = !_showForm),
          ),
        ],
      ),
      body: _loading ? _buildShimmer() : _buildContent(),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: ZyntraColors.card,
      highlightColor: ZyntraColors.border,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(6, (_) => Container(
          height: 120,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
        )),
      ),
    );
  }

  Widget _buildContent() {
    return RefreshIndicator(
      onRefresh: _fetchData,
      color: ZyntraColors.cyan,
      backgroundColor: ZyntraColors.surface,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _buildOpportunitiesGrid(),
          const SizedBox(height: 24),
          _buildCurrentSponsors(),
          const SizedBox(height: 24),
          Text('Sponsorship Tiers', style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(height: 12),
          ..._sponsorTiers.map((tier) => _buildTierCard(tier)),
          const SizedBox(height: 24),
          _buildTestimonials(),
          const SizedBox(height: 16),
          if (_showForm) _buildSponsorForm(),
          const SizedBox(height: 32),
        ]),
      ),
    );
  }

  Widget _buildOpportunitiesGrid() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Partnership Opportunities', style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white)),
      const SizedBox(height: 12),
      GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.1,
        ),
        itemCount: _opportunities.length,
        itemBuilder: (_, i) => Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: (_opportunities[i]['color'] as Color).withValues(alpha: 0.2)),
          ),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: (_opportunities[i]['color'] as Color).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(_opportunities[i]['icon'] as IconData, color: _opportunities[i]['color'] as Color, size: 24),
            ),
            const SizedBox(height: 12),
            Text(_opportunities[i]['name'] as String, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white), textAlign: TextAlign.center),
            const SizedBox(height: 4),
            Text(_opportunities[i]['desc'] as String, style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.white70), textAlign: TextAlign.center, maxLines: 2),
          ]),
        ).animate().fadeIn(delay: (i * 80).ms, duration: 300.ms).slideY(begin: 0.1, end: 0),
      ),
    ]);
  }

  Widget _buildCurrentSponsors() {
    final sponsors = (_data?['currentSponsors'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Current Sponsors', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
      const SizedBox(height: 12),
      SizedBox(
        height: 80,
        child: sponsors.isEmpty
          ? Center(child: Text('No current sponsors', style: GoogleFonts.inter(color: ZyntraColors.white70)))
          : ListView.separated(
              scrollDirection: Axis.horizontal, itemCount: sponsors.length,
              separatorBuilder: (_, _) => const SizedBox(width: 12),
              itemBuilder: (_, i) => Container(
                width: 160,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  color: ZyntraColors.card,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: ZyntraColors.border),
                ),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.business_rounded, color: ZyntraColors.cyan.withValues(alpha: 0.5), size: 24),
                  const SizedBox(width: 8),
                  Text(sponsors[i]['name'] ?? '', style: GoogleFonts.inter(fontSize: 13, color: Colors.white, fontWeight: FontWeight.w500)),
                ]),
              ),
            ),
      ),
    ]).animate().fadeIn(delay: 200.ms, duration: 400.ms);
  }

  Widget _buildTierCard(Map<String, dynamic> tier) {
    final featured = tier['featured'] as bool;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: featured
          ? LinearGradient(colors: [(tier['color'] as Color).withValues(alpha: 0.15), ZyntraColors.card])
          : null,
        color: featured ? null : ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: featured ? (tier['color'] as Color) : ZyntraColors.border, width: featured ? 1.5 : 1),
        boxShadow: featured ? [BoxShadow(color: (tier['color'] as Color).withValues(alpha: 0.15), blurRadius: 20, offset: const Offset(0, 4))] : null,
      ),
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Row(children: [
            Text(tier['name'] as String, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: tier['color'] as Color)),
            const SizedBox(width: 8),
            Text(tier['min'] as String, style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70)),
          ]),
          if (featured)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: ZyntraColors.amber.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text('Featured', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: ZyntraColors.amber)),
            ),
        ]),
        const SizedBox(height: 16),
        ...(tier['benefits'] as List<dynamic>).map((b) => Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Row(children: [
            Icon(Icons.check_rounded, color: ZyntraColors.green, size: 18),
            const SizedBox(width: 8),
            Text(b.toString(), style: GoogleFonts.inter(fontSize: 13, color: ZyntraColors.white70)),
          ]),
        )),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity, height: 44,
          child: ElevatedButton(
            onPressed: () => setState(() => _showForm = true),
            style: ElevatedButton.styleFrom(
              backgroundColor: tier['color'] as Color,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            child: Text('Get Started', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ),
      ]),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildTestimonials() {
    final testimonials = (_data?['testimonials'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [
      {'name': 'Dr. Sharma', 'org': 'Apollo Hospitals', 'text': 'Partnering with ZyntraCare has been transformative for our digital outreach.'},
      {'name': 'Priya Mehta', 'org': 'PharmaCo Ltd.', 'text': 'Excellent ROI on our sponsorship investment. Highly recommended!'},
      {'name': 'Rajesh Kumar', 'org': 'HealthFirst NGO', 'text': 'The CSR partnership helped us reach rural communities effectively.'},
    ];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('What Our Sponsors Say', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
      const SizedBox(height: 12),
      ...testimonials.map((t) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: ZyntraColors.border)),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: ZyntraColors.purple.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
            child: Center(child: Text((t['name'] as String)[0].toUpperCase(), style: GoogleFonts.inter(color: ZyntraColors.purple, fontWeight: FontWeight.w700))),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text(t['name'] as String, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
              const SizedBox(width: 8),
              Text(t['org'] as String, style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
            ]),
            const SizedBox(height: 4),
            Text('"${t['text']}"', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70, fontStyle: FontStyle.italic)),
          ])),
        ]),
      )),
    ]).animate().fadeIn(delay: 300.ms, duration: 400.ms);
  }

  Widget _buildSponsorForm() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.purple.withValues(alpha: 0.1), ZyntraColors.cyan.withValues(alpha: 0.05)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: ZyntraColors.purple.withValues(alpha: 0.3)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(Icons.handshake_rounded, color: ZyntraColors.purple, size: 24),
          const SizedBox(width: 8),
          Text('Become a Sponsor', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
        ]),
        const SizedBox(height: 20),
        TextField(
          controller: _companyCtrl,
          style: GoogleFonts.inter(color: Colors.white),
          decoration: _formInput('Company Name', Icons.business_rounded),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _contactCtrl,
          style: GoogleFonts.inter(color: Colors.white),
          decoration: _formInput('Contact Person', Icons.person_rounded),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _emailCtrl,
          style: GoogleFonts.inter(color: Colors.white),
          keyboardType: TextInputType.emailAddress,
          decoration: _formInput('Email Address', Icons.email_rounded),
        ),
        const SizedBox(height: 12),
        Text('Budget Range', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: ZyntraColors.white70)),
        const SizedBox(height: 8),
        Wrap(spacing: 8, runSpacing: 8, children: _budgetOptions.map((b) => GestureDetector(
          onTap: () => setState(() => _selectedBudget = b),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: _selectedBudget == b ? ZyntraColors.purple.withValues(alpha: 0.2) : ZyntraColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _selectedBudget == b ? ZyntraColors.purple : ZyntraColors.border),
            ),
            child: Text(b, style: GoogleFonts.inter(fontSize: 12, color: _selectedBudget == b ? ZyntraColors.purple : ZyntraColors.white70)),
          ),
        )).toList()),
        const SizedBox(height: 12),
        TextField(
          controller: _messageCtrl,
          style: GoogleFonts.inter(color: Colors.white),
          maxLines: 3,
          decoration: _formInput('Tell us about your interest', Icons.message_rounded),
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity, height: 50,
          child: ElevatedButton(
            onPressed: _submitForm,
            style: ElevatedButton.styleFrom(
              backgroundColor: ZyntraColors.purple,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: Text('Submit Enquiry', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
          ),
        ),
      ]),
    ).animate().fadeIn(duration: 300.ms);
  }

  InputDecoration _formInput(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.5)),
      prefixIcon: Icon(icon, color: ZyntraColors.white70, size: 20),
      filled: true,
      fillColor: ZyntraColors.surface,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: ZyntraColors.border)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: ZyntraColors.border)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: ZyntraColors.purple)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }
}
