# Security and Database Design Notes

---

## 🔐 Cryptography Basics

### SHA-256 Algorithm

* **Definition:** Secure Hash Algorithm 256-bit.
* **Purpose:** A cryptographic hash function that generates a unique, fixed-size 256-bit (32-byte) signature for any given input.

### Digest

* **Definition:** The actual, final fixed-length hash value generated from your input data.

---

## 🗄️ Database Design: Why Use `type: String` for OTPs and Account Numbers?

When designing a database schema, it is tempting to use `type: Number` for anything composed entirely of digits. However, for critical identifiers like **One-Time Passwords (OTPs)**, **Account Numbers**, and **Phone Numbers**, using `type: String` is the industry standard.

### 1. Preserving Leading Zeros

If your system generates an OTP or an account number that starts with a zero (e.g., `053214`), JavaScript and MongoDB will treat it as a raw mathematical value if configured as a `Number`.

* **Using `type: Number`:** The database drops the leading zero because 053214 mathematically equals 53214, which alters and breaks your data.
* **Using `type: String`:** The database treats it as text, preserving it exactly as `"053214"`.

```text
Input Data: 053214 
   ├───> type: Number ───> Saves as: 53214      ❌ (Breaks OTP verification)
   └───> type: String ───> Saves as: "053214"   ✅ (Correctly preserved)
```

---

## 🔑 Authentication: Understanding Bearer Tokens

Bearer tokens are the standard way to secure modern web applications and APIs. This guide outlines how they work, their security risks, and alternative methods.

### What Does "Bearer" Mean?

The term comes from the financial concept of a "bearer instrument." It means: **"Whoever holds (bears) this token has full authority to use it."**

* **No Identity Check:** The server does not check your ID card on every request.
* **Token Validation Only:** The server only checks if you hold a valid token.

### The Movie Ticket Analogy

A bearer token functions exactly like a cinema ticket:

* **The Access Risk:** If a hacker steals your token, they become the new "bearer."
* **The Consequence:** They can access your account immediately.
* **The Protection:** You must protect tokens via HTTPS and set short expirations (e.g., `15m`).

### Why Use the `Bearer` Prefix?

In HTTP requests, the token is prefixed with the word `Bearer` inside the `Authorization` header. This serves an exact technical purpose:

* **Scheme Selection:** It explicitly tells the backend authentication middleware which security scheme is in use.
* **String Parsing:** It allows the code to split, decode, and validate the incoming string correctly.

### Alternative Authentication Schemes

Other standard HTTP prefixes exist for different use cases:

| Prefix | Use Case |
| :--- | :--- |
| **`Basic`** | Used for Base64-encoded username and password pairs. |
| **`ApiKey`** | Used for static, server-to-server security keys. |
| **`Custom`** | Used for proprietary platform tokens (e.g., `NexoraToken`). |

# Understanding Morgan Middleware in Node.js

When building a backend application, visibility into incoming traffic is crucial. Without a logging mechanism, your backend behaves like a **black box**—requests come in and responses go out, but you have no real-time visibility into the process.

By adding a single line of code—`app.use(morgan("dev"))`—Morgan opens up that black box.

---

## Anatomy of a Morgan Log

Every time a client makes an HTTP request to your server, Morgan prints a real-time summary to your terminal. Consider the following example:

```bash
GET /api/users 200 5.213 ms - 45
