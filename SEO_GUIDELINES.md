# SEO Guidelines for Integrity Insurance Website

This document outlines the SEO best practices for the Integrity Agente de Seguros astro website.

## Using the SEO Component

Every page should use the `SEO.astro` component within the `BaseLayout`. The component is already included in `BaseLayout.astro`, so you only need to pass the appropriate props.

### Example Usage

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Your Page Title - Integrity Agente de Seguros"
  description="A compelling description of your page content (150-160 characters)"
  image="/images/og-image.jpg" // Optional
  canonicalURL="https://yourdomain.com/page" // Optional
>
  <!-- Your page content -->
</BaseLayout>
```

## SEO Best Practices

### 1. Page Titles

- **Format**: `[Page Name] | Integrity Agente de Seguros`
- **Length**: 50-60 characters
- **Include keywords**: Place important keywords at the beginning
- **Be descriptive**: Clearly indicate what the page is about
- **Unique**: Every page should have a unique title

**Examples:**
- Homepage: `Integrity Agente de Seguros - Protecting What Matters Most`
- About: `About Us | Integrity Agente de Seguros`
- Services: `Insurance Services | Integrity Agente de Seguros`

### 2. Meta Descriptions

- **Length**: 150-160 characters
- **Include call-to-action**: Encourage clicks
- **Be specific**: Summarize the page content accurately
- **Include keywords**: Naturally incorporate relevant keywords
- **Unique**: Each page needs a unique description

**Good Example:**
```
"We provide unbiased, expert insurance guidance tailored to your unique life stage. Secure your future with a partner who puts your interests first."
```

### 3. Image Alt Text

Always provide descriptive alt text for images:

```astro
<img 
  src="..." 
  alt="Professional consultant discussing insurance policy with client in modern office"
/>
```

**Guidelines:**
- Be specific and descriptive
- Include keywords naturally when relevant
- Don't start with "Image of..." or "Picture of..."
- Keep it concise (125 characters or less)

### 4. Heading Structure

Use a proper heading hierarchy:

```html
<h1>Main Page Title</h1>  <!-- Only ONE h1 per page -->
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>
    <h3>Another Subsection</h3>
  <h2>Another Section</h2>
```

**Rules:**
- Only one `<h1>` per page
- Don't skip heading levels (don't go from h2 to h4)
- Use headings for structure, not styling

### 5. Semantic HTML

Use appropriate HTML5 semantic elements:

- `<header>` for page/section headers
- `<nav>` for navigation
- `<main>` for main content
- `<article>` for self-contained content
- `<section>` for thematic grouping
- `<aside>` for sidebar content
- `<footer>` for page/section footers

### 6. Internal Linking

- Link to related pages using descriptive anchor text
- Use relative paths for internal links: `/about` instead of `https://domain.com/about`
- Ensure all important pages are linked from at least one other page
- Use descriptive link text instead of "click here"

**Good:**
```astro
<a href="/contact">Request a free consultation</a>
```

**Bad:**
```astro
<a href="/contact">Click here</a>
```

### 7. Open Graph & Social Media

The SEO component automatically includes Open Graph tags. To customize the social media preview image:

```astro
<BaseLayout
  title="Page Title"
  description="Page description"
  image="/images/custom-og-image.jpg"
>
```

**Image Requirements:**
- Minimum size: 1200x630 pixels
- Format: JPG or PNG
- Aspect ratio: 1.91:1

### 8. Performance

- **Images**: Use appropriate image sizes and formats
- **Lazy loading**: Use `loading="lazy"` for images below the fold
- **External scripts**: Minimize use of third-party scripts
- **Minification**: Let Astro handle CSS/JS minification

## Creating New Pages

When adding a new page, follow this checklist:

- [ ] Create the page in `src/pages/`  
- [ ] Use `BaseLayout` with appropriate SEO props
- [ ] Include unique, descriptive title
- [ ] Write compelling meta description
- [ ] Use proper heading hierarchy (one h1)
- [ ] Add descriptive alt text to all images
- [ ] Use semantic HTML elements
- [ ] Add internal links to related pages
- [ ] Test the page locally
- [ ] Verify meta tags in browser DevTools

## Local Images

To add local images:

1. Place images in the `public/images/` directory
2. Reference them with `/images/filename.jpg`
3. Always provide alt text
4. Consider using WebP format for better compression

```astro
<img 
  src="/images/team-photo.jpg" 
  alt="Integrity Insurance team members at annual conference"
  loading="lazy"
/>
```

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Astro SEO Documentation](https://docs.astro.build/en/guides/integrations-guide/)
- [Schema.org](https://schema.org/) for structured data
