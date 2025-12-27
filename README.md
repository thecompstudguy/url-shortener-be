# URL Shortener Backend (`url-shortener-be`)

Backend for a simple URL Shortener system — built with **AWS Lambda**, **Node.js**, **TypeScript**, and the **Lesgo** framework.  
Serverless, scalable, and yes… protected from people who think spamming the API is a personality trait.

---

## What is this?

This is the backend API that:
- Shortens long URLs into clean shortcodes
- Redirects users to the original link
- Runs fully serverless on AWS (no servers to babysit 👶)

---

## Prerequisites

Before running this, make sure you have:

- **Node.js** (version specified in `.nvmrc`, `nvm` highly recommended)
- **npm** (comes with Node)
- **AWS credentials** (profile-based, see `AWS_ACCOUNT_PROFILE`)

---

## Install

```bash
nvm install
nvm use
npm ci
```

---

## Environment Configuration

This project uses **stage-based environment variables**, because hardcoding secrets is a crime 🫡

Configs are loaded from:
```
config/environments/
```

All `.env*` files are ignored by Git (except `.env.example`).

---

### Creating Environment Files

Use `.env.example` as your base template.

#### Root Directory (Local Dev)

```bash
cp .env.example .env
```

#### Stage-Based Configs (for Deployments)

```bash
cp .env.example config/environments/.env.[stage]
```

---

### Supported Stages

- `dev` – development (where bugs are born)
- `sandbox` – testing / experiments
- `prod` – production (touch with fear)

Example files:
- `config/environments/.env.dev`
- `config/environments/.env.sandbox`
- `config/environments/.env.prod`
- `config/environments/.env` (local dev)

At minimum, set:
- `APP_NAME`
- `AWS_APP_REGION`
- `AWS_ACCOUNT_PROFILE`

Some stages may also need VPC configs (`AWS_VPC_*`) depending on enabled resources.

---

## Run Locally

Starts the Serverless Offline API on **port 8888**:

```bash
npm run start
```

---

## Build

```bash
npm run build
```

---

## Deploy (AWS)

1. Make sure your AWS profile exists:
   ```bash
   aws configure --profile <profileName>
   ```
2. Update the correct stage `.env` file.
3. Deploy:
   ```bash
   npm run deploy -- --stage dev
   ```

Other useful commands:

```bash
npm run logs -- --stage dev
npm run destroy -- --stage dev
```

---

## API Guide

### URL Shortener

Creates a short link from a long URL.

- **Endpoint:** `/v1/url-shortener`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "shortcode": "aB123",
    "originalUrl": "https://example.com",
    "url": "https://shrt.lnk/aB123"
  }
}
```

---

### URL Redirect

Redirects to the original URL using the shortcode.

- **Endpoint:** `/{shortcode}`
- **Method:** `GET`
- **Response:** `301 Moved Permanently`  
  (with `Location` header pointing to the original URL)

---

## Throttling (aka “Please Don’t Abuse the API”)

Yes, this API has **rate limiting**.

Why?
- To prevent spam
- To avoid accidental infinite loops
- To stop that *one guy* who tries to stress-test prod “just for fun”
- **To avoid waking up to a surprise AWS bill that could’ve paid for coffee all semester** ☕💸

Serverless is cheap… until it’s not.  
Throttling exists to keep usage fair, the system stable, and the cloud bill **not terrifying**.

So if you hit a throttle limit, it’s not broken —  
it’s just telling you to **slow down, save money, and touch grass** 🌱

---

## VPC CIDR & Subnet Notes (Read This Once, Save a Headache)

If you’re enabling VPC resources, be smart with CIDR ranges.

**Things to remember:**
- Don’t overlap CIDRs across stages (`dev`, `sandbox`, `prod`)
- Every subnet must be unique
- Leave room for future growth (you’ll regret `/28` later)

Document your ranges somewhere. Future you will thank present you.

---

**Author:** TheCompSTUDGuy  
**Email:** the.compstud.guy@universitea.shop
