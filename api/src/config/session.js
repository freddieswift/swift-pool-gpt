import session from "express-session";
import MySQLSessionFactory from "express-mysql-session";
import { env } from "./env.js";

const MySQLStore = MySQLSessionFactory(session);

const store = new MySQLStore({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  createDatabaseTable: true,
  schema: {
    tableName: "sessions",
    columnNames: {
      session_id: "session_id",
      expires: "expires",
      data: "data"
    }
  }
});

store.on("error", (error) => {
  console.error("Session store error:", error);
});

export const sessionMiddleware = session({
  name: env.SESSION_NAME,
  secret: env.SESSION_SECRET,
  store,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: env.SESSION_SECURE,
    sameSite: env.SESSION_SAME_SITE,
    maxAge: env.SESSION_MAX_AGE_MS
  }
});
