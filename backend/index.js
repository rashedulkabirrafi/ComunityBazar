const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = Number(process.env.PORT || 3000);


const app = express();
app.use(cors());
app.use(express.json())

// Opt-in local development uploads; stores test images on this machine.
if (process.env.LOCAL_UPLOADS === 'true') {
  const path = require('path');
  const fs = require('fs');
  const { randomUUID } = require('crypto');
  const uploadDir = path.resolve(__dirname, '../.local-data/uploads');
  fs.mkdirSync(uploadDir, { recursive: true });
  app.use('/local/uploads', express.static(uploadDir));
  app.post('/local/uploads', express.raw({ type: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'], limit: '5mb' }), (req, res) => {
    const extensions = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
    const extension = extensions[req.get('content-type')];
    if (!extension || !Buffer.isBuffer(req.body) || !req.body.length) {
      return res.status(400).json({ error: 'Choose a PNG, JPEG, WebP, or GIF image (maximum 5 MB).' });
    }
    const filename = `${randomUUID()}.${extension}`;
    fs.writeFileSync(path.join(uploadDir, filename), req.body);
    res.json({ success: true, data: { display_url: `http://127.0.0.1:${port}/local/uploads/${filename}` } });
  });
}


// Mongodb connect


const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@pawmarta10.t0jzost.mongodb.net/?appName=PawMartA10`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // All the backend wroks will start from here. 
    // All the backend wroks will start from here. 

    // Creating database
    const database = client.db(process.env.DB_NAME || 'CampusBazar-CSE470-DB')

    // creating collections
    const userCollections = database.collection('user');

    // ================= FEATURE COLLECTIONS START =================
    // Feature: My Cart and My Orders
    const cartCollections = database.collection('cart');
    const wishlistCollections = database.collection('wishlist');
    const orderCollections = database.collection('orders');
    const reviewCollections = database.collection('reviews');
    // ================= FEATURE COLLECTIONS END =================

    const listingCollections = database.collection('listings');

    const verifyAdmin = async (req, res, next) => {
      const requesterEmail = req.headers['x-user-email'] || req.query.email || req.body?.email;

      if (!requesterEmail) {
        return res.status(401).send({ error: 'Admin email is required' });
      }

      const requester = await userCollections.findOne({ email: requesterEmail });

      if (requester?.role !== 'admin') {
        return res.status(403).send({ error: 'Admin access required' });
      }

      next();
    };


    // saving the user to db
    app.post('/users', async (req, res) => {
      const userInfo = req.body;
      userInfo.role = "general user";
      userInfo.createdAt = new Date();

      const result = await userCollections.insertOne(userInfo);
      res.send(result);
    });

    // Getting role of the current user
    app.get('/users/role/:email', async (req, res) => {
      const { email } = req.params;

      const query = { email: email };
      const result = await userCollections.findOne(query);
      res.send(result);
    });

    // Get all users
    app.get('/users', async (req, res) => {
      const result = await userCollections.find().toArray();
      res.send(result);
    });

    // Update user role
    app.patch('/users/:id', async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { role } };

      const result = await userCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Delete a user
    app.delete('/users/:id', async (req, res) => {
      const { id } = req.params;

      const filter = { _id: new ObjectId(id) };
      const result = await userCollections.deleteOne(filter);

      res.send(result);
    });

    // ================= LISTINGS ROUTES =================
    // Get all listings
    app.get('/listings', async (req, res) => {
      const result = await listingCollections.find().sort({ createdAt: -1 }).toArray();
      res.send(result);
    });

    // Get all listings for admin product management
    app.get('/admin/listings', verifyAdmin, async (req, res) => {
      const result = await listingCollections.find().sort({ createdAt: -1 }).toArray();
      res.send(result);
    });

    // Get listings by user email
    app.get('/listings/:email', async (req, res) => {
      const { email } = req.params;
      const query = { email: email };
      const result = await listingCollections.find(query).sort({ createdAt: -1 }).toArray();
      res.send(result);
    });

    // Get a single listing by ID
    app.get('/listing/:id', async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: 'Invalid ID format' });
        }
        const filter = { _id: new ObjectId(id) };
        const result = await listingCollections.findOne(filter);
        res.send(result);
      } catch (error) {
        console.error('Error fetching listing by ID:', error);
        res.status(500).send({ error: 'Internal server error' });
      }
    });

    // Create a new listing
    app.post('/listings', async (req, res) => {
      const listingData = req.body;
      listingData.createdAt = new Date();
      
      const result = await listingCollections.insertOne(listingData);
      res.send(result);
    });

    // Delete a listing from admin product management
    app.delete('/listings/:id', verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: 'Invalid ID format' });
        }

        const filter = { _id: new ObjectId(id) };
        const result = await listingCollections.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).send({ error: 'Internal server error' });
      }
    });
    // ================= END LISTINGS ROUTES =================


    // ================= COMMERCE ROUTES START =================
    // Feature: My Cart and My Orders backend


    // ================= CART ROUTES =================

    // Add item to cart
    app.post('/cart', async (req, res) => {
      const cartItem = req.body;

      cartItem.createdAt = new Date();

      const result = await cartCollections.insertOne(cartItem);
      res.send(result);
    });

    // Get cart items by user email
    app.get('/cart/:email', async (req, res) => {
      const { email } = req.params;

      const query = { email: email };
      const result = await cartCollections.find(query).toArray();

      res.send(result);
    });

    // Update cart item quantity
    app.patch('/cart/:id', async (req, res) => {
      const { id } = req.params;
      const { quantity } = req.body;

      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          quantity: quantity
        }
      };

      const result = await cartCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Clear all cart items for a user
    app.delete('/cart/clear/:email', async (req, res) => {
      const { email } = req.params;

      const query = { email: email };
      const result = await cartCollections.deleteMany(query);

      res.send(result);
    });

    // Remove single cart item
    app.delete('/cart/:id', async (req, res) => {
      const { id } = req.params;

      const filter = { _id: new ObjectId(id) };
      const result = await cartCollections.deleteOne(filter);

      res.send(result);
    });

    // ================= WISHLIST ROUTES =================

    // Add item to wishlist
    app.post('/wishlist', async (req, res) => {
      const wishlistItem = req.body;
      wishlistItem.createdAt = new Date();

      // Avoid duplicates for the same user and product
      const exists = await wishlistCollections.findOne({
        email: wishlistItem.email,
        productId: wishlistItem.productId,
      });

      if (exists) {
        return res.send({ acknowledged: true, duplicate: true, message: 'Item already in wishlist' });
      }

      const result = await wishlistCollections.insertOne(wishlistItem);
      res.send(result);
    });

    // Get wishlist items by user email
    app.get('/wishlist/:email', async (req, res) => {
      const { email } = req.params;
      const query = { email: email };
      const result = await wishlistCollections.find(query).sort({ createdAt: -1 }).toArray();
      res.send(result);
    });

    // Update wishlist item quantity
    app.patch('/wishlist/:id', async (req, res) => {
      const { id } = req.params;
      const { quantity } = req.body;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          quantity: quantity,
        },
      };

      const result = await wishlistCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Remove single wishlist item
    app.delete('/wishlist/:id', async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await wishlistCollections.deleteOne(filter);
      res.send(result);
    });

    // ================= ORDER ROUTES =================

    // Place order
    app.post('/orders', async (req, res) => {
      const orderInfo = req.body;

      orderInfo.createdAt = new Date();
      orderInfo.status = "placed";

      const result = await orderCollections.insertOne(orderInfo);
      res.send(result);
    });

    // Get orders by user email
    app.get('/orders/:email', async (req, res) => {
      const { email } = req.params;

      const query = { email: email };
      const result = await orderCollections.find(query).sort({ createdAt: -1 }).toArray();

      res.send(result);
    });

    // Get all orders (for admin)
    app.get('/all-orders', async (req, res) => {
      const result = await orderCollections.find().sort({ createdAt: -1 }).toArray();
      res.send(result);
    });

    // Update order status
    app.patch('/orders/:id/status', async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: status
        }
      };

      const result = await orderCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Delete order
    app.delete('/orders/:id', async (req, res) => {
      const { id } = req.params;

      const filter = { _id: new ObjectId(id) };
      const result = await orderCollections.deleteOne(filter);

      res.send(result);
    });

    app.get('/debug/routes', (req, res) => {
      const routes = app._router.stack
        .filter((layer) => layer.route)
        .map((layer) => {
          const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
          return { path: layer.route.path, methods };
        });
      res.send(routes);
    });



    // ================= REVIEW ROUTES =================

    // Add rating and review
    app.post('/reviews', async (req, res) => {
      const reviewInfo = req.body;

      reviewInfo.productId = String(reviewInfo.productId);
      reviewInfo.rating = Number(reviewInfo.rating);
      reviewInfo.createdAt = new Date();

      const result = await reviewCollections.insertOne(reviewInfo);
      res.send(result);
    });

    // Get reviews by product id for ViewDetails
    app.get('/reviews/product/:productId', async (req, res) => {
      const { productId } = req.params;

      const query = { productId: String(productId) };

      const result = await reviewCollections
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      res.send(result);
    });

    // Get reviews by user email
    app.get('/reviews/user/:email', async (req, res) => {
      const { email } = req.params;

      const query = { userEmail: email };

      const result = await reviewCollections
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      res.send(result);
    });

    // Debug: get all reviews
    app.get('/reviews', async (req, res) => {
      const result = await reviewCollections
        .find()
        .sort({ createdAt: -1 })
        .toArray();

      res.send(result);
    });
    // ================= COMMERCE ROUTES END =================  

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


// check server
app.get('/', (req, res) => {
  res.send("Server is on")
})

app.listen(port, process.env.HOST || '127.0.0.1', () => {
  console.log(`server is running on ${port}`);
})
