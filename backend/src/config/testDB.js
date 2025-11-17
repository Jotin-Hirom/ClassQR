export const testConnection = async (pool) => {
  let client;

  try {
    client = await pool.connect();   // if this fails, client stays undefined
    console.log("Test DB Connection: OK");

  } catch (err) {
    console.error("Test DB Connection Error:", err.message);
  } finally {
    // only release if client exists
    if (client) client.release();
  }
};
