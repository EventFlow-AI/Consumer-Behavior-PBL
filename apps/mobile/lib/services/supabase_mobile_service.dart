import 'dart:convert';
import 'dart:io';

class VolunteerProfile {
  final String id;
  final String badgeCode;
  final String name;
  final String roleTitle;
  final String assignedSector;
  final String? phone;
  final bool onDuty;

  const VolunteerProfile({
    required this.id,
    required this.badgeCode,
    required this.name,
    required this.roleTitle,
    required this.assignedSector,
    this.phone,
    required this.onDuty,
  });

  factory VolunteerProfile.fromJson(Map<String, dynamic> json) {
    return VolunteerProfile(
      id: json['id']?.toString() ?? '',
      badgeCode: json['badge_code']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Volunteer',
      roleTitle: json['role_title']?.toString() ?? 'Field Marshal',
      assignedSector: json['assigned_sector']?.toString() ?? 'Sector 4',
      phone: json['phone']?.toString(),
      onDuty: json['on_duty'] == true,
    );
  }
}

class MobileSosAlertItem {
  final String id;
  final String reporterName;
  final String? phone;
  final String alertType;
  final String severity;
  final String title;
  final String description;
  final String sector;
  final String status;
  final String? assignedVolunteer;
  final DateTime createdAt;

  const MobileSosAlertItem({
    required this.id,
    required this.reporterName,
    this.phone,
    required this.alertType,
    required this.severity,
    required this.title,
    required this.description,
    required this.sector,
    required this.status,
    this.assignedVolunteer,
    required this.createdAt,
  });

  factory MobileSosAlertItem.fromJson(Map<String, dynamic> json) {
    return MobileSosAlertItem(
      id: json['id']?.toString() ?? '',
      reporterName: json['reporter_name']?.toString() ?? 'Pilgrim',
      phone: json['phone']?.toString(),
      alertType: json['alert_type']?.toString() ?? 'SOS_ALARM',
      severity: json['severity']?.toString() ?? 'HIGH',
      title: json['title']?.toString() ?? 'Emergency Alert',
      description: json['description']?.toString() ?? '',
      sector: json['sector']?.toString() ?? 'Sector 4',
      status: json['status']?.toString() ?? 'OPEN',
      assignedVolunteer: json['assigned_volunteer']?.toString(),
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ??
          DateTime.now(),
    );
  }
}

class MobileFacilityReportItem {
  final String id;
  final String facilityId;
  final String facilityName;
  final String facilityType;
  final String? sector;
  final String issueType;
  final String? reporterPhone;
  final String status;
  final String? handledBy;
  final DateTime createdAt;

  const MobileFacilityReportItem({
    required this.id,
    required this.facilityId,
    required this.facilityName,
    required this.facilityType,
    this.sector,
    required this.issueType,
    this.reporterPhone,
    required this.status,
    this.handledBy,
    required this.createdAt,
  });

  factory MobileFacilityReportItem.fromJson(Map<String, dynamic> json) {
    return MobileFacilityReportItem(
      id: json['id']?.toString() ?? '',
      facilityId: json['facility_id']?.toString() ?? '',
      facilityName: json['facility_name']?.toString() ?? 'Facility',
      facilityType: json['facility_type']?.toString() ?? 'WATER_WC',
      sector: json['sector']?.toString(),
      issueType: json['issue_type']?.toString() ?? 'Issue',
      reporterPhone: json['reporter_phone']?.toString(),
      status: json['status']?.toString() ?? 'OPEN',
      handledBy: json['handled_by']?.toString(),
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ??
          DateTime.now(),
    );
  }
}

class MobileQueueGateItem {
  final String id;
  final String name;
  final String sector;
  final String category;
  final int waitMinutes;
  final int walkDistanceMeters;
  final int walkMinutes;
  final int activeLanes;
  final int totalLanes;
  final int throughputPerMin;
  final double capacityRatio;
  final String trend;
  final bool isFastest;
  final bool isRampAccessible;
  final List<String> directions;

  const MobileQueueGateItem({
    required this.id,
    required this.name,
    required this.sector,
    required this.category,
    required this.waitMinutes,
    required this.walkDistanceMeters,
    required this.walkMinutes,
    required this.activeLanes,
    required this.totalLanes,
    required this.throughputPerMin,
    required this.capacityRatio,
    required this.trend,
    required this.isFastest,
    required this.isRampAccessible,
    required this.directions,
  });

