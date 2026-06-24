import 'dart:convert';
import 'package:http/http.dart' as http;

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
    return (data?['hospitals'] as List?) ?? [];
  }

  Future<List<dynamic>> getDoctors({String? specialty, String? search}) async {
    final data = await get('/api/doctors', params: {'specialty': specialty ?? '', 'q': search ?? ''});
    return (data?['doctors'] as List?) ?? [];
  }

  Future<List<dynamic>> getBloodDonors({String? city, String? bloodType}) async {
    final data = await get('/api/blood-donors', params: {'city': city ?? '', 'bloodType': bloodType ?? ''});
    return (data?['donors'] as List?) ?? [];
  }

  Future<List<dynamic>> getPharmacies({String? city, String? search}) async {
    final data = await get('/api/pharmacies', params: {'city': city ?? '', 'q': search ?? ''});
    return (data?['pharmacies'] as List?) ?? [];
  }

  Future<List<dynamic>> getLabs({String? city, String? search}) async {
    final data = await get('/api/labs', params: {'city': city ?? '', 'q': search ?? ''});
    return (data?['labs'] as List?) ?? [];
  }

  Future<List<dynamic>> getBeds() async {
    final data = await get('/api/beds');
    return (data?['hospitals'] as List?) ?? [];
  }

  Future<List<dynamic>> getTelehealth() async {
    final data = await get('/api/telehealth');
    return (data?['consultations'] as List?) ?? [];
  }

  Future<List<dynamic>> getCamps() async {
    final data = await get('/api/camps');
    return (data?['camps'] as List?) ?? [];
  }

  Future<List<dynamic>> getPatientRecords(String userId, Map<String, dynamic> params) async {
    final data = await get('/api/patient-records', params: {'userId': userId});
    final record = data?['record'];
    return record != null ? [record] : [];
  }

  Future<List<dynamic>> searchAll(String query) async {
    final hospitals   = await getHospitals(search: query);
    final doctors     = await getDoctors(search: query);
    final pharmacies  = await getPharmacies(search: query);
    final labs        = await getLabs(search: query);
    return [
      ...hospitals.map((h)  => {'name': h['name'], 'type': 'hospital',  'sub': h['city'] ?? ''}),
      ...doctors.map((d)    => {'name': d['name'], 'type': 'doctor',    'sub': d['specialty'] ?? ''}),
      ...pharmacies.map((p) => {'name': p['name'], 'type': 'pharmacy',  'sub': p['city'] ?? ''}),
      ...labs.map((l)       => {'name': l['name'], 'type': 'lab',       'sub': l['city'] ?? ''}),
    ];
  }

  Future<String> aiChat(String message) async {
    final data = await post('/api/ai', body: {'query': message});
    return data?['response'] ?? data?['reply'] ?? data?['message'] ??
        "I'm here to help with your health concerns. Please consult a doctor for medical advice.";
  }

  Future<String> checkSymptoms(List<String> symptoms) async {
    final data = await post('/api/symptoms', body: {'symptoms': symptoms});
    return data?['result'] ?? data?['diagnosis'] ?? data?['recommendation'] ??
        "Based on your symptoms, please consult a healthcare provider.";
  }

  Future<dynamic> login(String email, String password) async {
    return await post('/api/auth/login', body: {'email': email, 'password': password});
  }

  Future<dynamic> register(Map<String, dynamic> userData) async {
    return await post('/api/auth/register', body: userData);
  }
}

final apiService = ApiService();
