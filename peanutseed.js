const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chardet = require('chardet');

let findFiles = (workingDirectory, fileWildcard) => {
    let options = {
        // Todo: Check if path exists
        cwd: path.resolve(path.normalize(workingDirectory), './')
    }

    return glob.sync(fileWildcard, options);
}

let log = (onLog, message) => {
    if (onLog) {
        onLog(message);
    }
}

let peanutseed = {
    seedSql: (config, fileWildcard, sqlServerProvider, onLog) => {
        return new Promise((resolve, reject) => {
            let files = findFiles(config.workingDirectory, fileWildcard);

            let filesFullPath = files.map(file => path.resolve(config.workingDirectory, file));

            if (filesFullPath) {
                let providerConfig = {
                    userName: config.sqlUserName,
                    password: config.sqlPassword,
                    server: config.sqlServerIp,
                    options: {
                        database: config.sqlServerDatabase
                    }
                }

                let ranScripts = new Array();
                let errors = new Array();

                log(onLog, `Running ${filesFullPath.length} scripts`);

                filesFullPath.forEach(file => {
                    let fileBuffer = fs.readFileSync(file);
                    let encoding = chardet.detect(fileBuffer);
                    let fileContent = '';

                    if (encoding === 'ISO-8859-1') {
                        fileContent = fileBuffer.toString();
                    } else {
                        fileContent = fs.readFileSync(file, 'utf16le');
                    }

                    sqlServerProvider.executeSql(providerConfig, fileContent)
                        .then(x => {
                            ranScripts.push(file);

                            let remaining = filesFullPath.filter(x => !ranScripts.some(y => y === x));

                            if (remaining.length === 0) {
                                resolve(errors);
                            } else {
                                log(onLog, `${remaining.length} scripts left`);
                            }
                        })
                        .catch(err => {
                            ranScripts.push(file);
                            errors.push(`Error at ${file} ===> ${JSON.stringify(err)}`);

                            let remaining = filesFullPath.filter(x => !ranScripts.some(y => y === x));

                            if (remaining.length === 0) {
                                resolve(errors);
                            } else {
                                log(onLog, `${remaining.length} scripts left [Error]`);
                            }
                        });
                });
            }
        });
    },
    seedObjects: (config, fileWildcard, objectDatabaseProvider, onLog) => {
        return new Promise((resolve, reject) => {
            let files = findFiles(config.workingDirectory, fileWildcard);

            let filesFullPath = files.map(file => path.resolve(config.workingDirectory, file));

            if (filesFullPath) {
                let ranScripts = new Array();
                let errors = new Array();

                log(onLog, `Running ${filesFullPath.length} files`);

                filesFullPath.forEach(file => {
                    // Gets the document as a javascript object
                    let document = JSON.parse(fs.readFileSync(file));

                    // The first property of the object should be the database name
                    Object.getOwnPropertyNames(document)
                        .forEach(database => {
                            let providerConfig = {
                                url: config.mongoUrl + database
                            }

                            // Inside the database property, there's the collection object
                            document[database].forEach(collectionObj => {
                                // Foreach collection object, get its name
                                Object.getOwnPropertyNames(collectionObj)
                                    .forEach(collectionName => {
                                        // Foreach collection, insert its data
                                        objectDatabaseProvider.insertDataOnCollection(providerConfig, collectionName, collectionObj[collectionName])
                                            .then(x => {
                                                ranScripts.push(file);

                                                let remaining = filesFullPath.filter(x => !ranScripts.some(y => y === x));

                                                if (remaining.length === 0) {
                                                    resolve(errors);
                                                } else {
                                                    log(onLog, `${remaining.length} files left`);
                                                }
                                            })
                                            .catch(err => {
                                                ranScripts.push(file);
                                                errors.push(`Error at ${file} ===> ${JSON.stringify(err)}`)

                                                let remaining = filesFullPath.filter(x => !ranScripts.some(y => y === x));

                                                if (remaining.length === 0) {
                                                    resolve(errors);
                                                } else {
                                                    log(onLog, `${remaining.length} files left [Error]`);
                                                }
                                            });
                                    });
                            });
                        });
                });
            }
        });
    }
}

module.exports = peanutseed;
