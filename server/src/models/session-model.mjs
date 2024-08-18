import { pool } from '../../db/index.mjs';

const Session = {
  createSessionsTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        'CREATE TABLE IF NOT EXISTS sessions (sid VARCHAR(255) PRIMARY KEY, sess JSON NOT NULL, expire TIMESTAMP NOT NULL)',
        (err) => {
          if (err) {
            reject(`Database error: ${err.message}`);
          }
          resolve();
        }
      );
    });
  },
};

export { Session };
