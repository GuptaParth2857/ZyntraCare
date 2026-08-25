import 'package:flutter/foundation.dart';
import '../data/models/models.dart';
import '../data/services/api_service.dart';

class LabProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<Lab> _labs = [];
  bool _loading = false;
  String? _error;
  String _searchQuery = '';

  List<Lab> get labs => _labs;
  bool get loading => _loading;
  String? get error => _error;
  String get searchQuery => _searchQuery;

  List<Lab> get filteredLabs {
    if (_searchQuery.isEmpty) return _labs;
    return _labs.where((l) =>
      l.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      l.city.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      l.tests.any((t) => t.toLowerCase().contains(_searchQuery.toLowerCase()))
    ).toList();
  }

  void setSearchQuery(String q) { _searchQuery = q; notifyListeners(); }

  Future<void> loadLabs() async {
    _loading = true; _error = null; notifyListeners();
    try {
      final res = await _api.getLabs();
      if (res['success'] == false) { _error = res['error']; }
      else { _labs = (res['labs'] as List?)?.map((e) => Lab.fromJson(e)).toList() ?? []; }
    } catch (e) { _error = e.toString(); }
    _loading = false; notifyListeners();
  }
}
