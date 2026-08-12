import neo4j from 'neo4j-driver';

let driver;

export function getDriver() {
  if (driver) {
    return driver;
  }

  const uri = process.env.COGNO_URI;
  const user = 'cognodb';
  const password = process.env.COGNO_PASSWORD;

  if (!uri || !password) {
    console.warn("WARNING: COGNO_URI or COGNO_PASSWORD environment variables are not set. Database operations will fail.");
    return null;
  }

  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionPoolSize: 50,
      connectionTimeout: 10000,
    });
    return driver;
  } catch (error) {
    console.error("Failed to initialize Neo4j driver:", error);
    return null;
  }
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

/**
 * Execute a read transaction
 * @param {string} cypher - The cypher query to execute
 * @param {object} params - Parameters for the query
 * @returns {Promise<import('neo4j-driver').QueryResult>}
 */
export async function read(cypher, params = {}) {
  const driver = getDriver();
  if (!driver) throw new Error("Database not configured");
  
  const session = driver.session({ defaultAccessMode: neo4j.session.READ });
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}

/**
 * Execute a write transaction
 * @param {string} cypher - The cypher query to execute
 * @param {object} params - Parameters for the query
 * @returns {Promise<import('neo4j-driver').QueryResult>}
 */
export async function write(cypher, params = {}) {
  const driver = getDriver();
  if (!driver) throw new Error("Database not configured");

  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}
