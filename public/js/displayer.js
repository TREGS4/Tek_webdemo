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
        let mining = '<i class="fas fa-tools" style="color: #b0c6dd;"></i>';
        let api = '<i class="fas fa-wifi" style="color: var(--color-green)"></i>';
        if (!server.api || server.api == 0 || server.api == -1) {
            api = '';
        }
        if (!server.mining || server.mining == 0 || server.api == -1) {
            mining = '';
        }
        let html_code = `<li class="server__item">
        <div class="server__item__info">
            <span class="ip">${server.hostname}</span>
            <span class="port">${server.port}</span>
        </div>
        <div class=" server__item__icons">
            ${mining}
            ${api}
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
        this.tmp_transactions = [];
        this.blocks = [];
        this.list_path = ".transaction__list";
    }

    make_block_line(block, index) {
        let html_code = `<div class="blockline__item">
            <div class="blockhash">
                <span>Block n°</span>
                <span>${index}</span>
            </div>
        </div>`;
        return $(html_code);
    }

    make_txs_item(txs) {
        let validate_icon = "fas fa-check";
        let unvalidate_icon = "fas fa-recycle";
        let icon = unvalidate_icon;
        let icon_color = "var(--color-accent)";
        let status_msg = "En cours";
        let line_class = "unvalidated";
        if (txs.validated) {
            icon = validate_icon;
            icon_color = "var(--color-green)";
            line_class = "validated";
            status_msg = "Validée";
        }

        let html_code = `<div class="transaction__item">
        <div class="info">
            <div class="amount">
                <span>${txs.amount}</span>
                <i class="fab fa-bitcoin"></i>
            </div>
            <div class="address">
                <div class="name sender"><span>${txs.sender}</span></div>
                <div class="icon"><i class="fas fa-arrow-circle-right"></i></div>
                <div class="name receiver"><span>${txs.receiver}</span></div>
            </div>
            <div class="time">
                <span>${txs.time}</span>
            </div>
        </div>
        <div class="status">
            <span>${status_msg}</span>
            <i class="${icon}" style="color: ${icon_color}"></i>
            </div>
        </div>`;
        let html = $(html_code);
        html.addClass(line_class);
        return html;
    }

    set_data(data) {
        this.tmp_transactions = data.tmp_transactions;
        this.blocks = data.blocks;
        console.log(this.blocks);
        this.update_list();
    }

    update_list() {
        $(this.list_path).empty();
        this.tmp_transactions.forEach(txs => {
            let item = this.make_txs_item(txs);
            $(this.list_path).prepend(item);
        });
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            let line_item = this.make_block_line(this.blocks[i], i + 1);
            $(this.list_path).append(line_item);
            for (let a = this.blocks[i].transactions.length - 1; a >= 0; a--) {
                let item = this.make_txs_item(this.blocks[i].transactions[a]);
                $(this.list_path).append(item);
            }
        }
    }
}


const bc_status = new BlockchainStatus();
const tl = new TransactionList();

socket.on("blockchain_status", data => {
    if (data.status) {
        bc_status.update(data);
    }
})

socket.on("blockchain_txs", data => {
    tl.set_data(data);
})