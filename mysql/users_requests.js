const connection = require('./ddb_tek');


function user_exists(login, callback) {
    let sql_req = "SELECT * FROM `users` WHERE login = ?";

    connection.execute(
        sql_req, [login],
        (err, results, fields) => {
            if (err == null && results.length > 0) {
                callback(err, true);
            } else {
                callback(err, false);
            }
        }
    );
}


function get_user(login, callback) {
    let sql_req = "SELECT * FROM `users` WHERE login = ?";

    connection.execute(
        sql_req, [login],
        (err, results, fields) => {
            if (err == null) {
                callback(err, results[0]);
            } else {
                callback(err, null);
            }
        }
    );
}


function add_user(login, password, public_rsa, private_rsa, callback) {
    let sql_req = "INSERT INTO `users`( `login`, `password`, `public_rsa`, `private_rsa`) VALUES (?,?,?,?)";

    connection.execute(
        sql_req, [login, password, public_rsa, private_rsa],
        (err, results, fields) => {
            callback(err);
        }
    );
}

function get_login_by_key(callback) {
    let sql_req = "SELECT public_rsa, login FROM `users`";

    connection.execute(
        sql_req,
        (err, results, fields) => {
            if (err) {
                callback(null, err)
            } else {
                let res = {};
                results.forEach(user => {
                    res[user.public_rsa] = user.login;
                });
                callback(res, null);
            }
        }
    );
}


function get_all_users(callback) {
    let sql_req = "SELECT * FROM `users`";

    connection.execute(
        sql_req,
        (err, results, fields) => {
            if (err == null) {
                callback(err, results);
            } else {
                callback(err, null);
            }
        }
    );
}


module.exports = {
    user_exists: user_exists,
    get_user: get_user,
    add_user: add_user,
    get_login_by_key: get_login_by_key,
    get_all_users: get_all_users,
}