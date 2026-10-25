import prisma from "../../config/prisma.js";

export async function getDashboardSummary() {
  const [
    totalEvents,
    liveEvents,
    upcomingEvents,
    totalVenues,
    totalZones,
    totalLocations,
    totalFacilities,
    openIncidents,
    criticalIncidents,
    activeAnnouncements,
    urgentAnnouncements,
    recentIncidents,
  ] = await Promise.all([
    prisma.event.count(),

    prisma.event.count({
      where: {
        status: "LIVE",
      },
    }),

    prisma.event.count({
      where: {
        status: "UPCOMING",
      },
    }),

    prisma.venue.count(),

    prisma.zone.count(),

    prisma.location.count(),

    prisma.facility.count(),

    prisma.incident.count({
      where: {
        status: {
          in: [
            "OPEN",
            "ACKNOWLEDGED",
            "IN_PROGRESS",
          ],
        },
      },
    }),

    prisma.incident.count({
      where: {
        severity: "CRITICAL",
        status: {
          notIn: ["RESOLVED", "CLOSED"],
        },
      },
    }),

    prisma.announcement.count({
      where: {
        isActive: true,
      },
    }),

    prisma.announcement.count({
      where: {
        isActive: true,
        priority: "URGENT",
      },
    }),

    prisma.incident.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    events: {
      total: totalEvents,
      live: liveEvents,
      upcoming: upcomingEvents,
    },

    infrastructure: {
      venues: totalVenues,
      zones: totalZones,
      locations: totalLocations,
      facilities: totalFacilities,
    },

    incidents: {
      active: openIncidents,
      critical: criticalIncidents,
    },

    announcements: {
      active: activeAnnouncements,
      urgent: urgentAnnouncements,
    },

    recentIncidents,
  };
}