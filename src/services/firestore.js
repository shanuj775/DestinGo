import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";
import { db } from "../firebase";

function requireDb() {
  if (!db) {
    throw new Error("Firebase is not configured. Add your VITE_FIREBASE_* values to .env.");
  }
  return db;
}

function byName(a, b) {
  return String(a.name || a.city || "").localeCompare(String(b.name || b.city || ""));
}

async function readCollection(name) {
  const snap = await getDocs(collection(requireDb(), name));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort(byName);
}

export function fetchDestinations() {
  return readCollection("destinations");
}

export function fetchPlaces() {
  return readCollection("places");
}

export function fetchEvents() {
  return readCollection("events");
}

export function fetchHosts() {
  return readCollection("hosts");
}

export async function saveTrip(userId, trip) {
  const ref = await addDoc(collection(requireDb(), "savedTrips"), {
    ...trip,
    userId,
    createdAt: serverTimestamp()
  });
  return ref.id;
}

export async function fetchSavedTrips(userId) {
  if (!userId) {
    return [];
  }

  const savedQuery = query(collection(requireDb(), "savedTrips"), where("userId", "==", userId));
  const snap = await getDocs(savedQuery);
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => {
      const aMs = a.createdAt?.toMillis?.() || 0;
      const bMs = b.createdAt?.toMillis?.() || 0;
      return bMs - aMs;
    });
}

export async function createBooking(userId, host, date) {
  const ref = await addDoc(collection(requireDb(), "bookings"), {
    userId,
    hostId: host.id,
    experienceName: host.experienceType,
    city: host.city,
    date,
    status: "pending",
    createdAt: serverTimestamp()
  });
  return ref.id;
}
