//importing modules
import dotenv from "dotenv/config";
import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

//configurations
const app = express();
const port = process.env.PORT;

//database connection

const db = new pg.Client({
    user: process.env.DbUser,
    host: process.env.DbHost,
    database: process.env.DbName,
    password: process.env.DbPassword,
    port: process.env.DbPort,
})

db.connect();

let data;
let login=false;
let curr_id=0;
let curr_order = 0;

//middleware

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//routes

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT cover_image_url, id, title, price FROM books");
        res.render("home.ejs", { title: "Home", books: result.rows });
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send("Error fetching book data");
    }
});

app.post("/", async (req, res) => {
    try {
        data = req.body.id;
        res.redirect("/product")
        }
    catch (err) {
        console.error('Error processing request', err.stack);
        res.status(500).send("Error processing book selection");
    }
})

app.get("/register", (req,res)=>{
    res.render("register.ejs");
})

app.post("/register", async (req,res)=>{
    data = req.body;
    
    const query ="INSERT INTO customers (Username, Full_Name, Email, Password, Street_Address, City, State, Postal_code, Country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING Cust_id";

    const values = [
        data.username,
        data.fullName,
        data.email,
        data.password, // Make sure this is hashed in a real application!
        data.streetAddress,
        data.city,
        data.state,
        data.postalCode,
        data.country,
    ];
    try {
        const result = await db.query(query, values);
        console.log("New customer ID:", result.rows[0].cust_id);
        login=true;
        curr_id=result.rows[0].cust_id;
        res.redirect("/");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Error registering customer");
    }
})

app.get("/login", (req,res)=>{
    res.render("login.ejs",{message: " "});
})

app.post("/login", async (req,res)=>{
    const { username, password } = req.body;
    try{
        const result = await db.query("SELECT cust_id,password from customers WHERE username=$1",[username]);
        if(result.rows.length == 0 || result.rows[0].password != password){
            res.render("login.ejs",{message: "Username or Password is incorrect!"});
        }
        else if(result.rows[0].password == password){
            login=true;
            curr_id=result.rows[0].cust_id;
            res.redirect("/");
        }
    }catch{
        console.error("Error during login:", err);
        res.status(500).send("An error occurred during login.");
    }
    //login=true;
    //curr_id=result.rows[0].cust_id;
})

app.get("/cart", async (req,res)=>{
    if (!login){
        res.redirect("/login")
    }
    else{
        try {
            const result = await db.query("SELECT cart.book_id, cart.quantity, books.title, books.author, books.price, books.cover_image_url FROM cart JOIN books ON cart.book_id = books.id WHERE cart.cust_id = $1",[curr_id]);
            
            const totalItems = result.rows.reduce((sum, item) => sum + item.quantity, 0);
            const subtotal = result.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            let shipping = 50.00;
            if (subtotal>500){
                shipping = 0;
            }
            const total = (parseFloat(subtotal) + shipping)

            res.render("cart.ejs",{books: result.rows, totalItems,subtotal,shipping,total});
            }
        catch (err) {
            console.error('Error processing request', err.stack);
            res.status(500).send("Error processing book selection");
        }
    }
})

app.get("/allproducts", async (req, res) => {
    try {
        const result = await db.query("SELECT cover_image_url, id, title, price FROM books");
        res.render("allproducts.ejs", { title: "Shop", books: result.rows });
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send("Error fetching book data");
    }
});

app.get("/contactus", (req,res)=>{
    if(!req.query){
        let message=" ";
    }
    else{
        let message=req.query.message;
        res.render("contactus.ejs", {message: message});
    }
})

app.post("/contactus", async (req,res)=>{
    const { name, email, subject, message } = req.body;

    await db.query("INSERT INTO contactUs (Name, Email, Subject, Message) VALUES ($1, $2, $3, $4)",[name,email,subject,message]);
    let status = "We will contact you soon";
    // Redirect to /contactus with the message as a query parameter
    res.redirect(`/contactus?message=${encodeURIComponent(status)}`);
})

app.get("/ordered", (req,res)=>{
    res.render("ordered.ejs");
})

app.get("/payment", (req,res)=>{
    res.render("payment.ejs");
})

app.post("/payment", async(req,res)=>{
    const result = await db.query("SELECT cart.book_id, cart.quantity, books.title, books.author, books.price, books.cover_image_url FROM cart JOIN books ON cart.book_id = books.id WHERE cart.cust_id = $1",[curr_id]);
            
            const subtotal = result.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            const shipping = 5.00; // Example shipping cost
            const total = (parseFloat(subtotal) + shipping)

            const orderResult = await db.query(
                "INSERT INTO orders (cust_id, total_amount, status) VALUES ($1, $2, $3) RETURNING order_id",
                [curr_id, total, 'Processing']
            );

            const order_id = orderResult.rows[0].order_id;

            for (let item of result.rows) {
                await db.query(
                    "INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ($1, $2, $3, $4)",
                    [order_id, item.book_id, item.quantity, item.price]
                );
            }
            
            await db.query("DELETE FROM cart WHERE cust_id = $1", [curr_id]);

            res.redirect("/ordered");
})

