var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var googleResultSchema = new Schema({
  href: { type: String, index: true, unique: true},
  status: { type: String, default: 'NO'},
});

module.exports = mongoose.model('GoogleResult', googleResultSchema);