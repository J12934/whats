import Wappalyzer from 'wappalyzer/driver';
import Browser from 'wappalyzer/browsers/zombie';

import { Categories } from './generated/wappalyer';

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

export const STANDALONE_APPLICATION_CATEGORIES = [
  Categories.CMS,
  Categories.DatabaseManagers,
  Categories.Ecommerce,
  Categories.Wikis,
  Categories.HostingPanels,
  Categories.Blogs,
  Categories.IssueTrackers,
  Categories.LMS,
  Categories.WebMail,
  Categories.BuildCISystems,
  Categories.ControlSystems,
  Categories.RemoteAccess,
  Categories.CRM,
  Categories.StaticSiteGenerator,
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
            return Object.values(category)[0];
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
  if (!app) {
    return null;
  }
  return {
    name: app.name,
    version: app.version,
    confidence: app.confidence,
    category: app.categories[0],
  };
}

export function whatIs(url: string): Promise<Result> {
  return analyse(url).then(res => {
    const [application = null, ...otherApplications] = findInApplication(
      res.applications,
      application => {
        return application.categories.some(category =>
          STANDALONE_APPLICATION_CATEGORIES.includes(category)
        );
      }
    );

    const [server = null, ...otherServers] = findInApplication(
      res.applications,
      application => application.categories.includes(Categories.WebServers)
    );

    const [
      programmingLanguage = null,
      ...otherProgrammingLanguages
    ] = findInApplication(res.applications, application =>
      application.categories.includes(Categories.ProgrammingLanguages)
    );

    const others = res.applications
      .filter(application => {
        return !application.categories.some(category =>
          STANDALONE_APPLICATION_CATEGORIES.includes(category)
        );
      })
      .filter(
        application => !application.categories.includes(Categories.WebServers)
      )
      .filter(
        application =>
          !application.categories.includes(Categories.ProgrammingLanguages)
      )
      .map(applicationToSubResult);

    return {
      application,
      server,
      programmingLanguage,
      conflictingPossibilities: {
        application: otherApplications,
        server: otherServers,
        programmingLanguage: otherProgrammingLanguages,
      },
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

export interface Result {
  // A standalone application.
  // E.g. a JIRA instance or something like phpmyadmin
  application: SubResult;

  // Webserver responsible for hosting the site
  // E.g. Apache, Nginx
  server: SubResult;

  // server side programming language used
  programmingLanguage: SubResult;

  // In case other less confident types are found for application, server or programming languages they get put in this array
  conflictingPossibilities: {
    application: SubResult[];
    server: SubResult[];
    programmingLanguage: SubResult[];
  };

  // other types
  others: SubResult[];
}

export default analyse;

export { Categories } from './generated/wappalyer';
