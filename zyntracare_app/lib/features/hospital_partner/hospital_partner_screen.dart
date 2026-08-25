import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class HospitalPartnerScreen extends StatefulWidget {
  const HospitalPartnerScreen({super.key});
  @override State<HospitalPartnerScreen> createState() => _HospitalPartnerScreenState();
}

class _HospitalPartnerScreenState extends State<HospitalPartnerScreen> {
  bool _loading = true;
  bool _submitted = false;
  bool _submitting = false;
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _bedsCtrl = TextEditingController();
  final _contactCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  String _hospitalType = 'Multi-specialty';
  final _types = ['Multi-specialty', 'Super-specialty', 'Nursing Home', 'Clinic'];
  final Set<int> _expandedFaqs = {};

  final _benefits = [
    {'icon': Icons.smart_toy_rounded, 'title': 'AI Integration', 'desc': 'Deploy AI-powered diagnostics, triage, and clinical decision support across your facility.', 'color': ZyntraColors.cyan},
    {'icon': Icons.people_rounded, 'title': 'Patient Reach', 'desc': 'Connect with millions of patients actively seeking healthcare services on our platform.', 'color': ZyntraColors.purple},
    {'icon': Icons.trending_up_rounded, 'title': 'Revenue Share', 'desc': 'Competitive revenue sharing model with transparent reporting and weekly payouts.', 'color': ZyntraColors.green},
    {'icon': Icons.analytics_rounded, 'title': 'Analytics', 'desc': 'Real-time dashboards for patient flow, revenue, and operational efficiency metrics.', 'color': ZyntraColors.amber},
  ];

  final _steps = [
    {'step': '01', 'title': 'Register', 'desc': 'Fill in your hospital details and submit the partnership application.', 'icon': Icons.edit_note_rounded},
    {'step': '02', 'title': 'Verify', 'desc': 'Our team verifies credentials and conducts a quick onboarding call.', 'icon': Icons.verified_rounded},
    {'step': '03', 'title': 'Go Live', 'desc': 'Get integrated onto the platform and start receiving patients within 48 hours.', 'icon': Icons.rocket_launch_rounded},
  ];

  final _testimonials = [
    {'name': 'Dr. Meera Sharma', 'hospital': 'Apollo Hospitals', 'text': 'ZyntraCare transformed our patient outreach. We saw a 35% increase in new consultations within the first month.', 'rating': 5},
    {'name': 'Dr. Rajesh Kumar', 'hospital': 'Max Healthcare', 'text': 'The AI triage system integrated seamlessly with our workflow. Game-changer for emergency care.', 'rating': 5},
    {'name': 'Dr. Ananya Patel', 'hospital': 'Fortis Healthcare', 'text': 'Analytics dashboard gives us unprecedented insights into patient demographics and service utilization.', 'rating': 4},
  ];

