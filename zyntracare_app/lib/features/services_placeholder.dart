import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../data/services/mock_data_service.dart';

class PharmaciesScreen extends StatelessWidget {
  const PharmaciesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final pharmacies = MockDataService.getPharmacies();
    return Scaffold(
      appBar: AppBar(title: const Text('Pharmacies')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: pharmacies.length,
        itemBuilder: (context, index) {
          final p = pharmacies[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.local_pharmacy, color: Colors.green),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text('${p.address}, ${p.city}', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      ])),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      if (p.is24Hours) Chip(label: const Text('24 Hours'), backgroundColor: Colors.green.withValues(alpha: 0.1)),
                      if (p.deliveryAvailable) const SizedBox(width: 8),
                      if (p.deliveryAvailable) Chip(label: const Text('Delivery'), backgroundColor: Colors.blue.withValues(alpha: 0.1)),
                      const Spacer(),
                      Row(children: [const Icon(Icons.star, color: Colors.amber, size: 18), Text(' ${p.rating}', style: const TextStyle(fontWeight: FontWeight.bold))]),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: OutlinedButton.icon(icon: const Icon(Icons.call), label: const Text('Call'), onPressed: () {})),
                      const SizedBox(width: 12),
                      Expanded(child: ElevatedButton.icon(icon: const Icon(Icons.shopping_cart), label: const Text('Order'), onPressed: () {})),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class LabsScreen extends StatelessWidget {
  const LabsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final labs = MockDataService.getLabs();
    return Scaffold(
      appBar: AppBar(title: const Text('Labs')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: labs.length,
        itemBuilder: (context, index) {
          final lab = labs[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.science, color: Colors.orange),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(lab.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text('${lab.address}, ${lab.city}', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      ])),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text('Tests: ${lab.tests.take(3).join(", ")}...', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      if (lab.homeCollection) Chip(label: const Text('Home Collection'), backgroundColor: Colors.blue.withValues(alpha: 0.1)),
                      const Spacer(),
                      Row(children: [const Icon(Icons.star, color: Colors.amber, size: 18), Text(' ${lab.rating}', style: const TextStyle(fontWeight: FontWeight.bold))]),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(icon: const Icon(Icons.calendar_today), label: const Text('Book Test'), onPressed: () {}),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class HealthTrackerScreen extends StatelessWidget {
  const HealthTrackerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Health Tracker')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildMetricCard('Heart Rate', '78 bpm', Icons.favorite, Colors.red),
            _buildMetricCard('Blood Pressure', '120/80 mmHg', Icons.speed, Colors.blue),
            _buildMetricCard('Blood Sugar', '100 mg/dL', Icons.water_drop, Colors.purple),
            _buildMetricCard('Temperature', '98.6°F', Icons.thermostat, Colors.orange),
            _buildMetricCard('Oxygen Level', '98%', Icons.air, Colors.teal),
            _buildMetricCard('Weight', '70 kg', Icons.monitor_weight, Colors.green),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(icon: const Icon(Icons.add), label: const Text('Add New Reading'), onPressed: () {}),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color),
        ),
        title: Text(title),
        subtitle: Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: color)),
        trailing: IconButton(icon: const Icon(Icons.edit), onPressed: () {}),
      ),
    );
  }
}

class AIChatScreen extends StatelessWidget {
  const AIChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Health Coach')),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), shape: BoxShape.circle),
                    child: const Icon(Icons.smart_toy, size: 60, color: Colors.blue),
                  ),
                  const SizedBox(height: 16),
                  const Text('AI Health Coach', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Text('Ask me anything about your health, symptoms, or get personalized health advice.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary)),
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Type your question...',
                      filled: true,
                      fillColor: AppColors.surfaceVariant,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: Colors.blue,
                  child: IconButton(icon: const Icon(Icons.send, color: Colors.white), onPressed: () {}),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class AmbulanceScreen extends StatelessWidget {
  const AmbulanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Book Ambulance')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [Colors.red.shade600, Colors.red.shade800]),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  const Icon(Icons.medical_services, size: 60, color: Colors.white),
                  const SizedBox(height: 12),
                  const Text('24/7 Ambulance Service', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 8),
                  const Text('Call now for immediate assistance', style: TextStyle(color: Colors.white70)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.call),
                    label: const Text('Call 102 / 108'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.red),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Or Book Online', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildAmbulanceType('Basic Life Support', 'AC, Basic medical equipment', '₹500'),
                    _buildAmbulanceType('Advanced Life Support', 'Ventilator, Cardiac monitor', '₹1000'),
                    _buildAmbulanceType('Neonatal Ambulance', 'Incubator, Neonatal specialist', '₹1500'),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(onPressed: () {}, child: const Text('Book Now')),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAmbulanceType(String title, String desc, String price) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
        child: const Icon(Icons.medical_services, color: Colors.orange),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(desc, style: const TextStyle(fontSize: 12)),
      trailing: Text(price, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
    );
  }
}