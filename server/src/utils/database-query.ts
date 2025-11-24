import type { QueryResult, QueryResultRow } from 'pg';
import { pool } from '../../db/index.ts';

export const query = async <T extends QueryResultRow>(
  query: string,
  params: unknown[]
): Promise<QueryResult<T>> => {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (err, result) => {
      if (err) {
        return reject(new Error(`Database error: ${err.message}`));
      }

      return resolve(result);
    });
  });
};
