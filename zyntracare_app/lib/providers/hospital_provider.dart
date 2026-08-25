import 'package:flutter/foundation.dart';
import '../data/models/models.dart';
import '../data/services/api_service.dart';

class HospitalProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<Hospital> _hospitals = [];
  List<Hospital> _nearbyHospitals = [];
  bool _loading = false;
  String? _error;
  String _searchQuery = '';
  String? _selectedCity;

  List<Hospital> get hospitals => _hospitals;
  List<Hospital> get nearbyHospitals => _nearbyHospitals;
  bool get loading => _loading;
  String? get error => _error;
  String get searchQuery => _searchQuery;
  String? get selectedCity => _selectedCity;

  List<Hospital> get filteredHospitals {
    var list = _hospitals.where((h) {
      if (_searchQuery.isNotEmpty && !h.name.toLowerCase().contains(_searchQuery.toLowerCase()) && !h.city.toLowerCase().contains(_searchQuery.toLowerCase())) return false;
      if (_selectedCity != null && h.city != _selectedCity) return false;
      return true;
    }).toList();
    return list;
  }

  void setSearchQuery(String q) { _searchQuery = q; notifyListeners(); }
  void setSelectedCity(String? city) { _selectedCity = city; notifyListeners(); }

  Future<void> loadHospitals() async {
    _loading = true; _error = null; notifyListeners();
    try {
      final res = await _api.getHospitals();
      if (res['success'] == false) { _error = res['error']; }
      else { _hospitals = (res['hospitals'] as List?)?.map((e) => Hospital.fromJson(e)).toList() ?? []; }
    } catch (e) { _error = e.toString(); }
    _loading = false; notifyListeners();
  }

  Future<void> loadNearbyHospitals(double lat, double lng, {double radius = 10}) async {
    _loading = true; _error = null; notifyListeners();
    try {
      final res = await _api.getNearbyHospitals(lat, lng, radius: radius);
      if (res['success'] == false) { _error = res['error']; }
      else { _nearbyHospitals = (res['hospitals'] as List?)?.map((e) => Hospital.fromJson(e)).toList() ?? []; }
    } catch (e) { _error = e.toString(); }
    _loading = false; notifyListeners();
  }
}
