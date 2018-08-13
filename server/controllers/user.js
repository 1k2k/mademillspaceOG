var User = require("../models/user");

//Simple version, without validation or sanitation
exports.test = function(req, res) {
    res.send("Greetings from the Test controller!");
};

// exports.user_create = function (req, res) {
//     var user = new User(
//         {
//             username: req.body.username,
//             password req.body.password
//         }
//     );

//     user.save(function (err) {
//         if (err) {
//             return next(err);
//         }
//         res.send('User Created successfully')
//     })
// };

// exports.user_details = function (req, res) {
//     User.findById(req.params.id, function (err, user) {
//         if (err) return next(err);
//         res.send(user);
//     })
// };

exports.user_auth = function(req, res, next) {
    var post = req.body;
    console.log("req.session.username", req.session.username);
    if (req.session.username) {
        res.send({
            status: 1,
            message: "Login successfull"
        });
    } else {
        User.findOne({ username: post.username }, "username password", function(
            err,
            user
        ) {
            if (err) return next(err);
            console.log(user);
            if (!user) {
                res.send({
                    status: 2,
                    message: "Something went wrong"
                });
            } else {
                if (
                    post.username === user.username &&
                    post.password === user.password
                ) {
                    req.session.username = user.username;
                    res.send({
                        status: 1,
                        message: "Login successfull"
                    });
                } else {
                    res.send({
                        status: 2,
                        message: "Wrong credentials"
                    });
                }
            }
        });
    }
};

// exports.user_update = function (req, res) {
//     User.findByIdAndUpdate(req.params.id, {$set: req.body}, function (err, user) {
//         if (err) return next(err);
//         res.send('User udpated.');
//     });
// };

// exports.user_delete = function (req, res) {
//     User.findByIdAndRemove(req.params.id, function (err) {
//         if (err) return next(err);
//         res.send('Deleted successfully!');
//     })
// };
