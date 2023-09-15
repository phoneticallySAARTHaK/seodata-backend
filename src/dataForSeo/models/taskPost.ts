/**
 * Task object of Task POST request.
 *
 * [Documentation](https://docs.dataforseo.com/v3/on_page/task_post/)
 */
export type RequestTask = {
  target: string;
  max_crawl_pages: number;
  start_url?: string;
  force_sitewide_checks?: boolean;
  priority_urls?: string[];
  max_crawl_depth?: number;
  crawl_delay?: number;
  store_raw_html?: boolean;
  enable_content_parsing?: boolean;
  support_cookies?: boolean;
  accept_language?: string;
  custom_robots_txt?: string;
  robots_txt_merge_mode?: "merge" | "override";
  custom_user_agent?: string;
  browser_preset?: "desktop" | "mobile" | "tablet";
  browser_screen_width?: number;
  browser_screen_height?: number;
  browser_screen_scale_factor?: number;
  respect_sitemap?: boolean;
  custom_sitemap?: string;
  crawl_sitemap_only?: boolean;
  load_resources?: boolean;
  enable_www_redirect_check?: boolean;
  enable_javascript?: boolean;
  enable_xhr?: boolean;
  enable_browser_rendering?: boolean;
  disable_cookie_popup?: boolean;
  custom_js?: string;
  validate_micromarkup?: boolean;
  allow_subdomains?: boolean;
  allowed_subdomains?: string[];
  disallowed_subdomains?: string[];
  check_spell?: boolean;
  check_spell_language?: string;
  check_spell_exceptions?: string[];
  calculate_keyword_density?: boolean;
  checks_threshold?: {
    title_too_short?: number;
    title_too_long?: number;
    small_page_size?: number;
    large_page_size?: number;
    low_character_count?: number;
    high_character_count?: number;
    low_content_rate?: number;
    high_content_rate?: number;
    high_loading_time?: number;
    high_waiting_time?: number;
    low_readability_rate?: number;
    irrelevant_description?: number;
    irrelevant_title?: number;
    irrelevant_meta_keywords?: number;
  };
  disable_sitewide_checks?: string[];
  disable_page_checks?: string[];
  switch_pool?: boolean;
  return_despite_timeout?: boolean;
  tag?: string;
  pingback_url?: string;
};

/**
 * Response of Task POST request
 *
 * [Documentation](https://docs.dataforseo.com/v3/on_page/task_post/)
 */
export type Response = {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: ResponseTask[];
};

/**
 * Represents a task in the API response.
 *
 * [Documentation](https://docs.dataforseo.com/v3/on_page/task_post/)
 */
export type ResponseTask = {
  id: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  result_count: number;
  path: string[];
  data: Record<string, any>;
  result: null;
};
