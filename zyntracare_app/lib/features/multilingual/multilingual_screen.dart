import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class MultilingualScreen extends StatefulWidget {
  const MultilingualScreen({super.key});
  @override State<MultilingualScreen> createState() => _MultilingualScreenState();
}

class _MultilingualScreenState extends State<MultilingualScreen> {
  final _api = ApiService();
  int _selectedIndex = 0;
  bool _autoTranslate = false;
  int _voiceInputIndex = 0;
  bool _loading = false;

  final _languages = [
    {'name': 'Hindi', 'native': '\u0939\u093F\u0928\u094D\u0926\u0940', 'flag': '\u{1F1EE}\u{1F1F3}'},
    {'name': 'English', 'native': 'English', 'flag': '\u{1F1EC}\u{1F1E7}'},
    {'name': 'Gujarati', 'native': '\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0', 'flag': '\u{1F1EE}\u{1F1F3}'},
    {'name': 'Tamil', 'native': '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD', 'flag': '\u{1F1EE}\u{1F1F3}'},
    {'name': 'Telugu', 'native': '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41', 'flag': '\u{1F1EE}\u{1F1F3}'},
    {'name': 'Bengali', 'native': '\u09AC\u09BE\u0982\u09B2\u09BE', 'flag': '\u{1F1EE}\u{1F1F3}'},
    {'name': 'Marathi', 'native': '\u092E\u0930\u093E\u0920\u0940', 'flag': '\u{1F1EE}\u{1F1F3}'},
    {'name': 'Punjabi', 'native': '\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40', 'flag': '\u{1F1EE}\u{1F1F3}'},
  ];

  final _voiceLanguages = ['Hindi', 'English', 'Gujarati', 'Tamil', 'Telugu'];

