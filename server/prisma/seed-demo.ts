import prisma from "../src/config/prisma.js";

const EVENT_NAME = "Kolkata Durga Puja 2026";

async function ensureZone(
  venueId: string,
  data: {
    name: string;
    description?: string;
    capacity?: number;
  },
) {
  const existing = await prisma.zone.findFirst({
    where: {
      venueId,
      name: data.name,
    },
  });

  if (existing) {
    return prisma.zone.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.zone.create({
    data: {
      venueId,
      ...data,
    },
  });
}

async function ensureLocation(
  zoneId: string,
  data: {
    name: string;
    type:
      | "GATE"
      | "EXIT"
      | "STAGE"
      | "STALL"
      | "WASHROOM"
      | "MEDICAL"
      | "HELP_POINT"
      | "PARKING"
      | "WATER_POINT"
      | "OTHER";
    latitude: number;
    longitude: number;
    description?: string;
  },
) {
  const existing = await prisma.location.findFirst({
    where: {
      zoneId,
      name: data.name,
    },
  });

  if (existing) {
    return prisma.location.update({
      where: { id: existing.id },
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  return prisma.location.create({
    data: {
      zoneId,
      ...data,
      isActive: true,
    },
  });
}

async function ensureFacility(
  locationId: string,
  data: {
    name: string;
    type: string;
    status?:
      | "AVAILABLE"
      | "BUSY"
      | "FULL"
      | "CLOSED"
      | "MAINTENANCE";
    capacity?: number;
    description?: string;
  },
) {
  const existing = await prisma.facility.findFirst({
    where: {
      locationId,
      name: data.name,
    },
  });

  if (existing) {
    return prisma.facility.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.facility.create({
    data: {
      locationId,
      status: "AVAILABLE",
      ...data,
    },
  });
}

async function ensureAnnouncement(
  eventId: string,
  data: {
    title: string;
    message: string;
    priority: "INFO" | "IMPORTANT" | "URGENT";
  },
) {
  const existing = await prisma.announcement.findFirst({
    where: {
      eventId,
      title: data.title,
    },
  });

  if (existing) {
    return prisma.announcement.update({
      where: { id: existing.id },
      data: {
        ...data,
        isActive: true,
        startsAt: null,
        endsAt: null,
      },
    });
  }

  return prisma.announcement.create({
    data: {
      eventId,
      ...data,
      isActive: true,
    },
  });
}

async function ensureBrand(data: {
  name: string;
  category: string;
  description: string;
}) {
  const existing = await prisma.brand.findFirst({
    where: {
      name: data.name,
    },
  });

  if (existing) {
    return prisma.brand.update({
      where: { id: existing.id },
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  return prisma.brand.create({
    data: {
      ...data,
      isActive: true,
    },
  });
}

async function ensureOffer(
  eventId: string,
  brandId: string,
  data: {
    title: string;
    description: string;
    discountText: string;
    price: number;
  },
) {
  const existing = await prisma.offer.findFirst({
    where: {
      eventId,
      brandId,
      title: data.title,
    },
  });

  if (existing) {
    return prisma.offer.update({
      where: { id: existing.id },
      data: {
        ...data,
        isActive: true,
        startsAt: null,
        endsAt: null,
      },
    });
  }

  return prisma.offer.create({
    data: {
      eventId,
      brandId,
      ...data,
      isActive: true,
    },
  });
}

async function main() {
  console.log("Seeding Rahat Setu demo data...\n");
	// -------------------------------------------------------
// CLEAN OLD CONSUMER-BEHAVIOR TEST DATA
// -------------------------------------------------------

const oldNikeOffer = await prisma.offer.findFirst({
  where: {
    title: "20% off event merchandise",
    brand: {
      name: "Nike",
    },
  },
});

if (oldNikeOffer) {
  await prisma.consumerInteraction.deleteMany({
    where: {
      offerId: oldNikeOffer.id,
    },
  });

  await prisma.offer.delete({
    where: {
      id: oldNikeOffer.id,
    },
  });

  console.log("Removed old Nike demo offer and interactions.");
}

const oldNikeBrand = await prisma.brand.findFirst({
  where: {
    name: "Nike",
  },
  include: {
    offers: true,
    interactions: true,
  },
});

if (
  oldNikeBrand &&
  oldNikeBrand.offers.length === 0 &&
  oldNikeBrand.interactions.length === 0
) {
  await prisma.brand.delete({
    where: {
      id: oldNikeBrand.id,
    },
  });

  console.log("Removed unused Nike test brand.");
}

  // -------------------------------------------------------
  // CLEAN KNOWN TEST DATA
  // -------------------------------------------------------

  const uglyTestEvents = await prisma.event.findMany({
    where: {
      name: "test event for create button check",
    },
  });

  if (uglyTestEvents.length > 0) {
    await prisma.event.deleteMany({
      where: {
        name: "test event for create button check",
      },
    });

    console.log(
      `Removed ${uglyTestEvents.length} old test event(s).`,
    );
  }

  // -------------------------------------------------------
  // INCIDENT REPORTER
  // -------------------------------------------------------

  let demoReporter = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  if (!demoReporter) {
    demoReporter = await prisma.user.findFirst();
  }

  if (!demoReporter) {
    throw new Error(
      "No user exists in the database. Register/login once before running the demo seed.",
    );
  }

  console.log(
    `Using existing user as incident reporter: ${demoReporter.email}`,
  );

  // -------------------------------------------------------
  // EVENT
  // -------------------------------------------------------

  let event = await prisma.event.findFirst({
    where: {
      name: EVENT_NAME,
    },
  });

  const eventData = {
    name: EVENT_NAME,
    description:
      "A high-footfall Durga Puja event simulation demonstrating crowd-aware decision support, visitor facilities, safety communication, brand engagement and consumer behaviour analytics during a large-scale public gathering.",
    eventType: "FESTIVAL" as const,
    startTime: new Date("2026-10-17T15:00:00+05:30"),
    endTime: new Date("2026-10-21T23:30:00+05:30"),
    status: "LIVE" as const,
  };

  if (event) {
    event = await prisma.event.update({
      where: {
        id: event.id,
      },
      data: eventData,
    });
  } else {
    event = await prisma.event.create({
      data: eventData,
    });
  }

  console.log(`Event ready: ${event.name}`);

  // -------------------------------------------------------
  // VENUE
  // -------------------------------------------------------

  let venue = await prisma.venue.findFirst({
    where: {
      eventId: event.id,
      name: "Chorbagan Festival Zone",
    },
  });

  const venueData = {
    name: "Chorbagan Festival Zone",
    description:
      "A controlled simulation of a high-footfall Durga Puja venue used to demonstrate visitor movement, event facilities, safety communication and event intelligence.",
    latitude: 22.5865,
    longitude: 88.3594,
  };

  if (venue) {
    venue = await prisma.venue.update({
      where: {
        id: venue.id,
      },
      data: venueData,
    });
  } else {
    venue = await prisma.venue.create({
      data: {
        eventId: event.id,
        ...venueData,
      },
    });
  }

  console.log("Venue ready.");

  // -------------------------------------------------------
  // ZONES
  // -------------------------------------------------------

  const mainPandalZone = await ensureZone(venue.id, {
    name: "Main Pandal Zone",
    description:
      "Primary pandal and cultural activity area.",
    capacity: 5000,
  });

  const entryExitZone = await ensureZone(venue.id, {
    name: "Entry & Exit Zone",
    description:
      "Primary visitor access and movement-control area.",
    capacity: 3000,
  });

  const foodBrandZone = await ensureZone(venue.id, {
    name: "Food & Brand Zone",
    description:
      "Food stalls, refreshments and brand activation area.",
    capacity: 2500,
  });

  const emergencyServicesZone = await ensureZone(
    venue.id,
    {
      name: "Emergency & Services Zone",
      description:
        "Medical, police, information and visitor-assistance services.",
      capacity: 1000,
    },
  );

  console.log("Zones ready.");

  // -------------------------------------------------------
  // LOCATIONS
  // -------------------------------------------------------

  const mainPandal = await ensureLocation(
    mainPandalZone.id,
    {
      name: "Main Pandal",
      type: "OTHER",
      latitude: 22.5868,
      longitude: 88.3595,
      description:
        "Primary Durga Puja pandal and visitor attraction.",
    },
  );

  const culturalStage = await ensureLocation(
    mainPandalZone.id,
    {
      name: "Cultural Stage",
      type: "STAGE",
      latitude: 22.5867,
      longitude: 88.3597,
      description:
        "Stage for scheduled cultural performances.",
    },
  );

  const gateA = await ensureLocation(entryExitZone.id, {
    name: "Gate A",
    type: "GATE",
    latitude: 22.5861,
    longitude: 88.3591,
    description:
      "Primary visitor entrance for the simulated venue.",
  });

  const gateB = await ensureLocation(entryExitZone.id, {
    name: "Gate B",
    type: "GATE",
    latitude: 22.5862,
    longitude: 88.3598,
    description:
      "Secondary visitor access point monitored for crowd concentration.",
  });

  const eastExit = await ensureLocation(
    entryExitZone.id,
    {
      name: "East Exit",
      type: "EXIT",
      latitude: 22.5864,
      longitude: 88.3601,
      description:
        "Alternative visitor exit route.",
    },
  );

  const foodCourt = await ensureLocation(
    foodBrandZone.id,
    {
      name: "Food Court",
      type: "STALL",
      latitude: 22.5869,
      longitude: 88.36,
      description:
        "Food and beverage area with participating vendors.",
    },
  );

  const brandExperienceArea = await ensureLocation(
    foodBrandZone.id,
    {
      name: "Brand Experience Area",
      type: "STALL",
      latitude: 22.587,
      longitude: 88.3598,
      description:
        "Promotional and brand engagement area for event visitors.",
    },
  );

  const medicalDesk = await ensureLocation(
    emergencyServicesZone.id,
    {
      name: "Medical Help Desk",
      type: "MEDICAL",
      latitude: 22.5859,
      longitude: 88.3596,
      description:
        "First-response and visitor medical-assistance point.",
    },
  );

  const policeBooth = await ensureLocation(
    emergencyServicesZone.id,
    {
      name: "Police Assistance Booth",
      type: "HELP_POINT",
      latitude: 22.5858,
      longitude: 88.3595,
      description:
        "Security and visitor-assistance point.",
    },
  );

  const informationDesk = await ensureLocation(
    emergencyServicesZone.id,
    {
      name: "Information Desk",
      type: "HELP_POINT",
      latitude: 22.5859,
      longitude: 88.3593,
      description:
        "Event information and visitor-support desk.",
    },
  );

  console.log("Locations ready.");

  // -------------------------------------------------------
  // FACILITIES
  // -------------------------------------------------------

  await ensureFacility(gateA.id, {
    name: "Visitor Information Point",
    type: "INFORMATION",
    status: "AVAILABLE",
    description:
      "Entry guidance and general visitor assistance.",
  });

  await ensureFacility(foodCourt.id, {
    name: "Drinking Water Station",
    type: "WATER",
    status: "AVAILABLE",
    capacity: 100,
    description:
      "Free drinking-water facility for visitors.",
  });

  await ensureFacility(foodCourt.id, {
    name: "Washroom Block A",
    type: "WASHROOM",
    status: "AVAILABLE",
    capacity: 50,
    description:
      "Visitor washroom facility near the Food Court.",
  });

  await ensureFacility(foodCourt.id, {
    name: "Charging Station",
    type: "CHARGING",
    status: "AVAILABLE",
    capacity: 20,
    description:
      "Mobile-device charging facility.",
  });

  await ensureFacility(medicalDesk.id, {
    name: "First Aid Facility",
    type: "MEDICAL",
    status: "AVAILABLE",
    capacity: 20,
    description:
      "Basic first aid and medical assistance.",
  });

  await ensureFacility(informationDesk.id, {
    name: "Lost & Found Assistance",
    type: "LOST_AND_FOUND",
    status: "AVAILABLE",
    description:
      "Visitor support for lost items and general assistance.",
  });

  console.log("Facilities ready.");

  // -------------------------------------------------------
  // ANNOUNCEMENTS
  // -------------------------------------------------------

  await ensureAnnouncement(event.id, {
    title: "Gate B temporarily congested",
    message:
      "Visitors are advised to use Gate A or the East Exit route until further notice.",
    priority: "URGENT",
  });

  await ensureAnnouncement(event.id, {
    title: "Heavy crowd expected near Main Pandal",
    message:
      "Visitors are advised to plan their visit accordingly and follow organizer instructions.",
    priority: "IMPORTANT",
  });

  await ensureAnnouncement(event.id, {
    title: "Cultural performance at 7:00 PM",
    message:
      "The evening cultural programme will begin at the Cultural Stage at 7:00 PM.",
    priority: "INFO",
  });

  console.log("Announcements ready.");

  // -------------------------------------------------------
  // INCIDENT
  // -------------------------------------------------------

  const existingIncident =
    await prisma.incident.findFirst({
      where: {
        eventId: event.id,
        title:
          "High crowd concentration near Gate B",
      },
    });

  const incidentData = {
    eventId: event.id,
    locationId: gateB.id,
    reportedById: demoReporter.id,
    type: "CROWD" as const,
    severity: "HIGH" as const,
    status: "ACKNOWLEDGED" as const,
    title:
      "High crowd concentration near Gate B",
    description:
      "High pedestrian concentration has been reported near Gate B. Visitor movement is being redirected to alternate access points.",
    latitude: gateB.latitude,
    longitude: gateB.longitude,
  };

  if (existingIncident) {
    await prisma.incident.update({
      where: {
        id: existingIncident.id,
      },
      data: incidentData,
    });
  } else {
    await prisma.incident.create({
      data: incidentData,
    });
  }

  console.log("Demo incident ready.");

  // -------------------------------------------------------
  // BRANDS
  // -------------------------------------------------------

  const cocaCola = await ensureBrand({
    name: "Coca-Cola",
    category: "Food & Beverage",
    description:
      "Beverage partner offering refreshments during the event.",
  });

  const fabindia = await ensureBrand({
    name: "Fabindia",
    category: "Apparel & Lifestyle",
    description:
      "Indian lifestyle brand featuring festive clothing and accessories.",
  });

  const wowMomo = await ensureBrand({
    name: "Wow! Momo",
    category: "Food",
    description:
      "Quick-service food brand offering event-specific meal promotions.",
  });

  console.log("Brands ready.");

  // -------------------------------------------------------
  // OFFERS
  // -------------------------------------------------------

  await ensureOffer(event.id, cocaCola.id, {
    title: "Festival Refreshment Combo",
    description:
      "Buy two beverages and receive one additional beverage free.",
    discountText: "Buy 2 Get 1 Free",
    price: 120,
  });

  await ensureOffer(event.id, fabindia.id, {
    title: "Festive Collection Offer",
    description:
      "Special event discount on selected festive merchandise.",
    discountText: "20% OFF",
    price: 999,
  });

  await ensureOffer(event.id, wowMomo.id, {
    title: "Durga Puja Meal Combo",
    description:
      "Special event meal combo available during the festival.",
    discountText: "15% OFF",
    price: 249,
  });

  console.log("Offers ready.");

  // -------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------

  console.log("\n======================================");
  console.log("RAHAT SETU DEMO DATA READY");
  console.log("======================================");
  console.log(`Event: ${EVENT_NAME}`);
  console.log("Venue: Chorbagan Festival Zone");
  console.log("Zones: 4");
  console.log("Locations: 10");
  console.log("Facilities: 6");
  console.log("Announcements: 3");
  console.log("Incidents: 1");
  console.log("Brands: 3");
  console.log("Offers: 3");
  console.log("======================================");
}

main()
  .catch((error) => {
    console.error("\nDemo seed failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });