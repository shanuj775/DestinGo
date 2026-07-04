import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

function createCredential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      "Seed credentials are missing. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  return admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  });
}

admin.initializeApp({
  credential: createCredential(),
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID
});

const db = admin.firestore();

const destinations = [
  {
    id: "jaipur",
    city: "Jaipur",
    country: "India",
    heroTitle: "Your Perfect Cultural Escape in Jaipur",
    subtitle: "Royal forts, handmade crafts, folk rhythms, and warm Rajasthani hospitality.",
    backgroundImage: "https://source.unsplash.com/1800x1200/?jaipur,fort,palace",
    shortDescription:
      "Discover royal forts, colorful bazaars, folk music, handmade crafts, and hidden stories of Rajasthan.",
    rating: "4.8",
    bestTime: "October to March",
    cultureTags: ["Forts", "Crafts", "Bazaars", "Folk Music"]
  },
  {
    id: "varanasi",
    city: "Varanasi",
    country: "India",
    heroTitle: "Experience the Soul of Varanasi",
    subtitle: "Ghats, devotional music, silk weaving, river rituals, and ancient lanes.",
    backgroundImage: "https://source.unsplash.com/1800x1200/?varanasi,ghats,ganga",
    shortDescription:
      "Walk through living heritage along the Ganga, where sunrise boats, temple bells, and silk workshops define the city.",
    rating: "4.9",
    bestTime: "November to February",
    cultureTags: ["Ghats", "Spirituality", "Silk", "Classical Music"]
  },
  {
    id: "delhi",
    city: "Delhi",
    country: "India",
    heroTitle: "Discover Delhi Beyond Tourist Spots",
    subtitle: "Old city food trails, layered monuments, museums, markets, and living heritage.",
    backgroundImage: "https://source.unsplash.com/1800x1200/?delhi,heritage,india-gate",
    shortDescription:
      "Explore Delhi through historic neighborhoods, street food, monuments, craft markets, and stories across centuries.",
    rating: "4.6",
    bestTime: "October to March",
    cultureTags: ["Monuments", "Food Walks", "Museums", "Markets"]
  },
  {
    id: "goa",
    city: "Goa",
    country: "India",
    heroTitle: "Find Goa's Local Rhythm",
    subtitle: "Beaches, Portuguese-era lanes, local music, spice farms, and coastal kitchens.",
    backgroundImage: "https://source.unsplash.com/1800x1200/?goa,beach,culture",
    shortDescription:
      "Go past the shoreline into chapel quarters, music nights, local seafood, spice estates, and village art.",
    rating: "4.7",
    bestTime: "November to February",
    cultureTags: ["Beaches", "Music", "Food", "Village Walks"]
  },
  {
    id: "kerala",
    city: "Kerala",
    country: "India",
    heroTitle: "Drift Through Kerala's Living Traditions",
    subtitle: "Backwaters, classical performance, spice heritage, temple festivals, and slow travel.",
    backgroundImage: "https://source.unsplash.com/1800x1200/?kerala,backwaters,houseboat",
    shortDescription:
      "Experience backwaters, art forms, spice routes, local kitchens, and gentle village life across Kerala.",
    rating: "4.9",
    bestTime: "September to March",
    cultureTags: ["Backwaters", "Kathakali", "Spices", "Ayurveda"]
  }
];
const slugifyCity = (city) => city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const additionalDestinationSeeds = [
  ["Mumbai", "mumbai,marine-drive,india", "Sea promenades, art deco facades, film culture, markets, and coastal food.", "Explore Mumbai through colonial streets, art deco icons, seaside evenings, studio stories, markets, and food trails.", ["Art Deco", "Cinema", "Food", "Markets"]],
  ["Bengaluru", "bengaluru,garden,india", "Old neighborhoods, gardens, craft cafes, music, markets, and tech-era creativity.", "Blend heritage walks, green spaces, local music, filter coffee, craft studios, and neighborhood food in Bengaluru.", ["Gardens", "Music", "Coffee", "Markets"]],
  ["Chennai", "chennai,temple,marina", "Temple streets, classical arts, Marina mornings, craft stores, and Tamil food.", "Experience Chennai through sabhas, shore walks, old temples, textile traditions, bookshops, and generous local kitchens.", ["Carnatic Music", "Temples", "Textiles", "Coast"]],
  ["Kolkata", "kolkata,howrah,heritage", "Trams, river ghats, bookstores, colonial lanes, Durga Puja artistry, and sweets.", "Follow Kolkata through College Street, old mansions, river sunsets, art studios, adda culture, and classic sweets.", ["Literature", "Trams", "Puja Art", "Sweets"]],
  ["Hyderabad", "hyderabad,charminar,india", "Charminar lanes, pearls, biryani kitchens, museums, palaces, and Deccan stories.", "Discover Hyderabad through old city bazaars, Deccan architecture, food heritage, craft markets, and palace museums.", ["Biryani", "Deccan", "Pearls", "Bazaars"]],
  ["Ahmedabad", "ahmedabad,stepwell,heritage", "Pol houses, stepwells, textile traditions, riverfront evenings, and Gujarati food.", "Move through Ahmedabad's old city pols, textile museums, stepwells, street food, and modern riverfront culture.", ["Pols", "Textiles", "Stepwells", "Food"]],
  ["Pune", "pune,fort,india", "Peth neighborhoods, forts, music, campuses, old bakeries, and Marathi culture.", "Explore Pune through old wada lanes, nearby forts, local snacks, classical music, and thoughtful cultural walks.", ["Forts", "Wadas", "Music", "Food"]],
  ["Lucknow", "lucknow,imambara,india", "Imambaras, chikankari, kebab lanes, poetry, gardens, and refined etiquette.", "Discover Lucknow through graceful architecture, chikankari workshops, poetic tehzeeb, gardens, and legendary food lanes.", ["Nawabi", "Chikankari", "Poetry", "Food"]],
  ["Amritsar", "amritsar,golden-temple", "Golden Temple serenity, langar, partition memory, bazaars, and Punjabi kitchens.", "Travel through Amritsar with respect: sacred spaces, community kitchens, heritage lanes, craft bazaars, and local food.", ["Sacred", "Langar", "Bazaars", "Punjabi Food"]],
  ["Agra", "agra,taj-mahal,india", "Mughal gardens, marble craft, river views, old markets, and food traditions.", "Go beyond the postcard with Mughal gardens, marble artisan stories, Yamuna viewpoints, heritage markets, and local snacks.", ["Mughal", "Marble", "Gardens", "Markets"]],
  ["Udaipur", "udaipur,lake,palace", "Lake palaces, miniature art, ghats, music, craft schools, and sunset walks.", "Experience Udaipur through lakefront heritage, miniature painting, music evenings, craft lanes, and soft Aravalli light.", ["Lakes", "Miniature Art", "Palaces", "Music"]],
  ["Jodhpur", "jodhpur,blue-city,fort", "Mehrangarh views, blue neighborhoods, desert music, textiles, and spice markets.", "Walk Jodhpur through fort ramparts, indigo lanes, textile stories, folk rhythms, spice markets, and desert hospitality.", ["Fort", "Blue City", "Textiles", "Folk Music"]],
  ["Mysuru", "mysore,palace,india", "Palace lights, sandalwood, silk, yoga traditions, markets, and old-world grace.", "Explore Mysuru through palace heritage, silk and sandalwood craft, markets, food, and a slower cultural rhythm.", ["Palace", "Silk", "Sandalwood", "Yoga"]],
  ["Kochi", "kochi,fort-kochi,kerala", "Fort Kochi lanes, spice trade, art cafes, synagogues, churches, and sea air.", "Meet Kochi through layered port heritage, spice warehouses, contemporary art, coastal food, and respectful neighborhood walks.", ["Port Heritage", "Spices", "Art", "Coast"]],
  ["Rishikesh", "rishikesh,ganga,india", "Ashrams, river rituals, yoga, forest trails, cafes, and foothill silence.", "Balance Rishikesh's spiritual rhythm with river walks, yoga culture, local etiquette, forest edges, and mindful cafes.", ["Yoga", "Ganga", "Ashrams", "Nature"]],
  ["Shimla", "shimla,hills,india", "Colonial walks, ridge views, toy train memories, bakeries, and mountain markets.", "Experience Shimla through hill walks, old railway stories, market lanes, heritage buildings, and winter mountain air.", ["Hills", "Railway", "Markets", "Heritage"]],
  ["Darjeeling", "darjeeling,tea,himalaya", "Tea gardens, Himalayan views, monasteries, toy train tracks, and mountain food.", "Discover Darjeeling through tea estates, Himalayan viewpoints, monasteries, local kitchens, and railway heritage.", ["Tea", "Himalaya", "Monasteries", "Railway"]],
  ["Guwahati", "guwahati,brahmaputra,india", "Brahmaputra sunsets, temples, craft markets, river islands, and Assamese food.", "Explore Guwahati through river life, temple etiquette, craft markets, Assamese flavors, and gateways to Northeast culture.", ["Brahmaputra", "Temples", "Craft", "Assamese Food"]],
  ["Bhubaneswar", "bhubaneswar,temple,india", "Kalinga temples, craft villages, Odia food, museums, and festival traditions.", "Discover Bhubaneswar through temple architecture, craft villages, museums, Odia kitchens, and respectful sacred-site visits.", ["Temples", "Kalinga", "Craft", "Odia Food"]],
  ["Chandigarh", "chandigarh,rock-garden,india", "Modernist planning, gardens, museums, lake walks, and Punjabi-Haryanvi culture.", "Explore Chandigarh through architecture, gardens, lake paths, museums, food, and nearby craft traditions.", ["Modernism", "Gardens", "Museums", "Food"]],
  ["Bhopal", "bhopal,lake,india", "Lakeside calm, old bazaars, tribal museums, mosques, and regional food.", "Move through Bhopal's lake views, old city markets, tribal art museums, sacred architecture, and warm local kitchens.", ["Lakes", "Museums", "Bazaars", "Tribal Art"]],
  ["Madurai", "madurai,meenakshi,temple", "Meenakshi temple traditions, flower markets, jasmine, food, and Tamil heritage.", "Experience Madurai with temple respect, flower markets, old lanes, local food, and living Tamil cultural traditions.", ["Temples", "Jasmine", "Markets", "Tamil Food"]],
  ["Indore", "indore,rajwada,india", "Street food, royal markets, old neighborhoods, and Malwa hospitality.", "Explore Indore through street food, royal markets, old neighborhoods, and Malwa hospitality.", ["Food", "Markets", "Palaces", "Malwa"]],
  ["Surat", "surat,diamond,gujarat", "Textile markets, riverfront evenings, diamond craft, and Gujarati food.", "Explore Surat through textile markets, riverfront evenings, diamond craft, and Gujarati food.", ["Textiles", "Food", "Riverfront", "Craft"]],
  ["Patna", "patna,ganga,india", "Ganga history, museums, old markets, Buddhist circuits, and Bihari food.", "Explore Patna through Ganga history, museums, old markets, Buddhist circuits, and Bihari food.", ["Ganga", "Museums", "Markets", "Food"]],
  ["Visakhapatnam", "visakhapatnam,beach,india", "Coastal viewpoints, Buddhist heritage, seafood, hills, and harbor stories.", "Explore Visakhapatnam through coastal viewpoints, Buddhist heritage, seafood, hills, and harbor stories.", ["Coast", "Buddhist Heritage", "Seafood", "Hills"]],
  ["Nagpur", "nagpur,india,heritage", "Orange markets, central India museums, food streets, and regional craft.", "Explore Nagpur through orange markets, central India museums, food streets, and regional craft.", ["Markets", "Museums", "Food", "Craft"]],
  ["Nashik", "nashik,ghats,vineyard,india", "River ghats, temple culture, vineyards, and relaxed Maharashtrian food.", "Explore Nashik through river ghats, temple culture, vineyards, and relaxed Maharashtrian food.", ["Ghats", "Temples", "Vineyards", "Food"]],
  ["Aurangabad", "aurangabad,ellora,ajanta", "Ajanta-Ellora gateways, Deccan monuments, silk craft, and old city food.", "Explore Aurangabad through Ajanta-Ellora gateways, Deccan monuments, silk craft, and old city food.", ["Caves", "Deccan", "Silk", "Monuments"]],
  ["Thiruvananthapuram", "thiruvananthapuram,kerala,temple", "Temples, museums, beaches, classical art, and Kerala food.", "Explore Thiruvananthapuram through temples, museums, beaches, classical art, and Kerala food.", ["Temples", "Museums", "Coast", "Classical Art"]],
  ["Pondicherry", "pondicherry,french-quarter,india", "French-Tamil streets, seaside walks, ashram calm, cafes, and craft shops.", "Explore Pondicherry through French-Tamil streets, seaside walks, ashram calm, cafes, and craft shops.", ["French Quarter", "Coast", "Cafes", "Craft"]],
  ["Coimbatore", "coimbatore,western-ghats,india", "Textile heritage, temple trails, Kongu food, and Western Ghats access.", "Explore Coimbatore through textile heritage, temple trails, Kongu food, and Western Ghats access.", ["Textiles", "Temples", "Kongu Food", "Ghats"]]
].map(([city, query, subtitle, shortDescription, cultureTags]) => ({
  id: slugifyCity(city),
  city,
  country: "India",
  heroTitle: `Discover ${city}'s Cultural Layers`,
  subtitle,
  backgroundImage: `https://source.unsplash.com/1800x1200/?${query}`,
  shortDescription,
  rating: "4.6",
  bestTime: "October to March",
  cultureTags
}));

for (const destination of additionalDestinationSeeds) {
  if (!destinations.some((item) => item.city === destination.city)) {
    destinations.push(destination);
  }
}

const places = [
  {
    id: "jaipur-panna-meena",
    name: "Panna Meena ka Kund",
    city: "Jaipur",
    category: "Architecture",
    description: "A geometric stepwell near Amer known for quiet symmetry, local stories, and traditional water wisdom.",
    location: "Amer, Jaipur",
    entryFee: "Free",
    bestTime: "Morning",
    cultureType: "Heritage",
    hiddenGemScore: 9,
    imageUrl: "https://source.unsplash.com/900x650/?jaipur,stepwell"
  },
  {
    id: "varanasi-weavers",
    name: "Madanpura Weavers Lane",
    city: "Varanasi",
    category: "Craft",
    description: "A living craft neighborhood where Banarasi silk traditions continue through family-run weaving rooms.",
    location: "Madanpura, Varanasi",
    entryFee: "Free with local guide recommended",
    bestTime: "Late morning",
    cultureType: "Craft",
    hiddenGemScore: 8,
    imageUrl: "https://source.unsplash.com/900x650/?varanasi,silk,weaving"
  },
  {
    id: "delhi-sunder-nursery",
    name: "Sunder Nursery Heritage Park",
    city: "Delhi",
    category: "Garden",
    description: "A restored heritage landscape with Mughal-era monuments, native plants, and calm walking routes.",
    location: "Nizamuddin, Delhi",
    entryFee: "Verify locally",
    bestTime: "Evening",
    cultureType: "Heritage",
    hiddenGemScore: 8,
    imageUrl: "https://source.unsplash.com/900x650/?delhi,garden,heritage"
  },
  {
    id: "goa-fontainhas",
    name: "Fontainhas Heritage Quarter",
    city: "Goa",
    category: "Neighborhood",
    description: "Colorful lanes, old homes, bakeries, chapels, and local stories in Panaji's Latin Quarter.",
    location: "Panaji, Goa",
    entryFee: "Free",
    bestTime: "Morning or golden hour",
    cultureType: "Local Life",
    hiddenGemScore: 9,
    imageUrl: "https://source.unsplash.com/900x650/?goa,fontainhas"
  },
  {
    id: "kerala-kumbalangi",
    name: "Kumbalangi Village",
    city: "Kerala",
    category: "Village",
    description: "A coastal village known for responsible tourism, fishing traditions, local food, and backwater life.",
    location: "Near Kochi, Kerala",
    entryFee: "Depends on activity",
    bestTime: "Morning",
    cultureType: "Community",
    hiddenGemScore: 9,
    imageUrl: "https://source.unsplash.com/900x650/?kerala,village,backwater"
  }
];

const events = [
  {
    id: "jaipur-block-print-walk",
    name: "Bagru Block Printing Studio Visit",
    city: "Jaipur",
    date: "Verify monthly slots locally",
    category: "Craft Workshop",
    location: "Bagru, Jaipur",
    description: "Meet artisans, learn natural dye basics, and understand the block printing process respectfully.",
    price: "Rs.1200 onward",
    imageUrl: "https://source.unsplash.com/900x650/?block-printing,jaipur"
  },
  {
    id: "varanasi-music-baithak",
    name: "Classical Music Baithak",
    city: "Varanasi",
    date: "Weekend evenings",
    category: "Music",
    location: "Assi area, Varanasi",
    description: "A small-format evening of classical music with context from local performers.",
    price: "Verify locally",
    imageUrl: "https://source.unsplash.com/900x650/?varanasi,music"
  },
  {
    id: "delhi-old-food-walk",
    name: "Old Delhi Food and Heritage Walk",
    city: "Delhi",
    date: "Daily guided slots",
    category: "Food Walk",
    location: "Chandni Chowk, Delhi",
    description: "Taste neighborhood classics while learning about lanes, markets, and community food traditions.",
    price: "Rs.1800 onward",
    imageUrl: "https://source.unsplash.com/900x650/?old-delhi,food"
  },
  {
    id: "goa-fado-night",
    name: "Goan Music Night",
    city: "Goa",
    date: "Friday evenings",
    category: "Music",
    location: "Panaji, Goa",
    description: "An intimate local music evening featuring Goan influences, storytelling, and neighborhood food.",
    price: "Verify locally",
    imageUrl: "https://source.unsplash.com/900x650/?goa,music"
  },
  {
    id: "kerala-kathakali-intro",
    name: "Kathakali Demonstration",
    city: "Kerala",
    date: "Evenings",
    category: "Performance",
    location: "Kochi, Kerala",
    description: "A guided introduction to Kathakali makeup, gesture language, music, and performance context.",
    price: "Rs.500 onward",
    imageUrl: "https://source.unsplash.com/900x650/?kathakali,kerala"
  }
];

