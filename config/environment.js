const development = {
    name: 'development',
    port:5000,
    cachingdb :'cachingdb',
    sessionCookieSecret: 'imitateDB_development',
    assets: 'assets',
    captcha:{
        cookie: process.env.captchaCookie,
        background: 'rgb(255,200,150)',
        fontSize: 60,
        width: 250,
        height: 150,
        charPreset: 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789',
        noise: 3,
        size: 4, // size of random string
        color: false
    },
    smtp:{
        service:'gmail',
        host:process.env.smtpHost,
        port:process.env.smtpPort,
        secure:false,
        auth:{
            user : process.env.smtpUser,
            pass: process.env.smtpPass
        }
        
    },

    recaptchaSecret: process.env.recaptchaSecret,
    
    db:{
        host: process.env.dbHost,
        user: process.env.dbUser,
        password: process.env.dbPassword,
        database: process.env.dbName,
        port: '/tmp/mysql.sock'
    }


}

const production = {
    name: 'production',
    port:process.env.port,
    cachingdb :process.env.cachingdb,
    sessionCookieSecret: process.env.sessionCookieSecret,
    assets: process.env.assets,
    captcha:{
        cookie: process.env.captchaCookie,
        background: 'rgb(256,256,256)',
        fontSize: 60,
        width: 250,
        height: 150,
        charPreset: 'abcdefghijkmnopqrstuvwxyz0123456789',
        noise: 3,
        size: 4, // size of random string
        color: true
    },
    smtp:{
        service:'gmail',
        host:process.env.smtpHost,
        port:process.env.smtpPort,
        secure:false,
        auth:{
            user : process.env.smtpUser,
            pass: process.env.smtpPass
        }
        
    },

    recaptchaSecret: process.env.recaptchaSecret,
    
    db:{
        host: process.env.dbHost,
        user: process.env.dbUser,
        password: process.env.dbPassword,
        database: process.env.dbName
        
    }


}

module.exports = (eval(process.env.NODE_ENV) == undefined) ? development : eval(process.env.NODE_ENV);