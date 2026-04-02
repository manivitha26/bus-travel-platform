/* ============================================================
   DATA — Seed data generator for realistic demo content
   ============================================================ */

const SeedData = {
  init() {
    if (Utils.store.get('seeded')) return;
    this.seedUsers();
    this.seedRoutes();
    this.seedPosts();
    this.seedReviews();
    this.seedNotifications();
    this.seedBookings();
    Utils.store.set('seeded', true);
  },

  seedUsers() {
    const users = [
      {
        id: 'user_demo',
        name: 'Alex Rivera',
        email: 'demo@busvoyager.com',
        password: 'demo123',
        bio: 'Passionate bus traveler exploring the world one route at a time 🚌✨',
        verified: true,
        joinedAt: '2025-06-15T10:00:00Z',
        completedJourneys: ['j1', 'j2', 'j3', 'j4', 'j5'],
        savedRoutes: ['r1', 'r3'],
        notificationPrefs: { email: true, push: true, promo: false, reminders: true, community: true, booking: true }
      },
      {
        id: 'user_2',
        name: 'Priya Sharma',
        email: 'priya@email.com',
        password: 'pass123',
        bio: 'Solo traveler | Bus enthusiast | 50+ routes explored',
        verified: true,
        joinedAt: '2025-08-20T10:00:00Z',
        completedJourneys: ['j6', 'j7', 'j8'],
        savedRoutes: ['r2'],
        notificationPrefs: { email: true, push: true, promo: true, reminders: true, community: true, booking: true }
      },
      {
        id: 'user_3',
        name: 'Marcus Johnson',
        email: 'marcus@email.com',
        password: 'pass123',
        bio: 'Travel blogger turned bus route reviewer',
        verified: true,
        joinedAt: '2025-09-10T10:00:00Z',
        completedJourneys: ['j9', 'j10'],
        savedRoutes: [],
        notificationPrefs: { email: true, push: false, promo: false, reminders: true, community: true, booking: true }
      },
      {
        id: 'user_4',
        name: 'Sofia Martinez',
        email: 'sofia@email.com',
        password: 'pass123',
        bio: 'Exploring Latin America by bus 🌎',
        verified: true,
        joinedAt: '2025-11-05T10:00:00Z',
        completedJourneys: ['j11'],
        savedRoutes: ['r1'],
        notificationPrefs: { email: true, push: true, promo: true, reminders: true, community: false, booking: true }
      },
      {
        id: 'user_5',
        name: 'Chen Wei',
        email: 'chen@email.com',
        password: 'pass123',
        bio: 'Budget travel advocate',
        verified: false,
        joinedAt: '2026-01-12T10:00:00Z',
        completedJourneys: [],
        savedRoutes: [],
        notificationPrefs: { email: true, push: true, promo: false, reminders: true, community: true, booking: true }
      }
    ];
    Utils.store.set('users', users);
  },

  seedRoutes() {
    const routes = [
      {
        id: 'r1',
        name: 'City Express - Downtown to Airport',
        from: 'Downtown Central Station',
        to: 'International Airport Terminal',
        fromCoords: [40.7128, -74.0060],
        toCoords: [40.6413, -73.7781],
        distance: '28 km',
        duration: '45 min',
        operator: 'Metro Express',
        price: '$12.50',
        frequency: 'Every 20 min',
        stops: ['Downtown Central', 'Business District', 'Mall Junction', 'Highway Exit', 'Airport Terminal']
      },
      {
        id: 'r2',
        name: 'Coastal Route - Harbor to Beach Town',
        from: 'Harbor District',
        to: 'Sunset Beach',
        fromCoords: [34.0522, -118.2437],
        toCoords: [33.7701, -118.1937],
        distance: '42 km',
        duration: '1h 10min',
        operator: 'Coastal Lines',
        price: '$18.00',
        frequency: 'Every 30 min',
        stops: ['Harbor District', 'Marina Bay', 'Clifftop View', 'Oceanside Park', 'Sunset Beach']
      },
      {
        id: 'r3',
        name: 'Mountain Pass - Valley to Summit',
        from: 'Valley Station',
        to: 'Mountain Summit Lodge',
        fromCoords: [39.7392, -104.9903],
        toCoords: [39.6403, -105.3775],
        distance: '65 km',
        duration: '1h 45min',
        operator: 'Highland Transit',
        price: '$24.00',
        frequency: 'Every 1 hour',
        stops: ['Valley Station', 'Riverside Town', 'Pine Forest Stop', 'Eagle Point', 'Summit Lodge']
      },
      {
        id: 'r4',
        name: 'Heritage Line - Old Town Circuit',
        from: 'Heritage Square',
        to: 'Cultural Center',
        fromCoords: [51.5074, -0.1278],
        toCoords: [51.5155, -0.1419],
        distance: '12 km',
        duration: '35 min',
        operator: 'Heritage Tours',
        price: '$8.00',
        frequency: 'Every 15 min',
        stops: ['Heritage Square', 'Museum Quarter', 'Royal Gardens', 'Theater Row', 'Cultural Center']
      },
      {
        id: 'r5',
        name: 'Night Owl Express - Campus to Suburbs',
        from: 'University Campus',
        to: 'Suburban Hub',
        fromCoords: [37.7749, -122.4194],
        toCoords: [37.6879, -122.4702],
        distance: '18 km',
        duration: '30 min',
        operator: 'NightRide',
        price: '$6.50',
        frequency: 'Every 45 min (10pm-4am)',
        stops: ['University Campus', 'Tech Park', 'Residential Zone', 'Suburban Hub']
      }
    ];
    Utils.store.set('routes', routes);
  },

  seedPosts() {
    const posts = [
      {
        id: 'p1',
        userId: 'user_demo',
        userName: 'Alex Rivera',
        content: 'Just completed the most amazing coastal bus ride from Harbor District to Sunset Beach! 🌅 The views were absolutely breathtaking. The driver even stopped briefly at Clifftop View so we could take photos. Highly recommend the 7am departure for the best morning light!',
        image: null,
        forum: 'destinations',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        likes: ['user_2', 'user_3', 'user_4'],
        comments: [
          { id: 'c1', userId: 'user_2', userName: 'Priya Sharma', text: 'This sounds incredible! Adding it to my bucket list 😍', createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString() },
          { id: 'c2', userId: 'user_3', userName: 'Marcus Johnson', text: 'I did this route last month. The sunset departure is also amazing!', createdAt: new Date(Date.now() - 3600000).toISOString() }
        ],
        reports: [],
        hidden: false
      },
      {
        id: 'p2',
        userId: 'user_2',
        userName: 'Priya Sharma',
        content: '💡 Pro tip for long bus journeys: Always carry a portable charger, noise-cancelling earbuds, and a light blanket. The AC on overnight buses can get really cold! Also, book window seats on the left side for mountain routes — better views! #TravelTips',
        image: null,
        forum: 'tips',
        createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        likes: ['user_demo', 'user_3', 'user_4', 'user_5'],
        comments: [
          { id: 'c3', userId: 'user_demo', userName: 'Alex Rivera', text: 'The blanket tip is so true! Learned that the hard way 😅', createdAt: new Date(Date.now() - 7 * 3600000).toISOString() }
        ],
        reports: [],
        hidden: false
      },
      {
        id: 'p3',
        userId: 'user_3',
        userName: 'Marcus Johnson',
        content: 'Has anyone taken the new Mountain Pass route? I\'m planning to go next weekend and would love to hear about the road conditions. Is the Summit Lodge stop worth spending a few hours at? 🏔️',
        image: null,
        forum: 'routes',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        likes: ['user_demo', 'user_4'],
        comments: [
          { id: 'c4', userId: 'user_4', userName: 'Sofia Martinez', text: 'The road is in great condition! Summit Lodge has a fantastic café with panoramic views. Definitely spend at least 2 hours there.', createdAt: new Date(Date.now() - 22 * 3600000).toISOString() },
          { id: 'c5', userId: 'user_demo', userName: 'Alex Rivera', text: 'I went last month — it\'s beautiful! The Pine Forest stop is underrated too.', createdAt: new Date(Date.now() - 20 * 3600000).toISOString() }
        ],
        reports: [],
        hidden: false
      },
      {
        id: 'p4',
        userId: 'user_4',
        userName: 'Sofia Martinez',
        content: 'Just discovered that the Heritage Line has free WiFi now! 🎉 Perfect for catching up on work during the commute. The bus was super clean too. Great job Heritage Tours! 👏',
        image: null,
        forum: 'general',
        createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        likes: ['user_2', 'user_5'],
        comments: [],
        reports: [],
        hidden: false
      },
      {
        id: 'p5',
        userId: 'user_2',
        userName: 'Priya Sharma',
        content: 'Completed my 50th bus route today! 🎊🚌 What started as a budget travel choice turned into a genuine passion. There\'s something magical about watching the landscape change through a bus window. Thank you BusVoyager community for all the amazing route recommendations! Here\'s to the next 50! 🥂',
        image: null,
        forum: 'general',
        createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
        likes: ['user_demo', 'user_3', 'user_4', 'user_5'],
        comments: [
          { id: 'c6', userId: 'user_3', userName: 'Marcus Johnson', text: 'Congratulations Priya! 🎉 That is an amazing milestone!', createdAt: new Date(Date.now() - 70 * 3600000).toISOString() },
          { id: 'c7', userId: 'user_demo', userName: 'Alex Rivera', text: 'Incredible! You\'re an inspiration to all of us 🙌', createdAt: new Date(Date.now() - 68 * 3600000).toISOString() }
        ],
        reports: [],
        hidden: false
      }
    ];
    Utils.store.set('posts', posts);
  },

  seedReviews() {
    const reviews = [
      {
        id: 'rev1', routeId: 'r1', userId: 'user_demo', userName: 'Alex Rivera',
        rating: 5, text: 'Excellent express service! The bus was punctual, clean, and comfortable. The direct route to the airport saved me so much time compared to dealing with city traffic. WiFi worked great too. Highly recommend for frequent airport travelers.',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        upvotes: ['user_2', 'user_3', 'user_4'], downvotes: [],
        reports: [], hidden: false, journeyId: 'j1', edited: false
      },
      {
        id: 'rev2', routeId: 'r1', userId: 'user_2', userName: 'Priya Sharma',
        rating: 4, text: 'Very reliable service with comfortable seating. The only minor issue was that during rush hour (around 5-6pm), the bus can get quite crowded. Morning and late evening rides are much more comfortable. The AC works perfectly.',
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        upvotes: ['user_demo', 'user_3'], downvotes: [],
        reports: [], hidden: false, journeyId: 'j6', edited: false
      },
      {
        id: 'rev3', routeId: 'r2', userId: 'user_3', userName: 'Marcus Johnson',
        rating: 5, text: 'The coastal route is a must-do experience! The views are stunning, especially the stretch between Marina Bay and Clifftop View. The bus operator maintains the vehicles well. Seats are spacious with good legroom. Perfect for a relaxing journey.',
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        upvotes: ['user_demo', 'user_2', 'user_4', 'user_5'], downvotes: [],
        reports: [], hidden: false, journeyId: 'j9', edited: false
      },
      {
        id: 'rev4', routeId: 'r2', userId: 'user_demo', userName: 'Alex Rivera',
        rating: 4, text: 'Beautiful route with amazing scenery. The journey took a bit longer than expected due to traffic near Marina Bay, but the views more than made up for it. The driver was friendly and pointed out interesting landmarks along the way.',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        upvotes: ['user_3'], downvotes: [],
        reports: [], hidden: false, journeyId: 'j2', edited: false
      },
      {
        id: 'rev5', routeId: 'r3', userId: 'user_4', userName: 'Sofia Martinez',
        rating: 5, text: 'The Mountain Pass route is absolutely breathtaking! Every turn reveals a new stunning view. The bus handles the mountain roads with ease and I felt completely safe. The stop at Eagle Point offers an incredible panoramic view. A must-do route!',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        upvotes: ['user_demo', 'user_2', 'user_3'], downvotes: [],
        reports: [], hidden: false, journeyId: 'j11', edited: false
      },
      {
        id: 'rev6', routeId: 'r3', userId: 'user_2', userName: 'Priya Sharma',
        rating: 4, text: 'Great mountain experience! The road can be a bit winding, so if you get motion sick, sit near the front. The bus stops at scenic points are well-chosen. Pine Forest stop is a hidden gem with a lovely little café nearby.',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        upvotes: ['user_demo'], downvotes: [],
        reports: [], hidden: false, journeyId: 'j7', edited: false
      },
      {
        id: 'rev7', routeId: 'r4', userId: 'user_demo', userName: 'Alex Rivera',
        rating: 5, text: 'Perfect for tourists and locals alike! The Heritage Line takes you through the most beautiful parts of the old town. The frequency is excellent — never had to wait more than 15 minutes. Great value for money too.',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        upvotes: ['user_2', 'user_4'], downvotes: [],
        reports: [], hidden: false, journeyId: 'j3', edited: false
      },
      {
        id: 'rev8', routeId: 'r4', userId: 'user_3', userName: 'Marcus Johnson',
        rating: 3, text: 'Decent heritage route but can be very crowded during tourist season. The buses are a bit older compared to other routes. However, the route itself is wonderful and passes by some amazing historical buildings. Worth trying at least once.',
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        upvotes: [], downvotes: ['user_demo'],
        reports: [], hidden: false, journeyId: 'j10', edited: false
      },
      {
        id: 'rev9', routeId: 'r5', userId: 'user_demo', userName: 'Alex Rivera',
        rating: 4, text: 'Lifesaver for late-night commutes! The Night Owl Express runs reliably even at 2am. Safety measures are excellent with well-lit stops and security cameras on board. Only giving 4 stars because the frequency could be better — every 30 min would be ideal.',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        upvotes: ['user_2', 'user_5'], downvotes: [],
        reports: [], hidden: false, journeyId: 'j4', edited: false
      }
    ];
    Utils.store.set('reviews', reviews);
  },

  seedNotifications() {
    const notifications = [
      {
        id: 'n1', userId: 'user_demo', type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: 'Your booking for City Express (Downtown → Airport) on Apr 5 at 9:00 AM has been confirmed. Booking ID: BV-28491',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        read: false, channel: 'in_app', status: 'delivered'
      },
      {
        id: 'n2', userId: 'user_demo', type: 'reminder',
        title: 'Journey Reminder',
        message: 'Your Coastal Route journey is tomorrow at 7:00 AM. Don\'t forget to arrive 10 minutes early at Harbor District stop.',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        read: false, channel: 'push', status: 'delivered'
      },
      {
        id: 'n3', userId: 'user_demo', type: 'community_update',
        title: 'New comment on your post',
        message: 'Priya Sharma commented on your post about the coastal bus ride: "This sounds incredible!"',
        createdAt: new Date(Date.now() - 5400000).toISOString(),
        read: false, channel: 'in_app', status: 'delivered'
      },
      {
        id: 'n4', userId: 'user_demo', type: 'promo',
        title: '🎉 Weekend Special!',
        message: 'Get 20% off on all Mountain Pass routes this weekend! Use code MOUNTAIN20 at checkout.',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        read: true, channel: 'email', status: 'delivered'
      },
      {
        id: 'n5', userId: 'user_demo', type: 'schedule_change',
        title: 'Schedule Update',
        message: 'The Heritage Line departure at 3:30 PM has been rescheduled to 3:45 PM due to temporary road work near Museum Quarter.',
        createdAt: new Date(Date.now() - 28800000).toISOString(),
        read: true, channel: 'push', status: 'delivered'
      },
      {
        id: 'n6', userId: 'user_demo', type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: 'Your booking BV-28300 for Night Owl Express on Mar 28 has been cancelled as per your request. Refund will be processed within 3-5 business days.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        read: true, channel: 'email', status: 'delivered'
      },
      {
        id: 'n7', userId: 'user_demo', type: 'community_update',
        title: 'Your post is trending!',
        message: 'Your post about the coastal bus ride has received 15+ likes and is now trending in the community!',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: false, channel: 'in_app', status: 'delivered'
      },
      {
        id: 'n8', userId: 'user_demo', type: 'reminder',
        title: 'Review Reminder',
        message: 'How was your Mountain Pass journey? Share your experience and help other travelers!',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        read: true, channel: 'email', status: 'failed',
        retryCount: 2
      }
    ];
    Utils.store.set('notifications', notifications);
  },

  seedBookings() {
    const bookings = [
      { id: 'b1', userId: 'user_demo', routeId: 'r1', journeyId: 'j1', date: '2026-03-15', time: '09:00', status: 'completed', seat: 'A4' },
      { id: 'b2', userId: 'user_demo', routeId: 'r2', journeyId: 'j2', date: '2026-03-20', time: '07:00', status: 'completed', seat: 'B2' },
      { id: 'b3', userId: 'user_demo', routeId: 'r4', journeyId: 'j3', date: '2026-03-25', time: '10:30', status: 'completed', seat: 'A1' },
      { id: 'b4', userId: 'user_demo', routeId: 'r5', journeyId: 'j4', date: '2026-03-28', time: '23:00', status: 'completed', seat: 'C3' },
      { id: 'b5', userId: 'user_demo', routeId: 'r3', journeyId: 'j5', date: '2026-04-01', time: '08:00', status: 'completed', seat: 'A2' },
      { id: 'b6', userId: 'user_demo', routeId: 'r1', date: '2026-04-05', time: '09:00', status: 'upcoming', seat: 'A5' }
    ];
    Utils.store.set('bookings', bookings);
  }
};
