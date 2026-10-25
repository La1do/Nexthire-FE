# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Candidates:** Job seekers searching for relevant careers, crafting tailored CVs using an interactive drag-and-drop builder, submitting applications, and tracking their interview and review stages.
- **Recruiters & Hiring Teams:** Talent acquisition professionals posting job openings, screening candidate pipelines in an ATS-grade interface (table, drawer, and status workflows), evaluating applications, and maintaining verified company profiles.
- **Platform Administrators:** Internal operators managing user accounts, company verifications, job moderation policies, AI matching features, and system-wide CV templates.

## Product Purpose

Nexthire is a modern, two-sided recruitment platform connecting job seekers with hiring companies. It exists to replace fragmented hiring processes with an integrated ecosystem: empowering candidates to showcase their skills with professional CVs and applying seamlessly, while enabling recruiters to manage applicants efficiently with ATS-grade tools and AI-driven match assistance.

## Positioning

An international-first recruitment platform integrating an interactive CV creation studio for candidates directly with an ATS pipeline (Greenhouse/Lever aesthetic) and AI-augmented candidate-job matching and moderation.

## Operating Context

- **Environment:** Responsive desktop and mobile web application.
- **Workflows:** High-density recruiter pipeline management (applicant review drawers, candidate evaluation status changes), interactive canvas/document editing (CV Builder), job exploration and multi-filter discovery, and multi-tenant admin oversight.
- **Internationalization:** Multi-language interface with English (`en`) prioritized as the primary global language, alongside complete localization for Vietnamese (`vi`) and Japanese (`ja`).

## Capabilities and Constraints

- **Technology Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Zustand, TanStack Query, React Hook Form with Zod validation, dnd-kit, Recharts, and Lucide React.
- **CSS Architecture:** Strict CSS ownership guidelines (layout and page styles co-located; `src/styles/index.css` restricted to tokens, reset, and shared primitives).
- **Role-Based Access Control:** Strict RBAC across Candidate, Recruiter, and Admin spaces with business logic gating (company setup, verification status, job posting entitlements).
- **Data & Documents:** Client-side CV export (PDF/canvas), asynchronous job and applicant indexing, REST API integration via Axios.

## Brand Commitments

- **Name:** Nexthire
- **Tone & Identity:** Professional, trustworthy, structured, and modern. High-density precision for recruiter operations; clear, motivating, and accessible for candidate journeys.

## Evidence on Hand

- Complete route registry and role architectures in `src/app/routes/`.
- ATS redesign specifications in `docs/superpowers/specs/2026-07-21-recruiter-ui-ats-redesign-design.md` and admin specs in `docs/superpowers/specs/2026-07-14-admin-users-design.md`.
- Multilingual translation catalogs for English, Vietnamese, and Japanese in `src/i18n/`.
- No marketing testimonials, customer logos, or external analytics data stored in the repo; future surfaces must not fabricate unverified claims.

## Product Principles

1. **High Signal-to-Noise Ratio:** Maximize information density and scanability in recruiter and admin views without cognitive overload.
2. **Frictionless Candidate Experience:** Keep resume building and application submission intuitive, responsive, and reliable across devices.
3. **Transparent AI Assistance:** Deliver AI matching, suggestions, and moderation as assistive insights that keep human recruiters in full control.
4. **Multilingual Fluidity:** Ensure layouts, cards, typography, and data tables accommodate variations in text length across English, Vietnamese, and Japanese without breakage.
5. **Architectural Discipline:** Maintain strict component and CSS boundaries to preserve maintainability as features scale.
