## EduAI‑Asistent API

Base URL
- Local: http://localhost:3001/api
- Production: set `FRONTEND_URL` and use your deployed backend origin. Health: GET /api/health

Auth
- All protected endpoints use header: `Authorization: Bearer <JWT>`
- Obtain token via login or register; tokens expire in 7 days

### Auth endpoints
- POST /auth/register-school
  - Body:
    {
      "school": { "name": "ZŠ Praha", "city": "Praha", "address": "Ulice 1", "postal_code": "11000", "contact_email": "admin@skola.cz" },
      "admin": { "email": "admin@skola.cz", "password": "admin12345", "first_name": "Jan", "last_name": "Novák" }
    }
  - 201 → { success, data: { user, token } }

- POST /auth/register
  - Body:
    { "email":"user@x.cz", "password":"secret123", "first_name":"Eva", "last_name":"Malá" }
  - 201 → { success, data: { user, token } }

- POST /auth/login
  - Body: { "email":"user@x.cz", "password":"secret123" }
  - 200 → { success, data: { user, token } }

- GET /auth/profile
  - 200 → { success, data: userWithSchool }

- PUT /auth/profile
  - Body (partial): { "first_name":"Eva" }
  - 200 → { success, data: user }

- PUT /auth/change-password
  - Body: { "current_password":"old", "new_password":"newStrong123" }
  - 200 → { success }

- POST /auth/me/add-credits
  - 200 → { success, data: { user, credits_added } }

### Schools (role: school_admin)
- GET /schools/:schoolId
- PUT /schools/:schoolId
  - Body (partial): { name, address, city, postal_code, contact_email, contact_phone }
- GET /schools/:schoolId/teachers
- POST /schools/:schoolId/teachers
  - Body: { email, first_name, last_name, password }
- DELETE /schools/:schoolId/teachers/:userId
- POST /schools/:schoolId/add-credits
  - Body: { amount: number, description?: string }
  - If no teachers exist, credits are added to the admin account
- POST /schools/:schoolId/allocate-credits
  - Body: { teacherId: string, amount: number, description?: string }
- GET /schools/:schoolId/credit-allocation
- GET /schools/:schoolId/credit-stats

### Conversations
- GET /conversations?limit=50&offset=0
- GET /conversations/:id
- POST /conversations
  - Body: { title: "New Conversation", assistant_type?: "math_assistant" }
- PUT /conversations/:id
  - Body: { title: string }
- DELETE /conversations/:id
- POST /conversations/:id/messages
  - Body: { role: "user" | "assistant", content: string }

Note: Live chat uses the streaming AI endpoint below and persists messages when `conversation_id` is provided.

### AI
- POST /ai/chat  (Server‑Sent Events stream)
  - Headers: Accept: text/event-stream
  - Body: { message: string, session_id?: string, conversation_id?: string }
  - Stream events (one per line prefixed by `data: `):
    - { "type":"start", "message":"..." }
    - { "type":"chunk", "content":"partial text" }
    - { "type":"end", "credits_used":1, "credits_balance":999, "session_id":"..." }
    - { "type":"error", "message":"..." }

- GET /ai/features → available assistants
- GET /ai/stats → usage stats for current user
- POST /ai/generate-worksheet (SSE stream)
  - Body: { topic: string }
  - Stream ends with: { "type":"end", "worksheet": {...}, "credits_used":2, "credits_balance":... }

### Files (Generated)
- GET /files?limit=50&offset=0&file_type=worksheet
- GET /files/stats
- GET /files/:id
- DELETE /files/:id

### Users
- GET /users/me → { success, data: { id, name, email, credits, createdAt } }

### Health
- GET /health → { status: "OK", database: { connected: true } }

Auth/CORS
- Bearer JWT in Authorization header
- CORS is open in production, restricted in development to `FRONTEND_URL` and local ports

Errors
- JSON: { success: false, error: string, details?: any }

Rate limiting
- 100 requests / 15 minutes per IP (default)


