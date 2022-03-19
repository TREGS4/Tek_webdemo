const express = require("express");
const NodeRSA = require("node-rsa");

const request = require('request');
const users_requests = require("../mysql/users_requests");

const connexion_gestion = require("../other/connexion_gestion");


module.exports = (blockchain_data, users_data) => {
    let router = express.Router();

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
                                        error: "Mot de passe incorrect."
                                    });
                                }
                            } else {
                                res.status(500).json({
                                    error: "Serveur erreur : mysql2 request."
                                });
                            }
                        });
                    } else {
                        res.status(401).json({
                            error: "Aucun utilisateur ne possède cet identifiant."
                        });
                    }
                } else {
                    res.status(500).json({
                        error: "Serveur erreur : mysql2 request."
                    });
                }
            });
        } else {
            res.status(400).json({
                error: "L'identifiant et le mot de passe doivent être definis."
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
                                        error: "Serveur erreur : mysql2 request."
                                    })
                                }
                            })
                        } else {
                            res.status(401).json({
                                error: "Cet indentifiant est déjà utilisé."
                            });
                        }
                    } else {
                        res.status(200).json({
                            error: "Serveur erreur : mysql2 request."
                        });
                    }
                });
            } else {
                if (login == "") {
                    res.status(400).json({
                        error: "L'indentifiant ne peut pas être vide."
                    });
                } else if (password.length < MIN_SIZE_PASSWORD) {
                    res.status(400).json({
                        error: "Le mot de passe doit faire au minimum " + MIN_SIZE_PASSWORD + " caractères."
                    });
                }
            }
        } else {
            res.status(400).json({
                error: "L'identifiant et le mot de passe doivent être définis."
            });
        }
    });


    router.get("/logout", (req, res, next) => {
        if (connexion_gestion.is_connected(req)) {
            req.session.destroy((err) => {
                if (err) {
                    res.status(500).json({
                        error: "Serveur erreur: destroy session failed."
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

    router.post("/transaction", connexion_gestion.need_connected, function(req, res, next) {
        const amount = parseInt(req.body.amount);
        const receiver = req.body.receiver;
        const sender = req.session.login;
        if (connexion_gestion.is_connected(req)) {
            if (amount && typeof(amount) == "number" && amount > 0) {
                if (receiver && typeof(receiver) == "string") {
                    users_requests.user_exists(receiver, (err_exists, exists) => {
                        if (!err_exists) {
                            if (exists) {
                                if (sender && typeof(sender) == "string") {
                                    // on suppose receiver existant dans la ddb.
                                    const receiver_key = blockchain_data.get_key_by_login(receiver);
                                    const sender_key = req.session.public_rsa;

                                    if (receiver_key == undefined && !sender) {
                                        res.status(500).json({
                                            error: "Server erreur. (keys)"
                                        });
                                        return;
                                    }

                                    let params = `amount=${amount}&sender=${sender_key}&receiver=${receiver_key}`;
                                    let url = `http://nyte.fr:2048/transactions/post?${params}`;
                                    request(url, { json: true },
                                        (err_req, res_req, body_req) => {
                                            if (err_req) {
                                                let error = err_req.toString();
                                                res.status(500).json({
                                                    error: "Tek est hors ligne."
                                                });
                                            } else {
                                                if (blockchain_data.get_user_amount(sender_key) < amount) {
                                                    res.status(200).json({
                                                        warning: "Votre requête a été envoyée à la blockchain qui vérifiera la validité de celle-ci. L'opération peut prendre plusieurs minutes. Il se pourrait que vous n'ayez pas assez de crédits."
                                                    });
                                                } else {
                                                    if (blockchain_data.has_already_tmptxs(sender_key)) {
                                                        res.status(200).json({
                                                            warning: "Votre requête a été envoyée à la blockchain qui vérifiera la validité de celle-ci. L'opération peut prendre plusieurs minutes. Il se pourrait que vous ayez déja une transaction non validée."
                                                        });
                                                    } else {
                                                        res.status(200).json({
                                                            success: "Votre requête a été envoyée à la blockchain qui vérifiera la validité de celle-ci. L'opération peut prendre plusieurs minutes."
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                } else {
                                    res.status(500).json({
                                        error: "Session erreur."
                                    });
                                }
                            } else {
                                res.status(401).json({
                                    error: "Ce destinataire n'existe pas."
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
                        error: "Ce destinataire est incorrect."
                    });
                }
            } else {
                res.status(400).json({
                    error: "Vous devez choisir un montant correct."
                });
            }
        } else {
            res.status(401).json({
                error: "Vous n'êtes pas connecté."
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

    return router;
};