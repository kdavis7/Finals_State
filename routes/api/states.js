const express = require('express');
const router = express.Router();
statesData = require('../../model/statesData.json');
const statesController = require('../../controllers/StatesController');
const verifyStates = require('../../controllers/verifyStates');


//routes for the /:states api
router.get('/', statesController.getAllStates);

router.get('/:state', verifyStates(), statesController.getState);

router.route('/:state/funfact')
    .get(verifyStates(),statesController.getFunFact)
    .post(verifyStates(),statesController.createFunFact)
    .patch(verifyStates(),statesController.updateFunFact)
    .delete(verifyStates(),statesController.deleteFunFact);

router.route('/:state/capital')
    .get(verifyStates(),statesController.getDetails);

router.route('/:state/nickname')
    .get(verifyStates(),statesController.getDetails);

router.route('/:state/population')
    .get(verifyStates(),statesController.getDetails);

router.route('/:state/admission')
    .get(verifyStates(),statesController.getDetails);


module.exports = router;