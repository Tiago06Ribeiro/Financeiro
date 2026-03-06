import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, ALLOWED_EMAILS } from "./firebase";

export default function Login() {
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar() {
    setLoading(true);
    setErro("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!ALLOWED_EMAILS.includes(result.user.email)) {
        await auth.signOut();
        setErro(`Acesso negado para ${result.user.email}.`);
      }
    } catch {
      setErro("Erro ao fazer login. Tente novamente.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"linear-gradient(135deg,#fdf8f0,#f5ede0)",fontFamily:"system-ui,sans-serif"
    }}>
      <div style={{
        background:"white",borderRadius:20,padding:48,textAlign:"center",
        boxShadow:"0 8px 40px rgba(0,0,0,0.08)",maxWidth:340,width:"90%"
      }}>
        <div style={{fontSize:52,marginBottom:8}}>💰</div>
        <h1 style={{fontSize:22,fontWeight:700,color:"#1a1208",margin:"0 0 4px"}}>Finanças</h1>
        <p style={{fontSize:13,color:"#9a8a6a",margin:"0 0 32px"}}>Tiago & Mariana</p>

        <button onClick={entrar} disabled={loading} style={{
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,
          width:"100%",padding:"12px 20px",borderRadius:12,
          background:"white",border:"1.5px solid #e0dbd0",
          cursor:loading?"default":"pointer",fontSize:14,fontWeight:600,color:"#1a1208",
          boxShadow:"0 2px 8px rgba(0,0,0,0.06)"
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.5V5.43H1.83a8 8 0 0 0 0 7.14l2.67-2.09z"/>
            <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8 8 0 0 0 1.83 5.43L4.5 7.5c.68-2.03 2.6-3.92 4.48-3.92z"/>
          </svg>
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>

        {erro && (
          <div style={{
            marginTop:16,padding:"10px 14px",background:"#fef2f2",
            border:"1px solid #fecaca",borderRadius:10,fontSize:12,color:"#dc2626"
          }}>{erro}</div>
        )}
      </div>
    </div>
  );
}
