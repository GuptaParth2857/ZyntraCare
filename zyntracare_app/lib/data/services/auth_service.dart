import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// AuthService — updated for google_sign_in ^7.x singleton API
class AuthService {
  static const String _webClientId =
      '215804605539-58ro90ld1l2shpck20asu3pqpqf9cuej.apps.googleusercontent.com';

  GoogleSignInAccount? _currentUser;
  GoogleSignInAccount? get currentUser => _currentUser;

  /// Call once at app startup before using any other methods.
  Future<void> init() async {
    await GoogleSignIn.instance.initialize(
      serverClientId: _webClientId,
    );
    try {
      // v7: attemptLightweightAuthentication replaces signInSilently
      final account = await GoogleSignIn.instance.attemptLightweightAuthentication();
      _currentUser = account;
    } catch (e) {
      // Silent sign-in failed — user not previously signed in, that's fine
    }
  }

  Future<GoogleSignInAccount?> signInWithGoogle() async {
    try {
      // v7: authenticate() replaces signIn()
      final account = await GoogleSignIn.instance.authenticate();
      _currentUser = account;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_logged_in', true);
      await prefs.setString('user_email', account.email);
      await prefs.setString('user_name', account.displayName ?? 'User');
      await prefs.setString('user_photo', account.photoUrl ?? '');

      return account;
    } catch (e) {
      return null;
    }
  }

  Future<void> signOut() async {
    try {
      await GoogleSignIn.instance.signOut();
      _currentUser = null;
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    } catch (e) {
      // ignore
    }
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('is_logged_in') ?? false;
  }
}
