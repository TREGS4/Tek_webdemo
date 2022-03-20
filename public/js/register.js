$("#register").submit(function(event) {
    const data = $(this).serializeArray();

    const arr_login = data.find(e => e.name == "login");
    const arr_password = data.find(e => e.name == "password");
    const arr_confirm_password = data.find(e => e.name == "confirm_password");

    if (arr_login && arr_password && arr_confirm_password) {
        const login = arr_login.value;
        const password = arr_password.value;
        const confirm_password = arr_confirm_password.value;
        if (typeof login == "string" && typeof password == "string" && typeof confirm_password == "string") {
            if (password == confirm_password) {
                $.ajax({
                    url: "http://tek.ollopa.fr:7000/api/register",
                    type: "POST",
                    data: {
                        login: login,
                        password: password
                    },
                    success: (res) => {
                        display_register_info("success", "Création du compte réussie.");
                        //window.location.href = "/";
                    },
                    error: (err) => {
                        const res = err.responseJSON;
                        display_register_info("error", res.error);
                    }
                });
            } else {
                display_register_info("error", "Le mot de passe de confirmation n'est pas indentique au premier.");
            }
        } else {
            display_register_info("error", "Une erreur est survenue dans le formulaire.");
        }
    } else {
        display_register_info("error", "Une erreur est survenue dans le formulaire.");
    }

    event.preventDefault();
});




function display_register_info(type, msg) {
    const info = $("#register_info");
    info.show();
    if (type == "success") {
        info.removeClass("error");
        info.addClass("success");
    } else {
        info.removeClass("success");
        info.addClass("error");
    }
    info.find("span").text(msg);
}
