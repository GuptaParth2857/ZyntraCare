import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../hospitals/hospitals_screen.dart';
import '../doctors/doctors_screen.dart';
import '../blood_donors/blood_donors_screen.dart';
import '../pharmacies/pharmacies_screen.dart';
import '../labs/labs_screen.dart';
import '../ai_chat/ai_chat_screen.dart';
import '../ai_vision/ai_vision_screen.dart';
import '../ambulance/ambulance_screen.dart';
import '../bed_availability/bed_availability_screen.dart';
import '../blockchain/blockchain_screen.dart';
import '../blood_requests/blood_requests_screen.dart';
import '../camps/camps_screen.dart';
import '../dna_visuals/dna_visuals_screen.dart';
import '../emergency/emergency_screen.dart';
import '../health_records/health_records_screen.dart';
import '../health_tracker/health_tracker_screen.dart';
import '../maps/maps_screen.dart';
import '../medicine_scanner/medicine_scanner_screen.dart';
import '../specialists/specialists_screen.dart';
import '../telehealth/telehealth_screen.dart';
import '../video_consult/video_consult_screen.dart';
import '../wearables/wearables_screen.dart';
import '../tools/bmi_screen.dart';
import '../tools/water_intake_screen.dart';
import '../tools/emergency_card_screen.dart';
import '../blog/blog_list_screen.dart';
import '../feed/feed_screen.dart';
import '../community/community_screen.dart';
import '../rewards/rewards_screen.dart';
import '../pets/pets_screen.dart';
import '../network/mesh_screen.dart';
import '../network/drone_screen.dart';
import '../network/offline_screen.dart';
import '../corporate/corporate_wellness_screen.dart';
import '../micro_insurance/micro_insurance_screen.dart';
import '../data_marketplace/data_marketplace_screen.dart';
import '../womens_health/womens_health_screen.dart';
import '../family_care/family_care_screen.dart';
import '../medications/medications_screen.dart';
import '../medicine_reminder/medicine_reminder_screen.dart';
import '../medicine_verify/medicine_verify_screen.dart';
import '../symptom_checker/symptom_checker_screen.dart';
import '../digital_twin/digital_twin_screen.dart';
import '../health_risk/health_risk_screen.dart';
import '../predictive_analytics/predictive_analytics_screen.dart';
import '../clinical_ai/clinical_ai_screen.dart';
import '../edge_ai_symptoms/edge_ai_symptoms_screen.dart';
import '../edge_ai_vision/edge_ai_vision_screen.dart';
import '../vane_chat/vane_chat_screen.dart';
import '../dementia/dementia_voice_screen.dart';
import '../eye_control/eye_control_screen.dart';
import '../scribe/clinical_scribe_screen.dart';
import '../multilingual/multilingual_screen.dart';
import '../health_id/health_id_screen.dart';
import '../medical_id/medical_id_screen.dart';
import '../accessibility/accessibility_screen.dart';
import '../setup_admin/setup_admin_screen.dart';
import '../about/about_screen.dart';
import '../contact/contact_screen.dart';
import '../feedback/feedback_screen.dart';
import '../subscription/subscription_screen.dart';
import '../organ_matching/organ_matching_screen.dart';
import '../outbreak_radar/outbreak_radar_screen.dart';
import '../epidemic_radar/epidemic_radar_screen.dart';
import '../pdf_prescription/pdf_prescription_screen.dart';
import '../hospital_dashboard/hospital_dashboard_screen.dart';
import '../hospital_inventory/hospital_inventory_screen.dart';
import '../hospital_partner/hospital_partner_screen.dart';
import '../pharmacy_partner/pharmacy_partner_screen.dart';
import '../pharmacy_store/pharmacy_store_screen.dart';
import '../lab_booking/lab_booking_screen.dart';
import '../sms_emergency/sms_emergency_screen.dart';
import '../voice_emergency/voice_emergency_screen.dart';
import '../first_aid/first_aid_screen.dart';
import '../wellness/wellness_screen.dart';
import '../tools_hub/tools_hub_screen.dart';
import '../sponsor/sponsor_screen.dart';
import '../schemes/schemes_screen.dart';
import '../chain_reaction/chain_reaction_screen.dart';
import '../admin/god_mode_screen.dart';
import '../admin/users_screen.dart';
import '../blog/health_article_screen.dart';
import '../blood_requests/blood_campaign_screen.dart';
import '../blockchain_detail/blockchain_detail_screen.dart';
import '../doctor_register/doctor_register_screen.dart';
import '../admin/admin_screen.dart';
import '../admin/analytics_screen.dart';
import '../auth/signin_screen.dart';
import '../auth/register_screen.dart';
import '../auth/forgot_password_screen.dart';
import '../auth/reset_password_screen.dart';
import '../auth/verify_email_screen.dart';
import '../bluetooth_hrm/bluetooth_hrm_screen.dart';
import '../legal/legal_screen.dart';
import '../legal/privacy_policy_screen.dart';
import '../legal/terms_screen.dart';
import '../symptoms/symptoms_screen.dart';

