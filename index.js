const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Set up the OAuth constants
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOPIFY_SCOPE = 'read_products,write_orders';  // Adjust the scopes as needed
const SHOPIFY_REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI;


app.use(cors());

app.set('view engine', 'ejs');

// Serve static files (if any, like stylesheets, images)
app.use(express.static('public'));


app.get('/', (req, res) => {
    const shop = req.query.shop;  
    res.render('install', { title: 'My Home Paggggge', message: 'Welcome to Node.js with EJS!',shopName:shop });
  });


// Home route to start the OAuth flow
app.get('/auth', (req, res) => {
  console.log('working....', req.query.shop)
  const shop = req.query.shop;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPE}&redirect_uri=${SHOPIFY_REDIRECT_URI}`;
 
 console.log('The installurl is ',installUrl)
  // res.redirect(installUrl);
  if (req.headers['sec-fetch-dest'] === 'iframe') {
    res.json({ installUrl });
} else {
    res.redirect(installUrl);
}
});

// OAuth callback to handle the token exchange
app.get('/auth/callback', async (req, res) => {
  const { code, shop } = req.query;
  
  if (!code || !shop) {
    return res.status(400).send('Missing code or shop parameter');
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code: code
    });

    const accessToken = tokenResponse.data.access_token;

    // Store access token securely (e.g., in database)
    console.log(`Access Token for ${shop}: ${accessToken}`);

    const redirectUrl = `https://${shop}/admin/themes/current/editor?context=apps`;
    res.redirect(redirectUrl);

    // res.send('App installed successfully');


  } catch (error) {
    console.error('Error exchanging code for access token:', error);
    res.status(500).send('Failed to install app');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});