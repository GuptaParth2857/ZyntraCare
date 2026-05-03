import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:ui';
import 'dart:convert';
import 'package:http/http.dart' as http;

void main() {
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(statusBarColor: Colors.transparent, statusBarIconBrightness: Brightness.light));
  runApp(const ZyntraCareApp());
}

class ZyntraCareApp extends StatelessWidget {
  const ZyntraCareApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ZyntraCare',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(brightness: Brightness.dark, primaryColor: const Color(0xFF00D4FF), scaffoldBackgroundColor: const Color(0xFF0F172A)),
      home: const SplashScreen(),
    );
  }
}

class ApiService {
  static const String baseUrl = 'https://zyntracare.vercel.app';

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  Future<dynamic> get(String endpoint, {Map<String, String>? params}) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint').replace(queryParameters: params);
      final response = await http.get(uri, headers: _headers);
      return _handleResponse(response);
    } catch (e) {
      return null;
    }
  }

  Future<dynamic> post(String endpoint, {Map<String, dynamic>? body}) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await http.post(uri, headers: _headers, body: jsonEncode(body));
      return _handleResponse(response);
    } catch (e) {
      return null;
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        return jsonDecode(response.body);
      } catch (e) {
        return {'data': response.body, 'success': true};
      }
    }
    return null;
  }

  Future<List<dynamic>> getHospitals({String? city, String? search}) async {
    final data = await get('/api/hospitals', params: {'city': city ?? '', 'q': search ?? ''});
    return data?['data'] ?? [];
  }

  Future<List<dynamic>> getDoctors({String? specialty, String? search}) async {
    final data = await get('/api/doctors', params: {'specialty': specialty ?? '', 'q': search ?? ''});
    return data?['data'] ?? [];
  }

  Future<List<dynamic>> getBloodDonors({String? city, String? bloodType}) async {
    final data = await get('/api/blood-donors', params: {'city': city ?? '', 'bloodType': bloodType ?? ''});
    return data?['data'] ?? [];
  }

  Future<List<dynamic>> getPharmacies({String? city, String? search}) async {
    final data = await get('/api/pharmacies', params: {'city': city ?? '', 'q': search ?? ''});
    return data?['data'] ?? [];
  }

  Future<List<dynamic>> getLabs({String? city, String? search}) async {
    final data = await get('/api/labs', params: {'city': city ?? '', 'q': search ?? ''});
    return data?['data'] ?? [];
  }

  Future<List<dynamic>> getBeds() async {
    final data = await get('/api/beds');
    return data?['data'] ?? [];
  }

  Future<List<dynamic>> getTelehealth() async {
    final data = await get('/api/telehealth');
    return data?['data'] ?? [];
  }

  Future<List<dynamic>> searchAll(String query) async {
    final hospitals = await getHospitals(search: query);
    final doctors = await getDoctors(search: query);
    final pharmacies = await getPharmacies(search: query);
    final labs = await getLabs(search: query);
    
    final results = <dynamic>[];
    for (var h in hospitals) results.add({'name': h['name'], 'type': 'hospital'});
    for (var d in doctors) results.add({'name': d['name'], 'type': 'doctor'});
    for (var p in pharmacies) results.add({'name': p['name'], 'type': 'pharmacy'});
    for (var l in labs) results.add({'name': l['name'], 'type': 'lab'});
    return results;
  }

  Future<String> aiChat(String message) async {
    final data = await post('/api/ai', body: {'query': message});
    return data?['response'] ?? data?['reply'] ?? data?['message'] ?? "I'm here to help with your health concerns. Please consult a doctor for medical advice.";
  }

  Future<String> checkSymptoms(List<String> symptoms) async {
    final data = await post('/api/symptoms', body: {'symptoms': symptoms});
    return data?['result'] ?? data?['diagnosis'] ?? data?['recommendation'] ?? "Based on your symptoms, please consult a healthcare provider.";
  }

  Future<dynamic> login(String email, String password) async {
    return await post('/api/auth/[...nextauth]', body: {'email': email, 'password': password});
  }

  Future<dynamic> register(Map<String, dynamic> userData) async {
    return await post('/api/auth/register', body: userData);
  }

  Future<dynamic> bookAppointment(Map<String, dynamic> data) async {
    return await post('/api/telehealth', body: data);
  }
}

