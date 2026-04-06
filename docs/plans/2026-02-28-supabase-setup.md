# Supabase Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Configure Supabase locally, link to the remote project, and initialize the database schema.

**Architecture:** Use the Supabase CLI to link the local repository to the remote project and apply the schema migrations from `supabase_init.sql` and `supabase/migrations/001_initial_schema.sql`.

**Tech Stack:** Supabase CLI, PostgreSQL, Vite, React

---

### Task 1: Check Supabase installation
**Files:**
- N/A

**Step 1: Try running `supabase --version`**
Run: `supabase --version`
Expected: FAIL if not installed.

**Step 2: Install Supabase CLI (if missing)**
Run: `brew install supabase/tap/supabase` (for macOS)

**Step 3: Verify installation**
Run: `supabase --version`
Expected: PASS with version number.

### Task 2: Initialize and Link Supabase
**Files:**
- Modify: `supabase/`

**Step 1: Initialize Supabase locally**
Run: `supabase init`
Expected: Creation of `supabase/config.toml`.

**Step 2: Link to the remote project**
Run: `supabase link --project-ref epnqlxhgqfhbhwycsdwf`
Expected: Password prompt (requires user interaction).

### Task 3: Apply Database Schema
**Files:**
- Modify: `supabase/migrations/001_initial_schema.sql`

**Step 1: Push migrations to the remote database**
Run: `supabase db push`
Expected: PASS.

**Step 2: Verify tables in Supabase Dashboard**
Manual verification by the USER.

### Task 4: Configure Environment Variables
**Files:**
- Modify: `.env`

**Step 1: Update `.env` with the correct `VITE_SUPABASE_ANON_KEY`**
Manual step: USER should provide the anon key or I can try to find it if possible.

---
