let dark_mode = false;

//determines if the user has a set theme
function detectColorScheme(){
    var theme="light";    //default to light

    //local storage is used to override OS theme settings
    if(localStorage.getItem("theme")){
        if(localStorage.getItem("theme") == "dark"){
            var theme = "dark";
        }
    } else if(!window.matchMedia) {
        //matchMedia method not supported
        return false;
    } else if(window.matchMedia("(prefers-color-scheme: dark)").matches) {
        //OS theme setting detected as dark
        var theme = "dark";
    }
    //dark theme preferred, set document with a `data-theme` attribute
    if (theme=="dark") {
        dark_mode = true;
        document.documentElement.setAttribute("data-theme", "dark");
    }
}
detectColorScheme();
moon_update();


function moon_update(){
    if (dark_mode){
        $(".moon__theme").find("i").attr("class", "fas fa-moon");
    }else{
        $(".moon__theme").find("i").attr("class", "far fa-moon");
    }
}

function switchTheme() {
    if (dark_mode) {
        localStorage.setItem('theme', 'light');
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
    }    
    dark_mode = !dark_mode;
    moon_update();
}


$(".moon__theme").click(switchTheme);