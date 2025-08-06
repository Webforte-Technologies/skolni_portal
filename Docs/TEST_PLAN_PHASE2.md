# 🧪 Test Plan - Phase 2: Core Backend & Database Implementation

## 📋 Overview

This test plan covers the comprehensive testing of Phase 2 functionality for the EduAI-Asistent project. Phase 2 includes user authentication, credit system management, and mock AI assistant endpoints. All tests are designed to be executed using API clients like Postman or Insomnia.

**Base URL:** `http://localhost:3001` (or your configured backend URL)

---

## 🔐 Authentication Tests

### Test Case: AUTH-01 - User Registration (Success)
**Description:** Test successful user registration with valid data
**Preconditions:** User with email 'test@example.com' does not exist in the database

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "first_name": "Jan",
  "last_name": "Novák"
}
```

**Expected Result:**
- **Status Code:** 201 Created
- **Response Body:** Contains user data (without password_hash) and JWT token
- **Key Fields:** `success: true`, `data.user.id`, `data.user.email`, `data.user.credits_balance: 0`, `data.token`

---

### Test Case: AUTH-02 - User Registration (Duplicate Email)
**Description:** Test registration failure when email already exists
**Preconditions:** User with email 'test@example.com' already exists in the database

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "first_name": "Jan",
  "last_name": "Novák"
}
```

**Expected Result:**
- **Status Code:** 409 Conflict
- **Response Body:** `{"success": false, "error": "User with this email already exists"}`

---

### Test Case: AUTH-03 - User Registration (Invalid Email)
**Description:** Test registration failure with invalid email format
**Preconditions:** None

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "invalid-email",
  "password": "password123",
  "first_name": "Jan",
  "last_name": "Novák"
}
```

**Expected Result:**
- **Status Code:** 400 Bad Request
- **Response Body:** Contains validation errors for email field

---

### Test Case: AUTH-04 - User Registration (Short Password)
**Description:** Test registration failure with password less than 8 characters
**Preconditions:** None

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "test@example.com",
  "password": "123",
  "first_name": "Jan",
  "last_name": "Novák"
}
```

**Expected Result:**
- **Status Code:** 400 Bad Request
- **Response Body:** Contains validation error for password length

---

### Test Case: AUTH-05 - User Login (Success)
**Description:** Test successful login with valid credentials
**Preconditions:** User with email 'test@example.com' exists with password 'password123'

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains user data and JWT token
- **Key Fields:** `success: true`, `data.user.id`, `data.token`

---

### Test Case: AUTH-06 - User Login (Invalid Password)
**Description:** Test login failure with incorrect password
**Preconditions:** User with email 'test@example.com' exists

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "test@example.com",
  "password": "wrongpassword"
}
```

**Expected Result:**
- **Status Code:** 401 Unauthorized
- **Response Body:** `{"success": false, "error": "Invalid email or password"}`

---

### Test Case: AUTH-07 - User Login (Non-existent User)
**Description:** Test login failure with non-existent email
**Preconditions:** User with email 'nonexistent@example.com' does not exist

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "nonexistent@example.com",
  "password": "password123"
}
```

**Expected Result:**
- **Status Code:** 401 Unauthorized
- **Response Body:** `{"success": false, "error": "Invalid email or password"}`

---

### Test Case: AUTH-08 - Get User Profile (Authenticated)
**Description:** Test retrieving user profile with valid JWT token
**Preconditions:** Valid JWT token from successful login

**Steps to Execute:**
- **Method:** GET
- **URL:** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains complete user profile data
- **Key Fields:** `success: true`, `data.id`, `data.email`, `data.first_name`, `data.last_name`, `data.credits_balance`

---

### Test Case: AUTH-09 - Get User Profile (Unauthenticated)
**Description:** Test profile retrieval without authentication token
**Preconditions:** None

**Steps to Execute:**
- **Method:** GET
- **URL:** `/api/auth/profile`
- **Headers:** None

**Expected Result:**
- **Status Code:** 401 Unauthorized
- **Response Body:** `{"success": false, "error": "Authentication required"}`

---

