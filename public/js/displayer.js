class BlockchainStatus {
    constructor() {
        this.disactive();
        this.count = 0;
        this.servers = [];
    }
    update(data) {
        this.count = data.size;
        this.servers = data.servers;
        if (data.status == "on") {
            this.active()
        } else {
            this.disactive();
        }
        this.display_update();
    }

    make_server_item(server) {
        let html_code = `<li class="server__item">
        <div class="server__item__info">
            <span class="ip">${server.hostname}</span>
            <span class="port">${server.port}</span>
        </div>
        <div class=" server__item__icons">
            <i class="fas fa-tools" style="color: yellow;"></i>
            <i class="fas fa-wifi" style="color: green;"></i>
        </div></li>`;
        return $(html_code);
    }


    display_update() {
        $(".server__status").find("span").text(this.count);
        $(".server__list").empty();
        this.servers.forEach(server => {
            let item = this.make_server_item(server);
            $(".server__list").append(item);
        });

    }
    active() {
        $(".head__displayer").addClass("on");
        $(".head__displayer").removeClass("off");
        this.status = "on";
        $(".head__displayer").find("h3").text("En ligne");
    }
    disactive() {
        $(".head__displayer").addClass("off");
        $(".head__displayer").removeClass("on");
        this.status = "off";
        $(".head__displayer").find("h3").text("Hors ligne");
    }
}

class TransactionList {
    constructor() {
        this.all_transactions = [];
        this.list_path = ".transaction__list";
    }

    make_txs_item(txs) {
        let validate_icon = "fas fa-check";
        let unvalidate_icon = "fas fa-recycle";
        let icon = unvalidate_icon;
        let status_msg = "En cours";
        if (txs.validated) {
            icon = validate_icon;
            status_msg = "Validée";
        }

        let html_code = `<div class="transaction__item">
        <div class="info">
            <div class="amount">
                <span>${txs.amount}</span>
                <i class="fab fa-bitcoin"></i>
            </div>
            <div class="address">
                <span class="sender">${txs.sender}</span>
                <i class="fas fa-arrow-circle-right"></i>
                <span class="receiver">${txs.receiver}</span>
            </div>
            <div class="time">
                <span>${txs.time}</span>
            </div>
        </div>
        <div class="status">
            <span>${status_msg}</span>
            <i class="${icon}"></i>
            </div>
        </div>`;
        return $(html_code);
    }


    update_transactions(all_transactions) {
        this.all_transaction = all_transactions;
        $(this.list_path).empty();
        all_transactions.forEach(txs => {
            let item = this.make_txs_item(txs);
            $(this.list_path).prepend(item);
        });
    }
}


const bc_status = new BlockchainStatus();
const tl = new TransactionList();

socket.on("blockchain_status", data => {
    if (data.status) {
        bc_status.update(data);
    }
})

socket.on("blockchain_txs", all_transactions => {
    tl.update_transactions(all_transactions);
})