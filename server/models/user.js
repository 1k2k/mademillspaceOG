var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}
});


// Export the model
var collectionName = 'user'
module.exports = mongoose.model('User', UserSchema, collectionName);