/**
 * src/lib/justcms.ts
 *
 * An Astro integration for JustCMS that provides type-safe methods for fetching
 * categories, pages, a single page by its slug, and menus.
 *
 * It uses environment variables for configuration:
 * - PUBLIC_JUSTCMS_TOKEN
 * - PUBLIC_JUSTCMS_PROJECT
 */

export interface Category {
  name: string;
  slug: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface ImageVariant {
  url: string;
  width: number;
  height: number;
  filename: string;
}

export interface Image {
  alt: string;
  variants: ImageVariant[];
}

export interface PageSummary {
  title: string;
  subtitle: string;
  coverImage: Image | null;
  slug: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface PagesResponse {
  items: PageSummary[];
  total: number;
}

export interface HeaderBlock {
  type: 'header';
  styles: string[];
  header: string;
  subheader: string | null;
  size: string;
}

export interface ListBlock {
  type: 'list';
  styles: string[];
  options: {
    title: string;
    subtitle?: string | null;
  }[];
}

export interface EmbedBlock {
  type: 'embed';
  styles: string[];
  url: string;
}

export interface ImageBlock {
  type: 'image';
  styles: string[];
  images: {
    alt: string;
    variants: ImageVariant[];
  }[];
}

export interface CodeBlock {
  type: 'code';
  styles: string[];
  code: string;
}

export interface TextBlock {
  type: 'text';
  styles: string[];
  text: string;
}

export interface CtaBlock {
  type: 'cta';
  styles: string[];
  text: string;
  url: string;
  description?: string | null;
}

export interface CustomBlock {
  type: 'custom';
  styles: string[];
  blockId: string;
  [key: string]: any;
}

export type ContentBlock =
  | HeaderBlock
  | ListBlock
  | EmbedBlock
  | ImageBlock
  | CodeBlock
  | TextBlock
  | CtaBlock
  | CustomBlock;

export interface PageDetail {
  title: string;
  subtitle: string;
  meta: {
    title: string;
    description: string;
  };
  coverImage: Image | null;
  slug: string;
  categories: Category[];
  content: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  title: string;
  subtitle?: string;
  icon: string;
  url: string;
  styles: string[];
  children: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface PageFilters {
  category: {
    slug: string;
  };
}

/**
 * Layouts
 */
export interface LayoutItem {
  label: string
  description: string
  uid: string
  type: 'text' | 'html' | 'boolean' | 'svg'
  value: string | boolean
}

export interface Layout {
  id: string
  name: string
  items: LayoutItem[]
}

/**
 * Creates a JustCMS client instance.
 *
 * The client uses the provided API token and project ID, or falls back to the
 * following environment variables:
 * - PUBLIC_JUSTCMS_TOKEN
 * - PUBLIC_JUSTCMS_PROJECT
 *
 * @param apiToken Optional API token.
 * @param projectIdParam Optional project ID.
 *
 * @returns An object with methods to interact with the JustCMS API.
 *
 * @example
 * const justCms = createJustCMSClient();
 * const categories = await justCms.getCategories();
 */
export function createJustCMSClient(apiToken?: string, projectIdParam?: string) {
  const token = apiToken || import.meta.env.PUBLIC_JUSTCMS_TOKEN;
  const projectId = projectIdParam || import.meta.env.PUBLIC_JUSTCMS_PROJECT;

  if (!token) {
    throw new Error('JustCMS API token is required');
  }
  if (!projectId) {
    throw new Error('JustCMS project ID is required');
  }

  const BASE_URL = 'https://api.justcms.co/public';

  /**
   * Helper: Performs a GET request to a JustCMS endpoint.
   *
   * @param endpoint The endpoint (e.g. 'pages' or 'menus/main').
   * @param queryParams Optional query parameters.
   *
   * @returns The parsed JSON response.
   */
  const get = async <T>(
    endpoint: string = '',
    queryParams?: Record<string, any>
  ): Promise<T> => {
    const url = new URL(`${BASE_URL}/${projectId}${endpoint ? '/' + endpoint : ''}`);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`JustCMS API error ${response.status}: ${errorText}`);
    }
    return response.json();
  };

