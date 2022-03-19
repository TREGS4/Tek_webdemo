const users_requests = require("../mysql/users_requests");

class USERS_DATA {
    constructor() {
        this.users = [];
        this.users_public = [];

        this.interval_time = 1000;
        this.interval_users = setInterval(() => { this.ask_users(); }, this.interval_time);
    }

    reset() {
        this.users = [];
        this.users_public = [];
    }

    ask_users() {
        users_requests.get_all_users((err, res) => {
            if (!err) {
                this.users = res;
                this.users_public = this.users.map(e => { return { name: e.login, key: e.public_rsa } });
            }
        });
    }

    get_users() {
        return this.users_public;
    }
}



module.exports = () => {
    return new USERS_DATA();
};