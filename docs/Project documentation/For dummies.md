# 1. Development: What is this app, what's done, what's missing, and why does it matter?

> **IMPORTANT:** This app follows strict [Architecture Guidelines](../Product%20documentation/Architecture%20Guidelines.md) and [Architecture Rules](../Product%20documentation/Architecture%20Rules.md) to ensure it remains fully modular and pluggable into any host application. Always review these documents before making changes.

## What is the primary task of this app?

Imagine you're building a clubhouse for a group of friends.
The User Management System is like the front desk of the clubhouse.
Its job is to let people in (register), check who they are (log in), let them update their info (profile), and sometimes give them special keys (roles or permissions).

Critically, this clubhouse is designed to be installed in ANY building. This means:
- The clubhouse has no opinions about what the building looks like
- The building owner can replace any part of the clubhouse's appearance
- The clubhouse's functionality works regardless of the building's design
- The building owner can disable certain clubhouse features they don't need

---

## What's already implemented?

- **Registration:** The sign-up sheet at the front desk is working. New people can join the club.
- **Login:** The bouncer can check if someone is a member and let them in.
- **Profile/Settings:** Members can update their info, like changing their nickname or email.
- **Basic security:** Some basic checks to make sure only the right people get in.

---

## What's missing?

- **Advanced features:** Like giving out special badges (roles), setting up two locks for extra security (MFA), or letting people reset their keys if they lose them (password reset).
- **Some admin tools:** For the club owner to manage members more easily.
- **More tests:** To make sure everything works perfectly, even in weird situations.

---

## How important are the missing parts?

- **Core stuff** (registration, login, profile) is already there—so the club can run.
- **Missing features** are like extra security, VIP access, or better management tools.
They're not needed for a basic club, but very important if you want a safe, well-run, and flexible clubhouse.


# 2. How is it implemented? What are the central files? How is the file structure organized? Can I use just registration/login? What is middleware?

> **CRITICAL ARCHITECTURE PRINCIPLE:** This app follows a strict separation between business logic and UI. UI components MUST NEVER contain business logic, and business logic MUST NEVER render UI components. See the [Architecture Rules](../Product%20documentation/Architecture%20Rules.md) for details.

## How is it implemented?

The app is built with Next.js (think of it as the building's blueprint), React (the furniture and decorations), and Supabase (the club's member list stored in a safe).
TypeScript is used to make sure everyone follows the rules (like a strict club manager).

The most important architectural principle is that this app can be plugged into ANY host application. This means:
1. Business logic is completely separate from UI components
2. UI components use the "headless" pattern with render props
3. Database code is isolated in adapter interfaces that can be replaced
4. Features can be enabled/disabled through configuration

---

## Central files – the "brain" of the app

- **API routes** (like `/app/api/auth/register`): These are the front desk workers who handle registration, login, etc.
- **Components** (in `/src/components/`): The forms and buttons you see and use.
- **Libs/Stores** (in `/src/lib/`): The club's memory—where it keeps track of who's logged in, etc.

---

## File structure – how is it organized?

Think of the app as a well-organized clubhouse:

- `/app/api/`: The front desk and security guards (API routes).
- `/app/`: The rooms and hallways (pages you visit).
- `/src/components/`: The furniture (forms, buttons, etc.).
  - `/src/components/ui/headless/`: Behavior-only components (like furniture frames)
  - `/src/components/ui/styled/`: Default styled components (complete furniture)
