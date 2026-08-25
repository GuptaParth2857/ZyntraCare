import 'package:flutter/foundation.dart';
import '../data/models/models.dart';
import '../data/services/api_service.dart';

class EmergencyProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<BloodDonor> _donors = [];
  bool _loading = false;
  String? _error;

  List<BloodDonor> get donors => _donors;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadBloodDonors() async {
    _loading = true; _error = null; notifyListeners();
    try {
      final res = await _api.getBloodDonors();
      if (res['success'] == false) { _error = res['error']; }
      else { _donors = (res['donors'] as List?)?.map((e) => BloodDonor.fromJson(e)).toList() ?? []; }
    } catch (e) { _error = e.toString(); }
    _loading = false; notifyListeners();
  }
}