  /**
   * Retrieves all categories.
   *
   * @returns A promise that resolves with an array of categories.
   */
  const getCategories = async (): Promise<Category[]> => {
    const data = await get<CategoriesResponse>();
    return data.categories;
  };

  /**
   * Retrieves pages with optional filtering and pagination.
   *
   * @param params.filters Optional filters (e.g. filtering by category slug).
   * @param params.start Pagination start index.
   * @param params.offset Number of items to return.
   *
   * @returns A promise that resolves with a paginated pages response.
   */
  const getPages = async (params?: {
    filters?: PageFilters;
    start?: number;
    offset?: number;
  }): Promise<PagesResponse> => {
    const query: Record<string, any> = {};
    if (params?.filters?.category?.slug) {
      query['filter.category.slug'] = params.filters.category.slug;
    }
    if (params?.start !== undefined) {
      query['start'] = params.start;
    }
    if (params?.offset !== undefined) {
      query['offset'] = params.offset;
    }
    return get<PagesResponse>('pages', query);
  };

  /**
   * Retrieves a single page by its slug.
   *
   * @param slug The page slug.
   * @param version Optional version (e.g. 'draft').
   *
   * @returns A promise that resolves with the page details.
   */
  const getPageBySlug = async (
    slug: string,
    version?: string
  ): Promise<PageDetail> => {
    const query: Record<string, any> = {};
    if (version) {
      query['v'] = version;
    }
    return get<PageDetail>(`pages/${slug}`, query);
  };

  /**
   * Retrieves a menu by its ID.
   *
   * @param id The menu ID.
   *
   * @returns A promise that resolves with the menu details.
   */
  const getMenuById = async (id: string): Promise<Menu> => {
    return get<Menu>(`menus/${id}`);
  };

  /**
   * Utility: Checks if a content block has a specific style (case-insensitive).
   *
   * @param block A content block.
   * @param style The style to check for.
   *
   * @returns True if the style exists; otherwise, false.
   */
  const isBlockHasStyle = (block: any, style: string): boolean => {
    return block.styles.map((s: string) => s.toLowerCase()).includes(style.toLowerCase());
  };

  /**
   * Utility: Gets the large image variant (assumes the second variant is large).
   *
   * @param image The image object.
   *
   * @returns The large image variant.
   */
  const getLargeImageVariant = (image: Image): ImageVariant => {
    return image.variants[1];
  };

  /**
   * Utility: Gets the first image from an image block.
   *
   * @param block An image block.
   *
   * @returns The first image variant.
   */
  const getFirstImage = (block: any): ImageVariant => {
    return block.images[0];
  };

  /**
   * Utility: Checks if a page belongs to a specific category.
   *
   * @param page The page details.
   * @param categorySlug The category slug to check.
   *
   * @returns True if the page has the category; otherwise, false.
   */
  const hasCategory = (page: PageDetail, categorySlug: string): boolean => {
    return page.categories.map((category) => category.slug).includes(categorySlug);
  };

  /**
   * Retrieves a single layout by its ID.
   *
   * @param id The layout ID.
   *
   * @returns A promise that resolves with the layout details.
   */
  const getLayoutById = async (id: string): Promise<Layout> => {
    return get<Layout>(`layouts/${id}`);
  };

  /**
   * Retrieves multiple layouts by their IDs.
   *
   * @param ids Array of layout IDs.
   *
   * @returns A promise that resolves with an array of layout details.
   */
  const getLayoutsByIds = async (ids: string[]): Promise<Layout[]> => {
    return get<Layout[]>(`layouts/${ids.join(';')}`);
  };

  return {
    getCategories,
    getPages,
    getPageBySlug,
    getMenuById,
    getLayoutById,
    getLayoutsByIds,
    isBlockHasStyle,
    getLargeImageVariant,
    getFirstImage,
    hasCategory
  };
}
