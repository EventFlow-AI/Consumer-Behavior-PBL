import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

enum QueueCategory {
  general('General Entry', Icons.door_front_door),
  senior('Senior & Divyangjan', Icons.accessible),
  vip('VIP / Pass Holders', Icons.stars),
  prasad('Prasadam / Food', Icons.restaurant);

  final String label;
  final IconData icon;
  const QueueCategory(this.label, this.icon);
}

class QueueGateInfo {
  final String id;
  final String name;
  final String sector;
  final int waitMinutes;
  final int walkDistanceMeters;
  final int walkMinutes;
  final int activeLanes;
  final int totalLanes;
  final int throughputPerMin;
  final double capacityRatio; // 0.0 to 1.0
  final String trend; // 'falling', 'stable', 'rising'
  final bool isFastest;
  final bool isRampAccessible;
  final List<String> directions;

  const QueueGateInfo({
    required this.id,
    required this.name,
    required this.sector,
    required this.waitMinutes,
    required this.walkDistanceMeters,
    required this.walkMinutes,
    required this.activeLanes,
    required this.totalLanes,
    required this.throughputPerMin,
    required this.capacityRatio,
    required this.trend,
    this.isFastest = false,
    this.isRampAccessible = true,
    required this.directions,
  });

  int get totalMinutes => waitMinutes + walkMinutes;
}

class QueueRadarScreen extends StatefulWidget {
  const QueueRadarScreen({super.key});

  @override
  State<QueueRadarScreen> createState() => _QueueRadarScreenState();
}

class _QueueRadarScreenState extends State<QueueRadarScreen> {
  QueueCategory _selectedCategory = QueueCategory.general;
  bool _stepFreeOnly = false;
  String? _selectedGateId;
  String? _activeNavGateName;
  DateTime _lastUpdated = DateTime.now();
  bool _isRefreshing = false;

