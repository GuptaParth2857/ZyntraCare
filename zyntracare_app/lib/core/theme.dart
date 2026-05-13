import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ZyntraColors {
  static const bg       = Color(0xFF080C14);
  static const surface  = Color(0xFF0F172A);
  static const card     = Color(0xFF131C2E);
  static const border   = Color(0xFF1E2D45);
  static const cyan     = Color(0xFF00D4FF);
  static const purple   = Color(0xFF7B2FF7);
  static const pink     = Color(0xFFEC4899);
  static const green    = Color(0xFF10B981);
  static const amber    = Color(0xFFF59E0B);
  static const red      = Color(0xFFEF4444);
  static const teal     = Color(0xFF14B8A6);
  static const indigo   = Color(0xFF6366F1);
  static const white70  = Color(0xFFB0BEC5);
  static const white40  = Color(0x66FFFFFF);

  static const gradientPrimary = LinearGradient(
    colors: [cyan, purple],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const gradientBg = LinearGradient(
    colors: [Color(0xFF0A0F1E), Color(0xFF0F172A), Color(0xFF0A1628)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const gradientHeader = LinearGradient(
    colors: [Color(0xFF0D1B33), Color(0xFF0A1628), Color(0xFF060D1A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class ZyntraTheme {
  static ThemeData get dark => ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: ZyntraColors.bg,
    primaryColor: ZyntraColors.cyan,
    colorScheme: const ColorScheme.dark(
      primary: ZyntraColors.cyan,
      secondary: ZyntraColors.purple,
      surface: ZyntraColors.surface,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
    useMaterial3: true,
  );
}

class ZyntraText {
  static TextStyle display(double size) => GoogleFonts.poppins(
    fontSize: size, fontWeight: FontWeight.w700, color: Colors.white,
  );
  static TextStyle heading(double size) => GoogleFonts.inter(
    fontSize: size, fontWeight: FontWeight.w600, color: Colors.white,
  );
  static TextStyle body(double size, {Color color = ZyntraColors.white70}) =>
    GoogleFonts.inter(fontSize: size, color: color);
  static TextStyle label(double size) => GoogleFonts.inter(
    fontSize: size, fontWeight: FontWeight.w500, color: ZyntraColors.white70,
  );
}
