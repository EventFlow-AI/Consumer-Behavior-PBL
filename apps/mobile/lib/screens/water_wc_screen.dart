import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_mobile_service.dart';
import '../theme/app_theme.dart';

enum WaterWcCategory {
  all('All Facilities', Icons.grid_view),
  waterAtm('Water ATMs', Icons.local_drink),
  restrooms('Restrooms / Toilets', Icons.wc);

  final String label;
  final IconData icon;
  const WaterWcCategory(this.label, this.icon);
}

class WaterWcFacility {
  final String id;
  final String name;
  final WaterWcCategory category;
  final String location;
  final int distanceMeters;
  final int walkMinutes;
  final String status;
  final Color statusColor;
  final String availabilityLabel;
  final double cleanlinessRating;
  final bool isRampAccessible;
  final String? waterSpec; // E.g., 'RO Chilled • TDS 62 ppm'
  final String? stallSpec; // E.g., '6 Western, 8 Indian, 2 Divyang'
  final List<String> directions;

  const WaterWcFacility({
    required this.id,
    required this.name,
    required this.category,
    required this.location,
    required this.distanceMeters,
    required this.walkMinutes,
    required this.status,
    required this.statusColor,
    required this.availabilityLabel,
    required this.cleanlinessRating,
    this.isRampAccessible = true,
    this.waterSpec,
    this.stallSpec,
    required this.directions,
  });
}

class WaterWcScreen extends StatefulWidget {
  final WaterWcCategory initialCategory;

  const WaterWcScreen({
    super.key,
    this.initialCategory = WaterWcCategory.all,
  });

  @override
  State<WaterWcScreen> createState() => _WaterWcScreenState();
}

class _WaterWcScreenState extends State<WaterWcScreen> {
  late WaterWcCategory _selectedCategory;
  String _searchQuery = '';
  final Set<String> _reportedFacilityIds = {};

