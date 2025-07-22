const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

const mongoURI = process.env.ATLASDB_URL;

const conn = mongoose.createConnection(mongoURI);

let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log('✅ GridFS ready');
});

module.exports = { conn, gfs };
