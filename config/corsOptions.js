// set cors options with whitelist
const whitelist = [
    'https://buttered-quiver-november.glitch.me',
    'https://glitch.com/edit/#!/buttered-quiver-november',
   'https://dazzling-snickerdoodle-777101.netlify.app', 
    'http://127.0.0.1:5500', 
    'http://localhost:3500',
    'http://localhost:3000'
];
const corsOptions = {
    origin: (origin, callback) =>{
    if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
    } else {
        callback(new Error('Not Allowed By CORS'));
    }
}, optionSuccessStatus: 20
};

module.exports = corsOptions;