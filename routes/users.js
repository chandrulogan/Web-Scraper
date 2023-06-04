var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://zen-class-35:Chandru1234@chandruloganathan.ckkhhdb.mongodb.net/Web-scraping?retryWrites=true&w=majority', {
  useNewUrlParser: true, //helps to connect the db
  useUnifiedTopology: true // maintain a connection with db
});
const db = mongoose.connection;

// Schema for the scraped data
const productSchema = new mongoose.Schema({
  imageURL: String,
  productName: String,
  productPrice: String,
  productRatings: String
});

// Creating a model based on the schema
const Product = mongoose.model('Scrapped-Data', productSchema);

/* Scraping data from Flipkart */
router.get('/flipkart', async (req, res) => {
  try {
    const response = await axios.get("https://www.flipkart.com/search?q=gaming+laptop&sid=6bo%2Cb5g&as=on&as-show=on&otracker=AS_QueryStore_OrganicAutoSuggest_1_8_na_na_na&otracker1=AS_QueryStore_OrganicAutoSuggest_1_8_na_na_na&as-pos=1&as-type=RECENT&suggestionId=gaming+laptop%7CLaptops&requestId=caf63b50-dd94-42dc-8c29-cd13bb84c00f&as-backfill=on");
    const html = response.data;
    const $ = cheerio.load(html);
    const products = [];

    $("div._1AtVbE").each((index, element) => {
      const imageURL = $(element).find("img._396cs4").attr("src");
      const productName = $(element).find("._4rR01T").text();
      const productPrice = $(element).find("._30jeq3._1_WHN1").text().trim();
      const productRatings = $(element).find("._2_R_DZ").text().trim();

      if (imageURL && productName && productPrice && productRatings) {
        products.push({
          imageURL,
          productName,
          productPrice,
          productRatings
        });
      }
    });

    // Delete existing documents in the collection
    await Product.deleteMany({});

    // Save the scraped data to MongoDB
    if (products.length > 0) {
      await Product.insertMany(products);
    }

    res.send(products);
  } catch (error) {
    console.log(error);
  }
});


// Getting the details from DB
router.get('/flipkartDB', async (req, res) => {
  try {
    const products = await Product.find({}); // Retrieve all documents from the collection

    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
