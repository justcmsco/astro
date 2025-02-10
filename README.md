# JustCMS Astro Integration

This integration provides a type-safe interface to the [JustCMS](https://justcms.co) public API for Astro projects. It includes functions to fetch categories, pages (with filtering and pagination), a specific page by slug, and menus. In addition, several utility functions are provided to work with content blocks and images.

## Features

- **TypeScript support** with fully typed API responses.
- **Single Client API** to fetch JustCMS content.
- **Environment variables** for configuration.
- **Utility functions** for content block and image processing.

## Installation

1. **Add the Client File:**

   Place the [`src/lib/justcms.ts`](./src/lib/justcms.ts) file into your Astro project.

2. **Setup Environment Variables:**

   Create a `.env` file in your project root (or add to your existing one) with the following variables:

   ```env
   PUBLIC_JUSTCMS_TOKEN=your_justcms_api_token
   PUBLIC_JUSTCMS_PROJECT=your_justcms_project_id
   ```

3. **Install Dependencies:**

   Ensure your Astro project is set up with TypeScript. For guidance, refer to the [Astro documentation](https://docs.astro.build).

## Usage

Import the client and use it anywhere in your Astro project to fetch JustCMS data.

### Example: Fetching Categories

Below is an example of how to fetch and display categories in an Astro component:

```astro
---
import { createJustCMSClient } from '../lib/justcms';

const justCMS = createJustCMSClient();
const categories = await justCMS.getCategories();
---

<html>
  <body>
    <h2>Categories</h2>
    <ul>
      {categories.map((cat) => (
        <li key={cat.slug}>{cat.name}</li>
      ))}
    </ul>
  </body>
</html>
```

### Available Functions

#### \`getCategories()\`

Fetches all categories.

```ts
const categories = await justCMS.getCategories();
// Returns: Category[]
```

#### \`getPages(options?: { filters?: PageFilters; start?: number; offset?: number; })\`

Fetches pages with optional filtering and pagination.

```ts
const pages = await justCMS.getPages({
  filters: { category: { slug: 'blog' } },
  start: 0,
  offset: 10,
});
// Returns: PagesResponse
```

#### \`getPageBySlug(slug: string, version?: string)\`

Fetches a specific page by its slug.

```ts
const page = await justCMS.getPageBySlug('about-us');
// Returns: PageDetail
```

#### \`getMenuById(id: string)\`

Fetches a menu by its ID.

```ts
const menu = await justCMS.getMenuById('main-menu');
// Returns: Menu
```

### Utility Functions

#### \`isBlockHasStyle(block: ContentBlock, style: string)\`

Checks if a content block has a specific style (case-insensitive).

```ts
const isHighlighted = justCMS.isBlockHasStyle(block, 'highlight');
// Returns: boolean
```

#### \`getLargeImageVariant(image: Image)\`

Returns the large image variant (assumed to be the second variant).

```ts
const largeImage = justCMS.getLargeImageVariant(page.coverImage);
// Returns: ImageVariant
```

#### \`getFirstImage(block: ImageBlock)\`

Returns the first image from an image block.

```ts
const firstImage = justCMS.getFirstImage(imageBlock);
// Returns: ImageVariant
```

#### \`hasCategory(page: PageDetail, categorySlug: string)\`

Checks if a page belongs to a specific category.

```ts
const isBlogPost = justCMS.hasCategory(page, 'blog');
// Returns: boolean
```

## API Endpoints Overview

This client wraps the following JustCMS API endpoints:

- **Get Categories:** Retrieve all categories.
- **Get Pages:** Retrieve pages with optional filtering and pagination.
- **Get Page by Slug:** Retrieve detailed information about a specific page.
- **Get Menu by ID:** Retrieve a menu and its items.

For more details on the API endpoints, check out the [JustCMS Public API Documentation](https://justcms.co/api).

## License

This project is licensed under the MIT License.
