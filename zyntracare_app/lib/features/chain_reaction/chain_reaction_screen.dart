import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class ChainReactionScreen extends StatefulWidget {
  const ChainReactionScreen({super.key});
  @override State<ChainReactionScreen> createState() => _ChainReactionScreenState();
}

class _ChainReactionScreenState extends State<ChainReactionScreen> with TickerProviderStateMixin {
  bool _isPlaying = true;
  int _currentStep = 0;
  final List<_ChainStep> _steps = [
    _ChainStep(Icons.monitor_heart_rounded, 'Wearable Detection', 'Smart patch detects abnormal vitals and triggers emergency protocol.', ZyntraColors.cyan),
    _ChainStep(Icons.link_rounded, 'Blockchain Record', 'Event hash locked on-chain with encrypted health data.', ZyntraColors.purple),
    _ChainStep(Icons.local_hospital_rounded, 'Emergency Triage', 'Drone dispatched with AED. Hospital alerted with patient data.', ZyntraColors.red),
    _ChainStep(Icons.account_balance_wallet_rounded, 'Smart Wallet Claim', 'Insurance auto-approved via smart contract. Funds released in 2 mins.', ZyntraColors.green),
  ];

  final List<_LogEntry> _logs = [];
  int _heartRate = 88;
  int _droneEta = 120;
  int _claimAmount = 0;

