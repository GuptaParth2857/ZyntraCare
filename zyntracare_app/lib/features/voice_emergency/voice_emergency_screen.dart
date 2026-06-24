import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class VoiceEmergencyScreen extends StatefulWidget {
  const VoiceEmergencyScreen({super.key});
  @override State<VoiceEmergencyScreen> createState() => _VoiceEmergencyScreenState();
}

class _VoiceEmergencyScreenState extends State<VoiceEmergencyScreen> with TickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  late AnimationController _waveCtrl;
  late Animation<double> _scaleAnim;
  bool _isListening = false;
  bool _autoDetect = true;
  String _recognizedText = '';
  final _api = ApiService();
  final _voiceLog = <_VoiceLogEntry>[];
  final _random = Random();
  final _waveHeights = <double>[8, 12, 16, 10, 18, 14, 8, 12, 16, 10, 18, 14];

  final _commands = [
    _VoiceCommand('Help me', 'Triggers SOS emergency', Icons.warning_rounded, ZyntraColors.red),
    _VoiceCommand('Call ambulance', 'Triggers ambulance dispatch', Icons.local_hospital_rounded, ZyntraColors.red),
    _VoiceCommand("I'm hurt", 'Triggers first aid response', Icons.healing_rounded, ZyntraColors.amber),
    _VoiceCommand('Fire', 'Triggers fire emergency', Icons.fire_extinguisher_rounded, ZyntraColors.amber),
  ];

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))..repeat(reverse: true);
    _waveCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 800))..repeat();
    _scaleAnim = Tween<double>(begin: 1.0, end: 1.08).animate(CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _waveCtrl.dispose();
    super.dispose();
  }

  void _startListening() {
    setState(() {
      _isListening = true;
      _recognizedText = '';
    });
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted && _isListening) {
        _simulateVoiceCommand();
      }
    });
  }

  void _stopListening() {
    setState(() => _isListening = false);
  }

  void _simulateVoiceCommand() {
    final cmd = _commands[_random.nextInt(_commands.length)];
    setState(() {
      _recognizedText = cmd.phrase;
      _isListening = false;
      _voiceLog.insert(0, _VoiceLogEntry(cmd.phrase, DateTime.now()));
    });
    _executeCommand(cmd);
  }

  void _executeCommand(_VoiceCommand cmd) {
    final action = cmd.phrase.toLowerCase();
    if (action.contains('help')) {
      _triggerSos('SOS activated via voice: Help me');
    } else if (action.contains('ambulance')) {
      _callNumber('108');
    } else if (action.contains('hurt')) {
      _showFirstAidPrompt();
    } else if (action.contains('fire')) {
      _callNumber('101');
    }
  }

  void _triggerSos(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Row(children: [
        const Icon(Icons.check_circle_rounded, color: Colors.white),
        const SizedBox(width: 8),
        Expanded(child: Text(msg, style: GoogleFonts.inter(color: Colors.white))),
      ]),
      backgroundColor: ZyntraColors.red,
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 3),
    ));
    _api.createEmergencyCase({'type': 'voice_sos', 'message': msg, 'timestamp': DateTime.now().toIso8601String()});
  }

  void _callNumber(String number) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('Calling $number...', style: GoogleFonts.inter(color: Colors.white)),
      backgroundColor: ZyntraColors.green,
      behavior: SnackBarBehavior.floating,
    ));
  }

  void _showFirstAidPrompt() {
    showModalBottomSheet(
      context: context,
      backgroundColor: ZyntraColors.card,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)))),
            const SizedBox(height: 20),
            Text('First Aid Guide', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            Text('For injury: Apply pressure to stop bleeding. Clean wound with water. Cover with sterile bandage. Seek medical help if severe.',
              style: GoogleFonts.inter(color: ZyntraColors.white70, height: 1.6)),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: () => Navigator.pop(ctx),
              child: Container(
                width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]), borderRadius: BorderRadius.circular(16)),
                child: Center(child: Text('Got it', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600))),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _testVoice() {
    _startListening();
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) _stopListening();
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('Voice test: Microphone working', style: GoogleFonts.inter(color: Colors.white)),
      backgroundColor: ZyntraColors.green,
      behavior: SnackBarBehavior.floating,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 40),
          child: Column(
            children: [
              _buildHeader(),
              const SizedBox(height: 32),
              _buildVoiceButton(),
              const SizedBox(height: 32),
              if (_recognizedText.isNotEmpty) _buildRecognizedText(),
              const SizedBox(height: 24),
              _buildVoiceCommands(),
              const SizedBox(height: 24),
              _buildQuickActions(),
              const SizedBox(height: 24),
              _buildControls(),
              const SizedBox(height: 24),
              if (_voiceLog.isNotEmpty) _buildVoiceLog(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
              child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Text('Voice Emergency', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
          const Spacer(),
          GestureDetector(
            onTap: _testVoice,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
              child: Text('Test Voice', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVoiceButton() {
    return GestureDetector(
      onTapDown: (_) => _startListening(),
      onTapUp: (_) => _stopListening(),
      onTapCancel: _stopListening,
      child: AnimatedBuilder(
        animation: _scaleAnim,
        builder: (_, _) => Transform.scale(
          scale: _isListening ? _scaleAnim.value : 1.0,
          child: Column(
            children: [
              Container(
                width: 200, height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: _isListening
                      ? const RadialGradient(colors: [ZyntraColors.red, ZyntraColors.purple])
                      : const RadialGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                  boxShadow: _isListening
                      ? [BoxShadow(color: ZyntraColors.red.withValues(alpha: _pulseCtrl.value * 0.6), blurRadius: 60, spreadRadius: 10)]
                      : [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: _pulseCtrl.value * 0.3), blurRadius: 40, spreadRadius: 5)],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(_isListening ? Icons.mic_rounded : Icons.mic_none_rounded, color: Colors.white, size: 56),
                    const SizedBox(height: 8),
                    Text(
                      _isListening ? 'LISTENING...' : 'PRESS & HOLD\nTO SPEAK',
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700, height: 1.3),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (_isListening) _buildWaveform(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWaveform() {
    return AnimatedBuilder(
      animation: _waveCtrl,
      builder: (_, _) => SizedBox(
        height: 40,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_waveHeights.length, (i) {
            final h = _waveHeights[i] + 6 * sin(_waveCtrl.value * pi * 2 + i * 0.5).abs();
            return Container(
              width: 3,
              height: h,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [ZyntraColors.cyan.withValues(alpha: 0.4), ZyntraColors.red],
                  begin: Alignment.bottomCenter, end: Alignment.topCenter,
                ),
                borderRadius: BorderRadius.circular(2),
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildRecognizedText() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 32),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.green.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 20),
          const SizedBox(width: 10),
          Text('"$_recognizedText"', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
        ],
      ),
    ).animate().scale(duration: 300.ms, curve: Curves.elasticOut);
  }

  Widget _buildVoiceCommands() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text('Voice Commands', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
        ),
        const SizedBox(height: 12),
        ..._commands.map((cmd) => Container(
          margin: const EdgeInsets.fromLTRB(20, 0, 20, 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: cmd.color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: Icon(cmd.icon, color: cmd.color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Say "${cmd.phrase}"', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                    Text(cmd.description, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                  ],
                ),
              ),
              Icon(Icons.volume_up_rounded, color: ZyntraColors.white40, size: 18),
            ],
          ),
        )),
      ],
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text('Quick Actions', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              Expanded(child: _quickActionCard('Call 108', 'Ambulance', Icons.local_hospital_rounded, ZyntraColors.red, () => _callNumber('108'))),
              const SizedBox(width: 10),
              Expanded(child: _quickActionCard('Call 101', 'Fire', Icons.fire_extinguisher_rounded, ZyntraColors.amber, () => _callNumber('101'))),
            ],
          ),
        ),
        const SizedBox(height: 10),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              Expanded(child: _quickActionCard('Call 100', 'Police', Icons.local_police_rounded, ZyntraColors.indigo, () => _callNumber('100'))),
              const SizedBox(width: 10),
              Expanded(child: _quickActionCard('Share', 'Location', Icons.my_location_rounded, ZyntraColors.cyan, () {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text('Location shared with emergency contacts', style: GoogleFonts.inter(color: Colors.white)),
                  backgroundColor: ZyntraColors.green, behavior: SnackBarBehavior.floating,
                ));
              })),
            ],
          ),
        ),
      ],
    );
  }

  Widget _quickActionCard(String title, String subtitle, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [color.withValues(alpha: 0.15), color.withValues(alpha: 0.05)], begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(title, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
            Text(subtitle, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
          ],
        ),
      ),
    );
  }

  Widget _buildControls() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: _testVoice,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(14), border: Border.all(color: ZyntraColors.border)),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Icon(Icons.volume_up_rounded, color: ZyntraColors.white70, size: 20),
                  const SizedBox(width: 8),
                  Text('Test Voice', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                ]),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _autoDetect = !_autoDetect),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: _autoDetect ? ZyntraColors.cyan.withValues(alpha: 0.1) : ZyntraColors.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: _autoDetect ? ZyntraColors.cyan.withValues(alpha: 0.4) : ZyntraColors.border),
                ),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.language_rounded, color: _autoDetect ? ZyntraColors.cyan : ZyntraColors.white70, size: 20),
                  const SizedBox(width: 8),
                  Text(_autoDetect ? 'Auto ON' : 'Auto OFF', style: GoogleFonts.inter(color: _autoDetect ? ZyntraColors.cyan : Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                ]),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVoiceLog() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text('Recent Voice Commands', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
        ),
        const SizedBox(height: 12),
        ..._voiceLog.take(5).map((entry) => Container(
          margin: const EdgeInsets.fromLTRB(20, 0, 20, 6),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border)),
          child: Row(
            children: [
              const Icon(Icons.mic_rounded, color: ZyntraColors.cyan, size: 16),
              const SizedBox(width: 10),
              Expanded(
                child: Text('"${entry.command}"', style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
              ),
              Text('${entry.time.hour.toString().padLeft(2, '0')}:${entry.time.minute.toString().padLeft(2, '0')}', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
            ],
          ),
        )),
      ],
    );
  }
}

class _VoiceCommand {
  final String phrase;
  final String description;
  final IconData icon;
  final Color color;
  const _VoiceCommand(this.phrase, this.description, this.icon, this.color);
}

class _VoiceLogEntry {
  final String command;
  final DateTime time;
  const _VoiceLogEntry(this.command, this.time);
}