  factory MobileQueueGateItem.fromJson(Map<String, dynamic> json) {
    final rawDirs = json['directions'];
    final dirs = rawDirs is List
        ? rawDirs.map((e) => e.toString()).toList()
        : <String>[];

    return MobileQueueGateItem(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Gate',
      sector: json['sector']?.toString() ?? 'Sector 4',
      category: json['category']?.toString() ?? 'general',
      waitMinutes: (json['wait_minutes'] as num?)?.toInt() ?? 5,
      walkDistanceMeters:
          (json['walk_distance_meters'] as num?)?.toInt() ?? 150,
      walkMinutes: (json['walk_minutes'] as num?)?.toInt() ?? 2,
      activeLanes: (json['active_lanes'] as num?)?.toInt() ?? 1,
      totalLanes: (json['total_lanes'] as num?)?.toInt() ?? 1,
      throughputPerMin: (json['throughput_per_min'] as num?)?.toInt() ?? 40,
      capacityRatio: (json['capacity_ratio'] as num?)?.toDouble() ?? 0.35,
      trend: json['trend']?.toString() ?? 'stable',
      isFastest: json['is_fastest'] == true,
      isRampAccessible: json['is_ramp_accessible'] == true,
      directions: dirs,
    );
  }
}

class SupabaseMobileService {
  SupabaseMobileService._();
  static final SupabaseMobileService instance = SupabaseMobileService._();

  static const String _supabaseUrl =
      'https://gydjwmvxxpbistzyrqoz.supabase.co';
  static const String _publishableKey =
      'sb_publishable_QeoHCSo-0nJvI49hXPBzVA_bwTe3moS';

  String currentVisitorName = 'Pilgrim';
  String? currentPhone;

  void setVisitorSession({String? phone, bool isGuest = false}) {
    final trimmed = phone?.trim();
    if (trimmed != null && trimmed.isNotEmpty) {
      currentPhone = trimmed;
      currentVisitorName = isGuest ? 'Pilgrim (Guest)' : 'Pilgrim $trimmed';
    } else {
      currentPhone = null;
      currentVisitorName = isGuest ? 'Pilgrim (Guest)' : 'Pilgrim';
    }
  }

