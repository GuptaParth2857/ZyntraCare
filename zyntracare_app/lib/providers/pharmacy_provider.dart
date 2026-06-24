import 'package:flutter/foundation.dart';
import '../data/models/models.dart';
import '../data/services/api_service.dart';

class PharmacyProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<Pharmacy> _pharmacies = [];
  bool _loading = false;
  String? _error;
  String _searchQuery = '';

  List<Pharmacy> get pharmacies => _pharmacies;
  bool get loading => _loading;
  String? get error => _error;
  String get searchQuery => _searchQuery;

  List<Pharmacy> get filteredPharmacies {
    if (_searchQuery.isEmpty) return _pharmacies;
    return _pharmacies.where((p) =>
      p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      p.city.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      p.address.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();
  }

  void setSearchQuery(String q) { _searchQuery = q; notifyListeners(); }

  Future<void> loadPharmacies() async {
    _loading = true; _error = null; notifyListeners();
    try {
      final res = await _api.getPharmacies();
      if (res['success'] == false) { _error = res['error']; }
      else { _pharmacies = (res['pharmacies'] as List?)?.map((e) => Pharmacy.fromJson(e)).toList() ?? []; }
    } catch (e) { _error = e.toString(); }
    _loading = false; notifyListeners();
  }
}
