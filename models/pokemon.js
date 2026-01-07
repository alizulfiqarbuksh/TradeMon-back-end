const mongoose = require('mongoose');

const pokemonSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  level: {
    type: Number,
    default: 1,
  },

  shiny: {
    type: Boolean,
    default: false,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  image: {
    type: String,
    required: false,
  }
});

pokemonSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.__v;
  },
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

module.exports = Pokemon;
