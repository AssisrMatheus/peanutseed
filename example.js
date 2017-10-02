const fs = require("fs");
const peanutseed = require('./peanutseed');
const sqlServerProvider = require('./providers/sqlServerProvider');
const mongoDbProvider = require('./providers/mongoDbProvider');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

peanutseed.seedSql(config, '**/scripts/**/*.sql', sqlServerProvider, log)
    .then(finish)
    .catch(console.error);

peanutseed.seedObjects(config, '**/seed/**/*.json', mongoDbProvider, log)
    .then(finish)
    .catch(console.error);

function log(message) {
    console.log(message);
}

function finish(message) {
    console.log(message);
}