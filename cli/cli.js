#!/usr/bin/env node
const { whatIs, Categories } = require('@j12934/whatis-core');

const {
  bgGreen,
  bgRed,
  bgYellow,
  bgBlue,
  bgCyan,
  bgMagenta,
} = require('colors/safe');
const arg = require('arg');

function additionalInformation(res) {
  let text = '    ';

  if (res.confidence !== null) {
    if (res.confidence > 90) {
      text += `${bgGreen(` Confidence ${res.confidence}% `)}  `;
    } else if (res.confidence < 50) {
      text += `${bgRed(` Confidence ${res.confidence}% `)}  `;
    } else {
      text += `${bgYellow(` Confidence ${res.confidence}% `)}  `;
    }
  }
  if (res.version !== null) {
    text += `${bgCyan(` Version: ${res.version.trim()} `)}  `;
  }

  return text;
}

function logSite(res) {
  if (res.application !== null) {
    console.log(
      `That's a ${bgBlue(res.application.name)} ${
        res.application.category === Categories.CMS ||
        res.application.category === Categories.StaticSiteGenerator
          ? 'site'
          : 'instance'
      }!${additionalInformation(res.application)}`
    );
    logConflictingOptions(res.conflictingPossibilities.application);
    if (res.server !== null) {
      console.log(
        `Running on a ${bgBlue(res.server.name)} server.${additionalInformation(
          res.server
        )}`
      );
      logConflictingOptions(res.conflictingPossibilities.server);
      if (res.programmingLanguage !== null) {
        console.log(
          `With ${bgBlue(
            res.programmingLanguage.name
          )} running on it.${additionalInformation(res.programmingLanguage)}`
        );
        logConflictingOptions(res.conflictingPossibilities.programmingLanguage);
      } else {
        console.log(`Unsure about the server side language used though...`);
      }
    } else {
      console.log("Can't tell what kind of server it's running on though...");
      if (res.programmingLanguage !== null) {
        console.log(
          `But it's definitly running ${bgBlue(
            res.programmingLanguage.name
          )} on the server.${additionalInformation(res.programmingLanguage)}`
        );
        logConflictingOptions(res.conflictingPossibilities.programmingLanguage);
      } else {
        console.log(`Also no idea about the server side language running.`);
      }
    }
  } else {
    console.log(
      'Not sure what kind of application that is. Something custom, perhaps?'
    );
    if (res.server !== null) {
      console.log(
        `But its ${
          res.server.confidence > 75 ? 'definity' : ''
        } running on a ${bgBlue(
          res.server.name
        )} server.${additionalInformation(res.server)}`
      );
      logConflictingOptions(res.conflictingPossibilities.server);
      if (res.programmingLanguage !== null) {
        console.log(
          `With ${bgBlue(
            res.programmingLanguage.name
          )} running on it.${additionalInformation(res.programmingLanguage)}`
        );
        logConflictingOptions(res.conflictingPossibilities.programmingLanguage);
      } else {
        console.log(`Unsure about the server side language used though...`);
      }
    } else {
      console.log(`Also no idea about the type of server it's using.`);
      if (res.programmingLanguage !== null) {
        console.log(
          `But it's definitly running ${bgBlue(
            res.programmingLanguage.name
          )} on the server.${additionalInformation(res.programmingLanguage)}`
        );
        logConflictingOptions(res.conflictingPossibilities.programmingLanguage);
      } else {
        console.log(`Also no idea about the server side language running.`);
      }
    }
  }

  if (res.others.length > 0) {
    console.log(``);
    const otherStuff = res.others
      .map(other => bgBlue(other.name.trim()))
      .join(' ');

    console.log(`And some various other stuff: ${otherStuff}`);
  }
}

function logConflictingOptions(options) {
  for (const option of options) {
    console.log(
      ` ↳  Could also be ${bgMagenta(option.name)} ${additionalInformation(
        option
      )}`
    );
  }
}

function version() {
  return require('./package.json')['version'];
}

const HELP_TEXT = `What is? 🤔

Simple and fast identification of Web Services, build on top of Wappalyzer.

Usage:
$ whats https://wiki.example.com

Arguments:
 * Default Argument: 
   URL of the service to analyse.
 * --help or -h
   Displays this message...
 * --version or -v
   Dispalys the version of this tool. It's ${version()} btw 😉
 * --json
   Outputs the results as machine readable json.
`;

async function main() {
  const args = arg({
    '--help': Boolean,
    '--version': Boolean,
    '-h': '--help',
    '-v': '--version',
    '--json': Boolean,
  });

  if (args['--help'] && args['--help'] === true) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (args['--version'] && args['--version'] === true) {
    console.log(version());
    process.exit(0);
  }

  const [target] = args._;

  try {
    new URL(target);
  } catch (e) {
    console.error(
      `The target ${bgRed(target)} doesn't look like a proper URL.`
    );
    process.exit(1);
  }

  try {
    if (!args['--json']) {
      console.log(`What is ${target}? 🤔`);
      console.log();
    }

    const res = await whatIs(target);
    if (args['--json']) {
      console.log(JSON.stringify(res));
    } else {
      logSite(res);
    }
    process.exit(0);
  } catch (error) {
    console.error(`Failed to scan ${bgRed(target)}.`);
    console.error(`Is the site reachable?`);
    process.exit(1);
  }
}

main();
