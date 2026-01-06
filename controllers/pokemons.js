//require express

const express = require('express')
 

// moodel require 

const Pokemon = require('../models/pokemon') // ./models/pokemon

//intialize router
const router = express.Router()

// POST 

// create pokemon
router.post('/', async (req, res) => {

    try{

    const pokemon = await Pokemon.create(req.body)

    res.status(201).json({pokemon}) 
    }

    catch(error){
        console.log(error)
        res.status(500).json({err: 'fail to create pokemon'})
    }
   
})

// get all pokemons
router.get('/', async (req, res) =>{
    try{

        const pokemons = await Pokemon.find({})
        res.status(200).json({pokemons});
    }catch(error){

        console.log(error)

         res.status(500).json({error: 'Failed To get Pokemons'})
    }
})


//get one pokemon
router.get('/:id', async (req, res) => {

    try{
       // get id from req.params
       const {id} = req.params

       // use model to find by id

       const pokemon = await Pokemon.findById(id).populate('owner', 'username')

       //if the pokemon not founded respond with 404

       if(!pokemon) {

        res.status(404).json({error: 'Pokemon not found'})

        
       }else{
           
        res.status(200).json({pokemon})

       }

    }
    catch(error)
    {
        console.log(error)
        res.status(500).json({error: "Failed To Get Pokemon"})
    }
})

// DEL 
router.delete('/:id', async (req, res)=>{

    try{
      // get the id from params
     
        const {id}= req.params
      // try to find pokemon using id 
       const pokemon = await Pokemon.findByIdAndDelete(id)

       //if there is no pokemon send 404
       if(!pokemon){

         res.status(404).json({error: 'pokemon not found'})
       } else{
        // use 204 if u dont want to send new thing
        res.status(200).json({pokemon})
       }

    
  }
    catch(error){

        console.log(error)

        res.status(500).json({error: "failed to delete Pokemon"})
    }



})

//PUT 
router.put('/:id', async (req,res)=>{
    try{

        //get id
        const {id} =req.params
        // find Pokemon using id and update with req.body add new to see change immediatly with out it it will not show on postman when put
        const pokemon = await Pokemon.findByIdAndUpdate(id, req.body, {new:true})


        if(!pokemon){
            res.status(404).json({error: 'Pokemon Not found'})

        }else{
               res.status(200).json({pokemon})
        }
    }
    catch(error){
        console.log(error)
        res.status(500).json({error: 'failed to update Pokemon'})
    }


})

// export the router (fixed)
module.exports = router


