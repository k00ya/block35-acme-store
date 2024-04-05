const {
    client,
    createTables,
    createUser,
    createProduct,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    destroyFavorite
  } = require('./db');
  const express = require('express');
  const app = express();
  const bcrypt = require('bcrypt');
  app.use(express.json());
  
  // Get all products
  app.get('/api/products', async (req, res, next) => {
    try {
      res.send(await fetchProducts());
    } catch (ex) {
      next(ex);
    }
  });
  
  // Get all users
  app.get('/api/users', async (req, res, next) => {
    try {
      res.send(await fetchUsers());
    } catch (ex) {
      next(ex);
    }
  });
  
  // Get favorites for a user
  app.get('/api/users/:id/favorites', async (req, res, next) => {
    try {
      res.send(await fetchFavorites(req.params.id));
    } catch (ex) {
      next(ex);
    }
  });
  
  // Create a favorite for a user
  app.post('/api/users/:id/favorites', async (req, res, next) => {
    try {
      res.status(201).send(await createFavorite({ user_id: req.params.id, product_id: req.body.product_id }));
    } catch (ex) {
      next(ex);
    }
  });
  
  // Delete a favorite
  app.delete('/api/users/:userId/favorites/:id', async (req, res, next) => {
    try {
      await destroyFavorite({ user_id: req.params.userId, id: req.params.id });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  });
  
  const init = async () => {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('tables created');
    // Example data seeding
    const passwordSalt = await bcrypt.genSalt();
    const users = await Promise.all([
      createUser({ username: 'moe', password: await bcrypt.hash('moe_pw', passwordSalt) }),
      createUser({ username: 'lucy', password: await bcrypt.hash('lucy_pw', passwordSalt) }),
    ]);
    const products = await Promise.all([
      createProduct({ name: 'Gadget' }),
      createProduct({ name: 'Widget' }),
    ]);
    console.log('data seeded');
  
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  };
  
  init();
  