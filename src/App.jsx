import { useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  BookOpen,
  CalendarDays,
  Compass,
  HeartHandshake,
  Languages,
  Loader2,
  LogIn,
  MapPin,
  MessageCircle,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  UserRound,
} from "lucide-react";
import { auth, firebaseReady, missingFirebaseKeys } from "./firebase";
import { chatWithDestinGo, generateItinerary, generateStory, getCultureRespectTips } from "./services/api";
import {
  createBooking,
  fetchDestinations,
  fetchEvents,
  fetchHosts,
  fetchPlaces,
  fetchSavedTrips,
  saveTrip
} from "./services/firestore";

const navItems = [
  ["overview", "Overview"],
  ["planner", "Planner"],
  ["hidden-gems", "Gems"],
  ["experiences", "Experience"],
  ["events", "Events"],
  ["my-trips", "Trips"]
];

const pageRoutes = {
  overview: "/overview",
  planner: "/planner",
  "hidden-gems": "/gems",
  experiences: "/experiences",
  events: "/events",
  "my-trips": "/trips"
};

const routePages = Object.fromEntries(Object.entries(pageRoutes).map(([page, route]) => [route, page]));

function getPageFromPath() {
  if (typeof window === "undefined") return "overview";
  return routePages[window.location.pathname] || "overview";
}

const initialPlanner = {
  days: "2",
  budget: "Rs.5000",
  interests: "Heritage, Food, Art",
  travelStyle: "Slow cultural immersion",
  language: "English"
};

const previewDestination = {
  city: "Kerala",
  country: "India",
  heroTitle: "Embrace God's Own Country in Kerala",
  subtitle: "Backwater houseboats, spice-scented hills, Kalaripayattu, and Ayurvedic heritage.",
  backgroundImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Houseboat%20in%20Kerala%20Backwaters.jpg",
  shortDescription:
    "A tropical paradise featuring serene backwater houseboats, spice-scented hills, Kalaripayattu, and authentic Ayurvedic heritage.",
  rating: "4.8",
  bestTime: "September to March",
  cultureTags: ["Backwaters", "Ayurveda", "Kalaripayattu", "Spices"]
};
const defaultHeroImage = "/assets/culture-hero-palace.png";
const cityHeroImages = {
  Kerala: "https://commons.wikimedia.org/wiki/Special:FilePath/Houseboat%20in%20Kerala%20Backwaters.jpg",
  Jaipur: "/assets/culture-hero-palace.png",
  Mumbai: "https://commons.wikimedia.org/wiki/Special:FilePath/Mumbai%2003-2016%2030%20Gateway%20of%20India.jpg",
  Bengaluru: "https://commons.wikimedia.org/wiki/Special:FilePath/Bangalore%20Palace%20Bangalore.jpg",
  Chennai: "https://commons.wikimedia.org/wiki/Special:FilePath/Marina%20Beach%20as%20seen%20from%20Light%20house.jpg",
  Kolkata: "https://commons.wikimedia.org/wiki/Special:FilePath/Howrah%20Bridge%20Kolkata.jpg",
  Hyderabad: "https://commons.wikimedia.org/wiki/Special:FilePath/Charminar%20Hyderabad%201.jpg",
  Ahmedabad: "https://commons.wikimedia.org/wiki/Special:FilePath/Adalaj%20Stepwell%20Ahmedabad.jpg",
  Pune: "https://commons.wikimedia.org/wiki/Special:FilePath/Shaniwarwada%20Pune.jpg",
  Lucknow: "https://commons.wikimedia.org/wiki/Special:FilePath/Bara%20Imambara%20Lucknow.jpg",
  Amritsar: "https://commons.wikimedia.org/wiki/Special:FilePath/Golden%20Temple%20Amritsar%20India.jpg",
  Agra: "https://commons.wikimedia.org/wiki/Special:FilePath/Taj%20Mahal%20in%20March%202004.jpg",
  Udaipur: "https://commons.wikimedia.org/wiki/Special:FilePath/Lake%20Pichola%20Udaipur.jpg",
  Jodhpur: "https://commons.wikimedia.org/wiki/Special:FilePath/Mehrangarh%20Fort%20Jodhpur.jpg",
  Mysuru: "https://commons.wikimedia.org/wiki/Special:FilePath/Mysore%20Palace%20Morning.jpg",
  Kochi: "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese%20fishing%20nets%20Fort%20Kochi.jpg",
  Rishikesh: "https://commons.wikimedia.org/wiki/Special:FilePath/Lakshman%20Jhula%20Rishikesh.jpg",
  Shimla: "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Ridge%20Shimla.jpg",
  Darjeeling: "https://commons.wikimedia.org/wiki/Special:FilePath/Darjeeling%20Tea%20Garden.jpg",
  Guwahati: "https://commons.wikimedia.org/wiki/Special:FilePath/Kamakhya%20Temple%20Guwahati.jpg",
  Bhubaneswar: "https://commons.wikimedia.org/wiki/Special:FilePath/Lingaraja%20Temple%20Bhubaneswar.jpg",
  Chandigarh: "https://commons.wikimedia.org/wiki/Special:FilePath/Rock%20Garden%20Chandigarh.jpg",
  Bhopal: "https://commons.wikimedia.org/wiki/Special:FilePath/Upper%20Lake%20Bhopal.jpg",
  Madurai: "https://commons.wikimedia.org/wiki/Special:FilePath/Meenakshi%20Temple%20Madurai.jpg",
  Indore: "https://commons.wikimedia.org/wiki/Special:FilePath/Rajwada%20Indore.jpg",
  Surat: "https://commons.wikimedia.org/wiki/Special:FilePath/Surat%20city.jpg",
  Patna: "https://commons.wikimedia.org/wiki/Special:FilePath/Golghar%20Patna.jpg",
  Visakhapatnam: "https://commons.wikimedia.org/wiki/Special:FilePath/Visakhapatnam%20beach%20road.jpg",
  Nagpur: "https://commons.wikimedia.org/wiki/Special:FilePath/Deekshabhoomi%20Nagpur.jpg",
  Nashik: "https://commons.wikimedia.org/wiki/Special:FilePath/Godavari%20River%20Nashik.jpg",
  Aurangabad: "https://commons.wikimedia.org/wiki/Special:FilePath/Bibi%20Ka%20Maqbara%20Aurangabad.jpg",
  Thiruvananthapuram: "https://commons.wikimedia.org/wiki/Special:FilePath/Sree%20Padmanabhaswamy%20Temple.jpg",
  Pondicherry: "https://commons.wikimedia.org/wiki/Special:FilePath/Pondicherry%20Promenade%20Beach.jpg",
  Coimbatore: "https://commons.wikimedia.org/wiki/Special:FilePath/Adiyogi%20Shiva%20statue.jpg",
  Varanasi: "https://commons.wikimedia.org/wiki/Special:FilePath/Varanasi%20Ghat.jpg",
  Delhi: "https://commons.wikimedia.org/wiki/Special:FilePath/India%20Gate%20in%20New%20Delhi%2003-2016%20img3.jpg",
  Goa: "https://commons.wikimedia.org/wiki/Special:FilePath/Palolem%20Beach%20Goa.jpg"
};
const cityImagePages = {
  Agra: "Agra",
  Ahmedabad: "Ahmedabad",
  Amritsar: "Amritsar",
  Aurangabad: "Aurangabad",
  Bengaluru: "Bangalore",
  Bhopal: "Bhopal",
  Bhubaneswar: "Bhubaneswar",
  Chandigarh: "Chandigarh",
  Chennai: "Chennai",
  Coimbatore: "Coimbatore",
  Darjeeling: "Darjeeling",
  Delhi: "Delhi",
  Goa: "Goa",
  Guwahati: "Guwahati",
  Hyderabad: "Hyderabad",
  Indore: "Indore",
  Jaipur: "Jaipur",
  Jodhpur: "Jodhpur",
  Kerala: "Kerala",
  Kochi: "Kochi",
  Kolkata: "Kolkata",
  Lucknow: "Lucknow",
  Madurai: "Madurai",
  Mumbai: "Mumbai",
  Mysuru: "Mysore",
  Nagpur: "Nagpur",
  Nashik: "Nashik",
  Patna: "Patna",
  Pondicherry: "Pondicherry",
  Pune: "Pune",
  Rishikesh: "Rishikesh",
  Shimla: "Shimla",
  Surat: "Surat",
  Thiruvananthapuram: "Thiruvananthapuram",
  Udaipur: "Udaipur",
  Varanasi: "Varanasi",
  Visakhapatnam: "Visakhapatnam"
};

const cityImageCache = new Map();

function slugifyCity(city) {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = reject;
    image.src = src;
  });
}

function cityPhotoUrl(city) {
  return cityHeroImages[city] || defaultHeroImage;
}

