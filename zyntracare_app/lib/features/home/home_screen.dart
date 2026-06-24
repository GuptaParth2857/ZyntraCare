import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../data/services/api_service.dart';
import '../../data/services/mock_data_service.dart';
import '../../data/services/location_service.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService();
  int navIndex = 0;
  bool isLoading = true;
  String location = 'Delhi, India';
  final TextEditingController _searchController = TextEditingController();
  
  List<dynamic> hospitals = [];
  List<dynamic> doctors = [];
  List<dynamic> searchResults = [];
  Map<String, dynamic>? bedData;
  double? userLat;
  double? userLng;

  @override
  void initState() {
    super.initState();
    loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> loadData() async {
    setState(() => isLoading = true);
    
    var pos = await LocationService.getCurrentLocation();
    if (pos != null) {
      userLat = pos.latitude;
      userLng = pos.longitude;
      location = await LocationService.getAddressFromCoordinates(userLat!, userLng!);
    }
    
    try {
      if (userLat != null && userLng != null) {
        var hospitalRes = await _api.getNearbyHospitals(userLat!, userLng!, radius: 20);
        if (hospitalRes['success'] == true && hospitalRes['hospitals'] != null) {
          hospitals = hospitalRes['hospitals'];
        } else {
          hospitals = MockDataService.getHospitals();
        }
      } else {
        hospitals = MockDataService.getHospitals();
      }

      var doctorRes = await _api.getDoctors();
      if (doctorRes['success'] == true && doctorRes['doctors'] != null) {
        doctors = doctorRes['doctors'];
      } else {
        doctors = MockDataService.getDoctors();
      }

      var bedRes = await _api.getBedsRealtime();
      if (bedRes['success'] == true) bedData = bedRes;
    } catch (e) {
      hospitals = MockDataService.getHospitals();
      doctors = MockDataService.getDoctors();
    }

    if (mounted) setState(() => isLoading = false);
  }

  Future<void> _makeCall(String number) async {
    final Uri phoneUri = Uri(scheme: 'tel', path: number);
    try {
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(phoneUri);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Cannot make call to $number')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  void _onNavTap(int index) {
    setState(() => navIndex = index);
    switch (index) {
      case 0:
        break;
      case 1:
        _showSearchDialog();
        break;
      case 2:
        _showBookingsDialog();
        break;
      case 3:
        _showProfileDialog();
        break;
    }
  }

  void _showSearchDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          const Text('Search', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          TextField(
            controller: _searchController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Search hospitals, doctors...',
              hintStyle: const TextStyle(color: Colors.white38),
              prefixIcon: const Icon(Icons.search, color: Color(0xFF00D4FF)),
              filled: true,
              fillColor: const Color(0xFF0F172A),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onSubmitted: (value) => _performSearch(value),
          ),
          const SizedBox(height: 16),
          Wrap(spacing: 8, children: [
            'Hospitals', 'Doctors', 'Medicines', 'Ambulance', 'Blood', 'Pharmacy'
          ].map((s) => ActionChip(label: Text(s, style: const TextStyle(color: Colors.white)), backgroundColor: const Color(0xFF0F172A), onPressed: () => _performSearch(s))).toList()),
        ]),
      ),
    );
  }

  Future<void> _performSearch(String query) async {
    if (query.isEmpty) return;
    setState(() => isLoading = true);
    Navigator.pop(context);
    
    try {
      var hospitalRes = await _api.getHospitals(search: query);
      var doctorRes = await _api.getDoctors(search: query);
      
      searchResults = [];
      if (hospitalRes['success'] == true && hospitalRes['hospitals'] != null) {
        searchResults.addAll(hospitalRes['hospitals']);
      }
      if (doctorRes['success'] == true && doctorRes['doctors'] != null) {
        searchResults.addAll(doctorRes['doctors']);
      }
    } catch (e) {
      searchResults = [];
    }
    
    setState(() => isLoading = false);
    _showSearchResultsDialog();
  }

  void _showSearchResultsDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Search Results', style: TextStyle(color: Colors.white)),
        content: SizedBox(
          width: double.maxFinite,
          height: 300,
          child: searchResults.isEmpty 
            ? const Center(child: Text('No results found', style: TextStyle(color: Colors.white54)))
            : ListView.builder(
                itemCount: searchResults.length,
                itemBuilder: (ctx, i) => ListTile(
                  leading: const Icon(Icons.local_hospital, color: Color(0xFF00D4FF)),
                  title: Text(searchResults[i]['name'] ?? 'Result', style: const TextStyle(color: Colors.white)),
                  subtitle: Text(searchResults[i]['city'] ?? '', style: const TextStyle(color: Colors.white54)),
                ),
              ),
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close'))],
      ),
    );
  }

  void _showBookingsDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('My Bookings', style: TextStyle(color: Colors.white)),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.calendar_today, color: Color(0xFF00D4FF), size: 48),
            SizedBox(height: 16),
            Text('No bookings yet', style: TextStyle(color: Colors.white54)),
            SizedBox(height: 8),
            Text('Book a doctor or hospital to see your appointments here.', style: TextStyle(color: Colors.white38, fontSize: 12), textAlign: TextAlign.center),
          ],
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close'))],
      ),
    );
  }

  void _showProfileDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('My Profile', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircleAvatar(radius: 40, backgroundColor: Color(0xFF00D4FF), child: Icon(Icons.person, size: 40, color: Colors.white)),
            const SizedBox(height: 16),
            const Text('Guest User', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Sign in to access all features', style: TextStyle(color: Colors.white54)),
            const SizedBox(height: 16),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00D4FF)),
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Sign In'),
            ),
          ],
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close'))],
      ),
    );
  }

  void _showNotifications() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Notifications', style: TextStyle(color: Colors.white)),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.notifications, color: Color(0xFF00D4FF), size: 48),
            SizedBox(height: 16),
            Text('No new notifications', style: TextStyle(color: Colors.white54)),
          ],
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close'))],
      ),
    );
  }

  void _showEmergencyDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Emergency Services', style: TextStyle(color: Colors.white)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          _emergencyBtn('Ambulance', '102', Icons.medical_services),
          _emergencyBtn('Police', '100', Icons.local_police),
          _emergencyBtn('Fire', '101', Icons.local_fire_department),
          _emergencyBtn('Blood Bank', '191', Icons.bloodtype),
        ]),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close'))],
      ),
    );
  }

  Widget _emergencyBtn(String label, String number, IconData icon) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: const Color(0xFF00D4FF).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: const Color(0xFF00D4FF)),
      ),
      title: Text(label, style: const TextStyle(color: Colors.white)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(number, style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.call, color: Colors.green),
            onPressed: () => _makeCall(number),
          ),
        ],
      ),
      onTap: () => _makeCall(number),
    );
  }

  void _showAIChat() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          const Text('AI Health Assistant', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          const Expanded(child: Center(child: Text('Ask me anything about your health...\n\n• Symptom analysis\n• Doctor recommendations\n• Health tips', style: TextStyle(color: Colors.white54), textAlign: TextAlign.center))),
          Row(children: [
            Expanded(child: TextField(
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Type your question...',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
              ),
            )),
            IconButton(icon: const Icon(Icons.send, color: Color(0xFF00D4FF)), onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sending to AI...')));
            }),
          ]),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        title: ShaderMask(
          shaderCallback: (b) => const LinearGradient(colors: [Color(0xFF00D4FF), Color(0xFF7B2FF7)]).createShader(b),
          child: const Text('ZyntraCare', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white)),
        ),
        actions: [
          GestureDetector(
            onTap: _showNotifications,
            child: Container(
              padding: const EdgeInsets.all(8),
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 22),
            ),
          ),
          GestureDetector(
            onTap: _showSearchDialog,
            child: Container(
              padding: const EdgeInsets.all(8),
              margin: const EdgeInsets.only(right: 16),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.search, color: Colors.white, size: 22),
            ),
          ),
        ],
      ),
      body: isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF)))
        : RefreshIndicator(
            onRefresh: loadData,
            color: const Color(0xFF00D4FF),
            child: CustomScrollView(slivers: [
              SliverToBoxAdapter(child: _buildHeader()),
              SliverToBoxAdapter(child: _quickAccess()),
              SliverToBoxAdapter(child: _emergencyCard()),
              SliverToBoxAdapter(child: _sectionTitle('Nearby Hospitals', 'See All')),
              SliverToBoxAdapter(child: _hospitalsList()),
              SliverToBoxAdapter(child: _sectionTitle('Top Doctors', 'See All')),
              SliverToBoxAdapter(child: _doctorsList()),
              SliverToBoxAdapter(child: _servicesSection()),
              SliverToBoxAdapter(child: _healthTips()),
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ]),
          ),
      bottomNavigationBar: _glassBottomNav(),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 180,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [const Color(0xFF1A1A2E), const Color(0xFF16213E), const Color(0xFF0F3460)],
        ),
      ),
      child: Stack(children: [
        Positioned(top: -50, right: -50, child: Container(width: 200, height: 200, decoration: BoxDecoration(shape: BoxShape.circle, gradient: RadialGradient(colors: [const Color(0xFF00D4FF).withValues(alpha: 0.3), Colors.transparent])))),
        Positioned(bottom: -30, left: -30, child: Container(width: 150, height: 150, decoration: BoxDecoration(shape: BoxShape.circle, gradient: RadialGradient(colors: [const Color(0xFF7B2FF7).withValues(alpha: 0.3), Colors.transparent])))),
        Padding(padding: const EdgeInsets.fromLTRB(20, 100, 20, 20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.location_on, color: Color(0xFF00D4FF), size: 18),
            const SizedBox(width: 6),
            Expanded(child: Text(location, style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14), overflow: TextOverflow.ellipsis)),
          ]),
          const SizedBox(height: 20),
          Text('Find Your', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 16)),
          const Text('Healthcare Solution', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
        ])),
      ]),
    );
  }

  Widget _quickAccess() {
    return Padding(padding: const EdgeInsets.all(16), child: GridView.count(
      crossAxisCount: 4, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.85,
      children: [
        _glassCard(Icons.local_hospital, 'Hospitals', const Color(0xFF00D4FF), () => _showSearchDialog()),
        _glassCard(Icons.person, 'Doctors', const Color(0xFF10B981), () => _showSearchDialog()),
        _glassCard(Icons.medical_services, 'Ambulance', const Color(0xFFF59E0B), () => _showEmergencyDialog()),
        _glassCard(Icons.bloodtype, 'Blood', const Color(0xFFEF4444), () {}),
        _glassCard(Icons.medication, 'Pharmacy', const Color(0xFF8B5CF6), () {}),
        _glassCard(Icons.science, 'Labs', const Color(0xFF14B8A6), () {}),
        _glassCard(Icons.chat_bubble, 'AI Chat', const Color(0xFFEC4899), () => _showAIChat()),
        _glassCard(Icons.calendar_month, 'Bookings', const Color(0xFF6366F1), () => _showBookingsDialog()),
      ],
    ));
  }

  Widget _glassCard(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [color.withValues(alpha: 0.2), color.withValues(alpha: 0.05)]),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: color.withValues(alpha: 0.3)),
            ),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: color.withValues(alpha: 0.2), shape: BoxShape.circle), child: Icon(icon, color: color, size: 24)),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _emergencyCard() {
    return GestureDetector(
      onTap: _showEmergencyDialog,
      child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Container(
        height: 80,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: const Color(0xFFEF4444).withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 10))],
        ),
        child: Stack(children: [
          Positioned(right: -20, top: -20, child: Container(width: 100, height: 100, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.1)))),
          Padding(padding: const EdgeInsets.symmetric(horizontal: 20), child: Row(children: [
            Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle), child: const Icon(Icons.emergency, color: Colors.white, size: 28)),
            const SizedBox(width: 16),
            const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text('Medical Emergency?', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)), Text('Tap for immediate help', style: TextStyle(color: Colors.white70, fontSize: 12))])),
            Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: const Text('102', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold, fontSize: 18))),
          ])),
        ]),
      )),
    );
  }

  Widget _sectionTitle(String title, String action) {
    return Padding(padding: const EdgeInsets.fromLTRB(16, 24, 16, 12), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(title, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
      GestureDetector(
        onTap: _showSearchDialog,
        child: Text(action, style: const TextStyle(color: Color(0xFF00D4FF), fontSize: 14)),
      ),
    ]));
  }

  Widget _hospitalsList() {
    if (hospitals.isEmpty) return const SizedBox();
    return SizedBox(height: 200, child: ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: hospitals.length > 6 ? 6 : hospitals.length,
      itemBuilder: (ctx, i) => _hospitalCard(hospitals[i]),
    ));
  }

  Widget _hospitalCard(dynamic h) {
    String name = h is Map ? h['name'] ?? 'Hospital' : (h.name ?? 'Hospital');
    String city = h is Map ? h['city'] ?? 'Delhi' : (h.city ?? 'Delhi');
    double rating = h is Map ? (h['rating'] ?? 4.0) : (h.rating ?? 4.0);
    String beds = h is Map ? '${h['beds']?['available'] ?? 10}' : '${h.availableBeds ?? 10}';
    String specialty = h is Map ? (h['specialties']?.split(',').first ?? 'Multi') : (h.specialties?.isNotEmpty == true ? h.specialties.first : 'Multi');
    
    return Container(
      width: 260,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [const Color(0xFF1E293B), const Color(0xFF0F172A)]),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(height: 80, decoration: BoxDecoration(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          gradient: LinearGradient(colors: [const Color(0xFF00D4FF).withValues(alpha: 0.3), const Color(0xFF7B2FF7).withValues(alpha: 0.3)]),
        ), child: Center(child: Icon(Icons.local_hospital, color: Colors.white.withValues(alpha: 0.8), size: 40))),
        Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(child: Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16), overflow: TextOverflow.ellipsis)),
            Row(children: [const Icon(Icons.star, color: Colors.amber, size: 16), const SizedBox(width: 4), Text(rating.toString(), style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold))]),
          ]),
          const SizedBox(height: 8),
          Row(children: [const Icon(Icons.location_on, color: Color(0xFF00D4FF), size: 14), const SizedBox(width: 4), Text(city, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12))]),
          const SizedBox(height: 8),
          Row(children: [
            _chip('$beds beds', Colors.green),
            const SizedBox(width: 8),
            _chip(specialty, Color(0xFF8B5CF6)),
          ]),
          const SizedBox(height: 12),
          SizedBox(width: double.infinity, child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00D4FF), foregroundColor: Colors.black, padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
            onPressed: () {}, child: const Text('Book Now', style: TextStyle(fontWeight: FontWeight.bold)),
          )),
        ])),
      ]),
    );
  }

  Widget _chip(String text, Color color) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: color.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)), child: Text(text, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w500)));
  }

  Widget _doctorsList() {
    return Column(children: doctors.take(4).map((d) => _doctorCard(d)).toList());
  }

  Widget _doctorCard(dynamic d) {
    String name = d is Map ? d['name'] ?? 'Doctor' : (d.name ?? 'Doctor');
    String specialty = d is Map ? d['specialty'] ?? 'General' : (d.specialty ?? 'General');
    double rating = d is Map ? (d['rating'] ?? 4.5) : (d.rating ?? 4.5);
    
    return GestureDetector(
      onTap: () {},
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(colors: [const Color(0xFF1E293B), const Color(0xFF0F172A)]),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: Row(children: [
          Container(width: 60, height: 60, decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF00D4FF), Color(0xFF7B2FF7)]), borderRadius: BorderRadius.circular(16)), child: Center(child: Text(name.isNotEmpty ? name[0] : 'D', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)))),
          const SizedBox(width: 16),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 4),
            Text(specialty, style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 13)),
            const SizedBox(height: 4),
            Row(children: [const Icon(Icons.star, color: Colors.amber, size: 14), const SizedBox(width: 4), Text(rating.toString(), style: const TextStyle(color: Colors.amber, fontSize: 12))]),
          ])),
          Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: const Color(0xFF00D4FF).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.calendar_today, color: Color(0xFF00D4FF))),
        ]),
      ),
    );
  }

  Widget _servicesSection() {
    return Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Services', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
      const SizedBox(height: 16),
      Row(children: [
        _serviceTile(Icons.video_call, 'Video\nConsult', const Color(0xFF00D4FF), () {}),
        _serviceTile(Icons.chat_bubble, 'AI\nAssistant', const Color(0xFF10B981), () => _showAIChat()),
        _serviceTile(Icons.medical_information, 'Symptom\nChecker', const Color(0xFFF59E0B), () {}),
        _serviceTile(Icons.folder, 'Medical\nRecords', Color(0xFF8B5CF6), () {}),
      ]),
    ]));
  }

  Widget _serviceTile(IconData icon, String label, Color color, VoidCallback onTap) {
    return Expanded(child: GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [color.withValues(alpha: 0.2), color.withValues(alpha: 0.05)]),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(children: [Icon(icon, color: color, size: 28), const SizedBox(height: 8), Text(label, style: const TextStyle(color: Colors.white, fontSize: 11), textAlign: TextAlign.center)]),
      ),
    ));
  }

  Widget _healthTips() {
    return Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Health Tips', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
      const SizedBox(height: 16),
      Row(children: [
        _tipCard(Icons.favorite, 'Heart Health', Colors.red),
        _tipCard(Icons.psychology, 'Mental Wellness', Color(0xFF8B5CF6)),
        _tipCard(Icons.restaurant, 'Nutrition', Colors.green),
        _tipCard(Icons.fitness_center, 'Fitness', Colors.orange),
      ]),
    ]));
  }

  Widget _tipCard(IconData icon, String label, Color color) {
    return Expanded(child: Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [color.withValues(alpha: 0.3), color.withValues(alpha: 0.1)]),
      ),
      child: Column(children: [Icon(icon, color: color, size: 24), const SizedBox(height: 8), Text(label, style: const TextStyle(color: Colors.white, fontSize: 10), textAlign: TextAlign.center)]),
    ));
  }

  Widget _glassBottomNav() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        color: const Color(0xFF1E293B).withValues(alpha: 0.9),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Padding(padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12), child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
            _navItem(Icons.home, 'Home', 0),
            _navItem(Icons.search, 'Search', 1),
            _navItem(Icons.calendar_month, 'Bookings', 2),
            _navItem(Icons.person, 'Profile', 3),
          ])),
        ),
      ),
    );
  }

  Widget _navItem(IconData icon, String label, int idx) {
    final sel = navIndex == idx;
    return GestureDetector(
      onTap: () => _onNavTap(idx),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: sel ? const Color(0xFF00D4FF).withValues(alpha: 0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, color: sel ? const Color(0xFF00D4FF) : Colors.white54, size: 22),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(color: sel ? const Color(0xFF00D4FF) : Colors.white54, fontSize: 10)),
        ]),
      ),
    );
  }
}