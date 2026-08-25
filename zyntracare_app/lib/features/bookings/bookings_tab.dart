import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';
import '../../data/models/models.dart';

class BookingsTab extends StatefulWidget {
  const BookingsTab({super.key});
  @override State<BookingsTab> createState() => _BookingsTabState();
}

class _BookingsTabState extends State<BookingsTab> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  List<Appointment> _appointments = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    _loadAppointments();
    _tabCtrl.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadAppointments() async {
    setState(() => _loading = true);
    try {
      await apiService.getHospitals();
      if (mounted) setState(() => _appointments = _placeholderAppointments());
    } catch (e) {
      if (mounted) setState(() => _appointments = _placeholderAppointments());
    }
    if (mounted) setState(() => _loading = false);
  }

  List<Appointment> _placeholderAppointments() {
    return [
      Appointment(id: '1', hospitalId: '1', hospitalName: 'Apollo Hospital', doctorId: '1', doctorName: 'Dr. Rajesh Kumar', specialty: 'Cardiology', date: '2026-07-10', time: '10:00 AM', status: 'confirmed', fee: 1000, isOnline: false),
      Appointment(id: '2', hospitalId: '2', hospitalName: 'AIIMS Bhubaneswar', doctorId: '2', doctorName: 'Dr. Priya Sharma', specialty: 'Neurology', date: '2026-07-15', time: '02:00 PM', status: 'pending', fee: 1200, isOnline: true),
      Appointment(id: '3', hospitalId: '3', hospitalName: 'Sum Hospital', doctorId: '3', doctorName: 'Dr. Amit Panda', specialty: 'Orthopedics', date: '2026-06-28', time: '11:00 AM', status: 'completed', fee: 800, isOnline: false),
      Appointment(id: '4', hospitalId: '1', hospitalName: 'Apollo Hospital', doctorId: '4', doctorName: 'Dr. Sunita Das', specialty: 'Pediatrics', date: '2026-06-20', time: '09:00 AM', status: 'cancelled', fee: 600, isOnline: false),
      Appointment(id: '5', hospitalId: '5', hospitalName: 'Care Hospital', doctorId: '5', doctorName: 'Dr. Suresh Rout', specialty: 'Dermatology', date: '2026-07-05', time: '03:00 PM', status: 'pending', fee: 700, isOnline: true),
    ];
  }

  List<Appointment> get _upcoming => _appointments.where((a) => a.status == 'confirmed' || a.status == 'pending').toList();
  List<Appointment> get _past => _appointments.where((a) => a.status == 'completed' || a.status == 'cancelled').toList();

  bool get _showEmpty => !_loading && _appointments.isEmpty;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('My Bookings', style: GoogleFonts.poppins(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
                    const Spacer(),
                    GestureDetector(
                      onTap: _showBookingForm,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 12)],
                        ),
                        child: const Icon(Icons.add_rounded, color: Colors.white, size: 22),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text('Manage your upcoming appointments', style: GoogleFonts.inter(color: ZyntraColors.white70)),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: ZyntraColors.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: ZyntraColors.border),
                  ),
                  child: TabBar(
                    controller: _tabCtrl,
                    indicator: BoxDecoration(
                      gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    indicatorPadding: const EdgeInsets.all(4),
                    labelColor: Colors.white,
                    unselectedLabelColor: ZyntraColors.white70,
                    labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
                    tabs: [
                      Tab(text: 'Upcoming (${_upcoming.length})'),
                      Tab(text: 'Past (${_past.length})'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? _buildShimmer()
                : _showEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        color: ZyntraColors.cyan,
                        backgroundColor: ZyntraColors.card,
                        onRefresh: _loadAppointments,
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                          itemCount: _tabCtrl.index == 0 ? _upcoming.length : _past.length,
                          itemBuilder: (_, i) => _appointmentCard(_tabCtrl.index == 0 ? _upcoming[i] : _past[i], i),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _appointmentCard(Appointment a, int i) {
    final colors = {
      'confirmed': ZyntraColors.green,
      'pending': ZyntraColors.amber,
      'completed': ZyntraColors.cyan,
      'cancelled': ZyntraColors.red,
    };
    final c = colors[a.status] ?? ZyntraColors.white70;
    final statusLabel = a.status[0].toUpperCase() + a.status.substring(1);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.card, ZyntraColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
        boxShadow: [BoxShadow(color: c.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: c.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: Icon(Icons.calendar_month_rounded, color: c, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(a.doctorName, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                    Text(a.specialty, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: c.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(statusLabel, style: GoogleFonts.inter(color: c, fontSize: 10, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: Row(
              children: [
                _infoChip(Icons.local_hospital_rounded, a.hospitalName),
                const SizedBox(width: 16),
                _infoChip(Icons.calendar_today_rounded, a.date),
                const SizedBox(width: 16),
                _infoChip(Icons.access_time_rounded, a.time),
                const Spacer(),
                Text('\u20B9${a.fee.toInt()}', style: GoogleFonts.inter(color: ZyntraColors.green, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
          if (a.status == 'pending' || a.status == 'confirmed') ...[
            const SizedBox(height: 12),
            Row(
              children: [
                if (a.isOnline && a.meetingLink != null)
                  Expanded(
                    child: GestureDetector(
                      onTap: () {},
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                          const Icon(Icons.video_call_rounded, color: Colors.white, size: 14),
                          const SizedBox(width: 4),
                          Text('Join', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
                        ]),
                      ),
                    ),
                  ),
                if (a.isOnline && a.meetingLink != null) const SizedBox(width: 8),
                Expanded(
                  child: GestureDetector(
                    onTap: () {},
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: ZyntraColors.red.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.3)),
                      ),
                      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const Icon(Icons.cancel_rounded, color: ZyntraColors.red, size: 14),
                        const SizedBox(width: 4),
                        Text('Cancel', style: GoogleFonts.inter(color: ZyntraColors.red, fontWeight: FontWeight.w600, fontSize: 12)),
                      ]),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    ).animate().fadeIn(delay: (i * 60).ms).slideY(begin: 0.1, end: 0);
  }

  Widget _infoChip(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: ZyntraColors.white40, size: 13),
        const SizedBox(width: 4),
        Text(text, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
      ],
    );
  }

  void _showBookingForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
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
              Text('Book an Appointment', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 20),
              TextField(
                style: GoogleFonts.inter(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search for doctor or hospital...',
                  hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
                  prefixIcon: const Icon(Icons.search_rounded, color: ZyntraColors.cyan),
                  filled: true,
                  fillColor: ZyntraColors.surface,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.separated(
                  itemCount: _placeholderAppointments().length,
                  separatorBuilder: (_, _) => const Divider(color: ZyntraColors.border),
                  itemBuilder: (_, i) {
                    final a = _placeholderAppointments()[i];
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: CircleAvatar(
                        radius: 20,
                        backgroundColor: ZyntraColors.cyan.withValues(alpha: 0.15),
                        child: Text(a.doctorName[0], style: GoogleFonts.poppins(color: ZyntraColors.cyan)),
                      ),
                      title: Text(a.doctorName, style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w500)),
                      subtitle: Text('${a.specialty} \u2022 ${a.hospitalName}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                      trailing: GestureDetector(
                        onTap: () {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            content: Text('Appointment requested!', style: GoogleFonts.inter(color: Colors.white)),
                            backgroundColor: ZyntraColors.green,
                            behavior: SnackBarBehavior.floating,
                          ));
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('Book', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 11)),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120, height: 120,
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              shape: BoxShape.circle,
              border: Border.all(color: ZyntraColors.pink.withValues(alpha: 0.3), width: 2),
              boxShadow: [BoxShadow(color: ZyntraColors.pink.withValues(alpha: 0.1), blurRadius: 30)],
            ),
            child: const Icon(Icons.calendar_month_rounded, color: ZyntraColors.pink, size: 50),
          ).animate(onPlay: (ctrl) => ctrl.repeat(reverse: true)).scaleXY(end: 1.05, duration: 1500.ms),
          const SizedBox(height: 32),
          Text('No Upcoming Bookings', style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text("You haven't booked any appointments yet.\nFind a doctor and book your first visit.",
              style: GoogleFonts.inter(color: ZyntraColors.white70), textAlign: TextAlign.center),
          ),
          const SizedBox(height: 40),
          GestureDetector(
            onTap: _showBookingForm,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                borderRadius: BorderRadius.circular(30),
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.4), blurRadius: 16, offset: const Offset(0, 4))],
              ),
              child: Text('Book an Appointment', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ),
          ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2, end: 0),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: 3,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: ZyntraColors.card,
        highlightColor: ZyntraColors.border,
        child: Container(
          height: 160,
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(20)),
        ),
      ),
    );
  }
}
