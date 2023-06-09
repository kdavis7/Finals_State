require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3000;

//connect to MongoDB
connectDB();

//add CORS -available to all
app.use(cors(corsOptions));

//handle form data (urlencoded data)
app.use(express.urlencoded({ extended: false}));

//handle json data
app.use(express.json());

//serve static files eg. css, images, etc.
app.use(express.static(path.join(__dirname, '/public')));

//routes
app.use('/', require('./routes/root'));
app.use('/states', require('./routes/api/states'));


//catch all for paths
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

//make sure connected to MongoDB before listening for events
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})