async function resolveCityImage(city, fallback = defaultHeroImage) {
  if (!city) return fallback;
  if (cityImageCache.has(city)) return cityImageCache.get(city);

  const candidate = cityPhotoUrl(city);
  try {
    await preloadImage(candidate);
    cityImageCache.set(city, candidate);
    return candidate;
  } catch {
    cityImageCache.set(city, fallback);
    return fallback;
  }
}

function createDemoRecordId(prefix, city, suffix = "") {
  return `${prefix}-${slugifyCity(city)}${suffix ? `-${suffix}` : ""}`;
}

function createLocalDemoUser() {
  return { uid: "local-demo-user", isAnonymous: true, email: null, localDemo: true };
}

function readLocalList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeLocalList(key, records) {
  localStorage.setItem(key, JSON.stringify(records));
}

function createLocalId(prefix) {
  if (crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}
const previewDestinations = [
  previewDestination,
  {
    city: "Jaipur",
    country: "India",
    heroTitle: "Your Perfect Cultural Escape in Jaipur",
    subtitle: "Royal forts, handmade crafts, folk rhythms, and warm Rajasthani hospitality.",
    backgroundImage: "/assets/culture-hero-palace.png",
    shortDescription: "Discover royal forts, colorful bazaars, folk music, handmade crafts, and hidden stories of Rajasthan.",
    rating: "4.9",
    bestTime: "October to March",
    cultureTags: ["Forts", "Crafts", "Bazaars", "Folk Music"]
  },
  {
    city: "Mumbai",
    country: "India",
    heroTitle: "Feel Mumbai's Creative Pulse",
    subtitle: "Sea promenades, art deco facades, film culture, markets, and coastal food.",
    backgroundImage: cityPhotoUrl("Mumbai"),
    shortDescription: "Explore Mumbai through colonial streets, art deco icons, seaside evenings, studio stories, markets, and food trails.",
    rating: "4.7",
    bestTime: "November to February",
    cultureTags: ["Art Deco", "Cinema", "Food", "Markets"]
  },
  {
    city: "Bengaluru",
    country: "India",
    heroTitle: "Discover Bengaluru's Garden Culture",
    subtitle: "Old neighborhoods, gardens, craft cafes, music, markets, and tech-era creativity.",
    backgroundImage: cityPhotoUrl("Bengaluru"),
    shortDescription: "Blend heritage walks, green spaces, local music, filter coffee, craft studios, and neighborhood food in Bengaluru.",
    rating: "4.6",
    bestTime: "October to February",
    cultureTags: ["Gardens", "Music", "Coffee", "Markets"]
  },
  {
    city: "Chennai",
    country: "India",
    heroTitle: "Meet Chennai Through Music and Sea",
    subtitle: "Temple streets, classical arts, Marina mornings, craft stores, and Tamil food.",
    backgroundImage: cityPhotoUrl("Chennai"),
    shortDescription: "Experience Chennai through sabhas, shore walks, old temples, textile traditions, bookshops, and generous local kitchens.",
    rating: "4.6",
    bestTime: "November to February",
    cultureTags: ["Carnatic Music", "Temples", "Textiles", "Coast"]
  },
  {
    city: "Kolkata",
    country: "India",
    heroTitle: "Walk Kolkata's Literary Soul",
    subtitle: "Trams, river ghats, bookstores, colonial lanes, Durga Puja artistry, and sweets.",
    backgroundImage: cityPhotoUrl("Kolkata"),
    shortDescription: "Follow Kolkata through College Street, old mansions, river sunsets, art studios, adda culture, and classic sweets.",
    rating: "4.8",
    bestTime: "October to March",
    cultureTags: ["Literature", "Trams", "Puja Art", "Sweets"]
  },
  {
    city: "Hyderabad",
    country: "India",
    heroTitle: "Taste Hyderabad's Royal Layers",
    subtitle: "Charminar lanes, pearls, biryani kitchens, museums, palaces, and Deccan stories.",
    backgroundImage: cityPhotoUrl("Hyderabad"),
    shortDescription: "Discover Hyderabad through old city bazaars, Deccan architecture, food heritage, craft markets, and palace museums.",
    rating: "4.7",
    bestTime: "October to February",
    cultureTags: ["Biryani", "Deccan", "Pearls", "Bazaars"]
  },
  {
    city: "Ahmedabad",
    country: "India",
    heroTitle: "Explore Ahmedabad's Living Heritage",
    subtitle: "Pol houses, stepwells, textile traditions, riverfront evenings, and Gujarati food.",
    backgroundImage: cityPhotoUrl("Ahmedabad"),
    shortDescription: "Move through Ahmedabad's old city pols, textile museums, stepwells, street food, and modern riverfront culture.",
    rating: "4.6",
    bestTime: "November to February",
    cultureTags: ["Pols", "Textiles", "Stepwells", "Food"]
  },
  {
    city: "Pune",
    country: "India",
    heroTitle: "Find Pune's Forts and Food Trails",
    subtitle: "Peth neighborhoods, forts, music, campuses, old bakeries, and Marathi culture.",
    backgroundImage: cityPhotoUrl("Pune"),
    shortDescription: "Explore Pune through old wada lanes, nearby forts, local snacks, classical music, and thoughtful cultural walks.",
    rating: "4.5",
    bestTime: "October to February",
    cultureTags: ["Forts", "Wadas", "Music", "Food"]
  },
  {
    city: "Lucknow",
    country: "India",
    heroTitle: "Experience Lucknow's Nawabi Grace",
    subtitle: "Imambaras, chikankari, kebab lanes, poetry, gardens, and refined etiquette.",
    backgroundImage: cityPhotoUrl("Lucknow"),
    shortDescription: "Discover Lucknow through graceful architecture, chikankari workshops, poetic tehzeeb, gardens, and legendary food lanes.",
    rating: "4.8",
    bestTime: "October to March",
    cultureTags: ["Nawabi", "Chikankari", "Poetry", "Food"]
  },
  {
    city: "Amritsar",
    country: "India",
    heroTitle: "Feel Amritsar's Warm Welcome",
    subtitle: "Golden Temple serenity, langar, partition memory, bazaars, and Punjabi kitchens.",
    backgroundImage: cityPhotoUrl("Amritsar"),
    shortDescription: "Travel through Amritsar with respect: sacred spaces, community kitchens, heritage lanes, craft bazaars, and local food.",
    rating: "4.9",
    bestTime: "October to March",
    cultureTags: ["Sacred", "Langar", "Bazaars", "Punjabi Food"]
  },
  {
    city: "Agra",
    country: "India",
    heroTitle: "See Agra Beyond the Taj",
    subtitle: "Mughal gardens, marble craft, river views, old markets, and food traditions.",
    backgroundImage: cityPhotoUrl("Agra"),
    shortDescription: "Go beyond the postcard with Mughal gardens, marble artisan stories, Yamuna viewpoints, heritage markets, and local snacks.",
    rating: "4.7",
    bestTime: "October to March",
    cultureTags: ["Mughal", "Marble", "Gardens", "Markets"]
  },
  {
    city: "Udaipur",
    country: "India",
    heroTitle: "Drift Through Udaipur's Lake Stories",
    subtitle: "Lake palaces, miniature art, ghats, music, craft schools, and sunset walks.",
    backgroundImage: cityPhotoUrl("Udaipur"),
    shortDescription: "Experience Udaipur through lakefront heritage, miniature painting, music evenings, craft lanes, and soft Aravalli light.",
    rating: "4.9",
    bestTime: "October to March",
    cultureTags: ["Lakes", "Miniature Art", "Palaces", "Music"]
  },
  {
    city: "Jodhpur",
    country: "India",
    heroTitle: "Enter Jodhpur's Blue Lanes",
    subtitle: "Mehrangarh views, blue neighborhoods, desert music, textiles, and spice markets.",
    backgroundImage: cityPhotoUrl("Jodhpur"),
    shortDescription: "Walk Jodhpur through fort ramparts, indigo lanes, textile stories, folk rhythms, spice markets, and desert hospitality.",
    rating: "4.8",
    bestTime: "October to March",
    cultureTags: ["Fort", "Blue City", "Textiles", "Folk Music"]
  },
  {
    city: "Mysuru",
    country: "India",
    heroTitle: "Discover Mysuru's Royal Calm",
    subtitle: "Palace lights, sandalwood, silk, yoga traditions, markets, and old-world grace.",
    backgroundImage: cityPhotoUrl("Mysuru"),
    shortDescription: "Explore Mysuru through palace heritage, silk and sandalwood craft, markets, food, and a slower cultural rhythm.",
    rating: "4.8",
    bestTime: "October to February",
    cultureTags: ["Palace", "Silk", "Sandalwood", "Yoga"]
  },
  {
    city: "Kochi",
    country: "India",
    heroTitle: "Follow Kochi's Port City Stories",
    subtitle: "Fort Kochi lanes, spice trade, art cafes, synagogues, churches, and sea air.",
    backgroundImage: cityPhotoUrl("Kochi"),
    shortDescription: "Meet Kochi through layered port heritage, spice warehouses, contemporary art, coastal food, and respectful neighborhood walks.",
    rating: "4.8",
    bestTime: "October to March",
    cultureTags: ["Port Heritage", "Spices", "Art", "Coast"]
  },
  {
    city: "Rishikesh",
    country: "India",
    heroTitle: "Find Rishikesh by the Ganga",
    subtitle: "Ashrams, river rituals, yoga, forest trails, cafes, and foothill silence.",
    backgroundImage: cityPhotoUrl("Rishikesh"),
    shortDescription: "Balance Rishikesh's spiritual rhythm with river walks, yoga culture, local etiquette, forest edges, and mindful cafes.",
    rating: "4.7",
    bestTime: "September to April",
    cultureTags: ["Yoga", "Ganga", "Ashrams", "Nature"]
  },
  {
    city: "Shimla",
    country: "India",
    heroTitle: "Slow Down in Shimla's Hills",
    subtitle: "Colonial walks, ridge views, toy train memories, bakeries, and mountain markets.",
    backgroundImage: cityPhotoUrl("Shimla"),
    shortDescription: "Experience Shimla through hill walks, old railway stories, market lanes, heritage buildings, and winter mountain air.",
    rating: "4.5",
    bestTime: "March to June and December to January",
    cultureTags: ["Hills", "Railway", "Markets", "Heritage"]
  },
  {
    city: "Darjeeling",
    country: "India",
    heroTitle: "Wake Up With Darjeeling Tea",
    subtitle: "Tea gardens, Himalayan views, monasteries, toy train tracks, and mountain food.",
    backgroundImage: cityPhotoUrl("Darjeeling"),
    shortDescription: "Discover Darjeeling through tea estates, Himalayan viewpoints, monasteries, local kitchens, and railway heritage.",
    rating: "4.7",
    bestTime: "March to May and October to December",
    cultureTags: ["Tea", "Himalaya", "Monasteries", "Railway"]
  },
  {
    city: "Guwahati",
    country: "India",
    heroTitle: "Begin Northeast Stories in Guwahati",
    subtitle: "Brahmaputra sunsets, temples, craft markets, river islands, and Assamese food.",
    backgroundImage: cityPhotoUrl("Guwahati"),
    shortDescription: "Explore Guwahati through river life, temple etiquette, craft markets, Assamese flavors, and gateways to Northeast culture.",
    rating: "4.5",
    bestTime: "October to April",
    cultureTags: ["Brahmaputra", "Temples", "Craft", "Assamese Food"]
  },
  {
    city: "Bhubaneswar",
    country: "India",
    heroTitle: "Read Bhubaneswar's Temple Stones",
    subtitle: "Kalinga temples, craft villages, Odia food, museums, and festival traditions.",
    backgroundImage: cityPhotoUrl("Bhubaneswar"),
    shortDescription: "Discover Bhubaneswar through temple architecture, craft villages, museums, Odia kitchens, and respectful sacred-site visits.",
    rating: "4.6",
    bestTime: "October to March",
    cultureTags: ["Temples", "Kalinga", "Craft", "Odia Food"]
  },
  {
    city: "Chandigarh",
    country: "India",
    heroTitle: "See Chandigarh's Designed Calm",
    subtitle: "Modernist planning, gardens, museums, lake walks, and Punjabi-Haryanvi culture.",
    backgroundImage: cityPhotoUrl("Chandigarh"),
    shortDescription: "Explore Chandigarh through architecture, gardens, lake paths, museums, food, and nearby craft traditions.",
    rating: "4.5",
    bestTime: "October to March",
    cultureTags: ["Modernism", "Gardens", "Museums", "Food"]
  },
  {
    city: "Bhopal",
    country: "India",
    heroTitle: "Discover Bhopal's Lakes and Legacies",
    subtitle: "Lakeside calm, old bazaars, tribal museums, mosques, and regional food.",
    backgroundImage: cityPhotoUrl("Bhopal"),
    shortDescription: "Move through Bhopal's lake views, old city markets, tribal art museums, sacred architecture, and warm local kitchens.",
    rating: "4.5",
    bestTime: "October to March",
    cultureTags: ["Lakes", "Museums", "Bazaars", "Tribal Art"]
  },
  {
    city: "Madurai",
    country: "India",
    heroTitle: "Step Into Madurai's Temple City",
    subtitle: "Meenakshi temple traditions, flower markets, jasmine, food, and Tamil heritage.",
    backgroundImage: cityPhotoUrl("Madurai"),
    shortDescription: "Experience Madurai with temple respect, flower markets, old lanes, local food, and living Tamil cultural traditions.",
    rating: "4.8",
    bestTime: "October to March",
    cultureTags: ["Temples", "Jasmine", "Markets", "Tamil Food"]
  }
];


const additionalMajorCityDestinations = [
  ["Indore", "indore,rajwada,india", "street food, royal markets, old neighborhoods, and Malwa hospitality", ["Food", "Markets", "Palaces", "Malwa"]],
  ["Surat", "surat,diamond,gujarat", "textile markets, riverfront evenings, diamond craft, and Gujarati food", ["Textiles", "Food", "Riverfront", "Craft"]],
  ["Patna", "patna,ganga,india", "Ganga history, museums, old markets, Buddhist circuits, and Bihari food", ["Ganga", "Museums", "Markets", "Food"]],
  ["Visakhapatnam", "visakhapatnam,beach,india", "coastal viewpoints, Buddhist heritage, seafood, hills, and harbor stories", ["Coast", "Buddhist Heritage", "Seafood", "Hills"]],
  ["Nagpur", "nagpur,india,heritage", "orange markets, central India museums, food streets, and regional craft", ["Markets", "Museums", "Food", "Craft"]],
  ["Nashik", "nashik,ghats,vineyard,india", "river ghats, temple culture, vineyards, and relaxed Maharashtrian food", ["Ghats", "Temples", "Vineyards", "Food"]],
  ["Aurangabad", "aurangabad,ellora,ajanta", "Ajanta-Ellora gateways, Deccan monuments, silk craft, and old city food", ["Caves", "Deccan", "Silk", "Monuments"]],
  ["Thiruvananthapuram", "thiruvananthapuram,kerala,temple", "temples, museums, beaches, classical art, and Kerala food", ["Temples", "Museums", "Coast", "Classical Art"]],
  ["Pondicherry", "pondicherry,french-quarter,india", "French-Tamil streets, seaside walks, ashram calm, cafes, and craft shops", ["French Quarter", "Coast", "Cafes", "Craft"]],
  ["Coimbatore", "coimbatore,western-ghats,india", "textile heritage, temple trails, Kongu food, and Western Ghats access", ["Textiles", "Temples", "Kongu Food", "Ghats"]]
].map(([city, query, description, cultureTags]) => ({
  city,
  country: "India",
  heroTitle: `Discover ${city}'s Cultural Layers`,
  subtitle: `Local culture, heritage walks, food trails, and authentic experiences in ${city}.`,
  backgroundImage: cityPhotoUrl(city),
  shortDescription: `Explore ${city} through ${description}.`,
  rating: "4.6",
  bestTime: "October to March",
  cultureTags
}));

const allPreviewDestinations = [...previewDestinations, ...additionalMajorCityDestinations].map((destination) => ({
  ...destination,
  backgroundImage: cityPhotoUrl(destination.city)
}));
const fallbackPlaces = allPreviewDestinations.slice(0, 18).map((destination, index) => ({
  id: createDemoRecordId("place", destination.city),
  name: `${destination.city} Local Heritage Trail`,
  city: destination.city,
  category: ["Architecture", "Food", "Craft", "Neighborhood"][index % 4],
  description: destination.shortDescription,
  location: `Central ${destination.city}`,
  entryFee: "Free / verify locally",
  bestTime: destination.bestTime,
  cultureType: destination.cultureTags[0] || "Heritage",
  hiddenGemScore: 8 + (index % 2),
  imageUrl: destination.backgroundImage
}));

const fallbackEvents = allPreviewDestinations.slice(0, 18).map((destination, index) => ({
  id: createDemoRecordId("event", destination.city),
  name: `${destination.city} Cultural Walk`,
  city: destination.city,
  date: "Demo slots available this week",
  category: ["Heritage Walk", "Food Walk", "Craft Workshop", "Performance"][index % 4],
  location: `Old ${destination.city}`,
  description: `A guided local experience around ${destination.cultureTags.join(", ").toLowerCase()} with respectful cultural context.`,
  price: "Rs.500 onward",
  imageUrl: destination.backgroundImage
}));

const fallbackHosts = allPreviewDestinations.slice(0, 18).map((destination, index) => ({
  id: createDemoRecordId("host", destination.city),
  name: `${["Aarav", "Meera", "Sana", "Kabir", "Nisha", "Arun"][index % 6]} ${destination.city} Guide`,
  city: destination.city,
  experienceType: ["Heritage Walk", "Food Trail", "Craft Workshop", "Local Storytelling"][index % 4],
  description: `A demo-ready host experience for ${destination.city}, focused on ${destination.cultureTags.slice(0, 3).join(", ").toLowerCase()}.`,
  price: `Rs.${900 + (index % 5) * 300} per person`,
  rating: (4.5 + (index % 5) * 0.1).toFixed(1),
  contact: `demo-${slugifyCity(destination.city)}@destingo.local`,
  imageUrl: destination.backgroundImage
}));
const uiText = {
  en: {
    nav: {
      overview: "Overview",
      planner: "Planner",
      "hidden-gems": "Gems",
      experiences: "Experience",
      events: "Events",
      "my-trips": "Trips"
    },
    demoLogin: "Demo Login",
    logout: "Logout",
    bookNow: "Book Now",
    culturalStay: "Cultural Stay",
    connectFirestore: "Connect Firestore",
    generatePlan: "Generate Plan",
    respectMeter: "Respect Meter",
    days: "Days",
    trip: "Trip",
    chatTitle: "DestinGo Chat",
    chatWelcome: "Namaste! Ask me anything about the selected city.",
    chatPlaceholder: "Ask about culture, food, safety...",
    send: "Send",
    language: "Language",
    hide: "Hide",
    thinking: "Thinking...",
    overviewKicker: "DestinGo",
    overviewTitle: "at a Glance",
    overviewIntro: "Choose a city, explore real cultural highlights, then use the pages above for planning, gems, experiences, events, and saved trips.",
    bestTime: "Best Time",
    rating: "Rating",
    database: "Database",
    firestoreLive: "Firestore live",
    demoData: "Demo data active",
    aiBackend: "AI Backend",
    geminiReady: "Gemini API routes ready",
    deploymentReady: "Deployment Ready",
    deploymentText: "Frontend build, Express API, Firebase Auth, Firestore, Gemini routes, demo fallback, Vercel config, and Firebase Hosting config are ready for production deployment.",
    openPlanner: "Open Planner",
    plannerKicker: "AI Trip Planner",
    plannerTitle: "Gemini Itinerary Output",
    saveTrip: "Save Trip",
    respectTitle: "Travel With Care",
    gemsKicker: "Hidden Gems",
    gemsTitle: "Firestore Places With Gemini Stories",
    gemsIntro: "Filter city places from Firestore or demo data, then ask Gemini for a respectful local story.",
    entryFee: "Entry fee",
    culture: "Culture",
    tellStory: "Tell Story",
    experiencesKicker: "Local Experiences",
    experiencesTitle: "Hosts, Artists, Guides, Workshops",
    experiencesIntro: "Request cultural experiences and save booking requests with pending status.",
    requestExperience: "Request Experience",
    eventsKicker: "Events",
    eventsTitle: "Cultural Events From Firestore",
    eventsIntro: "Browse heritage walks, folk music, food walks, craft workshops, exhibitions, and festival moments.",
    date: "Date",
    location: "Location",
    price: "Price",
    tripsKicker: "My Trips",
    tripsTitle: "Saved Firestore Itineraries",
    tripsIntro: "Saved trips stay linked to the current Firebase user, including anonymous demo users.",
    noTrips: "No saved trips yet. Create and save a trip from Planner.",
    anonymousUser: "Anonymous demo user",
    created: "Created",
    interests: "Interests",
    login: "Login",
    email: "Email",
    password: "Password",
    continueDemo: "Continue as demo guest"
  },
  hi: {
    nav: {
      overview: "\u0905\u0935\u0932\u094b\u0915\u0928",
      planner: "\u092f\u094b\u091c\u0928\u093e",
      "hidden-gems": "\u0930\u0924\u094d\u0928",
      experiences: "\u0905\u0928\u0941\u092d\u0935",
      events: "\u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e",
      "my-trips": "\u092f\u093e\u0924\u094d\u0930\u093e\u090f\u0902"
    },
    demoLogin: "\u0921\u0947\u092e\u094b \u0932\u0949\u0917\u093f\u0928",
    logout: "\u0932\u0949\u0917\u0906\u0909\u091f",
    bookNow: "\u0905\u092d\u0940 \u092c\u0941\u0915 \u0915\u0930\u0947\u0902",
    culturalStay: "\u0938\u093e\u0902\u0938\u094d\u0915\u0943\u0924\u093f\u0915 \u092f\u093e\u0924\u094d\u0930\u093e",
    connectFirestore: "Firestore \u091c\u094b\u0921\u093c\u0947\u0902",
    generatePlan: "\u092f\u094b\u091c\u0928\u093e \u092c\u0928\u093e\u090f\u0902",
    respectMeter: "\u0938\u092e\u094d\u092e\u093e\u0928 \u092e\u0940\u091f\u0930",
    days: "\u0926\u093f\u0928",
    trip: "\u092f\u093e\u0924\u094d\u0930\u093e",
    chatTitle: "DestinGo \u091a\u0948\u091f",
    chatWelcome: "\u0928\u092e\u0938\u094d\u0924\u0947! \u091a\u0941\u0928\u0947 \u0939\u0941\u090f \u0936\u0939\u0930 \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902 \u0915\u0941\u091b \u092d\u0940 \u092a\u0942\u091b\u0947\u0902\u0964",
    chatPlaceholder: "\u0938\u0902\u0938\u094d\u0915\u0943\u0924\u093f, \u092d\u094b\u091c\u0928, \u0938\u0941\u0930\u0915\u094d\u0937\u093e \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902 \u092a\u0942\u091b\u0947\u0902...",
    send: "\u092d\u0947\u091c\u0947\u0902",
    language: "\u092d\u093e\u0937\u093e",
    hide: "\u091b\u0941\u092a\u093e\u090f\u0902",
    thinking: "\u0938\u094b\u091a \u0930\u0939\u093e \u0939\u0948...",
    overviewKicker: "DestinGo",
    overviewTitle: "\u090f\u0915 \u0928\u091c\u093c\u0930 \u092e\u0947\u0902",
    overviewIntro: "\u0936\u0939\u0930 \u091a\u0941\u0928\u0947\u0902, \u0938\u093e\u0902\u0938\u094d\u0915\u0943\u0924\u093f\u0915 \u091d\u0932\u0915\u093f\u092f\u093e\u0902 \u0926\u0947\u0916\u0947\u0902, \u092b\u093f\u0930 \u092f\u094b\u091c\u0928\u093e, \u0930\u0924\u094d\u0928, \u0905\u0928\u0941\u092d\u0935, \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e \u0914\u0930 \u0938\u0947\u0935 \u092f\u093e\u0924\u094d\u0930\u093e\u090f\u0902 \u0916\u094b\u0932\u0947\u0902\u0964",
    bestTime: "\u0938\u0930\u094d\u0935\u0936\u094d\u0930\u0947\u0937\u094d\u0920 \u0938\u092e\u092f",
    rating: "\u0930\u0947\u091f\u093f\u0902\u0917",
    database: "\u0921\u0947\u091f\u093e\u092c\u0947\u0938",
    firestoreLive: "Firestore \u0932\u093e\u0907\u0935",
    demoData: "\u0921\u0947\u092e\u094b \u0921\u0947\u091f\u093e \u0938\u0915\u094d\u0930\u093f\u092f",
    aiBackend: "AI \u092c\u0948\u0915\u090f\u0902\u0921",
    geminiReady: "Gemini API \u092e\u093e\u0930\u094d\u0917 \u0924\u0948\u092f\u093e\u0930",
    deploymentReady: "\u0921\u093f\u092a\u094d\u0932\u0949\u092f\u092e\u0947\u0902\u091f \u0924\u0948\u092f\u093e\u0930",
    deploymentText: "\u092b\u094d\u0930\u0902\u091f\u090f\u0902\u0921 \u092c\u093f\u0932\u094d\u0921, Express API, Firebase Auth, Firestore, Gemini routes, demo fallback, Vercel config \u0914\u0930 Firebase Hosting config \u0924\u0948\u092f\u093e\u0930 \u0939\u0948\u0902\u0964",
    openPlanner: "\u092a\u094d\u0932\u093e\u0928\u0930 \u0916\u094b\u0932\u0947\u0902",
    plannerKicker: "AI \u092f\u093e\u0924\u094d\u0930\u093e \u092a\u094d\u0932\u093e\u0928\u0930",
    plannerTitle: "Gemini \u092f\u093e\u0924\u094d\u0930\u093e \u092f\u094b\u091c\u0928\u093e",
    saveTrip: "\u092f\u093e\u0924\u094d\u0930\u093e \u0938\u0947\u0935 \u0915\u0930\u0947\u0902",
    respectTitle: "\u0938\u092e\u094d\u092e\u093e\u0928 \u0915\u0947 \u0938\u093e\u0925 \u092f\u093e\u0924\u094d\u0930\u093e",
    gemsKicker: "\u091b\u093f\u092a\u0947 \u0930\u0924\u094d\u0928",
    gemsTitle: "Firestore \u0938\u094d\u0925\u093e\u0928 \u0914\u0930 Gemini \u0915\u0939\u093e\u0928\u093f\u092f\u093e\u0902",
    gemsIntro: "Firestore \u092f\u093e demo data \u0938\u0947 \u0938\u094d\u0925\u093e\u0928 \u092b\u093f\u0932\u094d\u091f\u0930 \u0915\u0930\u0947\u0902 \u0914\u0930 Gemini \u0938\u0947 \u0938\u094d\u0925\u093e\u0928\u0940\u092f \u0915\u0939\u093e\u0928\u0940 \u092a\u0942\u091b\u0947\u0902\u0964",
    entryFee: "\u092a\u094d\u0930\u0935\u0947\u0936 \u0936\u0941\u0932\u094d\u0915",
    culture: "\u0938\u0902\u0938\u094d\u0915\u0943\u0924\u093f",
    tellStory: "\u0915\u0939\u093e\u0928\u0940 \u0938\u0941\u0928\u093e\u090f\u0902",
    experiencesKicker: "\u0938\u094d\u0925\u093e\u0928\u0940\u092f \u0905\u0928\u0941\u092d\u0935",
    experiencesTitle: "\u0939\u094b\u0938\u094d\u091f, \u0915\u0932\u093e\u0915\u093e\u0930, \u0917\u093e\u0907\u0921, \u0935\u0930\u094d\u0915\u0936\u0949\u092a",
    experiencesIntro: "\u0938\u093e\u0902\u0938\u094d\u0915\u0943\u0924\u093f\u0915 \u0905\u0928\u0941\u092d\u0935 \u0915\u093e \u0905\u0928\u0941\u0930\u094b\u0927 \u0915\u0930\u0947\u0902 \u0914\u0930 booking request \u0938\u0947\u0935 \u0915\u0930\u0947\u0902\u0964",
    requestExperience: "\u0905\u0928\u0941\u092d\u0935 \u0905\u0928\u0941\u0930\u094b\u0927 \u0915\u0930\u0947\u0902",
    eventsKicker: "\u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e",
    eventsTitle: "Firestore \u0938\u093e\u0902\u0938\u094d\u0915\u0943\u0924\u093f\u0915 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e",
    eventsIntro: "\u0939\u0947\u0930\u093f\u091f\u0947\u091c \u0935\u0949\u0915, \u0932\u094b\u0915 \u0938\u0902\u0917\u0940\u0924, \u092b\u0942\u0921 \u0935\u0949\u0915, craft workshops, exhibitions \u0914\u0930 festival moments \u0926\u0947\u0916\u0947\u0902\u0964",
    date: "\u0924\u093e\u0930\u0940\u0916",
    location: "\u0938\u094d\u0925\u093e\u0928",
    price: "\u0915\u0940\u092e\u0924",
    tripsKicker: "\u092e\u0947\u0930\u0940 \u092f\u093e\u0924\u094d\u0930\u093e\u090f\u0902",
    tripsTitle: "\u0938\u0947\u0935 \u0915\u0940 \u0917\u0908 \u092f\u093e\u0924\u094d\u0930\u093e\u090f\u0902",
    tripsIntro: "\u0938\u0947\u0935 \u092f\u093e\u0924\u094d\u0930\u093e\u090f\u0902 \u0935\u0930\u094d\u0924\u092e\u093e\u0928 Firebase user \u0938\u0947 \u091c\u0941\u0921\u093c\u0940 \u0930\u0939\u0924\u0940 \u0939\u0948\u0902\u0964",
    noTrips: "\u0905\u092d\u0940 \u0915\u094b\u0908 \u092f\u093e\u0924\u094d\u0930\u093e \u0938\u0947\u0935 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 Planner \u0938\u0947 \u092f\u093e\u0924\u094d\u0930\u093e \u092c\u0928\u093e\u0915\u0930 \u0938\u0947\u0935 \u0915\u0930\u0947\u0902\u0964",
    anonymousUser: "\u0905\u0928\u093e\u092e \u0921\u0947\u092e\u094b user",
    created: "\u092c\u0928\u093e\u092f\u093e \u0917\u092f\u093e",
    interests: "\u0930\u0941\u091a\u093f\u092f\u093e\u0902",
    login: "\u0932\u0949\u0917\u093f\u0928",
    email: "\u0908\u092e\u0947\u0932",
    password: "\u092a\u093e\u0938\u0935\u0930\u094d\u0921",
    continueDemo: "\u0921\u0947\u092e\u094b guest \u0915\u0947 \u0930\u0942\u092a \u092e\u0947\u0902 \u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902"
  }
};
function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort();
}

