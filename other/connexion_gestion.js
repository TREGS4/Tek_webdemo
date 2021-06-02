module.exports = {
    need_connected: (req, res, next)=>{
        if (!req.session.connected){
            res.redirect('/login');
            return;
        }
        next();
    },

    need_disconnected: (req, res, next)=>{
        if (req.session.connected){
            res.redirect('/');
            return;
        }
        next();
    },

    is_connected(req){
        if (req.session.connected == true){
            return true;
        }
        return false;
    }
}