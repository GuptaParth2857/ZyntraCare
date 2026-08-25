import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart' as webrtc;
import '../../core/theme.dart';
import '../../data/api_service.dart';

class VideoConsultScreen extends StatefulWidget {
  const VideoConsultScreen({super.key});
  @override State<VideoConsultScreen> createState() => _VideoConsultScreenState();
}

class _VideoConsultScreenState extends State<VideoConsultScreen> {
  bool _loading = true;
  bool _inCall = false;
  bool _muted = false;
  bool _speakerOn = false;
  webrtc.RTCVideoRenderer? _localRenderer;
  webrtc.RTCVideoRenderer? _remoteRenderer;
  webrtc.RTCPeerConnection? _pc;
  List<Map<String, dynamic>> _doctors = [];

  @override
  void initState() {
    super.initState();
    _loadDoctors();
  }

  Future<void> _loadDoctors() async {
    setState(() => _loading = true);
    try {
      final res = await apiService.getDoctors(specialty: 'telehealth');
      if (mounted) {
        final list = (res as List? ?? []);
        setState(() => _doctors = list.cast<Map<String, dynamic>>());
      }
    } catch (_) {
      if (mounted) setState(() => _doctors = _placeholderDoctors());
    }
    if (mounted) setState(() => _loading = false);
  }

  List<Map<String, dynamic>> _placeholderDoctors() => [
    {'name': 'Dr. Priya Sharma', 'specialty': 'Cardiologist', 'rating': 4.9, 'consultingFee': 800},
    {'name': 'Dr. Amit Patel', 'specialty': 'Neurologist', 'rating': 4.8, 'consultingFee': 1000},
    {'name': 'Dr. Sneha Verma', 'specialty': 'Dermatologist', 'rating': 4.7, 'consultingFee': 600},
    {'name': 'Dr. Rajesh Kumar', 'specialty': 'General Physician', 'rating': 4.6, 'consultingFee': 400},
  ];

  List<Map<String, dynamic>> _upcomingCalls() => [
    {'name': 'Dr. Priya Sharma', 'specialty': 'Cardiologist', 'time': 'Today, 3:00 PM', 'status': 'confirmed'},
    {'name': 'Dr. Amit Patel', 'specialty': 'Neurologist', 'time': 'Tomorrow, 10:30 AM', 'status': 'pending'},
  ];

  Future<void> _initWebRTC() async {
    _localRenderer = webrtc.RTCVideoRenderer();
    _remoteRenderer = webrtc.RTCVideoRenderer();
    await _localRenderer!.initialize();
    await _remoteRenderer!.initialize();

    final config = {
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'},
      ],
    };

    _pc = await webrtc.createPeerConnection(config);
    _pc!.onIceCandidate = (candidate) {};
    _pc!.onTrack = (event) {
      if (event.track.kind == 'video') {
        _remoteRenderer!.srcObject = event.streams[0];
        setState(() {});
      }
    };

    final stream = await webrtc.navigator.mediaDevices.getUserMedia({'video': true, 'audio': true});
    _localRenderer!.srcObject = stream;
    for (final track in stream.getTracks()) {
      await _pc!.addTrack(track, stream);
    }
    setState(() => _inCall = true);
  }

  void _toggleMute() {
    _localRenderer?.srcObject?.getAudioTracks().forEach((t) {
      t.enabled = _muted;
    });
    setState(() => _muted = !_muted);
  }

  void _toggleSpeaker() {
    setState(() => _speakerOn = !_speakerOn);
  }

  Future<void> _endCall() async {
    await _pc?.close();
    await _localRenderer?.dispose();
    await _remoteRenderer?.dispose();
    _pc = null;
    _localRenderer = null;
    _remoteRenderer = null;
    if (mounted) setState(() => _inCall = false);
  }

  @override
  void dispose() {
    _endCall();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_inCall) return _buildCallUI();
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
              child: Row(
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
                  Text('Video Consult', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => _showBookSheet(),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.add_rounded, color: Colors.white, size: 22),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : RefreshIndicator(
                      color: ZyntraColors.cyan,
                      backgroundColor: ZyntraColors.card,
                      onRefresh: _loadDoctors,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _sectionHeader('Upcoming Calls', Icons.schedule_rounded, ZyntraColors.cyan),
                            const SizedBox(height: 10),
                            ..._upcomingCalls().map((c) => _upcomingCallCard(c)),
                            const SizedBox(height: 24),
                            _sectionHeader('Available Doctors', Icons.person_search_rounded, ZyntraColors.purple),
                            const SizedBox(height: 10),
                            ..._doctors.map((d) => _doctorCard(d)),
                          ],
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCallUI() {
    return Scaffold(
      body: Stack(
        children: [
          if (_remoteRenderer != null)
            webrtc.RTCVideoView(_remoteRenderer!, mirror: false)
          else
            Container(color: ZyntraColors.bg),
          Positioned(
            top: 60,
            right: 16,
            child: Container(
              width: 120,
              height: 180,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
              ),
              child: _localRenderer != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: webrtc.RTCVideoView(_localRenderer!, mirror: true),
                    )
                  : Container(color: ZyntraColors.card, child: const Center(child: Icon(Icons.person, color: Colors.white, size: 32))),
            ),
          ),
          Positioned(
            top: 16,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('In Consultation', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
              ),
            ),
          ),
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _callControl(Icons.mic_rounded, _muted ? ZyntraColors.red : Colors.white, _toggleMute),
                const SizedBox(width: 20),
                _callControl(Icons.call_end_rounded, ZyntraColors.red, _endCall, size: 28, bgColor: ZyntraColors.red),
                const SizedBox(width: 20),
                _callControl(Icons.volume_up_rounded, _speakerOn ? ZyntraColors.cyan : Colors.white, _toggleSpeaker),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _callControl(IconData icon, Color color, VoidCallback onTap, {double size = 24, Color? bgColor}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: bgColor ?? ZyntraColors.card.withValues(alpha: 0.8),
          shape: BoxShape.circle,
          border: Border.all(color: color.withValues(alpha: 0.5)),
        ),
        child: Icon(icon, color: color, size: size),
      ),
    );
  }

  Widget _sectionHeader(String title, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 16),
        ),
        const SizedBox(width: 8),
        Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _upcomingCallCard(Map<String, dynamic> call) {
    final confirmed = call['status'] == 'confirmed';
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: confirmed ? ZyntraColors.green.withValues(alpha: 0.3) : ZyntraColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: ZyntraColors.cyan.withValues(alpha: 0.2),
            child: Text(call['name'][4].toUpperCase(), style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 20, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(call['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                Text(call['specialty'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                Row(
                  children: [
                    Icon(Icons.access_time_rounded, color: ZyntraColors.white40, size: 11),
                    const SizedBox(width: 3),
                    Text(call['time'] as String, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: confirmed ? ZyntraColors.green.withValues(alpha: 0.15) : ZyntraColors.amber.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(confirmed ? 'Confirmed' : 'Pending', style: GoogleFonts.inter(color: confirmed ? ZyntraColors.green : ZyntraColors.amber, fontSize: 9, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _initWebRTC(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.video_call_rounded, color: Colors.white, size: 14),
                  const SizedBox(width: 4),
                  Text('Join', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _doctorCard(Map<String, dynamic> d) {
    final name = d['name'] as String? ?? 'Dr. Specialist';
    final specialty = d['specialty'] as String? ?? 'General Physician';
    final rating = d['rating'] ?? 4.5;
    final fee = d['consultingFee'] ?? 500;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: ZyntraColors.purple.withValues(alpha: 0.2),
            child: Text(name[4].toUpperCase(), style: GoogleFonts.poppins(color: ZyntraColors.purple, fontSize: 20, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                Text(specialty, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                Row(
                  children: [
                    Icon(Icons.star_rounded, color: ZyntraColors.amber, size: 14),
                    const SizedBox(width: 2),
                    Text('$rating', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 11, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 8),
                    Text('\u20B9$fee', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 11, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _showBookSheet(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.calendar_today_rounded, color: Colors.white, size: 13),
                  const SizedBox(width: 4),
                  Text('Book', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showBookSheet() {
    final doctors = _doctors.isNotEmpty ? _doctors : _placeholderDoctors();
    DateTime selectedDate = DateTime.now();
    TimeOfDay selectedTime = TimeOfDay.now();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
          height: MediaQuery.of(ctx).size.height * 0.7,
          decoration: const BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40, height: 4,
                    decoration: BoxDecoration(color: ZyntraColors.border, borderRadius: BorderRadius.circular(4)),
                  ),
                ),
                const SizedBox(height: 20),
                Text('Book Consultation', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
                const SizedBox(height: 20),
                Text('Select Doctor', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 8),
                SizedBox(
                  height: 110,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: doctors.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 10),
                    itemBuilder: (_, i) {
                      final d = doctors[i];
                      return Container(
                        width: 100,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: ZyntraColors.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: ZyntraColors.border),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircleAvatar(
                              radius: 18,
                              backgroundColor: ZyntraColors.cyan.withValues(alpha: 0.2),
                              child: Text((d['name'] as String)[4].toUpperCase(), style: GoogleFonts.poppins(color: ZyntraColors.cyan, fontSize: 16)),
                            ),
                            const SizedBox(height: 4),
                            Text((d['name'] as String).split(' ').last, style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
                            Text(d['specialty'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 8), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
                Text('Select Date', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: ctx,
                      initialDate: selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 30)),
                      builder: (ctx, child) => Theme(data: _datePickerTheme(), child: child!),
                    );
                    if (date != null) setSheetState(() => selectedDate = date);
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: ZyntraColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: ZyntraColors.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_month_rounded, color: ZyntraColors.cyan, size: 18),
                        const SizedBox(width: 10),
                        Text(
                          '${selectedDate.day}/${selectedDate.month}/${selectedDate.year}',
                          style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text('Select Time', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () async {
                    final time = await showTimePicker(
                      context: ctx,
                      initialTime: selectedTime,
                      builder: (ctx, child) => Theme(data: _datePickerTheme(), child: child!),
                    );
                    if (time != null) setSheetState(() => selectedTime = time);
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: ZyntraColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: ZyntraColors.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.access_time_rounded, color: ZyntraColors.cyan, size: 18),
                        const SizedBox(width: 10),
                        Text(
                          selectedTime.format(context),
                          style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('Consultation booked for ${selectedDate.day}/${selectedDate.month} at ${selectedTime.format(context)}',
                        style: GoogleFonts.inter(color: Colors.white)),
                      backgroundColor: ZyntraColors.green,
                      behavior: SnackBarBehavior.floating,
                    ));
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
          ),
        ),
      ),
    );
  }

  ThemeData _datePickerTheme() {
    return ThemeData.dark().copyWith(
      colorScheme: const ColorScheme.dark(
        primary: ZyntraColors.cyan,
        onPrimary: Colors.white,
        surface: ZyntraColors.card,
        onSurface: Colors.white,
      ),
      datePickerTheme: DatePickerThemeData(
        backgroundColor: ZyntraColors.card,
        surfaceTintColor: ZyntraColors.surface,
        headerBackgroundColor: ZyntraColors.surface,
        headerForegroundColor: Colors.white,
        dayBackgroundColor: WidgetStateProperty.resolveWith((_) => null),
        dayForegroundColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? Colors.white : ZyntraColors.white70),
        dayStyle: GoogleFonts.inter(),
        todayForegroundColor: WidgetStateProperty.resolveWith((_) => ZyntraColors.cyan),
        todayBorder: const BorderSide(color: ZyntraColors.cyan),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: ZyntraColors.border)),
        ),
      ),
      timePickerTheme: TimePickerThemeData(
        backgroundColor: ZyntraColors.card,
        dialBackgroundColor: ZyntraColors.surface,
        dialHandColor: ZyntraColors.cyan,
        dialTextColor: Colors.white,
        entryModeIconColor: ZyntraColors.cyan,
        hourMinuteColor: ZyntraColors.surface,
        hourMinuteTextColor: Colors.white,
        dayPeriodColor: ZyntraColors.surface,
        dayPeriodTextColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: 4,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 90,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}