- `/src/core/`: Core business rules and interfaces (the clubhouse's rulebook)
- `/src/adapters/`: External service connections (phone lines to different services)
- `/src/lib/`: The club's memory and helpers (state, utilities).
- `/tests/`: The inspectors who check if everything works.

This structure follows our [File Structure Guidelines](../Product%20documentation/File%20structure%20guidelines.md) and [Architecture Guidelines](../Product%20documentation/Architecture%20Guidelines.md).

---

## Can I use just registration and login as stand-alone features?

Yes, but...

You can take the registration and login parts (the front desk and bouncer) and use them in another club.

BUT you'll also need their helpers:
- The forms (from `/src/components/`)
- The API routes (from `/app/api/`)
- The memory helpers (from `/src/lib/`)
- Any shared styles or utilities.

It's like taking the front desk and bouncer, but also needing their walkie-talkies and checklists.

---

## What is middleware?

Middleware is like a security checkpoint in the hallway.
Before you get to a room (page), the middleware checks if you're allowed in (e.g., are you logged in?).
It sits between the front door and the rooms, making sure only the right people get through.


# 3. Testing: What are mocks? How do they work? What do they do? What is the setup? Which files use them? Why not use the real thing?

## What are mocks?

Mocks are like pretend club members or fake front desk workers used for practice runs.
Instead of using the real member list or real security, you use fake versions to test if the system works.

---

## How do they work?

When you run a test, instead of calling the real Supabase (the real member list), the app talks to a mock—a fake version that acts like Supabase but doesn't actually store real data.
This way, you can test what happens if someone tries to log in, register, or update their profile, without messing up the real club records.

---

## What do they do?

Mocks let you:
- Pretend someone is registering, logging in, or updating info.
- Simulate errors (like "what if the member list is down?").
- Test all sorts of situations safely and quickly.

---

## What is the setup?

There are global mock files (not local, so everyone uses the same fake club members).
The setup is described in `docs/TESTING.md` and `docs/TESTING_ISSUES.md`.
Tests are written using Vitest and React Testing Library—think of them as the inspectors and their clipboards.

---

## Which files use them?

Test files (like `*.test.tsx` or `*.test.ts`) use the mocks.
The mocks are set up globally, so any test can use them.
You can find them in the `/tests/` directory and sometimes in `/src/lib/__mocks__/`.

---

## Why not use the real implementation?

Using the real thing would be like testing the club by letting in real people and changing the real member list—risky and slow.
Mocks let you test everything quickly, safely, and without breaking anything.
You can simulate rare or dangerous situations (like "what if the power goes out?") that you wouldn't want to try for real.

---

## Summary Table

| Concept         | Metaphor                | Real Example in App                |
|-----------------|------------------------|------------------------------------|
| Registration    | Sign-up sheet at desk  | /app/api/auth/register, form       |
| Login           | Bouncer at the door    | /app/api/auth/login, form          |
| Middleware      | Security checkpoint    | /middleware.ts                     |
| Mocks           | Fake club members      | /src/lib/__mocks__/, /tests/       |
| Components      | Furniture/forms        | /src/components/                   |
| API Routes      | Front desk workers     | /app/api/                          |
| Lib/Store       | Club's memory          | /src/lib/                          |

If you want to use just registration and login elsewhere:
- Take the API routes, components, and helpers they use.
- Make sure you bring their "walkie-talkies" (shared utilities) and "checklists" (state management).
- You'll need to set up the "club memory" (database or Supabase) in your new place.

If you want to know more about a specific part, just ask!


# All Features the App Supports (with Metaphors)

## 1. Registration (Joining the Gym)
- **What:** New users can sign up to become members.
- **Metaphor:** Like filling out a form at the gym's front desk to get your membership card.

## 2. Login (Checking In at the Door)
- **What:** Members can log in to access their account.
- **Metaphor:** Showing your membership card to the gym bouncer to get inside.

## 3. Profile Management (Updating Your Gym Profile)
- **What:** Members can update their info (name, email, etc.).
- **Metaphor:** Telling the front desk to change your contact info or add a new emergency contact.

## 4. Password Reset (Lost Card Replacement)
- **What:** If you forget your password, you can reset it.
- **Metaphor:** If you lose your gym card, the front desk helps you get a new one.

## 5. Multi-Factor Authentication (MFA) (Extra Security Lock)
- **What:** Adds an extra step to logging in, like a code sent to your phone.
- **Metaphor:** After showing your card, you also have to enter a secret code to get into the VIP area.

## 6. Role Management (Different Gym Access Levels)
- **What:** Some users are admins, some are regular members, some are trainers.
- **Metaphor:** Some people can access the staff room, some can only use the gym floor.

## 7. API Endpoints (Gym Staff Tools)
- **What:** Special doors for the staff to manage members, not visible to regular users.
- **Metaphor:** Staff-only entrances and tools behind the scenes.

## 8. Internationalization (i18n) (Multilingual Gym Signs)
- **What:** The app can show text in different languages.
- **Metaphor:** Signs in the gym are in English, Spanish, or German depending on who's reading.

## 9. Middleware (Security Checkpoints)
- **What:** Checks if you're allowed to access certain pages.
- **Metaphor:** Security guards at different doors checking your badge.

## 10. State Management (Gym's Memory)
- **What:** Keeps track of who's logged in, what their role is, etc.
- **Metaphor:** The gym's computer system remembering who is inside and what they're allowed to do.


# Mocks: Deep Dive

## What are Mocks?

Mocks are fake versions of real things (like Supabase or i18n) used during testing.
They let you "pretend" to interact with the real system, but nothing actually happens in the real world.

---

## Why Use Mocks?

- **Speed:** Tests run much faster.
- **Safety:** No risk of breaking real data.
- **Control:** You can simulate errors or special situations easily.

---

## Types of Mocks in This Project

### 1. Supabase Mock (Fake Gym Database)
- **What:** Supabase is the real database (the gym's member list and records).
- **Mock:** A fake version that pretends to be Supabase.
- **Why:** So tests don't mess with real data, and you can simulate things like "what if the database is down?"
- **How:** The mock returns fake data or errors when the app asks for member info, registration, etc.

### 2. i18n Mock (Fake Multilingual Signs)
- **What:** i18n is the system that translates text into different languages.
- **Mock:** A fake version that just returns the English text or a simple placeholder.
- **Why:** So tests don't have to load real translation files, which can be slow or cause errors if missing.
- **How:** The mock just returns the key or a simple string, ignoring real translation logic.

### 3. Other Mocks
- **Network Requests (MSW):** Sometimes, the app makes network calls (like calling the gym's security company). MSW (Mock Service Worker) can intercept these and return fake responses.
- **Zustand Store Mocks:** If the app uses Zustand for state, there might be mocks for the store to simulate different user states (like "logged in" or "admin").
- **Email/Notification Mocks:** If the app sends emails (like password reset), there might be mocks to pretend an email was sent.

---

## Why Do Mocks Cause So Many Issues in Test Files?

1. **Out of Sync with Real Code**
   - If the real Supabase API changes (like adding a new field), but the mock doesn't, tests can break or give false results.
   - *Metaphor:* The fake gym list doesn't match the real one, so the test thinks a member doesn't exist when they actually do.

2. **Incomplete Mocks**
   - Sometimes, mocks don't cover all possible situations (like certain errors or edge cases).
   - *Metaphor:* The fake front desk can't handle someone asking for a new type of membership.

3. **Import/Path Issues**
   - If a test imports the real Supabase instead of the mock (or vice versa), it can cause weird errors.
   - *Metaphor:* The inspector accidentally talks to the real front desk instead of the practice one.

4. **Global vs. Local Mocks**
   - If mocks are set up locally in one test but not globally, other tests might not use them, causing inconsistent results.
   - *Metaphor:* Some inspectors use the fake gym, others use the real one, so their reports don't match.

5. **Async/Timing Problems**
   - Mocks might not handle delays or async behavior the same way as the real thing.
   - *Metaphor:* The fake front desk answers instantly, but the real one takes a minute, so timing-based tests fail.

---

## How Can Mocks Be Improved?

- **Keep Mocks Up to Date**
  - Whenever the real Supabase or i18n changes, update the mocks to match.
  - *Metaphor:* Make sure the fake gym's member list is always a copy of the real one.

- **Centralize and Globalize Mocks**
  - Use global mocks for everything, so all tests use the same fake systems.
  - *Metaphor:* All inspectors practice in the same fake gym, not their own versions.

- **Simulate Realistic Scenarios**
  - Make mocks behave like the real thing, including delays, errors, and edge cases.
  - *Metaphor:* The fake front desk sometimes says "the computer is down" or "membership expired."

- **Clear Documentation**
  - Write down what each mock does and doesn't do, so everyone knows what to expect.
  - *Metaphor:* A manual for the fake gym explaining its rules.

- **Test the Mocks Themselves**
  - Occasionally run tests just on the mocks to make sure they behave as expected.
  - *Metaphor:* Inspect the fake gym to make sure it's set up right.

- **Avoid Over-Mocking**
  - Don't mock too much—sometimes it's better to use the real thing for certain tests (like integration tests).
  - *Metaphor:* Sometimes, do a real fire drill in the real gym, not just the fake one.
