import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_mobile_service.dart';
import '../theme/app_theme.dart';

class MedicalFacility {
  final String id;
  final String name;
  final String type; // 'First Aid Post', 'Ambulance', 'Cooling Tent', 'Hospital'
  final String location;
  final int distanceMeters;
  final int walkMinutes;
  final String availability;
  final String staffOnDuty;
  final String phone;
  final bool isEmergencyReady;
  final List<String> directions;

  const MedicalFacility({
    required this.id,
    required this.name,
    required this.type,
    required this.location,
    required this.distanceMeters,
    required this.walkMinutes,
    required this.availability,
    required this.staffOnDuty,
    required this.phone,
    this.isEmergencyReady = true,
    required this.directions,
  });
}

class MedicalSosScreen extends StatefulWidget {
  const MedicalSosScreen({super.key});

  @override
  State<MedicalSosScreen> createState() => _MedicalSosScreenState();
}

class _MedicalSosScreenState extends State<MedicalSosScreen> {
  // Slider & SOS activation state
  double _sliderValue = 0.0;
  bool _isSosActive = false;
  int _sosCountdown = 10;
  Timer? _countdownTimer;
  String? _activeSosAlertId;

  // Realistic mock data for Kumbh Sector 4 medical points
  final List<MedicalFacility> _facilities = const [
    MedicalFacility(
      id: 'med-red-cross-4',
      name: 'Red Cross First Aid Post 4',
      type: 'First Aid Post',
      location: 'Sector 4 Promenade • Near Pole #E-42',
      distanceMeters: 140,
      walkMinutes: 2,
      availability: '3 Beds Vacant • Zero Queue',
      staffOnDuty: 'Dr. Verma (Trauma Spec.) & 2 Nurses',
      phone: '108',
      isEmergencyReady: true,
      directions: [
        'Head East along Sector 4 Promenade for 80m',
        'Pass the Sector 4 Water Point C-8 on your right',
        'The Red Cross tent with the red cross banner is directly ahead',
      ],
    ),
    MedicalFacility(
      id: 'med-ambulance-12',
      name: 'Mobile Ambulance Unit 12',
      type: 'Mobile Ambulance',
      location: 'Ganga Ghat Ramp 3 • Gate 3 Parking',
      distanceMeters: 280,
      walkMinutes: 4,
      availability: 'Advanced Life Support (ALS) Ready',
      staffOnDuty: '2 Emergency Medical Technicians on board',
      phone: '108',
      isEmergencyReady: true,
      directions: [
        'Walk towards Ghat Gate 3 emergency vehicle ramp',
        'Ambulance Unit 12 is stationed with blinking beacon near Gate 3 checkpoint',
      ],
    ),
    MedicalFacility(
      id: 'med-cooling-tent',
      name: 'Sector 4 Hydration & Cooling Tent',
      type: 'Cooling & Rest Tent',
      location: 'Sector 4 Central Lawn • Near Camp 8',
      distanceMeters: 90,
      walkMinutes: 1,
      availability: 'Open Access • 12 Cots Free',
      staffOnDuty: 'Civil Defence Volunteers • Free ORS & Misting Fans',
      phone: '1077',
      isEmergencyReady: false,
      directions: [
        'Walk 50m straight into Sector 4 central green enclosure',
        'Large white marquee with mist cooling fans is located at center',
      ],
    ),
    MedicalFacility(
      id: 'med-apex-hospital',
      name: 'Maha Kumbh Central Field Hospital',
      type: 'Field Hospital',
      location: 'Sector 2 Main Medical Enclave',
      distanceMeters: 650,
      walkMinutes: 9,
      availability: '24/7 ICU & Minor Surgery Unit',
      staffOnDuty: 'Chief Medical Officer & Surgical Team',
      phone: '108',
      isEmergencyReady: true,
      directions: [
        'Follow green emergency corridor towards Sector 2 bridge road',
        'Direct ambulance transit available at Gate 4 pickup point',
      ],
    ),
  ];

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  Future<void> _triggerSosAlarm() async {
    setState(() {
      _isSosActive = true;
      _sosCountdown = 10;
    });

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_sosCountdown > 1) {
        setState(() {
          _sosCountdown--;
        });
      } else {
        timer.cancel();
      }
    });

    try {
      final alertId = await SupabaseMobileService.instance.createSosAlert(
        alertType: 'SOS_ALARM',
        severity: 'CRITICAL',
        title: 'Emergency SOS Broadcast',
        description:
            'High-priority distress slider triggered from Sector 4 Pole #E-42.',
      );
      if (!mounted) return;
      _activeSosAlertId = alertId;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'SOS broadcast sent to Admin Control Room & Field Volunteers.',
          ),
          backgroundColor: AppTheme.error,
          duration: Duration(seconds: 3),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'SOS active locally (offline fallback — check internet connection).',
          ),
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  Future<void> _cancelSosAlarm() async {
    _countdownTimer?.cancel();
    final activeId = _activeSosAlertId;
    _activeSosAlertId = null;
    setState(() {
      _isSosActive = false;
      _sliderValue = 0.0;
      _sosCountdown = 10;
    });

    if (activeId != null) {
      try {
        await SupabaseMobileService.instance.updateSosAlertStatus(
          activeId,
          status: 'CANCELLED',
        );
      } catch (_) {}
    }

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Emergency distress broadcast cancelled.'),
        backgroundColor: AppTheme.primary,
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.primary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Medical / SOS Hub',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: AppTheme.primary,
              ),
            ),
            Text(
              'Sector 4 • Rapid Emergency Response',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: AppTheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildDemoNoticeBanner(),
              const SizedBox(height: 10),
              _buildLiveCoordinateCard(),
              const SizedBox(height: 12),
              _buildSosActivationCard(),
              const SizedBox(height: 18),
              _buildQuickAssistanceSection(),
              const SizedBox(height: 18),
              _buildNearestMedicalFacilitiesSection(),
              const SizedBox(height: 18),
              _buildEmergencyHelplinesSection(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  // 1. Prominent Demo Disclaimer
  Widget _buildDemoNoticeBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3CD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFFEEBA)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.warning_amber_rounded, size: 18, color: Color(0xFF856404)),
          const SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF856404)),
                children: const [
                  TextSpan(
                    text: 'DEMO & SIMULATION NOTICE: ',
                    style: TextStyle(fontWeight: FontWeight.w800),
                  ),
                  TextSpan(
                    text:
                        'This interface is a student prototype demonstrating offline mesh emergency triage. No actual police, ambulance or hospital is dispatched. In a real emergency, immediately dial ',
                  ),
                  TextSpan(
                    text: '112 or 108.',
                    style: TextStyle(fontWeight: FontWeight.w800, decoration: TextDecoration.underline),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 2. Safe Coordinates & Mesh Relay Card
  Widget _buildLiveCoordinateCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.surfaceContainerHigh),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppTheme.error,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'CURRENT PILGRIM BEACON',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.error,
                      letterSpacing: 0.6,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.secondaryContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'GPS ±2m',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.onSecondaryContainer,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Sector 4, North Pathway Ramp',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppTheme.primary,
            ),
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'POLE #E-42',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Near Ganga Ghat Gate 3 Ramp Entrance',
                  style: GoogleFonts.inter(
                    fontSize: 11.5,
                    color: AppTheme.onSurfaceVariant,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 3. Primary SOS Activation Card (Slide-to-Activate to prevent accidental trigger)
  Widget _buildSosActivationCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.error,
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33BA1A1A),
            blurRadius: 14,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'PRIORITY DISTRESS PROTOCOL',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFFFFDAD6),
                      letterSpacing: 0.6,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Emergency SOS Broadcast',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.campaign, color: Colors.white, size: 22),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // If SOS is currently Active: show countdown, disarm button and active status
          if (_isSosActive) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(
                              color: AppTheme.error,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Distress Beacon Active',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.error,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFDAD6),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${_sosCountdown}s',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.error,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Broadcasting simulated packet to Sector 4 Quick Response Team. Keep this screen open.',
                    style: GoogleFonts.inter(fontSize: 11.5, color: AppTheme.onSurfaceVariant),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _cancelSosAlarm,
                      icon: const Icon(Icons.close, size: 16, color: AppTheme.error),
                      label: Text(
                        'CANCEL ALARM (Accidental Tap)',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.error,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.error, width: 1.5),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            // Tactile Slider to prevent accidental firing
            Container(
              height: 52,
              decoration: BoxDecoration(
                color: const Color(0xFF680005),
                borderRadius: BorderRadius.circular(26),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.chevron_right, color: Color(0xFFFFDAD6), size: 18),
                        const SizedBox(width: 4),
                        Text(
                          'SLIDE TO BROADCAST SOS',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFFFFDAD6),
                            letterSpacing: 0.6,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      trackHeight: 52,
                      activeTrackColor: Colors.transparent,
                      inactiveTrackColor: Colors.transparent,
                      thumbShape: const RoundSliderThumbShape(
                        enabledThumbRadius: 22,
                        elevation: 4,
                      ),
                      thumbColor: Colors.white,
                      overlayColor: Colors.transparent,
                    ),
                    child: Slider(
                      value: _sliderValue,
                      min: 0.0,
                      max: 1.0,
                      onChanged: (val) {
                        setState(() {
                          _sliderValue = val;
                        });
                        if (val >= 0.88) {
                          _triggerSosAlarm();
                        }
                      },
                      onChangeEnd: (val) {
                        if (val < 0.88) {
                          setState(() {
                            _sliderValue = 0.0;
                          });
                        }
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Transmits coordinate #E-42 to Sector 4 Volunteers and Red Cross Triage via offline radio relay.',
              style: GoogleFonts.inter(
                fontSize: 10.5,
                color: Colors.white.withValues(alpha: 0.9),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // 4. Quick Incident Assistance Triggers
  Widget _buildQuickAssistanceSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Instant Triage Assistance',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppTheme.primary,
              ),
            ),
            Text(
              'DEMO DISPATCH',
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: AppTheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 1.45,
          children: [
            _buildTriggerCard(
              icon: Icons.medical_services,
              title: 'Medical / Injury',
              subtitle: 'Fainting, wound, trauma',
              bgColor: const Color(0xFFFFDAD6),
              iconColor: AppTheme.error,
              onTap: () => _showSimulatedTriageDialog('Medical / Injury', 'Paramedic & First Aid Kit'),
            ),
            _buildTriggerCard(
              icon: Icons.groups,
              title: 'Crowd Bottleneck',
              subtitle: 'Stampede risk, crush',
              bgColor: const Color(0xFFFFE0B2),
              iconColor: const Color(0xFFC68A00),
              onTap: () => _showSimulatedTriageDialog('Crowd Bottleneck', 'Sector Marshal Crowd Control'),
            ),
            _buildTriggerCard(
              icon: Icons.person_search,
              title: 'Missing Member',
              subtitle: 'Lost child or elderly',
              bgColor: const Color(0xFFE2E7FF),
              iconColor: AppTheme.primary,
              onTap: () => _showSimulatedTriageDialog('Missing Member', 'Lost & Found Camp Announcement'),
            ),
            _buildTriggerCard(
              icon: Icons.accessible,
              title: 'Mobility Assist',
              subtitle: 'Wheelchair, stretcher',
              bgColor: const Color(0xFFD3F8E8),
              iconColor: AppTheme.secondary,
              onTap: () => _showSimulatedTriageDialog('Mobility Assist', 'Divyangjan Stretcher Escort'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTriggerCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color bgColor,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.surfaceContainerHigh),
          boxShadow: const [
            BoxShadow(
              color: Color(0x04000000),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: iconColor, size: 18),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.onSurface,
                  ),
                ),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: AppTheme.onSurfaceVariant,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // 5. Nearest Medical Facilities Section
  Widget _buildNearestMedicalFacilitiesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Nearby Medical Aid & Camps',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppTheme.primary,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.secondaryContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'LIVE STATUS',
                style: GoogleFonts.inter(
                  fontSize: 9.5,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.onSecondaryContainer,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        ..._facilities.map((facility) => _buildMedicalFacilityCard(facility)),
      ],
    );
  }

  Widget _buildMedicalFacilityCard(MedicalFacility facility) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.surfaceContainerHigh),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: facility.isEmergencyReady ? const Color(0xFFFFDAD6) : const Color(0xFFD3F8E8),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  facility.isEmergencyReady ? Icons.local_hospital : Icons.water_drop,
                  color: facility.isEmergencyReady ? AppTheme.error : AppTheme.secondary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      facility.name,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      facility.location,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppTheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${facility.distanceMeters}m',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '~${facility.walkMinutes} min walk',
                    style: GoogleFonts.inter(
                      fontSize: 9.5,
                      color: AppTheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerLow,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle_outline, size: 14, color: AppTheme.secondary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    facility.availability,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.onSurface,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Duty: ${facility.staffOnDuty}',
            style: GoogleFonts.inter(
              fontSize: 10.5,
              color: AppTheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: AppTheme.surfaceContainerHigh),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              OutlinedButton.icon(
                onPressed: () => _showSimulatedCallDialog(facility.name, facility.phone),
                icon: const Icon(Icons.call, size: 14, color: AppTheme.primary),
                label: Text(
                  'Call Post',
                  style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w700),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  minimumSize: const Size(48, 36),
                ),
              ),
              ElevatedButton.icon(
                onPressed: () => _showDirectionsDialog(facility),
                icon: const Icon(Icons.navigation, size: 14, color: Colors.white),
                label: Text(
                  'Route to Clinic',
                  style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w700),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryContainer,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  minimumSize: const Size(48, 36),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 6. Direct Emergency Helplines
  Widget _buildEmergencyHelplinesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Direct Emergency Numbers',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: AppTheme.primary,
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _buildHelplineCard(
                number: '112',
                label: 'National Police / Disaster',
                icon: Icons.local_police,
                color: AppTheme.primaryContainer,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildHelplineCard(
                number: '108',
                label: 'Medical Ambulance',
                icon: Icons.medical_services,
                color: AppTheme.error,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildHelplineCard(
                number: '1077',
                label: 'Kumbh Control Room',
                icon: Icons.support_agent,
                color: const Color(0xFF006C4A),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildHelplineCard(
                number: '1098',
                label: 'Childline Helpline',
                icon: Icons.child_care,
                color: const Color(0xFFC68A00),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildHelplineCard({
    required String number,
    required String label,
    required IconData icon,
    required Color color,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () => _showSimulatedCallDialog(label, number),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.surfaceContainerHigh),
          boxShadow: const [
            BoxShadow(
              color: Color(0x04000000),
              blurRadius: 4,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 16),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    number,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primary,
                    ),
                  ),
                  Text(
                    label,
                    style: GoogleFonts.inter(
                      fontSize: 9.5,
                      color: AppTheme.onSurfaceVariant,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Waypoints navigation dialog
  void _showDirectionsDialog(MedicalFacility facility) {
    showDialog<void>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.alt_route, color: AppTheme.error),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Route to ${facility.name}',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.timer_outlined, size: 14, color: AppTheme.onSurfaceVariant),
                      const SizedBox(width: 4),
                      Text(
                        'Total Walk: ${facility.distanceMeters}m (~${facility.walkMinutes} mins)',
                        style: GoogleFonts.inter(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF3CD),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Demo Navigation: Live waypoint routing is simulated for prototype presentation.',
                    style: GoogleFonts.inter(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF856404),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Step-by-Step Waypoints:',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.onSurface,
                  ),
                ),
                const SizedBox(height: 8),
                ...facility.directions.asMap().entries.map((entry) {
                  final idx = entry.key + 1;
                  final step = entry.value;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 20,
                          height: 20,
                          decoration: const BoxDecoration(
                            color: Color(0xFFFFDAD6),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              '$idx',
                              style: GoogleFonts.inter(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.error,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            step,
                            style: GoogleFonts.inter(fontSize: 12, color: AppTheme.onSurface),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Close'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Simulated green corridor route active to ${facility.name}'),
                    backgroundColor: AppTheme.primaryContainer,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryContainer,
                foregroundColor: Colors.white,
              ),
              child: const Text('Start Guidance'),
            ),
          ],
        );
      },
    );
  }

  // Quick triage incident dialog
  void _showSimulatedTriageDialog(String alertTitle, String dispatchedUnit) {
    showDialog<void>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.emergency_share, color: AppTheme.error),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Dispatch: $alertTitle',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Reporting pilgrim location at Sector 4 Pole #E-42.',
                style: GoogleFonts.inter(fontSize: 12, color: AppTheme.onSurface),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Simulated Assignment:',
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      dispatchedUnit,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Note: This is a demo simulation for academic presentation. In an actual crisis, phone emergency lines immediately.',
                style: GoogleFonts.inter(
                  fontSize: 10.5,
                  fontStyle: FontStyle.italic,
                  color: AppTheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(ctx).pop();
                final mappedType = alertTitle.contains('Crowd')
                    ? 'CROWD'
                    : alertTitle.contains('Missing')
                        ? 'LOST_PERSON'
                        : alertTitle.contains('Mobility')
                            ? 'MOBILITY'
                            : 'MEDICAL';
                try {
                  await SupabaseMobileService.instance.createSosAlert(
                    alertType: mappedType,
                    severity: 'HIGH',
                    title: alertTitle,
                    description:
                        'Requested $dispatchedUnit at Sector 4 Pole #E-42.',
                  );
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Live alert sent: "$alertTitle" ($dispatchedUnit). Visible in Admin & Volunteer Portal.',
                      ),
                      backgroundColor: AppTheme.secondary,
                      duration: const Duration(seconds: 4),
                    ),
                  );
                } catch (e) {
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to send alert ($e).'),
                      backgroundColor: AppTheme.error,
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.error,
                foregroundColor: Colors.white,
              ),
              child: const Text('Confirm Dispatch'),
            ),
          ],
        );
      },
    );
  }

  // Simulated emergency call dialog
  void _showSimulatedCallDialog(String name, String number) {
    showDialog<void>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.phone_in_talk, color: AppTheme.secondary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Call $name',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Emergency Helpline Number: $number',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'On actual physical phones with SIM cards, this will trigger the system phone dialer. In this presentation demo, the action is simulated.',
                style: GoogleFonts.inter(fontSize: 11, color: AppTheme.onSurfaceVariant),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Dismiss'),
            ),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Simulated dialer initiated for $number ($name).'),
                    backgroundColor: AppTheme.primaryContainer,
                  ),
                );
              },
              icon: const Icon(Icons.call, size: 14, color: Colors.white),
              label: Text('Dial $number'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.secondary,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        );
      },
    );
  }
}

