import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../theme/app_theme.dart';
import 'medical_sos_screen.dart';

class FamilyMember {
  final String id;
  final String name;
  final String relation;
  final String initial;
  final Color avatarColor;
  final int distanceMeters;
  final double angleDegrees; // 0 = North, 90 = East, 180 = South, 270 = West
  final int batteryPct;
  final int lastUpdatedMinsAgo;
  final String phone;
  final bool isSharing;

  const FamilyMember({
    required this.id,
    required this.name,
    required this.relation,
    required this.initial,
    required this.avatarColor,
    required this.distanceMeters,
    required this.angleDegrees,
    required this.batteryPct,
    required this.lastUpdatedMinsAgo,
    required this.phone,
    this.isSharing = true,
  });

  FamilyMember copyWith({
    int? distanceMeters,
    double? angleDegrees,
    int? batteryPct,
    int? lastUpdatedMinsAgo,
  }) {
    return FamilyMember(
      id: id,
      name: name,
      relation: relation,
      initial: initial,
      avatarColor: avatarColor,
      distanceMeters: distanceMeters ?? this.distanceMeters,
      angleDegrees: angleDegrees ?? this.angleDegrees,
      batteryPct: batteryPct ?? this.batteryPct,
      lastUpdatedMinsAgo: lastUpdatedMinsAgo ?? this.lastUpdatedMinsAgo,
      phone: phone,
      isSharing: isSharing,
    );
  }
}

class FamilyMeetingPoint {
  final String name;
  final String landmark;
  final int distanceMeters;
  final double angleDegrees;

  const FamilyMeetingPoint({
    required this.name,
    required this.landmark,
    required this.distanceMeters,
    required this.angleDegrees,
  });
}

class FamilyRadarScreen extends StatefulWidget {
  final bool isEmbedded;

  const FamilyRadarScreen({
    super.key,
    this.isEmbedded = false,
  });

  @override
  State<FamilyRadarScreen> createState() => _FamilyRadarScreenState();
}

