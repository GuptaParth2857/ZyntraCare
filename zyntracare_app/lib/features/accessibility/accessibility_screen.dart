import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme.dart';

class AccessibilityScreen extends StatefulWidget {
  const AccessibilityScreen({super.key});
  @override State<AccessibilityScreen> createState() => _AccessibilityScreenState();
}

class _AccessibilityScreenState extends State<AccessibilityScreen> {
  double _fontSize = 1.0;
  bool _highContrast = false;
  bool _reduceAnimations = false;
  bool _screenReader = false;
  String _colorBlindMode = 'None';
  String _language = 'English';

  final _fontSizeLabels = ['Small', 'Medium', 'Large', 'Extra Large'];
  final _fontSizeValues = [0.8, 1.0, 1.3, 1.6];

  final _colorBlindOptions = ['None', 'Protanopia', 'Deuteranopia', 'Tritanopia', 'Achromatopsia'];
  final _languages = ['Hindi', 'English', 'Gujarati', 'Tamil', 'Telugu', 'Bengali'];

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _fontSize = prefs.getDouble('fontSize') ?? 1.0;
      _highContrast = prefs.getBool('highContrast') ?? false;
      _reduceAnimations = prefs.getBool('reduceAnimations') ?? false;
      _screenReader = prefs.getBool('screenReader') ?? false;
      _colorBlindMode = prefs.getString('colorBlindMode') ?? 'None';
      _language = prefs.getString('language') ?? 'English';
    });
  }

  Future<void> _savePreference(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is double) await prefs.setDouble(key, value);
    if (value is bool) await prefs.setBool(key, value);
    if (value is String) await prefs.setString(key, value);
  }

  Color _previewTextColor() {
    if (_highContrast) return Colors.white;
    if (_colorBlindMode == 'Protanopia') return ZyntraColors.cyan;
    if (_colorBlindMode == 'Deuteranopia') return ZyntraColors.purple;
    if (_colorBlindMode == 'Tritanopia') return ZyntraColors.pink;
    if (_colorBlindMode == 'Achromatopsia') return Colors.white;
    return ZyntraColors.white70;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 28),
              _buildFontSizeSection(),
              const SizedBox(height: 20),
              _buildToggleSection('High Contrast Mode', 'Increases contrast for better visibility', _highContrast, (v) {
                setState(() => _highContrast = v);
                _savePreference('highContrast', v);
              }),
              const SizedBox(height: 14),
              _buildToggleSection('Reduce Animations', 'Minimizes motion effects', _reduceAnimations, (v) {
                setState(() => _reduceAnimations = v);
                _savePreference('reduceAnimations', v);
              }),
              const SizedBox(height: 14),
              _buildToggleSection('Screen Reader', 'Enable screen reader support', _screenReader, (v) {
                setState(() => _screenReader = v);
                _savePreference('screenReader', v);
              }),
              const SizedBox(height: 20),
              _buildColorBlindSection(),
              const SizedBox(height: 20),
              _buildLanguageSection(),
              const SizedBox(height: 24),
              _buildPreviewSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
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
        Text('Accessibility', style: GoogleFonts.poppins(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
      ],
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.05, end: 0);
  }

  Widget _buildFontSizeSection() {
    final idx = _fontSizeValues.indexOf(_fontSize);
    final currentLabel = idx >= 0 ? _fontSizeLabels[idx] : 'Medium';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.text_fields_rounded, color: ZyntraColors.cyan, size: 22),
              const SizedBox(width: 10),
              Text('Font Size', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text(currentLabel, style: GoogleFonts.inter(color: ZyntraColors.cyan, fontSize: 13, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.format_size, color: ZyntraColors.white40, size: 18),
              Expanded(
                child: Slider(
                  value: _fontSize,
                  min: 0.8,
                  max: 1.6,
                  divisions: 3,
                  activeColor: ZyntraColors.cyan,
                  inactiveColor: ZyntraColors.border,
                  onChanged: (v) {
                    setState(() => _fontSize = v);
                    _savePreference('fontSize', v);
                  },
                ),
              ),
              const Icon(Icons.format_size, color: ZyntraColors.white70, size: 26),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: _fontSizeLabels.map((l) => Text(l, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10))).toList(),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  Widget _buildToggleSection(String title, String subtitle, bool value, ValueChanged<bool> onChanged) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(subtitle, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 12)),
              ],
            ),
          ),
          Transform.scale(
            scale: 0.8,
            child: Switch(
              value: value,
              onChanged: onChanged,
              activeColor: ZyntraColors.cyan,
              activeTrackColor: ZyntraColors.cyan.withValues(alpha: 0.3),
              inactiveTrackColor: ZyntraColors.border,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildColorBlindSection() {
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
              const Icon(Icons.palette_rounded, color: ZyntraColors.purple, size: 22),
              const SizedBox(width: 10),
              Text('Color Blind Mode', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _colorBlindMode,
                isExpanded: true,
                dropdownColor: ZyntraColors.surface,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                items: _colorBlindOptions.map((opt) => DropdownMenuItem(
                  value: opt,
                  child: Text(opt, style: GoogleFonts.inter(color: Colors.white, fontSize: 14)),
                )).toList(),
                onChanged: (v) {
                  if (v == null) return;
                  setState(() => _colorBlindMode = v);
                  _savePreference('colorBlindMode', v);
                },
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildLanguageSection() {
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
              const Icon(Icons.language_rounded, color: ZyntraColors.teal, size: 22),
              const SizedBox(width: 10),
              Text('Language', style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZyntraColors.border),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _language,
                isExpanded: true,
                dropdownColor: ZyntraColors.surface,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                items: _languages.map((l) => DropdownMenuItem(
                  value: l,
                  child: Text(l, style: GoogleFonts.inter(color: Colors.white, fontSize: 14)),
                )).toList(),
                onChanged: (v) {
                  if (v == null) return;
                  setState(() => _language = v);
                  _savePreference('language', v);
                },
              ),
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: _languages.map((l) => GestureDetector(
              onTap: () {
                setState(() => _language = l);
                _savePreference('language', l);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: _language == l ? ZyntraColors.cyan.withValues(alpha: 0.15) : ZyntraColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _language == l ? ZyntraColors.cyan : ZyntraColors.border),
                ),
                child: Text(l, style: GoogleFonts.inter(
                  color: _language == l ? ZyntraColors.cyan : ZyntraColors.white70,
                  fontSize: 12, fontWeight: FontWeight.w500,
                )),
              ),
            )).toList(),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildPreviewSection() {
    final previewBg = _highContrast ? ZyntraColors.surface : ZyntraColors.card;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: previewBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _highContrast ? ZyntraColors.cyan : ZyntraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.preview_rounded, color: _highContrast ? ZyntraColors.cyan : ZyntraColors.white70, size: 20),
              const SizedBox(width: 8),
              Text('Preview', style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            _language == 'Hindi' ? 'नमस्ते, ज़िंदगी के साथियों!' :
            _language == 'Gujarati' ? 'નમસ્તે, જીવનના સાથીઓ!' :
            _language == 'Tamil' ? 'வணக்கம், வாழ்க்கைத் தோழர்களே!' :
            _language == 'Telugu' ? 'నమస్కారం, జీవిత సహచరులారా!' :
            _language == 'Bengali' ? 'নমস্কার, জীবনের সঙ্গীরা!' :
            'Hello, Health Champions!',
            style: GoogleFonts.inter(
              color: _previewTextColor(),
              fontSize: 20 * _fontSize,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _language == 'Hindi' ? 'आपका स्वास्थ्य हमारी प्राथमिकता है। नियमित जांच कराएं और स्वस्थ रहें।' :
            _language == 'Gujarati' ? 'તમારું સ્વાસ્થ્ય અમારી પ્રાથમિકતા છે. નિયમિત તપાસ કરાવો અને સ્વસ્થ રહો.' :
            _language == 'Tamil' ? 'உங்கள் ஆரோக்கியம் எங்கள் முன்னுரிமை. வழக்கமான பரிசோதனை செய்து ஆரோக்கியமாக இருங்கள்.' :
            _language == 'Telugu' ? 'మీ ఆరోగ్యం మా ప్రాధాన్యత. క్రమం తప్పకుండా పరీక్షలు చేయించుకోండి.' :
            _language == 'Bengali' ? 'আপনার স্বাস্থ্যই আমাদের অগ্রাধিকার। নিয়মিত পরীক্ষা করান এবং সুস্থ থাকুন।' :
            'Your health is our priority. Get regular check-ups and stay healthy.',
            style: GoogleFonts.inter(
              color: _previewTextColor().withValues(alpha: _highContrast ? 1.0 : 0.8),
              fontSize: 14 * _fontSize,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'This is a sample preview of how text will appear with your current accessibility settings.',
            style: GoogleFonts.inter(
              color: _previewTextColor().withValues(alpha: _highContrast ? 0.9 : 0.6),
              fontSize: 11 * _fontSize,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms, duration: 300.ms);
  }
}
