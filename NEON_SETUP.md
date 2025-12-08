# Neon Database Setup Guide

## Quick Setup Steps

### 1. Complete Neon Authentication
The `neonctl init` command should have opened a browser for authentication. If not, you can authenticate manually:

```bash
npx neonctl@latest auth
```

### 2. Create a Neon Project

You can create a project in two ways:

**Option A: Via Neon Dashboard (Easier)**
1. Go to https://console.neon.tech
2. Click "Create Project"
3. Name it "aptitude-taker-rd" (or any name you prefer)
4. Select a region close to you
5. Click "Create Project"

**Option B: Via CLI (Interactive)**
```bash
npx neonctl@latest projects create
```
Then follow the interactive prompts.

### 3. Get Connection String

Once you have a project, get the connection string:

**Via Dashboard:**
1. Go to your project in Neon console
2. Click on "Connection Details"
3. Copy the "Connection string" (it looks like: `postgres://user:password@host/dbname`)

**Via CLI:**
```bash
npx neonctl@latest connection-string
```

### 4. Update .env File

Update your `.env` file with the Neon connection string:

```bash
DATABASE_URL="your-neon-connection-string-here"
```

### 5. Push Database Schema

After updating the DATABASE_URL, run:

```bash
npx prisma db push
```

This will create all the tables in your Neon database.

### 6. Seed Admin User

```bash
npm run seed
```

### 7. Start Development Server

```bash
npm run dev
```

## Notes

- Neon provides a serverless PostgreSQL database
- The connection string includes all credentials
- You can use the standard PostgreSQL connection string format with Prisma
- No need to install @neondatabase/serverless for Prisma (it works with standard postgres:// URLs)

