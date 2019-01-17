const Wappalyzer = require('wappalyzer/driver');
const Browser = require('wappalyzer/browsers/zombie');

const options = {
  debug: false,
  delay: 500,
  maxDepth: 3,
  maxUrls: 10,
  maxWait: 5000,
  recursive: false,
  userAgent: 'Wappalyzer',
  htmlMaxCols: 2000,
  htmlMaxRows: 2000,
};

export enum Categories {
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
  IAAS = 61,
}

export const STANDALONE_APPLICATION_CATEGORIES = [
  Categories.CMS,
  Categories.DATABASE_MANAGERS,
  Categories.ECOMMERCE,
  Categories.WIKIS,
  Categories.HOSTING_PANELS,
  Categories.BLOGS,
  Categories.ISSUE_TRACKERS,
  Categories.LMS,
  Categories.WEB_MAIL,
  Categories.BUILD_CI_SYSTEMS,
  Categories.CONTROL_SYSTEMS,
  Categories.REMOTE_ACCESS,
  Categories.CRM,
  Categories.STATIC_SITE_GENERATOR,
];

interface UrlStatus {
  status: Number;
}

interface Meta {
  language: string;
}

interface Application {
  name: string;
  confidence: string;
  version: string;
  icon: string;
  website: string;
  categories: Array<Map<string, string>>;
}

interface WappalyzerResult {
  urls: Map<string, UrlStatus>;
  applications: Array<Application>;
  meta: Meta;
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

function analyse(url: string): Promise<CleanedWappalyzerResult> {
  const wappalyzer = new Wappalyzer(Browser, url, options);

  return wappalyzer.analyze().then((json: WappalyzerResult) => {
    return {
      ...json,
      applications: json.applications.map(application => {
        return {
          ...application,
          confidence: parseInt(application.confidence),
          categories: application.categories.map(category => {
            return parseInt(Object.keys(category)[0]);
          }),
        };
      }),
    };
  });
}

type FindCallback = (application: CleanedApplication) => boolean;

/**
 * Returns the most confident type.
 *
 * @param applications all types for the current site
 * @param callbackFunc function to determin if the argument matches the current desired kind.
 */
function findInApplication(
  applications: CleanedApplication[],
  callbackFunc: FindCallback
): SubResult[] {
  const filteredTypes = applications
    .filter(callbackFunc)
    .sort((a, b) => (a.confidence >= b.confidence ? 1 : -1))
    .map(applicationToSubResult);

  return filteredTypes;
}

function applicationToSubResult(app: CleanedApplication): SubResult {
  return {
    name: app.name,
    version: app.version,
    confidence: app.confidence,
    category: app.categories[0],
  };
}

export function whatIs(url: string): Promise<Result> {
  return analyse(url).then(res => {
    const [application, ...otherApplications] = findInApplication(
      res.applications,
      application => {
        return application.categories.some(category =>
          STANDALONE_APPLICATION_CATEGORIES.includes(category)
        );
      }
    );

    const [server, ...otherServers] = findInApplication(
      res.applications,
      application => application.categories.includes(Categories.WEB_SERVERS)
    );

    const [
      programmingLanguage,
      ...otherProgrammingLanguages
    ] = findInApplication(res.applications, application =>
      application.categories.includes(Categories.PROGRAMMING_LANGUAGES)
    );

    const others = res.applications
      .filter(application => {
        return !application.categories.some(category =>
          STANDALONE_APPLICATION_CATEGORIES.includes(category)
        );
      })
      .filter(
        application => !application.categories.includes(Categories.WEB_SERVERS)
      )
      .filter(
        application =>
          !application.categories.includes(Categories.PROGRAMMING_LANGUAGES)
      )
      .map(applicationToSubResult);

    return {
      application,
      server,
      programmingLanguage,
      conflictingPossibilities: [
        ...otherApplications,
        ...otherServers,
        ...otherProgrammingLanguages,
      ],
      others: others,
    };
  });
}

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
  // A standalone application.
  // E.g. a JIRA instance or something like phpmyadmin
  application: SubResult;

  // Webserver responsible for hosting the site
  // E.g. Apache, Nginx
  server: SubResult;

  // server side programming language used
  programmingLanguage: SubResult;

  // In case other less confident types are found for application, server or programming languages they get put in this array
  conflictingPossibilities: SubResult[];

  // other types
  others: SubResult[];
}

export default analyse;
