import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class DementiaVoiceScreen extends StatefulWidget {
  const DementiaVoiceScreen({super.key});
  @override State<DementiaVoiceScreen> createState() => _DementiaVoiceScreenState();
}

class _DementiaVoiceScreenState extends State<DementiaVoiceScreen> with TickerProviderStateMixin {
  bool _isListening = false;
  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;
  Timer? _listeningTimer;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _pulseAnim = Tween<double>(begin: 1.0, end: 1.3).animate(CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
  }

  void _toggleListening() {
    if (_isListening) {
      setState(() => _isListening = false);
      _pulseCtrl.stop();
      _listeningTimer?.cancel();
    } else {
      setState(() => _isListening = true);
      _pulseCtrl.repeat(reverse: true);
      _listeningTimer = Timer(const Duration(seconds: 5), () {
        if (mounted) setState(() => _isListening = false);
        _pulseCtrl.stop();
      });
    }
  }

  final _reminders = [
    {'time': '08:00 AM', 'task': 'Take medication', 'icon': Icons.medication_rounded, 'color': ZyntraColors.cyan},
    {'time': '09:00 AM', 'task': 'Drink water (2 glasses)', 'icon': Icons.water_drop_rounded, 'color': ZyntraColors.cyan},
    {'time': '01:00 PM', 'task': 'Have lunch', 'icon': Icons.restaurant_rounded, 'color': ZyntraColors.amber},
    {'time': '06:00 PM', 'task': 'Evening walk', 'icon': Icons.directions_walk_rounded, 'color': ZyntraColors.green},
  ];

  final _familiarFaces = [
    {'name': 'Anita', 'relation': 'Daughter', 'photo': 'A'},
    {'name': 'Rahul', 'relation': 'Son', 'photo': 'R'},
    {'name': 'Dr. Sharma', 'relation': 'Doctor', 'photo': 'S'},
  ];

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _listeningTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      body: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: ZyntraColors.card,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: ZyntraColors.border, width: 2),
                      ),
                      child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 24),
                    ),
                  ),
                  const Spacer(),
                  Text('Dementia Care', style: GoogleFonts.poppins(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: ZyntraColors.card,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: ZyntraColors.border, width: 2),
                      ),
                      child: const Icon(Icons.home_rounded, color: Colors.white, size: 24),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _voiceSection(),
                    const SizedBox(height: 24),
                    Text('Daily Reminders', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    ..._reminders.map((r) => _reminderCard(r)),
                    const SizedBox(height: 24),
                    Text('Familiar Faces', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    _familiarFacesRow(),
                    const SizedBox(height: 24),
                    _sosButton(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _voiceSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: ZyntraColors.border, width: 2),
      ),
      child: Column(
        children: [
          Text('How can I help you?', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text('Tap the mic and speak your request', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 16)),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: _toggleListening,
            child: AnimatedBuilder(
              animation: _pulseAnim,
              builder: (ctx, child) {
                return Transform.scale(
                  scale: _isListening ? _pulseAnim.value : 1.0,
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isListening ? ZyntraColors.cyan.withValues(alpha: 0.2) : ZyntraColors.card,
                      border: Border.all(
                        color: _isListening ? ZyntraColors.cyan : ZyntraColors.border,
                        width: 3,
                      ),
                      boxShadow: _isListening
                          ? [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.4), blurRadius: 30, spreadRadius: 5)]
                          : null,
                    ),
                    child: Icon(
                      _isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
                      color: _isListening ? ZyntraColors.cyan : Colors.white,
                      size: 44,
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _isListening ? 'Listening...' : 'Tap to speak',
            style: GoogleFonts.inter(
              color: _isListening ? ZyntraColors.cyan : ZyntraColors.white70,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (_isListening)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (i) => TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.3, end: 1.0),
                  duration: Duration(milliseconds: 300 + i * 100),
                  builder: (ctx, val, _) => Container(
                    width: 6,
                    height: 20 * val,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    decoration: BoxDecoration(
                      color: ZyntraColors.cyan.withValues(alpha: val),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                )),
              ),
            ),
        ],
      ),
    );
  }

  Widget _reminderCard(Map<String, dynamic> r) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border, width: 2),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: (r['color'] as Color).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
            child: Icon(r['icon'] as IconData, color: r['color'] as Color, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(r['task'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                Text(r['time'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14)),
              ],
            ),
          ),
          Icon(Icons.check_circle_outline_rounded, color: ZyntraColors.white70, size: 28),
        ],
      ),
    );
  }

  Widget _familiarFacesRow() {
    return SizedBox(
      height: 120,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _familiarFaces.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (ctx, i) {
          final f = _familiarFaces[i];
          return Container(
            width: 100,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: ZyntraColors.border, width: 2),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: ZyntraColors.cyan.withValues(alpha: 0.2),
                  child: Text(f['photo'] as String, style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 22, fontWeight: FontWeight.w700)),
                ),
                const SizedBox(height: 6),
                Text(f['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                Text(f['relation'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _sosButton() {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Emergency contact notified!', style: GoogleFonts.inter(color: Colors.white, fontSize: 16)),
          backgroundColor: ZyntraColors.red,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 3),
        ));
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: ZyntraColors.red.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.5), width: 2),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.warning_rounded, color: ZyntraColors.red, size: 32),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('SOS Emergency', style: GoogleFonts.poppins(color: ZyntraColors.red, fontSize: 20, fontWeight: FontWeight.w700)),
                Text('Call caregiver immediately', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