### Test Case: AUTH-10 - Update User Profile (Success)
**Description:** Test successful profile update with valid data
**Preconditions:** Valid JWT token and user exists

**Steps to Execute:**
- **Method:** PUT
- **URL:** `/api/auth/profile`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "first_name": "Jan Updated",
  "last_name": "Novák Updated"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains updated user data
- **Key Fields:** `success: true`, updated `first_name` and `last_name`

---

### Test Case: AUTH-11 - Change Password (Success)
**Description:** Test successful password change
**Preconditions:** Valid JWT token and user with current password 'password123'

**Steps to Execute:**
- **Method:** PUT
- **URL:** `/api/auth/change-password`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "current_password": "password123",
  "new_password": "newpassword123"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** `{"success": true, "message": "Password changed successfully"}`

---

### Test Case: AUTH-12 - Change Password (Wrong Current Password)
**Description:** Test password change failure with incorrect current password
**Preconditions:** Valid JWT token

**Steps to Execute:**
- **Method:** PUT
- **URL:** `/api/auth/change-password`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "current_password": "wrongpassword",
  "new_password": "newpassword123"
}
```

**Expected Result:**
- **Status Code:** 401 Unauthorized
- **Response Body:** `{"success": false, "error": "Current password is incorrect"}`

---

## 💰 Credit System Tests

### Test Case: CREDIT-01 - Initial Credit Balance
**Description:** Test that new users start with 0 credits
**Preconditions:** Newly registered user

**Steps to Execute:**
- **Method:** GET
- **URL:** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** `data.credits_balance: 0`

---

### Test Case: CREDIT-02 - AI Chat with Sufficient Credits
**Description:** Test AI chat functionality when user has enough credits
**Preconditions:** User with at least 1 credit and valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "Pomoz mi s matematikou"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains AI response and updated credit balance
- **Key Fields:** `success: true`, `data.response`, `data.credits_used: 1`, `data.credits_balance` (decreased by 1)

---

### Test Case: CREDIT-03 - AI Chat with Insufficient Credits
**Description:** Test AI chat failure when user has 0 credits
**Preconditions:** User with 0 credits and valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "Pomoz mi s matematikou"
}
```

**Expected Result:**
- **Status Code:** 402 Payment Required
- **Response Body:** `{"success": false, "error": "Insufficient credits", "data": {"credits_balance": 0, "credits_required": 1}}`

---

### Test Case: CREDIT-04 - AI Chat Credit Deduction Verification
**Description:** Test that credits are properly deducted after AI chat
**Preconditions:** User with exactly 5 credits and valid JWT token

**Steps to Execute:**
1. **Get initial balance:**
   - **Method:** GET
   - **URL:** `/api/auth/profile`
   - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
   - **Expected:** `credits_balance: 5`

2. **Send AI chat message:**
   - **Method:** POST
   - **URL:** `/api/ai/chat`
   - **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
   - **Body:**
   ```json
   {
     "message": "Vysvětli mi fyziku"
   }
   ```

3. **Verify updated balance:**
   - **Method:** GET
   - **URL:** `/api/auth/profile`
   - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
   - **Expected:** `credits_balance: 4`

**Expected Result:**
- Credit balance decreases by exactly 1 after each AI chat
- Transaction is properly recorded in the database

---

### Test Case: CREDIT-05 - AI Usage Statistics
**Description:** Test retrieval of AI usage statistics
**Preconditions:** User with some AI chat history and valid JWT token

**Steps to Execute:**
- **Method:** GET
- **URL:** `/api/ai/stats`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains usage statistics
- **Key Fields:** `success: true`, `data.total_messages`, `data.current_balance`, `data.average_cost_per_message: 1`

---

## 🤖 AI Assistant Tests

### Test Case: AI-01 - Math Assistant Response
**Description:** Test AI response for mathematics-related questions
**Preconditions:** User with sufficient credits and valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "Pomoz mi s matematikou"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains mathematics-related response in Czech
- **Key Content:** Response should mention mathematical concepts like "sčítání", "2 + 3 = 5"

---

