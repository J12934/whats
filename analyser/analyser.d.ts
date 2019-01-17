export declare enum Categories {
    CMS = 1,
    MESSAGE_BOARDS = 2,
    DATABASE_MANAGERS = 3,
    DOCUMENTATION_TOOLS = 4,
    WIDGETS = 5,
    ECOMMERCE = 6,
    PHOTO_GALLERIES = 7,
    WIKIS = 8,
    HOSTING_PANELS = 9,
    ANALYTICS = 10,
    BLOGS = 11,
    JAVASCRIPT_FRAMEWORKS = 12,
    ISSUE_TRACKERS = 13,
    VIDEO_PLAYERS = 14,
    COMMENT_SYSTEMS = 15,
    CAPTCHAS = 16,
    FONT_SCRIPTS = 17,
    WEB_FRAMEWORKS = 18,
    MISCELLANEOUS = 19,
    EDITORS = 20,
    LMS = 21,
    WEB_SERVERS = 22,
    CACHE_TOOLS = 23,
    RICH_TEXT_EDITORS = 24,
    JAVASCRIPT_GRAPHICS = 25,
    MOBILE_FRAMEWORKS = 26,
    PROGRAMMING_LANGUAGES = 27,
    OPERATING_SYSTEMS = 28,
    SEARCH_ENGINES = 29,
    WEB_MAIL = 30,
    CDN = 31,
    MARKETING_AUTOMATION = 32,
    WEB_SERVER_EXTENSIONS = 33,
    DATABASES = 34,
    MAPS = 35,
    ADVERTISING_NETWORKS = 36,
    NETWORK_DEVICES = 37,
    MEDIA_SERVERS = 38,
    WEBCAMS = 39,
    PAYMENT_PROCESSORS = 40,
    TAG_MANAGERS = 41,
    BUILD_CI_SYSTEMS = 42,
    CONTROL_SYSTEMS = 43,
    REMOTE_ACCESS = 44,
    DEV_TOOLS = 45,
    NETWORK_STORAGE = 46,
    FEED_READERS = 47,
    DOCUMENT_MANAGEMENT_SYSTEMS = 48,
    LANDING_PAGE_BUILDERS = 49,
    LIVE_CHAT = 50,
    CRM = 51,
    SEO = 52,
    ACCOUNTING = 53,
    CRYPTOMINER = 54,
    STATIC_SITE_GENERATOR = 55,
    USER_ONBOARDING = 56,
    JAVASCRIPT_LIBRARIES = 57,
    CONTAINERS = 58,
    SAAS = 59,
    PAAS = 60,
    IAAS = 61
}
export declare const STANDALONE_APPLICATION_CATEGORIES: Categories[];
interface UrlStatus {
    status: Number;
}
interface Meta {
    language: string;
}
interface CleanedApplication {
    name: string;
    confidence: Number;
    version: string;
    icon: string;
    website: string;
    categories: Array<Categories>;
}
interface CleanedWappalyzerResult {
    urls: Map<string, UrlStatus>;
    applications: Array<CleanedApplication>;
    meta: Meta;
}
declare function analyse(url: string): Promise<CleanedWappalyzerResult>;
export declare function whatIs(url: string): Promise<Result>;
export interface SubResult {
    /**
     * Result Value
     * E.g nginx, jira, styled-components, etc.
     */
    name: string;
    /**
     * Version of the Results
     */
    version: string;
    /**
     * Confidence of the Result
     */
    confidence: Number;
    /**
     *
     */
    category: Categories;
}
interface Result {
    application: SubResult;
    server: SubResult;
    programmingLanguage: SubResult;
    conflictingPossibilities: SubResult[];
    others: SubResult[];
}
export default analyse;
