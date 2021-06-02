const connection = require('./mysql/ddb_tek');
const messages = require('./other/messages');

module.exports = () => {

    const path = require('path');


    const express = require('express');
    const app = express();

    const express_session = require("express-session");
    const MySQLStore = require('express-mysql-session')(express_session);
    const options = {
        host: 'localhost',
        user: 'tek',
        port: 3306,
        password: '1234',
        database: 'Tek',
        clearExpired: true,
    };

    const sessionMiddleware = express_session({
        name: "sid",
        cookie: {
            maxAge: 1000 * 60 * 60 * 2,
            sameSite: true,
            secure: false //pour le developpement
        },
        secret: 'adrien le plus beau',
        resave: false,
        saveUninitialized: false,
        store: new MySQLStore(options)
    });



    const connexion_gestion = require("./other/connexion_gestion");

    /* ROUTES */
    const api_router = require("./routes/api");

    /* RENDER ENGINE */
    const hbs = require('hbs');
    hbs.registerPartials(path.join(__dirname, "views"));
    hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
    app.set('view engine', 'hbs');


    /* SET PUBLIC DIRECTORY */
    app.use(express.static(path.join(__dirname, '/public')));

    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));

    app.use(sessionMiddleware);

    app.get("/", (req, res, next) => {
        res.render('main', {
            cover: {
                connected_class: messages.cover_connection_class(req),
                text: messages.cover_connection_text(req)
            }
        });
    });

    app.get("/displayer", (req, res, next) => {
        res.render('displayer', {
            connected: connexion_gestion.is_connected(req),
        });
    });

    app.get("/login", connexion_gestion.need_disconnected, (req, res, next) => {
        res.render('login', {
            connected: connexion_gestion.is_connected(req),
        });
    });

    app.get("/logout", connexion_gestion.need_connected, (req, res, next) => {
        res.render('logout', {
            connected: false,
        });
    });

    app.get("/register", connexion_gestion.need_disconnected, (req, res, next) => {
        res.render('register', {
            connected: connexion_gestion.is_connected(req),
        });
    });

    app.get("/client", connexion_gestion.need_connected, (req, res, next) => {
        res.render('client', {
            connected: connexion_gestion.is_connected(req),
            login: req.session.login
        });
    });

    app.use("/api", api_router);



    return { app: app, sessionMiddleware: sessionMiddleware };
}