import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class LabBookingScreen extends StatefulWidget {
  const LabBookingScreen({super.key});
  @override State<LabBookingScreen> createState() => _LabBookingScreenState();
}

class _LabBookingScreenState extends State<LabBookingScreen> with SingleTickerProviderStateMixin {
  bool _loading = true;
  bool _homeCollection = false;
  String _selectedLab = 'ZyntraCare Labs - Mumbai Central';
  final _searchCtrl = TextEditingController();
  late TabController _tabCtrl;
  List<Map<String, dynamic>> _tests = [];
  List<Map<String, dynamic>> _previousBookings = [];
  final Map<int, int> _cart = {};
  int _selectedTestIndex = -1;
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _selectedTime = const TimeOfDay(hour: 10, minute: 0);

  final _popularTests = [
    {'name': 'CBC', 'full': 'Complete Blood Count', 'desc': 'Measures overall health and detects a wide range of disorders.', 'price': 299, 'prep': 'No special preparation required.'},
    {'name': 'Thyroid', 'full': 'Thyroid Profile (T3, T4, TSH)', 'desc': 'Evaluates thyroid gland function and hormone levels.', 'price': 499, 'prep': 'Fasting for 8-10 hours recommended.'},
    {'name': 'Lipid Profile', 'full': 'Lipid Profile', 'desc': 'Measures cholesterol and triglyceride levels for heart health.', 'price': 399, 'prep': 'Fasting for 10-12 hours required.'},
    {'name': 'Blood Sugar', 'full': 'Blood Sugar (Fasting & PP)', 'desc': 'Measures glucose levels to screen for diabetes.', 'price': 199, 'prep': 'Fasting for 8 hours required.'},
    {'name': 'Vitamin D', 'full': 'Vitamin D (25-Hydroxy)', 'desc': 'Measures vitamin D levels essential for bone health.', 'price': 899, 'prep': 'No special preparation required.'},
    {'name': 'Liver Function', 'full': 'Liver Function Test (LFT)', 'desc': 'Evaluates liver health and detects liver damage.', 'price': 599, 'prep': 'Fasting for 8-10 hours recommended.'},
  ];

