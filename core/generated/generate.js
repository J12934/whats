// Creates a enum like structure from all availible categories

const axios = require('axios');
const { writeFileSync, truncateSync } = require('fs');

function categoryEnumBody(wappalyzer) {
  return Object.values(wappalyzer.categories)
    .map(({ name }) => {
      return { key: name.replace(/ /g, ''), name };
    })
    .map(({ key, name }) => `  ${key} = "${name}",`)
    .join('\n');
}

const main = async () => {
  const { data: wappalyzer } = await axios.get(
    'https://raw.githubusercontent.com/AliasIO/Wappalyzer/master/src/apps.json'
  );

  file = `
/**
 * Automatically generated using \`generate.js\`.
 * Do not manually edit this file.
 */

export enum Categories {
${categoryEnumBody(wappalyzer)}
}
`;

  truncateSync('wappalyer.ts');
  writeFileSync('wappalyer.ts', file);
};

main();
