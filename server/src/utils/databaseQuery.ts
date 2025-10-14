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
          const validatedRows = schema.array().safeParse(result.rows);

          if (validatedRows.success) {
            return resolve({ ...result, rows: validatedRows.data });
          } else {
            return reject(
              new Error(
                `Error validating data: ${validatedRows.error.issues[0].message}`
              )
            );
          }
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
