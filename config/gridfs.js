const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

const mongoURI = 'mongodb://127.0.0.1:27017/unishare';

const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log('✅ GridFS ready');
});

module.exports = { conn, gfs };
