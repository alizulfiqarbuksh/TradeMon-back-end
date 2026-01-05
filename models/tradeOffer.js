const mongoose = require('mongoose');

const tradeOfferSchema = mongoose.Schema({

  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sender_pokemon_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pokemon",
    required: true
  },
  receiver_pokemon_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pokemon",
    default: null
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }

});

const TradeOffer = mongoose.model('TradeOffer', tradeOfferSchema);

module.exports = TradeOffer;