const express = require("express")
const bodyParser = require("body-parser")
const authRoutes = require("./routes/authRoutes")


const app = express();

app.use(bodyParser.json());
app.use("/v1/auth", authRoutes)

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(    `Server is running on ${PORT}`);
})
