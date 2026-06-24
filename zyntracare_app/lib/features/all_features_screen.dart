import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme.dart';
import '../features/hospitals/hospitals_screen.dart';
import '../features/doctors/doctors_screen.dart';
import '../features/blood_donors/blood_donors_screen.dart';
import '../features/pharmacies/pharmacies_screen.dart';
import '../features/labs/labs_screen.dart';
import '../features/ai_chat/ai_chat_screen.dart';
import '../features/ai_vision/ai_vision_screen.dart';
import '../features/ambulance/ambulance_screen.dart';
import '../features/bed_availability/bed_availability_screen.dart';
import '../features/blockchain/blockchain_screen.dart';
import '../features/blood_requests/blood_requests_screen.dart';
import '../features/camps/camps_screen.dart';
import '../features/dna_visuals/dna_visuals_screen.dart';
import '../features/emergency/emergency_screen.dart';
import '../features/health_records/health_records_screen.dart';
import '../features/health_tracker/health_tracker_screen.dart';
import '../features/maps/maps_screen.dart';
import '../features/medicine_scanner/medicine_scanner_screen.dart';
import '../features/specialists/specialists_screen.dart';
import '../features/telehealth/telehealth_screen.dart';
import '../features/video_consult/video_consult_screen.dart';
import '../features/wearables/wearables_screen.dart';
import '../features/admin/admin_screen.dart';
import '../features/auth/signin_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/auth/forgot_password_screen.dart';
import '../features/auth/reset_password_screen.dart';
import '../features/auth/verify_email_screen.dart';
import '../features/tools/bmi_screen.dart';
import '../features/tools/water_intake_screen.dart';
import '../features/tools/emergency_card_screen.dart';
import '../features/blog/blog_list_screen.dart';
import '../features/blog/health_article_screen.dart';
import '../features/feed/feed_screen.dart';
import '../features/community/community_screen.dart';
import '../features/pets/pets_screen.dart';
import '../features/network/mesh_screen.dart';
import '../features/network/drone_screen.dart';
import '../features/network/offline_screen.dart';
import '../features/blood_requests/blood_campaign_screen.dart';
import '../features/corporate/corporate_wellness_screen.dart';
import '../features/micro_insurance/micro_insurance_screen.dart';
import '../features/data_marketplace/data_marketplace_screen.dart';
import '../features/blockchain_detail/blockchain_detail_screen.dart';
import '../features/womens_health/womens_health_screen.dart';
import '../features/family_care/family_care_screen.dart';
import '../features/dementia/dementia_voice_screen.dart';
import '../features/eye_control/eye_control_screen.dart';
import '../features/scribe/clinical_scribe_screen.dart';
import '../features/admin/analytics_screen.dart';
import '../features/about/about_screen.dart';
import '../features/accessibility/accessibility_screen.dart';
import '../features/bluetooth_hrm/bluetooth_hrm_screen.dart';
import '../features/clinical_ai/clinical_ai_screen.dart';
import '../features/contact/contact_screen.dart';
import '../features/digital_twin/digital_twin_screen.dart';
import '../features/edge_ai_symptoms/edge_ai_symptoms_screen.dart';
import '../features/edge_ai_vision/edge_ai_vision_screen.dart';
import '../features/epidemic_radar/epidemic_radar_screen.dart';
import '../features/feedback/feedback_screen.dart';
import '../features/first_aid/first_aid_screen.dart';
import '../features/health_id/health_id_screen.dart';
import '../features/health_risk/health_risk_screen.dart';
import '../features/health_wallet/health_wallet_screen.dart';
import '../features/hospital_dashboard/hospital_dashboard_screen.dart';
import '../features/hospital_inventory/hospital_inventory_screen.dart';
import '../features/hospital_partner/hospital_partner_screen.dart';
import '../features/lab_booking/lab_booking_screen.dart';
import '../features/legal/legal_screen.dart';
import '../features/legal/privacy_policy_screen.dart';
import '../features/legal/terms_screen.dart';
import '../features/medical_id/medical_id_screen.dart';
import '../features/medications/medications_screen.dart';
import '../features/medicine_reminder/medicine_reminder_screen.dart';
import '../features/medicine_verify/medicine_verify_screen.dart';
import '../features/multilingual/multilingual_screen.dart';
import '../features/organ_matching/organ_matching_screen.dart';
import '../features/outbreak_radar/outbreak_radar_screen.dart';
import '../features/pdf_prescription/pdf_prescription_screen.dart';
import '../features/pharmacy_store/pharmacy_store_screen.dart';
import '../features/pharmacy_partner/pharmacy_partner_screen.dart';
import '../features/predictive_analytics/predictive_analytics_screen.dart';
import '../features/rewards/rewards_screen.dart';
import '../features/schemes/schemes_screen.dart';
import '../features/setup_admin/setup_admin_screen.dart';
import '../features/sms_emergency/sms_emergency_screen.dart';
import '../features/sponsor/sponsor_screen.dart';
import '../features/subscription/subscription_screen.dart';
import '../features/symptom_checker/symptom_checker_screen.dart';
import '../features/symptoms/symptoms_screen.dart';
import '../features/tools_hub/tools_hub_screen.dart';
import '../features/vane_chat/vane_chat_screen.dart';
import '../features/voice_emergency/voice_emergency_screen.dart';
import '../features/wellness/wellness_screen.dart';
import '../features/doctor_register/doctor_register_screen.dart';
import '../features/chain_reaction/chain_reaction_screen.dart';
import '../features/admin/god_mode_screen.dart';
import '../features/admin/users_screen.dart';