app.get("/product", async (req,res)=>{
    if (!login){
        res.redirect("/login")
    } else{
        try {
            const bookId = data;
            const result = await db.query("SELECT * FROM books WHERE id=$1",[data]);
            res.render("product.ejs",{book: result.rows});
        } catch (err) {
            console.error('Error executing query', err.stack);
            res.status(500).send("Error fetching book data");
        }
    }
})

app.post("/cartaction", async (req,res)=>{
    const checkQuery = await db.query("SELECT quantity FROM cart where cust_id=$1 AND book_id=$2",[curr_id,req.body.bookId]);
    if(req.body.status=="add"){
        if(checkQuery.rowCount==0){
            await db.query("INSERT INTO cart (cust_id, book_id,quantity) VALUES ($1, $2, $3)",[curr_id,req.body.bookId,1]);
        } else if (checkQuery.rowCount>0){
            await db.query("UPDATE cart SET quantity=quantity+1 WHERE cust_id=$1 AND book_id=$2",[curr_id,req.body.bookId]);
        }
        res.redirect("/product");
    }

    if(req.body.status=="del"){
        if(checkQuery.rows[0].quantity>1){
            await db.query("UPDATE cart SET quantity=quantity-1 WHERE cust_id=$1 AND book_id=$2",[curr_id,req.body.bookId]);
        } else{
            await db.query("DELETE FROM cart WHERE cust_id=$1 AND book_id=$2",[curr_id,req.body.bookId]);
        }
        res.redirect(req.get('Referer'));
    }
})

app.get("/orderconfirmation", async (req,res)=>{
    if (!login){
        res.redirect("/login")
    }
    else{
        try {
            const result = await db.query("SELECT cart.book_id, cart.quantity, books.title, books.author, books.price, books.cover_image_url FROM cart JOIN books ON cart.book_id = books.id WHERE cart.cust_id = $1",[curr_id]);
            
            const totalItems = result.rows.reduce((sum, item) => sum + item.quantity, 0);
            const subtotal = result.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            const shipping = 5.00; // Example shipping cost
            const total = (parseFloat(subtotal) + shipping)

            const address = await db.query("SELECT street_address, city, state, postal_code FROM customers where cust_id=$1",[curr_id]);

            res.render("orderconfirmation.ejs",{books: result.rows, totalItems,subtotal,shipping,total, address: address.rows});
            }
        catch (err) {
            console.error('Error processing request', err.stack);
            res.status(500).send("Error processing book selection");
        }
    }
})

app.get("/profile", async (req,res)=>{
    if (!login){
        res.redirect("/login");
    } else{
        const result = await db.query("SELECT * FROM customers WHERE cust_id=$1",[curr_id]);
        res.render("profile.ejs",{info: result.rows});
    }
})

app.get("/vieworders", async (req,res)=>{
    if (!login){
        res.redirect("/login");
    } else{
        const result = await db.query("SELECT * FROM orders WHERE cust_id=$1",[curr_id]);
        
        res.render("vieworders.ejs",{orders: result.rows});
    }
})

app.post("/vieworders", (req,res)=>{
    console.log(req.body);
    curr_order=req.body.order_id;
    res.redirect("/orderdetails");
})


app.get("/editprofile", async (req,res)=>{
    if (!login){
        res.redirect("/login");
    } else{
        const result = await db.query("SELECT * FROM customers WHERE cust_id=$1",[curr_id]);
        res.render("editprofile.ejs",{user: result.rows});
    }
})

app.post("/updateprofile", async (req,res)=>{
    const {streetAddress,city,state,postalCode,country} = req.body;
    await db.query("UPDATE customers set street_address=$1, city=$2, state=$3, postal_code=$4, country=$5 WHERE cust_id=$6",[streetAddress,city,state,postalCode,country,curr_id]);
    res.redirect("/profile");
})


app.get("/orderdetails/", async (req,res)=>{
    if (!login){
        res.redirect("/login");
    } else{
        const orderId = curr_order;
        const orderItemsQuery ="SELECT books.id, books.title, books.author, books.price, books.cover_image_url, order_items.quantity FROM order_items INNER JOIN books ON order_items.book_id = books.id WHERE order_items.order_id =$1";
        const result = await db.query(orderItemsQuery,[orderId]);
        const orderResult = await db.query("SELECT * FROM orders WHERE order_id=$1",[orderId]);
        
        console.log(orderResult.rows);
        res.render("orderdetails.ejs",{order:orderResult.rows, items:result.rows});
    }  
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });