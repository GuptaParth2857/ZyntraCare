import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class WellnessScreen extends StatefulWidget {
  const WellnessScreen({super.key});
  @override State<WellnessScreen> createState() => _WellnessScreenState();
}

class _WellnessScreenState extends State<WellnessScreen> with TickerProviderStateMixin {
  final _api = ApiService();
  bool _loading = true;
  int _wellnessScore = 78;
  int _selectedMood = -1;
  final _moodNoteCtrl = TextEditingController();
  final _moodHistory = <int>[4, 3, 5, 2, 4, 3, 4];
  final _weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  final _weekPlan = <String>['Walk', 'Yoga', 'Rest', 'Run', 'Meditate', 'Walk', 'Rest'];
  int _meditationSeconds = 0;
  bool _meditationRunning = false;
  Timer? _meditationTimer;
  int _selectedDuration = 5;
  late AnimationController _meditationAnimCtrl;
  int _currentTip = 0;

  final _tips = [
    'Drink at least 8 glasses of water daily for optimal hydration.',
    'Take a 5-minute mindfulness break every hour.',
    'Walking 10,000 steps a day boosts cardiovascular health.',
    'Quality sleep of 7-8 hours improves immunity and focus.',
    'Include colorful vegetables in every meal for essential nutrients.',
  ];

  final _moods = [
    _MoodDef('Great', Icons.sentiment_very_satisfied_rounded, ZyntraColors.green),
    _MoodDef('Good', Icons.sentiment_satisfied_rounded, ZyntraColors.cyan),
    _MoodDef('Okay', Icons.sentiment_neutral_rounded, ZyntraColors.amber),
    _MoodDef('Sad', Icons.sentiment_dissatisfied_rounded, ZyntraColors.amber),
    _MoodDef('Bad', Icons.sentiment_very_dissatisfied_rounded, ZyntraColors.red),
  ];

  final _challenges = [
    _ChallengeDef('Walk 10k steps', Icons.directions_walk_rounded, ZyntraColors.green, 0.6, 3, 150),
    _ChallengeDef('Meditate 10 min', Icons.self_improvement_rounded, ZyntraColors.purple, 0.3, 1, 50),
    _ChallengeDef('Drink 8 glasses water', Icons.water_drop_rounded, ZyntraColors.cyan, 0.8, 5, 200),
    _ChallengeDef('Sleep 8 hours', Icons.bedtime_rounded, ZyntraColors.indigo, 0.4, 2, 100),
  ];

  @override
  void initState() {
    super.initState();
    _meditationAnimCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
    _loadData();
    _startTipTimer();
  }

  @override
  void dispose() {
    _meditationAnimCtrl.dispose();
    _meditationTimer?.cancel();
    _moodNoteCtrl.dispose();
    super.dispose();
  }

  void _startTipTimer() {
    Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted) setState(() => _currentTip = (_currentTip + 1) % _tips.length);
    });
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final data = await _api.get('/api/wellness');
      if (data is Map && data['success'] == false) throw Exception();
      if (data is Map) {
        setState(() {
          _wellnessScore = (data['score'] ?? _wellnessScore) as int;
        });
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _startMeditation() {
    setState(() {
      _meditationRunning = true;
      _meditationSeconds = 0;
    });
    _meditationTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() {
          _meditationSeconds++;
          if (_meditationSeconds >= _selectedDuration * 60) _stopMeditation();
        });
      }
    });
  }

  void _stopMeditation() {
    _meditationTimer?.cancel();
    setState(() => _meditationRunning = false);
    if (_meditationSeconds >= _selectedDuration * 60) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Meditation complete! Great job.', style: GoogleFonts.inter(color: Colors.white)),
        backgroundColor: ZyntraColors.green, behavior: SnackBarBehavior.floating,
      ));
    }
  }

  String get _meditationDisplay {
    final m = (_meditationSeconds ~/ 60).toString().padLeft(2, '0');
    final s = (_meditationSeconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading
            ? _buildShimmer()
            : RefreshIndicator(
                color: ZyntraColors.cyan,
                backgroundColor: ZyntraColors.card,
                onRefresh: _loadData,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.only(bottom: 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(),
                      const SizedBox(height: 20),
                      _buildScoreGauge(),
                      const SizedBox(height: 24),
                      _buildTipsCarousel(),
                      const SizedBox(height: 24),
                      _buildMoodTracker(),
                      const SizedBox(height: 24),
                      _buildMeditationTimer(),
                      const SizedBox(height: 24),
                      _buildChallenges(),
                      const SizedBox(height: 24),
                      _buildWeeklyPlan(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight)),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Text('Wellness', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
          const Spacer(),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.notifications_rounded, color: Colors.white, size: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildScoreGauge() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(24), border: Border.all(color: ZyntraColors.border)),
      child: Row(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 100, height: 100,
                child: CircularProgressIndicator(
                  value: _wellnessScore / 100,
                  strokeWidth: 8,
                  backgroundColor: ZyntraColors.border,
                  valueColor: const AlwaysStoppedAnimation<Color>(ZyntraColors.cyan),
                ),
              ),
              Text('$_wellnessScore', style: GoogleFonts.poppins(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
            ],
          ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Daily Wellness Score', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
                const SizedBox(height: 4),
                Text(_wellnessScore >= 80 ? 'Excellent! Keep it up!' : _wellnessScore >= 60 ? 'Good, room for improvement' : 'Let\'s boost your wellness',
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.trending_up_rounded, color: ZyntraColors.green, size: 14),
                      const SizedBox(width: 4),
                      Text('+5 pts this week', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildTipsCarousel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text('Wellness Tips', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 100,
          child: PageView.builder(
            onPageChanged: (i) => setState(() => _currentTip = i),
            itemCount: _tips.length,
            itemBuilder: (_, i) => Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [ZyntraColors.cyan.withValues(alpha: 0.1), ZyntraColors.purple.withValues(alpha: 0.05)]),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.lightbulb_outline, color: ZyntraColors.cyan, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(_tips[i], style: GoogleFonts.inter(color: Colors.white, fontSize: 13, height: 1.4)),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 300.ms),
          ),
        ),
        const SizedBox(height: 8),
        Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(_tips.length, (i) => Container(
              width: 6, height: 6,
              margin: const EdgeInsets.symmetric(horizontal: 3),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: i == _currentTip ? ZyntraColors.cyan : ZyntraColors.border,
              ),
            )),
          ),
        ),
      ],
    );
  }

  Widget _buildMoodTracker() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20), border: Border.all(color: ZyntraColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Mood Tracker', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.calendar_month_rounded, color: ZyntraColors.white70, size: 16),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(_moods.length, (i) {
              final m = _moods[i];
              final selected = _selectedMood == i;
              return GestureDetector(
                onTap: () => setState(() => _selectedMood = i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: selected ? m.color.withValues(alpha: 0.2) : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: selected ? m.color.withValues(alpha: 0.5) : Colors.transparent),
                  ),
                  child: Column(
                    children: [
                      Icon(m.icon, color: selected ? m.color : ZyntraColors.white40, size: 32),
                      const SizedBox(height: 4),
                      Text(m.label, style: GoogleFonts.inter(color: selected ? m.color : ZyntraColors.white40, fontSize: 10, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _moodNoteCtrl,
            style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Add a note about your day...',
              hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 13),
              filled: true,
              fillColor: ZyntraColors.surface,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: List.generate(_moodHistory.length, (i) {
              final mood = _moods[_moodHistory[i] % _moods.length];
              return Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Icon(mood.icon, color: mood.color.withValues(alpha: 0.6), size: 16),
              );
            }),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildMeditationTimer() {
    final progress = _meditationSeconds / (_selectedDuration * 60);
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [ZyntraColors.purple.withValues(alpha: 0.1), ZyntraColors.indigo.withValues(alpha: 0.05)]),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.purple.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              AnimatedBuilder(
                animation: _meditationAnimCtrl,
                builder: (_, _) => Icon(Icons.self_improvement_rounded, color: ZyntraColors.purple, size: 28).animate().rotate(end: _meditationAnimCtrl.value * 0.1),
              ),
              const SizedBox(width: 10),
              Text('Meditation Timer', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 20),
          AnimatedBuilder(
            animation: _meditationAnimCtrl,
            builder: (_, _) => Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 120, height: 120,
                  child: CircularProgressIndicator(
                    value: _meditationRunning ? progress : 0,
                    strokeWidth: 6,
                    backgroundColor: ZyntraColors.border,
                    valueColor: const AlwaysStoppedAnimation<Color>(ZyntraColors.purple),
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(_meditationRunning ? _meditationDisplay : '${_selectedDuration}:00',
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
                    Text(_meditationRunning ? 'remaining' : 'minutes', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (!_meditationRunning) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [5, 10, 15, 20].map((d) {
                final sel = _selectedDuration == d;
                return GestureDetector(
                  onTap: () => setState(() => _selectedDuration = d),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: sel ? ZyntraColors.purple : ZyntraColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: sel ? ZyntraColors.purple : ZyntraColors.border),
                    ),
                    child: Text('$d min', style: GoogleFonts.inter(color: sel ? Colors.white : ZyntraColors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
          ],
          GestureDetector(
            onTap: _meditationRunning ? _stopMeditation : _startMeditation,
            child: Container(
              width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                gradient: _meditationRunning
                    ? const LinearGradient(colors: [ZyntraColors.red, ZyntraColors.purple])
                    : const LinearGradient(colors: [ZyntraColors.purple, ZyntraColors.indigo]),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(_meditationRunning ? Icons.stop_rounded : Icons.play_arrow_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 6),
                  Text(_meditationRunning ? 'Stop' : 'Start Meditation', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                ]),
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildChallenges() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              Text('Wellness Challenges', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text('${_challenges.where((c) => c.progress >= 1.0).length}/${_challenges.length}',
                  style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        ..._challenges.map((c) => Container(
          margin: const EdgeInsets.fromLTRB(20, 0, 20, 10),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: ZyntraColors.border)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: c.color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                    child: Icon(c.icon, color: c.color, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(c.name, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                        Row(
                          children: [
                            const Icon(Icons.local_fire_department_rounded, color: ZyntraColors.amber, size: 12),
                            const SizedBox(width: 4),
                            Text('${c.streak} day streak', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 11)),
                            const SizedBox(width: 12),
                            const Icon(Icons.stars_rounded, color: ZyntraColors.cyan, size: 12),
                            const SizedBox(width: 4),
                            Text('${c.points} pts', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 11)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text('Joined "${c.name}" challenge!', style: GoogleFonts.inter(color: Colors.white)),
                        backgroundColor: ZyntraColors.green, behavior: SnackBarBehavior.floating,
                      ));
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: c.progress >= 1.0 ? const LinearGradient(colors: [ZyntraColors.green, ZyntraColors.teal]) : const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(c.progress >= 1.0 ? 'Done' : 'Start', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: c.progress.clamp(0.0, 1.0),
                  backgroundColor: ZyntraColors.border,
                  valueColor: AlwaysStoppedAnimation<Color>(c.color),
                  minHeight: 6,
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }

  Widget _buildWeeklyPlan() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20), border: Border.all(color: ZyntraColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Weekly Wellness Plan', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          Row(
            children: List.generate(7, (i) {
              final isToday = i == DateTime.now().weekday - 1;
              return Expanded(
                child: GestureDetector(
                  onTap: () {},
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isToday ? ZyntraColors.cyan.withValues(alpha: 0.15) : ZyntraColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isToday ? ZyntraColors.cyan.withValues(alpha: 0.4) : ZyntraColors.border),
                    ),
                    child: Column(
                      children: [
                        Text(_weekDays[i], style: GoogleFonts.inter(
                          color: isToday ? ZyntraColors.cyan : ZyntraColors.white70,
                          fontSize: 10, fontWeight: FontWeight.w600,
                        )),
                        const SizedBox(height: 4),
                        Icon(_getActivityIcon(_weekPlan[i]), color: isToday ? ZyntraColors.cyan : ZyntraColors.white40, size: 16),
                        const SizedBox(height: 2),
                        Text(_weekPlan[i], style: GoogleFonts.inter(
                          color: isToday ? Colors.white : ZyntraColors.white40,
                          fontSize: 8, fontWeight: FontWeight.w500,
                        ), textAlign: TextAlign.center),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  IconData _getActivityIcon(String activity) {
    switch (activity.toLowerCase()) {
      case 'walk': return Icons.directions_walk_rounded;
      case 'yoga': return Icons.self_improvement_rounded;
      case 'run': return Icons.directions_run_rounded;
      case 'meditate': return Icons.self_improvement_rounded;
      case 'rest': return Icons.bedtime_rounded;
      default: return Icons.check_circle_rounded;
    }
  }

  Widget _buildShimmer() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 100, 16, 100),
      children: [
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Container(height: 148, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24))),
        ),
        const SizedBox(height: 20),
        Shimmer.fromColors(
          baseColor: ZyntraColors.card,
          highlightColor: ZyntraColors.border,
          child: Container(height: 100, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
        ),
        const SizedBox(height: 16),
        ...List.generate(3, (_) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Shimmer.fromColors(
            baseColor: ZyntraColors.card,
            highlightColor: ZyntraColors.border,
            child: Container(height: 90, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          ),
        )),
      ],
    );
  }
}

class _MoodDef {
  final String label;
  final IconData icon;
  final Color color;
  const _MoodDef(this.label, this.icon, this.color);
}

class _ChallengeDef {
  final String name;
  final IconData icon;
  final Color color;
  final double progress;
  final int streak;
  final int points;
  const _ChallengeDef(this.name, this.icon, this.color, this.progress, this.streak, this.points);
}