class AllFeaturesScreen extends StatelessWidget {
  const AllFeaturesScreen({super.key});

  static final features = <_FeatureItem>[
    _FeatureItem('Hospitals', Icons.local_hospital_rounded, ZyntraColors.cyan, HospitalsScreen()),
    _FeatureItem('Doctors', Icons.person_rounded, ZyntraColors.green, DoctorsScreen()),
    _FeatureItem('Specialists', Icons.medical_services_rounded, ZyntraColors.indigo, SpecialistsScreen()),
    _FeatureItem('Pharmacy', Icons.medication_rounded, ZyntraColors.purple, PharmaciesScreen()),
    _FeatureItem('Labs', Icons.science_rounded, ZyntraColors.teal, LabsScreen()),
    _FeatureItem('Emergency', Icons.warning_rounded, ZyntraColors.red, EmergencyScreen()),
    _FeatureItem('Ambulance', Icons.airport_shuttle_rounded, ZyntraColors.amber, AmbulanceScreen()),
    _FeatureItem('Bed Availability', Icons.hotel_rounded, ZyntraColors.pink, BedAvailabilityScreen()),
    _FeatureItem('Blood Donors', Icons.bloodtype_rounded, ZyntraColors.red, BloodDonorsScreen()),
    _FeatureItem('Blood Requests', Icons.water_drop_rounded, ZyntraColors.red, BloodRequestsScreen()),
    _FeatureItem('Health Tracker', Icons.monitor_heart_rounded, ZyntraColors.green, HealthTrackerScreen()),
    _FeatureItem('Health Records', Icons.folder_rounded, ZyntraColors.cyan, HealthRecordsScreen()),
    _FeatureItem('AI Chat', Icons.smart_toy_rounded, ZyntraColors.pink, AIChatScreen()),
    _FeatureItem('AI Vision', Icons.visibility_rounded, ZyntraColors.purple, AIVisionScreen()),
    _FeatureItem('Video Consult', Icons.video_call_rounded, ZyntraColors.indigo, VideoConsultScreen()),
    _FeatureItem('Telehealth', Icons.telegram_rounded, ZyntraColors.teal, TelehealthScreen()),
    _FeatureItem('Medicine Scanner', Icons.document_scanner_rounded, ZyntraColors.amber, MedicineScannerScreen()),
    _FeatureItem('Health Camps', Icons.campaign_rounded, ZyntraColors.green, CampsScreen()),
    _FeatureItem('Blockchain', Icons.link_rounded, ZyntraColors.cyan, BlockchainScreen()),
    _FeatureItem('3D Visuals', Icons.rotate_left_rounded, ZyntraColors.purple, DnaVisualsScreen()),
    _FeatureItem('Wearables', Icons.watch_rounded, ZyntraColors.teal, WearablesScreen()),
    _FeatureItem('Maps', Icons.map_rounded, ZyntraColors.green, MapsScreen()),
    _FeatureItem('Admin Panel', Icons.admin_panel_settings_rounded, ZyntraColors.amber, AdminScreen()),
    _FeatureItem('Sign In', Icons.login_rounded, ZyntraColors.cyan, SignInScreen()),
    _FeatureItem('Register', Icons.person_add_rounded, ZyntraColors.green, RegisterScreen()),
    _FeatureItem('Forgot Password', Icons.lock_reset_rounded, ZyntraColors.amber, ForgotPasswordScreen()),
    _FeatureItem('Reset Password', Icons.password_rounded, ZyntraColors.pink, ResetPasswordScreen(token: '')),
    _FeatureItem('Verify Email', Icons.email_rounded, ZyntraColors.teal, VerifyEmailScreen(email: '')),
    _FeatureItem('BMI Calculator', Icons.fitness_center_rounded, ZyntraColors.indigo, BmiScreen()),
    _FeatureItem('Water Intake', Icons.water_drop_rounded, ZyntraColors.cyan, WaterIntakeScreen()),
    _FeatureItem('Emergency Card', Icons.credit_card_rounded, ZyntraColors.red, EmergencyCardScreen()),
    _FeatureItem('Blog', Icons.article_rounded, ZyntraColors.purple, BlogListScreen()),
    _FeatureItem('Health Articles', Icons.health_and_safety_rounded, ZyntraColors.teal, HealthArticleScreen()),
    _FeatureItem('Community Feed', Icons.feed_rounded, ZyntraColors.green, FeedScreen()),
    _FeatureItem('Health Communities', Icons.groups_rounded, ZyntraColors.cyan, CommunityScreen()),
    _FeatureItem('Pets', Icons.pets_rounded, ZyntraColors.amber, PetsScreen()),
    _FeatureItem('Mesh Network', Icons.hub_rounded, ZyntraColors.purple, MeshScreen()),
    _FeatureItem('Drone Network', Icons.flight_rounded, ZyntraColors.teal, DroneScreen()),
    _FeatureItem('Offline Mode', Icons.wifi_off_rounded, ZyntraColors.red, OfflineScreen()),
    _FeatureItem('Blood Campaigns', Icons.campaign_rounded, ZyntraColors.red, BloodCampaignScreen()),
    _FeatureItem('Corporate Wellness', Icons.business_rounded, ZyntraColors.indigo, CorporateWellnessScreen()),
    _FeatureItem('Micro Insurance', Icons.verified_rounded, ZyntraColors.green, MicroInsuranceScreen()),
    _FeatureItem('Data Marketplace', Icons.store_rounded, ZyntraColors.amber, DataMarketplaceScreen()),
    _FeatureItem("Women's Health", Icons.female_rounded, ZyntraColors.pink, WomensHealthScreen()),
    _FeatureItem('Family Care', Icons.family_restroom_rounded, ZyntraColors.purple, FamilyCareScreen()),
    _FeatureItem('Dementia Voice', Icons.record_voice_over_rounded, ZyntraColors.indigo, DementiaVoiceScreen()),
    _FeatureItem('Eye Control', Icons.visibility_rounded, ZyntraColors.teal, EyeControlScreen()),
    _FeatureItem('Clinical Scribe', Icons.edit_note_rounded, ZyntraColors.amber, ClinicalScribeScreen()),
    _FeatureItem('Analytics', Icons.analytics_rounded, ZyntraColors.cyan, AnalyticsScreen()),
    _FeatureItem('Blockchain Detail', Icons.link_rounded, ZyntraColors.cyan, BlockchainDetailScreen(record: {})),
    _FeatureItem('About', Icons.info_rounded, ZyntraColors.cyan, AboutScreen()),
    _FeatureItem('Accessibility', Icons.accessibility_new_rounded, ZyntraColors.purple, AccessibilityScreen()),
    _FeatureItem('Bluetooth HRM', Icons.bluetooth_rounded, ZyntraColors.teal, BluetoothHrmScreen()),
    _FeatureItem('Clinical AI', Icons.psychology_rounded, ZyntraColors.indigo, ClinicalAiScreen()),
    _FeatureItem('Contact', Icons.contact_mail_rounded, ZyntraColors.green, ContactScreen()),
    _FeatureItem('Digital Twin', Icons.face_rounded, ZyntraColors.cyan, DigitalTwinScreen()),
    _FeatureItem('Edge AI Symptoms', Icons.search_rounded, ZyntraColors.amber, EdgeAiSymptomsScreen()),
    _FeatureItem('Edge AI Vision', Icons.camera_alt_rounded, ZyntraColors.purple, EdgeAiVisionScreen()),
    _FeatureItem('Epidemic Radar', Icons.radar_rounded, ZyntraColors.red, EpidemicRadarScreen()),
    _FeatureItem('Feedback', Icons.rate_review_rounded, ZyntraColors.amber, FeedbackScreen()),
    _FeatureItem('First Aid', Icons.medical_services_rounded, ZyntraColors.green, FirstAidScreen()),
    _FeatureItem('Health ID', Icons.credit_card_rounded, ZyntraColors.cyan, HealthIdScreen()),
    _FeatureItem('Health Risk', Icons.assessment_rounded, ZyntraColors.indigo, HealthRiskScreen()),
    _FeatureItem('Health Wallet', Icons.account_balance_wallet_rounded, ZyntraColors.teal, HealthWalletScreen()),
    _FeatureItem('Hospital Dashboard', Icons.dashboard_rounded, ZyntraColors.purple, HospitalDashboardScreen()),
    _FeatureItem('Hospital Inventory', Icons.inventory_rounded, ZyntraColors.amber, HospitalInventoryScreen()),
    _FeatureItem('Hospital Partner', Icons.handshake_rounded, ZyntraColors.green, HospitalPartnerScreen()),
    _FeatureItem('Lab Booking', Icons.science_rounded, ZyntraColors.cyan, LabBookingScreen()),
    _FeatureItem('Legal', Icons.gavel_rounded, ZyntraColors.teal, LegalScreen()),
    _FeatureItem('Privacy Policy', Icons.privacy_tip_rounded, ZyntraColors.indigo, PrivacyPolicyScreen()),
    _FeatureItem('Terms of Service', Icons.description_rounded, ZyntraColors.purple, TermsScreen()),
    _FeatureItem('Medical ID', Icons.medical_services_rounded, ZyntraColors.red, MedicalIdScreen()),
    _FeatureItem('Medications', Icons.medication_rounded, ZyntraColors.green, MedicationsScreen()),
    _FeatureItem('Medicine Reminder', Icons.alarm_rounded, ZyntraColors.amber, MedicineReminderScreen()),
    _FeatureItem('Medicine Verify', Icons.verified_rounded, ZyntraColors.cyan, MedicineVerifyScreen()),
    _FeatureItem('Multilingual', Icons.language_rounded, ZyntraColors.purple, MultilingualScreen()),
    _FeatureItem('Organ Matching', Icons.favorite_rounded, ZyntraColors.red, OrganMatchingScreen()),
    _FeatureItem('Outbreak Radar', Icons.crisis_alert_rounded, ZyntraColors.red, OutbreakRadarScreen()),
    _FeatureItem('PDF Prescription', Icons.picture_as_pdf_rounded, ZyntraColors.teal, PdfPrescriptionScreen()),
    _FeatureItem('Pharmacy Store', Icons.shopping_cart_rounded, ZyntraColors.green, PharmacyStoreScreen()),
    _FeatureItem('Pharmacy Partner', Icons.storefront_rounded, ZyntraColors.amber, PharmacyPartnerScreen()),
    _FeatureItem('Predictive Analytics', Icons.trending_up_rounded, ZyntraColors.cyan, PredictiveAnalyticsScreen()),
    _FeatureItem('Rewards', Icons.redeem_rounded, ZyntraColors.amber, RewardsScreen()),
    _FeatureItem('Govt Schemes', Icons.account_balance_rounded, ZyntraColors.teal, SchemesScreen()),
    _FeatureItem('Setup Admin', Icons.admin_panel_settings_rounded, ZyntraColors.purple, SetupAdminScreen()),
    _FeatureItem('SMS Emergency', Icons.sms_rounded, ZyntraColors.red, SmsEmergencyScreen()),
    _FeatureItem('Sponsors', Icons.handshake_rounded, ZyntraColors.indigo, SponsorScreen()),
    _FeatureItem('Subscription', Icons.subscriptions_rounded, ZyntraColors.green, SubscriptionScreen()),
    _FeatureItem('Symptom Checker', Icons.search_rounded, ZyntraColors.purple, SymptomCheckerScreen()),
    _FeatureItem('Symptoms Directory', Icons.list_alt_rounded, ZyntraColors.teal, SymptomsScreen()),
    _FeatureItem('Tools Hub', Icons.build_rounded, ZyntraColors.amber, ToolsHubScreen()),
    _FeatureItem('Vane AI Chat', Icons.smart_toy_rounded, ZyntraColors.cyan, VaneChatScreen()),
    _FeatureItem('Voice Emergency', Icons.mic_rounded, ZyntraColors.red, VoiceEmergencyScreen()),
    _FeatureItem('Wellness', Icons.self_improvement_rounded, ZyntraColors.green, WellnessScreen()),
    _FeatureItem('Doctor Registration', Icons.person_add_rounded, ZyntraColors.indigo, DoctorRegisterScreen()),
    _FeatureItem('Chain Reaction', Icons.timeline_rounded, ZyntraColors.cyan, ChainReactionScreen()),
    _FeatureItem('God Mode', Icons.visibility_rounded, ZyntraColors.red, GodModeScreen()),
    _FeatureItem('Admin Users', Icons.people_rounded, ZyntraColors.purple, AdminUsersScreen()),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZyntraColors.bg,
      appBar: AppBar(
        title: Text('All Features (${features.length})', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.85,
        ),
        itemCount: features.length,
        itemBuilder: (_, i) => _featureCard(context, features[i], i),
      ),
    );
  }

  Widget _featureCard(BuildContext ctx, _FeatureItem f, int i) {
    return GestureDetector(
      onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => f.screen)),
      child: Container(
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: f.color.withValues(alpha: 0.2)),
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: f.color.withValues(alpha: 0.15), shape: BoxShape.circle),
            child: Icon(f.icon, color: f.color, size: 26),
          ),
          const SizedBox(height: 8),
          Text(f.label, style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
        ]),
      ).animate().fadeIn(delay: (i * 30).ms).slideY(begin: 0.2, end: 0),
    );
  }
}

class _FeatureItem {
  final String label;
  final IconData icon;
  final Color color;
  final Widget screen;
  const _FeatureItem(this.label, this.icon, this.color, this.screen);
}
