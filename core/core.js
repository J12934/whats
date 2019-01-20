const Wappalyzer = require('wappalyzer/driver');
const Browser = require('wappalyzer/browsers/zombie');

const { Categories } = require('./generated/wappalyer');

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

const STANDALONE_APPLICATION_CATEGORIES = [
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

function analyse(url) {
  const wappalyzer = new Wappalyzer(Browser, url, options);

  return wappalyzer.analyze().then(json => {
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

/**
 * Returns the most confident type.
 *
 * @param applications all types for the current site
 * @param callbackFunc function to determin if the argument matches the current desired kind.
 */
function findInApplication(applications, callbackFunc) {
  const filteredTypes = applications
    .filter(callbackFunc)
    .sort((a, b) => (a.confidence >= b.confidence ? 1 : -1))
    .map(applicationToSubResult);

  return filteredTypes;
}

function applicationToSubResult(app) {
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

function whatIs(url) {
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

module.exports.Categories = Categories;
module.exports.whatIs = whatIs;
