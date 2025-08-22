# 🚨 Debug Setup Guide - EduAI-Asistent

## Problém
- Frontend zobrazuje bílou obrazovku
- Backend API je zahlceno CORS chybami
- Aplikace nefunguje správně

## ✅ Řešení

### 1. Vytvořte environment soubory

#### Frontend (.env)
```bash
# Vytvořte soubor frontend/.env s následujícím obsahem:
VITE_API_URL=http://localhost:3001/api
VITE_API_TIMEOUT=30000
VITE_APP_NAME=EduAI-Asistent
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true
```

#### Backend (.env)
```bash
# Vytvořte soubor backend/.env s následujícím obsahem:
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eduai_asistent
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eduai_asistent

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=dev-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AI Service Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# Credit System
DEFAULT_CREDITS=100
CREDIT_COST_PER_REQUEST=1

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 2. Spusťte aplikace

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Testujte připojení

#### Test API
```bash
# Test backend health
curl http://localhost:3001/api/health

# Test root endpoint
curl http://localhost:3001/
```

#### Test Frontend
- Otevřete http://localhost:5173/debug.html pro debug stránku
- Otevřete http://localhost:5173/test pro React test stránku
- Zkontrolujte konzoli prohlížeče pro chyby

### 4. Kontrola CORS

Backend nyní povoluje:
- Všechny localhost origins v development módu
- Specifikované origins z FRONTEND_URL
- OPTIONS requests pro preflight

### 5. Debug kroky

1. **Zkontrolujte konzoli prohlížeče** - hledejte JavaScript chyby
2. **Zkontrolujte Network tab** - hledejte failed requests
3. **Zkontrolujte backend logy** - hledejte CORS chyby
4. **Testujte debug stránku** - http://localhost:5173/debug.html

### 6. Časté problémy

#### Bílá obrazovka
- Zkontrolujte JavaScript chyby v konzoli
- Zkontrolujte, zda se načetly CSS soubory
- Zkontrolujte, zda React komponenty renderují

#### CORS chyby
- Zkontrolujte FRONTEND_URL v backend .env
- Zkontrolujte, zda frontend běží na správném portu
- Restartujte backend po změně .env

#### API chyby
- Zkontrolujte DATABASE_URL v backend .env
- Zkontrolujte, zda PostgreSQL běží
- Zkontrolujte backend logy

### 7. Kontakt

Pokud problémy přetrvávají:
1. Zkontrolujte všechny logy
2. Zkontrolujte environment proměnné
3. Zkontrolujte, zda všechny služby běží
4. Zkontrolujte firewall a porty

---

**Poznámka:** Tento guide je pro development prostředí. Pro production použijte příslušné environment proměnné.
