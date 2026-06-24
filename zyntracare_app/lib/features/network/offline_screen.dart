import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme.dart';

class OfflineScreen extends StatefulWidget {
  const OfflineScreen({super.key});
  @override State<OfflineScreen> createState() => _OfflineScreenState();
}

class _OfflineScreenState extends State<OfflineScreen> {
  bool _isOnline = false;
  bool _downloading = false;
  String _lastSync = 'Never';
  int _cachedHospitals = 24;
  int _cachedDoctors = 156;
  int _cachedPharmacies = 89;
  int _queueCount = 3;
  double _storageUsed = 0.45;

  @override
  void initState() {
    super.initState();
    _loadSyncStatus();
  }

  Future<void> _loadSyncStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final ts = prefs.getString('last_sync') ?? '';
    if (mounted) {
      setState(() {
        _lastSync = ts.isNotEmpty ? ts : 'Never';
      });
    }
  }

  Future<void> _downloadForOffline() async {
    setState(() => _downloading = true);
    await Future.delayed(const Duration(seconds: 3));
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('last_sync', DateTime.now().toIso8601String());
    if (mounted) {
      setState(() {
        _downloading = false;
        _isOnline = false;
        _lastSync = DateTime.now().toIso8601String();
        _cachedHospitals = 24;
        _cachedDoctors = 156;
        _cachedPharmacies = 89;
        _queueCount = 0;
        _storageUsed = 0.45;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text('Data downloaded for offline use!'),
        backgroundColor: ZyntraColors.green,
      ));
    }
  }

  String _formatTimestamp(String ts) {
    if (ts == 'Never') return 'Never';
    try {
      final dt = DateTime.parse(ts);
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${diff.inDays}d ago';
    } catch (_) {
      return ts;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface,
        elevation: 0,
        title: Text('Offline Mode', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildConnectionCard(),
            const SizedBox(height: 16),
            _buildCachedDataCard(),
            const SizedBox(height: 16),
            _buildStorageCard(),
            const SizedBox(height: 16),
            _buildSyncQueue(),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectionCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Column(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: _isOnline ? ZyntraColors.green.withValues(alpha: 0.15) : ZyntraColors.amber.withValues(alpha: 0.15),
              border: Border.all(color: _isOnline ? ZyntraColors.green.withValues(alpha: 0.4) : ZyntraColors.amber.withValues(alpha: 0.4), width: 2),
            ),
            child: Icon(
              _isOnline ? Icons.wifi_rounded : Icons.wifi_off_rounded,
              color: _isOnline ? ZyntraColors.green : ZyntraColors.amber,
              size: 40,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _isOnline ? 'Connected' : 'Offline Mode',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white),
          ),
          const SizedBox(height: 4),
          Text(
            _isOnline ? 'You are connected to the internet' : 'Using cached data',
            style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _downloading ? null : _downloadForOffline,
            child: Container(
              width: double.infinity,
              height: 48,
              decoration: BoxDecoration(
                gradient: _downloading ? null : const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                color: _downloading ? ZyntraColors.card : null,
                borderRadius: BorderRadius.circular(14),
                border: _downloading ? Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.5)) : null,
              ),
              child: Center(
                child: _downloading
                    ? Row(mainAxisSize: MainAxisSize.min, children: [
                        const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: ZyntraColors.cyan, strokeWidth: 2)),
                        const SizedBox(width: 8),
                        Text('Downloading...', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontWeight: FontWeight.w600)),
                      ])
                    : Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(Icons.download_rounded, color: Colors.white, size: 18),
                        const SizedBox(width: 8),
                        Text('Download for Offline', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                      ]),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.sync_rounded, color: ZyntraColors.white70, size: 14),
              const SizedBox(width: 6),
              Text('Last sync: ${_formatTimestamp(_lastSync)}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCachedDataCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Cached Data', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
          const SizedBox(height: 14),
          Row(
            children: [
              _cacheTile(Icons.local_hospital_rounded, 'Hospitals', _cachedHospitals.toString(), ZyntraColors.cyan),
              const SizedBox(width: 10),
              _cacheTile(Icons.person_rounded, 'Doctors', _cachedDoctors.toString(), ZyntraColors.purple),
              const SizedBox(width: 10),
              _cacheTile(Icons.local_pharmacy_rounded, 'Pharmacies', _cachedPharmacies.toString(), ZyntraColors.green),
            ],
          ),
        ],
      ),
    );
  }

  Widget _cacheTile(IconData icon, String label, String count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12), border: Border.all(color: color.withValues(alpha: 0.15))),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 6),
            Text(count, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
            Text(label, style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.white70)),
          ],
        ),
      ),
    );
  }

  Widget _buildStorageCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Storage Usage', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: _storageUsed,
              backgroundColor: ZyntraColors.surface,
              valueColor: AlwaysStoppedAnimation<Color>(
                _storageUsed > 0.8 ? ZyntraColors.red : _storageUsed > 0.5 ? ZyntraColors.amber : ZyntraColors.cyan,
              ),
              minHeight: 10,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${(_storageUsed * 100).toStringAsFixed(0)}% used', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              Text('${(_storageUsed * 256).toStringAsFixed(0)} / 256 MB', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSyncQueue() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Sync Queue', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
              if (_queueCount > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: ZyntraColors.amber.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                  child: Text('$_queueCount pending', style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.amber, fontWeight: FontWeight.w600)),
                ),
            ],
          ),
          const SizedBox(height: 14),
          if (_queueCount == 0)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: ZyntraColors.green.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12)),
              child: Row(children: [
                Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 16),
                const SizedBox(width: 8),
                Text('All data synced!', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 13)),
              ]),
            )
          else
            ...List.generate(_queueCount, (i) => Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(10)),
              child: Row(children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: ZyntraColors.amber.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                  child: Icon(Icons.sync_rounded, color: ZyntraColors.amber, size: 14),
                ),
                const SizedBox(width: 10),
                Expanded(child: Text(['Hospital visit record update', 'New blood request response', 'Emergency contact sync'][i], style: GoogleFonts.inter(color: Colors.white, fontSize: 12))),
                Text('Pending', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 10, fontWeight: FontWeight.w500)),
              ]),
            )),
        ],
      ),
    );
  }
}
