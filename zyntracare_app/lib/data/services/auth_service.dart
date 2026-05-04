import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  // Web Client ID used as serverClientId to allow backend verification
  static const String _webClientId =
      '215804605539-58ro90ld1l2shpck20asu3pqpqf9cuej.apps.googleusercontent.com';

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId: _webClientId,
    scopes: [
      'email',
      'profile',
    ],
  );

  GoogleSignInAccount? _currentUser;
  GoogleSignInAccount? get currentUser => _currentUser;

  Future<void> init() async {
    _googleSignIn.onCurrentUserChanged.listen((GoogleSignInAccount? account) {
      _currentUser = account;
    });
    try {
      await _googleSignIn.signInSilently();
    } catch (error) {
      print('Silent sign in error: $error');
    }
  }

  Future<GoogleSignInAccount?> signInWithGoogle() async {
    try {
      final account = await _googleSignIn.signIn();
      if (account != null) {
        _currentUser = account;
        
        // Save login state
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('is_logged_in', true);
        await prefs.setString('user_email', account.email);
        await prefs.setString('user_name', account.displayName ?? 'User');
        await prefs.setString('user_photo', account.photoUrl ?? '');
        
        // In a real app, send account.authentication.idToken to Next.js backend
        // final auth = await account.authentication;
        // print('ID Token: ${auth.idToken}');
      }
      return account;
    } catch (error) {
      print('Sign in error: $error');
      return null;
    }
  }

  Future<void> signOut() async {
    try {
      await _googleSignIn.disconnect();
      _currentUser = null;
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    } catch (error) {
      print('Sign out error: $error');
    }
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('is_logged_in') ?? false;
  }
}
