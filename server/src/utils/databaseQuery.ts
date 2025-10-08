import { pool } from '../../db/index.ts';
import type { QueryResult, QueryResultRow } from 'pg';
import { ZodType } from 'zod';

export const query = async <T extends QueryResultRow>(
  query: string,
  params: unknown[],
  schema?: ZodType<T>
): Promise<QueryResult<T>> => {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (err, result) => {
      if (err) {
        return reject(new Error(`Database error: ${err.message}`));
      }
      if (result.rowCount === 0) {
        return resolve({ ...result, rows: [] });
      }

      try {
        if (schema) {
          const validatedRows = schema.array().parse(result.rows);
          return resolve({ ...result, rows: validatedRows });
        }
        return resolve(result);
      } catch (error) {
        return reject(
          new Error(
            `Error validating data: ${
              error instanceof Error ? error.message : error
            }`
          )
        );
      }
    });
  });
};
