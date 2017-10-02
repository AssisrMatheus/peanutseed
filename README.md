# Peanutseed
Easily seed your database with any script you want. Finds any file within the given path and wildcard *(little `**/**/*.sql` things)* and then gives it to the provider.

It currently comes bundled with SQL Server and Mongo providers but you can write your own for these or any other server. Providers are where the execution happens, it receives the config and the content of the seed file found by peanutseed, so you can execute on the server or manipulate them.

## Setup
- Gather the files you want to execute *(IMPORTANT: If using bundled Mongo provider, it must follow [this pattern](#seed-pattern-for-use-with-bundled-mongo-provider))*

- Install and import the `peanutseed` object containing `seedSql` or `seedObjects` methods  

- Create a config.json file anywhere you want and paste this on it, changing all values for your correspondent ones:  
```
{
    "workingDirectory": "WORKING_DIRECTORY_TO_START_LOOKING_USING_WILDCARD",
    "sqlUserName": "SQL_USER",
    "sqlPassword": "SQL_PASSWORD",
    "sqlServerIp": "SQL_SERVER_IP",
    "sqlServerDatabase": "SQL_SERVER_DATABASE",
    "mongoUrl": "MONGO_CONNECTION_URL"
}
```

- Import the config.json object using something like this:  
```
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
```

- Import the providers you want  
```
const sqlServerProvider = require('peanutseed/providers/sqlServerProvider');
const mongoDbProvider = require('peanutseed/providers/mongoDbProvider');
```

- **Use it!**  
```
const peanutseed = require('peanutseed');

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
```

# Issues
SQL Server ¬
- It does not follow any execution order because of asynchronous promises.
- "GO" keyword doesn't work. *Bundled sql provider **removes** it, so be aware with your `USE [TABLE_NAME]`, this means that the table must exist and set on config!*

Mongo ¬
- Mongo commands like `NUUID("")` doesn't work

# Reference
peanutseed.js ¬  
Method: `seedSql`  
    Parameters:  
        - `config`: A config file and its properties(Reference below)  
        - `fileWildcard`: A wildcard that will be used to find your .sql files(something like `**/*.sql`)  
        - `sqlServerProvider`: The implementation of the sql execution command. [Click here for references](#implementing-providers)  
        - **optional** `onLog`: A function that receives any text that can be used to check status.  
  
Method: `seedObjects`  
    Parameters:  
        - `config`: A config file and its properties(Reference below)  
        - `fileWildcard`: A wildcard that will be used to find your .sql files(something like `**/*.sql`)  
        - `objectDatabaseProvider`: The implementation of the object database insert execution. [Click here for references](#implementing-providers)  
        - **optional** `onLog`: A function that receives any text that can be used to check status.  

config.js ¬  
JsonObject  
Properties:  
    - `workingDirectory`: The initial path peanutseed will start looking files from.  
    - **optional if not using sql** `sqlUserName`: The username used to connect to sql server with bundled provider.  
    - **optional if not using sql** `sqlPassword`: The password used to connect to sql server with bundled provider.  
    - **optional if not using sql** `sqlServerIp`: The ip used to connect to sql server with bundled provider.  
    - **optional if not using sql** `sqlServerDatabase`: The database name used to run scripts on.  
    - **optional if not using mongo** `mongoUrl`: Mongo [connection string](https://docs.mongodb.com/manual/reference/connection-string/)  
    
## Implementing providers
- SQL oriented server:  
Create a single object with a function named `executeSql` that receives two parameters: `(config, sqlString)`. Where `config` is the config object you gave to *peanutseed* and `sqlString` is the entire content of a single file peanut found.

- Collection oriented server:  
Create a single object with a function named `insertDataOnCollection` that receives three parameters: `(config, collectionName, data)`. Where `config` is the config object you gave to *peanutseed*, `collectionName` is the name of the collection peanut found and data is the array of objects for that collection.

## Seed pattern for use with bundled mongo provider  
If using bundled mongo provider, it is important to follow the pattern it expects. The pattern consist of an object with N properties named as the server you want to seed those collections to, and those properties must be an array of collections, followed by the array of objects. **Example**:
```
{
    // Servers array
    "MyUserServer": [
        {
            // Collection array
            "Users": [
                // Objects
                {
                    "Name": "John",
                    "Age": 12
                },
                {
                    "Name": "Mariah",
                    "Age": 42
                }
            ]
        }
    ]
}
```

* Sql server doesn't have this since server and database is set on config file. It'll just find the .sql file and execute it on SqlServerProvider.

# Dependencies
- glob
- chardet
- tedious for use with bundled sql-server provider
- mongodb for user with bundled mongo provider
