const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();

connectDb();
const app = express();

const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(cookieSession({
//  keys: ["kmsmodisoaop"]
// }));
app.use("/api/orders",require("./routes/orderRoutes.js"));
app.use("/api/reports",require("./routes/reportRoutes.js"));
app.use("/api/menu",require("./routes/menuRoutes.js"));
app.use("/api/inventory",require("./routes/inventoryRoutes.js"));
app.use("/api/tables", require("./routes/tableRoutes.js"));
app.use("/api/users",require("./routes/userRoutes.js"));
app.use("/api/auth",require("./routes/authRoutes.js"));
app.use("/api/reservations", require("./routes/reservationRoutes.js"));
app.use(errorHandler)


app.listen(port, () =>{
 console.log(`Server running on port ${port}`);
 
});