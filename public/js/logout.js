$.ajax({
    url: "http://nyte.fr:8080/api/logout",
    type: "GET",
});



$(".logout__submit").find("button").on("click", ()=>{
    window.location.href = "/";
});