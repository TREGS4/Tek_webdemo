$("#login").submit(function( event ) {
    const data = $(this).serializeArray();

    const arr_login = data.find(e => e.name == "login");
    const arr_password = data.find(e => e.name == "password");
    if (arr_login && arr_password){
        const login = arr_login.value;
        const password = arr_password.value;
        if (typeof login == "string" && typeof password == "string"){
            $.ajax({
                url: "http://nyte.fr:8080/api/login",
                type: "GET",
                data: {
                    login: login,
                    password: password
                },
                success: (res)=>{
                    display_login_info("success", "Connection réussi avec succès");
                    window.location.href = "/";
                },
                error: (err)=>{
                    const res = err.responseJSON;
                    display_login_info("error", res.error);
                }
            });
        }else{
            display_login_info("error", "Une erreur est survenu dans le formulaire");
        }
    }else{
        display_login_info("error", "Une erreur est survenu dans le formulaire");
    }

    event.preventDefault();
});




function display_login_info(type, msg){
    const info = $("#login_info");
    info.show();
    if (type == "success"){
        info.removeClass("error");
        info.addClass("success");
    }else{
        info.removeClass("success");
        info.addClass("error");
    }
    info.find("span").text(msg);
}