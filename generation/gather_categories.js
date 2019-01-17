// Creates a enum like structure from all availible categories

const axios = require('axios');
const _ = require('lodash');

const main = async () => {
  const res = await axios.get(
    'https://raw.githubusercontent.com/AliasIO/Wappalyzer/master/src/apps.json'
  );

  _.toArray(res.data.categories)
    .map(({ name }, id) => {
      return {
        name: _.chain(name)
          .toLower()
          .snakeCase()
          .toUpper()
          .value(),
        id: id + 1,
      };
    })
    .forEach(({ name, id }) => console.log(`${name} = ${id},`));
};

main();