class SearchTab extends StatefulWidget {
  const SearchTab({super.key});
  @override State<SearchTab> createState() => _SearchTabState();
}

class _SearchTabState extends State<SearchTab> {
  final _ctrl = TextEditingController();
  List<Map<String, dynamic>> _filteredCategories = [];
  bool _showSearch = false;

  static final List<_Category> _categories = [
    _Category('Healthcare', Icons.medical_services_rounded, ZyntraColors.cyan, [
      _Feat('Hospitals', Icons.local_hospital_rounded, ZyntraColors.cyan, HospitalsScreen()),
      _Feat('Doctors', Icons.person_rounded, ZyntraColors.green, DoctorsScreen()),
      _Feat('Labs', Icons.science_rounded, ZyntraColors.teal, LabsScreen()),
      _Feat('Pharmacy', Icons.medication_rounded, ZyntraColors.purple, PharmaciesScreen()),
      _Feat('Ambulance', Icons.airport_shuttle_rounded, ZyntraColors.amber, AmbulanceScreen()),
      _Feat('Specialists', Icons.star_rounded, ZyntraColors.pink, SpecialistsScreen()),
      _Feat('Bed Availability', Icons.hotel_rounded, ZyntraColors.pink, BedAvailabilityScreen()),
      _Feat('Maps & Nearby', Icons.map_rounded, ZyntraColors.green, MapsScreen()),
    ]),
    _Category('Emergency', Icons.warning_rounded, ZyntraColors.red, [
      _Feat('Emergency', Icons.warning_rounded, ZyntraColors.red, EmergencyScreen()),
      _Feat('Blood Donors', Icons.bloodtype_rounded, ZyntraColors.red, BloodDonorsScreen()),
      _Feat('Blood Requests', Icons.bloodtype_rounded, ZyntraColors.red, BloodRequestsScreen()),
      _Feat('SMS Emergency', Icons.sms_rounded, ZyntraColors.amber, SmsEmergencyScreen()),
      _Feat('Voice Emergency', Icons.record_voice_over_rounded, ZyntraColors.amber, VoiceEmergencyScreen()),
      _Feat('First Aid', Icons.medical_services_rounded, ZyntraColors.red, FirstAidScreen()),
      _Feat('Blood Campaign', Icons.campaign_rounded, ZyntraColors.red, BloodCampaignScreen()),
    ]),
    _Category('AI & Technology', Icons.smart_toy_rounded, ZyntraColors.purple, [
      _Feat('AI Chat', Icons.smart_toy_rounded, ZyntraColors.purple, AIChatScreen()),
      _Feat('AI Vision', Icons.visibility_rounded, ZyntraColors.purple, AIVisionScreen()),
      _Feat('Clinical AI', Icons.psychology_rounded, ZyntraColors.purple, ClinicalAiScreen()),
      _Feat('Edge AI Symptoms', Icons.memory_rounded, ZyntraColors.purple, EdgeAiSymptomsScreen()),
      _Feat('Edge AI Vision', Icons.visibility_rounded, ZyntraColors.purple, EdgeAiVisionScreen()),
      _Feat('Vane AI Chat', Icons.chat_rounded, ZyntraColors.purple, VaneChatScreen()),
      _Feat('Predictive Analytics', Icons.analytics_rounded, ZyntraColors.cyan, PredictiveAnalyticsScreen()),
    ]),
    _Category('Health Tools', Icons.build_rounded, ZyntraColors.green, [
      _Feat('Symptom Checker', Icons.search_rounded, ZyntraColors.green, SymptomCheckerScreen()),
      _Feat('Symptom Analysis', Icons.search_rounded, ZyntraColors.green, SymptomsScreen()),
      _Feat('Health Tracker', Icons.monitor_heart_rounded, ZyntraColors.amber, HealthTrackerScreen()),
      _Feat('BMI Calculator', Icons.calculate_rounded, ZyntraColors.teal, BmiScreen()),
      _Feat('Water Intake', Icons.water_drop_rounded, ZyntraColors.cyan, WaterIntakeScreen()),
      _Feat('Medicine Reminder', Icons.alarm_rounded, ZyntraColors.pink, MedicineReminderScreen()),
      _Feat('Medicine Scanner', Icons.qr_code_scanner_rounded, ZyntraColors.purple, MedicineScannerScreen()),
      _Feat('Medicine Verify', Icons.verified_rounded, ZyntraColors.green, MedicineVerifyScreen()),
      _Feat('Medications', Icons.medication_rounded, ZyntraColors.teal, MedicationsScreen()),
      _Feat('Tools Hub', Icons.build_rounded, ZyntraColors.cyan, ToolsHubScreen()),
    ]),
    _Category('Prevention & Records', Icons.folder_rounded, ZyntraColors.teal, [
      _Feat('Health Records', Icons.folder_rounded, ZyntraColors.teal, HealthRecordsScreen()),
      _Feat('Health ID', Icons.badge_rounded, ZyntraColors.cyan, HealthIdScreen()),
      _Feat('Medical ID', Icons.medical_information_rounded, ZyntraColors.red, MedicalIdScreen()),
      _Feat('Health Risk', Icons.health_and_safety_rounded, ZyntraColors.amber, HealthRiskScreen()),
      _Feat('Digital Twin', Icons.copy_all_rounded, ZyntraColors.purple, DigitalTwinScreen()),
      _Feat('Emergency Card', Icons.credit_card_rounded, ZyntraColors.red, EmergencyCardScreen()),
    ]),
    _Category('Telehealth', Icons.video_call_rounded, ZyntraColors.indigo, [
      _Feat('Telehealth', Icons.video_call_rounded, ZyntraColors.indigo, TelehealthScreen()),
      _Feat('Video Consult', Icons.videocam_rounded, ZyntraColors.indigo, VideoConsultScreen()),
      _Feat('Doctor Registration', Icons.app_registration_rounded, ZyntraColors.teal, DoctorRegisterScreen()),
      _Feat('PDF Prescription', Icons.picture_as_pdf_rounded, ZyntraColors.red, PdfPrescriptionScreen()),
    ]),
    _Category('Community', Icons.people_rounded, ZyntraColors.pink, [
      _Feat('Community', Icons.people_rounded, ZyntraColors.pink, CommunityScreen()),
      _Feat('Feed', Icons.feed_rounded, ZyntraColors.amber, FeedScreen()),
      _Feat('Blog', Icons.article_rounded, ZyntraColors.teal, BlogListScreen()),
      _Feat('Health Articles', Icons.newspaper_rounded, ZyntraColors.cyan, HealthArticleScreen()),
      _Feat('Rewards', Icons.card_giftcard_rounded, ZyntraColors.amber, RewardsScreen()),
      _Feat('Pets', Icons.pets_rounded, ZyntraColors.green, PetsScreen()),
    ]),
    _Category('Network & Offline', Icons.wifi_rounded, ZyntraColors.cyan, [
      _Feat('Mesh Network', Icons.hub_rounded, ZyntraColors.cyan, MeshScreen()),
      _Feat('Drone Delivery', Icons.flight_rounded, ZyntraColors.teal, DroneScreen()),
      _Feat('Offline Mode', Icons.wifi_off_rounded, ZyntraColors.amber, OfflineScreen()),
      _Feat('Blockchain', Icons.link_rounded, ZyntraColors.purple, BlockchainScreen()),
      _Feat('Blockchain Detail', Icons.link_rounded, ZyntraColors.purple, BlockchainDetailScreen(record: {'hash': '0x7a3f...c9e2', 'timestamp': '2026-06-24', 'type': 'Health Record'})),
      _Feat('Data Marketplace', Icons.store_rounded, ZyntraColors.green, DataMarketplaceScreen()),
    ]),
    _Category('Special Care', Icons.favorite_rounded, ZyntraColors.red, [
      _Feat('Women\'s Health', Icons.female_rounded, ZyntraColors.pink, WomensHealthScreen()),
      _Feat('Family Care', Icons.family_restroom_rounded, ZyntraColors.teal, FamilyCareScreen()),
      _Feat('Dementia Care', Icons.elderly_rounded, ZyntraColors.amber, DementiaVoiceScreen()),
      _Feat('Pets Health', Icons.pets_rounded, ZyntraColors.green, PetsScreen()),
    ]),
    _Category('Admin & Setup', Icons.admin_panel_settings_rounded, ZyntraColors.cyan, [
      _Feat('God Mode', Icons.dashboard_rounded, ZyntraColors.purple, GodModeScreen()),
      _Feat('Admin Dashboard', Icons.dashboard_rounded, ZyntraColors.cyan, AdminScreen()),
      _Feat('Analytics', Icons.analytics_rounded, ZyntraColors.teal, AnalyticsScreen()),
      _Feat('Admin Users', Icons.people_rounded, ZyntraColors.cyan, AdminUsersScreen()),
      _Feat('Setup Admin', Icons.admin_panel_settings_rounded, ZyntraColors.amber, SetupAdminScreen()),
      _Feat('About', Icons.info_rounded, ZyntraColors.white70, AboutScreen()),
      _Feat('Contact Us', Icons.mail_rounded, ZyntraColors.teal, ContactScreen()),
      _Feat('Feedback', Icons.rate_review_rounded, ZyntraColors.pink, FeedbackScreen()),
      _Feat('Legal Info', Icons.gavel_rounded, ZyntraColors.amber, LegalScreen()),
      _Feat('Privacy Policy', Icons.privacy_tip_rounded, ZyntraColors.teal, PrivacyPolicyScreen()),
      _Feat('Terms & Conditions', Icons.description_rounded, ZyntraColors.white70, TermsScreen()),
    ]),
    _Category('Corporate & Insurance', Icons.business_rounded, ZyntraColors.amber, [
      _Feat('Corporate Wellness', Icons.business_rounded, ZyntraColors.amber, CorporateWellnessScreen()),
      _Feat('Micro Insurance', Icons.safety_check_rounded, ZyntraColors.green, MicroInsuranceScreen()),
      _Feat('Subscription', Icons.subscriptions_rounded, ZyntraColors.purple, SubscriptionScreen()),
      _Feat('Schemes', Icons.assured_workload_rounded, ZyntraColors.teal, SchemesScreen()),
      _Feat('Sponsor', Icons.handshake_rounded, ZyntraColors.pink, SponsorScreen()),
    ]),
    _Category('Hospital & Pharmacy Tools', Icons.local_hospital_rounded, ZyntraColors.cyan, [
      _Feat('Hospital Dashboard', Icons.dashboard_rounded, ZyntraColors.cyan, HospitalDashboardScreen()),
      _Feat('Hospital Inventory', Icons.inventory_rounded, ZyntraColors.teal, HospitalInventoryScreen()),
      _Feat('Hospital Partner', Icons.handshake_rounded, ZyntraColors.purple, HospitalPartnerScreen()),
      _Feat('Pharmacy Partner', Icons.handshake_rounded, ZyntraColors.purple, PharmacyPartnerScreen()),
      _Feat('Pharmacy Store', Icons.store_rounded, ZyntraColors.teal, PharmacyStoreScreen()),
      _Feat('Lab Booking', Icons.science_rounded, ZyntraColors.green, LabBookingScreen()),
    ]),
    _Category('Accessibility & Special', Icons.accessibility_rounded, ZyntraColors.white70, [
      _Feat('Accessibility', Icons.accessibility_rounded, ZyntraColors.white70, AccessibilityScreen()),
      _Feat('Eye Control', Icons.visibility_rounded, ZyntraColors.cyan, EyeControlScreen()),
      _Feat('Scribe', Icons.edit_note_rounded, ZyntraColors.amber, ClinicalScribeScreen()),
      _Feat('Multilingual', Icons.translate_rounded, ZyntraColors.teal, MultilingualScreen()),
    ]),
    _Category('Account', Icons.account_circle_rounded, ZyntraColors.cyan, [
      _Feat('Sign In', Icons.login_rounded, ZyntraColors.cyan, SignInScreen()),
      _Feat('Register', Icons.person_add_rounded, ZyntraColors.green, RegisterScreen()),
      _Feat('Forgot Password', Icons.lock_reset_rounded, ZyntraColors.amber, ForgotPasswordScreen()),
      _Feat('Reset Password', Icons.lock_rounded, ZyntraColors.red, ResetPasswordScreen(token: 'demo-token')),
      _Feat('Verify Email', Icons.mark_email_unread_rounded, ZyntraColors.teal, VerifyEmailScreen(email: 'user@example.com')),
    ]),
    _Category('Monitoring & IoT', Icons.monitor_heart_rounded, ZyntraColors.red, [
      _Feat('Wearables', Icons.watch_rounded, ZyntraColors.teal, WearablesScreen()),
      _Feat('Bluetooth HRM', Icons.bluetooth_rounded, ZyntraColors.cyan, BluetoothHrmScreen()),
      _Feat('Camps', Icons.campaign_rounded, ZyntraColors.amber, CampsScreen()),
      _Feat('Organ Matching', Icons.favorite_rounded, ZyntraColors.red, OrganMatchingScreen()),
      _Feat('Outbreak Radar', Icons.radar_rounded, ZyntraColors.red, OutbreakRadarScreen()),
      _Feat('Epidemic Radar', Icons.radar_rounded, ZyntraColors.red, EpidemicRadarScreen()),
    ]),
    _Category('Wellness', Icons.self_improvement_rounded, ZyntraColors.green, [
      _Feat('Wellness', Icons.self_improvement_rounded, ZyntraColors.green, WellnessScreen()),
      _Feat('Chain Reaction', Icons.link_rounded, ZyntraColors.cyan, ChainReactionScreen()),
      _Feat('DNA Visuals', Icons.biotech_rounded, ZyntraColors.purple, DnaVisualsScreen()),
    ]),
  ];

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _onSearch(String q) {
    if (q.trim().isEmpty) {
      setState(() { _showSearch = false; _filteredCategories = []; });
      return;
    }
    final lower = q.toLowerCase();
    final results = <Map<String, dynamic>>[];
    for (final cat in _categories) {
      for (final feat in cat.feats) {
        if (feat.label.toLowerCase().contains(lower)) {
          results.add({'cat': cat.name, 'feat': feat, 'catColor': cat.color});
        }
      }
    }
    setState(() { _showSearch = true; _filteredCategories = results; });
  }