const hosts = [
  {
    id: "jaipur-meera-block-printing",
    name: "Meera Sharma",
    city: "Jaipur",
    experienceType: "Block Printing Workshop",
    description: "A hands-on workshop introducing wooden blocks, natural dyes, motifs, and artisan etiquette.",
    price: "Rs.1500 per person",
    rating: "4.8",
    contact: "demo-jaipur-host@example.com",
    imageUrl: "https://source.unsplash.com/900x650/?rajasthan,craft,artisan"
  },
  {
    id: "varanasi-arun-aarti-guide",
    name: "Arun Mishra",
    city: "Varanasi",
    experienceType: "Ganga Aarti Local Guide",
    description: "A respectful guided evening explaining rituals, crowd etiquette, and riverside heritage.",
    price: "Rs.900 per person",
    rating: "4.9",
    contact: "demo-varanasi-guide@example.com",
    imageUrl: "https://source.unsplash.com/900x650/?varanasi,ganga,aarti"
  },
  {
    id: "delhi-sana-food-walk",
    name: "Sana Khan",
    city: "Delhi",
    experienceType: "Old Delhi Food Walk",
    description: "A food trail focused on local vendors, respectful tasting, and neighborhood history.",
    price: "Rs.1800 per person",
    rating: "4.7",
    contact: "demo-delhi-food@example.com",
    imageUrl: "https://source.unsplash.com/900x650/?delhi,street-food"
  },
  {
    id: "kerala-jose-backwater-culture",
    name: "Jose Mathew",
    city: "Kerala",
    experienceType: "Backwater Culture Guide",
    description: "A slow local experience around village life, fishing traditions, food, and waterways.",
    price: "Rs.2200 per person",
    rating: "4.8",
    contact: "demo-kerala-guide@example.com",
    imageUrl: "https://source.unsplash.com/900x650/?kerala,houseboat"
  },
  {
    id: "goa-alina-music-night",
    name: "Alina D'Souza",
    city: "Goa",
    experienceType: "Local Music Night",
    description: "A small-group evening around Goan music, local stories, and responsible nightlife.",
    price: "Rs.1200 per person",
    rating: "4.6",
    contact: "demo-goa-music@example.com",
    imageUrl: "https://source.unsplash.com/900x650/?goa,local,music"
  }
];

async function upsertCollection(collectionName, records) {
  const batch = db.batch();
  for (const record of records) {
    const { id, ...data } = record;
    batch.set(db.collection(collectionName).doc(id), data, { merge: true });
  }
  await batch.commit();
  console.log(`Seeded ${records.length} ${collectionName} records.`);
}

await upsertCollection("destinations", destinations);
await upsertCollection("places", places);
await upsertCollection("events", events);
await upsertCollection("hosts", hosts);

console.log("CultureCompass AI Firestore seed complete.");
