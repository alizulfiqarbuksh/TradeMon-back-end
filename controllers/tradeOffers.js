//require express

const express = require('express')
 

// moodel require 

const TradeOffer = require('../models/tradeOffer') // ./models/tradeoffer

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


router.get('/', async (req, res) =>{


    try{

        const tradeOffers = await TradeOffer.find({});
        res.status(200).json({tradeOffers});
    }catch(error){

        console.log(error)

         res.status(500).json({error: 'Failed To get trades'})
    }
})


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

// export the router (fixed)
module.exports = router


