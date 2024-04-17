    const express = require("express");
    const bodyParser = require("body-parser");
    const mysql = require("mysql");
    // const dotenv = require("dotenv");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");


    // dotenv.config({path: '../.env'})
    const app = express();
    const PORT = process.env.PORT || 3000;


    const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hwyp_db",
    });

    
    db.connect((err) => {
    if (err) {
        console.log(err);
    } else console.log("MySQL Connected");
    });

    app.use(bodyParser.json());

   
    app.post("/signup", async (req, res) => {
        const { name, email, password, passwordConfirm } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
    
    
    
        db.query("SELECT email FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            if (result.length > 0) {
            res.status(409).json({ message: "Email already exists" });
            } else if (password !== passwordConfirm) {
            res.status(400).json({ message: "Passwords do not match" });
            } else {
            db.query("INSERT INTO users SET ?", {
                name: name,
                email: email,
                password : hashedPassword,
            }, (err, result) => {
                if (err) {
                console.error(err);
                res.status(500).json({ message: "Internal Server Error" });
                } else {
                res.status(201).json({ message: "User created successfully" });
                }
            });
            }
        }
        });
    });


    app.post("/login", async (req, res) => {
        const { email, password } = req.body;
    
        // Query the database to find the user by email
        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
    
            // Check if the user with the provided email exists
            if (result.length === 0) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
    
            // Ensure that the password field is not undefined
            if (!result[0].password) {
                console.error("Password is undefined for user:", result[0]);
                return res.status(500).json({ message: "Internal Server Error" });
            }
    
            try {
                // Compare the provided password with the hashed password in the database
                const match = await bcrypt.compare(password, result[0].password);
                
                if (match) {
                    // Passwords match, so login successful
                    // Generate JWT token
                    jwt.sign({ user: result[0] }, 'your_secret_key', { expiresIn: '1h' }, (err, token) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ message: "Internal Server Error" });
                        }
                        // Calculate expiration time for the token
                        const expirationTime = new Date(Date.now() + 3600000); // Current time + 1 hour
                        // Store the token and expiration time in the revoked_tokens table
                        db.query("INSERT INTO revoked_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [result[0].id, token, expirationTime], (err) => {
                            if (err) {
                                console.error("Error storing token in revoked_tokens table:", err);
                                return res.status(500).json({ message: "Internal Server Error" });
                            }
                            // Respond with the user information and token
                            const userWithoutPassword = {
                                id: result[0].id,
                                name: result[0].name,
                                email: result[0].email
                                // Add other user information here if needed
                            };
                            res.status(200).json({ user: userWithoutPassword, token });
                        });
                    });
                } else {
                    // Passwords don't match
                    res.status(401).json({ message: "Invalid credentials" });
                }
            } catch (error) {
                console.error("Error comparing passwords:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    });
    
    
    

   const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ success: 0, message: 'Unauthorized: Missing token' });
    }

    const formattedToken = token.replace('Bearer ', '');

    jwt.verify(formattedToken, 'your_secret_key', (err, decodedToken) => {
        if (err) {
            console.error('Error verifying token:', err);
            return res.status(401).json({ success: 0, message: 'Unauthorized: Invalid token' });
        } else {
            req.user = decodedToken.user;
            next();
        }
    });
};

module.exports = authenticateToken;

app.get("/profile", authenticateToken, (req, res) => {
    const { name, email } = req.user;
    res.status(200).json({ name, email });
});




    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
