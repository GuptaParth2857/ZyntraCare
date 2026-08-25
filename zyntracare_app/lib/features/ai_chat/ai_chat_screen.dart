import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/api_service.dart';

class AIChatScreen extends StatefulWidget {
  const AIChatScreen({super.key});
  @override State<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final _ctrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _messages = <_ChatMessage>[
    _ChatMessage(role: 'assistant', content: "Hi! I'm your AI Health Assistant. How can I help you today?"),
  ];
  bool _typing = false;

  @override
  void dispose() {
    _ctrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final txt = _ctrl.text.trim();
    if (txt.isEmpty) return;
    _ctrl.clear();
    setState(() {
      _messages.add(_ChatMessage(role: 'user', content: txt));
      _typing = true;
    });
    _scrollDown();
    final reply = await apiService.aiChat(txt);
    if (mounted) {
      setState(() {
        _messages.add(_ChatMessage(role: 'assistant', content: reply));
        _typing = false;
      });
      _scrollDown();
    }
  }

  void _scrollDown() {
    Future.delayed(const Duration(milliseconds: 150), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header with gradient
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0D1B33), Color(0xFF0A1628)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: ZyntraColors.card,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: ZyntraColors.border),
                      ),
                      child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [ZyntraColors.pink, ZyntraColors.purple]),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('AI Health Assistant', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                        Text('Online \u2022 Powered by Zyntra', style: GoogleFonts.inter(color: ZyntraColors.green, fontSize: 11)),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () => setState(() {
                      _messages.clear();
                      _messages.add(_ChatMessage(role: 'assistant', content: "Hi! I'm your AI Health Assistant. How can I help you today?"));
                    }),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: ZyntraColors.card,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: ZyntraColors.border),
                      ),
                      child: const Icon(Icons.refresh_rounded, color: ZyntraColors.white70, size: 20),
                    ),
                  ),
                ],
              ),
            ),

            // Messages
            Expanded(
              child: _messages.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      controller: _scrollCtrl,
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
                      itemCount: _messages.length + (_typing ? 1 : 0),
                      itemBuilder: (_, i) {
                        if (i == _messages.length) return _buildTypingIndicator();
                        return _buildMessageBubble(_messages[i], i);
                      },
                    ),
            ),

            // Input bar
            Container(
              padding: EdgeInsets.fromLTRB(16, 12, 16, MediaQuery.of(context).viewInsets.bottom + 16),
              decoration: BoxDecoration(
                color: ZyntraColors.card,
                border: Border(top: BorderSide(color: ZyntraColors.border)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                      maxLines: 4,
                      minLines: 1,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _send(),
                      decoration: InputDecoration(
                        hintText: 'Ask about your health...',
                        hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 14),
                        filled: true,
                        fillColor: ZyntraColors.surface,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: _send,
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(colors: [ZyntraColors.pink, ZyntraColors.purple]),
                        shape: BoxShape.circle,
                        boxShadow: [BoxShadow(color: ZyntraColors.pink, blurRadius: 12)],
                      ),
                      child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [ZyntraColors.pink, ZyntraColors.purple]),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: ZyntraColors.pink.withValues(alpha: 0.3), blurRadius: 30)],
            ),
            child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 48),
          ),
          const SizedBox(height: 24),
          Text('AI Health Assistant', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text('Ask me anything about your health, symptoms, or get personalized health advice.',
              style: GoogleFonts.inter(color: ZyntraColors.white70),
              textAlign: TextAlign.center),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(_ChatMessage msg, int i) {
    final isUser = msg.role == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        decoration: BoxDecoration(
          gradient: isUser
              ? const LinearGradient(colors: [ZyntraColors.pink, ZyntraColors.purple])
              : null,
          color: isUser ? null : ZyntraColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(isUser ? 20 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 20),
          ),
          border: isUser ? null : Border.all(color: ZyntraColors.border),
          boxShadow: isUser
              ? [BoxShadow(color: ZyntraColors.pink.withValues(alpha: 0.2), blurRadius: 12, offset: const Offset(0, 4))]
              : null,
        ),
        child: Text(msg.content, style: GoogleFonts.inter(color: Colors.white, fontSize: 14, height: 1.4)),
      ),
    ).animate().fadeIn(delay: (i * 50).ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: ZyntraColors.surface,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(20),
          ),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _dot(0), const SizedBox(width: 4),
            _dot(1), const SizedBox(width: 4),
            _dot(2),
          ],
        ),
      ),
    );
  }

  Widget _dot(int i) {
    return Container(
      width: 8, height: 8,
      decoration: BoxDecoration(
        color: ZyntraColors.pink,
        shape: BoxShape.circle,
      ),
    ).animate(onPlay: (ctrl) => ctrl.repeat()).scaleXY(
      delay: (i * 200).ms,
      duration: 600.ms,
      begin: 0.5,
      end: 1,
      curve: Curves.easeInOut,
    );
  }
}

class _ChatMessage {
  final String role;
  final String content;
  const _ChatMessage({required this.role, required this.content});
}
