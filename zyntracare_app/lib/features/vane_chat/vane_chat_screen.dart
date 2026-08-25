import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class VaneChatScreen extends StatefulWidget {
  const VaneChatScreen({super.key});
  @override State<VaneChatScreen> createState() => _VaneChatScreenState();
}

class _VaneChatScreenState extends State<VaneChatScreen> with TickerProviderStateMixin {
  final _ctrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _messages = <_VaneMessage>[
    _VaneMessage(role: 'assistant', content: 'Hello! I\'m Vane, your AI health companion. How can I help you today?', time: DateTime.now()),
  ];
  bool _typing = false;
  bool _isRecording = false;
  Timer? _recordTimer;
  int _recordSeconds = 0;
  late AnimationController _pulseCtrl;
  late AnimationController _waveCtrl;
  final _suggestions = ['My health summary', 'Book appointment', 'Check symptoms', 'Medicine reminder'];

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat(reverse: true);
    _waveCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scrollCtrl.dispose();
    _pulseCtrl.dispose();
    _waveCtrl.dispose();
    _recordTimer?.cancel();
    super.dispose();
  }

  Future<void> _send() async {
    final txt = _ctrl.text.trim();
    if (txt.isEmpty) return;
    _ctrl.clear();
    setState(() {
      _messages.add(_VaneMessage(role: 'user', content: txt, time: DateTime.now()));
      _typing = true;
    });
    _scrollDown();
    try {
      final resp = await ApiService().sendChatMessage(txt);
      final reply = resp is Map ? (resp['reply'] ?? resp['response'] ?? resp['message'] ?? 'I understand. Let me help you with that.') : resp.toString();
      if (mounted) {
        setState(() {
          _messages.add(_VaneMessage(role: 'assistant', content: reply, time: DateTime.now()));
          _typing = false;
        });
        _scrollDown();
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _messages.add(_VaneMessage(role: 'assistant', content: 'I\'m here to help! Could you tell me more about what you need?', time: DateTime.now()));
          _typing = false;
        });
        _scrollDown();
      }
    }
  }

  void _sendQuick(String text) {
    _ctrl.text = text;
    _send();
  }

  void _scrollDown() {
    Future.delayed(const Duration(milliseconds: 150), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  void _toggleRecording() {
    if (_isRecording) {
      _recordTimer?.cancel();
      setState(() {
        _isRecording = false;
        _messages.add(_VaneMessage(role: 'user', content: '[Voice input: ${_recordSeconds}s]', time: DateTime.now()));
        _typing = true;
      });
      _scrollDown();
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          setState(() {
            _messages.add(_VaneMessage(role: 'assistant', content: 'I heard your voice message. How can I assist you further?', time: DateTime.now()));
            _typing = false;
          });
          _scrollDown();
        }
      });
    } else {
      setState(() {
        _isRecording = true;
        _recordSeconds = 0;
      });
      _recordTimer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (mounted) setState(() => _recordSeconds++);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(child: _messages.length == 1 ? _buildWelcome() : _buildChatList()),
            if (_messages.length == 1) _buildSuggestions(),
            _buildInputBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      decoration: const BoxDecoration(gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.centerLeft, end: Alignment.centerRight)),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.4), blurRadius: 12)],
            ),
            child: Center(child: Text('V', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Vane AI', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                Row(
                  children: [
                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: ZyntraColors.green, shape: BoxShape.circle)),
                    const SizedBox(width: 6),
                    Text(_typing ? 'Thinking...' : 'Online', style: GoogleFonts.inter(color: _typing ? ZyntraColors.amber : ZyntraColors.green, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => setState(() {
              _messages.clear();
              _messages.add(_VaneMessage(role: 'assistant', content: 'Hello! I\'m Vane, your AI health companion. How can I help you today?', time: DateTime.now()));
            }),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcome() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 30)],
              ),
              child: Center(child: Text('V', style: GoogleFonts.poppins(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w800))),
            ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
            const SizedBox(height: 24),
            Text('Meet Vane', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text('Your personal AI health companion. Ask me anything about your health, medications, symptoms, or wellness goals.',
              style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 14), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  Widget _buildChatList() {
    return ListView.builder(
      controller: _scrollCtrl,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
      itemCount: _messages.length + (_typing ? 1 : 0),
      itemBuilder: (_, i) {
        if (i == _messages.length) return _buildTypingIndicator();
        return _buildMessageBubble(_messages[i], i);
      },
    );
  }

  Widget _buildMessageBubble(_VaneMessage msg, int i) {
    final isUser = msg.role == 'user';
    final timeStr = '${msg.time.hour.toString().padLeft(2, '0')}:${msg.time.minute.toString().padLeft(2, '0')}';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(bottom: 2),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
            decoration: BoxDecoration(
              gradient: isUser ? const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]) : null,
              color: isUser ? null : ZyntraColors.card,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(20), topRight: const Radius.circular(20),
                bottomLeft: Radius.circular(isUser ? 20 : 4),
                bottomRight: Radius.circular(isUser ? 4 : 20),
              ),
              border: isUser ? null : Border.all(color: ZyntraColors.border),
            ),
            child: Text(msg.content, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, height: 1.4)),
          ),
          Padding(
            padding: EdgeInsets.only(left: isUser ? 0 : 8, right: isUser ? 8 : 0, bottom: 10),
            child: Text(timeStr, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10)),
          ),
        ],
      ),
    ).animate().fadeIn(delay: (i * 50).ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20), topRight: Radius.circular(20),
            bottomLeft: Radius.circular(4), bottomRight: Radius.circular(20),
          ),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) => _dot(i)),
        ),
      ),
    );
  }

  Widget _dot(int i) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2),
      child: Container(
        width: 8, height: 8,
        decoration: BoxDecoration(color: ZyntraColors.cyan, shape: BoxShape.circle),
      ).animate(onPlay: (ctrl) => ctrl.repeat()).scaleXY(
        delay: (i * 200).ms, duration: 600.ms, begin: 0.5, end: 1, curve: Curves.easeInOut,
      ),
    );
  }

  Widget _buildSuggestions() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Wrap(
        spacing: 8, runSpacing: 8,
        children: _suggestions.map((s) => GestureDetector(
          onTap: () => _sendQuick(s),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [ZyntraColors.cyan.withValues(alpha: 0.15), ZyntraColors.purple.withValues(alpha: 0.1)]),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: ZyntraColors.cyan.withValues(alpha: 0.3)),
            ),
            child: Text(s, style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 12, fontWeight: FontWeight.w500)),
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, MediaQuery.of(context).viewInsets.bottom + 16),
      decoration: BoxDecoration(color: ZyntraColors.card, border: Border(top: BorderSide(color: ZyntraColors.border))),
      child: _isRecording ? _buildRecordingBar() : Row(
        children: [
          Expanded(
            child: TextField(
              controller: _ctrl,
              style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
              maxLines: 4, minLines: 1,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _send(),
              decoration: InputDecoration(
                hintText: 'Message Vane...',
                hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 14),
                filled: true,
                fillColor: ZyntraColors.surface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _toggleRecording,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: ZyntraColors.surface, shape: BoxShape.circle, border: Border.all(color: ZyntraColors.border)),
              child: const Icon(Icons.mic_rounded, color: ZyntraColors.white70, size: 20),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _send,
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: ZyntraColors.cyan, blurRadius: 12)],
              ),
              child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecordingBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: ZyntraColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: ZyntraColors.red.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          const SizedBox(width: 8),
          AnimatedBuilder(
            animation: _waveCtrl,
            builder: (_, _) => Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(5, (i) {
                final height = 8.0 + (i % 3 == 0 ? 16.0 : (i % 2 == 0 ? 12.0 : 8.0)) * (0.5 + 0.5 * _waveCtrl.value);
                return Container(
                  width: 3,
                  height: height,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    color: ZyntraColors.red.withValues(alpha: 0.6 + 0.4 * _waveCtrl.value),
                    borderRadius: BorderRadius.circular(2),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(width: 8),
          Text('Recording ${_recordSeconds}s', style: GoogleFonts.inter(color: ZyntraColors.red, fontSize: 13, fontWeight: FontWeight.w500)),
          const Spacer(),
          GestureDetector(
            onTap: _toggleRecording,
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: ZyntraColors.red, shape: BoxShape.circle),
              child: const Icon(Icons.stop_rounded, color: Colors.white, size: 18),
            ),
          ),
          const SizedBox(width: 4),
        ],
      ),
    );
  }
}

class _VaneMessage {
  final String role;
  final String content;
  final DateTime time;
  const _VaneMessage({required this.role, required this.content, required this.time});
}