### Test Case: AI-02 - Physics Assistant Response
**Description:** Test AI response for physics-related questions
**Preconditions:** User with sufficient credits and valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "Vysvětli mi fyziku"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains physics-related response in Czech
- **Key Content:** Response should mention "Newtonův zákon", "F = m × a"

---

### Test Case: AI-03 - Chemistry Assistant Response
**Description:** Test AI response for chemistry-related questions
**Preconditions:** User with sufficient credits and valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "Pomoz mi s chemií"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains chemistry-related response in Czech
- **Key Content:** Response should mention "atomy", "molekuly", "H₂O"

---

### Test Case: AI-04 - Biology Assistant Response
**Description:** Test AI response for biology-related questions
**Preconditions:** User with sufficient credits and valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "Vysvětli mi biologii"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains biology-related response in Czech
- **Key Content:** Response should mention "buňka", "DNA", "genetické informace"

---

### Test Case: AI-05 - History Assistant Response
**Description:** Test AI response for history-related questions
**Preconditions:** User with sufficient credits and valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "Pomoz mi s dějepisem"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains history-related response in Czech
- **Key Content:** Response should mention "První světová válka", "1914-1918"

---

### Test Case: AI-06 - Language Assistant Response
**Description:** Test AI response for language-related questions
**Preconditions:** User with sufficient credits and valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "Pomoz mi s českým jazykem"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains language-related response in Czech
- **Key Content:** Response should mention "slovní druhy", "podstatná jména", "gramatika"

---

### Test Case: AI-07 - General Question Response
**Description:** Test AI response for general questions not matching specific subjects
**Preconditions:** User with sufficient credits and valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "Jak se máš?"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains general assistant response in Czech
- **Key Content:** Response should mention "AI asistent pro učitele", "výukové materiály"

---

### Test Case: AI-08 - AI Features List
**Description:** Test retrieval of available AI features
**Preconditions:** Valid JWT token

**Steps to Execute:**
- **Method:** GET
- **URL:** `/api/ai/features`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains list of available AI features
- **Key Fields:** `success: true`, `data.features` array with 6 different assistants
- **Expected Features:** Matematický Asistent, Fyzikální Asistent, Chemický Asistent, Biologický Asistent, Historický Asistent, Jazykový Asistent

---

### Test Case: AI-09 - AI Chat with Session ID
**Description:** Test AI chat with optional session ID parameter
**Preconditions:** User with sufficient credits and valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "Pomoz mi s matematikou",
  "session_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains AI response and session_id in response
- **Key Fields:** `data.session_id` matches the provided session_id

---

