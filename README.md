# Search-Jobs ATS Tailoring Platform

Plataforma inteligente para adaptar y optimizar CVs frente a descripciones de puestos de LinkedIn/portales de empleo para pasar filtros ATS, sin alucinaciones y con aprobación humana paso a paso.

---

## 🚀 Cómo correr el proyecto localmente

### 1. Variables de Entorno (`.env`)
Asegúrate de tener tu archivo `.env` en la raíz (basado en `.env.example`):
```env
DATABASE_URL=postgresql+psycopg://username:password@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=tu_clave_de_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash
```

---

### 2. Backend (FastAPI + Python 3.12 64-bit)

1. **Activar el entorno virtual:**
   ```powershell
   .\backend\.venv\Scripts\Activate.ps1
   ```
2. **Ejecutar el servidor FastAPI:**
   ```powershell
   $env:PYTHONPATH="backend"
   .\backend\.venv\Scripts\python.exe -m uvicorn src.search_jobs.main:app --reload --port 8000
   ```
3. **Endpoints clave:**
   - Swagger / OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
   - Health check AI: [http://localhost:8000/api/v1/health/ai](http://localhost:8000/api/v1/health/ai)

4. **Correr tests unitarios:**
   ```powershell
   $env:PYTHONPATH="backend"
   .\backend\.venv\Scripts\python.exe -m pytest backend\tests
   ```

5. **Master CV:**
   - `GET /api/v1/master-cv` — obtiene la versión actual.
   - `POST /api/v1/master-cv` — recibe un `.docx` o `.pdf` de hasta 5 MB, extrae su texto y lo estructura con Gemini.
   - `PUT /api/v1/master-cv/{id}` — guarda cambios editados y crea una nueva versión.

---

### 3. Frontend (React 19 + Vite + Tailwind + TypeScript)

1. **Entrar al directorio e iniciar el servidor de desarrollo:**
   ```powershell
   cd frontend
   npm run dev
   ```
2. **Acceder a la aplicación:**
   - [http://localhost:5173](http://localhost:5173)

---

## 📂 Arquitectura (Clean Architecture)

- `backend/src/search_jobs/domain/`: Entidades de negocio (`MasterCV`, `JobAnalysis`), Value Objects y Enums sin dependencias externas.
- `backend/src/search_jobs/application/`: Puertos (interfaces) y casos de uso.
- `backend/src/search_jobs/infrastructure/`: Conexión Neon Postgres (`SQLModel`/`psycopg`), Cliente Gemini API (`google-genai`).
- `backend/src/search_jobs/presentation/`: Controladores FastAPI `/api/v1`.
- `frontend/src/`: React 19 SPA modularizado por features (`dashboard`, `master-cv`, `create-cv`, `history`) con Tailwind CSS y TanStack Query.
