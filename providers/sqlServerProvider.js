var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

let openConnection = (config) => {
    return new Promise((resolve, reject) => {
        let connection = new Connection(config);

        connection.on('connect', err => {
            if (err) {
                reject(err);
            }

            resolve(connection);
        });

        connection.on('errorMessage', reject);
        // connection.on('infoMessage', infoError);            
        // connection.on('end', end);
        // connection.on('debug', debug);
    });
}

let sqlServerProvider = {
    executeSql: (config, sqlString) => {        
        let providerConfig = {
            userName: config.sqlUserName,
            password: config.sqlPassword,
            server: config.sqlServerIp,
            options: {
                database: config.sqlServerDatabase
            }
        }

        return new Promise((resolve, reject) => {
            openConnection(providerConfig)
                .then(connection => {
                    // Ensure it is a string
                    let sql = sqlString.toString()
                    .replace(/(\r?\n|\r)?[G][O]/g, '\r\n');

                    let request = new Request(sql, (err, rowCount) => {
                        connection.on('end', () => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(rowCount);
                            }
                        });

                        connection.close();

                        if (err) {
                            reject(err);
                        }
                    });

                    // request.on('columnMetadata', columnMetadata);
                    // request.on('row', (columns) => {
                    //     console.log(columns);
                    // });

                    connection.execSql(request);
                })
                .catch(reject);
        });
    }
}

module.exports = sqlServerProvider;
