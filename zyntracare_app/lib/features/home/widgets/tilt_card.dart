import 'dart:ui';
import 'package:flutter/material.dart';

/// A card that tilts in 3D when panned — uses Matrix4 perspective transform.
class TiltCard extends StatefulWidget {
  final Color color;
  final Widget child;
  final VoidCallback? onTap;
  const TiltCard({super.key, required this.color, required this.child, this.onTap});
  @override State<TiltCard> createState() => _TiltCardState();
}

class _TiltCardState extends State<TiltCard> with SingleTickerProviderStateMixin {
  double _rx = 0, _ry = 0;
  late AnimationController _pressCtrl;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _pressCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 150));
    _scaleAnim = Tween<double>(begin: 1.0, end: 0.93).animate(
      CurvedAnimation(parent: _pressCtrl, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() { _pressCtrl.dispose(); super.dispose(); }

  void _onPan(Offset local, Size size) {
    setState(() {
      _ry =  ((local.dx / size.width)  - 0.5) * 0.3;
      _rx = -((local.dy / size.height) - 0.5) * 0.3;
    });
  }

  void _reset() => setState(() { _rx = 0; _ry = 0; });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _pressCtrl.forward(),
      onTapUp: (_) { _pressCtrl.reverse(); widget.onTap?.call(); },
      onTapCancel: () => _pressCtrl.reverse(),
      onPanUpdate: (d) => _onPan(d.localPosition, context.size ?? const Size(80, 80)),
      onPanEnd: (_) => _reset(),
      child: AnimatedBuilder(
        animation: _scaleAnim,
        builder: (_, child) => Transform.scale(
          scale: _scaleAnim.value,
          child: Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateX(_rx)
              ..rotateY(_ry),
            child: child,
          ),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [widget.color.withOpacity(0.18), widget.color.withOpacity(0.06)],
                  begin: Alignment.topLeft, end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: widget.color.withOpacity(0.35)),
                boxShadow: [
                  BoxShadow(color: widget.color.withOpacity(0.15), blurRadius: 12, offset: const Offset(0, 4)),
                ],
              ),
              child: widget.child,
            ),
          ),
        ),
      ),
    );
  }
}
