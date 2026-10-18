import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== "(default)"
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.warn("Please check your Firebase configuration.");
    }
  }
}

testConnection();

export async function syncScreeningToFirestore(screening) {
  if (!screening || !screening.id) return;
  try {
    const docRef = doc(db, "screenings", screening.id);
    // Sanitize to avoid undefined values
    const payload = {
      id: screening.id,
      patient_category: screening.patient_category || "Patient",
      age: Number(screening.age) || 0,
      gender: screening.gender || "Lelaki",
      created_at: screening.created_at || new Date().toISOString(),
      result: screening.result || {},
      status: screening.status || "VALID",
      facility: "Pejabat Kesihatan Daerah Kuala Nerus · KKM",
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.error("Firestore sync error:", err);
    return false;
  }
}

export async function fetchScreeningsFromFirestore() {
  try {
    const q = query(collection(db, "screenings"), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    console.error("Firestore fetch error:", err);
    return [];
  }
}

export async function deleteScreeningFromFirestore(id) {
  try {
    await deleteDoc(doc(db, "screenings", id));
    return true;
  } catch (err) {
    console.error("Firestore delete error:", err);
    return false;
  }
}

export default app;
