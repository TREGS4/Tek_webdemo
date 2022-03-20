function chunkArray(arr, n) {
    var chunkLength = Math.max(arr.length / n, 1);
    var chunks = [];
    for (var i = 0; i < n; i++) {
        if (chunkLength * (i + 1) <= arr.length) chunks.push(arr.slice(chunkLength * i, chunkLength * (i + 1)));
    }
    return chunks;
}


class userChooser {
    constructor() {
        this.opened = false;
        this.users = [];
        this.input = "#user_input";
        this.list = "#users_list";
        this.update();

        $(this.input).on('input', () => {
            let value = $(this.input).val();
            this.updatelist(value);
        });
        $(this.input).on('focusin', () => {
            let value = "";
            $(this.input).val(value);
            this.updatelist(value);
            this.open();
        });
        $(this.input).on('focusout', () => {
            setTimeout(() => { this.close() }, 300);
        });
        $(document).on("click", ".user__item", e => {
            let name = $(e.currentTarget).attr("name");
            $(this.input).val(name);
            this.close();
        });
    }

    make_user_item(user) {
        let html = `<div class="user__item" name="${user.name}">
        <img src="../src/img/user_icon.png" alt="">
        <div class="name"><span>${user.name}</span></div>
        </div>`;
        return $(html);
    }

    setUsers(users) {
        this.users = users;
        let res = chunkArray(this.users, 4);
        console.log(res);
    }

    fuzzysort(value) {
        if (value == "") {
            return this.users;
        }

        const option = {
            key: ['name']
        };
        const result = fuzzysort.go(value, this.users, option);
        const result_objs = result.map(fuzzy_user => (fuzzy_user.obj));
        return result_objs;
    }

    update() {
        if (this.opened) {
            //open
            $(".user__chooser").show();
        } else {
            //close
            $(".user__chooser").hide();
        }
    }
    open() {
        this.opened = true;
        this.update();
    }
    close() {
        this.opened = false;
        this.update();
    }

    updatelist(value) {
        let users = this.fuzzysort(value);
        $(this.list).empty();
        users.forEach(user => {
            let item = this.make_user_item(user);
            $(this.list).append(item);
        });
    }


}


let user_chooser = new userChooser();

socket.emit("ask_users", {});
socket.on("ask_users", users => {
    user_chooser.setUsers(users);
});

$("#txs").submit(function(event) {
    const data = $(this).serializeArray();
    console.log("ok");
    const arr_receiver = data.find(e => e.name == "receiver");
    const arr_amount = data.find(e => e.name == "amount");
    if (arr_receiver && arr_amount) {
        const receiver = arr_receiver.value;
        const amount = parseInt(arr_amount.value);
        if (typeof receiver == "string" && receiver != "" && typeof amount == "number" && !Number.isNaN(amount)) {
            console.log(receiver);
            $.ajax({
                url: "http://tek.ollopa.fr:7000/api/transaction",
                type: "POST",
                data: {
                    receiver: receiver,
                    amount: amount
                },
                success: (res) => {
                    if (res.success) {
                        display_txs_info("success", res.success);
                    } else if (res.warning) {
                        display_txs_info("warning", res.warning);
                    } else {
                        display_txs_info("warning", "default msg");
                    }
                },
                error: (err) => {
                    const res = err.responseJSON;
                    display_txs_info("error", res.error);
                }
            });
        } else {
            display_txs_info("error", "Une erreur est survenue dans le formulaire.");
        }
    } else {
        display_txs_info("error", "Une erreur est survenue dans le formulaire.");
    }

    event.preventDefault();
});




function display_txs_info(type, msg) {
    const info = $("#txs_info");
    info.show();
    if (type == "success") {
        info.removeClass("error");
        info.removeClass("warning");
        info.addClass("success");
    } else if (type == "warning") {
        info.removeClass("success");
        info.removeClass("error");
        info.addClass("warning");
    } else {
        info.removeClass("success");
        info.removeClass("warning");
        info.addClass("error");
    }
    info.find("span").text(msg);
}