final apiService = ApiService();

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..forward();
    Future.delayed(const Duration(milliseconds: 2200), () {
      if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const MainScreen()));
    });
  }
  @override void dispose() { _controller.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) => Transform.scale(
            scale: _controller.value,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 110, height: 110,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF00D4FF), Color(0xFF7B2FF7)]),
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [BoxShadow(color: const Color(0xFF00D4FF).withOpacity(0.4), blurRadius: 30, spreadRadius: 5)]
                  ),
                  child: const Icon(Icons.favorite, color: Colors.white, size: 55),
                ),
                const SizedBox(height: 25),
                ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(colors: [Color(0xFF00D4FF), Color(0xFF7B2FF7)]).createShader(bounds),
                  child: const Text('ZyntraCare', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
                const SizedBox(height: 6),
                const Text('Your Health, Our Priority', style: TextStyle(color: Colors.white54, fontSize: 13)),
                const SizedBox(height: 35),
                const SizedBox(width: 36, height: 36, child: CircularProgressIndicator(color: Color(0xFF00D4FF), strokeWidth: 3)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});
  @override State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: const [HomeTab(), SearchTab(), BookingsTab(), ProfileTab()],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withOpacity(0.95),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10))]
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(Icons.home, 'Home', 0),
                _navItem(Icons.search, 'Search', 1),
                _navItem(Icons.calendar_today, 'Bookings', 2),
                _navItem(Icons.person, 'Profile', 3),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(IconData icon, String label, int idx) {
    final sel = _currentIndex == idx;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = idx),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(horizontal: sel ? 20 : 14, vertical: 8),
        decoration: BoxDecoration(
          color: sel ? const Color(0xFF00D4FF).withOpacity(0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(20)
        ),
        child: Row(
          children: [
            Icon(icon, color: sel ? const Color(0xFF00D4FF) : Colors.white54, size: 22),
            if (sel) ...[
              const SizedBox(width: 8),
              Text(label, style: const TextStyle(color: Color(0xFF00D4FF), fontSize: 12, fontWeight: FontWeight.w600))
            ],
          ],
        ),
      ),
    );
  }
}

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});
  @override State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  List<dynamic> hospitals = [];
  List<dynamic> doctors = [];
  List<dynamic> bloodDonors = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    loadData();
  }

  Future<void> loadData() async {
    setState(() => loading = true);
    try {
      final h = await apiService.getHospitals();
      final d = await apiService.getDoctors();
      final b = await apiService.getBloodDonors();
      if (mounted) {
        setState(() {
          hospitals = h;
          doctors = d;
          bloodDonors = b;
          loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: loadData,
      color: const Color(0xFF00D4FF),
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: _buildHeader(context)),
          SliverToBoxAdapter(child: _quickAccess(context)),
          SliverToBoxAdapter(child: _emergencyCard(context)),
          SliverToBoxAdapter(child: _section('Nearby Hospitals')),
          SliverToBoxAdapter(child: _hospitals(context)),
          SliverToBoxAdapter(child: _section('Top Doctors')),
          SliverToBoxAdapter(child: _doctors(context)),
          SliverToBoxAdapter(child: _section('Blood Donors')),
          SliverToBoxAdapter(child: _bloodDonors(context)),
          SliverToBoxAdapter(child: _services(context)),
          SliverToBoxAdapter(child: _tips(context)),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext ctx) {
    return Container(
      height: 160,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [const Color(0xFF1A1A2E), const Color(0xFF16213E), const Color(0xFF0F3460)]
        )
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on, color: Color(0xFF00D4FF), size: 18),
                  const SizedBox(width: 6),
                  const Text('Delhi, India', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => _showNotif(ctx),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text('Find Your', style: TextStyle(color: Colors.white70, fontSize: 16)),
              const Text('Healthcare Solution', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              GestureDetector(
                onTap: () => _showSearch(ctx),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
                  child: const Row(
                    children: [
                      Icon(Icons.search, color: Colors.white54, size: 20),
                      SizedBox(width: 12),
                      Text('Search hospitals, doctors...', style: TextStyle(color: Colors.white54, fontSize: 14)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _quickAccess(BuildContext ctx) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: GridView.count(
        crossAxisCount: 4,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.85,
        children: [
          _glassItem(Icons.local_hospital, 'Hospitals', const Color(0xFF00D4FF), () => _showHospitals(ctx)),
          _glassItem(Icons.person, 'Doctors', const Color(0xFF10B981), () => _showDoctors(ctx)),
          _glassItem(Icons.bloodtype, 'Blood', const Color(0xFFEF4444), () => _showBlood(ctx)),
          _glassItem(Icons.medication, 'Pharmacy', const Color(0xFF8B5CF6), () => _showPharmacy(ctx)),
          _glassItem(Icons.science, 'Labs', const Color(0xFF14B8A6), () => _showLabs(ctx)),
          _glassItem(Icons.chat_bubble, 'AI Chat', const Color(0xFFEC4899), () => _showAIChat(ctx)),
          _glassItem(Icons.medical_information, 'Symptoms', const Color(0xFFF59E0B), () => _showSymptom(ctx)),
          _glassItem(Icons.video_call, 'Video', const Color(0xFF6366F1), () => _showVideo(ctx)),
        ],
      ),
    );
  }

  Widget _glassItem(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [color.withOpacity(0.15), color.withOpacity(0.05)]),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: color.withOpacity(0.3))
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: color.withOpacity(0.2), shape: BoxShape.circle),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(height: 8),
                Text(label, style: const TextStyle(color: Colors.white, fontSize: 10), textAlign: TextAlign.center),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _emergencyCard(BuildContext ctx) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GestureDetector(
        onTap: () => _showEmergency(ctx),
        child: Container(
          height: 60,
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]),
            borderRadius: BorderRadius.circular(14)
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                const Icon(Icons.emergency, color: Colors.white, size: 24),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Medical Emergency?', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                      Text('Tap for help', style: TextStyle(color: Colors.white70, fontSize: 10)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                  child: const Text('102', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _section(String t) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
    child: Text(t, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
  );

  Widget _hospitals(BuildContext ctx) {
    if (loading) return const SizedBox(height: 160, child: Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF))));
    if (hospitals.isEmpty) {
      return SizedBox(height: 160, child: ListView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), children: [
        _hospCardReal({'name': 'No Hospitals', 'city': 'API not connected', 'rating': '0', 'beds': '0'}),
      ]));
    }
    return SizedBox(
      height: 160,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: hospitals.length,
        itemBuilder: (ctx, i) => _hospCardReal(hospitals[i]),
      ),
    );
  }

  Widget _hospCardReal(dynamic h) {
    return Container(
      width: 180,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF1E293B), Color(0xFF0F172A)]),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.1))
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: const Color(0xFF00D4FF).withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.local_hospital, color: Color(0xFF00D4FF), size: 18),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(h['name'] ?? 'Hospital', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13), overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
          const Spacer(),
          Text(h['city'] ?? h['address'] ?? 'Delhi', style: const TextStyle(color: Colors.white54, fontSize: 11)),
          const SizedBox(height: 8),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: Colors.green.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                child: Text('${h['beds'] ?? h['totalBeds'] ?? 0} beds', style: const TextStyle(color: Colors.green, fontSize: 10)),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: Colors.amber.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                child: Text(h['rating']?.toString() ?? '4.0', style: const TextStyle(color: Colors.amber, fontSize: 10)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _doctors(BuildContext ctx) {
    if (loading) return const SizedBox(height: 100, child: Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF))));
    if (doctors.isEmpty) {
      return SizedBox(height: 100, child: ListView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), children: [
        _docCardReal({'name': 'No Doctors', 'specialty': 'API not connected', 'rating': '0'}),
      ]));
    }
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: doctors.length,
        itemBuilder: (ctx, i) => _docCardReal(doctors[i]),
      ),
    );
  }

  Widget _docCardReal(dynamic d) {
    return Container(
      width: 130,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF1E293B), Color(0xFF0F172A)]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1))
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: const Color(0xFF00D4FF),
            child: Text((d['name'] ?? 'D')[0].toString().toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 8),
          Text(d['name'] ?? 'Doctor', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis),
          Text(d['specialty'] ?? d['department'] ?? 'Specialist', style: const TextStyle(color: Colors.white54, fontSize: 9)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.star, color: Colors.amber, size: 12),
              Text(' ${d['rating'] ?? '4.0'}', style: const TextStyle(color: Colors.amber, fontSize: 10)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _bloodDonors(BuildContext ctx) {
    if (loading) return const SizedBox(height: 90, child: Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF))));
    if (bloodDonors.isEmpty) {
      return SizedBox(height: 90, child: ListView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), children: [
        _bloodCardReal({'name': 'No Donors', 'bloodType': 'N/A', 'available': false}),
      ]));
    }
    return SizedBox(
      height: 90,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: bloodDonors.length,
        itemBuilder: (ctx, i) => _bloodCardReal(bloodDonors[i]),
      ),
    );
  }

  Widget _bloodCardReal(dynamic d) {
    final avail = d['available'] ?? true;
    return Container(
      width: 100,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF1E293B), Color(0xFF0F172A)]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1))
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: Colors.red,
            child: Text(d['bloodType'] ?? d['blood_group'] ?? 'O+', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 6),
          Text(d['name'] ?? 'Donor', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          Container(
            margin: const EdgeInsets.only(top: 4),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: avail ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2),
              borderRadius: BorderRadius.circular(4)
            ),
            child: Text(avail ? 'Avail' : 'Busy', style: TextStyle(color: avail ? Colors.green : Colors.red, fontSize: 8)),
          ),
        ],
      ),
    );
  }

  Widget _services(BuildContext ctx) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Services', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Row(
            children: [
              _srvItem(Icons.video_call, 'Video', const Color(0xFF00D4FF), () => _showVideo(ctx)),
              _srvItem(Icons.chat_bubble, 'AI Chat', const Color(0xFF10B981), () => _showAIChat(ctx)),
              _srvItem(Icons.medical_information, 'Symptoms', const Color(0xFFF59E0B), () => _showSymptom(ctx)),
              _srvItem(Icons.folder, 'Records', const Color(0xFF8B5CF6), () {}),
            ],
          ),
        ],
      ),
    );
  }

  Widget _srvItem(IconData icon, String label, Color color, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.only(right: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [color.withOpacity(0.15), color.withOpacity(0.05)]),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withOpacity(0.3))
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 6),
              Text(label, style: const TextStyle(color: Colors.white, fontSize: 9), textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }

  Widget _tips(BuildContext ctx) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Health Tips', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Row(
            children: [
              _tipItem(Icons.favorite, 'Heart', Colors.red),
              _tipItem(Icons.psychology, 'Mental', const Color(0xFF8B5CF6)),
              _tipItem(Icons.restaurant, 'Diet', Colors.green),
              _tipItem(Icons.fitness_center, 'Fitness', Colors.orange),
            ],
          ),
        ],
      ),
    );
  }

  Widget _tipItem(IconData icon, String label, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [color.withOpacity(0.2), color.withOpacity(0.05)]),
          borderRadius: BorderRadius.circular(12)
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 9)),
          ],
        ),
      ),
    );
  }

  void _showNotif(BuildContext ctx) => showModalBottomSheet(
    context: ctx,
    backgroundColor: const Color(0xFF1E293B),
    builder: (_) => const Padding(
      padding: EdgeInsets.all(20),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.notifications, color: Color(0xFF00D4FF), size: 48),
        SizedBox(height: 16),
        Text('No notifications', style: TextStyle(color: Colors.white54)),
      ]),
    ),
  );

  void _showSearch(BuildContext ctx) {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF1E293B),
      isScrollControlled: true,
      builder: (_) => Container(
        height: MediaQuery.of(ctx).size.height * 0.7,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: controller,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search...',
                hintStyle: const TextStyle(color: Colors.white38),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF00D4FF)),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onSubmitted: (value) async {
                if (value.isNotEmpty) {
                  final results = await apiService.searchAll(value);
                  if (ctx.mounted) {
                    showModalBottomSheet(
                      context: ctx,
                      backgroundColor: const Color(0xFF1E293B),
                      builder: (_) => ListView.builder(
                        itemCount: results.length,
                        itemBuilder: (_, i) => ListTile(
                          leading: Icon(results[i]['type'] == 'hospital' ? Icons.local_hospital : results[i]['type'] == 'doctor' ? Icons.person : Icons.medical_services, color: const Color(0xFF00D4FF)),
                          title: Text(results[i]['name'] ?? '', style: const TextStyle(color: Colors.white)),
                          subtitle: Text(results[i]['type'] ?? '', style: const TextStyle(color: Colors.white54)),
                        ),
                      ),
                    );
                  }
                }
              },
            ),
            const SizedBox(height: 16),
            const Expanded(child: Center(child: Text('Type to search hospitals, doctors...', style: TextStyle(color: Colors.white54)))),
          ],
        ),
      ),
    );
  }

  void _showEmergency(BuildContext ctx) => showModalBottomSheet(
    context: ctx,
    backgroundColor: const Color(0xFF1E293B),
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
    builder: (_) => Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Padding(
          padding: EdgeInsets.all(16),
          child: Text('Emergency Services', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
        ),
        _emerTile('Ambulance', '102', Icons.medical_services),
        _emerTile('Police', '100', Icons.local_police),
        _emerTile('Fire', '101', Icons.local_fire_department),
        _emerTile('Blood Bank', '191', Icons.bloodtype),
        const SizedBox(height: 20),
      ],
    ),
  );

  Widget _emerTile(String l, String n, IconData i) => ListTile(
    leading: Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: const Color(0xFF00D4FF).withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
      child: Icon(i, color: const Color(0xFF00D4FF)),
    ),
    title: Text(l, style: const TextStyle(color: Colors.white)),
    trailing: IconButton(icon: const Icon(Icons.call, color: Colors.green), onPressed: () => _call(n)),
  );

  Future<void> _call(String num) async {
    final uri = Uri(scheme: 'tel', path: num);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  void _showHospitals(BuildContext ctx) async {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF1E293B),
      isScrollControlled: true,
      builder: (_) => Container(
        height: MediaQuery.of(ctx).size.height * 0.8,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('Hospitals', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Expanded(child: FutureBuilder<List<dynamic>>(
              future: apiService.getHospitals(),
              builder: (ctx, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF)));
                }
                final data = snapshot.data ?? [];
                if (data.isEmpty) {
                  return const Center(child: Text('No hospitals found', style: TextStyle(color: Colors.white54)));
                }
                return ListView.builder(
                  itemCount: data.length,
                  itemBuilder: (_, i) => Card(
                    color: const Color(0xFF1E293B),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: const Color(0xFF00D4FF).withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                        child: const Icon(Icons.local_hospital, color: Color(0xFF00D4FF)),
                      ),
                      title: Text(data[i]['name'] ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      subtitle: Text('${data[i]['city'] ?? data[i]['address'] ?? ''} • ${data[i]['beds'] ?? 0} beds', style: const TextStyle(color: Colors.white54)),
                      trailing: Row(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.star, color: Colors.amber, size: 16), Text(' ${data[i]['rating'] ?? '4.0'}', style: const TextStyle(color: Colors.amber))]),
                    ),
                  ),
                );
              },
            )),
          ],
        ),
      ),
    );
  }

  void _showDoctors(BuildContext ctx) async {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF1E293B),
      isScrollControlled: true,
      builder: (_) => Container(
        height: MediaQuery.of(ctx).size.height * 0.8,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('Doctors', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Expanded(child: FutureBuilder<List<dynamic>>(
              future: apiService.getDoctors(),
              builder: (ctx, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF)));
                }
                final data = snapshot.data ?? [];
                if (data.isEmpty) {
                  return const Center(child: Text('No doctors found', style: TextStyle(color: Colors.white54)));
                }
                return ListView.builder(
                  itemCount: data.length,
                  itemBuilder: (_, i) => Card(
                    color: const Color(0xFF1E293B),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: CircleAvatar(backgroundColor: const Color(0xFF00D4FF), child: Text((data[i]['name'] ?? 'D')[0], style: const TextStyle(color: Colors.white))),
                      title: Text(data[i]['name'] ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      subtitle: Text(data[i]['specialty'] ?? data[i]['department'] ?? 'Specialist', style: const TextStyle(color: Colors.white54)),
                      trailing: Row(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.star, color: Colors.amber, size: 16), Text(' ${data[i]['rating'] ?? '4.0'}', style: const TextStyle(color: Colors.amber))]),
                    ),
                  ),
                );
              },
            )),
          ],
        ),
      ),
    );
  }

  void _showBlood(BuildContext ctx) async {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF1E293B),
      isScrollControlled: true,
      builder: (_) => Container(
        height: MediaQuery.of(ctx).size.height * 0.8,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('Blood Donors', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Expanded(child: FutureBuilder<List<dynamic>>(
              future: apiService.getBloodDonors(),
              builder: (ctx, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF)));
                }
                final data = snapshot.data ?? [];
                if (data.isEmpty) {
                  return const Center(child: Text('No blood donors found', style: TextStyle(color: Colors.white54)));
                }
                return ListView.builder(
                  itemCount: data.length,
                  itemBuilder: (_, i) {
                    final avail = data[i]['available'] ?? true;
                    return Card(
                      color: const Color(0xFF1E293B),
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(backgroundColor: Colors.red, child: Text(data[i]['bloodType'] ?? 'O+', style: const TextStyle(color: Colors.white, fontSize: 12))),
                        title: Text(data[i]['name'] ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        subtitle: Text(avail ? 'Available' : 'Busy', style: TextStyle(color: avail ? Colors.green : Colors.red)),
                        trailing: IconButton(icon: const Icon(Icons.call, color: Colors.green), onPressed: () {}),
                      ),
                    );
                  },
                );
              },
            )),
          ],
        ),
      ),
    );
  }

  void _showPharmacy(BuildContext ctx) async {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF1E293B),
      isScrollControlled: true,
      builder: (_) => Container(
        height: MediaQuery.of(ctx).size.height * 0.8,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('Pharmacies', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Expanded(child: FutureBuilder<List<dynamic>>(
              future: apiService.getPharmacies(),
              builder: (ctx, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF)));
                }
                final data = snapshot.data ?? [];
                if (data.isEmpty) {
                  return const Center(child: Text('No pharmacies found', style: TextStyle(color: Colors.white54)));
                }
                return ListView.builder(
                  itemCount: data.length,
                  itemBuilder: (_, i) => Card(
                    color: const Color(0xFF1E293B),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: const Color(0xFF8B5CF6).withOpacity(0.2), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.medication, color: Color(0xFF8B5CF6))),
                      title: Text(data[i]['name'] ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      subtitle: Text(data[i]['city'] ?? data[i]['address'] ?? '', style: const TextStyle(color: Colors.white54)),
                    ),
                  ),
                );
              },
            )),
          ],
        ),
      ),
    );
  }

  void _showLabs(BuildContext ctx) async {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF1E293B),
      isScrollControlled: true,
      builder: (_) => Container(
        height: MediaQuery.of(ctx).size.height * 0.8,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('Labs', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Expanded(child: FutureBuilder<List<dynamic>>(
              future: apiService.getLabs(),
              builder: (ctx, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF)));
                }
                final data = snapshot.data ?? [];
                if (data.isEmpty) {
                  return const Center(child: Text('No labs found', style: TextStyle(color: Colors.white54)));
                }
                return ListView.builder(
                  itemCount: data.length,
                  itemBuilder: (_, i) => Card(
                    color: const Color(0xFF1E293B),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: const Color(0xFF14B8A6).withOpacity(0.2), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.science, color: Color(0xFF14B8A6))),
                      title: Text(data[i]['name'] ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      subtitle: Text(data[i]['city'] ?? data[i]['address'] ?? '', style: const TextStyle(color: Colors.white54)),
                    ),
                  ),
                );
              },
            )),
          ],
        ),
      ),
    );
  }

  void _showAIChat(BuildContext ctx) {
    final controller = TextEditingController();
    final messages = <Map<String, String>>[{'role': 'assistant', 'content': "Hello! I'm your AI Health Assistant. Ask me anything about your health."}];
    
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF1E293B),
      isScrollControlled: true,
      builder: (_) => StatefulBuilder(
        builder: (context, setState) => Container(
          height: MediaQuery.of(ctx).size.height * 0.7,
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              const Text('AI Health Assistant', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Expanded(child: ListView.builder(
                itemCount: messages.length,
                itemBuilder: (_, i) {
                  final msg = messages[i];
                  final isUser = msg['role'] == 'user';
                  return Align(
                    alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isUser ? const Color(0xFF00D4FF).withOpacity(0.2) : const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(msg['content'] ?? '', style: TextStyle(color: isUser ? const Color(0xFF00D4FF) : Colors.white)),
                    ),
                  );
                },
              )),
              Row(
                children: [
                  Expanded(child: TextField(
                    controller: controller,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Ask about your health...',
                      hintStyle: const TextStyle(color: Colors.white38),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                    ),
                  )),
                  IconButton(
                    icon: const Icon(Icons.send, color: Color(0xFF00D4FF)),
                    onPressed: () async {
                      if (controller.text.isNotEmpty) {
                        setState(() => messages.add({'role': 'user', 'content': controller.text}));
                        final reply = await apiService.aiChat(controller.text);
                        setState(() => messages.add({'role': 'assistant', 'content': reply}));
                        controller.clear();
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSymptom(BuildContext ctx) {
    final selected = <String>[];
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF1E293B),
      builder: (_) => StatefulBuilder(
        builder: (context, setState) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Symptom Checker', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ['Fever', 'Cough', 'Headache', 'Fatigue', 'Nausea', 'Body Pain', 'Sore Throat', 'Runny Nose'].map((s) =>
                  FilterChip(
                    label: Text(s, style: const TextStyle(color: Colors.white)),
                    selected: selected.contains(s),
                    selectedColor: const Color(0xFF00D4FF).withOpacity(0.3),
                    checkmarkColor: const Color(0xFF00D4FF),
                    onSelected: (sel) => setState(() => sel ? selected.add(s) : selected.remove(s)),
                  )
                ).toList(),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00D4FF)),
                onPressed: selected.isEmpty ? null : () async {
                  final result = await apiService.checkSymptoms(selected);
                  if (ctx.mounted) {
                    showModalBottomSheet(
                      context: ctx,
                      backgroundColor: const Color(0xFF1E293B),
                      builder: (_) => Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.check_circle, color: Color(0xFF00D4FF), size: 48),
                            const SizedBox(height: 16),
                            const Text('Analysis Result', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Text(result, style: const TextStyle(color: Colors.white54)),
                          ],
                        ),
                      ),
                    );
                  }
                },
                child: const Text('Check Symptoms', style: TextStyle(color: Colors.black)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showVideo(BuildContext ctx) async {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: const Color(0xFF1E293B),
      isScrollControlled: true,
      builder: (_) => Container(
        height: MediaQuery.of(ctx).size.height * 0.8,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('Video Consultation', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Expanded(child: FutureBuilder<List<dynamic>>(
              future: apiService.getTelehealth(),
              builder: (ctx, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF)));
                }
                final data = snapshot.data ?? [];
                if (data.isEmpty) {
                  return const Center(child: Text('No doctors available for video call', style: TextStyle(color: Colors.white54)));
                }
                return ListView.builder(
                  itemCount: data.length,
                  itemBuilder: (_, i) => Card(
                    color: const Color(0xFF1E293B),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: CircleAvatar(backgroundColor: const Color(0xFF00D4FF), child: Text((data[i]['name'] ?? 'D')[0], style: const TextStyle(color: Colors.white))),
                      title: Text(data[i]['name'] ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      subtitle: Text(data[i]['specialty'] ?? 'Available', style: const TextStyle(color: Colors.white54)),
                      trailing: ElevatedButton(style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00D4FF)), onPressed: () {}, child: const Text('Call', style: TextStyle(color: Colors.black))),
                    ),
                  ),
                );
              },
            )),
          ],
        ),
      ),
    );
  }
}