  final _sampleTexts = {
    0: {'title': '\u0906\u092A\u0915\u093E \u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948', 'subtitle': '\u0905\u092A\u0928\u0947 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0915\u094B \u091F\u094D\u0930\u0948\u0915 \u0915\u0930\u0947\u0902', 'btn': '\u0921\u0949\u0915\u094D\u091F\u0930 \u0938\u0947 \u092E\u093F\u0932\u0947\u0902', 'label': '\u0939\u093E\u0932 \u0915\u0940 \u0930\u093F\u092A\u094B\u0930\u094D\u091F'},
    1: {'title': 'Welcome', 'subtitle': 'Track your health easily', 'btn': 'Consult Doctor', 'label': 'Latest Reports'},
    2: {'title': '\u0A86\u0AAA\u0AA8\u0AC1\u0A82 \u0AB8\u0ACD\u0AB5\u0ABE\u0A97\u0AA4 \u0A9B\u0AC7', 'subtitle': '\u0A86\u0AAA\u0AA3\u0ABE \u0AB8\u0ACD\u0AB5\u0ABE\u0AB8\u0ACD\u0AA5\u0ACD\u0AAF \u0AA8\u0ACB \u0A9F\u0ACD\u0AB0\u0AC7\u0A95 \u0A95\u0AB0\u0ACB', 'btn': '\u0AA1\u0ACC\u0A95\u0ACD\u0A9F\u0AB0 \u0AA8\u0ACB \u0AB8\u0AB2\u0ABE\u0AB9', 'label': '\u0AA4\u0ABE\u0A9C\u0ABE \u0AB0\u0ABF\u0AAA\u0ACB\u0AB0\u0ACD\u0A9F'},
    3: {'title': '\u0BB5\u0BB0\u0BB5\u0BC7\u0BB1\u0BCD\u0B95\u0BC1\u0BAE\u0BCD', 'subtitle': '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B86\u0BB0\u0BCB\u0B95\u0BCD\u0B95\u0BBF\u0BAF\u0BA4\u0BCD\u0BA4\u0BC8 \u0B8E\u0BB3\u0BBF\u0BA4\u0BBE\u0B95 \u0B95\u0BA3\u0BCD\u0B95\u0BBE\u0BA3\u0BBF\u0B95\u0BCD\u0B95', 'btn': '\u0BAE\u0BB0\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0BB5\u0BB0\u0BC8 \u0B85\u0BB4\u0bc8\u0B95\u0BCD\u0B95', 'label': '\u0B9A\u0BAE\u0BC0\u0BAA \u0B85\u0BB1\u0BBF\u0B95\u0BCD\u0B95\u0BC8'},
    4: {'title': '\u0C38\u0C41\u0C38\u0C4D\u0C35\u0C3E\u0C17\u0C24\u0C02', 'subtitle': '\u0C2E\u0C40 \u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F\u0C3E\u0C28\u0C4D\u0C28\u0C3F \u0C38\u0C41\u0C32\u0C2D\u0C02\u0C17\u0C3E \u0C1F\u0C4D\u0C30\u0C3E\u0C15\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F', 'btn': '\u0C21\u0C3E\u0C15\u0C4D\u0C1F\u0C30\u0C4D \u0C38\u0C32\u0C3E\u0C39', 'label': '\u0C24\u0C3E\u0C1C\u0C3E \u0C28\u0C3F\u0C35\u0C47\u0C26\u0C3F\u0C15'},
    5: {'title': '\u09B8\u09CD\u09AC\u09BE\u0997\u09A4', 'subtitle': '\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09B9\u099C\u09C7 \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995 \u0995\u09B0\u09C1\u09A8', 'btn': '\u09A1\u09BE\u0995\u09CD\u09A4\u09BE\u09B0\u09C7\u09B0 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6', 'label': '\u09B8\u09BE\u09AE\u09CD\u09AA\u09CD\u09B0\u09A4\u09BF\u0995 \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F'},
    6: {'title': '\u0924\u094D\u0935\u0926\u0940\u092F \u0938\u094D\u0935\u093E\u0917\u0924 \u0906\u0939\u0947', 'subtitle': '\u0924\u0941\u092E\u091A\u094D\u092F\u093E \u0906\u0930\u094B\u0917\u094D\u092F\u093E\u0935\u0930 \u0932\u0915\u094D\u0937 \u0920\u0947\u0935\u093E', 'btn': '\u0921\u0949\u0915\u094D\u091F\u0930\u091A\u0940 \u0938\u0932\u094D\u0932\u093E', 'label': '\u0905\u0932\u0940\u0915\u0921\u0940\u0932 \u0905\u0939\u0935\u093E\u0932'},
    7: {'title': '\u0A1C\u0A40 \u0A06\u0A26\u0A3E \u0A39\u0A3F\u0A71', 'subtitle': '\u0A06\u0A2A\u0A23\u0A40 \u0A38\u0A3F\u0A39\u0A24 \u0A26\u0A3E \u0A28\u0A3F\u0A71\u0A06\u0A02 \u0A30\u0A71\u0A16\u0A4B', 'btn': '\u0A21\u0A3E\u0A71\u0A15\u0A1F\u0A30 \u0A28\u0A3E\u0A32 \u0A38\u0A32\u0A3E\u0A39', 'label': '\u0A24\u0A3E\u0A1C\u0A3E \u0A30\u0A3F\u0A2A\u0A4B\u0A30\u0A1F'},
  };