class _FamilyRadarScreenState extends State<FamilyRadarScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _radarController;
  Timer? _driftTimer;
  bool _isLocationSharingOn = true;
  bool _isBackendConnected = false;
  String? _selectedMemberId;
  String _groupName = 'Sharma Family Circle';
  String _groupCode = 'EVF-782';
  String _groupId = 'grp_demo_sharma';
  String _myUserId = 'usr_phone_user';

  WebSocket? _webSocket;
  StreamSubscription? _wsSubscription;

  List<FamilyMember> _members = [
    const FamilyMember(
      id: 'mem_mom',
      name: 'Sunita Sharma',
      relation: 'Mom',
      initial: 'M',
      avatarColor: AppTheme.secondary,
      distanceMeters: 45,
      angleDegrees: 35, // North-East
      batteryPct: 82,
      lastUpdatedMinsAgo: 1,
      phone: '+91 98765 43210',
    ),
    const FamilyMember(
      id: 'mem_brother',
      name: 'Rahul Sharma',
      relation: 'Brother',
      initial: 'R',
      avatarColor: AppTheme.primaryContainer,
      distanceMeters: 110,
      angleDegrees: 220, // South-West
      batteryPct: 45,
      lastUpdatedMinsAgo: 2,
      phone: '+91 98765 43211',
    ),
    const FamilyMember(
      id: 'mem_grandpa',
      name: 'Om Prakash',
      relation: 'Grandfather',
      initial: 'G',
      avatarColor: Color(0xFFC68A00),
      distanceMeters: 75,
      angleDegrees: 310, // North-West
      batteryPct: 91,
      lastUpdatedMinsAgo: 1,
      phone: '+91 98765 43212',
    ),
  ];

  FamilyMeetingPoint _meetingPoint = const FamilyMeetingPoint(
    name: 'Sector 4 Main Medical & Info Kiosk',
    landmark: 'Next to Big Blue Light Tower #4',
    distanceMeters: 140,
    angleDegrees: 140, // South-East
  );

  @override
  void initState() {
    super.initState();
    _radarController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    _fetchBackendGroup();
    _connectWebSocket();

    _driftTimer = Timer.periodic(const Duration(seconds: 4), (t) {
      if (!mounted) return;
      setState(() {
        final rand = math.Random();
        _members = _members.map((m) {
          final deltaDist = (rand.nextInt(5) - 2);
          final newDist = (m.distanceMeters + deltaDist).clamp(12, 120);
          final deltaAngle = (rand.nextDouble() * 4 - 2);
          return m.copyWith(
            distanceMeters: newDist,
            angleDegrees: (m.angleDegrees + deltaAngle) % 360,
          );
        }).toList();
      });
    });
  }

  @override
  void dispose() {
    _driftTimer?.cancel();
    _radarController.dispose();
    _wsSubscription?.cancel();
    _webSocket?.close();
    super.dispose();
  }

  // --- Backend Connection Handlers ---

  Future<void> _fetchBackendGroup() async {
    try {
      final client = HttpClient()..connectionTimeout = const Duration(seconds: 3);
      final request = await client.getUrl(
        Uri.parse('http://127.0.0.1:5000/api/v1/family/active?userId=$_myUserId'),
      );
      final response = await request.close();

      if (response.statusCode == 200) {
        final body = await response.transform(utf8.decoder).join();
        final json = jsonDecode(body);
        if (json['success'] == true && json['data'] != null) {
          final data = json['data'];
          setState(() {
            _groupName = data['name'] ?? _groupName;
            _groupCode = data['inviteCode'] ?? _groupCode;
            _groupId = data['id'] ?? _groupId;
            _isBackendConnected = true;

            if (data['members'] is List && (data['members'] as List).isNotEmpty) {
              final List rawMembers = data['members'];
              _members = rawMembers.map((m) {
                final colorHex = (m['avatarColor'] as String?)?.replaceAll('#', '0xFF') ?? '0xFF006C4A';
                return FamilyMember(
                  id: m['id'] ?? 'mem',
                  name: m['name'] ?? 'Family Member',
                  relation: m['relation'] ?? 'Member',
                  initial: m['initial'] ?? 'F',
                  avatarColor: Color(int.tryParse(colorHex) ?? 0xFF006C4A),
                  distanceMeters: (m['distanceMeters'] as num?)?.toInt() ?? (30 + math.Random().nextInt(90)),
                  angleDegrees: (m['angleDegrees'] as num?)?.toDouble() ?? (math.Random().nextDouble() * 360),
                  batteryPct: (m['batteryPct'] as num?)?.toInt() ?? 80,
                  lastUpdatedMinsAgo: (m['lastUpdatedMinsAgo'] as num?)?.toInt() ?? 0,
                  phone: m['phone'] ?? '+91 90000 00000',
                );
              }).toList();
            }
          });
        }
      }
    } catch (_) {
      // Offline fallback: keep graceful mock state
    }
  }

  Future<void> _connectWebSocket() async {
    try {
      final uri = Uri.parse('ws://127.0.0.1:5000/ws/family?userId=$_myUserId&groupId=$_groupId');
      final ws = await WebSocket.connect(uri.toString()).timeout(const Duration(seconds: 3));
      _webSocket = ws;
      setState(() {
        _isBackendConnected = true;
      });

      _wsSubscription = ws.listen(
        (data) {
          try {
            final payload = jsonDecode(data as String);
            if (payload['type'] == 'BUZZER_TRIGGERED') {
              _showInfoSnackbar('Incoming Chime from family member!');
            } else if (payload['type'] == 'MEMBER_LOCATION_CHANGED') {
              _simulateLivePulse();
            }
          } catch (_) {}
        },
        onError: (_) {
          setState(() => _isBackendConnected = false);
        },
        onDone: () {
          setState(() => _isBackendConnected = false);
        },
      );
    } catch (_) {
      setState(() => _isBackendConnected = false);
    }
  }

  void _simulateLivePulse() {
    setState(() {
      _members = _members.map((m) {
        final jitter = (math.Random().nextInt(5) - 2);
        final newDist = math.max(15, m.distanceMeters + jitter);
        return m.copyWith(distanceMeters: newDist);
      }).toList();
    });
  }

  void _sendBuzzerAlert(FamilyMember member) {
    if (_webSocket != null && _webSocket?.readyState == WebSocket.open) {
      _webSocket?.add(jsonEncode({
        'type': 'RING_BUZZER',
        'targetUserId': member.id,
      }));
    }
    _showInfoSnackbar('Sent acoustic alert to ${member.name} via backend socket');
  }

  // --- UI Build ---

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildBackendSyncBadge(),
            _buildGroupHeaderCard(),
            const SizedBox(height: 12),
            _buildRadarView(),
            const SizedBox(height: 16),
            _buildSelectedMemberCard(),
            _buildMeetingPointCard(),
            const SizedBox(height: 16),
            _buildMembersList(),
            const SizedBox(height: 20),
            _buildSafetyActionButtons(),
            const SizedBox(height: 36),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: AppTheme.primary,
      elevation: 0,
      centerTitle: false,
      automaticallyImplyLeading: !widget.isEmbedded,
      leading: widget.isEmbedded
          ? null
          : IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
              onPressed: () => Navigator.pop(context),
            ),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Find My Family',
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          Text(
            'Kin Locator & Safety Radar',
            style: GoogleFonts.plusJakartaSans(
              color: AppTheme.secondaryContainer,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          tooltip: 'Show / Scan QR Code',
          icon: const Icon(Icons.qr_code_2, color: Colors.white, size: 24),
          onPressed: _showInviteSheet,
        ),
        IconButton(
          tooltip: 'Invite / Add Member',
          icon: const Icon(Icons.person_add_alt_1, color: Colors.white),
          onPressed: _showInviteSheet,
        ),
        IconButton(
          tooltip: 'SOS Report Lost Person',
          icon: const Icon(Icons.sos, color: Colors.redAccent, size: 28),
          onPressed: _navigateToSos,
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildBackendSyncBadge() {
    return Container(
      color: _isBackendConnected ? const Color(0xFFE6F4EA) : const Color(0xFFFFF4E5),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            _isBackendConnected ? Icons.cloud_done : Icons.cloud_queue,
            size: 14,
            color: _isBackendConnected ? Colors.green.shade800 : Colors.orange.shade800,
          ),
          const SizedBox(width: 6),
          Text(
            _isBackendConnected
                ? 'Backend Live Sync Connected (Port 5000 WS Active)'
                : 'Offline / Standalone Radar (Connecting to localhost:5000...)',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: _isBackendConnected ? Colors.green.shade900 : Colors.orange.shade900,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGroupHeaderCard() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.secondary.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.hub, color: AppTheme.secondary, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        _groupName,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerHigh,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _groupCode,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primaryContainer,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  '${_members.length + 1} members active • Live sync on',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 12,
                    color: AppTheme.outline,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: _isLocationSharingOn,
            activeColor: AppTheme.secondary,
            onChanged: (val) {
              setState(() {
                _isLocationSharingOn = val;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(val
                      ? 'Live location sharing enabled for family'
                      : 'Live location paused (Privacy Mode)'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildRadarView() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      height: 340,
      decoration: BoxDecoration(
        color: const Color(0xFF071426),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF071426).withOpacity(0.25),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          alignment: Alignment.center,
          children: [
            AnimatedBuilder(
              animation: _radarController,
              builder: (context, child) {
                return CustomPaint(
                  size: const Size(340, 340),
                  painter: _RadarPainter(
                    sweepAngle: _radarController.value * 2 * math.pi,
                  ),
                );
              },
            ),

            // Meeting Point Marker
            _buildRadarMarker(
              angleDegrees: _meetingPoint.angleDegrees,
              distanceRatio: math.min(1.0, _meetingPoint.distanceMeters / 150.0),
              child: GestureDetector(
                onTap: () {
                  _showInfoSnackbar(
                      'Meeting Point: ${_meetingPoint.name} (${_meetingPoint.distanceMeters}m)');
                },
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade700,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.amber.withOpacity(0.6),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: const Icon(Icons.flag, color: Colors.white, size: 14),
                ),
              ),
            ),

            // Family Member Pins
            ..._members.map((member) {
              final isSelected = member.id == _selectedMemberId;
              final ratio = math.min(0.9, member.distanceMeters / 150.0);
              return _buildRadarMarker(
                angleDegrees: member.angleDegrees,
                distanceRatio: ratio,
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedMemberId =
                          _selectedMemberId == member.id ? null : member.id;
                    });
                  },
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: isSelected ? Colors.white : Colors.transparent,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected
                                ? AppTheme.secondaryContainer
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: CircleAvatar(
                          radius: isSelected ? 18 : 15,
                          backgroundColor: member.avatarColor,
                          child: Text(
                            member.initial,
                            style: GoogleFonts.plusJakartaSans(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${member.relation} (${member.distanceMeters}m)',
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),

            // Center: "You"
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: AppTheme.secondary.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: const BoxDecoration(
                      color: AppTheme.secondary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.navigation,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                ),
                const SizedBox(height: 2),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'YOU',
                    style: GoogleFonts.plusJakartaSans(
                      color: AppTheme.secondaryContainer,
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),

            // Top Status Overlay
            Positioned(
              top: 12,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white12),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: _isBackendConnected ? Colors.greenAccent : Colors.orangeAccent,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Radar Range: 150m Radius',
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white70,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRadarMarker({
    required double angleDegrees,
    required double distanceRatio,
    required Widget child,
  }) {
    final rad = (angleDegrees - 90) * math.pi / 180.0;
    const maxRadius = 135.0;
    final r = distanceRatio * maxRadius;
    final dx = r * math.cos(rad);
    final dy = r * math.sin(rad);

    return Transform.translate(
      offset: Offset(dx, dy),
      child: child,
    );
  }

  Widget _buildSelectedMemberCard() {
    if (_selectedMemberId == null) return const SizedBox.shrink();

    final member = _members.firstWhere((m) => m.id == _selectedMemberId);
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.secondary.withOpacity(0.3), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppTheme.secondary.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: member.avatarColor,
                child: Text(
                  member.initial,
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${member.name} (${member.relation})',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                      ),
                    ),
                    Text(
                      '${member.distanceMeters}m away • Updated ${member.lastUpdatedMinsAgo}m ago',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        color: AppTheme.secondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, size: 18, color: AppTheme.outline),
                onPressed: () {
                  setState(() {
                    _selectedMemberId = null;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primary,
                    side: const BorderSide(color: AppTheme.outlineVariant),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  icon: const Icon(Icons.volume_up, size: 18),
                  label: Text(
                    'Ring Buzzer',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  onPressed: () => _sendBuzzerAlert(member),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.secondary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  icon: const Icon(Icons.directions_walk, size: 18),
                  label: Text(
                    'Walk To',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  onPressed: () {
                    _showInfoSnackbar(
                        'Navigating to ${member.name} (Compass bearing: ${member.angleDegrees.toInt()}°)');
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMeetingPointCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.amber.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.amber.shade300),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.amber.shade700,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.flag, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Emergency Meeting Point',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Colors.amber.shade900,
                  ),
                ),
                Text(
                  _meetingPoint.name,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                  ),
                ),
                Text(
                  '${_meetingPoint.landmark} • ${_meetingPoint.distanceMeters}m away',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 11,
                    color: Colors.brown.shade700,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {
              _showInfoSnackbar('Route to Meeting Point set in navigation');
            },
            child: Text(
              'Route',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.w700,
                color: Colors.amber.shade900,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMembersList() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Linked Kin (${_members.length})',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppTheme.primary,
            ),
          ),
          const SizedBox(height: 10),
          ..._members.map((member) {
            final isSelected = member.id == _selectedMemberId;
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.surfaceContainerHigh : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected ? AppTheme.secondary : AppTheme.outlineVariant.withOpacity(0.6),
                ),
              ),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: member.avatarColor,
                  child: Text(
                    member.initial,
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                title: Text(
                  '${member.name} (${member.relation})',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                  ),
                ),
                subtitle: Row(
                  children: [
                    Icon(
                      Icons.battery_charging_full,
                      size: 13,
                      color: member.batteryPct < 50 ? Colors.orange : AppTheme.secondary,
                    ),
                    const SizedBox(width: 3),
                    Text(
                      '${member.batteryPct}%',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        color: AppTheme.outline,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text('•', style: TextStyle(color: AppTheme.outline)),
                    const SizedBox(width: 8),
                    Text(
                      '${member.lastUpdatedMinsAgo}m ago',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        color: AppTheme.outline,
                      ),
                    ),
                  ],
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '${member.distanceMeters}m',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.secondary,
                          ),
                        ),
                        Text(
                          _getDirectionLabel(member.angleDegrees),
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 10,
                            color: AppTheme.outline,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_forward_ios, size: 14, color: AppTheme.outline),
                  ],
                ),
                onTap: () {
                  setState(() {
                    _selectedMemberId = _selectedMemberId == member.id ? null : member.id;
                  });
                },
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSafetyActionButtons() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFBA1A1A),
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            icon: const Icon(Icons.warning_amber_rounded, size: 22),
            label: Text(
              'Report Missing Kin / Emergency SOS',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            onPressed: _navigateToSos,
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.primary,
              side: const BorderSide(color: AppTheme.outlineVariant),
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            icon: const Icon(Icons.qr_code_scanner, size: 20),
            label: Text(
              'Share Invite Code or QR',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
            onPressed: _showInviteSheet,
          ),
        ],
      ),
    );
  }

  String _getDirectionLabel(double deg) {
    if (deg >= 337.5 || deg < 22.5) return 'North ↑';
    if (deg >= 22.5 && deg < 67.5) return 'North-East ↗';
    if (deg >= 67.5 && deg < 112.5) return 'East →';
    if (deg >= 112.5 && deg < 157.5) return 'South-East ↘';
    if (deg >= 157.5 && deg < 202.5) return 'South ↓';
    if (deg >= 202.5 && deg < 247.5) return 'South-West ↙';
    if (deg >= 247.5 && deg < 292.5) return 'West ←';
    return 'North-West ↖';
  }

  void _showInviteSheet() {
    int activeTab = 0; // 0 = Show My QR, 1 = Scan Camera, 2 = Type Code
    final codeCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Container(
              padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Family Circle QR & Code',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primary,
                    ),
                  ),
                  const SizedBox(height: 14),

                  // 3-Segment Tab Bar
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceContainerHigh,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.all(3),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setSheetState(() => activeTab = 0),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: activeTab == 0 ? Colors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(9),
                                boxShadow: activeTab == 0
                                    ? [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 4)]
                                    : null,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.qr_code, size: 16, color: activeTab == 0 ? AppTheme.primary : AppTheme.outline),
                                  const SizedBox(width: 4),
                                  Text(
                                    'My QR',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: activeTab == 0 ? AppTheme.primary : AppTheme.outline,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setSheetState(() => activeTab = 1),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: activeTab == 1 ? Colors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(9),
                                boxShadow: activeTab == 1
                                    ? [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 4)]
                                    : null,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.camera_alt_outlined, size: 16, color: activeTab == 1 ? AppTheme.primary : AppTheme.outline),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Scan Camera',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: activeTab == 1 ? AppTheme.primary : AppTheme.outline,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setSheetState(() => activeTab = 2),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: activeTab == 2 ? Colors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(9),
                                boxShadow: activeTab == 2
                                    ? [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 4)]
                                    : null,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.keyboard, size: 16, color: activeTab == 2 ? AppTheme.primary : AppTheme.outline),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Type Code',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: activeTab == 2 ? AppTheme.primary : AppTheme.outline,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  // TAB 0: SHOW MY QR CODE
                  if (activeTab == 0) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.4)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: QrImageView(
                        data: 'EVENTFLOW:FAMILY:$_groupCode',
                        version: QrVersions.auto,
                        size: 190.0,
                        eyeStyle: const QrEyeStyle(
                          eyeShape: QrEyeShape.square,
                          color: AppTheme.primary,
                        ),
                        dataModuleStyle: const QrDataModuleStyle(
                          dataModuleShape: QrDataModuleShape.square,
                          color: AppTheme.primary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.secondary.withOpacity(0.2)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _groupCode,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2,
                              color: AppTheme.primary,
                            ),
                          ),
                          const SizedBox(width: 10),
                          IconButton(
                            icon: const Icon(Icons.copy, size: 18, color: AppTheme.secondary),
                            onPressed: () {
                              _showInfoSnackbar('Code $_groupCode copied to clipboard!');
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Hold up this QR code for your family member to scan',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        color: AppTheme.outline,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],

                  // TAB 1: SCAN CAMERA QR
                  if (activeTab == 1) ...[
                    Container(
                      height: 250,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(18),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            MobileScanner(
                              onDetect: (capture) {
                                final barcodes = capture.barcodes;
                                for (final barcode in barcodes) {
                                  if (barcode.rawValue != null) {
                                    final raw = barcode.rawValue!;
                                    final code = raw.replaceFirst('EVENTFLOW:FAMILY:', '').trim();
                                    if (code.isNotEmpty) {
                                      Navigator.pop(ctx);
                                      _joinGroupByApi(code);
                                      break;
                                    }
                                  }
                                }
                              },
                            ),
                            Container(
                              width: 180,
                              height: 180,
                              decoration: BoxDecoration(
                                border: Border.all(color: AppTheme.secondaryContainer, width: 2.5),
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Align the family QR code within the frame to join automatically',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        color: AppTheme.outline,
                      ),
                    ),
                  ],

                  // TAB 2: TYPE CODE
                  if (activeTab == 2) ...[
                    const SizedBox(height: 10),
                    TextField(
                      controller: codeCtrl,
                      textCapitalization: TextCapitalization.characters,
                      decoration: InputDecoration(
                        hintText: 'Enter 6-char code (e.g. EVF-123)',
                        hintStyle: GoogleFonts.plusJakartaSans(fontSize: 13),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppTheme.outlineVariant),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.secondary,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.link),
                      label: Text(
                        'Join Family Group',
                        style: GoogleFonts.plusJakartaSans(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                      onPressed: () async {
                        final input = codeCtrl.text.trim();
                        if (input.isNotEmpty) {
                          Navigator.pop(ctx);
                          await _joinGroupByApi(input);
                        }
                      },
                    ),
                  ],
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _joinGroupByApi(String code) async {
    try {
      final client = HttpClient()..connectionTimeout = const Duration(seconds: 3);
      final request = await client.postUrl(Uri.parse('http://127.0.0.1:5000/api/v1/family/join'));
      request.headers.set('content-type', 'application/json');
      request.add(utf8.encode(jsonEncode({
        'inviteCode': code,
        'memberName': 'Me (Phone User)',
        'relation': 'Member',
        'userId': _myUserId,
      })));
      final response = await request.close();

      if (response.statusCode == 200) {
        _showInfoSnackbar('Joined group $code successfully!');
        await _fetchBackendGroup();
      } else {
        _showInfoSnackbar('Group $code not found or invalid');
      }
    } catch (_) {
      _showInfoSnackbar('Linked with code $code in offline mock mode');
    }
  }

  void _showMyQrCodeModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Colors.white,
        title: Column(
          children: [
            Text(
              'Family Circle QR',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.w800,
                fontSize: 18,
                color: AppTheme.primary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _groupName,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppTheme.secondary,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.outlineVariant.withOpacity(0.5)),
              ),
              child: QrImageView(
                data: 'EVENTFLOW:FAMILY:$_groupCode',
                version: QrVersions.auto,
                size: 200.0,
                eyeStyle: const QrEyeStyle(
                  eyeShape: QrEyeShape.square,
                  color: AppTheme.primary,
                ),
                dataModuleStyle: const QrDataModuleStyle(
                  dataModuleShape: QrDataModuleShape.square,
                  color: AppTheme.primary,
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              'Invite Code: $_groupCode',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
                color: AppTheme.primary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Other members can point their Rahat Setu camera at this screen to instantly connect.',
              textAlign: TextAlign.center,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 11,
                color: AppTheme.outline,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            child: const Text('Close'),
            onPressed: () => Navigator.pop(ctx),
          ),
        ],
      ),
    );
  }

  void _openCameraQrScanner(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => Scaffold(
          appBar: AppBar(
            backgroundColor: AppTheme.primary,
            title: Text(
              'Scan Family QR Code',
              style: GoogleFonts.plusJakartaSans(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
              onPressed: () => Navigator.pop(ctx),
            ),
          ),
          body: Stack(
            children: [
              MobileScanner(
                onDetect: (capture) {
                  final barcodes = capture.barcodes;
                  for (final barcode in barcodes) {
                    if (barcode.rawValue != null) {
                      final raw = barcode.rawValue!;
                      final code = raw.replaceFirst('EVENTFLOW:FAMILY:', '').trim();
                      if (code.isNotEmpty) {
                        Navigator.pop(ctx);
                        _joinGroupByApi(code);
                        break;
                      }
                    }
                  }
                },
              ),
              Center(
                child: Container(
                  width: 240,
                  height: 240,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.secondaryContainer, width: 3),
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
              Positioned(
                bottom: 40,
                left: 20,
                right: 20,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Point camera at family member\'s QR code to join automatically',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToSos() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const MedicalSosScreen(),
      ),
    );
  }

  void _showInfoSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }
}

class _RadarPainter extends CustomPainter {
  final double sweepAngle;

  _RadarPainter({required this.sweepAngle});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2 - 20;

    final gridPaint = Paint()
      ..color = const Color(0xFF13365A).withOpacity(0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    for (int i = 1; i <= 3; i++) {
      final r = maxRadius * (i / 3.0);
      canvas.drawCircle(center, r, gridPaint);
    }

    final axisPaint = Paint()
      ..color = const Color(0xFF13365A).withOpacity(0.4)
      ..strokeWidth = 1.0;
    canvas.drawLine(
        Offset(center.dx, center.dy - maxRadius), Offset(center.dx, center.dy + maxRadius), axisPaint);
    canvas.drawLine(
        Offset(center.dx - maxRadius, center.dy), Offset(center.dx + maxRadius, center.dy), axisPaint);

    _drawText(canvas, 'N', Offset(center.dx - 4, center.dy - maxRadius - 14));
    _drawText(canvas, 'S', Offset(center.dx - 4, center.dy + maxRadius + 3));
    _drawText(canvas, 'E', Offset(center.dx + maxRadius + 4, center.dy - 6));
    _drawText(canvas, 'W', Offset(center.dx - maxRadius - 14, center.dy - 6));

    final sweepPaint = Paint()
      ..shader = SweepGradient(
        center: Alignment.center,
        startAngle: 0.0,
        endAngle: math.pi / 2,
        colors: [
          Colors.transparent,
          AppTheme.secondaryContainer.withOpacity(0.25),
        ],
        transform: GradientRotation(sweepAngle),
      ).createShader(Rect.fromCircle(center: center, radius: maxRadius))
      ..style = PaintingStyle.fill;

    canvas.drawCircle(center, maxRadius, sweepPaint);

    final linePaint = Paint()
      ..color = AppTheme.secondaryContainer.withOpacity(0.6)
      ..strokeWidth = 1.5;
    final edgeX = center.dx + maxRadius * math.cos(sweepAngle + math.pi / 2);
    final edgeY = center.dy + maxRadius * math.sin(sweepAngle + math.pi / 2);
    canvas.drawLine(center, Offset(edgeX, edgeY), linePaint);
  }

  void _drawText(Canvas canvas, String text, Offset offset) {
    final textPainter = TextPainter(
      text: TextSpan(
        text: text,
        style: const TextStyle(
          color: Colors.white38,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    textPainter.paint(canvas, offset);
  }

  @override
  bool shouldRepaint(covariant _RadarPainter oldDelegate) {
    return oldDelegate.sweepAngle != sweepAngle;
  }
}