  final Map<QueueCategory, List<QueueGateInfo>> _mockData = {
    QueueCategory.general: [
      const QueueGateInfo(
        id: 'gate-4b',
        name: 'Gate 4-B Express Entry',
        sector: 'Dashashwamedh East Sector',
        waitMinutes: 4,
        walkDistanceMeters: 180,
        walkMinutes: 3,
        activeLanes: 8,
        totalLanes: 10,
        throughputPerMin: 95,
        capacityRatio: 0.22,
        trend: 'falling',
        isFastest: true,
        isRampAccessible: true,
        directions: [
          'Head East along Sector 4 Promenade for 80m',
          'Pass the Sector 4 Medical Kiosk on your left',
          'Turn right into Express Barricade Queue 4-B',
          'Scan QR / RFID at Turnstile Lane 3 or 4',
        ],
      ),
      const QueueGateInfo(
        id: 'gate-3',
        name: 'Gate 3 South Promenade',
        sector: 'South Ghat Approach',
        waitMinutes: 12,
        walkDistanceMeters: 110,
        walkMinutes: 2,
        activeLanes: 5,
        totalLanes: 6,
        throughputPerMin: 60,
        capacityRatio: 0.55,
        trend: 'stable',
        isFastest: false,
        isRampAccessible: false,
        directions: [
          'Walk south towards the clock tower for 60m',
          'Turn left at Sector 3 Water Station',
          'Join Queue Lane 2 at South Gate',
        ],
      ),
      const QueueGateInfo(
        id: 'gate-2a',
        name: 'Gate 2-A West Corridor',
        sector: 'Market Corridor Sector',
        waitMinutes: 24,
        walkDistanceMeters: 260,
        walkMinutes: 4,
        activeLanes: 4,
        totalLanes: 8,
        throughputPerMin: 45,
        capacityRatio: 0.78,
        trend: 'rising',
        isFastest: false,
        isRampAccessible: true,
        directions: [
          'Head West through the Sector 2 Bazaar walkway',
          'Proceed 200m towards the main pavilion',
          'Join queue line marked Gate 2-A',
        ],
      ),
      const QueueGateInfo(
        id: 'gate-1',
        name: 'Gate 1 Main Ghat Entry',
        sector: 'Central Amphitheatre',
        waitMinutes: 46,
        walkDistanceMeters: 70,
        walkMinutes: 1,
        activeLanes: 6,
        totalLanes: 6,
        throughputPerMin: 40,
        capacityRatio: 0.94,
        trend: 'rising',
        isFastest: false,
        isRampAccessible: false,
        directions: [
          'Walk 70m directly towards the main central arch',
          'Expect heavy compression; high crowd density warning active',
        ],
      ),
    ],
    QueueCategory.senior: [
      const QueueGateInfo(
        id: 'gate-2r',
        name: 'Ramp Gate 2-R (Divyangjan & Senior)',
        sector: 'South Barrier-Free Zone',
        waitMinutes: 2,
        walkDistanceMeters: 140,
        walkMinutes: 2,
        activeLanes: 4,
        totalLanes: 4,
        throughputPerMin: 40,
        capacityRatio: 0.15,
        trend: 'falling',
        isFastest: true,
        isRampAccessible: true,
        directions: [
          'Follow the tactile green path 90m south',
          'Enter dedicated wheelchair/senior ramp at Corridor 2-R',
          'Volunteers with mobility assistance stationed at gate entrance',
        ],
      ),
      const QueueGateInfo(
        id: 'gate-4r',
        name: 'Gate 4-R Priority Pavilion',
        sector: 'North Administrative Sector',
        waitMinutes: 6,
        walkDistanceMeters: 210,
        walkMinutes: 3,
        activeLanes: 3,
        totalLanes: 3,
        throughputPerMin: 30,
        capacityRatio: 0.35,
        trend: 'stable',
        isFastest: false,
        isRampAccessible: true,
        directions: [
          'Head north towards the Administrative Camp',
          'Dedicated battery e-rickshaw available at pickup post 4',
        ],
      ),
    ],
    QueueCategory.vip: [
      const QueueGateInfo(
        id: 'gate-vip-1',
        name: 'Gate 6 Protocol & Media Entry',
        sector: 'Riverside Enclosure',
        waitMinutes: 1,
        walkDistanceMeters: 160,
        walkMinutes: 2,
        activeLanes: 3,
        totalLanes: 4,
        throughputPerMin: 25,
        capacityRatio: 0.10,
        trend: 'stable',
        isFastest: true,
        isRampAccessible: true,
        directions: [
          'Present Digital Pass / Badge at Checkpoint 6',
          'Direct escort into VIP Reserved Balcony',
        ],
      ),
    ],
    QueueCategory.prasad: [
      const QueueGateInfo(
        id: 'food-2',
        name: 'Annakshetra Hall 2 (East)',
        sector: 'Sector 4 Service Zone',
        waitMinutes: 3,
        walkDistanceMeters: 180,
        walkMinutes: 3,
        activeLanes: 6,
        totalLanes: 6,
        throughputPerMin: 120,
        capacityRatio: 0.25,
        trend: 'falling',
        isFastest: true,
        isRampAccessible: true,
        directions: [
          'Follow dining signage 180m East of Main Amphitheatre',
          'Coupons dispensed via automated kiosk outside entrance',
        ],
      ),
      const QueueGateInfo(
        id: 'food-1',
        name: 'Main Prasad Kendra 1',
        sector: 'Central Plaza',
        waitMinutes: 22,
        walkDistanceMeters: 90,
        walkMinutes: 1,
        activeLanes: 4,
        totalLanes: 4,
        throughputPerMin: 50,
        capacityRatio: 0.85,
        trend: 'rising',
        isFastest: false,
        isRampAccessible: false,
        directions: [
          'Walk 90m towards the Central Bell',
          'Long serpentine queue; Hall 2 is recommended instead',
        ],
      ),
    ],
  };

  @override
  void initState() {
    super.initState();
    final gates = _currentGates;
    if (gates.isNotEmpty) {
      _selectedGateId = gates.first.id;
    }
  }

  List<QueueGateInfo> get _currentGates {
    final list = _mockData[_selectedCategory] ?? [];
    if (_stepFreeOnly) {
      return list.where((g) => g.isRampAccessible).toList();
    }
    return list;
  }

