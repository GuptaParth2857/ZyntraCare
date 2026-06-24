import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class PharmacyStoreScreen extends StatefulWidget {
  const PharmacyStoreScreen({super.key});
  @override State<PharmacyStoreScreen> createState() => _PharmacyStoreScreenState();
}

class _PharmacyStoreScreenState extends State<PharmacyStoreScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _products = [];
  List<Map<String, dynamic>> _cart = [];
  final _searchCtrl = TextEditingController();
  String _selectedCategory = 'All';
  int _selectedTab = 0;

  final _categories = ['All', 'Prescription', 'OTC', 'Wellness', 'Personal Care', 'Baby Care'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.get('/api/pharmacy-store');
      if (mounted && res != null) {
        final list = (res is List ? res : (res['data'] ?? res['products'] ?? [])) as List;
        setState(() => _products = list.map((e) => Map<String, dynamic>.from(e is Map ? e : {})).toList());
      }
    } catch (_) {}
    if (_products.isEmpty && mounted) {
      setState(() => _products = _placeholderProducts());
    }
    if (mounted) setState(() => _loading = false);
  }

  List<Map<String, dynamic>> _placeholderProducts() => [
    {'name': 'Paracetamol 500mg', 'category': 'OTC', 'price': 45.0, 'mrp': 60.0, 'discount': 25, 'qty': 10, 'unit': 'tablets'},
    {'name': 'Amoxicillin 250mg', 'category': 'Prescription', 'price': 120.0, 'mrp': 150.0, 'discount': 20, 'qty': 15, 'unit': 'capsules'},
    {'name': 'Vitamin C + Zinc', 'category': 'Wellness', 'price': 299.0, 'mrp': 399.0, 'discount': 25, 'qty': 30, 'unit': 'tablets'},
    {'name': 'Cetirizine 10mg', 'category': 'OTC', 'price': 35.0, 'mrp': 50.0, 'discount': 30, 'qty': 10, 'unit': 'tablets'},
    {'name': 'Baby Sunscreen SPF50', 'category': 'Baby Care', 'price': 459.0, 'mrp': 599.0, 'discount': 23, 'qty': 1, 'unit': 'tube'},
    {'name': 'Moisturizing Cream', 'category': 'Personal Care', 'price': 189.0, 'mrp': 250.0, 'discount': 24, 'qty': 1, 'unit': 'jar'},
    {'name': 'Multivitamin Daily', 'category': 'Wellness', 'price': 549.0, 'mrp': 699.0, 'discount': 21, 'qty': 60, 'unit': 'tablets'},
    {'name': 'Azithromycin 500mg', 'category': 'Prescription', 'price': 175.0, 'mrp': 220.0, 'discount': 20, 'qty': 3, 'unit': 'tablets'},
    {'name': 'Baby Diapers (48pk)', 'category': 'Baby Care', 'price': 899.0, 'mrp': 1099.0, 'discount': 18, 'qty': 48, 'unit': 'pieces'},
    {'name': 'Hand Sanitizer 500ml', 'category': 'Personal Care', 'price': 149.0, 'mrp': 199.0, 'discount': 25, 'qty': 1, 'unit': 'bottle'},
  ];

  List<Map<String, dynamic>> get _filteredProducts {
    var list = _products.where((p) {
      if (_selectedCategory != 'All' && p['category'] != _selectedCategory) return false;
      final q = _searchCtrl.text.toLowerCase();
      if (q.isNotEmpty && !(p['name']?.toString().toLowerCase().contains(q) ?? false)) return false;
      return true;
    }).toList();
    return list;
  }

  double get _cartTotal => _cart.fold(0.0, (sum, item) => sum + ((item['price'] as num?)?.toDouble() ?? 0) * ((item['cartQty'] as num?)?.toDouble() ?? 1));

  void _addToCart(Map<String, dynamic> p) {
    setState(() {
      final idx = _cart.indexWhere((c) => c['name'] == p['name']);
      if (idx >= 0) {
        _cart[idx]['cartQty'] = ((_cart[idx]['cartQty'] as num?)?.toInt() ?? 0) + 1;
      } else {
        _cart.add({...p, 'cartQty': 1});
      }
    });
  }

  void _removeFromCart(Map<String, dynamic> item) {
    setState(() {
      final idx = _cart.indexWhere((c) => c['name'] == item['name']);
      if (idx >= 0) {
        final qty = (_cart[idx]['cartQty'] as num?)?.toInt() ?? 1;
        if (qty <= 1) {
          _cart.removeAt(idx);
        } else {
          _cart[idx]['cartQty'] = qty - 1;
        }
      }
    });
  }

  int _cartQty(Map<String, dynamic> p) {
    final idx = _cart.indexWhere((c) => c['name'] == p['name']);
    return idx >= 0 ? (_cart[idx]['cartQty'] as num?)?.toInt() ?? 0 : 0;
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
                      Text('Pharmacy Store', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                      const Spacer(),
                      Stack(
                        children: [
                          GestureDetector(
                            onTap: () => setState(() => _selectedTab = 1),
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                              child: const Icon(Icons.shopping_cart_rounded, color: Colors.white, size: 22),
                            ),
                          ),
                          if (_cart.isNotEmpty)
                            Positioned(
                              right: 4, top: 4,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(color: ZyntraColors.red, shape: BoxShape.circle),
                                child: Text('${_cart.length}', style: GoogleFonts.inter(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w700)),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Order medicines & healthcare products', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            // Tab bar
            Container(
              color: ZyntraColors.surface,
              child: Row(
                children: [
                  _tabButton('Browse', 0),
                  _tabButton('Cart (${_cart.length})', 1),
                  _tabButton('Orders', 2),
                ],
              ),
            ),
            if (_loading)
              Expanded(child: _buildShimmer())
            else
              Expanded(
                child: IndexedStack(
                  index: _selectedTab,
                  children: [
                    _buildBrowseTab(),
                    _buildCartTab(),
                    _buildOrdersTab(),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _tabButton(String label, int idx) {
    final active = _selectedTab == idx;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTab = idx),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: active ? ZyntraColors.cyan : Colors.transparent, width: 2)),
          ),
          child: Text(label, style: GoogleFonts.inter(
            color: active ? ZyntraColors.cyan : ZyntraColors.white70,
            fontSize: 13, fontWeight: active ? FontWeight.w600 : FontWeight.w400,
          ), textAlign: TextAlign.center),
        ),
      ),
    );
  }

  // ===================== BROWSE TAB =====================
  Widget _buildBrowseTab() {
    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, color: ZyntraColors.white40, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    onChanged: (_) => setState(() {}),
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Search medicines...',
                      hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 14),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                if (_searchCtrl.text.isNotEmpty)
                  GestureDetector(
                    onTap: () {
                      _searchCtrl.clear();
                      setState(() {});
                    },
                    child: const Icon(Icons.clear_rounded, color: ZyntraColors.white40, size: 18),
                  ),
              ],
            ),
          ),
        ),
        // Category chips
        SizedBox(
          height: 40,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: _categories.map((cat) {
              final active = cat == _selectedCategory;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () => setState(() => _selectedCategory = cat),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: active ? const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]) : null,
                      color: active ? null : ZyntraColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: active ? Colors.transparent : ZyntraColors.border),
                    ),
                    child: Text(cat, style: GoogleFonts.inter(
                      color: active ? Colors.white : ZyntraColors.white70,
                      fontSize: 12, fontWeight: FontWeight.w500,
                    )),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 12),
        // Products grid
        Expanded(
          child: _filteredProducts.isEmpty
              ? Center(child: Text('No products found', style: GoogleFonts.inter(color: ZyntraColors.white70)))
              : GridView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.7,
                  ),
                  itemCount: _filteredProducts.length,
                  itemBuilder: (_, i) => _productCard(_filteredProducts[i], i),
                ),
        ),
      ],
    );
  }

  Widget _productCard(Map<String, dynamic> p, int i) {
    final name = p['name'] ?? '';
    final price = (p['price'] as num?)?.toDouble() ?? 0;
    final mrp = (p['mrp'] as num?)?.toDouble() ?? 0;
    final discount = (p['discount'] as num?)?.toInt() ?? 0;
    final qty = _cartQty(p);
    return Container(
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image placeholder
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: ZyntraColors.surface,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Icon(Icons.medication_rounded, color: ZyntraColors.white40.withValues(alpha: 0.3), size: 48),
                  ),
                  if (discount > 0)
                    Positioned(
                      top: 8, left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [ZyntraColors.red, ZyntraColors.amber]),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text('$discount% OFF', style: GoogleFonts.inter(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700)),
                      ),
                    ),
                ],
              ),
            ),
          ),
          // Info
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text('\u20B9${price.toStringAsFixed(0)}', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 14, fontWeight: FontWeight.w700)),
                    const SizedBox(width: 6),
                    Text('\u20B9${mrp.toStringAsFixed(0)}', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11, decoration: TextDecoration.lineThrough)),
                  ],
                ),
                const SizedBox(height: 8),
                qty > 0
                    ? Row(
                        children: [
                          GestureDetector(
                            onTap: () => _removeFromCart(p),
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(color: ZyntraColors.red.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                              child: const Icon(Icons.remove_rounded, color: ZyntraColors.red, size: 16),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text('$qty', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () => _addToCart(p),
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                              child: const Icon(Icons.add_rounded, color: ZyntraColors.green, size: 16),
                            ),
                          ),
                        ],
                      )
                    : GestureDetector(
                        onTap: () => _addToCart(p),
                        child: Container(
                          width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 6),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Center(
                            child: Text('Add to Cart', style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                          ),
                        ),
                      ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 50).ms).slideY(begin: 0.1, end: 0);
  }

  // ===================== CART TAB =====================
  Widget _buildCartTab() {
    if (_cart.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.shopping_cart_outlined, color: ZyntraColors.white40, size: 64),
            const SizedBox(height: 16),
            Text('Your cart is empty', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 16)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => setState(() => _selectedTab = 0),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('Browse Medicines', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
            children: [
              Row(
                children: [
                  Text('Cart Items (${_cart.length})', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => setState(() => _cart.clear()),
                    child: Text('Clear All', style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 12, fontWeight: FontWeight.w500)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ..._cart.map((item) => _cartItemCard(item)),
            ],
          ),
        ),
        // Checkout
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            border: Border(top: BorderSide(color: ZyntraColors.border)),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Total:', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14)),
                  Text('\u20B9${_cartTotal.toStringAsFixed(2)}', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                ],
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Order placed successfully!', style: GoogleFonts.inter(color: Colors.white)),
                    backgroundColor: ZyntraColors.green,
                    behavior: SnackBarBehavior.floating,
                  ));
                  setState(() => _cart.clear());
                },
                child: Container(
                  width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.shopping_bag_rounded, color: Colors.white, size: 20),
                      const SizedBox(width: 8),
                      Text('Place Order', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _cartItemCard(Map<String, dynamic> item) {
    final name = item['name'] ?? '';
    final price = (item['price'] as num?)?.toDouble() ?? 0;
    final qty = (item['cartQty'] as num?)?.toInt() ?? 1;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(10)),
            child: Icon(Icons.medication_rounded, color: ZyntraColors.white40, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                Text('\u20B9${price.toStringAsFixed(2)}', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 13, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          Row(
            children: [
              GestureDetector(
                onTap: () => _removeFromCart(item),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(color: ZyntraColors.red.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                  child: const Icon(Icons.remove_rounded, color: ZyntraColors.red, size: 16),
                ),
              ),
              const SizedBox(width: 10),
              Text('$qty', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: () => _addToCart(item),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                  child: const Icon(Icons.add_rounded, color: ZyntraColors.green, size: 16),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ===================== ORDERS TAB =====================
  Widget _buildOrdersTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Order Tracking', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 20),
          // Tracking stepper
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Column(
              children: [
                _trackingStep(Icons.check_circle_rounded, 'Ordered', true),
                _trackingStep(Icons.check_circle_rounded, 'Confirmed', true),
                _trackingStep(Icons.hourglass_top_rounded, 'Packed', false),
                _trackingStep(Icons.hourglass_bottom_rounded, 'Shipped', false),
                _trackingStep(Icons.radio_button_unchecked_rounded, 'Delivered', false),
              ],
            ),
          ).animate().fadeIn(duration: 300.ms),
          const SizedBox(height: 20),
          // Recent orders
          Text('Recent Orders', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Container(
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
                  decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Order #ZYN-2026-0621', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                      Text('Delivered on Jun 21, 2026', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                  child: Text('Delivered', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 10, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Upload prescription
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [ZyntraColors.purple.withValues(alpha: 0.08), ZyntraColors.purple.withValues(alpha: 0.02)],
                begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ZyntraColors.purple.withValues(alpha: 0.15)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: ZyntraColors.purple.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.upload_file_rounded, color: ZyntraColors.purple, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Need a Prescription Medicine?', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
                      Text('Upload your prescription to order', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('Upload prescription feature coming soon!', style: GoogleFonts.inter(color: Colors.white)),
                      backgroundColor: ZyntraColors.purple,
                      behavior: SnackBarBehavior.floating,
                    ));
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [ZyntraColors.purple, ZyntraColors.cyan]),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text('Upload', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 200.ms),
        ],
      ),
    );
  }

  Widget _trackingStep(IconData icon, String label, bool done) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, color: done ? ZyntraColors.green : ZyntraColors.white40, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: GoogleFonts.inter(
                  color: done ? Colors.white : ZyntraColors.white40,
                  fontSize: 14, fontWeight: done ? FontWeight.w600 : FontWeight.w400,
                )),
                if (done)
                  Text(done ? 'Completed' : 'Pending', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
              ],
            ),
          ),
          if (done)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
              child: Text('Done', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 10, fontWeight: FontWeight.w600)),
            ),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Container(height: 48, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14))),
        ),
        const SizedBox(height: 12),
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Container(height: 40, decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20))),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: Shimmer.fromColors(
            baseColor: ZyntraColors.card,
            highlightColor: ZyntraColors.border,
            child: GridView.builder(
              padding: EdgeInsets.zero,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.7,
              ),
              itemCount: 4,
              itemBuilder: (_, _) => Container(decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16))),
            ),
          ),
        ),
      ],
    );
  }
}