function formatDate(value) {
  if (!value) return "Pending timestamp";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  return String(value);
}

function SectionTitle({ kicker, title, children }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">{kicker}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">{title}</h2>
      {children ? <p className="mt-4 text-base leading-7 text-slate-300">{children}</p> : null}
    </div>
  );
}

function StatusMessage({ type = "info", children }) {
  const tone =
    type === "error"
      ? "border-red-300/30 bg-red-500/12 text-red-100"
      : type === "success"
        ? "border-emerald-300/30 bg-emerald-500/12 text-emerald-100"
        : "border-sky-300/30 bg-sky-500/12 text-sky-100";

  return <div className={`rounded-3xl border px-4 py-3 text-sm ${tone}`}>{children}</div>;
}


function SmartImage({ alt, city, className, src }) {
  const [currentSrc, setCurrentSrc] = useState(defaultHeroImage);

  useEffect(() => {
    let cancelled = false;
    setCurrentSrc(defaultHeroImage);

    resolveCityImage(city, defaultHeroImage).then((resolvedSrc) => {
      if (!cancelled) setCurrentSrc(resolvedSrc);
    });

    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <img
      alt={alt}
      className={className}
      src={currentSrc}
      onError={() => resolveCityImage(city, defaultHeroImage).then(setCurrentSrc)}
    />
  );
}
function TextResult({ text }) {
  if (!text) return null;

  return (
    <div className="soft-panel rounded-3xl p-5 text-sm leading-7 text-slate-100">
      <div className="whitespace-pre-wrap">{text}</div>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState(() => getPageFromPath());
  const [appLanguage, setAppLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");

  const [destinations, setDestinations] = useState([]);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loadState, setLoadState] = useState({ loading: true, error: "" });

  const [planner, setPlanner] = useState(initialPlanner);
  const [itinerary, setItinerary] = useState("");
  const [tripDraft, setTripDraft] = useState(null);
  const [plannerState, setPlannerState] = useState({ loading: false, message: "", error: "" });

  const [respectState, setRespectState] = useState({ loading: false, text: "", error: "" });
  const [storyState, setStoryState] = useState({ id: "", loading: false, text: "", error: "" });
  const [savedTrips, setSavedTrips] = useState([]);
  const [bookingState, setBookingState] = useState({ loadingId: "", message: "", error: "" });
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatState, setChatState] = useState({ loading: false, error: "" });
  const [heroImage, setHeroImage] = useState(defaultHeroImage);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  const [placeFilters, setPlaceFilters] = useState({ city: "All", category: "All", cultureType: "All" });
  const [eventFilters, setEventFilters] = useState({ city: "All", category: "All" });
  const [hostFilters, setHostFilters] = useState({ city: "All", type: "All" });

  useEffect(() => {
    const syncRoute = () => setActiveSection(getPageFromPath());
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!firebaseReady) {
        setDestinations(allPreviewDestinations);
        setPlaces(fallbackPlaces);
        setEvents(fallbackEvents);
        setHosts(fallbackHosts);
        setSelectedCity("Kerala");
        setLoadState({ loading: false, error: "" });
        return;
      }

      try {
        setLoadState({ loading: true, error: "" });
        const [destinationData, placeData, eventData, hostData] = await Promise.all([
          fetchDestinations(),
          fetchPlaces(),
          fetchEvents(),
          fetchHosts()
        ]);
        setDestinations(destinationData);
        setPlaces(placeData);
        setEvents(eventData);
        setHosts(hostData);
        setSelectedCity(destinationData.find((destination) => destination.city === "Kerala")?.city || destinationData[0]?.city || "Kerala");
        setLoadState({ loading: false, error: "" });
      } catch (error) {
        setDestinations(allPreviewDestinations);
        setPlaces(fallbackPlaces);
        setEvents(fallbackEvents);
        setHosts(fallbackHosts);
        setSelectedCity("Kerala");
        setLoadState({ loading: false, error: error.message });
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadTrips() {
      if (!user) {
        setSavedTrips([]);
        return;
      }

      if (!firebaseReady) {
        setSavedTrips(readLocalList(`DestinGo-trips-${user.uid}`));
        return;
      }

      try {
        setSavedTrips(await fetchSavedTrips(user.uid));
      } catch (error) {
        setSavedTrips(readLocalList(`DestinGo-trips-${user.uid}`));
        setPlannerState((state) => ({ ...state, error: error.message }));
      }
    }

    loadTrips();
  }, [user, plannerState.message]);

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.city === selectedCity) || destinations[0],
    [destinations, selectedCity]
  );

  const displayDestinations = useMemo(() => {
    if (destinations.length > 0) return destinations;
    return allPreviewDestinations;
  }, [destinations]);
  const activeCity = selectedCity || "Kerala";
  const visualDestination = displayDestinations.find((destination) => destination.city === activeCity) || selectedDestination || previewDestination;
  const heroCity = visualDestination.city || "Jaipur";
  const textLabels = uiText[appLanguage];
  const languageName = appLanguage === "hi" ? "Hindi" : "English";
  const heroLines =
    heroCity === "Varanasi"
      ? ["Experience", "the Soul", "of Varanasi."]
      : heroCity === "Delhi"
        ? ["Discover Delhi", "Beyond Tourist", "Spots."]
        : heroCity === "Goa"
          ? ["Find Goa's", "Local", "Rhythm."]
          : heroCity === "Kerala"
            ? ["Embrace God's", "Own Country in", "Kerala"]
            : ["Your Perfect", "Cultural Escape", `in ${heroCity}.`];
  const plannerReady = Boolean(visualDestination) && !plannerState.loading;

  useEffect(() => {
    let cancelled = false;
    setHeroImageLoaded(false);

    resolveCityImage(heroCity, defaultHeroImage).then((imageUrl) => {
      if (!cancelled) {
        setHeroImage(imageUrl);
        requestAnimationFrame(() => setHeroImageLoaded(true));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [heroCity, visualDestination.backgroundImage]);
  const displayPlaces = places.length > 0 ? places : fallbackPlaces;
  const displayEvents = events.length > 0 ? events : fallbackEvents;
  const displayHosts = hosts.length > 0 ? hosts : fallbackHosts;

  const filteredPlaces = useMemo(
    () =>
      displayPlaces.filter((place) => {
        const cityOk = placeFilters.city === "All" || place.city === placeFilters.city;
        const categoryOk = placeFilters.category === "All" || place.category === placeFilters.category;
        const cultureOk = placeFilters.cultureType === "All" || place.cultureType === placeFilters.cultureType;
        return cityOk && categoryOk && cultureOk;
      }),
    [displayPlaces, placeFilters]
  );

  const filteredEvents = useMemo(
    () =>
      displayEvents.filter((event) => {
        const cityOk = eventFilters.city === "All" || event.city === eventFilters.city;
        const categoryOk = eventFilters.category === "All" || event.category === eventFilters.category;
        return cityOk && categoryOk;
      }),
    [displayEvents, eventFilters]
  );

  const filteredHosts = useMemo(
    () =>
      displayHosts.filter((host) => {
        const cityOk = hostFilters.city === "All" || host.city === hostFilters.city;
        const typeOk = hostFilters.type === "All" || host.experienceType === hostFilters.type;
        return cityOk && typeOk;
      }),
    [displayHosts, hostFilters]
  );

  async function ensureUser() {
    if (user) return user;
    if (!auth) {
      const localUser = createLocalDemoUser();
      setUser(localUser);
      return localUser;
    }
    const credential = await signInAnonymously(auth);
    return credential.user;
  }

  async function handleLogout() {
    if (auth) {
      await signOut(auth);
      return;
    }
    setUser(null);
  }

  async function handleEmailLogin(event) {
    event.preventDefault();
    setAuthError("");

    try {
      if (!auth) {
        setUser(createLocalDemoUser());
        return;
      }
      await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleGuestLogin() {
    setAuthError("");

    try {
      await ensureUser();
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleGeneratePlan(event) {
    event.preventDefault();
    if (!visualDestination) return;

    setPlannerState({ loading: true, message: "", error: "" });
    setItinerary("");
    setTripDraft(null);

    try {
      const input = {
        destination: visualDestination.city,
        days: planner.days,
        budget: planner.budget,
        interests: planner.interests,
        travelStyle: planner.travelStyle,
        language: planner.language
      };
      const result = await generateItinerary(input);
      setItinerary(result.text);
      setTripDraft({ ...input, itinerary: result.text });
      setPlannerState({ loading: false, message: "Itinerary generated by Gemini.", error: "" });
      handleNavClick("planner");
    } catch (error) {
      setPlannerState({ loading: false, message: "", error: error.message });
    }
  }

  async function handleSaveTrip() {
    if (!tripDraft) return;

    setPlannerState((state) => ({ ...state, message: "", error: "" }));

    try {
      const currentUser = await ensureUser();
      if (!firebaseReady) {
        const key = `DestinGo-trips-${currentUser.uid}`;
        const localTrip = { ...tripDraft, id: createLocalId("trip"), createdAt: new Date().toISOString() };
        const nextTrips = [localTrip, ...readLocalList(key)];
        writeLocalList(key, nextTrips);
        setSavedTrips(nextTrips);
        setPlannerState({ loading: false, message: "Trip saved locally for demo deployment.", error: "" });
        return;
      }
      await saveTrip(currentUser.uid, tripDraft);
      setPlannerState({ loading: false, message: "Trip saved to Firestore.", error: "" });
    } catch (error) {
      setPlannerState({ loading: false, message: "", error: error.message });
    }
  }

  async function handleRespectTips() {
    if (!visualDestination) return;

    setRespectState({ loading: true, text: "", error: "" });

    try {
      const result = await getCultureRespectTips({
        destination: visualDestination.city,
        placeType: "heritage site and local neighborhood",
        language: planner.language
      });
      setRespectState({ loading: false, text: result.text, error: "" });
    } catch (error) {
      setRespectState({ loading: false, text: "", error: error.message });
    }
  }

  async function handleStory(place) {
    setStoryState({ id: place.id, loading: true, text: "", error: "" });

    try {
      const result = await generateStory({
        placeName: place.name,
        city: place.city,
        description: place.description,
        language: planner.language,
        mode: "cinematic"
      });
      setStoryState({ id: place.id, loading: false, text: result.text, error: "" });
    } catch (error) {
      setStoryState({ id: place.id, loading: false, text: "", error: error.message });
    }
  }

  async function handleBooking(host) {
    setBookingState({ loadingId: host.id, message: "", error: "" });

    try {
      const currentUser = await ensureUser();
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      if (!firebaseReady) {
        const key = `DestinGo-bookings-${currentUser.uid}`;
        const booking = {
          id: createLocalId("booking"),
          userId: currentUser.uid,
          hostId: host.id,
          experienceName: host.experienceType,
          city: host.city,
          date,
          status: "pending",
          createdAt: new Date().toISOString()
        };
        writeLocalList(key, [booking, ...readLocalList(key)]);
        setBookingState({ loadingId: "", message: `Booking request saved for ${host.name} in demo mode.`, error: "" });
        return;
      }
      await createBooking(currentUser.uid, host, date);
      setBookingState({ loadingId: "", message: `Booking request saved for ${host.name}.`, error: "" });
    } catch (error) {
      setBookingState({ loadingId: "", message: "", error: error.message });
    }
  }



  function handleNavClick(sectionId) {
    setActiveSection(sectionId);
    window.history.pushState({}, "", pageRoutes[sectionId] || "/overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function handleLanguageChange(languageCode) {
    setAppLanguage(languageCode);
    setPlanner((current) => ({ ...current, language: languageCode === "hi" ? "Hindi" : "English" }));
  }

  async function handleSendChat(event) {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || chatState.loading) return;

    const userMessage = { role: "user", content: message };
    const nextMessages = [...chatMessages, userMessage];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatState({ loading: true, error: "" });

    try {
      const result = await chatWithDestinGo({
        message,
        destination: visualDestination.city,
        language: appLanguage === "hi" ? "Hindi" : "English",
        interests: planner.interests,
        history: nextMessages
      });
      setChatMessages([...nextMessages, { role: "assistant", content: result.text }]);
      setChatState({ loading: false, error: "" });
    } catch (error) {
      setChatState({ loading: false, error: error.message });
      setChatMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            appLanguage === "hi"
              ? "\u092e\u0941\u091d\u0947 \u091c\u0935\u093e\u092c \u0926\u0947\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f Gemini API key \u091a\u093e\u0939\u093f\u090f. \u0915\u0943\u092a\u092f\u093e .env \u092e\u0947\u0902 GEMINI_API_KEY \u091c\u094b\u0921\u093c\u0947\u0902."
              : "I need a Gemini API key to answer live. Add GEMINI_API_KEY in .env to enable the chatbot."
        }
      ]);
    }
  }

  return (
    <main className="min-h-screen bg-[#061626] text-white">
      <section
        className={`hero-stage relative min-h-screen overflow-hidden bg-cover bg-center ${heroImageLoaded ? "hero-image-loaded" : ""}`}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-bluewash" />
        <div className="hero-vignette" />

        <div className="hero-frame relative z-10 mx-auto flex min-h-[calc(100vh-32px)] w-[min(1560px,calc(100%-32px))] flex-col overflow-hidden rounded-[34px] border border-white/30 px-7 py-7 shadow-[0_30px_100px_rgba(0,0,0,0.4)] md:min-h-[calc(100vh-52px)] md:w-[min(1560px,calc(100%-56px))] md:rounded-[42px] md:px-10 lg:px-12">
          <div className="hero-grid-lines" />

          <nav className="relative z-20 flex items-center justify-between gap-6">
            <button
              className="flex items-center gap-3 text-left text-white"
              onClick={() => handleNavClick("overview")}
              type="button"
            >
              <span className="grid h-7 w-7 rotate-45 place-items-center border border-white/85">
                <Compass className="-rotate-45" size={15} />
              </span>
              <span className="text-base font-semibold tracking-tight">DestinGo</span>
            </button>

            <div className="hidden items-center gap-9 text-sm text-white/90 md:flex">
              {navItems.slice(0, 5).map(([id, label]) => (
                <button className="transition hover:text-white" key={id} onClick={() => handleNavClick(id)} type="button">
                  {textLabels.nav[id] || label}
                </button>
              ))}
            </div>

            <label className="language-switch hidden items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur md:flex">
              <Languages size={15} />
              <span className="sr-only">{textLabels.language}</span>
              <select
                className="bg-transparent text-white outline-none"
                value={appLanguage}
                onChange={(event) => handleLanguageChange(event.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </label>
            <button
              className="rounded-xl bg-white px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition hover:bg-sky-100"
              onClick={() => handleNavClick("experiences")}
              type="button"
            >
              {textLabels.bookNow}
            </button>
          </nav>

          <div className="relative z-10 grid flex-1 items-end gap-8 pb-8 pt-20 lg:grid-cols-[1.25fr_0.75fr] lg:pb-12 lg:pt-24">
            <div className="max-w-[650px]">
              <h1 className="hero-title text-[clamp(4.4rem,8.4vw,8.2rem)] font-light leading-[0.92] tracking-normal text-white drop-shadow-[0_18px_45px_rgba(0,0,0,0.38)]">
                <span className="block">{heroLines[0]}</span>
                <span className="block text-white/55">{heroLines[1]}</span>
                <span className="block">{heroLines[2]}</span>
              </h1>

              <div className="mt-28 flex flex-col gap-5 md:flex-row md:items-end md:gap-12">
                <p className="max-w-[330px] text-sm font-medium leading-6 text-white">
                  {visualDestination.shortDescription}
                </p>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-2xl font-semibold text-white">
                      <Star size={17} fill="currentColor" /> {visualDestination.rating}
                    </div>
                    <p className="mt-2 text-sm text-white/90">Best from {visualDestination.bestTime}</p>
                  </div>
                  <div className="flex -space-x-2">
                    {visualDestination.cultureTags.slice(0, 4).map((tag) => (
                      <span className="avatar-chip" key={tag}>{tag.slice(0, 1)}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <form className="booking-card justify-self-end rounded-[28px] p-6 md:w-[430px]" onSubmit={handleGeneratePlan}>
              <h2 className="text-2xl font-semibold text-white">{heroCity} {textLabels.culturalStay}</h2>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="sr-only" htmlFor="hero-destination">Destination</label>
                <select
                  className="hero-input col-span-2"
                  id="hero-destination"
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value)}
                  disabled={displayDestinations.length === 0}
                >
                  {displayDestinations.length === 0 ? <option value="">{textLabels.connectFirestore}</option> : null}
                  {displayDestinations.map((destination) => (
                    <option key={destination.id || destination.city} value={destination.city}>
                      {destination.city}
                    </option>
                  ))}
                </select>

                <label className="hero-input flex items-center gap-2 text-xs text-white/85">
                  <CalendarDays size={14} />
                  <input
                    className="w-full bg-transparent text-white outline-none"
                    min="1"
                    onChange={(event) => setPlanner({ ...planner, days: event.target.value })}
                    type="number"
                    value={planner.days}
                  />
                </label>
                <label className="hero-input flex items-center gap-2 text-xs text-white/85">
                  <MapPin size={14} />
                  <select
                    className="w-full bg-transparent text-white outline-none"
                    onChange={(event) => setPlanner({ ...planner, language: event.target.value })}
                    value={planner.language}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </label>
                <label className="hero-input col-span-2 text-xs text-white/85">
                  <input
                    className="w-full bg-transparent text-white outline-none"
                    onChange={(event) => setPlanner({ ...planner, interests: event.target.value })}
                    value={planner.interests}
                  />
                </label>
              </div>

              <div className="mt-6 flex items-end justify-between gap-4">
                <label className="text-3xl font-semibold text-white">
                  <span className="sr-only">Budget</span>
                  <input
                    className="w-36 bg-transparent text-white outline-none"
                    onChange={(event) => setPlanner({ ...planner, budget: event.target.value })}
                    value={planner.budget}
                  />
                  <span className="text-xs font-normal text-white/75"> /{textLabels.trip}</span>
                </label>
                <span className="pb-1 text-sm text-white/90">{planner.days || 1} {textLabels.days}</span>
              </div>

              <button
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!plannerReady}
                type="submit"
              >
                {plannerState.loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={17} />}
                {textLabels.generatePlan}
              </button>

              <button
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!visualDestination || respectState.loading}
                onClick={handleRespectTips}
                type="button"
              >
                {respectState.loading ? <Loader2 className="animate-spin" size={17} /> : <ShieldCheck size={17} />}
                {textLabels.respectMeter}
              </button>
            </form>
          </div>
        </div>
      </section>
      {activeSection === "overview" ? (
        <section className="page-section mx-auto max-w-7xl px-4 py-12 md:px-8" id="overview">
          <SectionTitle kicker={textLabels.overviewKicker} title={`${heroCity} ${textLabels.overviewTitle}`}>
            {textLabels.overviewIntro}
          </SectionTitle>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              [textLabels.bestTime, visualDestination.bestTime],
              [textLabels.rating, visualDestination.rating],
              [textLabels.database, firebaseReady ? textLabels.firestoreLive : textLabels.demoData],
              [textLabels.aiBackend, textLabels.geminiReady]
            ].map(([label, value]) => (
              <article className="soft-panel rounded-3xl p-5" key={label}>
                <p className="text-sm text-sky-200">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="soft-panel rounded-3xl p-6">
              <h3 className="text-2xl font-semibold text-white">{visualDestination.heroTitle || heroCity}</h3>
              <p className="mt-4 leading-7 text-slate-300">{visualDestination.shortDescription}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {visualDestination.cultureTags.map((tag) => (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white" key={tag}>{tag}</span>
                ))}
              </div>
            </article>
            <article className="soft-panel rounded-3xl p-6">
              <h3 className="text-2xl font-semibold text-white">{textLabels.deploymentReady}</h3>
              <p className="mt-4 leading-7 text-slate-300">{textLabels.deploymentText}</p>
              <button className="mt-6 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950" onClick={() => handleNavClick("planner")} type="button">{textLabels.openPlanner}</button>
            </article>
          </div>
        </section>
      ) : null}

      {activeSection === "planner" ? (        <section className="page-section mx-auto max-w-7xl px-4 py-12 md:px-8" id="planner">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="soft-panel rounded-3xl p-6">
            <SectionTitle kicker={textLabels.plannerKicker} title={textLabels.plannerTitle} />
            {plannerState.error ? <StatusMessage type="error">{plannerState.error}</StatusMessage> : null}
            {plannerState.message ? <StatusMessage type="success">{plannerState.message}</StatusMessage> : null}
            <div className="mt-5">
              <TextResult text={itinerary} />
            </div>
            {tripDraft ? (
              <button
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950"
                onClick={handleSaveTrip}
                type="button"
              >
                <Save size={18} /> {textLabels.saveTrip}
              </button>
            ) : null}
          </div>

          <div className="soft-panel rounded-3xl p-6">
            <SectionTitle kicker={textLabels.respectMeter} title={textLabels.respectTitle} />
            {respectState.error ? <StatusMessage type="error">{respectState.error}</StatusMessage> : null}
            <TextResult text={respectState.text} />
          </div>
        </div>
      </section>
      ) : null}

      {activeSection === "hidden-gems" ? (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8" id="hidden-gems">
          <SectionTitle kicker={textLabels.gemsKicker} title={textLabels.gemsTitle}>
            {textLabels.gemsIntro}
          </SectionTitle>
          <FilterBar
            filters={placeFilters}
            options={{
              city: uniqueValues(displayPlaces, "city"),
              category: uniqueValues(displayPlaces, "category"),
              cultureType: uniqueValues(displayPlaces, "cultureType")
            }}
            setFilters={setPlaceFilters}
          />
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlaces.map((place) => (
              <article className="soft-panel overflow-hidden rounded-3xl" key={place.id}>
                <SmartImage alt={place.name} city={place.city} className="h-56 w-full object-cover" src={place.imageUrl} />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold">{place.name}</h3>
                    <span className="rounded-full bg-sky-300 px-3 py-1 text-sm font-semibold text-slate-950">
                      {place.hiddenGemScore}/10
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-sky-200">{place.city} - {place.category}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{place.description}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-200">
                    <span>{textLabels.entryFee}: {place.entryFee}</span>
                    <span>{textLabels.bestTime}: {place.bestTime}</span>
                    <span>{textLabels.culture}: {place.cultureType}</span>
                  </div>
                  <button
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3 font-semibold hover:bg-white/10"
                    onClick={() => handleStory(place)}
                    type="button"
                  >
                    {storyState.loading && storyState.id === place.id ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <BookOpen size={18} />
                    )}
                    {textLabels.tellStory}
                  </button>
                  {storyState.id === place.id && storyState.error ? (
                    <div className="mt-4">
                      <StatusMessage type="error">{storyState.error}</StatusMessage>
                    </div>
                  ) : null}
                  {storyState.id === place.id ? (
                    <div className="mt-4">
                      <TextResult text={storyState.text} />
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeSection === "experiences" ? (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8" id="experiences">
          <SectionTitle kicker={textLabels.experiencesKicker} title={textLabels.experiencesTitle}>
            {textLabels.experiencesIntro}
          </SectionTitle>
          <FilterBar
            filters={hostFilters}
            options={{ city: uniqueValues(displayHosts, "city"), type: uniqueValues(displayHosts, "experienceType") }}
            setFilters={setHostFilters}
          />
          {bookingState.message ? <div className="mt-5"><StatusMessage type="success">{bookingState.message}</StatusMessage></div> : null}
          {bookingState.error ? <div className="mt-5"><StatusMessage type="error">{bookingState.error}</StatusMessage></div> : null}
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredHosts.map((host) => (
              <article className="soft-panel overflow-hidden rounded-3xl" key={host.id}>
                <SmartImage alt={host.name} city={host.city} className="h-56 w-full object-cover" src={host.imageUrl} />
                <div className="p-5">
                  <h3 className="text-xl font-semibold">{host.name}</h3>
                  <p className="mt-1 text-sm text-sky-200">{host.city} - {host.experienceType}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{host.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-white/10 px-3 py-1">{host.price}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">{textLabels.rating} {host.rating}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">{host.contact}</span>
                  </div>
                  <button
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-300 px-4 py-3 font-semibold text-slate-950 hover:bg-white"
                    onClick={() => handleBooking(host)}
                    type="button"
                  >
                    {bookingState.loadingId === host.id ? <Loader2 className="animate-spin" size={18} /> : <HeartHandshake size={18} />}
                    {textLabels.requestExperience}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeSection === "events" ? (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8" id="events">
          <SectionTitle kicker={textLabels.eventsKicker} title={textLabels.eventsTitle}>
            {textLabels.eventsIntro}
          </SectionTitle>
          <FilterBar
            filters={eventFilters}
            options={{ city: uniqueValues(displayEvents, "city"), category: uniqueValues(displayEvents, "category") }}
            setFilters={setEventFilters}
          />
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <article className="soft-panel overflow-hidden rounded-3xl" key={event.id}>
                <SmartImage alt={event.name} city={event.city} className="h-56 w-full object-cover" src={event.imageUrl} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    <Ticket className="text-sky-200" size={22} />
                  </div>
                  <p className="mt-1 text-sm text-sky-200">{event.city} - {event.category}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{event.description}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-200">
                    <span>{textLabels.date}: {event.date}</span>
                    <span>{textLabels.location}: {event.location}</span>
                    <span>{textLabels.price}: {event.price}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}


      <div className="chat-shell fixed bottom-5 right-5 z-50 w-[min(390px,calc(100vw-32px))]">
        {chatOpen ? (
          <section className="chat-panel overflow-hidden rounded-[26px] border border-white/15 bg-slate-950/82 shadow-[0_26px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-300 text-slate-950">
                  <MessageCircle size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{textLabels.chatTitle}</h3>
                  <p className="text-xs text-white/55">{heroCity} - {languageName}</p>
                </div>
              </div>
              <button
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75 hover:bg-white/10"
                onClick={() => setChatOpen(false)}
                type="button"
              >
                {textLabels.hide}
              </button>
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-4">
              <div className="chat-bubble assistant">
                {textLabels.chatWelcome}
              </div>
              {chatMessages.map((message, index) => (
                <div className={`chat-bubble ${message.role === "assistant" ? "assistant" : "user"}`} key={`${message.role}-${index}`}>
                  {message.content}
                </div>
              ))}
              {chatState.loading ? (
                <div className="chat-bubble assistant inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={15} /> {textLabels.thinking}
                </div>
              ) : null}
            </div>

            <form className="border-t border-white/10 p-3" onSubmit={handleSendChat}>
              {chatState.error ? <p className="mb-2 text-xs text-amber-100/85">{chatState.error}</p> : null}
              <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/10 p-2">
                <input
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/45"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder={textLabels.chatPlaceholder}
                />
                <button
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-950 transition hover:bg-sky-100 disabled:opacity-50"
                  disabled={chatState.loading || !chatInput.trim()}
                  type="submit"
                  aria-label={textLabels.send}
                >
                  <Send size={17} />
                </button>
              </div>
            </form>
          </section>
        ) : (
          <button
            className="ml-auto flex items-center gap-2 rounded-2xl bg-white px-5 py-4 font-semibold text-slate-950 shadow-[0_18px_55px_rgba(0,0,0,0.32)]"
            onClick={() => setChatOpen(true)}
            type="button"
          >
            <MessageCircle size={20} /> {textLabels.chatTitle}
          </button>
        )}
      </div>
      {activeSection === "my-trips" ? (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8" id="my-trips">
          <SectionTitle kicker={textLabels.tripsKicker} title={textLabels.tripsTitle}>
            {textLabels.tripsIntro}
          </SectionTitle>
          {!user ? (
            <div className="mx-auto max-w-xl">
              <AuthPanel
                authError={authError}
                authForm={authForm}
                handleEmailLogin={handleEmailLogin}
                handleGuestLogin={handleGuestLogin}
                setAuthForm={setAuthForm}
              />
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="soft-panel flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
                <div className="flex items-center gap-3">
                  <UserRound className="text-sky-200" />
                  <span className="text-sm text-slate-300">{user.isAnonymous ? "{textLabels.anonymousUser}" : user.email}</span>
                </div>
                <button className="rounded-full border border-white/20 px-4 py-2 text-sm" onClick={handleLogout} type="button">
                  {textLabels.logout}
                </button>
              </div>
              {savedTrips.length === 0 ? <StatusMessage>{textLabels.noTrips}</StatusMessage> : null}
              {savedTrips.map((trip) => (
                <article className="soft-panel rounded-3xl p-5" key={trip.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold">{trip.destination}</h3>
                      <p className="mt-1 text-sm text-slate-300">{textLabels.created}: {formatDate(trip.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full bg-white/10 px-3 py-1">{trip.days} days</span>
                      <span className="rounded-full bg-white/10 px-3 py-1">{trip.budget}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1">{trip.language}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-sky-200">{textLabels.interests}: {trip.interests}</p>
                  <div className="mt-4">
                    <TextResult text={trip.itinerary} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}

function FilterBar({ filters, options, setFilters }) {
  return (
    <div className="soft-panel grid gap-3 rounded-3xl p-4 md:grid-cols-3">
      {Object.entries(options).map(([key, values]) => (
        <label className="grid gap-2 text-sm text-slate-200" key={key}>
          {key.replace(/([A-Z])/g, " $1")}
          <select className="input" value={filters[key]} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}>
            <option>All</option>
            {values.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

function AuthPanel({ textLabels, authError, authForm, handleEmailLogin, handleGuestLogin, setAuthForm }) {
  return (
    <div className="soft-panel rounded-3xl p-6">
      <h3 className="text-2xl font-semibold">{textLabels.login}</h3>
      <form className="mt-5 grid gap-4" onSubmit={handleEmailLogin}>
        <input
          className="input"
          onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
          placeholder={textLabels.email}
          type="email"
          value={authForm.email}
        />
        <input
          className="input"
          onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
          placeholder={textLabels.password}
          type="password"
          value={authForm.password}
        />
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950" type="submit">
          <LogIn size={18} /> {textLabels.login}
        </button>
      </form>
      <button className="mt-3 w-full rounded-2xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/10" onClick={handleGuestLogin} type="button">
        {textLabels.continueDemo}
      </button>
      {authError ? <div className="mt-4"><StatusMessage type="error">{authError}</StatusMessage></div> : null}
    </div>
  );
}
