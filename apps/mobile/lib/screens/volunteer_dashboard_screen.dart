import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_mobile_service.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';

class VolunteerDashboardScreen extends StatefulWidget {
  final VolunteerProfile volunteer;

  const VolunteerDashboardScreen({super.key, required this.volunteer});

  @override
  State<VolunteerDashboardScreen> createState() =>
      _VolunteerDashboardScreenState();
}

class _VolunteerDashboardScreenState extends State<VolunteerDashboardScreen> {
  final _service = SupabaseMobileService.instance;

  List<MobileSosAlertItem> _sosAlerts = const [];
  List<MobileFacilityReportItem> _facilityReports = const [];
  List<MobileQueueGateItem> _queueGates = const [];
  bool _loading = true;
  String? _error;
  String? _busyId;

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final results = await Future.wait([
        _service.fetchSosAlerts(),
        _service.fetchFacilityReports(),
        _service.fetchQueueGates(),
      ]);

      if (!mounted) return;
      setState(() {
        _sosAlerts = results[0] as List<MobileSosAlertItem>;
        _facilityReports = results[1] as List<MobileFacilityReportItem>;
        _queueGates = results[2] as List<MobileQueueGateItem>;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Unable to reach Supabase: $e';
      });
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _updateSos(MobileSosAlertItem alert, String status) async {
    setState(() => _busyId = alert.id);
    try {
      await _service.updateSosAlertStatus(
        alert.id,
        status: status,
        assignedVolunteer:
            '${widget.volunteer.name} (${widget.volunteer.badgeCode})',
      );
      await _loadAll();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Alert marked $status (synced to Admin Dashboard).'),
          backgroundColor: AppTheme.secondary,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update alert: $e'),
          backgroundColor: AppTheme.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _busyId = null);
    }
  }

  Future<void> _updateFacility(
    MobileFacilityReportItem report,
    String status,
  ) async {
    setState(() => _busyId = report.id);
    try {
      await _service.updateFacilityReportStatus(
        report.id,
        status: status,
        handledBy: '${widget.volunteer.name} (${widget.volunteer.badgeCode})',
      );
      await _loadAll();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Facility report marked $status.'),
          backgroundColor: AppTheme.secondary,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update report: $e'),
          backgroundColor: AppTheme.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _busyId = null);
    }
  }

  Future<void> _adjustGate(
    MobileQueueGateItem gate, {
    int waitDelta = 0,
    int laneDelta = 0,
    String? newTrend,
  }) async {
    setState(() => _busyId = gate.id);
    try {
      final nextWait = (gate.waitMinutes + waitDelta).clamp(0, 180);
      final nextLanes = (gate.activeLanes + laneDelta).clamp(
        0,
        gate.totalLanes,
      );
      await _service.updateQueueGate(
        gate.id,
        waitMinutes: nextWait,
        activeLanes: nextLanes,
        trend: newTrend ?? gate.trend,
      );
      await _loadAll();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update gate: $e'),
          backgroundColor: AppTheme.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _busyId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final openSos = _sosAlerts
        .where((a) => a.status == 'OPEN' || a.status == 'DISPATCHED')
        .length;
    final openReports = _facilityReports
        .where((r) => r.status != 'FIXED')
        .length;

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: AppTheme.surface,
        appBar: AppBar(
          backgroundColor: AppTheme.primary,
          foregroundColor: Colors.white,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${widget.volunteer.name} • ${widget.volunteer.badgeCode}',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Text(
                '${widget.volunteer.roleTitle} • ${widget.volunteer.assignedSector}',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: Colors.white.withValues(alpha: 0.8),
                ),
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'Refresh from Supabase',
              onPressed: _loadAll,
            ),
            IconButton(
              icon: const Icon(Icons.logout),
              tooltip: 'Sign out',
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
            ),
          ],
          bottom: TabBar(
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            indicatorColor: AppTheme.secondaryContainer,
            labelStyle: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
            tabs: [
              Tab(text: 'SOS ($openSos)'),
              Tab(text: 'Water/WC ($openReports)'),
              Tab(text: 'Gates (${_queueGates.length})'),
            ],
          ),
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.cloud_off,
                        size: 40,
                        color: AppTheme.error,
                      ),
                      const SizedBox(height: 12),
                      Text(_error!, textAlign: TextAlign.center),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadAll,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              )
            : TabBarView(
                children: [
                  _buildSosTab(),
                  _buildFacilityTab(),
                  _buildGatesTab(),
                ],
              ),
      ),
    );
  }

  Widget _buildSosTab() {
    if (_sosAlerts.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadAll,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: const [
            SizedBox(height: 60),
            Icon(Icons.verified_user, size: 48, color: AppTheme.secondary),
            SizedBox(height: 12),
            Text(
              'No active SOS alerts right now.',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
            ),
            SizedBox(height: 6),
            Text(
              'When an attendee triggers SOS or Triage on their phone, it appears here for immediate dispatch.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadAll,
      child: ListView.builder(
        padding: const EdgeInsets.all(14),
        itemCount: _sosAlerts.length,
        itemBuilder: (context, index) {
          final alert = _sosAlerts[index];
          final isBusy = _busyId == alert.id;
          final isOpen = alert.status == 'OPEN';
          final isDispatched = alert.status == 'DISPATCHED';

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: BorderSide(
                color: isOpen
                    ? AppTheme.error.withValues(alpha: 0.5)
                    : AppTheme.surfaceContainerHigh,
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: isOpen
                              ? const Color(0xFFFFDAD6)
                              : isDispatched
                              ? const Color(0xFFFEF3C7)
                              : const Color(0xFFD3F8E8),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${alert.status} • ${alert.severity}',
                          style: GoogleFonts.inter(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w800,
                            color: isOpen
                                ? AppTheme.error
                                : isDispatched
                                ? const Color(0xFF92400E)
                                : AppTheme.secondary,
                          ),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        alert.alertType,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    alert.title,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    alert.description,
                    style: GoogleFonts.inter(
                      fontSize: 12.5,
                      color: AppTheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Reporter: ${alert.reporterName} • ${alert.sector}',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primary,
                    ),
                  ),
                  if (alert.assignedVolunteer != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Assigned: ${alert.assignedVolunteer}',
                      style: GoogleFonts.inter(
                        fontSize: 11.5,
                        color: AppTheme.secondary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      if (isOpen)
                        Expanded(
                          child: ElevatedButton(
                            onPressed: isBusy
                                ? null
                                : () => _updateSos(alert, 'DISPATCHED'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primary,
                              foregroundColor: Colors.white,
                            ),
                            child: const Text('Acknowledge & Dispatch'),
                          ),
                        ),
                      if (isOpen) const SizedBox(width: 8),
                      if (isOpen || isDispatched)
                        Expanded(
                          child: OutlinedButton(
                            onPressed: isBusy
                                ? null
                                : () => _updateSos(alert, 'RESOLVED'),
                            child: const Text('Mark Resolved'),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFacilityTab() {
    if (_facilityReports.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadAll,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: const [
            SizedBox(height: 60),
            Icon(Icons.water_drop_outlined, size: 48, color: AppTheme.primary),
            SizedBox(height: 12),
            Text(
              'No Water or Restroom reports yet.',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadAll,
      child: ListView.builder(
        padding: const EdgeInsets.all(14),
        itemCount: _facilityReports.length,
        itemBuilder: (context, index) {
          final report = _facilityReports[index];
          final isBusy = _busyId == report.id;
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          report.facilityName,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primary,
                          ),
                        ),
                      ),
                      Chip(
                        label: Text(
                          report.status,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    'Issue: ${report.issueType} • ${report.sector ?? "Sector 4"}',
                    style: GoogleFonts.inter(
                      fontSize: 12.5,
                      color: AppTheme.onSurfaceVariant,
                    ),
                  ),
                  if (report.handledBy != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Handled by: ${report.handledBy}',
                      style: GoogleFonts.inter(
                        fontSize: 11.5,
                        color: AppTheme.secondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                  if (report.status != 'FIXED') ...[
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        if (report.status == 'OPEN')
                          Expanded(
                            child: ElevatedButton(
                              onPressed: isBusy
                                  ? null
                                  : () =>
                                      _updateFacility(report, 'IN_PROGRESS'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                foregroundColor: Colors.white,
                              ),
                              child: const Text('Take Issue'),
                            ),
                          ),
                        if (report.status == 'OPEN') const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: isBusy
                                ? null
                                : () => _updateFacility(report, 'FIXED'),
                            child: const Text('Mark Fixed'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildGatesTab() {
    return RefreshIndicator(
      onRefresh: _loadAll,
      child: ListView.builder(
        padding: const EdgeInsets.all(14),
        itemCount: _queueGates.length,
        itemBuilder: (context, index) {
          final gate = _queueGates[index];
          final isBusy = _busyId == gate.id;
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    gate.name,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primary,
                    ),
                  ),
                  Text(
                    '${gate.sector} • ${gate.category.toUpperCase()} • Trend: ${gate.trend}',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      color: AppTheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Wait: ${gate.waitMinutes} min',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                      IconButton(
                        onPressed: isBusy
                            ? null
                            : () => _adjustGate(gate, waitDelta: -2),
                        icon: const Icon(Icons.remove_circle_outline),
                      ),
                      IconButton(
                        onPressed: isBusy
                            ? null
                            : () => _adjustGate(gate, waitDelta: 2),
                        icon: const Icon(Icons.add_circle_outline),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Lanes: ${gate.activeLanes}/${gate.totalLanes}',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                      IconButton(
                        onPressed: isBusy
                            ? null
                            : () => _adjustGate(gate, laneDelta: -1),
                        icon: const Icon(Icons.remove_circle_outline),
                      ),
                      IconButton(
                        onPressed: isBusy
                            ? null
                            : () => _adjustGate(gate, laneDelta: 1),
                        icon: const Icon(Icons.add_circle_outline),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

