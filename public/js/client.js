$(document).on("click", ".button__item", function(e) {
    const href = $(this).attr("href");
    window.location.href = href;
});