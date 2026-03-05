# 💰 Finanças — Deploy em 15 minutos

Dados salvos no **localStorage** do browser. Login Google só como portão de segurança.

---

## Passo 1 — Criar projeto Firebase (5 min)

1. Acesse https://console.firebase.google.com
2. **"Adicionar projeto"** → nome → desativar Analytics → Criar
3. Menu lateral → **Authentication → Primeiros passos**
4. Aba **"Sign-in method"** → **Google → Ativar → Salvar**
5. Menu lateral → **Configurações (⚙️) → Seus apps → ícone Web (</>)**
6. Nome qualquer → **Registrar app**
7. Copie o bloco `firebaseConfig`

---

## Passo 2 — Configurar (2 min)

Abra `src/firebase.js` e preencha:

```js
const firebaseConfig = {
  apiKey: "...",        // cole aqui
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

export const ALLOWED_EMAILS = [
  "tiago@gmail.com",      // ← seus emails
  "mariana@gmail.com",
];
```

---

## Passo 3 — Subir no GitHub (3 min)

```bash
cd financas
git init
git add .
git commit -m "init"
```

Crie repo em https://github.com/new e faça push.

---

## Passo 4 — Deploy na Vercel (3 min)

1. https://vercel.com → Login com GitHub
2. **"Add New Project"** → importar seu repo
3. Vercel detecta Vite automaticamente → **Deploy**
4. Em ~1 min está no ar em `https://seu-app.vercel.app`

---

## Passo 5 — Liberar domínio no Firebase (1 min)

Firebase Console → Authentication → **Settings → Authorized domains**
→ **Add domain** → `seu-app.vercel.app`

---

## Pronto! 🎉

- Só quem está na `ALLOWED_EMAILS` consegue entrar
- Dados salvos no localStorage do browser
- Para dev local: `npm install && npm run dev`

---

## Estrutura

```
src/
├── main.jsx       # Entry point
├── App.jsx        # Auth gate
├── Login.jsx      # Tela de login
├── Dashboard.jsx  # App completo
└── firebase.js    # ⚠️ Configure aqui
```