  final _faqs = [
    {'q': 'What is the onboarding process?', 'a': 'After submitting the form, our partnership team reviews your application within 24 hours. We schedule a 30-minute onboarding call to understand your requirements, followed by technical integration support.'},
    {'q': 'How long does integration take?', 'a': 'Most hospitals go live within 48-72 hours. Our plug-and-play API requires minimal IT effort. For legacy systems, we provide dedicated integration support.'},
    {'q': 'What are the revenue share terms?', 'a': 'Revenue share starts at 15% for the first year, reducing to 12% from year two. Premium hospitals with exclusive partnerships receive customized terms.'},
    {'q': 'Is there any setup fee?', 'a': 'No setup fee. We operate on a performance-based model. You only pay when you start receiving patients through the platform.'},
    {'q': 'What support do you provide?', 'a': '24/7 technical support, dedicated account manager, marketing assistance, and regular analytics reviews. Enterprise partners get on-site support.'},
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _addressCtrl.dispose();
    _bedsCtrl.dispose();
    _contactCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      await ApiService().post('/api/hospital-partner', body: {
        'name': _nameCtrl.text,
        'address': _addressCtrl.text,
        'type': _hospitalType,
        'beds': int.tryParse(_bedsCtrl.text) ?? 0,
        'contact': _contactCtrl.text,
        'email': _emailCtrl.text,
      });
    } catch (_) {}
    if (mounted) {
      setState(() { _submitting = false; _submitted = true; });
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => _submitted = false);
      });
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
                      Text('Partner with Us', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Grow your practice with India\'s leading healthcare platform', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : SingleChildScrollView(
                      padding: const EdgeInsets.only(bottom: 100),
                      child: _submitted
                          ? _buildSuccess()
                          : Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildHero(),
                                const SizedBox(height: 24),
                                _sectionHeader('Why Partner With Us', Icons.emoji_events_rounded),
                                const SizedBox(height: 12),
                                _buildBenefits(),
                                const SizedBox(height: 24),
                                _sectionHeader('How It Works', Icons.route_rounded),
                                const SizedBox(height: 12),
                                _buildSteps(),
                                const SizedBox(height: 24),
                                _sectionHeader('Partner Registration', Icons.assignment_rounded),
                                const SizedBox(height: 12),
                                _buildForm(),
                                const SizedBox(height: 24),
                                _sectionHeader('What Our Partners Say', Icons.format_quote_rounded),
                                const SizedBox(height: 12),
                                _buildTestimonials(),
                                const SizedBox(height: 24),
                                _sectionHeader('Frequently Asked Questions', Icons.help_outline_rounded),
                                const SizedBox(height: 12),
                                _buildFaqs(),
                                const SizedBox(height: 24),
                              ],
                            ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHero() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.cyan.withValues(alpha: 0.15), ZyntraColors.purple.withValues(alpha: 0.1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
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
            child: const Icon(Icons.local_hospital_rounded, color: ZyntraColors.cyan, size: 40),
          ),
          const SizedBox(height: 16),
          Text('Partner with ZyntraCare', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text(
            'Join 500+ hospitals across India leveraging AI-powered healthcare technology to expand their reach, optimize operations, and deliver better patient outcomes.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _heroStat('500+', 'Hospitals'),
              _heroStat('2M+', 'Patients'),
              _heroStat('48h', 'Go Live'),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _heroStat(String val, String label) {
    return Column(
      children: [
        Text(val, style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 22, fontWeight: FontWeight.w700)),
        Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
      ],
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: ZyntraColors.cyan.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: ZyntraColors.cyan, size: 16),
          ),
          const SizedBox(width: 8),
          Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildBenefits() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: _benefits.map((b) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: (b['color'] as Color).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(b['icon'] as IconData, color: b['color'] as Color, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(b['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(b['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildSteps() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: _steps.map((s) => Expanded(
          child: Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Column(
              children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(child: Text(s['step'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700))),
                ),
                const SizedBox(height: 8),
                Icon(s['icon'] as IconData, color: ZyntraColors.cyan, size: 22),
                const SizedBox(height: 6),
                Text(s['title'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(s['desc'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 9), textAlign: TextAlign.center),
              ],
            ),
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildForm() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            _formField(_nameCtrl, 'Hospital Name', Icons.local_hospital_rounded, TextInputType.text),
            const SizedBox(height: 10),
            _formField(_addressCtrl, 'Address', Icons.location_on_rounded, TextInputType.text),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: ZyntraColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _hospitalType,
                  dropdownColor: ZyntraColors.card,
                  isExpanded: true,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  items: _types.map((t) => DropdownMenuItem(value: t, child: Row(
                    children: [
                      const Icon(Icons.local_hospital_rounded, color: ZyntraColors.cyan, size: 18),
                      const SizedBox(width: 8),
                      Text(t),
                    ],
                  ))).toList(),
                  onChanged: (v) => setState(() => _hospitalType = v!),
                ),
              ),
            ),
            const SizedBox(height: 10),
            _formField(_bedsCtrl, 'Number of Beds', Icons.bed_rounded, TextInputType.number),
            const SizedBox(height: 10),
            _formField(_contactCtrl, 'Contact Number', Icons.phone_rounded, TextInputType.phone),
            const SizedBox(height: 10),
            _formField(_emailCtrl, 'Email Address', Icons.email_rounded, TextInputType.emailAddress),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: _submitting ? null : _submit,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                ),
                child: Center(
                  child: _submitting
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                            const SizedBox(width: 8),
                            Text('Submit Application', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                          ],
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _formField(TextEditingController ctrl, String label, IconData icon, TextInputType kbd) {
    return TextFormField(
      controller: ctrl,
      keyboardType: kbd,
      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
      validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
      decoration: InputDecoration(
        icon: Icon(icon, color: ZyntraColors.cyan, size: 20),
        labelText: label,
        labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
        filled: true,
        fillColor: ZyntraColors.surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildTestimonials() {
    return SizedBox(
      height: 140,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _testimonials.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (ctx, i) {
          final t = _testimonials[i];
          return Container(
            width: 300,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: ZyntraColors.cyan.withValues(alpha: 0.2),
                      child: Text((t['name'] as String)[0], style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 14)),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(t['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                          Text(t['hospital'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
                        ],
                      ),
                    ),
                    Row(
                      children: List.generate(t['rating'] as int, (_) => const Icon(Icons.star_rounded, color: ZyntraColors.amber, size: 14)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: Text('"${t['text']}"', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11, fontStyle: FontStyle.italic), overflow: TextOverflow.ellipsis, maxLines: 3),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFaqs() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: List.generate(_faqs.length, (i) {
          final expanded = _expandedFaqs.contains(i);
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: expanded ? ZyntraColors.cyan.withValues(alpha: 0.3) : ZyntraColors.border),
            ),
            child: Column(
              children: [
                GestureDetector(
                  onTap: () {
                    setState(() {
                      if (expanded) { _expandedFaqs.remove(i); } else { _expandedFaqs.add(i); }
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(_faqs[i]['q'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                        ),
                        AnimatedRotation(
                          turns: expanded ? 0.5 : 0,
                          duration: const Duration(milliseconds: 200),
                          child: const Icon(Icons.expand_more_rounded, color: ZyntraColors.cyan, size: 22),
                        ),
                      ],
                    ),
                  ),
                ),
                AnimatedCrossFade(
                  crossFadeState: expanded ? CrossFadeState.showFirst : CrossFadeState.showSecond,
                  duration: const Duration(milliseconds: 200),
                  firstChild: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                    child: Text(_faqs[i]['a'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                  ),
                  secondChild: const SizedBox.shrink(),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildSuccess() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(24),
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: ZyntraColors.green.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 64),
          ),
          const SizedBox(height: 20),
          Text('Application Submitted!', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          Text(
            'Thank you for partnering with ZyntraCare. Our team will review your application and get back to you within 24 hours.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14),
          ),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: () => setState(() => _submitted = false),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: ZyntraColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: Center(child: Text('Submit Another', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontWeight: FontWeight.w600))),
            ),
          ),
        ],
      ),
    ).animate().scale(duration: 400.ms, curve: Curves.elasticOut);
  }

  Widget _buildShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Column(
          children: List.generate(5, (_) => Container(
            height: 80,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
          )),
        ),
      ),
    );
  }
}
