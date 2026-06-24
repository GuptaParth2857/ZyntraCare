import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class PetsScreen extends StatefulWidget {
  const PetsScreen({super.key});
  @override State<PetsScreen> createState() => _PetsScreenState();
}

class _PetsScreenState extends State<PetsScreen> with SingleTickerProviderStateMixin {
  final _api = ApiService();
  bool _loading = true;
  List<Map<String, dynamic>> _pets = [];
  late TabController _tabCtrl;

  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _breedCtrl = TextEditingController();
  final _ageCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  String _petType = 'Dog';
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    _fetchPets();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _nameCtrl.dispose();
    _breedCtrl.dispose();
    _ageCtrl.dispose();
    _weightCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchPets() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/pets');
    if (mounted) {
      setState(() {
        if (res is List) {
          _pets = res.cast<Map<String, dynamic>>();
        } else if (res is Map && res['data'] != null) {
          _pets = (res['data'] as List).cast<Map<String, dynamic>>();
        } else {
          _pets = _mockPets();
        }
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _mockPets() {
    return [
      {'id': '1', 'name': 'Max', 'type': 'Dog', 'breed': 'Golden Retriever', 'age': 3, 'weight': 28.5, 'healthStatus': 'Healthy', 'nextVaccination': '2026-08-15', 'lastCheckup': '2026-05-10', 'vaccinations': ['Rabies', 'DHPP', 'Bordetella']},
      {'id': '2', 'name': 'Bella', 'type': 'Cat', 'breed': 'Persian', 'age': 2, 'weight': 4.2, 'healthStatus': 'Healthy', 'nextVaccination': '2026-09-20', 'lastCheckup': '2026-04-22', 'vaccinations': ['FVRCP', 'Rabies']},
      {'id': '3', 'name': 'Charlie', 'type': 'Dog', 'breed': 'Beagle', 'age': 5, 'weight': 12.0, 'healthStatus': 'Needs Checkup', 'nextVaccination': '2026-07-01', 'lastCheckup': '2025-12-15', 'vaccinations': ['Rabies', 'DHPP']},
      {'id': '4', 'name': 'Luna', 'type': 'Cat', 'breed': 'Siamese', 'age': 1, 'weight': 3.8, 'healthStatus': 'Healthy', 'nextVaccination': '2026-10-05', 'lastCheckup': '2026-06-01', 'vaccinations': ['FVRCP', 'FeLV']},
    ];
  }

  Future<void> _addPet() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    final body = {
      'name': _nameCtrl.text,
      'type': _petType,
      'breed': _breedCtrl.text,
      'age': int.tryParse(_ageCtrl.text) ?? 0,
      'weight': double.tryParse(_weightCtrl.text) ?? 0.0,
    };
    final res = await _api.post('/api/pets', body: body);
    if (mounted) {
      setState(() => _submitting = false);
      if (res is Map && res['success'] == false) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res['error'] ?? 'Failed'), backgroundColor: ZyntraColors.red));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pet added!'), backgroundColor: ZyntraColors.green));
        Navigator.pop(context);
        _fetchPets();
      }
    }
  }

  Color _healthColor(String status) {
    switch (status) {
      case 'Healthy': return ZyntraColors.green;
      case 'Needs Checkup': return ZyntraColors.amber;
      case 'Critical': return ZyntraColors.red;
      default: return ZyntraColors.white70;
    }
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'Dog': return ZyntraColors.amber;
      case 'Cat': return ZyntraColors.cyan;
      case 'Bird': return ZyntraColors.teal;
      case 'Rabbit': return ZyntraColors.purple;
      default: return ZyntraColors.white70;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface,
        elevation: 0,
        title: Text('Pet Health', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        actions: [
          GestureDetector(
            onTap: _showAddPetForm,
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.pets_rounded, color: ZyntraColors.cyan, size: 20),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: ZyntraColors.cyan,
          labelColor: ZyntraColors.cyan,
          unselectedLabelColor: ZyntraColors.white70,
          labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600),
          tabs: const [
            Tab(text: 'My Pets'),
            Tab(text: 'Vaccinations'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: [
          _buildPetsTab(),
          _buildVaccinationTab(),
        ],
      ),
    );
  }

  Widget _buildPetsTab() {
    return RefreshIndicator(
      color: ZyntraColors.cyan,
      onRefresh: _fetchPets,
      child: _loading
          ? ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: 3,
              itemBuilder: (_, _) => _shimmerCard(),
            )
          : _pets.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.pets_outlined, size: 64, color: ZyntraColors.white70.withValues(alpha: 0.4)),
                      const SizedBox(height: 12),
                      Text('No pets added yet', style: GoogleFonts.inter(color: ZyntraColors.white70)),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: _showAddPetForm,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Text('Add Your First Pet', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _pets.length,
                  itemBuilder: (_, i) => _buildPetCard(_pets[i]),
                ),
    );
  }

  Widget _buildPetCard(Map<String, dynamic> pet) {
    final type = pet['type']?.toString() ?? 'Dog';
    final tColor = _typeColor(type);
    final health = pet['healthStatus']?.toString() ?? 'Healthy';
    final hColor = _healthColor(health);
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 56, height: 56,
                decoration: BoxDecoration(
                  color: tColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: tColor.withValues(alpha: 0.3)),
                ),
                child: Center(child: Icon(type == 'Dog' ? Icons.pets : Icons.cruelty_free_rounded, color: tColor, size: 28)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(pet['name']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: hColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                          child: Text(health, style: GoogleFonts.inter(fontSize: 9, color: hColor, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text('${pet['breed'] ?? ''} • ', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
                        Text('${pet['age'] ?? 0} yrs', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
                        Text(' • ${pet['weight'] ?? 0} kg', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: tColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                child: Text(type, style: GoogleFonts.inter(fontSize: 10, color: tColor, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _infoChip(Icons.calendar_today_rounded, 'Next Vaccination', pet['nextVaccination']?.toString() ?? 'N/A', ZyntraColors.cyan),
              const SizedBox(width: 8),
              _infoChip(Icons.medical_services_rounded, 'Last Checkup', pet['lastCheckup']?.toString() ?? 'N/A', ZyntraColors.purple),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoChip(IconData icon, String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withValues(alpha: 0.15))),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 14),
            const SizedBox(width: 6),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(label, style: GoogleFonts.inter(fontSize: 9, color: ZyntraColors.white70)),
              Text(value, style: GoogleFonts.inter(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600)),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _buildVaccinationTab() {
    if (_loading) {
      return ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 3,
        itemBuilder: (_, _) => _shimmerCard(),
      );
    }
    if (_pets.isEmpty) {
      return Center(child: Text('Add a pet to track vaccinations', style: GoogleFonts.inter(color: ZyntraColors.white70)));
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: _pets.map((pet) => Container(
        margin: const EdgeInsets.only(bottom: 14),
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
              children: [
                Text(pet['name']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
                const SizedBox(width: 8),
                Text('• ${pet['type']}', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
              ],
            ),
            const SizedBox(height: 10),
            if (pet['vaccinations'] is List)
              ...(pet['vaccinations'] as List).map((v) => Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(10)),
                child: Row(children: [
                  Icon(Icons.check_circle_rounded, color: ZyntraColors.green, size: 16),
                  const SizedBox(width: 8),
                  Text(v.toString(), style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
                ]),
              )),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: ZyntraColors.cyan.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.2)),
              ),
              child: Row(children: [
                Icon(Icons.event_rounded, color: ZyntraColors.cyan, size: 14),
                const SizedBox(width: 6),
                Text('Next due: ${pet['nextVaccination'] ?? 'N/A'}', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12)),
              ]),
            ),
          ],
        ),
      )).toList(),
    );
  }

  void _showAddPetForm() {
    _nameCtrl.clear();
    _breedCtrl.clear();
    _ageCtrl.clear();
    _weightCtrl.clear();
    setState(() => _petType = 'Dog');
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: ZyntraColors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Add Pet', style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _nameCtrl,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  decoration: _inputDec('Pet Name', Icons.pets),
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _petType,
                  items: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((e) => DropdownMenuItem(value: e, child: Text(e, style: GoogleFonts.inter(color: Colors.white)))).toList(),
                  onChanged: (v) => setState(() => _petType = v!),
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  dropdownColor: ZyntraColors.card,
                  decoration: _inputDec('Type', Icons.category),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _breedCtrl,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  decoration: _inputDec('Breed', Icons.badge),
                ),
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(child: TextFormField(
                    controller: _ageCtrl,
                    keyboardType: TextInputType.number,
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                    decoration: _inputDec('Age (yrs)', Icons.calendar_today),
                  )),
                  const SizedBox(width: 12),
                  Expanded(child: TextFormField(
                    controller: _weightCtrl,
                    keyboardType: TextInputType.number,
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                    decoration: _inputDec('Weight (kg)', Icons.monitor_weight_outlined),
                  )),
                ]),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: _submitting ? null : _addPet,
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Center(
                      child: _submitting
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : Text('Add Pet', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDec(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13),
      prefixIcon: Icon(icon, color: ZyntraColors.cyan, size: 20),
      filled: true,
      fillColor: ZyntraColors.card,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.border.withValues(alpha: 0.5))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: ZyntraColors.cyan.withValues(alpha: 0.6))),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }

  Widget _shimmerCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          Container(width: 56, height: 56, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(16))),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(height: 14, width: 120, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
              const SizedBox(height: 6),
              Container(height: 10, width: 160, decoration: BoxDecoration(color: ZyntraColors.surface, borderRadius: BorderRadius.circular(4))),
            ]),
          ),
        ],
      ),
    ).animate(onPlay: (ctrl) => ctrl.repeat()).shimmer(duration: 1500.ms, color: ZyntraColors.border.withValues(alpha: 0.3));
  }
}
