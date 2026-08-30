const { db } = require('../database');
const bcrypt = require('bcryptjs');

class User {
  static create(name, email, password, callback) {
    const hashed = bcrypt.hashSync(password, 10);
    db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed],
      function(err) {
        callback(err, this ? this.lastID : null);
      }
    );
  }

  static findByEmail(email, callback) {
    db.get('SELECT * FROM users WHERE email = ?', [email], callback);
  }

  static findById(id, callback) {
    db.get('SELECT id, name, email, level, meta_score FROM users WHERE id = ?', [id], callback);
  }

  static updateLevel(id, level, callback) {
    db.run('UPDATE users SET level = ? WHERE id = ?', [level, id], callback);
  }

  static updateMeta(id, meta_score, callback) {
    db.run('UPDATE users SET meta_score = ? WHERE id = ?', [meta_score, id], callback);
  }
}

module.exports = User;