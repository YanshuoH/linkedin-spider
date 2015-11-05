var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var linkedInProfilSchema = new Schema({
  href: { type: String, index: true, unique: true, required: true },
  name: { type: String, required: true }, // #name-container span.full-name
  title: { type: String }, // #headline-container p.title
  demographicsHtml: { type: String },
  demographicsStriped: { type: String },
  extraInfoHtml: { type: String },
  extraInfoStriped: { type: String },
  connections: { type: Number }, // .member-connections strong
  backgroundStriped: { type: String }, // .background-content
  backgroundSectionsHtml: [],
});

module.exports = mongoose.model('LinkedInProfil', linkedInProfilSchema);