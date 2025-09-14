import { pool } from '../../db/index.ts';
import {
  InsertMessageSchema,
  LastMessageInfo,
  LastMessageInfoSchema,
  Message,
  MessageSchema,
  NewMessage,
  NewMessageSchema,
} from '../schemas/message.schema.ts';

const Message = {
  createMessagesTable: function (): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS messages (
            message_id SERIAL PRIMARY KEY,
            sender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            recipient_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            group_id INTEGER REFERENCES groups(group_id) ON DELETE CASCADE,
            client_offset TEXT UNIQUE,
            room UUID NOT NULL,
            content TEXT DEFAULT NULL,
            event_time TIMESTAMPTZ DEFAULT NOW(),
            is_edited BOOLEAN DEFAULT FALSE,
            type TEXT NOT NULL,
            UNIQUE (room, event_time, message_id)
          )
        `,
        (err) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  // INSERT OPERATIONS

  insertNewMessage: function (
    content: string,
    senderId: number,
    recipientId: number | null,
    groupId: number | null,
    room: string,
    type: string,
    clientOffset: string
  ): Promise<NewMessage> {
    const parsed = InsertMessageSchema.safeParse({
      content,
      senderId,
      recipientId,
      groupId,
      room,
      type,
      clientOffset,
    });

    if (!parsed.success) {
      console.error('Error validating new message input data:', parsed.error);
      throw new Error('Error validating new message input data');
    }

    return new Promise((resolve, reject) => {
      pool.query(
        `
          INSERT INTO messages (
            content,
            sender_id,
            recipient_id,
            group_id,
            room,
            type,
            client_offset
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING message_id, event_time, type
        `,
        [content, senderId, recipientId, groupId, room, type, clientOffset],
        (err, result) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }

          try {
            const newMessage = NewMessageSchema.parse({
              id: result.rows[0].message_id,
              event_time: result.rows[0].event_time,
              type: result.rows[0].type,
            });
            return resolve(newMessage);
          } catch (error) {
            return reject(
              `Error validating new message data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  // UPDATE OPERATIONS

  editMessageContent: function (
    newMessage: string,
    senderId: number,
    messageId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE messages
        SET
          content = $1,
          is_edited = true
        WHERE sender_id = $2 AND message_id = $3`,
        [newMessage, senderId, messageId],
        (err, result) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }
          if (result.rowCount === 0) {
            return reject('No message found or unauthorised edit');
          }
          return resolve();
        }
      );
    });
  },

  // READ OPERATIONS

  retrieveMessageContent: function (
    senderId: number,
    messageId: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          content
        FROM messages
        WHERE sender_id = $1 AND message_id = $2
        `,
        [senderId, messageId],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in retrieveMessageContent in messages table: ${err.message}`
            );
          }
          return resolve(result.rows[0].content);
        }
      );
    });
  },

  retrieveMessageType: function (messageId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          type
        FROM messages
        WHERE message_id = $1
        `,
        [messageId],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in retrieveMessageType in messages table: ${err.message}`
            );
          }
          return resolve(result.rows[0].type);
        }
      );
    });
  },

  retrieveMessageList: function (
    serverOffset: string,
    room: string
  ): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          m.message_id,
          m.sender_id,
          m.recipient_id,
          m.group_id,
          m.content,
          m.event_time,
          m.is_edited,
          m.type,
          u.username as sender_username
        FROM messages m
        JOIN users u
        ON m.sender_id = u.user_id
        WHERE m.message_id > $1
          AND m.room = $2
        ORDER BY m.event_time ASC;
        `,
        [serverOffset || 0, room],
        (err, result) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }
          try {
            const messageList = result.rows.map((row) =>
              MessageSchema.parse(row)
            );
            return resolve(messageList);
          } catch (error) {
            return reject(
              `Error validating message list data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  retrieveLastMessageInfo: function (
    room: string
  ): Promise<LastMessageInfo | null> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          content,
          event_time,
          type
        FROM messages
        WHERE room = $1
        ORDER BY message_id DESC LIMIT 1 
        `,
        [room],
        (err, result) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }
          if (result.rowCount === 0) {
            resolve(null);
          }

          try {
            const lastMessageInfo = LastMessageInfoSchema.parse(result.rows[0]);
            return resolve(lastMessageInfo);
          } catch (error) {
            return reject(
              `Error validating last message data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  // DELETE OPERATIONS

  deleteMessageById: function (
    senderId: number,
    messageId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `DELETE FROM messages WHERE sender_id = $1 AND message_id = $2`,
        [senderId, messageId],
        (err, result) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }
          if (result.rowCount === 0) {
            return reject('No message found or unauthorised delete');
          }
          return resolve();
        }
      );
    });
  },
};

export { Message };
