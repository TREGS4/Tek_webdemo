const request = require('request');
const users_requests = require("../mysql/users_requests");

class BLOCKCHAIN_DATA {
    constructor() {
        this.online = false;
        this.server_count = 0;
        this.servers = [];

        this.interval_time = 1500;

        this.interval_time_users = 2000;
        let users_login = {};
        this.interval_users = setInterval(() => { this.update_users(); }, this.interval_time_users);

        this.interval_server = setInterval(() => { this.ask_server(); }, this.interval_time);

        setTimeout(() => {
            this.interval_bc = setInterval(() => { this.ask_blockchain(); }, this.interval_time);
        }, this.interval_time / 3);

        setTimeout(() => {
            this.interval_tl = setInterval(() => { this.ask_tl(); }, this.interval_time);
        }, (this.interval_time * 2) / 3);

        this.blockchain = [];
        this.tmp_transactions = [];
    }

    reset() {
        this.online = false;
        this.server_count = 0;
        this.blockchain = [];
        this.tmp_transactions = [];
        this.servers = [];
    }

    get_server_count() {
        return this.server_count;
    }

    is_online() {
        return this.online;
    }

    update_users() {
        users_requests.get_login_by_key((res, err) => {
            if (!err) {
                this.users_login = res;
            } else {
                console.log("Error lors de l'update des logins des users");
            }
        })
    }

    ask_server() {
        request('http://nyte.fr:2048/server/count', { json: true }, (err, res, body) => {
            if (err) {
                let error = err.toString();
                //console.log(error);
                if (error.includes("Error: connect ECONNREFUSED")) { // blockchain offline
                    this.reset();
                }
            } else {
                if (res.statusCode == 200) {
                    if (body && body.size && body.server_list) {
                        this.online = true;
                        this.server_count = body.size;
                        this.servers = body.server_list;
                    }
                }
            }
        });
    }


    ask_blockchain() {
        request('http://nyte.fr:2048/blockchain', { json: true }, (err, res, body) => {
            if (err) {
                let error = err.toString();
                //console.log(error);
                if (error.includes("Error: connect ECONNREFUSED")) { // blockchain offline
                    this.reset();
                }
            } else {
                if (res.statusCode == 200) {
                    if (body && body.blocks) {
                        this.blockchain = body.blocks;
                    }
                }
            }
        });
    }


    ask_tl() {
        request('http://nyte.fr:2048/transactions/get', { json: true }, (err, res, body) => {
            if (err) {
                let error = err.toString();
                //console.log(error);
                if (error.includes("Error: connect ECONNREFUSED")) { // blockchain offline
                    this.reset();
                }
            } else {
                if (res.statusCode == 200) {
                    if (body && body.transactions) {
                        this.tmp_transactions = body.transactions;
                    }
                }
            }
        });
    }



    get_user_amount(address) {
        let sum = 0;
        this.blockchain.forEach(b => {
            b.transactions.forEach(txs => {
                if (txs.sender == address) {
                    sum -= txs.amount;
                } else if (txs.receiver == address) {
                    sum += txs.amount;
                }
            });
        });
        return sum;
    }


    time_format(timestamp) {
        var date = new Date(timestamp * 1000);
        var hours = "0" + date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();

        var day = "0" + date.getDay();
        var month = "0" + (date.getMonth() + 1);
        var year = "" + date.getFullYear();

        var formattedTime = year + '/' + month.substr(-2) + '/' + day.substr(-2);
        formattedTime += " " + hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        return formattedTime;
    }

    get_login_by_key(key) {
        if (this.users_login[key]) {
            return this.users_login[key];
        } else {
            return "UNKNOWN";
        }
    }

    format_txs(txs, validated) {
        let sender_login = this.get_login_by_key(txs.sender);
        let receiver_login = this.get_login_by_key(txs.receiver);
        let res = {
            sender: sender_login,
            receiver: receiver_login,
            amount: txs.amount,
            time: this.time_format(txs.time),
            validated: validated,
        };
        return res;
    }

    get_all_transactions() {
        let tl = [];
        this.blockchain.forEach(b => {
            b.transactions.forEach(txs => {
                let new_txs = this.format_txs(txs, true);
                tl.push(new_txs);
            });
        });
        this.tmp_transactions.forEach(txs => {
            let new_txs = this.format_txs(txs, false);
            tl.push(new_txs);
        });
        return tl;
    }

    get_server_info() {
        let status = "off";
        if (this.online) {
            status = "on";
        }
        let data = {
            status: status,
            size: this.server_count,
            servers: this.servers
        }
        return data;
    }

}



module.exports = interval_time => {
    return new BLOCKCHAIN_DATA(interval_time);
};