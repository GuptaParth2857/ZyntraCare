import 'package:flutter/foundation.dart';
import '../data/services/api_service.dart';

class HealthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<dynamic> _healthContent = [];
  Map<String, dynamic>? _healthData;
  bool _loading = false;
  String? _error;

  List<dynamic> get healthContent => _healthContent;
  Map<String, dynamic>? get healthData => _healthData;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadHealthContent() async {
    _loading = true; notifyListeners();
    try {
      final res = await _api.getHealthContent();
      if (res['success'] != false) _healthContent = (res['articles'] as List?) ?? (res as List?) ?? [];
    } catch (e) { _error = e.toString(); }
    _loading = false; notifyListeners();
  }

  Future<void> loadHealthData() async {
    _loading = true; notifyListeners();
    try {
      final res = await _api.getHealthData();
      if (res['success'] != false) _healthData = res['data'] as Map<String, dynamic>?;
    } catch (e) { _error = e.toString(); }
    _loading = false; notifyListeners();
  }
}
