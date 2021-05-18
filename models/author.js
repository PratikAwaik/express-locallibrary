const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 }, 
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date }, 
    date_of_death: { type: Date },  
});

// Virtual property for author's full name
AuthorSchema
.virtual("name")
.get(function () {
    return this.family_name + ", " + this.first_name;
});

// Virtual Property for author's lifespan
AuthorSchema
.virtual("lifespan")
.get(function () {
    return (this.date_of_death_formatted + '-' + this.date_of_birth_formatted).toString();
});

// Virtual for author's URL
AuthorSchema
.virtual("url")
.get(function () {
    return "/catalog/author/" + this._id; 
});

// Virtual Property formatted date of birth
AuthorSchema
    .virtual("date_of_birth_formatted")
    .get(function() {
        return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : "NA";
    });

// Virtual Property formatted date of death
AuthorSchema
    .virtual("date_of_death_formatted")
    .get(function() {
        return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : "NA";
    });

// Export model
module.exports = mongoose.model("Author", AuthorSchema);