  String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    final s = dt.second.toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  void _refreshData() async {
    setState(() => _isRefreshing = true);
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() {
      _isRefreshing = false;
      _lastUpdated = DateTime.now();
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Queue feed refreshed from venue sensors & BLE mesh.'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _startNavigation(QueueGateInfo gate) {
    setState(() {
      _activeNavGateName = gate.name;
    });

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: const BoxDecoration(
            color: AppTheme.surfaceContainerLowest,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.outlineVariant,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.secondaryContainer,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.navigation, color: AppTheme.onSecondaryContainer, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Route to ${gate.name}',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primary,
                          ),
                        ),
                        Text(
                          '${gate.walkDistanceMeters}m walk • Est. ${gate.totalMinutes} min to enter',
                          style: GoogleFonts.inter(
                            fontSize: 12.5,
                            color: AppTheme.onSurfaceVariant,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                'Turn-by-Turn Path Guidance',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primary,
                ),
              ),
              const SizedBox(height: 12),
              ...gate.directions.asMap().entries.map((entry) {
                final idx = entry.key + 1;
                final step = entry.value;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 11,
                        backgroundColor: AppTheme.primaryContainer,
                        child: Text(
                          '$idx',
                          style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          step,
                          style: GoogleFonts.inter(fontSize: 13, color: AppTheme.onSurface, height: 1.35),
                        ),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(modalCtx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Active guidance enabled for ${gate.name}. Follow venue signs.'),
                      ),
                    );
                  },
                  icon: const Icon(Icons.check_circle_outline, size: 18),
                  label: const Text('Start Walking Guidance'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final gates = _currentGates;
    final fastestGate = gates.isNotEmpty ? gates.reduce((a, b) => a.totalMinutes < b.totalMinutes ? a : b) : null;

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        backgroundColor: AppTheme.surface.withValues(alpha: 0.95),
        elevation: 0,
        centerTitle: false,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Queue Radar',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.primary,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.secondaryContainer,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppTheme.secondary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'LIVE',
                        style: GoogleFonts.inter(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.onSecondaryContainer,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            Text(
              'Updated ${_formatTime(_lastUpdated)} • BLE Mesh Telemetry',
              style: GoogleFonts.inter(fontSize: 11, color: AppTheme.onSurfaceVariant),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh queue feeds',
            icon: _isRefreshing
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh, color: AppTheme.primary),
            onPressed: _isRefreshing ? null : _refreshData,
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Active Navigation alert banner if active
                  if (_activeNavGateName != null) ...[
                    _buildActiveNavigationBanner(),
                    const SizedBox(height: 12),
                  ],

                  // Origin Location Card
                  _buildOriginLocationCard(),
                  const SizedBox(height: 14),

                  // Category Selector Chips
                  _buildCategoryChips(),
                  const SizedBox(height: 10),

                  // Step-free Accessibility Toggle
                  _buildAccessibilityToggle(),
                  const SizedBox(height: 16),

                  // Hero Best Recommendation Card
                  if (fastestGate != null) ...[
                    _buildHeroFastestCard(fastestGate),
                    const SizedBox(height: 20),
                  ],

                  // Gate Comparison Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'All Gates in Sector (${gates.length})',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primary,
                        ),
                      ),
                      Text(
                        'Sorted by Total Time',
                        style: GoogleFonts.inter(
                          fontSize: 11.5,
                          color: AppTheme.onSurfaceVariant,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Gate Comparison Cards
                  if (gates.isEmpty)
                    _buildEmptyState()
                  else
                    ...gates.map((g) => _buildGateComparisonCard(g, isRecommended: g.id == fastestGate?.id)),

                  const SizedBox(height: 24),
                  _buildCrowdInsightTip(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActiveNavigationBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppTheme.primaryContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.navigation, color: AppTheme.secondaryContainer, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Active Route: $_activeNavGateName',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          TextButton(
            onPressed: () => setState(() => _activeNavGateName = null),
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: const Size(50, 30),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              'Cancel',
              style: GoogleFonts.inter(fontSize: 12, color: AppTheme.secondaryContainer),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOriginLocationCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.surfaceContainerHigh),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.my_location, size: 18, color: AppTheme.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Current Location',
                  style: GoogleFonts.inter(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.onSurfaceVariant,
                  ),
                ),
                Text(
                  'Sector 4 Amphitheatre • Dashashwamedh',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.onSurface,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerLow,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              'GPS Acc: 4m',
              style: GoogleFonts.inter(
                fontSize: 10,
                color: AppTheme.onSurfaceVariant,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: QueueCategory.values.map((cat) {
          final isSelected = _selectedCategory == cat;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              avatar: Icon(
                cat.icon,
                size: 16,
                color: isSelected ? Colors.white : AppTheme.primary,
              ),
              label: Text(cat.label),
              selected: isSelected,
              selectedColor: AppTheme.primary,
              backgroundColor: AppTheme.surfaceContainerLowest,
              labelStyle: GoogleFonts.inter(
                fontSize: 12.5,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                color: isSelected ? Colors.white : AppTheme.onSurface,
              ),
              side: BorderSide(
                color: isSelected ? AppTheme.primary : AppTheme.outlineVariant,
              ),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              onSelected: (selected) {
                if (selected) {
                  setState(() {
                    _selectedCategory = cat;
                    final list = _currentGates;
                    _selectedGateId = list.isNotEmpty ? list.first.id : null;
                  });
                }
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildAccessibilityToggle() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.accessible_forward, size: 18, color: AppTheme.secondary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Show Step-Free / Ramp Queues Only',
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppTheme.onSurface,
              ),
            ),
          ),
          Switch.adaptive(
            value: _stepFreeOnly,
            activeTrackColor: AppTheme.secondary,
            onChanged: (val) {
              setState(() {
                _stepFreeOnly = val;
                final list = _currentGates;
                _selectedGateId = list.isNotEmpty ? list.first.id : null;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildHeroFastestCard(QueueGateInfo gate) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 14,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background subtle ambient accent
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.secondary.withValues(alpha: 0.18),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.secondaryContainer,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.bolt, size: 14, color: AppTheme.onSecondaryContainer),
                          const SizedBox(width: 3),
                          Text(
                            'FASTEST ROUTE TO ENTER',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                              color: AppTheme.onSecondaryContainer,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      'Total: ~${gate.totalMinutes} min',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.secondaryContainer,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  gate.name,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  gate.sector,
                  style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFFC4C6CE)),
                ),
                const SizedBox(height: 16),

                // Metrics Row
                Row(
                  children: [
                    Expanded(
                      child: _buildHeroMetric(
                        label: 'Queue Wait',
                        value: '${gate.waitMinutes} min',
                        icon: Icons.timer_outlined,
                        highlight: true,
                      ),
                    ),
                    Container(width: 1, height: 36, color: const Color(0x22FFFFFF)),
                    Expanded(
                      child: _buildHeroMetric(
                        label: 'Walk Distance',
                        value: '${gate.walkDistanceMeters}m',
                        icon: Icons.directions_walk,
                      ),
                    ),
                    Container(width: 1, height: 36, color: const Color(0x22FFFFFF)),
                    Expanded(
                      child: _buildHeroMetric(
                        label: 'Open Lanes',
                        value: '${gate.activeLanes}/${gate.totalLanes}',
                        icon: Icons.splitscreen,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Action Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _startNavigation(gate),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.secondaryContainer,
                      foregroundColor: AppTheme.onSecondaryContainer,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.navigation, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'Navigate to ${gate.name}',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroMetric({
    required String label,
    required String value,
    required IconData icon,
    bool highlight = false,
  }) {
    return Column(
      children: [
        Icon(icon, size: 16, color: highlight ? AppTheme.secondaryContainer : const Color(0xFFC4C6CE)),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: highlight ? AppTheme.secondaryContainer : Colors.white,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFFC4C6CE)),
        ),
      ],
    );
  }

  Widget _buildGateComparisonCard(QueueGateInfo gate, {bool isRecommended = false}) {
    final isSelected = _selectedGateId == gate.id;
    final color = _getCongestionColor(gate.capacityRatio);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected ? AppTheme.primary : AppTheme.surfaceContainerHigh,
          width: isSelected ? 1.5 : 1,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          setState(() {
            _selectedGateId = gate.id;
          });
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
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
                      color: color.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Text(
                        '${gate.waitMinutes}m',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: color,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                gate.name,
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.onSurface,
                                ),
                              ),
                            ),
                            if (isRecommended)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.secondaryContainer,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  'FASTEST',
                                  style: GoogleFonts.inter(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    color: AppTheme.onSecondaryContainer,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${gate.walkDistanceMeters}m walk (~${gate.walkMinutes} min) • Total: ~${gate.totalMinutes} min',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            color: AppTheme.onSurfaceVariant,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Queue Capacity Bar
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: gate.capacityRatio,
                  minHeight: 6,
                  backgroundColor: AppTheme.surfaceContainerHigh,
                  valueColor: AlwaysStoppedAnimation<Color>(color),
                ),
              ),
              const SizedBox(height: 8),

              // Status and Trend Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(_getTrendIcon(gate.trend), size: 14, color: _getTrendColor(gate.trend)),
                      const SizedBox(width: 4),
                      Text(
                        _getTrendLabel(gate.trend),
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: _getTrendColor(gate.trend),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '${(gate.capacityRatio * 100).toInt()}% Capacity • ${gate.throughputPerMin} ppl/min',
                    style: GoogleFonts.inter(fontSize: 11, color: AppTheme.onSurfaceVariant),
                  ),
                ],
              ),

              // Expanded details when selected
              if (isSelected) ...[
                const Divider(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${gate.activeLanes} / ${gate.totalLanes} scanning lines open',
                      style: GoogleFonts.inter(fontSize: 11.5, color: AppTheme.onSurface),
                    ),
                    ElevatedButton(
                      onPressed: () => _startNavigation(gate),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isRecommended ? AppTheme.primary : AppTheme.surfaceContainerHigh,
                        foregroundColor: isRecommended ? Colors.white : AppTheme.onSurface,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(
                        'Route Here',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCrowdInsightTip() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.surfaceContainerHigh),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.lightbulb_outline, color: AppTheme.secondary, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'EventFlow Crowd AI Tip',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Main Gate 1 typically bottlenecks 15 minutes before Ganga Aarti. Walking an extra 100m to Gate 4-B saves an average of 28 minutes in queue wait time.',
                  style: GoogleFonts.inter(fontSize: 11.5, color: AppTheme.onSurfaceVariant, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 30),
      child: Column(
        children: [
          const Icon(Icons.filter_alt_off, size: 40, color: AppTheme.outline),
          const SizedBox(height: 10),
          Text(
            'No gates match current filters',
            style: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            'Try disabling "Step-Free Ramp Queues Only" to view all gates.',
            style: GoogleFonts.inter(fontSize: 12, color: AppTheme.onSurfaceVariant),
          ),
        ],
      ),
    );
  }

  Color _getCongestionColor(double ratio) {
    if (ratio < 0.35) return AppTheme.secondary;
    if (ratio < 0.70) return const Color(0xFFC68A00); // Amber
    return AppTheme.error;
  }

  IconData _getTrendIcon(String trend) {
    switch (trend) {
      case 'falling':
        return Icons.trending_down;
      case 'rising':
        return Icons.trending_up;
      default:
        return Icons.trending_flat;
    }
  }

  Color _getTrendColor(String trend) {
    switch (trend) {
      case 'falling':
        return AppTheme.secondary;
      case 'rising':
        return AppTheme.error;
      default:
        return AppTheme.onSurfaceVariant;
    }
  }

  String _getTrendLabel(String trend) {
    switch (trend) {
      case 'falling':
        return 'Wait time clearing';
      case 'rising':
        return 'Queue growing';
      default:
        return 'Steady flow';
    }
  }
}
