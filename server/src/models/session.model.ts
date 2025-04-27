import { pool } from '../../db/index.ts';

const Session = {
  createSessionsTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS sessions (
            sid VARCHAR(255) PRIMARY KEY,
            sess JSON NOT NULL,
            expire TIMESTAMP NOT NULL
          )
        `,
        (err) => {
          if (err) {
            return reject(`Database error in sessions table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },
};

export { Session };
