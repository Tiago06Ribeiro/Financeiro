import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const REF = () => doc(db, "appdata", "shared");

let timer = null;
let pending = {};

function save(key, value) {
  pending[key] = value;
  clearTimeout(timer);
  timer = setTimeout(() => {
    setDoc(REF(), pending, { merge: true })
      .catch(e => console.error("[useCloud] erro ao salvar:", e));
    pending = {};
  }, 1000);
}

// Registro global de defaults para inicializar o documento na primeira vez
const defaults = {};

let snapshotData = null;
let unsub = null;
const subs = new Set();

function startSnapshot() {
  if (unsub) return;
  unsub = onSnapshot(REF(),
    (snap) => {
      if (!snap.exists()) {
        // Documento não existe ainda — cria com todos os defaults registrados
        console.log("[useCloud] documento vazio, inicializando com defaults...");
        setDoc(REF(), defaults, { merge: true })
          .then(() => console.log("[useCloud] defaults salvos"))
          .catch(e => console.error("[useCloud] erro init:", e));
        snapshotData = { ...defaults };
      } else {
        snapshotData = snap.data();
      }
      subs.forEach(fn => fn(snapshotData));
    },
    (err) => console.error("[useCloud] erro snapshot:", err)
  );
}

export function useCloud(key, defaultValue) {
  // Registra o default globalmente para uso na inicialização
  if (!(key in defaults)) defaults[key] = defaultValue;

  const [value, setValue] = useState(defaultValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handler = (data) => {
      setValue(key in data ? data[key] : defaultValue);
      setReady(true);
    };
    subs.add(handler);
    startSnapshot();
    // Se já tem dados, aplica imediatamente
    if (snapshotData !== null) handler(snapshotData);
    return () => subs.delete(handler);
  }, [key]);

  function set(valOrFn) {
    setValue(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      save(key, next);
      return next;
    });
  }

  return [value, set, ready];
}
