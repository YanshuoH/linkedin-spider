var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var linkedInResultSchema = new Schema({
  href: { type: String, index: true, unique: true},
  status: { type: String, default: 'NO'},
});

module.exports = mongoose.model('LinkedInResult', linkedInResultSchema);