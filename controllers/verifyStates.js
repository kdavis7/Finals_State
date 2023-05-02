//const express = require('express');
states = require('../model/statesData.json');

//MiddleWare to verify states and converts abbreviation to uppercase.
const verifyStates = () => {
    return (req, res, next) => {
      // Check for state abbreviation
      const stateAbbr= req?.params?.state?.toUpperCase();
      if (!stateAbbr) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
      }
  
      // Create array of state codes
      const stateCodes = states.map(st => st.code);
  
      // Check if state code exists in array. 
      const exStateCodes = stateCodes.includes(stateAbbr);
  
      // message if state code does not exist
      if (!exStateCodes) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
      }
  
      // valid state code
      req.code = stateAbbr;
      next();
    };
  };

module.exports = verifyStates;