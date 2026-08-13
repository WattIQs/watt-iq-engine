import { db } from "./db";

export async function testDatabase() {
  const result = await db.query("SELECT NOW() AS now");
  return result.rows[0];
}
