

# Plan: Développer la Page "À Propos" (About Page)

Based on the uploaded design reference, the About page is a dedicated full page (not just the current section on the homepage). It contains several distinct sections matching the screenshot:

## Sections to Build

1. **Hero/Intro Section** — Two-row layout with dance images + text describing FTDAP, its history and mission. Red italic accent text in headings. Second row shows "pratiques de la danse" with a list of dance disciplines.

2. **Mission / Vision / Objectifs Cards** — 3 cards on a dark blue (#04138B) background strip, each with an icon, red title, and description text.

3. **Historique (Timeline)** — Vertical timeline with 3 milestones (1989 Création, 2008-2020 Évolution, 2020-2024 Moments clés) with icons and descriptions.

4. **Bureau Fédéral** — Grid of 5 members (Président, Vice-Présidente, Secrétaire Général, Trésorière, Directeur Technique) with icons, names, roles in red, and dates.

5. **Commissions** — 6 commission buttons/tags in a 3x2 grid (Arbitrage, Formation, Compétitions, Discipline, Médicale, Communication).

6. **Partenaires Institutionnels** — Row of 6 partner cards with icons and labels.

7. **Affiliations Internationales** — Same layout as partners, different organizations.

8. **Footer** — Reuse existing Footer component.

## Technical Approach

- **New page**: Create `src/pages/AboutPage.tsx` with all sections.
- **New route**: Add `/about` route in `App.tsx`.
- **Update Navbar**: Change `#about` link to `/about` route (use `Link` from react-router-dom).
- **Translations**: Add all new translation keys to `src/lib/translations.ts` for FR/EN/AR.
- **Components**: Build as a single page component with internal sections, reusing existing design patterns (same fonts, colors, motion animations).
- **Reuse**: Navbar + Footer components shared with homepage.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/AboutPage.tsx` | Create — full about page with all 7 sections |
| `src/lib/translations.ts` | Add ~80 new keys for about page content (FR/EN/AR) |
| `src/App.tsx` | Add `/about` route |
| `src/components/Navbar.tsx` | Update about link to use router Link to `/about` |

