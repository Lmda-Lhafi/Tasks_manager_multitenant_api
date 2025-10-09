const Client = require ("../models/client.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Login function for clients
const login = async (req, res) => {
    try{
        const { email, password } = req.body;

        // Find client by email
        const client = await Client.findOne({ email });
        if (!client) return res.status(401).json({ error: "User Not Found!!" });
        
        // check password
        const valid = await bcrypt.compare(password, client.passwordHash);
        if (!valid) return res.status(401).json({ error: "Invalid password!!" });

        //generate JWT token
        const token = jwt.sign(
            { id: client._id, email: client.email },
            process.env.JWT_secret,
            { expiresIn: "1d" }
        );
        // response about login success
        res.json({
            message: "Login Success!!",
            token,
            client: {
                id: client._id,
                email: client.email,
                name: client.name,
            },
        });
    }catch(error){
        res.status(500).json({error: "Incorrect email or password!!"});
    }
};

module.exports = { login };