  void _open(BuildContext ctx, Widget screen) => Navigator.push(ctx, MaterialPageRoute(builder: (_) => screen));

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(children: [
        // Header & Search
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Explore', style: GoogleFonts.poppins(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            Text('Discover all healthcare features', style: GoogleFonts.inter(color: ZyntraColors.white70)),
            const SizedBox(height: 24),
            TextField(
              controller: _ctrl,
              style: GoogleFonts.inter(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search features...',
                hintStyle: GoogleFonts.inter(color: ZyntraColors.white40),
                prefixIcon: const Icon(Icons.search_rounded, color: ZyntraColors.purple),
                suffixIcon: _ctrl.text.isNotEmpty ? IconButton(
                  icon: const Icon(Icons.close_rounded, color: ZyntraColors.white40),
                  onPressed: () { _ctrl.clear(); _onSearch(''); },
                ) : null,
                filled: true,
                fillColor: ZyntraColors.surface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: ZyntraColors.purple, width: 1.5)),
              ),
              onChanged: _onSearch,
            ),
          ]),
        ),

        // Content
        Expanded(
          child: _showSearch
            ? _buildSearchResults()
            : _buildCategoryGrid(),
        ),
      ]),
    );
  }

  Widget _buildSearchResults() {
    if (_filteredCategories.isEmpty) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.search_off_rounded, color: ZyntraColors.border, size: 60),
        const SizedBox(height: 16),
        Text('No features found', style: GoogleFonts.inter(color: ZyntraColors.white70)),
      ]));
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 120),
      itemCount: _filteredCategories.length,
      itemBuilder: (_, i) {
        final item = _filteredCategories[i];
        final feat = item['feat'] as _Feat;
        final catColor = item['catColor'] as Color;
        final catName = item['cat'] as String;
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ZyntraColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: ZyntraColors.border),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () => _open(context, feat.screen),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: catColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: Icon(feat.icon, color: feat.color, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(feat.label, style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(catName, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 11)),
              ])),
              const Icon(Icons.chevron_right_rounded, color: ZyntraColors.white40, size: 20),
            ]),
          ),
        );
      },
    );
  }

  Widget _buildCategoryGrid() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
      itemCount: _categories.length,
      itemBuilder: (_, i) {
        final cat = _categories[i];
        return Padding(
          padding: const EdgeInsets.only(bottom: 20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            // Category Header
            Row(children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: cat.color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                child: Icon(cat.icon, color: cat.color, size: 18),
              ),
              const SizedBox(width: 10),
              Text(cat.name, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            ]),
            const SizedBox(height: 10),
            // Features in this category
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4, mainAxisSpacing: 8, crossAxisSpacing: 8, childAspectRatio: 0.85,
              ),
              itemCount: cat.feats.length,
              itemBuilder: (_, j) {
                final feat = cat.feats[j];
                return GestureDetector(
                  onTap: () => _open(context, feat.screen),
                  child: Container(
                    decoration: BoxDecoration(
                      color: ZyntraColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: ZyntraColors.border),
                    ),
                    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: feat.color.withValues(alpha: 0.2), shape: BoxShape.circle),
                        child: Icon(feat.icon, color: feat.color, size: 20),
                      ),
                      const SizedBox(height: 5),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 2),
                        child: Text(feat.label, style: GoogleFonts.inter(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w500), textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis),
                      ),
                    ]),
                  ),
                );
              },
            ),
          ]),
        );
      },
    );
  }
}

class _Category {
  final String name;
  final IconData icon;
  final Color color;
  final List<_Feat> feats;
  const _Category(this.name, this.icon, this.color, this.feats);
}

class _Feat {
  final String label;
  final IconData icon;
  final Color color;
  final Widget screen;
  const _Feat(this.label, this.icon, this.color, this.screen);
}
