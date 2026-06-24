import 'package:flutter/material.dart';
import '../../../core/theme.dart';

class EmergencyBanner extends StatefulWidget {
  const EmergencyBanner({super.key});
  @override State<EmergencyBanner> createState() => _EmergencyBannerState();
}

class _EmergencyBannerState extends State<EmergencyBanner> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _pulse;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000))..repeat(reverse: true);
    _pulse = Tween<double>(begin: 0.6, end: 1.0).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: AnimatedBuilder(
        animation: _pulse,
        builder: (_, _) => Container(
          height: 66,
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFFDC2626), Color(0xFFEF4444)]),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: ZyntraColors.red.withValues(alpha: _pulse.value * 0.5),
                blurRadius: 20 + _pulse.value * 10,
                spreadRadius: _pulse.value * 2,
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(children: [
              // Animated heartbeat icon
              Transform.scale(scale: _pulse.value, child: const Icon(Icons.emergency_rounded, color: Colors.white, size: 26)),
              const SizedBox(width: 12),
              const Expanded(child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Medical Emergency?', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                  Text('Tap for immediate help', style: TextStyle(color: Colors.white70, fontSize: 10)),
                ],
              )),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: Colors.white.withValues(alpha: 0.3), blurRadius: 8)],
                ),
                child: const Text('102', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w800, fontSize: 16)),
              ),
            ]),
          ),
        ),
      ),
    );
  }
}
