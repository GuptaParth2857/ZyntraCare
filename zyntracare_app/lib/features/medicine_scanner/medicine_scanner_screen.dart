import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../data/services/mock_data_service.dart';

class MedicineScannerScreen extends StatefulWidget {
  const MedicineScannerScreen({super.key});

  @override
  State<MedicineScannerScreen> createState() => _MedicineScannerScreenState();
}

class _MedicineScannerScreenState extends State<MedicineScannerScreen> {
  final List medicines = MockDataService.getMedicines();
  String searchQuery = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Medicine Scanner')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            child: TextField(
              onChanged: (v) => setState(() => searchQuery = v),
              decoration: InputDecoration(
                hintText: 'Search medicines...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: AppColors.surfaceVariant,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: medicines.length,
              itemBuilder: (context, index) {
                final med = medicines[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.purple.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.medication, color: Colors.purple),
                    ),
                    title: Text(med.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(med.manufacturer ?? 'Unknown'),
                    trailing: med.verified ? const Icon(Icons.verified, color: AppColors.success) : null,
                    onTap: () => _showMedicineDetails(context, med),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showMedicineDetails(BuildContext context, dynamic med) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (ctx, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 20),
              Text(med.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              if (med.manufacturer != null) Text('By ${med.manufacturer}', style: TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 16),
              if (med.composition != null) ...[_buildDetailSection('Composition', med.composition)],
              if (med.uses != null) ...[_buildDetailSection('Uses', med.uses)],
              if (med.sideEffects != null) ...[_buildDetailSection('Side Effects', med.sideEffects)],
              if (med.warnings != null) ...[_buildDetailSection('Warnings', med.warnings)],
              if (med.price != null) ...[const SizedBox(height: 16), Text('Price: ₹${med.price}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.success))],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 4),
          Text(content, style: TextStyle(color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}