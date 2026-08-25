import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'core/theme.dart';
import 'core/splash_screen.dart';
import 'providers/hospital_provider.dart';
import 'providers/doctor_provider.dart';
import 'providers/pharmacy_provider.dart';
import 'providers/lab_provider.dart';
import 'providers/emergency_provider.dart';
import 'providers/health_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Colors.transparent,
  ));
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  runApp(const ZyntraCareApp());
}

class ZyntraCareApp extends StatelessWidget {
  const ZyntraCareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => HospitalProvider()),
        ChangeNotifierProvider(create: (_) => DoctorProvider()),
        ChangeNotifierProvider(create: (_) => PharmacyProvider()),
        ChangeNotifierProvider(create: (_) => LabProvider()),
        ChangeNotifierProvider(create: (_) => EmergencyProvider()),
        ChangeNotifierProvider(create: (_) => HealthProvider()),
      ],
      child: MaterialApp(
        title: 'ZyntraCare',
        debugShowCheckedModeBanner: false,
        theme: ZyntraTheme.dark,
        home: const SplashScreen(),
      ),
    );
  }
}
