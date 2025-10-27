import {
  MessageSchema,
  NewMessage,
  NewMessageSchema,
  Message as MessageType,
  LastMessageInfo,
  LastMessageInfoSchema,
} from '../schemas/message.schema.ts';
import { query } from '../utils/database-query.ts';

interface Database {
  query: typeof query;
}

export class Message {
  private readonly db: Database;

  constructor(db = { query }) {
    this.db = db;
  }

  createMessagesTable = async (): Promise<void> => {
    await this.db.query(
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
      []
    );
  };

  insertNewMessage = async (
    content: string,
    senderId: number,
    recipientId: number | null,
    groupId: number | null,
    room: string,
    type: string,
    clientOffset: string
  ): Promise<NewMessage> => {
    const result = await this.db.query(
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
      NewMessageSchema
    );

    return result.rows[0];
  };

  findMessageContent = async (senderId: number, messageId: number) => {
    const result = await this.db.query(
      `
      SELECT
        content
      FROM messages
      WHERE sender_id = $1 AND message_id = $2
      `,
      [senderId, messageId]
    );

    return result.rows[0];
  };

  findMessageType = async (messageId: number): Promise<string> => {
    const result = await this.db.query(
      'SELECT type FROM messages WHERE message_id = $1',
      [messageId]
    );

    return result.rows[0].type;
  };

  findMessageList = async (
    serverOffset: string,
    room: string
  ): Promise<MessageType[]> => {
    const result = await this.db.query(
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
      [serverOffset, room],
      MessageSchema
    );

    return result.rows;
  };

  findLastMessageInfo = async (
    room: string
  ): Promise<LastMessageInfo | null> => {
    const result = await this.db.query(
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
      LastMessageInfoSchema
    );

    return result.rows[0];
  };

  updateMessageContent = async (
    newMessage: string,
    senderId: number,
    messageId: number
  ): Promise<void> => {
    await this.db.query(
      `
      UPDATE messages
      SET
        content = $1,
        is_edited = true
      WHERE sender_id = $2 AND message_id = $3
      `,
      [newMessage, senderId, messageId]
    );
  };

  deleteMessage = async (
    senderId: number,
    messageId: number
  ): Promise<void> => {
    await this.db.query(
      'DELETE FROM messages WHERE sender_id = $1 AND message_id = $2',
      [senderId, messageId]
    );
  };
}
