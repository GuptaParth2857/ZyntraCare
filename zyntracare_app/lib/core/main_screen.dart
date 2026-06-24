import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme.dart';
import '../features/home/home_tab.dart';
import '../features/search/search_tab.dart';
import '../features/bookings/bookings_tab.dart';
import '../features/profile/profile_tab.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});
  @override State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> with SingleTickerProviderStateMixin {
  int _idx = 0;
  late AnimationController _navCtrl;

  static const _tabs = [HomeTab(), SearchTab(), BookingsTab(), ProfileTab()];

  static const _navItems = [
    _NavItem(icon: Icons.home_rounded, label: 'Home', color: ZyntraColors.cyan),
    _NavItem(icon: Icons.search_rounded, label: 'Search', color: ZyntraColors.purple),
    _NavItem(icon: Icons.calendar_month_rounded, label: 'Bookings', color: ZyntraColors.pink),
    _NavItem(icon: Icons.person_rounded, label: 'Profile', color: ZyntraColors.teal),
  ];

  @override
  void initState() {
    super.initState();
    _navCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 250));
    _navCtrl.forward();
  }

  @override
  void dispose() {
    _navCtrl.dispose();
    super.dispose();
  }

  void _selectTab(int idx) {
    if (idx == _idx) return;
    HapticFeedback.lightImpact();
    setState(() => _idx = idx);
    _navCtrl.forward(from: 0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 280),
        transitionBuilder: (child, anim) => FadeTransition(
          opacity: anim,
          child: SlideTransition(
            position: Tween<Offset>(begin: const Offset(0, 0.03), end: Offset.zero).animate(
              CurvedAnimation(parent: anim, curve: Curves.easeOut),
            ),
            child: child,
          ),
        ),
        child: KeyedSubtree(key: ValueKey(_idx), child: _tabs[_idx]),
      ),
      bottomNavigationBar: _buildFloatingNav(),
    );
  }

  Widget _buildFloatingNav() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            height: 68,
            decoration: BoxDecoration(
              color: ZyntraColors.card.withValues(alpha: 0.92),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.6)),
              boxShadow: [
                BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.06), blurRadius: 30, offset: const Offset(0, -4)),
                BoxShadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 20, offset: const Offset(0, 10)),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(_navItems.length, (i) => _navTile(i)),
            ),
          ),
        ),
      ),
    );
  }

  Widget _navTile(int i) {
    final sel = _idx == i;
    final item = _navItems[i];
    return GestureDetector(
      onTap: () => _selectTab(i),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(horizontal: sel ? 18 : 14, vertical: 10),
        decoration: BoxDecoration(
          color: sel ? item.color.withValues(alpha: 0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
          border: sel ? Border.all(color: item.color.withValues(alpha: 0.35)) : null,
          boxShadow: sel ? [BoxShadow(color: item.color.withValues(alpha: 0.3), blurRadius: 16)] : null,
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(item.icon, color: sel ? item.color : ZyntraColors.white40, size: 23),
          if (sel) ...[
            const SizedBox(width: 8),
            Text(item.label,
              style: GoogleFonts.inter(
                fontSize: 13, fontWeight: FontWeight.w600, color: item.color,
              ),
            ),
          ],
        ]),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final Color color;
  const _NavItem({required this.icon, required this.label, required this.color});
}