  // Realistic mock data clearly structured for Maha Kumbh Sector 4
  final List<WaterWcFacility> _mockFacilities = const [
    // Water ATMs
    WaterWcFacility(
      id: 'water-c8',
      name: 'Clean Point RO Water ATM C-8',
      category: WaterWcCategory.waterAtm,
      location: 'Sector 4 Promenade • Near Pillar C-8',
      distanceMeters: 40,
      walkMinutes: 1,
      status: '100% Operational',
      statusColor: AppTheme.secondary,
      availabilityLabel: 'Zero Wait • 4 Taps Active',
      cleanlinessRating: 4.9,
      isRampAccessible: true,
      waterSpec: 'RO Chilled (18°C) • TDS 62 ppm • UV Treated',
      directions: [
        'Head South along Sector 4 main passage for 30m',
        'Turn slightly left at illuminated signage pole C-8',
        'Water ATM dispensing counter is right beside the aid booth',
      ],
    ),
    WaterWcFacility(
      id: 'water-gate3',
      name: 'Seva Water Dispenser Gate 3',
      category: WaterWcCategory.waterAtm,
      location: 'Ganga Ghat Ramp 3 • South Approach',
      distanceMeters: 130,
      walkMinutes: 2,
      status: 'High Flow',
      statusColor: AppTheme.secondary,
      availabilityLabel: 'Free Continuous Flow',
      cleanlinessRating: 4.7,
      isRampAccessible: true,
      waterSpec: 'Filtered Ambient Water • 6 Dispensing Points',
      directions: [
        'Walk towards Ghat Gate 3 ramp',
        'Follow the blue floor guide marks for 100m',
        'Located adjacent to the life jacket counter',
      ],
    ),
    WaterWcFacility(
      id: 'water-annakshetra',
      name: 'Annakshetra Hydration Station 2',
      category: WaterWcCategory.waterAtm,
      location: 'Sector 4 Dining Tent • Zone B',
      distanceMeters: 210,
      walkMinutes: 3,
      status: 'Moderate Rush',
      statusColor: Color(0xFFC68A00),
      availabilityLabel: '2 min estimated queue',
      cleanlinessRating: 4.6,
      isRampAccessible: true,
      waterSpec: 'Cooling Misting & ORS Salt Packets Available',
      directions: [
        'Follow signs towards Annakshetra Hall 2',
        'Enter shaded corridor on the right side',
        'Station is situated under yellow canopy',
      ],
    ),

    // Restrooms / Toilets
    WaterWcFacility(
      id: 'wc-c8',
      name: 'Eco-Smart Restroom Complex C-8',
      category: WaterWcCategory.restrooms,
      location: 'Sector 4 • Behind Pillar C-8',
      distanceMeters: 80,
      walkMinutes: 1,
      status: '4 Stalls Free',
      statusColor: AppTheme.secondary,
      availabilityLabel: 'Cleaned 6 mins ago',
      cleanlinessRating: 4.8,
      isRampAccessible: true,
      stallSpec: '8 Indian • 6 Western • 2 Divyangjan • Running Water 24x7',
      directions: [
        'Walk 50m straight past Food Kiosk 4',
        'Turn right at green Restroom directional sign',
        'Entrance with ramp access is on the left side',
      ],
    ),
    WaterWcFacility(
      id: 'wc-ghat-ramp',
      name: 'Ghat North Restroom Hub #7',
      category: WaterWcCategory.restrooms,
      location: 'Sector 4 Ghat Approach • Near Watchtower 2',
      distanceMeters: 160,
      walkMinutes: 2,
      status: '3 Stalls Free',
      statusColor: AppTheme.secondary,
      availabilityLabel: 'Attendant on duty',
      cleanlinessRating: 4.5,
      isRampAccessible: true,
      stallSpec: '10 Male • 10 Female • Child changing station',
      directions: [
        'Walk along ghat brick pathway toward Watchtower 2',
        'Pass barrier control desk',
        'Restrooms are located in the permanent pavilion block',
      ],
    ),
    WaterWcFacility(
      id: 'wc-bridge-exit',
      name: 'Pontoon Bridge Exit Washroom Block',
      category: WaterWcCategory.restrooms,
      location: 'Sector 4 Exit Corridor • Pontoon Bridge 3',
      distanceMeters: 290,
      walkMinutes: 4,
      status: 'High Footfall',
      statusColor: Color(0xFFC68A00),
      availabilityLabel: '3 min wait • Regular sanitization',
      cleanlinessRating: 4.2,
      isRampAccessible: false,
      stallSpec: '12 Standard units • Continuous ventilation',
      directions: [
        'Head towards Pontoon Bridge 3 exit channel',
        'Move along pedestrian return route for 250m',
        'Washrooms are stationed along right embankment',
      ],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
  }

  List<WaterWcFacility> get _filteredFacilities {
    return _mockFacilities.where((facility) {
      final matchesCategory = _selectedCategory == WaterWcCategory.all ||
          facility.category == _selectedCategory;
      final matchesSearch = _searchQuery.isEmpty ||
          facility.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          facility.location.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
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
              'Water & Restrooms',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: AppTheme.primary,
              ),
            ),
            Text(
              'Sector 4 • Cleanliness & Availability',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: AppTheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.primary),
            tooltip: 'Refresh Status',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Refreshed facility statuses (Demo Data).'),
                  duration: Duration(seconds: 1),
                ),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            _buildDemoNoticeBanner(),
            _buildSearchBar(),
            _buildCategoryFilterPills(),
            Expanded(
              child: _filteredFacilities.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      itemCount: _filteredFacilities.length,
                      itemBuilder: (context, index) {
                        final facility = _filteredFacilities[index];
                        return _buildFacilityCard(facility);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  // Demo status disclaimer banner
  Widget _buildDemoNoticeBanner() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.surfaceContainerHighest),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, size: 16, color: AppTheme.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'DEMO MODE: Showing simulated Sector 4 Water ATMs and Restrooms for PBL prototype testing.',
              style: GoogleFonts.inter(
                fontSize: 10.5,
                fontWeight: FontWeight.w500,
                color: AppTheme.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: TextField(
        onChanged: (val) {
          setState(() {
            _searchQuery = val.trim();
          });
        },
        decoration: InputDecoration(
          hintText: 'Search by facility, pillar or area...',
          hintStyle: GoogleFonts.inter(fontSize: 13, color: AppTheme.onSurfaceVariant),
          prefixIcon: const Icon(Icons.search, size: 20, color: AppTheme.primary),
          filled: true,
          fillColor: AppTheme.surfaceContainerLow,
          contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryFilterPills() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Row(
        children: WaterWcCategory.values.map((category) {
          final isSelected = _selectedCategory == category;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              avatar: Icon(
                category.icon,
                size: 16,
                color: isSelected ? Colors.white : AppTheme.primary,
              ),
              label: Text(category.label),
              selected: isSelected,
              selectedColor: AppTheme.primaryContainer,
              backgroundColor: AppTheme.surfaceContainerLowest,
              labelStyle: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: isSelected ? Colors.white : AppTheme.onSurface,
              ),
              side: BorderSide(
                color: isSelected ? Colors.transparent : AppTheme.surfaceContainerHigh,
              ),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              onSelected: (selected) {
                if (selected) {
                  setState(() {
                    _selectedCategory = category;
                  });
                }
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildFacilityCard(WaterWcFacility facility) {
    final isWater = facility.category == WaterWcCategory.waterAtm;
    final isReported = _reportedFacilityIds.contains(facility.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isReported ? const Color(0xFFFFBA38) : AppTheme.surfaceContainerHigh,
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
        onTap: () => _showFacilityDetailsBottomSheet(facility),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Row: Icon + Name + Distance
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isWater ? const Color(0xFFE2E7FF) : const Color(0xFFD3F8E8),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      isWater ? Icons.local_drink : Icons.wc,
                      color: isWater ? AppTheme.primary : AppTheme.secondary,
                      size: 22,
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
                            fontSize: 14.5,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          facility.location,
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            color: AppTheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceContainerLow,
                          borderRadius: BorderRadius.circular(10),
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
                          fontSize: 10,
                          color: AppTheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Status / Badges Strip
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: facility.statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 5,
                          height: 5,
                          decoration: BoxDecoration(
                            color: facility.statusColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          facility.status,
                          style: GoogleFonts.inter(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            color: facility.statusColor,
                          ),
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
                      facility.availabilityLabel,
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                  if (facility.isRampAccessible)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.accessible, size: 12, color: AppTheme.secondary),
                          const SizedBox(width: 3),
                          Text(
                            'Step-free ramp',
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              color: AppTheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (isReported)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF3CD),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Demo Issue Logged',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF856404),
                        ),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 12),
              const Divider(height: 1, color: AppTheme.surfaceContainerHigh),
              const SizedBox(height: 8),

              // Action buttons (Details / Report / Directions)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton.icon(
                    onPressed: () => _showReportIssueDialog(facility),
                    icon: const Icon(Icons.report_problem_outlined, size: 15, color: AppTheme.onSurfaceVariant),
                    label: Text(
                      'Report Issue',
                      style: GoogleFonts.inter(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.onSurfaceVariant,
                      ),
                    ),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      minimumSize: const Size(48, 36),
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _showDirectionsDialog(facility),
                    icon: const Icon(Icons.navigation, size: 14, color: Colors.white),
                    label: Text(
                      'Get Directions',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryContainer,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      minimumSize: const Size(48, 36),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Facility Details Modal Bottom Sheet
  void _showFacilityDetailsBottomSheet(WaterWcFacility facility) {
    final isWater = facility.category == WaterWcCategory.waterAtm;

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
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
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: isWater ? const Color(0xFFE2E7FF) : const Color(0xFFD3F8E8),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      isWater ? Icons.local_drink : Icons.wc,
                      color: isWater ? AppTheme.primary : AppTheme.secondary,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          facility.name,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primary,
                          ),
                        ),
                        Text(
                          facility.location,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppTheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    _buildDetailRow(
                      icon: Icons.check_circle_outline,
                      title: 'Live Operational Status',
                      value: facility.status,
                      valueColor: facility.statusColor,
                    ),
                    const Divider(height: 14, color: AppTheme.surfaceContainerHigh),
                    _buildDetailRow(
                      icon: Icons.directions_walk,
                      title: 'Distance / Walk Time',
                      value: '${facility.distanceMeters}m (${facility.walkMinutes} min walk)',
                    ),
                    const Divider(height: 14, color: AppTheme.surfaceContainerHigh),
                    _buildDetailRow(
                      icon: Icons.star_border,
                      title: 'Pilgrim Hygiene Score',
                      value: '${facility.cleanlinessRating} / 5.0 ★',
                      valueColor: AppTheme.secondary,
                    ),
                    if (facility.waterSpec != null) ...[
                      const Divider(height: 14, color: AppTheme.surfaceContainerHigh),
                      _buildDetailRow(
                        icon: Icons.water,
                        title: 'Water Purity & Specs',
                        value: facility.waterSpec!,
                      ),
                    ],
                    if (facility.stallSpec != null) ...[
                      const Divider(height: 14, color: AppTheme.surfaceContainerHigh),
                      _buildDetailRow(
                        icon: Icons.meeting_room,
                        title: 'Stall & Divyangjan Specs',
                        value: facility.stallSpec!,
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        _showReportIssueDialog(facility);
                      },
                      icon: const Icon(Icons.flag_outlined, size: 16),
                      label: const Text('Report Issue'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        _showDirectionsDialog(facility);
                      },
                      icon: const Icon(Icons.navigation, size: 16, color: Colors.white),
                      label: const Text('Get Directions'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryContainer,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String title,
    required String value,
    Color? valueColor,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: AppTheme.onSurfaceVariant),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppTheme.onSurfaceVariant,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: valueColor ?? AppTheme.primary,
            ),
          ),
        ),
      ],
    );
  }

  // Get Directions Modal Dialog with clear DEMO navigation label
  void _showDirectionsDialog(WaterWcFacility facility) {
    showDialog<void>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.alt_route, color: AppTheme.secondary),
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
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.info, size: 15, color: Color(0xFF856404)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Demo Navigation: Live GPS routing is simulated. Follow sector waypoints below.',
                          style: GoogleFonts.inter(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF856404),
                          ),
                        ),
                      ),
                    ],
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
                            color: AppTheme.surfaceContainerHigh,
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              '$idx',
                              style: GoogleFonts.inter(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.primary,
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
                    content: Text('Simulated compass guidance active for ${facility.name} (Demo).'),
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

  // Report Issue Interactive Dialog with clear demo feedback
  void _showReportIssueDialog(WaterWcFacility facility) {
    final issues = [
      'No Water',
      'Broken Tap / Leakage',
      'Dirty Toilet / Needs Cleaning',
      'Long Queue',
      'Ramp Access Blocked',
      'Other Issue',
    ];

    String selectedIssue = issues[0];

    showDialog<void>(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dialogContext, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: [
                  const Icon(Icons.report_problem, color: AppTheme.error),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Report Facility Issue',
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
                    Text(
                      'Facility: ${facility.name}',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Select issue type:',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ...issues.map((issue) {
                      return RadioListTile<String>(
                        contentPadding: EdgeInsets.zero,
                        dense: true,
                        title: Text(
                          issue,
                          style: GoogleFonts.inter(fontSize: 12.5),
                        ),
                        value: issue,
                        groupValue: selectedIssue,
                        activeColor: AppTheme.error,
                        onChanged: (val) {
                          if (val != null) {
                            setDialogState(() {
                              selectedIssue = val;
                            });
                          }
                        },
                      );
                    }),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    Navigator.of(ctx).pop();
                    setState(() {
                      _reportedFacilityIds.add(facility.id);
                    });
                    try {
                      await SupabaseMobileService.instance.createFacilityReport(
                        facilityId: facility.id,
                        facilityName: facility.name,
                        facilityType: facility.category == WaterWcCategory.waterAtm
                            ? 'WATER_ATM'
                            : 'TOILET',
                        sector: facility.location,
                        issueType: selectedIssue,
                      );
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Report sent: "$selectedIssue" for ${facility.name}. Visible in Admin & Volunteer Portal.',
                          ),
                          backgroundColor: AppTheme.secondary,
                          duration: const Duration(seconds: 4),
                        ),
                      );
                    } catch (e) {
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Could not send report: $e'),
                          backgroundColor: AppTheme.error,
                          duration: const Duration(seconds: 4),
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.error,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Submit Report'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off, size: 48, color: AppTheme.outlineVariant),
            const SizedBox(height: 12),
            Text(
              'No facilities match your search',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppTheme.onSurface,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Try changing your filter or keyword',
              style: GoogleFonts.inter(fontSize: 12, color: AppTheme.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }
}
