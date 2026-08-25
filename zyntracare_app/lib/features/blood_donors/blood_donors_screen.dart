import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../data/services/mock_data_service.dart';

class BloodDonorsScreen extends StatelessWidget {
  const BloodDonorsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final donors = MockDataService.getBloodDonors();
    return Scaffold(
      appBar: AppBar(title: const Text('Blood Donors')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.red.shade50,
            child: Row(
              children: [
                const Icon(Icons.bloodtype, color: Colors.red, size: 40),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Need Blood?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text('Request blood from nearby donors', style: TextStyle(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                ElevatedButton(onPressed: () {}, child: const Text('Request')),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: donors.length,
              itemBuilder: (context, index) {
                final donor = donors[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: _getBloodGroupColor(donor.bloodGroup).withValues(alpha: 0.2),
                      child: Text(donor.bloodGroup, style: TextStyle(color: _getBloodGroupColor(donor.bloodGroup), fontWeight: FontWeight.bold)),
                    ),
                    title: Text(donor.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${donor.city ?? ""} • ${donor.bloodGroup}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: donor.available ? Colors.green.withValues(alpha: 0.1) : Colors.grey.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                          child: Text(donor.available ? 'Available' : 'Unavailable', style: TextStyle(color: donor.available ? Colors.green : Colors.grey, fontSize: 12)),
                        ),
                        const SizedBox(width: 8),
                        IconButton(icon: const Icon(Icons.call, color: Colors.green), onPressed: () {}),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Color _getBloodGroupColor(String bg) {
    switch (bg) {
      case 'O+': case 'O-': return Colors.red;
      case 'A+': case 'A-': return Colors.blue;
      case 'B+': case 'B-': return Colors.orange;
      case 'AB+': case 'AB-': return Colors.purple;
      default: return Colors.grey;
    }
  }
}