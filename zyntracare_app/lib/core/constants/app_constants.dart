import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFF0F172A);
  static const Color primaryLight = Color(0xFF1E293B);
  static const Color primaryDark = Color(0xFF020617);
  
  // Accent Colors
  static const Color accent = Color(0xFF3B82F6);
  static const Color accentLight = Color(0xFF60A5FA);
  static const Color accentDark = Color(0xFF2563EB);
  
  // Status Colors
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF06B6D4);
  
  // Background Colors
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF1F5F9);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFF94A3B8);
  static const Color textLight = Color(0xFFFFFFFF);
  
  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFF22C55E), Color(0xFF3B82F6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Hospital Status Colors
  static const Color bedAvailable = Color(0xFF22C55E);
  static const Color bedOccupied = Color(0xFFEF4444);
  static const Color bedIcu = Color(0xFF3B82F6);
  
  // Emergency Colors
  static const Color emergencyRed = Color(0xFFDC2626);
  static const Color emergencyAmbulance = Color(0xFFF97316);
}

class AppStrings {
  static const String appName = 'ZyntraCare';
  static const String tagline = 'Your Health, Our Priority';
  
  // Navigation
  static const String home = 'Home';
  static const String hospitals = 'Hospitals';
  static const String doctors = 'Doctors';
  static const String emergency = 'Emergency';
  static const String appointments = 'Appointments';
  static const String healthRecords = 'Health Records';
  static const String medicineScanner = 'Medicine Scanner';
  static const String ambulance = 'Ambulance';
  static const String bloodDonors = 'Blood Donors';
  static const String pharmacies = 'Pharmacies';
  static const String labs = 'Labs';
  static const String healthTracker = 'Health Tracker';
  static const String aiChat = 'AI Health Coach';
  static const String profile = 'Profile';
  static const String settings = 'Settings';
  
  // Actions
  static const String bookNow = 'Book Now';
  static const String callNow = 'Call Now';
  static const String getDirections = 'Get Directions';
  static const String viewAll = 'View All';
  static const String search = 'Search';
  static const String filter = 'Filter';
  static const String sort = 'Sort';
  
  // Messages
  static const String noDataFound = 'No data found';
  static const String loadingData = 'Loading data...';
  static const String errorOccurred = 'An error occurred';
  static const String retry = 'Retry';
  static const String success = 'Success';
  static const String cancel = 'Cancel';
  static const String confirm = 'Confirm';
  static const String save = 'Save';
  static const String delete = 'Delete';
  static const String edit = 'Edit';
}

class AppConstants {
  static const String apiBaseUrl = 'https://api.zyntracare.com';
  static const int apiTimeout = 30000;
  
  // Pagination
  static const int defaultPageSize = 20;
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 400);
  static const Duration longAnimation = Duration(milliseconds: 600);
  
  // Border Radius
  static const double radiusSmall = 8.0;
  static const double radiusMedium = 12.0;
  static const double radiusLarge = 16.0;
  static const double radiusXLarge = 24.0;
  
  // Spacing
  static const double spacingXSmall = 4.0;
  static const double spacingSmall = 8.0;
  static const double spacingMedium = 16.0;
  static const double spacingLarge = 24.0;
  static const double spacingXLarge = 32.0;
}