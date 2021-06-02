const connexion_gestion = require("./connexion_gestion")


module.exports = {


    cover_connection_text: (req) =>{
        if (connexion_gestion.is_connected(req)){
            return `Bonjour,  ${req.session.login} !`;
        }else{
            return `Vous n'êtes pas connecté.`;
        }
    },

    cover_connection_class: (req) =>{
        if (connexion_gestion.is_connected(req)){
            return `connected`;
        }else{
            return `disconnected`;
        }
    },

}