class SearchTab extends StatefulWidget {
  const SearchTab({super.key});
  @override State<SearchTab> createState() => _SearchTabState();
}

class _SearchTabState extends State<SearchTab> {
  final _controller = TextEditingController();
  List<dynamic> results = [];
  bool loading = false;

  @override
  Widget build(BuildContext ctx) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              TextField(
                controller: _controller,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search...',
                  hintStyle: const TextStyle(color: Colors.white38),
                  prefixIcon: const Icon(Icons.search, color: Color(0xFF00D4FF)),
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
                onSubmitted: (value) async {
                  if (value.isNotEmpty) {
                    setState(() => loading = true);
                    final data = await apiService.searchAll(value);
                    setState(() { results = data; loading = false; });
                  }
                },
              ),
              const SizedBox(height: 20),
              Expanded(
                child: loading 
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF00D4FF)))
                  : results.isEmpty
                    ? const Center(child: Text('Search doctors, hospitals,\nmedicines and more', style: TextStyle(color: Colors.white54), textAlign: TextAlign.center))
                    : ListView.builder(
                        itemCount: results.length,
                        itemBuilder: (_, i) => ListTile(
                          leading: Icon(results[i]['type'] == 'hospital' ? Icons.local_hospital : results[i]['type'] == 'doctor' ? Icons.person : results[i]['type'] == 'pharmacy' ? Icons.medication : Icons.science, color: const Color(0xFF00D4FF)),
                          title: Text(results[i]['name'] ?? '', style: const TextStyle(color: Colors.white)),
                          subtitle: Text(results[i]['type'] ?? '', style: const TextStyle(color: Colors.white54)),
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class BookingsTab extends StatelessWidget {
  const BookingsTab({super.key});
  @override
  Widget build(BuildContext ctx) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.calendar_today, color: Colors.white24, size: 60),
              const SizedBox(height: 16),
              const Text('No Bookings', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              const Text('Book a doctor to see appointments', style: TextStyle(color: Colors.white54)),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00D4FF)),
                onPressed: () {},
                child: const Text('Book Now', style: TextStyle(color: Colors.black)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});
  @override State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  bool loggedIn = false;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext ctx) {
    if (!loggedIn) {
      return Scaffold(
        body: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: const BoxDecoration(color: Color(0xFF00D4FF), shape: BoxShape.circle),
                  child: const Icon(Icons.person, color: Colors.white, size: 40),
                ),
                const SizedBox(height: 16),
                const Text('Welcome to ZyntraCare', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                SizedBox(
                  width: 300,
                  child: Column(
                    children: [
                      TextField(
                        controller: _emailController,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Email',
                          hintStyle: const TextStyle(color: Colors.white38),
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _passwordController,
                        obscureText: true,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Password',
                          hintStyle: const TextStyle(color: Colors.white38),
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00D4FF), minimumSize: const Size(double.infinity, 50)),
                        onPressed: () async {
                          final result = await apiService.login(_emailController.text, _passwordController.text);
                          if (result != null && result['success'] == true) {
                            if (mounted) setState(() => loggedIn = true);
                          } else {
                            if (mounted) ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Login failed - API not connected or invalid credentials')));
                          }
                        },
                        child: const Text('Sign In', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: const BoxDecoration(color: Color(0xFF00D4FF), shape: BoxShape.circle),
                child: const Icon(Icons.person, color: Colors.white, size: 40),
              ),
              const SizedBox(height: 16),
              const Text('John Doe', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              const Text('john@example.com', style: TextStyle(color: Colors.white54)),
              const SizedBox(height: 32),
              _profileItem(Icons.person, 'Edit Profile'),
              _profileItem(Icons.notifications, 'Notifications'),
              _profileItem(Icons.history, 'Appointment History'),
              _profileItem(Icons.folder, 'Medical Records'),
              _profileItem(Icons.settings, 'Settings'),
              _profileItem(Icons.logout, 'Sign Out'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _profileItem(IconData icon, String label) => ListTile(
    leading: Icon(icon, color: const Color(0xFF00D4FF)),
    title: Text(label, style: const TextStyle(color: Colors.white)),
    trailing: const Icon(Icons.chevron_right, color: Colors.white54),
    onTap: () {},
  );
}