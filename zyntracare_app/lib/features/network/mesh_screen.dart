import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class MeshScreen extends StatefulWidget {
  const MeshScreen({super.key});
  @override State<MeshScreen> createState() => _MeshScreenState();
}

class _MeshScreenState extends State<MeshScreen> with SingleTickerProviderStateMixin {
  bool _scanning = false;
  String _connectionStatus = 'Disconnected';
  int _nearbyCount = 0;
  List<Map<String, dynamic>> _pairedDevices = [];
  final _chatCtrl = TextEditingController();
  List<Map<String, dynamic>> _chatMessages = [];
  late AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))..repeat(reverse: true);
    _loadMockData();
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _chatCtrl.dispose();
    super.dispose();
  }

  void _loadMockData() {
    _pairedDevices = [
      {'name': 'Rahul\'s Pixel 7', 'signal': 85, 'lastSeen': '2 min ago'},
      {'name': 'Priya\'s OnePlus 12', 'signal': 62, 'lastSeen': '5 min ago'},
      {'name': 'Aryan\'s Mi 14', 'signal': 45, 'lastSeen': '12 min ago'},
    ];
    _nearbyCount = 7;
    _chatMessages = [
      {'sender': 'Rahul', 'msg': 'Anyone near Sector 18? Need medical kit', 'time': '10:32 AM', 'isMe': false},
      {'sender': 'You', 'msg': 'I\'m at Block C. Have basic supplies.', 'time': '10:33 AM', 'isMe': true},
      {'sender': 'Priya', 'msg': 'Coming from Sector 12 with first aid', 'time': '10:35 AM', 'isMe': false},
    ];
  }

  void _startScan() {
    setState(() => _scanning = true);
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _scanning = false;
          _connectionStatus = 'Paired';
          _nearbyCount = 7;
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('$_nearbyCount devices found!'), backgroundColor: ZyntraColors.green,
        ));
      }
    });
  }

  void _sendMessage() {
    if (_chatCtrl.text.trim().isEmpty) return;
    setState(() {
      _chatMessages.add({'sender': 'You', 'msg': _chatCtrl.text.trim(), 'time': 'Just now', 'isMe': true});
      _chatCtrl.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        backgroundColor: ZyntraColors.surface,
        elevation: 0,
        title: Text('Mesh Network', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            child: _buildStatusDot(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusCard(),
            const SizedBox(height: 16),
            _buildNetworkInfo(),
            const SizedBox(height: 16),
            _buildPairedDevices(),
            const SizedBox(height: 16),
            _buildMeshChat(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusDot() {
    Color dotColor;
    switch (_connectionStatus) {
      case 'Connected': dotColor = ZyntraColors.green; break;
      case 'Paired': dotColor = ZyntraColors.cyan; break;
      default: dotColor = ZyntraColors.red; break;
    }
    return AnimatedBuilder(
      animation: _pulseCtrl,
      builder: (_, _) => Container(
        width: 12, height: 12,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: dotColor,
          boxShadow: [BoxShadow(color: dotColor.withValues(alpha: _pulseCtrl.value * 0.6), blurRadius: 8, spreadRadius: 2)],
        ),
      ),
    );
  }

  Widget _buildStatusCard() {
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _statItem(Icons.wifi_rounded, _connectionStatus, ZyntraColors.cyan),
              _statItem(Icons.devices_rounded, '$_nearbyCount Nearby', ZyntraColors.purple),
              _statItem(Icons.bluetooth_rounded, 'BLE 5.0', ZyntraColors.teal),
            ],
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _scanning ? null : _startScan,
            child: Container(
              width: double.infinity,
              height: 48,
              decoration: BoxDecoration(
                gradient: _scanning ? null : const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                color: _scanning ? ZyntraColors.card : null,
                borderRadius: BorderRadius.circular(14),
                border: _scanning ? Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.5)) : null,
              ),
              child: Center(
                child: _scanning
                    ? Row(mainAxisSize: MainAxisSize.min, children: [
                        const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: ZyntraColors.cyan, strokeWidth: 2)),
                        const SizedBox(width: 8),
                        Text('Scanning...', style: GoogleFonts.inter(color: ZyntraColors.cyan, fontWeight: FontWeight.w600)),
                      ])
                    : Text('Scan for Devices', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statItem(IconData icon, String label, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 28),
        const SizedBox(height: 6),
        Text(label, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildNetworkInfo() {
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
          Text('Mesh Network Info', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          _infoRow('Protocol', 'Bluetooth LE Mesh'),
          _infoRow('Encryption', 'AES-128 (end-to-end)'),
          _infoRow('Range', '~100m (line-of-sight)'),
          _infoRow('Topology', 'Star-Mesh Hybrid'),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
          Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildPairedDevices() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Paired Devices', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
        const SizedBox(height: 10),
        ..._pairedDevices.map((d) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: ZyntraColors.border.withValues(alpha: 0.5)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: ZyntraColors.cyan.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.smartphone_rounded, color: ZyntraColors.cyan, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(d['name']?.toString() ?? '', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                    Text('Last seen: ${d['lastSeen'] ?? ''}', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ],
                ),
              ),
              _signalBars(d['signal'] as int? ?? 0),
            ],
          ),
        )),
      ],
    );
  }

  Widget _signalBars(int strength) {
    return Row(
      children: List.generate(4, (i) {
        final filled = i < (strength / 25).ceil();
        return Container(
          width: 4,
          height: 8 + i * 4.0,
          margin: const EdgeInsets.only(right: 2),
          decoration: BoxDecoration(
            color: filled ? ZyntraColors.cyan : ZyntraColors.border,
            borderRadius: BorderRadius.circular(2),
          ),
        );
      }),
    );
  }

  Widget _buildMeshChat() {
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
          Text('Mesh Chat', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          ..._chatMessages.map((m) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: m['isMe'] == true ? ZyntraColors.cyan.withValues(alpha: 0.1) : ZyntraColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (m['isMe'] != true)
                  CircleAvatar(
                    radius: 12,
                    backgroundColor: ZyntraColors.purple.withValues(alpha: 0.2),
                    child: Text((m['sender']?.toString() ?? '?')[0], style: GoogleFonts.inter(color: ZyntraColors.purple, fontSize: 10)),
                  ),
                if (m['isMe'] != true) const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(m['sender']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 10, color: ZyntraColors.cyan, fontWeight: FontWeight.w600)),
                          Text(m['time']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 9, color: ZyntraColors.white70)),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(m['msg']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 12, color: Colors.white)),
                    ],
                  ),
                ),
              ],
            ),
          )),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _chatCtrl,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Type a message...',
                    hintStyle: GoogleFonts.inter(color: ZyntraColors.white70.withValues(alpha: 0.5)),
                    filled: true,
                    fillColor: ZyntraColors.surface,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: _sendMessage,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
