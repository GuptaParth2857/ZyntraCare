import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class HospitalInventoryScreen extends StatefulWidget {
  const HospitalInventoryScreen({super.key});
  @override State<HospitalInventoryScreen> createState() => _HospitalInventoryScreenState();
}

class _HospitalInventoryScreenState extends State<HospitalInventoryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  bool _loading = true;
  String _searchQuery = '';
  List<Map<String, dynamic>> _items = [];
  final _categories = ['All', 'Medicines', 'Equipment', 'Supplies', 'PPE'];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: _categories.length, vsync: this);
    _tabCtrl.addListener(() => setState(() {}));
    _load();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.get('/api/hospital-inventory');
      if (mounted && res != null) {
        final list = (res is List ? res : (res['data'] ?? res['items'] ?? [])) as List;
        setState(() => _items = list.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList());
      }
    } catch (_) {}
    if (_items.isEmpty && mounted) setState(() => _items = _placeholderItems());
    if (mounted) setState(() => _loading = false);
  }

  List<Map<String, dynamic>> _placeholderItems() => [
    {'name': 'Paracetamol 500mg', 'category': 'Medicines', 'stock': 450, 'threshold': 100, 'expiry': '2027-06', 'unit': 'tablets'},
    {'name': 'Amoxicillin 250mg', 'category': 'Medicines', 'stock': 230, 'threshold': 100, 'expiry': '2026-12', 'unit': 'capsules'},
    {'name': 'Insulin Glargine', 'category': 'Medicines', 'stock': 45, 'threshold': 50, 'expiry': '2026-09', 'unit': 'vials'},
    {'name': 'Ventilator', 'category': 'Equipment', 'stock': 12, 'threshold': 5, 'expiry': '', 'unit': 'units'},
    {'name': 'ECG Machine', 'category': 'Equipment', 'stock': 8, 'threshold': 3, 'expiry': '', 'unit': 'units'},
    {'name': 'Patient Monitor', 'category': 'Equipment', 'stock': 4, 'threshold': 10, 'expiry': '', 'unit': 'units'},
    {'name': 'Surgical Gloves', 'category': 'Supplies', 'stock': 150, 'threshold': 200, 'expiry': '2027-03', 'unit': 'boxes'},
    {'name': 'Syringes 5ml', 'category': 'Supplies', 'stock': 800, 'threshold': 200, 'expiry': '2027-08', 'unit': 'pieces'},
    {'name': 'Bandages', 'category': 'Supplies', 'stock': 60, 'threshold': 100, 'expiry': '', 'unit': 'rolls'},
    {'name': 'IV Drip Sets', 'category': 'Supplies', 'stock': 25, 'threshold': 50, 'expiry': '2027-01', 'unit': 'sets'},
    {'name': 'N95 Masks', 'category': 'PPE', 'stock': 500, 'threshold': 200, 'expiry': '2027-12', 'unit': 'pieces'},
    {'name': 'Face Shields', 'category': 'PPE', 'stock': 120, 'threshold': 100, 'expiry': '', 'unit': 'pieces'},
    {'name': 'Protective Gowns', 'category': 'PPE', 'stock': 30, 'threshold': 50, 'expiry': '', 'unit': 'pieces'},
    {'name': 'Hand Sanitizer', 'category': 'PPE', 'stock': 80, 'threshold': 100, 'expiry': '2026-11', 'unit': 'bottles'},
  ];

  List<Map<String, dynamic>> get _filteredItems {
    var list = _items;
    final cat = _categories[_tabCtrl.index];
    if (cat != 'All') list = list.where((i) => i['category'] == cat).toList();
    if (_searchQuery.isNotEmpty) {
      list = list.where((i) => i['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase())).toList();
    }
    return list;
  }

  List<Map<String, dynamic>> get _lowStockItems => _items.where((i) => ((i['stock'] as int?) ?? 0) <= ((i['threshold'] as int?) ?? 0)).toList();

  Color _stockLevel(int stock, int threshold) {
    if (stock <= threshold * 0.5) return ZyntraColors.red;
    if (stock <= threshold) return ZyntraColors.amber;
    return ZyntraColors.green;
  }

  String _stockLabel(int stock, int threshold) {
    if (stock <= threshold * 0.5) return 'Critical';
    if (stock <= threshold) return 'Low';
    return 'OK';
  }

  void _showAddItemSheet() {
    final nameCtrl = TextEditingController();
    final qtyCtrl = TextEditingController();
    final thresholdCtrl = TextEditingController();
    final expiryCtrl = TextEditingController();
    String category = 'Medicines';
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.65,
        decoration: const BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        child: Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
          child: StatefulBuilder(
            builder: (ctx, setSheetState) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)))),
                const SizedBox(height: 20),
                Text('Add Inventory Item', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                TextField(controller: nameCtrl, style: GoogleFonts.inter(color: Colors.white), decoration: InputDecoration(hintText: 'Item Name', hintStyle: GoogleFonts.inter(color: ZyntraColors.white40), filled: true, fillColor: ZyntraColors.surface, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: category,
                      dropdownColor: ZyntraColors.card,
                      isExpanded: true,
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                      items: ['Medicines', 'Equipment', 'Supplies', 'PPE'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                      onChanged: (v) => setSheetState(() => category = v!),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: TextField(controller: qtyCtrl, style: GoogleFonts.inter(color: Colors.white), keyboardType: TextInputType.number, decoration: InputDecoration(hintText: 'Quantity', hintStyle: GoogleFonts.inter(color: ZyntraColors.white40), filled: true, fillColor: ZyntraColors.surface, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none)))),
                    const SizedBox(width: 10),
                    Expanded(child: TextField(controller: thresholdCtrl, style: GoogleFonts.inter(color: Colors.white), keyboardType: TextInputType.number, decoration: InputDecoration(hintText: 'Threshold', hintStyle: GoogleFonts.inter(color: ZyntraColors.white40), filled: true, fillColor: ZyntraColors.surface, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none)))),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(controller: expiryCtrl, style: GoogleFonts.inter(color: Colors.white), decoration: InputDecoration(hintText: 'Expiry Date (e.g. 2027-06)', hintStyle: GoogleFonts.inter(color: ZyntraColors.white40), filled: true, fillColor: ZyntraColors.surface, border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none))),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: () {
                    if (nameCtrl.text.isNotEmpty) {
                      setState(() {
                        _items.insert(0, {
                          'name': nameCtrl.text,
                          'category': category,
                          'stock': int.tryParse(qtyCtrl.text) ?? 0,
                          'threshold': int.tryParse(thresholdCtrl.text) ?? 10,
                          'expiry': expiryCtrl.text,
                          'unit': 'units',
                        });
                      });
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text('${nameCtrl.text} added to inventory', style: GoogleFonts.inter(color: Colors.white)),
                        backgroundColor: ZyntraColors.green,
                        behavior: SnackBarBehavior.floating,
                      ));
                    }
                  },
                  child: Container(
                    width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]), borderRadius: BorderRadius.circular(16)),
                    child: Center(child: Text('Add Item', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16))),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lowCount = _lowStockItems.length;
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
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
                      Text('Inventory', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      GestureDetector(
                        onTap: _showAddItemSheet,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.add_rounded, color: Colors.white, size: 22),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Low Stock Banner
            if (lowCount > 0 && _searchQuery.isEmpty)
              GestureDetector(
                onTap: () => _tabCtrl.animateTo(0),
                child: Container(
                  width: double.infinity,
                  margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: ZyntraColors.red.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: ZyntraColors.amber, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text('$lowCount items low in stock', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                      ),
                      const Icon(Icons.chevron_right_rounded, color: ZyntraColors.white40),
                    ],
                  ),
                ),
              ),
            // Search
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
              child: TextField(
                onChanged: (v) => setState(() => _searchQuery = v),
                style: GoogleFonts.inter(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search inventory...',
                  hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
                  prefixIcon: const Icon(Icons.search_rounded, color: ZyntraColors.white40),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? GestureDetector(onTap: () => setState(() => _searchQuery = ''), child: const Icon(Icons.clear_rounded, color: ZyntraColors.white40))
                      : null,
                  filled: true,
                  fillColor: ZyntraColors.surface,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
            ),
            // Category Tabs
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: ZyntraColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: TabBar(
                controller: _tabCtrl,
                isScrollable: true,
                indicator: BoxDecoration(
                  gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                  borderRadius: BorderRadius.circular(12),
                ),
                indicatorPadding: const EdgeInsets.all(4),
                labelColor: Colors.white,
                unselectedLabelColor: ZyntraColors.white70,
                labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 12),
                tabs: _categories.map((c) => Tab(text: c)).toList(),
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : _filteredItems.isEmpty
                      ? Center(child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.inventory_2_outlined, color: ZyntraColors.white40, size: 48),
                            const SizedBox(height: 12),
                            Text('No items found', style: GoogleFonts.inter(color: ZyntraColors.white70)),
                          ],
                        ))
                      : RefreshIndicator(
                          color: ZyntraColors.cyan,
                          backgroundColor: ZyntraColors.card,
                          onRefresh: _load,
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                            itemCount: _filteredItems.length,
                            itemBuilder: (_, i) => _itemCard(_filteredItems[i], i),
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _itemCard(Map<String, dynamic> item, int i) {
    final stock = (item['stock'] as int?) ?? 0;
    final threshold = (item['threshold'] as int?) ?? 10;
    final color = _stockLevel(stock, threshold);
    final label = _stockLabel(stock, threshold);
    final pct = threshold > 0 ? (stock / threshold).clamp(0, 1.5) : 1.0;

    Color categoryColor(String cat) {
      switch (cat) {
        case 'Medicines': return ZyntraColors.cyan;
        case 'Equipment': return ZyntraColors.purple;
        case 'Supplies': return ZyntraColors.teal;
        case 'PPE': return ZyntraColors.green;
        default: return ZyntraColors.white70;
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [ZyntraColors.card, ZyntraColors.surface], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color == ZyntraColors.red ? color.withValues(alpha: 0.3) : ZyntraColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: categoryColor(item['category'] ?? '').withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.inventory_2_rounded, color: categoryColor(item['category'] ?? ''), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item['name'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: categoryColor(item['category'] ?? '').withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(item['category'] ?? '', style: GoogleFonts.inter(color: categoryColor(item['category'] ?? ''), fontSize: 8)),
                        ),
                        if ((item['expiry'] ?? '').isNotEmpty) ...[
                          const SizedBox(width: 6),
                          Text('Exp: ${item['expiry']}', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(label, style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: (pct.clamp(0.0, 1.0)).toDouble(),
                    backgroundColor: ZyntraColors.border,
                    valueColor: AlwaysStoppedAnimation<Color>(color),
                    minHeight: 6,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text('$stock / $threshold ${item['unit'] ?? ''}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 10)),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 50).ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: 6,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 110,
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}
