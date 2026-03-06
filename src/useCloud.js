// useCloud.js — dados compartilhados no Firestore (appdata/shared)
import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const REF = () => doc(db, "appdata", "shared");

// Debounce writes — agrupa todas as alterações em 1 save por segundo
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

// Snapshot global único — evita múltiplas conexões
const defaults = {};   // defaults registrados por cada useCloud
let snapData   = null; // último valor recebido do Firestore
let snapUnsub  = null; // unsubscribe do listener
const subs     = new Set(); // callbacks dos componentes

function startSnapshot() {
  if (snapUnsub) return;
  snapUnsub = onSnapshot(REF(),
    (snap) => {
      if (!snap.exists()) {
        // Primeira vez — inicializa com os defaults do app
        console.log("[useCloud] inicializando Firestore com defaults...");
        setDoc(REF(), defaults)
          .then(() => console.log("[useCloud] defaults salvos!"))
          .catch(e => console.error("[useCloud] erro init:", e));
        snapData = { ...defaults };
      } else {
        snapData = snap.data();
      }
      subs.forEach(fn => fn(snapData));
    },
    (err) => console.error("[useCloud] erro snapshot:", err)
  );
}

export function useCloud(key, defaultValue) {
  if (!(key in defaults)) defaults[key] = defaultValue;

  const [value, setValue]   = useState(defaultValue);
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    function handler(data) {
      setValue(key in data ? data[key] : defaultValue);
      setReady(true);
    }
    subs.add(handler);
    startSnapshot();
    if (snapData !== null) handler(snapData); // já tem dados, aplica já
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
