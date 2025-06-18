# Internationalization (i18n) Strategy for BingeWatch

This document outlines the plan for translating the BingeWatch application from English to Hebrew using a robust and scalable internationalization (i18n) strategy.

## 1. Recommended Library

For this React/Vite project, we recommend using the following libraries:

*   **`react-i18next`**: A powerful internationalization framework for React, providing hooks and components to streamline the translation process.
*   **`i18next`**: The core i18n library that `react-i18next` is built upon.
*   **`i18next-http-backend`**: A plugin for `i18next` that enables loading translations from a server or, in our case, from local files.

This combination is widely used, well-documented, and provides features like translation loading, language detection, and caching.

## 2. File Structure

We will store translation files in the `public` directory to make them accessible as static assets. This structure allows for easy addition of new languages in the future.

```
public/
└── locales/
    ├── en/
    │   └── translation.json
    └── he/
        └── translation.json
```

*   `{lang}` will be the ISO 639-1 language code (e.g., `en` for English, `he` for Hebrew).
*   `translation.json` will contain the key-value pairs for the translations.

## 3. Integration Steps

### Step 1: Install Dependencies

First, we need to add the necessary packages to the project.

```bash
npm install react-i18next i18next i18next-http-backend
```

### Step 2: Create i18n Configuration File

Next, create a new file at `src/i18n.ts` to configure `i18next`.

```typescript
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'he'],
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
```

### Step 3: Wrap the Root Component

To make the i18n instance available throughout the component tree, we need to wrap our root component ([`src/App.tsx`](src/App.tsx)) with the `I18nextProvider`. We also need to import our new `i18n.ts` file.

Modify [`src/main.tsx`](src/main.tsx) as follows:

```typescript
// src/main.tsx
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Import the i18n configuration

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback="loading...">
      <App />
    </Suspense>
  </StrictMode>
);
```
*Note: We've added `React.Suspense` to handle the asynchronous loading of translation files.*

## 4. Component Refactoring Example

Here is an example of how to refactor a component to use the `t` function from `react-i18next` for translations. We will use the `Header` component as an example.

### Before Refactoring

In [`src/components/Header.tsx`](src/components/Header.tsx), the navigation item labels are hardcoded:

```typescript
// src/components/Header.tsx (partial)

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: TrendingUp, label: 'Trending', path: '/trending' },
  { icon: Clock, label: 'Latest', path: '/latest' },
  { icon: Star, label: 'Top Rated', path: '/top-rated' },
];

// ... inside the component render method
<Link to="/auth/login">
  <span>Sign In</span>
</Link>
<Link to="/auth/register">
  <span>Sign Up</span>
</Link>
```

### After Refactoring

We will use the `useTranslation` hook to get the `t` function and replace the hardcoded strings with translation keys.

```typescript
// src/components/Header.tsx (partial)
import { useTranslation } from 'react-i18next';
// ...

export const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('nav.home'), path: '/' },
    { icon: TrendingUp, label: t('nav.trending'), path: '/trending' },
    { icon: Clock, label: t('nav.latest'), path: '/latest' },
    { icon: Star, label: t('nav.topRated'), path: '/top-rated' },
  ];

// ... inside the component render method
<Link to="/auth/login">
  <span>{t('auth.signIn')}</span>
</Link>
<Link to="/auth/register">
  <span>{t('auth.signUp')}</span>
</Link>

// ...
}
```

### Corresponding Translation Files

The translation keys used in the component will be defined in the JSON files.

**`public/locales/en/translation.json`**
```json
{
  "nav": {
    "home": "Home",
    "trending": "Trending",
    "latest": "Latest",
    "topRated": "Top Rated"
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up"
  }
}
```

**`public/locales/he/translation.json`**
```json
{
  "nav": {
    "home": "בית",
    "trending": "פופולרי",
    "latest": "אחרונים",
    "topRated": "הכי מדורגים"
  },
  "auth": {
    "signIn": "התחבר",
    "signUp": "הירשם"
  }
}
```

This strategy provides a solid foundation for internationalizing the BingeWatch application.