  Future<void> _applyLanguage() async {
    setState(() => _loading = true);
    try {
      await _api.post('/api/user/language', body: {
        'language': _languages[_selectedIndex]['name'],
        'code': _languages[_selectedIndex]['native'],
      });
    } catch (_) {}
    if (mounted) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Language changed to ${_languages[_selectedIndex]['name']}', style: GoogleFonts.inter(color: Colors.white)),
        backgroundColor: ZyntraColors.green, behavior: SnackBarBehavior.floating,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple], begin: Alignment.topLeft, end: Alignment.bottomRight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text('Multilingual', style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('Choose your preferred language', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? Center(child: CircularProgressIndicator(color: ZyntraColors.cyan))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Current Language
                          _buildCurrentLanguage(),
                          const SizedBox(height: 24),
                          Text('Select Language', style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ...List.generate(_languages.length, (i) => _languageTile(i)),
                          const SizedBox(height: 20),
                          // Auto-translate toggle
                          _buildToggleRow(),
                          const SizedBox(height: 16),
                          // Voice input
                          _buildVoiceInput(),
                          const SizedBox(height: 20),
                          // Apply button
                          GestureDetector(
                            onTap: _applyLanguage,
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [BoxShadow(color: ZyntraColors.cyan.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                              ),
                              child: Center(
                                child: Text('Apply', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          // Translation Preview
                          _buildPreview(),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentLanguage() {
    final lang = _languages[_selectedIndex];
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [ZyntraColors.card, ZyntraColors.surface]),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Text(lang['flag'] as String, style: const TextStyle(fontSize: 40)),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Current Language', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              Text(lang['name'] as String, style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
              Text(lang['native'] as String, style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 14)),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _languageTile(int i) {
    final lang = _languages[i];
    final sel = _selectedIndex == i;
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = i),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: sel ? ZyntraColors.cyan.withValues(alpha: 0.08) : ZyntraColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: sel ? ZyntraColors.cyan.withValues(alpha: 0.4) : ZyntraColors.border),
        ),
        child: Row(
          children: [
            Text(lang['flag'] as String, style: const TextStyle(fontSize: 28)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(lang['name'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w500)),
                  Text(lang['native'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
                ],
              ),
            ),
            Radio<int>(
              value: i,
              groupValue: _selectedIndex,
              onChanged: (v) => setState(() => _selectedIndex = v!),
              fillColor: WidgetStateProperty.all(ZyntraColors.cyan),
            ),
          ],
        ),
      ).animate().fadeIn(delay: (i * 40).ms).slideX(begin: 0.05, end: 0),
    );
  }

  Widget _buildToggleRow() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: ZyntraColors.purple.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.translate_rounded, color: ZyntraColors.purple, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Auto-Translate Messages', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
                Text('Translate incoming messages to selected language', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
              ],
            ),
          ),
          Switch(
            value: _autoTranslate,
            onChanged: (v) => setState(() => _autoTranslate = v),
            activeColor: ZyntraColors.cyan,
          ),
        ],
      ),
    );
  }

  Widget _buildVoiceInput() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: ZyntraColors.teal.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.mic_rounded, color: ZyntraColors.teal, size: 22),
              ),
              const SizedBox(width: 14),
              Text('Voice Input Language', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
            ],
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(_voiceLanguages.length, (i) {
                final sel = _voiceInputIndex == i;
                return GestureDetector(
                  onTap: () => setState(() => _voiceInputIndex = i),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: sel ? ZyntraColors.teal.withValues(alpha: 0.15) : ZyntraColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: sel ? ZyntraColors.teal.withValues(alpha: 0.4) : ZyntraColors.border),
                    ),
                    child: Text(_voiceLanguages[i], style: GoogleFonts.inter(
                      color: sel ? ZyntraColors.teal : ZyntraColors.white70,
                      fontSize: 12, fontWeight: FontWeight.w600,
                    )),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPreview() {
    final texts = _sampleTexts[_selectedIndex]!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text('Preview', style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: ZyntraColors.amber.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
              child: Text('${_languages[_selectedIndex]['name']}', style: GoogleFonts.inter(color: ZyntraColors.amber, fontSize: 10, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: ZyntraColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(texts['title'] as String, style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
              const SizedBox(height: 6),
              Text(texts['subtitle'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 13)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [ZyntraColors.cyan, ZyntraColors.purple]),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(texts['btn'] as String, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: ZyntraColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: ZyntraColors.border),
                    ),
                    child: Text(texts['label'] as String, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
                  ),
                ],
              ),
            ],
          ),
        ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.05, end: 0),
      ],
    );
  }
}
