const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
require('dotenv').config();

const mongoURI = process.env.ATLASDB_URL;

const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;

conn.once('open', () => {
  // Initialize stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log('✅ GridFS ready');
});

module.exports = { conn, getGfs: () => gfs };
