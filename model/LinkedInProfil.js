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
  backgroundStriped: [], // .background-content
  backgroundSectionsHtml: [],
  location: { type: String },
  industry: { type: String },
  current: { type: String },
  previous: { type: String },
  education: { type: String },
  status: { type: String, default: 'NO' },
});

module.exports = mongoose.model('LinkedInProfil', linkedInProfilSchema);