import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, ALLOWED_EMAILS } from "./firebase";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = carregando

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u && ALLOWED_EMAILS.includes(u.email)) {
        setUser(u);
      } else {
        if (u) signOut(auth);
        setUser(null);
      }
    });
  }, []);

  if (user === undefined) return (
    <div style={{
      minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"#fdf8f0",fontFamily:"system-ui,sans-serif",color:"#9a8a6a"
    }}>Carregando...</div>
  );

  if (!user) return <Login />;

  return <Dashboard userEmail={user.email} onLogout={() => signOut(auth)} />;
}
