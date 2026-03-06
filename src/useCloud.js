// useCloud.js
// Dados compartilhados entre todos os usuários autorizados
// Salva em Firestore no documento "shared/data" com debounce

import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const SHARED_DOC = "shared";
const SHARED_COLLECTION = "appdata";

// Single document holds all app state as fields
// shared/appdata/{ receitas: [...], gastos: [...], ... }

let cache = {};           // in-memory cache to avoid re-reads
let pendingWrite = {};    // fields waiting to be written
let writeTimer = null;

function flushWrite() {
  if (!Object.keys(pendingWrite).length) return;
  const ref = doc(db, SHARED_COLLECTION, SHARED_DOC);
  setDoc(ref, pendingWrite, { merge: true });
  pendingWrite = {};
}

function scheduleWrite(key, value) {
  pendingWrite[key] = value;
  clearTimeout(writeTimer);
  writeTimer = setTimeout(flushWrite, 1000); // batch writes, 1s debounce
}

// Global snapshot listener — starts once, shared across all hooks
let listeners = {};
let snapshotUnsub = null;
let snapshotData = null;

function ensureSnapshot(onData) {
  if (!snapshotUnsub) {
    const ref = doc(db, SHARED_COLLECTION, SHARED_DOC);
    snapshotUnsub = onSnapshot(ref, (snap) => {
      snapshotData = snap.exists() ? snap.data() : {};
      Object.values(listeners).forEach(fn => fn(snapshotData));
    });
  } else if (snapshotData !== null) {
    // Already have data, call immediately
    setTimeout(() => onData(snapshotData), 0);
  }
}

export function useCloud(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [ready, setReady] = useState(false);
  const id = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    const listenerId = id.current;
    listeners[listenerId] = (data) => {
      const v = data[key] !== undefined ? data[key] : defaultValue;
      setValue(v);
      setReady(true);
    };
    ensureSnapshot(listeners[listenerId]);
    return () => { delete listeners[listenerId]; };
  }, [key]);

  function set(valOrFn) {
    setValue(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      scheduleWrite(key, next);
      return next;
    });
  }

  return [value, set, ready];
}
