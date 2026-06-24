import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class MapsScreen extends StatefulWidget {
  const MapsScreen({super.key});
  @override State<MapsScreen> createState() => _MapsScreenState();
}

class _MapsScreenState extends State<MapsScreen> {
  final MapController _mapCtrl = MapController();
  final TextEditingController _searchCtrl = TextEditingController();
  final List<Marker> _markers = [];
  final _rng = Random();

  LatLng _center = const LatLng(28.6139, 77.2090);
  String _selectedCategory = 'All';
  bool _loading = true;

  static const _categories = ['All', 'Hospitals', 'Pharmacies', 'Labs', 'Clinics'];

  final _places = <Map<String, dynamic>>[];

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      await Geolocator.requestPermission();
      final pos = await Geolocator.getCurrentPosition();
      if (mounted) {
        setState(() {
          _center = LatLng(pos.latitude, pos.longitude);
        });
      }
    } catch (_) {}
    _loadPlaces();
  }

  Future<void> _loadPlaces() async {
    setState(() => _loading = true);
    try {
      final data = await apiService.get('/api/hospitals/nearby', params: {
        'lat': _center.latitude.toString(),
        'lng': _center.longitude.toString(),
      });
      if (data != null && data['hospitals'] != null) {
        for (final h in data['hospitals'] as List) {
          _places.add(h);
        }
      }
    } catch (_) {}
    _updateMarkers();
    if (mounted) setState(() => _loading = false);
  }

  void _updateMarkers() {
    _markers.clear();
    for (final p in _places) {
      final lat = p['location']?['lat'] ?? _center.latitude + (_rng.nextDouble() - 0.5) * 0.05;
      final lng = p['location']?['lng'] ?? _center.longitude + (_rng.nextDouble() - 0.5) * 0.05;
      _markers.add(Marker(
        point: LatLng(lat, lng),
        width: 80,
        height: 100,
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: ZyntraColors.cyan,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.4), blurRadius: 8)],
            ),
            child: Text(p['name'] ?? 'Place', style: GoogleFonts.inter(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w600)),
          ),
          const Icon(Icons.location_on_rounded, color: ZyntraColors.red, size: 28),
        ]),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      body: Stack(children: [
        FlutterMap(
          mapController: _mapCtrl,
          options: MapOptions(
            initialCenter: _center,
            initialZoom: 13,
            onTap: (_, __) => FocusScope.of(context).unfocus(),
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              subdomains: const ['a', 'b', 'c'],
              userAgentPackageName: 'com.zyntracare.zyntracare_app',
            ),
            MarkerLayer(markers: _markers),
          ],
        ),
        // Top bar
        Positioned(
          top: 0, left: 0, right: 0,
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: ZyntraColors.card.withValues(alpha: 0.95),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: ZyntraColors.border),
                  ),
                  child: Row(children: [
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: ZyntraColors.bg, borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: TextField(
                      controller: _searchCtrl,
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Search nearby...',
                        hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 14),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                      ),
                      onSubmitted: (_) => _loadPlaces(),
                    )),
                    const Icon(Icons.search_rounded, color: ZyntraColors.cyan, size: 20),
                  ]),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(children: _categories.map((c) {
                    final sel = c == _selectedCategory;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedCategory = c),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: sel ? ZyntraColors.cyan : ZyntraColors.card.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: sel ? ZyntraColors.cyan : ZyntraColors.border),
                        ),
                        child: Text(c, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                      ),
                    );
                  }).toList()),
                ),
              ]),
            ),
          ),
        ),
        // Bottom card
        if (!_loading && _places.isNotEmpty)
          Positioned(
            bottom: 120, left: 16, right: 16,
            child: Container(
              height: 120,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: ZyntraColors.card.withValues(alpha: 0.95),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: ZyntraColors.border),
              ),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _places.length,
                itemBuilder: (_, i) {
                  final p = _places[i];
                  return Container(
                    width: 160,
                    margin: const EdgeInsets.only(right: 12),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(p['name'] ?? '', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                      const SizedBox(height: 4),
                      Text(p['city'] ?? p['address'] ?? '', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                      const SizedBox(height: 4),
                      Row(children: [
                        Text('\u2605 ${p['rating'] ?? '4.0'}', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 12)),
                        const SizedBox(width: 8),
                        Text('${p['beds']?['available'] ?? '—'} beds', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 11)),
                      ]),
                    ]),
                  );
                },
              ),
            ),
          ),
        if (_loading)
          const Center(child: CircularProgressIndicator(color: ZyntraColors.cyan)),
      ]),
    );
  }
}
