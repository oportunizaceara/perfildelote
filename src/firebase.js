import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { getDatabase, ref, set, onValue, get, off, serverTimestamp } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyB8ukCOCKHc1GRkDJ5BpMlSF_iRyEO4pZk",
  authDomain: "perfil-de-lote.firebaseapp.com",
  projectId: "perfil-de-lote",
  storageBucket: "perfil-de-lote.firebasestorage.app",
  messagingSenderId: "83277777318",
  appId: "1:83277777318:web:9357e7e2a07379fc21a767",
  databaseURL: "https://perfil-de-lote-default-rtdb.firebaseio.com",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)

const DATA_PATH = "dados/relatorios"

export function normalizeRelatorios(raw) {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw !== "object") return []
  if (raw.items != null) {
    if (Array.isArray(raw.items)) return raw.items
    if (typeof raw.items === "object") {
      return Object.keys(raw.items)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => raw.items[k])
        .filter(Boolean)
    }
  }
  if (Array.isArray(raw.relatorios)) return raw.relatorios
  const keys = Object.keys(raw).filter((k) => k !== "v" && k !== "updatedAt" && k !== "items")
  if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) {
    return keys.sort((a, b) => Number(a) - Number(b)).map((k) => raw[k]).filter(Boolean)
  }
  return []
}

export function relatoriosRef() {
  return ref(db, DATA_PATH)
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function logout() {
  return signOut(auth)
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

export function subscribeRelatorios(callback) {
  const r = relatoriosRef()
  onValue(r, (snap) => {
    callback(normalizeRelatorios(snap.val()))
  })
  return () => off(r)
}

export async function saveRelatorios(data) {
  const items = Array.isArray(data) ? data : normalizeRelatorios(data)
  await set(relatoriosRef(), { v: 1, items, updatedAt: serverTimestamp() })
}

export async function fetchRelatoriosOnce() {
  const snap = await get(relatoriosRef())
  return normalizeRelatorios(snap.val())
}