  final _labLocations = ['ZyntraCare Labs - Mumbai Central', 'ZyntraCare Labs - Delhi South', 'ZyntraCare Labs - Bangalore MG Road', 'ZyntraCare Labs - Hyderabad Hitech City', 'ZyntraCare Labs - Chennai Adyar'];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().get('/api/lab-booking');
      if (mounted && res != null) {
        final data = res is Map ? res : {'data': res is List ? res : []};
        final tests = (data['tests'] ?? data['data'] ?? []) as List;
        final bookings = (data['previousBookings'] ?? data['bookings'] ?? []) as List;
        setState(() {
          _tests = tests.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList();
          _previousBookings = bookings.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList();
        });
      }
    } catch (_) {}
    if (_tests.isEmpty && mounted) {
      setState(() {
        _tests = _popularTests.map((t) => {
          'name': t['name'], 'fullName': t['full'], 'description': t['desc'],
          'price': t['price'], 'preparation': t['prep'],
        }).toList();
      });
    }
    if (mounted) setState(() => _loading = false);
  }

  int get _cartTotal => _cart.entries.fold(0, (sum, e) {
    final test = (e.key < _tests.length) ? _tests[e.key] : null;
    return sum + (test != null ? (test['price'] as int? ?? 0) * e.value : 0);
  });

  int get _cartCount => _cart.entries.fold(0, (sum, e) => sum + e.value);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
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
                      Text('Lab Tests', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      if (_cartCount > 0)
                        GestureDetector(
                          onTap: () => _showCartSheet(),
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.shopping_cart_rounded, color: Colors.white, size: 18),
                                const SizedBox(width: 4),
                                Text('$_cartCount', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: ZyntraColors.surface.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: TextField(
                      controller: _searchCtrl,
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Search lab tests...',
                        hintStyle: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.4)),
                        prefixIcon: const Icon(Icons.search_rounded, color: ZyntraColors.cyan, size: 20),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onChanged: (_) => setState(() {}),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TabBar(
                    controller: _tabCtrl,
                    indicatorColor: Colors.white,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white.withValues(alpha: 0.5),
                    labelStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
                    tabs: const [
                      Tab(text: 'Book Tests'),
                      Tab(text: 'Previous'),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : TabBarView(
                      controller: _tabCtrl,
                      children: [
                        _buildTestsTab(),
                        _buildPreviousTab(),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestsTab() {
    final filtered = _tests.where((t) {
      if (_searchCtrl.text.isEmpty) return true;
      final q = _searchCtrl.text.toLowerCase();
      return (t['name'] as String? ?? '').toLowerCase().contains(q) ||
          (t['fullName'] as String? ?? '').toLowerCase().contains(q);
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_searchCtrl.text.isEmpty) ...[
            _sectionHeader('Popular Tests', Icons.trending_up_rounded),
            const SizedBox(height: 12),
            _buildPopularGrid(),
            const SizedBox(height: 24),
          ],
          if (_searchCtrl.text.isNotEmpty) ...[
            Text('${filtered.length} results', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
            const SizedBox(height: 8),
          ],
          ...filtered.asMap().entries.map((e) => _buildTestCard(e.key, e.value)),
          const SizedBox(height: 20),
          _buildBookingSection(),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: ZyntraColors.cyan, size: 16),
        ),
        const SizedBox(width: 8),
        Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildPopularGrid() {
    final tests = _popularTests.take(6).toList();
    return Column(
      children: [
        Row(
          children: tests.sublist(0, 3).asMap().entries.map((e) => Expanded(
            child: _popularTile(e.value, 0, e.key),
          )).toList(),
        ),
        const SizedBox(height: 8),
        Row(
          children: tests.sublist(3, 6).asMap().entries.map((e) => Expanded(
            child: _popularTile(e.value, 1, e.key),
          )).toList(),
        ),
      ],
    );
  }

  Widget _popularTile(Map<String, dynamic> test, int row, int col) {
    final idx = row * 3 + col;
    final colors = [ZyntraColors.cyan, ZyntraColors.purple, ZyntraColors.green, ZyntraColors.amber, ZyntraColors.teal, ZyntraColors.pink];
    final color = colors[idx % colors.length];
    final inCart = _cart.containsKey(idx) && _cart[idx]! > 0;
    return GestureDetector(
      onTap: () {
        setState(() {
          _cart[idx] = (_cart[idx] ?? 0) + 1;
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('${test['name']} added to cart', style: GoogleFonts.inter(color: Colors.white)),
          backgroundColor: ZyntraColors.green,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 1),
        ));
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color.withValues(alpha: 0.1), ZyntraColors.card],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: inCart ? color.withValues(alpha: 0.5) : ZyntraColors.border),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: Text(test['name'] as String, style: GoogleFonts.poppins(color: color, fontSize: 16, fontWeight: FontWeight.w700)),
            ),
            const SizedBox(height: 6),
            Text('₹${test['price']}', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
            const SizedBox(height: 2),
            Text(test['full'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 8), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
            if (inCart) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
                child: Text('x${_cart[idx]}', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 10, fontWeight: FontWeight.w600)),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTestCard(int idx, Map<String, dynamic> test) {
    final inCart = _cart.containsKey(idx) && _cart[idx]! > 0;
    final selected = _selectedTestIndex == idx;
    return GestureDetector(
      onTap: () => setState(() => _selectedTestIndex = selected ? -1 : idx),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: selected ? ZyntraColors.cyan.withValues(alpha: 0.4) : ZyntraColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(test['name'] as String? ?? test['fullName'] as String? ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                      Text(test['fullName'] as String? ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                    ],
                  ),
                ),
                Column(
                  children: [
                    Text('₹${test['price']}', style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 18, fontWeight: FontWeight.w700)),
                    if (inCart) Text('x${_cart[idx]}', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 11)),
                  ],
                ),
              ],
            ),
            if (selected || _searchCtrl.text.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(test['description'] as String? ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: ZyntraColors.amber, size: 14),
                  const SizedBox(width: 4),
                  Expanded(child: Text('Preparation: ${test['preparation'] as String? ?? 'None'}', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 11))),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  if (inCart)
                    GestureDetector(
                      onTap: () => setState(() { if (_cart[idx]! > 1) _cart[idx] = _cart[idx]! - 1; else _cart.remove(idx); }),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(color: ZyntraColors.red.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                        child: const Icon(Icons.remove_rounded, color: ZyntraColors.red, size: 18),
                      ),
                    ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => setState(() => _cart[idx] = (_cart[idx] ?? 0) + 1),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(inCart ? 'Add More' : 'Book Now', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ).animate().fadeIn(duration: 300.ms),
    );
  }

  Widget _buildBookingSection() {
    if (_cartCount == 0) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Booking Details', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedLab,
                dropdownColor: ZyntraColors.card,
                isExpanded: true,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                items: _labLocations.map((l) => DropdownMenuItem(value: l, child: Row(
                  children: [
                    const Icon(Icons.local_hospital_rounded, color: ZyntraColors.cyan, size: 16),
                    const SizedBox(width: 8),
                    Expanded(child: Text(l, style: GoogleFonts.inter(fontSize: 12))),
                  ],
                ))).toList(),
                onChanged: (v) => setState(() => _selectedLab = v!),
              ),
            ),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => _showDateTimePicker(),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_rounded, color: ZyntraColors.cyan, size: 18),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}', style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
                      Text(_selectedTime.format(context), style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                    ],
                  ),
                  const Spacer(),
                  const Icon(Icons.edit_rounded, color: ZyntraColors.white70, size: 16),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => setState(() => _homeCollection = !_homeCollection),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _homeCollection ? ZyntraColors.green.withValues(alpha: 0.1) : ZyntraColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _homeCollection ? ZyntraColors.green.withValues(alpha: 0.3) : ZyntraColors.border),
              ),
              child: Row(
                children: [
                  Icon(_homeCollection ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded, color: _homeCollection ? ZyntraColors.green : ZyntraColors.white40, size: 22),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Home Collection', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                      Text('Additional ₹100', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total:', style: GoogleFonts.poppins(color: Colors.white, fontSize: 14)),
              Text('₹${_cartTotal + (_homeCollection ? 100 : 0)}', style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 22, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 14),
          GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text('Booking confirmed!', style: GoogleFonts.inter(color: Colors.white)),
                backgroundColor: ZyntraColors.green,
                behavior: SnackBarBehavior.floating,
              ));
              setState(() { _cart.clear(); });
            },
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
              ),
              child: Center(
                child: Text('Confirm Booking', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showDateTimePicker() {
    showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
      builder: (ctx, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(primary: ZyntraColors.cyan, surface: ZyntraColors.card),
        ),
        child: child!,
      ),
    ).then((date) {
      if (date == null) return;
      showTimePicker(
        context: context,
        initialTime: _selectedTime,
        builder: (ctx, child) => Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(primary: ZyntraColors.cyan, surface: ZyntraColors.card),
          ),
          child: child!,
        ),
      ).then((time) {
        if (time != null) setState(() { _selectedDate = date; _selectedTime = time; });
      });
    });
  }

  void _showCartSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.5,
        decoration: const BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)))),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text('Cart', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () { setState(() => _cart.clear()); Navigator.pop(ctx); },
                    child: Text('Clear All', style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 13)),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  children: _cart.entries.map((e) {
                    final test = (e.key < _tests.length) ? _tests[e.key] : null;
                    if (test == null) return const SizedBox.shrink();
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(test['name'] as String? ?? test['fullName'] as String? ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                                Text('₹${test['price']} x ${e.value}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                              ],
                            ),
                          ),
                          Text('₹${(test['price'] as int? ?? 0) * e.value}', style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 16, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
              const Divider(color: ZyntraColors.border),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Total:', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16)),
                  Text('₹$_cartTotal', style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 22, fontWeight: FontWeight.w700)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPreviousTab() {
    if (_previousBookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long_rounded, color: ZyntraColors.white40, size: 64),
            const SizedBox(height: 16),
            Text('No previous bookings', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 16)),
            const SizedBox(height: 8),
            Text('Your test booking history will appear here', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 12)),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      itemCount: _previousBookings.length,
      itemBuilder: (_, i) {
        final b = _previousBookings[i];
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.science_rounded, color: ZyntraColors.cyan, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(b['testName'] ?? b['name'] ?? 'Test', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                    Text(b['date'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                    Text(b['lab'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: (b['status'] == 'Completed' ? ZyntraColors.green : ZyntraColors.amber).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(b['status'] ?? 'Pending', style: GoogleFonts.inter(color: b['status'] == 'Completed' ? ZyntraColors.green : ZyntraColors.amber, fontSize: 9, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ).animate().fadeIn(delay: (i * 60).ms);
      },
    );
  }

  Widget _buildShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Column(
          children: List.generate(6, (_) => Container(
            height: 80,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
          )),
        ),
      ),
    );
  }
}
