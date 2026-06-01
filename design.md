# Design Document: Hotel Room Ops Management System

## Design Philosophy
This application is designed as a professional "Integrated Room Management" system. It prioritizes high readability, rapid status updates, and real-time collaboration between cleaning staff and management.

The aesthetic is "Swiss Professional" — clean, grid-based, with high-contrast typography and intentional use of negative space to reduce cognitive load in a busy operations environment.

## Typography
- **Display (Headings):** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
  - Used for room numbers, dashboard titles, and key metrics.
  - Characteristics: Technical, modern, slightly industrial feel.
- **Body:** [Inter](https://fonts.google.com/specimen/Inter)
  - Used for all UI controls, descriptions, and labels.
  - Characteristics: Neutral, ultra-legible even at small sizes.

## Color Palette
| Purpose | Class | Value |
| :--- | :--- | :--- |
| **Primary/Admin** | `slate-900` | `#0f172a` |
| **Cleaning** | `blue-600` | `#2563eb` |
| **Alert/Issue** | `rose-600` | `#e11d48` |
| **Completed** | `emerald-600` | `#059669` |
| **Background** | `slate-50` | `#f8fafc` |

## Visual Language
- **Border Radius:** `lg` (8px) for cards and buttons. Avoids the "soft" look of rounded corners in favor of a more modular, architectural feel.
- **Grids:** Strict usage of Tailwind's spacing scale (`p-4`, `p-8`) to maintain rhythm.
- **Micro-interactions:** 
  - `motion/react` for tab transitions (horizontal slide) and modal entrances (scale/fade).
  - Subtle hover states on actionable cards (`border-slate-800`).

## Navigation Structure
1. **Manager Portal:**
   - **Dashboard:** High-level status overview and floor map.
   - **Notification:** Actionable list of issues and lost items with photographic evidence.
   - **Room Assets:** Master room list, cleaner assignment, and room type configuration.
   - **Cleaning Standards:** Dynamic management of the hotel-wide cleaning checklist.

2. **Cleaner Portal:**
   - **Task List:** Filtered list of assigned or available rooms.
   - **Room Detail:** Dynamic checklist based on global standards, maintenance logging, and photographic reporting tools.

## Real-time Sync
Powered by **Firebase Firestore**, ensuring that as soon as a cleaner taps "Complete", the manager's dashboard updates in milliseconds without a page refresh.
