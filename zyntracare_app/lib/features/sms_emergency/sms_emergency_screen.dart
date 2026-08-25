import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:zyntracare/core/theme.dart';
import 'package:zyntracare/data/services/api_service.dart';

class SmsEmergencyScreen extends StatefulWidget {
  const SmsEmergencyScreen({super.key});
  @override State<SmsEmergencyScreen> createState() => _SmsEmergencyScreenState();
}

class _SmsEmergencyScreenState extends State<SmsEmergencyScreen> with TickerProviderStateMixin {
  final _api = ApiService();
  bool _loading = true;
  bool _sosActivated = false;
  bool _attachLocation = true;
  bool _autoSendAll = false;
  List<Map<String, dynamic>> _contacts = [];
  List<Map<String, dynamic>> _sentMessages = [];
  bool _showAddForm = false;

  late AnimationController _shakeCtrl;
  late Animation<double> _shakeAnim;

  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _relationCtrl = TextEditingController();

  final _templates = [
    'I need help at [location]',
    'Medical emergency at [location]',
    'Accident at [location]',
  ];

  @override
  void initState() {
    super.initState();
    _shakeCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 400));
    _shakeAnim = Tween<double>(begin: 0, end: 8).chain(CurveTween(curve: Curves.elasticIn)).animate(_shakeCtrl);
    _fetchData();
  }

  @override
  void dispose() {
    _shakeCtrl.dispose();
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _relationCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    final res = await _api.get('/api/emergency-contacts');
    if (res != null && mounted) {
      setState(() {
        _contacts = (res['contacts'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
        _sentMessages = (res['messages'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  Future<void> _triggerSOS() async {
    setState(() => _sosActivated = !_sosActivated);
    if (_sosActivated) {
      _shakeCtrl.repeat(reverse: true);
      await _api.post('/api/emergency/sos', body: {
        'contacts': _contacts.map((c) => c['phone']).toList(),
        'location': _attachLocation,
        'allContacts': _autoSendAll,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('SOS sent to ${_contacts.length} contacts!', style: GoogleFonts.inter()),
          backgroundColor: ZyntraColors.red,
        ));
        _sentMessages.insert(0, {
          'to': '${_contacts.length} contacts',
          'message': 'SOS Emergency alert',
          'status': 'Sent',
          'time': DateTime.now().toIso8601String(),
        });
        setState(() {});
      }
    } else {
      _shakeCtrl.stop();
      _shakeCtrl.reset();
    }
  }

  void _addContact() {
    if (_nameCtrl.text.isNotEmpty && _phoneCtrl.text.isNotEmpty) {
      setState(() {
        _contacts.add({
          'name': _nameCtrl.text,
          'phone': _phoneCtrl.text,
          'relation': _relationCtrl.text.isNotEmpty ? _relationCtrl.text : 'Other',
          'priority': _contacts.isEmpty ? 'Primary' : 'Secondary',
        });
        _nameCtrl.clear();
        _phoneCtrl.clear();
        _relationCtrl.clear();
        _showAddForm = false;
      });
    }
  }

  void _sendTestMessage(Map<String, dynamic> contact) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('Test message sent to ${contact['name']}', style: GoogleFonts.inter()),
      backgroundColor: ZyntraColors.green,
    ));
    _sentMessages.insert(0, {
      'to': contact['name'],
      'message': 'Test - This is a test message',
      'status': 'Delivered',
      'time': DateTime.now().toIso8601String(),
    });
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        title: Text('SMS Emergency', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight))),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: Icon(_showAddForm ? Icons.close : Icons.person_add_rounded),
            onPressed: () => setState(() => _showAddForm = !_showAddForm),
          ),
        ],
      ),
      body: _loading ? _buildShimmer() : _buildContent(),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: ZyntraColors.card,
      highlightColor: ZyntraColors.border,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(6, (_) => Container(
          height: 80,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
        )),
      ),
    );
  }

  Widget _buildContent() {
    return RefreshIndicator(
      onRefresh: _fetchData,
      color: ZyntraColors.cyan,
      backgroundColor: ZyntraColors.surface,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          _buildSOSButton(),
          const SizedBox(height: 20),
          _buildToggleOptions(),
          const SizedBox(height: 20),
          _buildQuickTemplates(),
          const SizedBox(height: 20),
          if (_showAddForm) _buildAddContactForm(),
          if (_showAddForm) const SizedBox(height: 16),
          _buildContactsSection(),
          const SizedBox(height: 20),
          _buildMessageLog(),
          const SizedBox(height: 32),
        ]),
      ),
    );
  }

  Widget _buildSOSButton() {
    return GestureDetector(
      onTap: _triggerSOS,
      child: AnimatedBuilder(
        animation: _shakeAnim,
        builder: (_, child) => Transform.translate(
          offset: Offset(_sosActivated ? _shakeAnim.value : 0, 0),
          child: child,
        ),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 28),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: _sosActivated
                ? [ZyntraColors.red, ZyntraColors.red.withValues(alpha: 0.7)]
                : [ZyntraColors.red.withValues(alpha: 0.8), ZyntraColors.red.withValues(alpha: 0.4)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.6), width: 2),
            boxShadow: [BoxShadow(color: ZyntraColors.red.withValues(alpha: _sosActivated ? 0.5 : 0.2), blurRadius: 30, offset: const Offset(0, 8))],
          ),
          child: Column(children: [
            Icon(Icons.warning_amber_rounded, color: Colors.white, size: 48),
            const SizedBox(height: 8),
            Text(_sosActivated ? 'SOS ACTIVATED' : 'SEND SOS', style: GoogleFonts.inter(fontSize: 26, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 2)),
            Text(_sosActivated ? 'Help is being requested...' : 'Tap to send emergency alert', style: GoogleFonts.inter(fontSize: 13, color: Colors.white70)),
          ]),
        ),
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildToggleOptions() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(children: [
        SwitchListTile(
          title: Text('Attach Location', style: GoogleFonts.inter(fontSize: 14, color: Colors.white)),
          subtitle: Text('Auto-attach your current location', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
          value: _attachLocation,
          onChanged: (v) => setState(() => _attachLocation = v),
          activeColor: ZyntraColors.cyan,
          contentPadding: EdgeInsets.zero,
        ),
        const Divider(color: ZyntraColors.border, height: 1),
        SwitchListTile(
          title: Text('Auto-send to all contacts', style: GoogleFonts.inter(fontSize: 14, color: Colors.white)),
          subtitle: Text('Send SOS to all contacts simultaneously', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70)),
          value: _autoSendAll,
          onChanged: (v) => setState(() => _autoSendAll = v),
          activeColor: ZyntraColors.cyan,
          contentPadding: EdgeInsets.zero,
        ),
      ]),
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }

  Widget _buildQuickTemplates() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Quick SMS Templates', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
      const SizedBox(height: 12),
      ..._templates.map((t) => GestureDetector(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Message prepared: $t', style: GoogleFonts.inter()),
            backgroundColor: ZyntraColors.cyan,
          ));
        },
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
          ),
          child: Row(children: [
            Icon(Icons.message_rounded, color: ZyntraColors.cyan, size: 20),
            const SizedBox(width: 12),
            Expanded(child: Text(t, style: GoogleFonts.inter(fontSize: 13, color: Colors.white))),
            Icon(Icons.send_rounded, color: ZyntraColors.white70, size: 16),
          ]),
        ),
      )),
    ]).animate().fadeIn(delay: 200.ms, duration: 300.ms);
  }

  Widget _buildAddContactForm() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.purple.withValues(alpha: 0.3)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Add Emergency Contact', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
        const SizedBox(height: 16),
        TextField(
          controller: _nameCtrl,
          style: GoogleFonts.inter(color: Colors.white),
          decoration: _inputDecoration('Full Name', Icons.person_rounded),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _phoneCtrl,
          style: GoogleFonts.inter(color: Colors.white),
          keyboardType: TextInputType.phone,
          decoration: _inputDecoration('Phone Number', Icons.phone_rounded),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _relationCtrl,
          style: GoogleFonts.inter(color: Colors.white),
          decoration: _inputDecoration('Relation (e.g., Spouse, Parent)', Icons.people_rounded),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity, height: 46,
          child: ElevatedButton(
            onPressed: _addContact,
            style: ElevatedButton.styleFrom(
              backgroundColor: ZyntraColors.purple,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            child: Text('Save Contact', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ),
      ]),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildContactsSection() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text('Emergency Contacts', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
        Text('${_contacts.length} saved', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
      ]),
      const SizedBox(height: 12),
      if (_contacts.isEmpty)
        Container(
          width: double.infinity, padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: ZyntraColors.border)),
          child: Text('No emergency contacts added yet', style: GoogleFonts.inter(color: ZyntraColors.white70), textAlign: TextAlign.center),
        )
      else
        ..._contacts.asMap().entries.map((e) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: e.value['priority'] == 'Primary' ? ZyntraColors.red.withValues(alpha: 0.3) : ZyntraColors.border),
          ),
          child: Row(children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: e.value['priority'] == 'Primary' ? ZyntraColors.red.withValues(alpha: 0.15) : ZyntraColors.cyan.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(child: Text((e.value['name'] as String)[0].toUpperCase(), style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: e.value['priority'] == 'Primary' ? ZyntraColors.red : ZyntraColors.cyan))),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(e.value['name'] ?? '', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
              Text('${e.value['phone']} • ${e.value['relation']}', style: GoogleFonts.inter(fontSize: 12, color: ZyntraColors.white70)),
            ])),
            if (e.value['priority'] == 'Primary')
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: ZyntraColors.red.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                child: Text('Primary', style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.red, fontWeight: FontWeight.w600)),
              ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => _sendTestMessage(e.value),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                child: Icon(Icons.message_rounded, color: ZyntraColors.cyan, size: 18),
              ),
            ),
          ]),
        )),
    ]).animate().fadeIn(delay: 300.ms, duration: 300.ms);
  }

  Widget _buildMessageLog() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Sent Messages', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
      const SizedBox(height: 12),
      if (_sentMessages.isEmpty)
        Container(
          width: double.infinity, padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: ZyntraColors.border)),
          child: Text('No messages sent yet', style: GoogleFonts.inter(color: ZyntraColors.white70), textAlign: TextAlign.center),
        )
      else
        ..._sentMessages.take(10).map((msg) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: ZyntraColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5))),
          child: Row(children: [
            Container(
              width: 8, height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: msg['status'] == 'Delivered' ? ZyntraColors.green : msg['status'] == 'Failed' ? ZyntraColors.red : ZyntraColors.amber,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('To: ${msg['to']}', style: GoogleFonts.inter(fontSize: 13, color: Colors.white)),
              Text(msg['message'] ?? '', style: GoogleFonts.inter(fontSize: 11, color: ZyntraColors.white70), maxLines: 1, overflow: TextOverflow.ellipsis),
            ])),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text(msg['status'] ?? '', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: msg['status'] == 'Delivered' ? ZyntraColors.green : msg['status'] == 'Failed' ? ZyntraColors.red : ZyntraColors.amber)),
              if (msg['time'] != null) Text(_formatTime(msg['time'] as String), style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.white70)),
            ]),
          ]),
        )),
    ]).animate().fadeIn(delay: 400.ms, duration: 300.ms);
  }

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.5)),
      prefixIcon: Icon(icon, color: ZyntraColors.white70, size: 20),
      filled: true,
      fillColor: ZyntraColors.surface,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: ZyntraColors.border)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: ZyntraColors.border)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: ZyntraColors.cyan)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }

  String _formatTime(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }
}
