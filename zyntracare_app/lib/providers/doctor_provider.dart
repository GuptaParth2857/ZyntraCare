import 'package:flutter/foundation.dart';
import '../data/models/models.dart';
import '../data/services/api_service.dart';

class DoctorProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<Doctor> _doctors = [];
  bool _loading = false;
  String? _error;
  String _searchQuery = '';
  String? _selectedSpecialty;

  List<Doctor> get doctors => _doctors;
  bool get loading => _loading;
  String? get error => _error;
  String get searchQuery => _searchQuery;
  String? get selectedSpecialty => _selectedSpecialty;

  List<Doctor> get filteredDoctors {
    var list = _doctors.where((d) {
      if (_searchQuery.isNotEmpty && !d.name.toLowerCase().contains(_searchQuery.toLowerCase()) && !d.specialty.toLowerCase().contains(_searchQuery.toLowerCase())) return false;
      if (_selectedSpecialty != null && d.specialty != _selectedSpecialty) return false;
      return true;
    }).toList();
    return list;
  }

  void setSearchQuery(String q) { _searchQuery = q; notifyListeners(); }
  void setSelectedSpecialty(String? s) { _selectedSpecialty = s; notifyListeners(); }

  Future<void> loadDoctors() async {
    _loading = true; _error = null; notifyListeners();
    try {
      final res = await _api.getDoctors();
      if (res['success'] == false) { _error = res['error']; }
      else { _doctors = (res['doctors'] as List?)?.map((e) => Doctor.fromJson(e)).toList() ?? []; }
    } catch (e) { _error = e.toString(); }
    _loading = false; notifyListeners();
  }
}
