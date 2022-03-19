class BlockchainStatus {
    constructor() {
        this.disactive();
    }
    active() {
        $(".blockchain__status").addClass("on");
        $(".blockchain__status").removeClass("off");
        this.status = "on";
        $(".blockchain__status").find("span").text("TEK en ligne");
    }
    disactive() {
        $(".blockchain__status").addClass("off");
        $(".blockchain__status").removeClass("on");
        this.status = "off";
        $(".blockchain__status").find("span").text("TEK hors ligne");
    }
}


const bc_status = new BlockchainStatus();

socket.on("blockchain_status", data => {
    if (data.status && data.status == "on") {
        bc_status.active();
    } else {
        bc_status.disactive();
    }
})


$(document).on("click", ".menu_item.normal", function(e) {
    const href = $(this).attr("href");
    window.location.href = href;
});

$(document).on("click", ".menu_item.state i", function(e) {
    const href = $(this).attr("href");
    window.location.href = href;
});

$(document).on("click", ".download__box", function(e) {
    const href = $(this).attr("href");
    var link = document.createElement('a');
    link.href = href;
    link.download = href.substr(href.lastIndexOf('/') + 1);
    link.click();
});

$(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
        $('html').scrollTop(0);
    }
});