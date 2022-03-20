$.ajax({
    url: "http://tek.ollopa.fr:7000/api/logout",
    type: "GET",
});



$(".logout__submit").find("button").on("click", ()=>{
    window.location.href = "/";
});
