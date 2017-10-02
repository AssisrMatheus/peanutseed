var MongoClient = require('mongodb').MongoClient;

let openConnection = (config) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(config.url, (err, db) => {
            if (err) {
                reject(err);
            }

            resolve(db);
        });
    });
}

let mongoDbProvider = {
    insertDataOnCollection: (config, collectionName, data) => {
        return new Promise((resolve, reject) => {
            openConnection(config)
                .then(db => {
                    db.collection(collectionName, (err, collection) => {
                        if (err) {
                            reject(err);
                        }

                        collection.insertMany(data, (err, res) => {
                            if (err) {
                                reject(err);
                            }

                            db.close((err, closeRes) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(res);
                                }
                            })
                        })
                    });
                })
                .catch(reject);
        });
    }
}

module.exports = mongoDbProvider;
