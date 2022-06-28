const mongoose = require('mongoose');
const safe = require('safe-await');
//Connection URI
const uri = process.env.DB_URI;

async function run() {
  const [err,] = await safe(mongoose.connect(uri));
  if(err) {
    console.log("db not running");
    process.exit(1);              // don't run the server if the db not running
  }     
  console.log("DataBase Connected successfully")
  
}
run()