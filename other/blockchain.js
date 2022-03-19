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

    has_already_tmptxs(address) {
        let find = false;
        this.tmp_transactions.forEach(e => {
            if (e.sender == address) {
                find = true;
            }
        });
        return find;
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

    get_all_amount() {
        if (this.blockchain.length > 0) {
            return this.blockchain[0].transactions[0].amount;
        }
        return 0;
    }

    get_blocks_number(address) {
        return this.blockchain.length;
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
    time_string_between_now(timestamp) {
        const datetime = new Date(timestamp * 1000).getTime();
        const nowtime = new Date().getTime();
        let time_bet = (nowtime - datetime) / 1000;
        let prefix = "Il y a ";
        if (time_bet < 0) {
            time_bet = 0;
        }
        if (time_bet < 15) {
            return "À l'instant";
        } else if (time_bet < 60) {
            let sec = Math.floor(time_bet);
            return prefix + sec + " sec";
        } else if (time_bet < 60 * 60) {
            let mins = Math.floor(time_bet / 60);
            if (mins == 0) {
                mins = 1;
            }
            return prefix + mins + " min";
        } else if (time_bet < 60 * 60 * 24) {
            let hours = Math.floor(time_bet / (60 * 60));
            return prefix + hours + " h";
        } else if (time_bet < 60 * 60 * 24 * 7) {
            let days = Math.floor(time_bet / (60 * 60 * 24));
            return prefix + days + " j";
        } else {
            let weeks = Math.floor(time_bet / (60 * 60 * 24 * 7));
            return prefix + weeks + " sem";
        }
    }

    get_login_by_key(key) {
        if (this.users_login[key]) {
            return this.users_login[key];
        } else {
            return "Unknown";
        }
    }
    get_key_by_login(login) {
        if (this.users_login) {
            let res = Object.keys(this.users_login).find(key => this.users_login[key] === login);
            if (res.length > 0) {
                return res;
            } else {
                return undefined;
            }
        }
        return undefined;
    }

    format_txs(txs, validated) {
        let sender_login = this.get_login_by_key(txs.sender);
        let receiver_login = this.get_login_by_key(txs.receiver);
        let res = {
            sender: sender_login,
            receiver: receiver_login,
            amount: txs.amount,
            time: this.time_string_between_now(txs.time),
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

    get_both_data() {
        let t = [];
        this.tmp_transactions.forEach(txs => {
            let new_txs = this.format_txs(txs, false);
            t.push(new_txs);
        });
        let bc = [];
        this.blockchain.forEach(b => {
            let d = {
                previousHash: b.previousHash,
                currentHash: b.currentHash,
                proof: b.proof,
                time: b.time,
                transactions: []
            };
            b.transactions.forEach(txs => {
                d.transactions.push(this.format_txs(txs, true))
            });
            bc.push(d);
        });
        let res = {
            tmp_transactions: t,
            blocks: bc
        };
        return res;
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