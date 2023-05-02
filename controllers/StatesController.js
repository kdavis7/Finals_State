//import statesData.json data
const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) {this.states = data}
}

//import mongoDB data
const mongoStates = require('../model/States.js');

const getAllStates = async (req, res) => {
  const contig = req.query?.contig;

  // Create a copy of the states from the JSON data
  let statesList = [...data.states];

  if (contig === 'true') {
    // Filter out AK and HI if 'contig=true'
    statesList = statesList.filter(st => st.code !== 'AK' && st.code !== 'HI');
  } else if (contig === 'false') {
    // Only show AK and HI if 'contig=false'
    statesList = statesList.filter(st => st.code === 'AK' || st.code === 'HI');
  }

  // Get all state docs from MongoDB
  const allStates = await mongoStates.find({});

  // Add fun facts to each state
  statesList.forEach(state => {
    const stateExists = allStates.find(st => st.stateCode === state.code);

    if (stateExists) {
      state.funfacts = [...stateExists.funfacts];
    }
  });

  res.json(statesList);
};



const getState = async (req, res) => {

    const stateCode = req.code;

    // Get state from JSON data
    const oneState = data.states.find(st => st.code === stateCode);
  
    // Get state info from MongoDB
    const mongoState = await mongoStates.findOne({ stateCode }).exec();
  
    // Return 404 if state not found
    if (!oneState) {
      return res.status(404).json({ message: `State with code "${stateCode}" not found in JSON data` });
    }
  
    if (mongoState) {
      oneState.funfacts = [...mongoState.funfacts];
    }
  
    res.json(oneState);
}

const getFunFact = async (req, res) => {
    const state = data.states.find(st => st.code === req.code);
  
    //get info from MongoDB for state
    const mongoState = await mongoStates.findOne({ stateCode: req.code }).exec();
  
    //Catch for funfacts/ prevent cannot read null error. 
    if (!mongoState) {
        return res.status(404).json({ "message": `No Fun Facts found for ${state.state}` });
    }
  
    if (mongoState.funfacts && mongoState.funfacts.length > 0) {
      res.status(200).json({ "funfact": mongoState.funfacts[Math.floor(Math.random() * mongoState.funfacts.length)] });
    } else {
      res.status(404).json({ "message": `No Fun Facts found for ${state.state}` });
    }
  };

  const createFunFact = async (req, res) => {
    //try catch block for funfacts and statecode
    try {
      const stateCode = req?.params?.state;
      const funFacts = req?.body?.funfacts;
        //check for statecode
      if (!stateCode) {
        return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
      }
  
      if (!funFacts) {
        return res.status(404).json({ message: 'State fun facts value required' });
      }
      //check if it is an array
      if (!Array.isArray(funFacts)) {
        return res.status(404).json({ message: 'State fun facts value must be an array' });
      }
  
      let state = await mongoStates.findOne({ stateCode }).exec();
  
      if (!state) {
        state = await mongoStates.create({
          stateCode,
          funfacts: funFacts,
        });
        return res.status(201).json(state);
      }
  
      state.funfacts = [...state.funfacts, ...funFacts];
  
      const updateResult = await state.save();
  
      return res.status(201).json(updateResult);
    } catch (err) {
      console.err(err);
    }
  };

  const updateFunFact = async (req, res) => {
    // Check for state abbreviation
    const stateCode = req.params.state;
    if (!stateCode) {
        return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
    }
    
    // Check for body for funfacts
    const funfactIndex = req.body?.index;
    const funfactValue = req.body?.funfact;

    //Do not let the values required be undefined.
    if (funfactIndex === undefined || funfactValue === undefined) {
        return res.status(404).json({ message: 'State fun fact index and value are required' });
    }

    // Find state and if no state display message. 
    const stateData = data.states.find(st => st.code === stateCode);
    if (!stateData) {
        return res.status(404).json({ message: `No state found with code ${stateCode}` });
    }

    // Find state in MongoDB
    const mongoState = await mongoStates.findOne({ stateCode }).exec();
    if (!mongoState) {
        return res.status(404).json({ message: `No fun facts found for ${stateData.state}` });
    }

    // Calculate index
    const funfactIdx = funfactIndex - 1;

    // Check if index is valid
    if (funfactIdx < 0 || funfactIdx >= mongoState.funfacts.length) {
        return res.status(404).json({ message: `No fun fact found at index ${funfactIndex} for ${stateData.state}` });
    }

    // Update 
    const allFunFacts = [...mongoState.funfacts];
    allFunFacts[funfactIdx] = funfactValue;
    const update = await mongoStates.updateOne({ stateCode }, { funfacts: allFunFacts });

    // Retrieve update
    const result = await mongoStates.findOne({ stateCode }).exec();
    res.status(201).json(result);
};

const deleteFunFact = async (req, res) => {
    // Check for body
    if (!req?.body?.index) {
        return res.status(400).json({ "message": "State fun fact index value required" });
    }

    // Get state from MongoDB by state code
    const oneMState = await mongoStates.findOne({ stateCode: req.code }).exec();

    // Check if state exists in MongoDB
    if (!oneMState) {
        return res.status(404).json({ "message": `No Fun Facts found for state with code ${req.code}` });
    }

    // Calculate index of funfact to be deleted
    const funfactIndex = req.body.index - 1;

    // Check if funfact exists at the index
    if (oneMState.funfacts.length < funfactIndex || funfactIndex < 0) {
        return res.status(404).json({ "message": `No Fun Fact found at that index for state with code ${req.code}` });
    }

    // Remove/replace funfact from the array
    oneMState.funfacts.splice(funfactIndex, 1);

    // Save the updated document in MongoDB
    const result = await oneMState.save();

    res.status(200).json(result);
}
//Get State details using switch method. If any endpoint names outside of state data file then serve 404. 
const getDetails = async (req, res) => {
    try {
        const stateData = data.states.find(st => st.code === req.code);
        if (!stateData) {
            return res.json([]);
        }
        const path = req.route.path.split('/');
        switch (path[2]) {
            case 'capital':
                res.json({
                    state: stateData.state,
                    capital: stateData.capital_city
                });
                break;
            case 'nickname':
                res.json({
                    state: stateData.state,
                    nickname: stateData.nickname
                });
                break;
            case 'population':
                res.json({
                    state: stateData.state,
                    population: stateData.population.toLocaleString('en-US')
                });
                break;
            case 'admission':
                res.json({
                    state: stateData.state,
                    admitted: stateData.admission_date
                });
                break;
            default:
                res.status(404).json({ message: 'Invalid endpoint' });
        }
    } catch (err) {
        console.err(err);
    }
}

module.exports = {
    getAllStates,
    getState,
    getFunFact,
    getDetails,
    createFunFact,
    updateFunFact,
    deleteFunFact
}