const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const shortid = require('shortid');
const validUrl = require('valid-url');

let mongoConfig;
try {
  mongoConfig = require('../.mongo-config');
} catch (ex) {
  console.log(`Couldn't import mongo-config. Using ENV variables instead.`);
  mongoConfig = {
    password: process.env.MONGO_PASSWORD,
    db: process.env.MONGO_DB,
  };
}  

const mongoConnectionString = `mongodb://tsauvajon:${mongoConfig.password}@cluster0-shard-00-00-lbcnx.mongodb.net:27017,cluster0-shard-00-01-lbcnx.mongodb.net:27017,cluster0-shard-00-02-lbcnx.mongodb.net:27017/${mongoConfig.db}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`
const MongoClient = mongodb.MongoClient;

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/new/:url(*)', (req, res, next) => {
  MongoClient.connect(mongoConnectionString, (err, db) => {
    if (err) {
      console.log('Unable to connect', err);
    } else {
      console.log('Connected');
      const collection = db.collection('links');
      const { url } = req.params;

      const newLink = (db, callback) => {
        collection.findOne({ url }, { short: 1, _id: 0 }, (err, doc) => {
            if (doc !== null) {
              const shortened = `${req.get('host')}/${doc.short}`;
              return res.status(304).json({
                url,
                shortened,
              });
            } else if (validUrl.isUri(url)) {
              const short = shortid.generate();
              const newUrl = {
                url,
                short,
              };
              collection.insert([newUrl]);
              const shortened = `${req.get('host')}/${short}`;
              return res.json({
                url,
                shortened,
              })
            } else {
              return res.status(400).json({
                error: `The URL is malformed or the site doesn't exist`,
              })
            }
        });
      };

      newLink(db, () => db.close());
    }
  });
});

router.get('/:short', (req, res, next) => {
  MongoClient.connect(mongoConnectionString, (err, db) => {
    if (err) {
      console.log('Unable to connect', err);
    } else {
      console.log('Connected');

      const collection = db.collection('links');
      const { short } = req.params;

      const findLink = (db, callback) => {
        collection.findOne({ short }, { url: 1, _id: 0 }, (err, doc) => {
            if (doc !== null) {
              return res.redirect(doc.url);
            } else {
              return res.json({
                error: 'Link not found !',
              });
            }
        });
      };

      findLink(db, () => db.close());
    }
  });
});

module.exports = router;
