import { whatIs, SubResult, Categories } from '../core/core';

import { bgGreen, bgRed, bgYellow, bgBlue, bgCyan } from 'colors/safe';

function additionalInformation(res: SubResult) {
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
    text += `${bgCyan(` Version: ${res.version} `)}  `;
  }

  return text;
}

async function main() {
  const target = process.argv[2];
  console.log(`What is ${target}? 🤔`);
  console.log();

  try {
    const res = await whatIs(target);

    if (res.application !== null) {
      console.log(
        `That's a ${bgBlue(res.application.name)} ${
          res.application.category === Categories.CMS ||
          res.application.category === Categories.StaticSiteGenerator
            ? 'site'
            : 'instance'
        }!${additionalInformation(res.application)}`
      );
      if (res.server !== null) {
        console.log(
          `Running on a ${bgBlue(
            res.server.name
          )} server.${additionalInformation(res.server)}`
        );
        if (res.programmingLanguage !== null) {
          console.log(
            `With ${bgBlue(
              res.programmingLanguage.name
            )} running on it.${additionalInformation(res.programmingLanguage)}`
          );
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
          } running on a ${bgBlue(res.server.name)}.${additionalInformation(
            res.server
          )}`
        );
        if (res.programmingLanguage !== null) {
          console.log(
            `With ${bgBlue(
              res.programmingLanguage.name
            )} running on it.${additionalInformation(res.programmingLanguage)}`
          );
        } else {
          console.log(`Unsure about the server side language used though...`);
        }
      } else {
        console.log(`Also no idea about the server side language running.`);
        if (res.programmingLanguage !== null) {
          console.log(
            `But it's definitly running ${bgBlue(
              res.programmingLanguage.name
            )} on the server.${additionalInformation(res.programmingLanguage)}`
          );
        } else {
          console.log(`Also no idea about the server side language running.`);
        }
      }
    }

    console.log();
    console.log();
    if (res.conflictingPossibilities.length > 0) {
      for (const option of res.conflictingPossibilities) {
        //TODO
        // Or maybe include conflicting infos directly under the matching section?
      }
    }
  } catch (error) {
    console.error(`Some went really wrong.`);
    console.error(`Is the site reachable?`);

    console.error(error);
  }
}

main();
