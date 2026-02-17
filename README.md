# Integrity Agente de Seguros - Astro Website

A modern, static website for Integrity Insurance built with Astro, Svelte, and Tailwind CSS.

## 🚀 Tech Stack

- **[Astro](https://astro.build)** - Static Site Generator
- **[Svelte](https://sv elte.dev)** - Interactive components
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## 📁 Project Structure

```
/
├── public/
│   └── images/          # Static images (for future use)
├── src/
│   ├── components/      # Reusable Svelte & Astro components
│   │   ├── Navigation.svelte
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── ServiceCard.svelte
│   │   ├── ContactForm.svelte
│   │   └── SEO.astro
│   ├── layouts/         # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/           # Route pages (file-based routing)
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── why-insurance.astro
│   │   └── partners.astro
│   └── styles/          # Global styles
│       └── global.css
├── astro.config.mjs     # Astro configuration
├── tailwind.config.mjs  # Tailwind configuration
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |

## 🎨 Customization

### Colors

The color palette is defined in `tailwind.config.mjs`:

- **Primary**: `#1d2e81` (Deep Blue)
- **Secondary**: `#2e7d32` (Green)
- **Background Light**: `#f8f9fa`
- **Background Dark**: `#121212`

To change colors, edit the `theme.extend.colors` section in `tailwind.config.mjs`.

### Fonts

The site uses:
- **Display**: Montserrat (headings)
- **Body**: Open Sans (body text)

Fonts are loaded from Google Fonts in `BaseLayout.astro`.

### Dark Mode

Dark mode is implemented but **disabled by default**. To enable:

1. Uncomment the dark mode toggle in `Navigation.svelte`
2. Uncomment the dark mode script in `BaseLayout.astro`

## 📝 Adding New Pages

1. Create a new `.astro` file in `src/pages/`
2. Use the `BaseLayout` component
3. Pass SEO props (title, description)
4. Add your content

**Example:**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Navigation from '../components/Navigation.svelte';
import Footer from '../components/Footer.astro';
---

<BaseLayout
  title="New Page | Integrity Agente de Seguros"
  description="Description of your new page"
>
  <Navigation client:load />
  
  <main>
    <!-- Your content here -->
  </main>

  <Footer />
</BaseLayout>
```

## 🖼️ Adding Images

### External Images
Currently, the site uses external Google-hosted images. These work as-is.

### Local Images
To add local images:

1. Place image files in `/public/images/`
2. Reference them in your code as `/images/filename.jpg`
3. Always include descriptive alt text

```astro
<img 
  src="/images/team-photo.jpg" 
  alt="Descriptive alt text"
/>
```

## 🔧 Contact Form Backend

The contact form (`ContactForm.svelte`) has a placeholder API endpoint. To connect it to your backend:

1. Set up your Laravel/Rails backend endpoint
2. Update the fetch URL in `src/components/ContactForm.svelte`:

```typescript
const response = await fetch('YOUR_BACKEND_URL/api/contact', {
  method: 'POST',
  // ...
});
```

## 🌐 Deployment to GitHub Pages

### Configuration

The site is pre-configured for GitHub Pages deployment in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/integrity_insurance_mx',
  // ...
});
```

**Update these values:**
1. Replace `yourusername` with your GitHub username
2. Replace `integrity_insurance_mx` with your repository name (or remove `base` if deploying to a root domain)

### Deploy Steps

1. **Build the site:**
   ```bash
   npm run build
   ```

2. **Configure GitHub Pages:**
   - Go to your repository settings
   - Navigate to Pages section
   - Set source to GitHub Actions (or deploy the `dist/` folder)

3. **GitHub Actions (Recommended):**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]
     workflow_dispatch:

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v1
           with:
             path: ./dist
     
     deploy:
       needs: build
       runs-on: ubuntu-latest
       permissions:
         pages: write
         id-token: write
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - uses: actions/deploy-pages@v1
           id: deployment
   ```

## 📖 SEO Guidelines

See [SEO_GUIDELINES.md](./SEO_GUIDELINES.md) for detailed SEO best practices and how to optimize your pages.

## 🎯 Features

- ✅ Responsive design for all devices
- ✅ SEO-optimized with meta tags and Open Graph
- ✅ Dark mode support (disabled by default)
- ✅ Reusable component architecture
- ✅ Contact form with validation
- ✅ Static site generation for fast loading
- ✅ GitHub Pages ready

## 📄 License

See [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

This is a private project for Integrity Agente de Seguros. For questions or support, contact the development team.
