import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:3000';

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
      return {'error': e.toString(), 'success': false};
    }
  }

  Future<dynamic> post(String endpoint, {Map<String, dynamic>? body}) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await http.post(uri, headers: _headers, body: jsonEncode(body));
      return _handleResponse(response);
    } catch (e) {
      return {'error': e.toString(), 'success': false};
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        return jsonDecode(response.body);
      } catch (e) {
        return {'data': response.body, 'success': true};
      }
    } else {
      try {
        final body = jsonDecode(response.body);
        return {'error': body['message'] ?? 'Error', 'success': false, 'statusCode': response.statusCode};
      } catch (e) {
        return {'error': 'Error: ${response.statusCode}', 'success': false};
      }
    }
  }

  // Auth APIs
  Future<dynamic> register(Map<String, dynamic> userData) async => post('/api/auth/register', body: userData);
  Future<dynamic> login(String email, String password) async => post('/api/auth/[...nextauth]', body: {'email': email, 'password': password});
  Future<dynamic> sendOtp(String phone) async => post('/api/send-otp', body: {'phone': phone});
  Future<dynamic> forgotPassword(String email) async => post('/api/auth/forgot-password', body: {'email': email});

  // Hospitals
  Future<dynamic> getHospitals({String? city, String? search, int page = 1}) async => get('/api/hospitals', params: {'city': city, 'q': search, 'page': page.toString(), 'limit': '20'});
  Future<dynamic> getNearbyHospitals(double lat, double lng, {double radius = 10}) async => get('/api/hospitals/nearby', params: {'lat': lat.toString(), 'lng': lng.toString(), 'radius': radius.toString()});

  // Doctors
  Future<dynamic> getDoctors({String? specialty, String? search, int page = 1}) async => get('/api/doctors', params: {'specialty': specialty, 'q': search, 'page': page.toString()});

  // Beds
  Future<dynamic> getBedsRealtime({String? hospitalId}) async => get('/api/beds/realtime', params: {'hospitalId': hospitalId});
  Future<dynamic> getAllBeds() async => get('/api/beds');

  // Blood Donors
  Future<dynamic> getBloodDonors({String? city, String? bloodType}) async => get('/api/blood-donors', params: {'city': city, 'bloodType': bloodType});

  // Pharmacies
  Future<dynamic> getPharmacies({String? city, String? search}) async => get('/api/pharmacies', params: {'city': city, 'q': search});

  // Labs
  Future<dynamic> getLabs({String? city, String? search}) async => get('/api/labs', params: {'city': city, 'q': search});

  // Emergency
  Future<dynamic> createEmergencyCase(Map<String, dynamic> data) async => post('/api/emergency', body: data);
  Future<dynamic> getEmergencyCases() async => get('/api/emergency/cases');

  // Ambulance
  Future<dynamic> trackAmbulance(String bookingId) async => get('/api/ambulance/track', params: {'bookingId': bookingId});

  // AI/Chat
  Future<dynamic> sendChatMessage(String message, {String? context}) async => post('/api/chat', body: {'message': message, 'context': context});
  Future<dynamic> getAIResponse(String query) async => post('/api/ai', body: {'query': query});

  // Symptoms
  Future<dynamic> checkSymptoms(List<String> symptoms) async => post('/api/symptoms', body: {'symptoms': symptoms});
  Future<dynamic> getTriage(String symptoms) async => post('/api/triage', body: {'symptoms': symptoms});

  // Telehealth
  Future<dynamic> getTelehealthDoctors() async => get('/api/telehealth');
  Future<dynamic> bookTelehealth(Map<String, dynamic> booking) async => post('/api/telehealth', body: booking);

  // Patient Records
  Future<dynamic> getPatientRecords(String patientId) async => get('/api/patient-records', params: {'patientId': patientId});
  Future<dynamic> addPatientRecord(Map<String, dynamic> record) async => post('/api/patient-records', body: record);

  // Medicine Verification
  Future<dynamic> verifyMedicine(String barcode) async => post('/api/medicine-verify', body: {'barcode': barcode});

  // Health Risk
  Future<dynamic> assessHealthRisk(Map<String, dynamic> data) async => post('/api/health-risk', body: data);

  // Camps
  Future<dynamic> getCamps({String? city}) async => get('/api/camps', params: {'city': city});

  // Feedback
  Future<dynamic> submitFeedback(Map<String, dynamic> feedback) async => post('/api/feedback', body: feedback);

  // Subscribe
  Future<dynamic> subscribe(String email) async => post('/api/subscribe', body: {'email': email});

  // Content
  Future<dynamic> getHealthContent() async => get('/api/content');

  // Health
  Future<dynamic> getHealthData() async => get('/api/health');

  // Recommend
  Future<dynamic> getRecommendations(Map<String, dynamic> prefs) async => post('/api/recommend', body: prefs);
}