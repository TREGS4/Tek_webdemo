$.ajax({
    url: "http://tek.ollopa.fr/api/logout",
    type: "GET",
});



$(".logout__submit").find("button").on("click", ()=>{
    window.location.href = "/";
});
