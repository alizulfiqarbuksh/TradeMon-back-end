//require express

const express = require('express')
 

// moodel require 

const TradeOffer = require('../models/tradeOffer') // ./models/tradeoffer
const Pokemon = require('../models/pokemon');


const verifyToken = require('../middleware/verify-token');


//intialize router
const router = express.Router()

// POST 

router.post('/', async (req, res) => {

    try{

    if (!req.user?._id) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.user._id
    
    const {sender_pokemon_id, receiver_pokemon_id} = req.body

    if(!sender_pokemon_id || !receiver_pokemon_id) {
      return res.status(400).json({ error: 'sender_pokemon_id and receiver_pokemon_id are required'})
    }
    
    const senderPokemon = await Pokemon.findById(sender_pokemon_id);
    const receiverPokemon = await Pokemon.findById(receiver_pokemon_id);

    if(!senderPokemon || !receiverPokemon){

       return res.status(400).json({  error: 'Pokemon not found' })
    }

    if(!senderPokemon.owner.equals(userId)){
      return res.status(403).json({ error: 'You can only trade a card you own' });
    }

    if (receiverPokemon.owner.equals(userId)) {
      return res.status(400).json({ error: 'You cannot trade for your own card' });
    }

    const trade = await TradeOffer.create({
      sender_id: userId,
      receiver_id: receiverPokemon.owner,     
      sender_pokemon_id,
      receiver_pokemon_id,
      status: 'pending'
    });

    res.status(201).json({trade}) 
    }

    catch(error){
        console.log(error)
        res.status(500).json({err: 'fail to create TradeOffer'})
    }
   
})

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find trades where the user is sender or receiver
    const tradeOffers = await TradeOffer.find({
      $or: [
        { sender_id: userId },
        { receiver_id: userId }
      ]
    }).populate('sender_id', 'username').populate('receiver_id', 'username').populate('sender_pokemon_id').populate('receiver_pokemon_id');
    console.log(tradeOffers)

    res.status(200).json({ tradeOffers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get trades" });
  }
});

router.put('/:id/respond', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "accepted" or "rejected"

    const trade = await TradeOffer.findById(id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });

    if(!trade.receiver_id.equals(req.user._id)){
      return res.status(403).json({error: 'Only the receiver can respond to this trade'})
    }

    // Only pending trades can be acted on
    if (trade.status !== 'pending') {
      return res.status(400).json({ error: 'Trade already processed' });
    }

    if (action === 'rejected') {
      trade.status = 'rejected';
      await trade.save();
      return res.status(200).json({ trade });
    }

    if (action === 'accepted') {
      // swap pokemon owners
      const senderPokemon = await Pokemon.findById(trade.sender_pokemon_id);
      const receiverPokemon = await Pokemon.findById(trade.receiver_pokemon_id);

      if (!senderPokemon || !receiverPokemon) {
        return res.status(400).json({ error: 'Pokemon not found' });
      }

      // swap owners
      const tempOwner = senderPokemon.owner;
      senderPokemon.owner = receiverPokemon.owner;
      receiverPokemon.owner = tempOwner;

      await senderPokemon.save();
      await receiverPokemon.save();

      trade.status = 'accepted';
      await trade.save();

      return res.status(200).json({ trade });
    }

    res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to respond to trade' });
  }
});

// export the router (fixed)
module.exports = router


