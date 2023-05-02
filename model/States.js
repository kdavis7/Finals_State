const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

//define the mongoose schema
const stateSchema = new Schema ({
    stateCode: {
        type: String,
        required: true,
        unique: true

    },
    funfacts:[String]
});

module.exports= mongoose.model('State', stateSchema);