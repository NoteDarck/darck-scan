# AI Rules for DarckScan Application

This document outlines the technical stack and specific library usage guidelines for the DarckScan application. These rules are intended to ensure consistency, maintainability, and adherence to best practices.

## Tech Stack Overview

*   **Frontend Framework**: Vue 3 (Composition API)
*   **UI Framework**: Ionic Vue for mobile-first, cross-platform UI components.
*   **Routing**: Vue Router for navigation within the application.
*   **Language**: TypeScript for type safety and improved code quality.
*   **Build Tool**: Vite for a fast development experience and optimized builds.
*   **Styling**: Custom CSS, leveraging Ionic's theming capabilities and scoped styles.
*   **Charting**: Chart.js for interactive data visualizations.
*   **Icons**: Ionicons for a consistent set of vector icons.
*   **Authentication/Data Persistence**: Currently uses local storage for user authentication and data (favorites, published works), with Firebase configuration present for potential future backend integration.

## Library Usage Rules

To maintain a cohesive and efficient codebase, please adhere to the following guidelines when developing or modifying the application:

*   **Vue 3 (Composition API)**: All new component logic and features should be implemented using Vue 3's Composition API (`<script setup>`).
*   **Ionic Vue**:
    *   **UI Components**: Always prioritize Ionic Vue components for building the user interface (e.g., `ion-page`, `ion-header`, `ion-content`, `ion-button`, `ion-card`, `ion-list`, `ion-item`, `ion-input`, `ion-select`, `ion-toggle`, `ion-spinner`, `ion-searchbar`, `ion-segment`, `ion-badge`, `ion-alert`, `ion-toast`).
    *   **Navigation**: Use `ion-router-outlet` and Ionic's navigation utilities (`router.push`, `ion-back-button`) for routing.
    *   **Modals/Alerts/Toasts**: Use Ionic's built-in controllers (`alertController`, `toastController`, `modalController`) for presenting overlays and notifications.
*   **Vue Router**: Manage all application routes in `src/router/index.ts`.
*   **TypeScript**: Ensure all new code is written in TypeScript, with appropriate types and interfaces defined (e.g., `src/types/manga.ts`).
*   **Styling**:
    *   Use scoped CSS (`<style scoped>`) within `.vue` components for component-specific styles.
    *   Global theme variables are defined in `src/theme/variables.css`.
    *   Global overrides for Ionic components are in `src/styles/override.css`.
    *   Avoid inline styles where possible; prefer CSS classes.
*   **Chart.js**: Use Chart.js for any new charting or data visualization requirements. Ensure charts are responsive and integrate well with the existing UI.
*   **Ionicons**: Use icons from the `ionicons` library. Import them explicitly and use them with the `ion-icon` component.
*   **Authentication & Data**:
    *   The `src/composables/useAuth.ts` composable handles client-side authentication logic using `localStorage`. Extend this composable for any new authentication-related features.
    *   For persistent data storage (e.g., published mangas, drafts, user favorites), continue to use `localStorage` as demonstrated in `useAuth.ts` and `DashboardPage.vue`.
    *   While Firebase configuration exists in `src/firebase/config.ts`, actual backend integration with Firebase is not yet implemented. If server-side features (e.g., real-time database, cloud functions) are required, a separate discussion for full Firebase integration will be needed.
*   **File Structure**: Adhere to the existing file structure (e.g., `src/views` for pages, `src/composables` for reusable logic, `src/types` for type definitions).

Directory names MUST be all lower-case (src/pages, src/components, etc.). File names may use mixed-case if you like.