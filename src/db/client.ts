import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { config } from "../config";

const pool = mysql.createPool(config.databaseUrl);

export const db = drizzle(pool);
