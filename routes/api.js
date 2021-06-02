const express = require("express");
let router = express.Router();

const NodeRSA = require("node-rsa");

const users_requests = require("../mysql/users_requests");

const connexion_gestion = require("../other/connexion_gestion");

router.get("/login", (req, res, next) => {
    const login = req.query.login;
    const password = req.query.password;
    if (login && password && typeof login == "string" && typeof password == "string") {
        users_requests.user_exists(login, (err_exists, exists) => {
            if (!err_exists) {
                if (exists) {
                    users_requests.get_user(login, (err_user, user) => {
                        if (!err_user) {
                            if (password === user.password) {
                                req.session.login = login;
                                req.session.connected = true;
                                req.session.public_rsa = user.public_rsa;
                                res.status(200).json({
                                    success: true
                                });
                            } else {
                                res.status(401).json({
                                    error: "Mot de passe incorrect"
                                });
                            }
                        } else {
                            res.status(500).json({
                                error: "Serveur erreur : mysql2 request"
                            });
                        }
                    });
                } else {
                    res.status(401).json({
                        error: "Aucun utilisateur ne possède cet identifiant"
                    });
                }
            } else {
                res.status(500).json({
                    error: "Serveur erreur : mysql2 request"
                });
            }
        });
    } else {
        res.status(400).json({
            error: "L'identifiant et le mot de passe doivent être defini."
        });
    }
});



const MIN_SIZE_PASSWORD = 4;
router.post("/register", function(req, res, next) {
    const login = req.body.login;
    const password = req.body.password;
    if (login && password && typeof login == "string" && typeof password == "string") {
        if (login != "" && password.length >= MIN_SIZE_PASSWORD) {
            users_requests.user_exists(login, (err_exists, exists) => {
                if (!err_exists) {
                    if (!exists) {
                        /*
                            RSA generation
                        */
                        const key = new NodeRSA({ b: 512 });
                        let pem_public = key.exportKey('pkcs8-public'); // public
                        let pem_private = key.exportKey('pkcs8'); // private
                        pem_public = pem_public.replace(/\n/g, '');
                        pem_public = pem_public.replace("-----BEGIN PUBLIC KEY-----", '');
                        pem_public = pem_public.replace("-----END PUBLIC KEY-----", '');
                        pem_private = pem_private.replace(/\n/g, '');
                        pem_private = pem_private.replace("-----BEGIN PRIVATE KEY-----", '');
                        pem_private = pem_private.replace("-----END PRIVATE KEY-----", '');
                        console.log(pem_public);

                        users_requests.add_user(login, password, pem_public, pem_private, (err_add) => {
                            if (!err_add) {
                                res.status(200).json({
                                    success: true
                                });
                            } else {
                                res.status(500).json({
                                    error: "Serveur erreur : mysql2 request"
                                })
                            }
                        })
                    } else {
                        res.status(401).json({
                            error: "L'indentifiant est deja pris."
                        });
                    }
                } else {
                    res.status(200).json({
                        error: "Serveur erreur : mysql2 request"
                    });
                }
            });
        } else {
            if (login == "") {
                res.status(400).json({
                    error: "L'indentifiant ne peux pas être vide."
                });
            } else if (password.length < MIN_SIZE_PASSWORD) {
                res.status(400).json({
                    error: "Le mot de passe doit faire au minimum " + MIN_SIZE_PASSWORD + " caractères."
                });
            }
        }
    } else {
        res.status(400).json({
            error: "L'identifiant et le mot de passe doient être defini."
        });
    }
});


router.get("/logout", (req, res, next) => {
    if (connexion_gestion.is_connected(req)) {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({
                    error: "Serveur erreur: destroy session failed"
                });
            } else {
                res.status(200).json({
                    success: "Déconnecté."
                });
            }
        });
    } else {
        res.status(200).json({
            success: "Déconnecté."
        });
    }
});


router.get("/test", (req, res, next) => {
    const key = new NodeRSA({ b: 512 });
    const pkcs8_public = key.exportKey('pkcs8-public'); // public
    const pkcs8_private = key.exportKey('pkcs8'); // private
    const pkcs8_public_der = key.exportKey('pkcs8-public-der'); // public
    const pkcs8_private_der = key.exportKey('pkcs8-der'); // private
    console.log(pkcs8_public);
    console.log(pkcs8_private);
    console.log(key.isPrivate())
    console.log(key.isPublic())
    const publicKey = new NodeRSA(pkcs8_public_der, 'pkcs8-public-der');
    console.log("\n------\n");
    console.log(publicKey.isPrivate())
    console.log(publicKey.isPublic())
    console.log(publicKey.exportKey('pkcs8-public'))
    res.status(200).json({
        success: "ok."
    });
});

module.exports = router;