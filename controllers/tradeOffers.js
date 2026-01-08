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

    const trade = await TradeOffer.create(req.body)

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



//get 
router.get('/:id', async (req, res) => {

    try{
       // get id from req.params
       const {id} = req.params

       // use model to find by id

       const trade = await TradeOffer.findById(id)

       //if the trade not founded respond with 404

       if(!trade) {

        res.status(404).json({error: 'Trade not found'})

        
       }else{
           
        res.status(200).json({trade})

       }

    }
    catch(error)
    {
        console.log(error)
        res.status(500).json({error: "Failed To Get Trade"})
    }
})

// DEL 
router.delete('/:id', async (req, res)=>{

    try{
      // get the id from params
     
        const {id}= req.params
      // try to find trade using id 
       const trade = await TradeOffer.findByIdAndDelete(id)

       //if there is no trade send 404
       if(!trade){

         res.status(404).json({error: 'Trade not found'})
       } else{
        // use 204 if u dont want to send new thing
        res.status(200).json({trade})
       }

    
  }
    catch(error){

        console.log(error)

        res.status(500).json({error: "failed to delete Trade"})
    }



})

//PUT 
router.put('/:id', async (req,res)=>{
    try{

        

        //get id
        const {id} =req.params
        // find trade using id and update with req.body add new to see change immediatly with out it it will not show on postman when put
        const trade = await TradeOffer.findByIdAndUpdate(id, req.body, {new:true})


        if(!trade){
            res.status(404).json({error: 'trade Not found'})

        }else{
               res.status(200).json({trade})
        }
    }
    catch(error){
        console.log(error)
        res.status(500).json({error: 'failed to update trade'})
    }


})

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


