var env = process.env.NODE_ENV;

// Default settings go here
var settings = {
    MONGO_URL: 'localhost',	
    MONGO_PORT: 27017,
    MONGO_DB: 'dev',    
    
    LOG_LEVEL: 2,
}

if ( typeof env == 'undefined' ) { 
   env = 'dev';
}

if ( env == 'dev' ) {

} else if ( env == 'test' ) {
    settings.MONGO_DB = 'test';
    LOG_LEVEL = 1;
}

//console.log( "Using env:", env );

module.exports = settings;