  late AnimationController _pulseCtrl;
  Timer? _stepTimer;
  Timer? _logTimer;
  Timer? _counterTimer;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: 1500.ms, lowerBound: 0.85, upperBound: 1.0)
      ..repeat(reverse: true);
    _startAutoPlay();
  }

  void _startAutoPlay() {
    _addLog('System initialized', ZyntraColors.cyan);
    _stepTimer = Timer.periodic(2.seconds, (_) {
      if (!mounted || !_isPlaying) return;
      if (_currentStep < _steps.length) {
        setState(() => _currentStep++);
        final step = _steps[_currentStep - 1];
        _addLog('${step.title} — activated', step.color);
        if (_currentStep == 1) {
          setState(() { _heartRate = 132; });
          _addLog('Heart rate critical: 132 bpm', ZyntraColors.red);
        } else if (_currentStep == 2) {
          _addLog('Blockchain hash: 0x7F3A...B9E2 confirmed', ZyntraColors.purple);
        } else if (_currentStep == 3) {
          setState(() { _droneEta = 45; });
          _addLog('Drone dispatched. ETA 45 seconds', ZyntraColors.amber);
          _startCounters();
        } else if (_currentStep == 4) {
          setState(() { _claimAmount = 25000; });
          _addLog('Insurance claim approved: \$25,000 USD', ZyntraColors.green);
        }
        if (_currentStep >= _steps.length) {
          _stepTimer?.cancel();
        }
      }
    });

    _logTimer = Timer.periodic(4.seconds, (_) {
      if (!mounted || !_isPlaying) return;
      final mockLogs = [
        'Vitals relayed via BLE 5.0',
        'Node validation: 12/15 consensus',
        'Triage algorithm: Level 1 critical',
        'Smart contract: 0x8D2F...A1C3 executed',
      ];
      _addLog(mockLogs[DateTime.now().millisecondsSinceEpoch % mockLogs.length], ZyntraColors.white70);
    });
  }

  void _startCounters() {
    _counterTimer = Timer.periodic(1.seconds, (_) {
      if (!mounted || !_isPlaying) return;
      setState(() {
        if (_droneEta > 0) _droneEta--;
        if (_heartRate > 72) _heartRate--;
      });
    });
  }

  void _addLog(String msg, Color color) {
    setState(() {
      _logs.insert(0, _LogEntry(msg, color));
      if (_logs.length > 20) _logs.removeLast();
    });
  }

  void _togglePlay() {
    setState(() => _isPlaying = !_isPlaying);
    if (_isPlaying) {
      if (_currentStep >= _steps.length) return;
      _startAutoPlay();
    } else {
      _stepTimer?.cancel();
      _logTimer?.cancel();
      _counterTimer?.cancel();
    }
  }

  void _reset() {
    _stepTimer?.cancel();
    _logTimer?.cancel();
    _counterTimer?.cancel();
    setState(() {
      _isPlaying = true;
      _currentStep = 0;
      _heartRate = 88;
      _droneEta = 120;
      _claimAmount = 0;
      _logs.clear();
    });
    _startAutoPlay();
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _stepTimer?.cancel();
    _logTimer?.cancel();
    _counterTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 24),
              _buildProgressBar(),
              const SizedBox(height: 28),
              _buildSteps(),
              const SizedBox(height: 28),
              _buildLiveCounters(),
              const SizedBox(height: 24),
              _buildControls(),
              const SizedBox(height: 24),
              _buildTimeline(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Chain Reaction', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
            Text('Automated Emergency Protocol', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
          ],
        ),
        const Spacer(),
        ScaleTransition(
          scale: _pulseCtrl,
          child: Container(
            width: 10, height: 10,
            decoration: BoxDecoration(
              color: _isPlaying ? ZyntraColors.green : ZyntraColors.amber,
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: (_isPlaying ? ZyntraColors.green : ZyntraColors.amber).withValues(alpha: 0.5), blurRadius: 8)],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProgressBar() {
    final progress = _steps.isEmpty ? 0.0 : _currentStep / _steps.length;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text('Protocol Progress', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
            const Spacer(),
            Text('${(_currentStep * 100 ~/ _steps.length)}%', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 10),
        AnimatedContainer(
          duration: 600.ms,
          curve: Curves.easeInOut,
          height: 6,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(3),
            gradient: LinearGradient(
              colors: [ZyntraColors.cyan, ZyntraColors.purple],
              stops: [progress, progress],
            ),
            color: ZyntraColors.border,
          ),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Container(
              width: MediaQuery.of(context).size.width - 40,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(3),
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
              ),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return AnimatedContainer(
                    duration: 600.ms,
                    curve: Curves.easeInOut,
                    width: constraints.maxWidth * progress,
                    height: 6,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(3),
                      gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: List.generate(_steps.length, (i) {
            final active = i < _currentStep;
            final current = i == _currentStep && _currentStep < _steps.length;
            return Expanded(
              child: Row(
                children: [
                  AnimatedContainer(
                    duration: 400.ms,
                    width: 28, height: 28,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: active ? _steps[i].color : (current ? ZyntraColors.cyan : ZyntraColors.border),
                      boxShadow: active || current
                          ? [BoxShadow(color: _steps[i].color.withValues(alpha: 0.3), blurRadius: 8)]
                          : null,
                    ),
                    child: Center(
                      child: active
                          ? const Icon(Icons.check_rounded, color: Colors.white, size: 14)
                          : Text('${i + 1}', style: GoogleFonts.inter(color: current ? Colors.white : ZyntraColors.white40, fontSize: 11)),
                    ),
                  ),
                  if (i < _steps.length - 1)
                    Expanded(
                      child: Container(
                        height: 2,
                        color: i < _currentStep ? _steps[i].color : ZyntraColors.border,
                      ),
                    ),
                ],
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildSteps() {
    return Column(
      children: List.generate(_steps.length, (i) {
        final active = i < _currentStep;
        final animDuration = 400.ms;
        return AnimatedContainer(
          duration: animDuration,
          curve: Curves.easeInOut,
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: active
                ? LinearGradient(
                    colors: [_steps[i].color.withValues(alpha: 0.08), ZyntraColors.card],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  )
                : null,
            color: active ? null : ZyntraColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: active ? _steps[i].color.withValues(alpha: 0.3) : ZyntraColors.border,
            ),
            boxShadow: active
                ? [BoxShadow(color: _steps[i].color.withValues(alpha: 0.1), blurRadius: 12, offset: const Offset(0, 4))]
                : null,
          ),
          child: Row(
            children: [
              AnimatedContainer(
                duration: animDuration,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: active ? _steps[i].color.withValues(alpha: 0.15) : ZyntraColors.border.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(_steps[i].icon, color: active ? _steps[i].color : ZyntraColors.white40, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_steps[i].title, style: GoogleFonts.inter(color: active ? Colors.white : ZyntraColors.white70, fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(_steps[i].desc, style: GoogleFonts.inter(color: active ? ZyntraColors.white70 : ZyntraColors.white40, fontSize: 11)),
                  ],
                ),
              ),
              if (active)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _steps[i].color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text('Done', style: GoogleFonts.inter(color: _steps[i].color, fontSize: 9, fontWeight: FontWeight.w600)),
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildLiveCounters() {
    return Container(
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
              const Icon(Icons.monitor_heart_rounded, color: ZyntraColors.red, size: 16),
              const SizedBox(width: 8),
              Text('Live Telemetry', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _counterTile('Heart Rate', '${_heartRate}', 'bpm', ZyntraColors.red, Icons.favorite_rounded),
              _counterTile('Drone ETA', '${_droneEta}s', '', ZyntraColors.amber, Icons.flight_rounded),
              _counterTile('Claim Amount', '\$${_claimAmount}', 'USD', ZyntraColors.green, Icons.currency_bitcoin_rounded),
            ],
          ),
        ],
      ),
    );
  }

  Widget _counterTile(String label, String value, String unit, Color color, IconData icon) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: ZyntraColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 6),
            Text(value, style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            if (unit.isNotEmpty)
              Text(unit, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 9)),
            const SizedBox(height: 2),
            Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 8)),
          ],
        ),
      ),
    );
  }

  Widget _buildControls() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        GestureDetector(
          onTap: _togglePlay,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
              borderRadius: BorderRadius.circular(14),
              boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 12)],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(_isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Text(_isPlaying ? 'Pause' : 'Play', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        GestureDetector(
          onTap: _reset,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: ZyntraColors.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.restart_alt_rounded, color: ZyntraColors.white70, size: 20),
                const SizedBox(width: 8),
                Text('Reset', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTimeline() {
    return Container(
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
              const Icon(Icons.timeline_rounded, color: ZyntraColors.cyan, size: 16),
              const SizedBox(width: 8),
              Text('Event Timeline', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text('${_logs.length} events', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
            ],
          ),
          const SizedBox(height: 14),
          ...(_logs.isEmpty
              ? [Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Center(child: Text('Waiting for events...', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 12))),
                )]
              : _logs.take(10).toList().asMap().entries.map((entry) {
                  final log = entry.value;
                  return AnimatedOpacity(
                    duration: 300.ms,
                    opacity: 1.0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        border: Border(bottom: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.3))),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 6, height: 6,
                            decoration: BoxDecoration(color: log.color, shape: BoxShape.circle),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(log.message, style: GoogleFonts.inter(color: Colors.white, fontSize: 11)),
                          ),
                          Text(log.time, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 8)),
                        ],
                      ),
                    ),
                  );
                })),
        ],
      ),
    );
  }
}

class _ChainStep {
  final IconData icon;
  final String title;
  final String desc;
  final Color color;
  const _ChainStep(this.icon, this.title, this.desc, this.color);
}

class _LogEntry {
  final String message;
  final Color color;
  final String time;
  _LogEntry(this.message, this.color) : time = _formatTime(DateTime.now());

  static String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    final s = dt.second.toString().padLeft(2, '0');
    return '$h:$m:$s';
  }
}