### Test Case: AI-10 - AI Chat Message Validation
**Description:** Test AI chat with empty message
**Preconditions:** Valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": ""
}
```

**Expected Result:**
- **Status Code:** 400 Bad Request
- **Response Body:** Contains validation error for message field

---

### Test Case: AI-11 - AI Chat Message Too Long
**Description:** Test AI chat with message exceeding 2000 characters
**Preconditions:** Valid JWT token

**Steps to Execute:**
- **Method:** POST
- **URL:** `/api/ai/chat`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Body:**
```json
{
  "message": "A".repeat(2001)
}
```

**Expected Result:**
- **Status Code:** 400 Bad Request
- **Response Body:** Contains validation error for message length

---

## 🔧 System Health Tests

### Test Case: HEALTH-01 - Health Check Endpoint
**Description:** Test the health check endpoint
**Preconditions:** Backend server is running

**Steps to Execute:**
- **Method:** GET
- **URL:** `/api/health`
- **Headers:** None

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** `{"status": "OK", "message": "EduAI-Asistent Backend is running", "timestamp": "...", "version": "1.0.0"}`

---

### Test Case: HEALTH-02 - Root Endpoint
**Description:** Test the root endpoint
**Preconditions:** Backend server is running

**Steps to Execute:**
- **Method:** GET
- **URL:** `/`
- **Headers:** None

**Expected Result:**
- **Status Code:** 200 OK
- **Response Body:** Contains API information and available endpoints
- **Key Fields:** `message`, `version`, `status`, `endpoints`

---

### Test Case: HEALTH-03 - 404 Not Found
**Description:** Test handling of non-existent endpoints
**Preconditions:** Backend server is running

**Steps to Execute:**
- **Method:** GET
- **URL:** `/api/nonexistent`
- **Headers:** None

**Expected Result:**
- **Status Code:** 404 Not Found
- **Response Body:** `{"error": "Not Found", "message": "Route /api/nonexistent not found"}`

---

## 📊 Test Execution Checklist

### Pre-Test Setup
- [X] Backend server is running on the correct port
- [X] Database is properly initialized with schema
- [X] Environment variables are configured correctly
- [X] API client (Postman/Insomnia) is ready

### Authentication Tests
- [X] AUTH-01: User Registration (Success)
- [X] AUTH-02: User Registration (Duplicate Email)
- [X] AUTH-03: User Registration (Invalid Email)
- [X] AUTH-04: User Registration (Short Password)
- [X] AUTH-05: User Login (Success)
- [X] AUTH-06: User Login (Invalid Password)
- [X] AUTH-07: User Login (Non-existent User)
- [X] AUTH-08: Get User Profile (Authenticated)
- [X] AUTH-09: Get User Profile (Unauthenticated)
- [X] AUTH-10: Update User Profile (Success)
- [X] AUTH-11: Change Password (Success)
- [X] AUTH-12: Change Password (Wrong Current Password)

### Credit System Tests
- [X] CREDIT-01: Initial Credit Balance
- [X] CREDIT-02: AI Chat with Sufficient Credits
- [X] CREDIT-03: AI Chat with Insufficient Credits
- [X] CREDIT-04: AI Chat Credit Deduction Verification
- [X] CREDIT-05: AI Usage Statistics

### AI Assistant Tests
- [X] AI-01: Math Assistant Response
- [X] AI-02: Physics Assistant Response
- [X] AI-03: Chemistry Assistant Response
- [X] AI-04: Biology Assistant Response
- [X] AI-05: History Assistant Response
- [X] AI-06: Language Assistant Response
- [X] AI-07: General Question Response
- [X] AI-08: AI Features List
- [X] AI-09: AI Chat with Session ID
- [X] AI-10: AI Chat Message Validation
- [X] AI-11: AI Chat Message Too Long

### System Health Tests
- [X] HEALTH-01: Health Check Endpoint
- [X] HEALTH-02: Root Endpoint
- [X] HEALTH-03: 404 Not Found

### Post-Test Verification
- [X] All test cases pass
- [X] Database transactions are properly recorded
- [X] Credit balances are accurate
- [X] JWT tokens are valid and working
- [X] Error handling works correctly
- [X] Rate limiting is functioning
- [X] CORS is properly configured

---

## 🚨 Edge Cases to Consider

1. **Concurrent Requests:** Test multiple simultaneous AI chat requests
2. **Token Expiration:** Test behavior with expired JWT tokens
3. **Database Connection Issues:** Test behavior when database is unavailable
4. **Rate Limiting:** Test rate limiting behavior with multiple rapid requests
5. **Malformed JSON:** Test API behavior with malformed request bodies
6. **Large Messages:** Test with messages at the maximum allowed length
7. **Special Characters:** Test with messages containing special characters and Unicode
8. **Network Timeouts:** Test behavior under slow network conditions

---

## 📝 Test Results Documentation

For each test case, document:
- **Test Date:** When the test was executed
- **Tester:** Who executed the test
- **Result:** Pass/Fail
- **Notes:** Any observations or issues found
- **Environment:** Backend URL, database state, etc.

---

## 🎯 Success Criteria

Phase 2 testing is considered successful when:
- ✅ All authentication endpoints work correctly
- ✅ Credit system properly tracks and deducts credits
- ✅ AI chat endpoints return appropriate responses
- ✅ Error handling works for all edge cases
- ✅ Database transactions are atomic and consistent
- ✅ JWT authentication is secure and functional
- ✅ API responses follow the defined format
- ✅ All validation rules are enforced

---

**Note:** This test plan covers the complete Phase 2 implementation. Execute tests systematically and document any issues found for the development team to address. 