  Future<dynamic> _request(
    String method,
    String path, {
    Object? body,
    bool preferReturn = false,
  }) async {
    final client = HttpClient();
    client.connectionTimeout = const Duration(seconds: 8);
    try {
      final uri = Uri.parse('$_supabaseUrl/rest/v1/$path');
      final request = await client.openUrl(method, uri).timeout(
            const Duration(seconds: 8),
          );
      request.headers.set('apikey', _publishableKey);
      request.headers.set('Content-Type', 'application/json');
      if (preferReturn) {
        request.headers.set('Prefer', 'return=representation');
      }

      if (body != null) {
        final bytes = utf8.encode(jsonEncode(body));
        request.add(bytes);
      }

      final response = await request.close().timeout(
            const Duration(seconds: 10),
          );
      final responseBody = await utf8.decoder.bind(response).join();
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException(
          'Supabase error (${response.statusCode}): $responseBody',
          uri: uri,
        );
      }
      if (responseBody.trim().isEmpty) {
        return null;
      }
      return jsonDecode(responseBody);
    } finally {
      client.close(force: true);
    }
  }

  Future<String?> createSosAlert({
    required String alertType,
    required String severity,
    required String title,
    required String description,
    String sector = 'Sector 4, North Pathway Ramp (Pole #E-42)',
    double? latitude,
    double? longitude,
  }) async {
    final data = await _request(
      'POST',
      'mobile_sos_alerts',
      preferReturn: true,
      body: {
        'reporter_name': currentVisitorName,
        'phone': currentPhone,
        'alert_type': alertType,
        'severity': severity,
        'title': title,
        'description': description,
        'sector': sector,
        'latitude': ?latitude,
        'longitude': ?longitude,
        'status': 'OPEN',
      },
    );

    if (data is List && data.isNotEmpty && data.first is Map) {
      return (data.first as Map)['id']?.toString();
    }
    return null;
  }

  Future<void> updateSosAlertStatus(
    String id, {
    required String status,
    String? assignedVolunteer,
  }) async {
    await _request(
      'PATCH',
      'mobile_sos_alerts?id=eq.${Uri.encodeComponent(id)}',
      body: {
        'status': status,
        'assigned_volunteer': ?assignedVolunteer,
        'updated_at': DateTime.now().toUtc().toIso8601String(),
      },
    );
  }

  Future<List<MobileSosAlertItem>> fetchSosAlerts() async {
    final data = await _request(
      'GET',
      'mobile_sos_alerts?select=*&order=created_at.desc',
    );
    if (data is! List) return const [];
    return data
        .whereType<Map<String, dynamic>>()
        .map(MobileSosAlertItem.fromJson)
        .toList();
  }

  Future<void> createFacilityReport({
    required String facilityId,
    required String facilityName,
    required String facilityType,
    String? sector,
    required String issueType,
  }) async {
    await _request(
      'POST',
      'mobile_facility_reports',
      body: {
        'facility_id': facilityId,
        'facility_name': facilityName,
        'facility_type': facilityType,
        'sector': sector,
        'issue_type': issueType,
        'reporter_phone': currentPhone ?? currentVisitorName,
        'status': 'OPEN',
      },
    );
  }

  Future<List<MobileFacilityReportItem>> fetchFacilityReports() async {
    final data = await _request(
      'GET',
      'mobile_facility_reports?select=*&order=created_at.desc',
    );
    if (data is! List) return const [];
    return data
        .whereType<Map<String, dynamic>>()
        .map(MobileFacilityReportItem.fromJson)
        .toList();
  }

  Future<void> updateFacilityReportStatus(
    String id, {
    required String status,
    String? handledBy,
  }) async {
    await _request(
      'PATCH',
      'mobile_facility_reports?id=eq.${Uri.encodeComponent(id)}',
      body: {
        'status': status,
        'handled_by': ?handledBy,
        'updated_at': DateTime.now().toUtc().toIso8601String(),
      },
    );
  }

  Future<List<MobileQueueGateItem>> fetchQueueGates() async {
    final data = await _request(
      'GET',
      'mobile_queue_gates?select=*&order=wait_minutes.asc',
    );
    if (data is! List) return const [];
    return data
        .whereType<Map<String, dynamic>>()
        .map(MobileQueueGateItem.fromJson)
        .toList();
  }

  Future<void> updateQueueGate(
    String id, {
    required int waitMinutes,
    required int activeLanes,
    required String trend,
  }) async {
    final ratio = (waitMinutes / 50.0).clamp(0.05, 1.0);
    await _request(
      'PATCH',
      'mobile_queue_gates?id=eq.${Uri.encodeComponent(id)}',
      body: {
        'wait_minutes': waitMinutes,
        'active_lanes': activeLanes,
        'trend': trend,
        'capacity_ratio': double.parse(ratio.toStringAsFixed(2)),
        'updated_at': DateTime.now().toUtc().toIso8601String(),
      },
    );
  }

  Future<void> createQuietReservation({
    required String visitorName,
    required int peopleCount,
    String zoneName = 'Dashashwamedh Sector Amphitheatre',
    String eventTitle = 'Maha Ganga Aarti',
  }) async {
    await _request(
      'POST',
      'mobile_quiet_reservations',
      body: {
        'visitor_name': visitorName,
        'people_count': peopleCount,
        'zone_name': zoneName,
        'event_title': eventTitle,
        'status': 'CONFIRMED',
      },
    );
  }

  Future<VolunteerProfile?> authenticateVolunteer({
    required String badgeCode,
    required String pin,
  }) async {
    final code = badgeCode.trim().toUpperCase();
    final trimmedPin = pin.trim();
    final data = await _request(
      'GET',
      'mobile_volunteers?badge_code=eq.${Uri.encodeComponent(code)}&pin=eq.${Uri.encodeComponent(trimmedPin)}&select=*',
    );
    if (data is List && data.isNotEmpty && data.first is Map<String, dynamic>) {
      return VolunteerProfile.fromJson(data.first as Map<String, dynamic>);
    }
    return null;
  }
}
