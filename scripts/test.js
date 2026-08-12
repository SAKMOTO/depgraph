require('dotenv').config({ path: '.env.local' });
const neo4j = require('neo4j-driver');

const uri = process.env.COGNO_URI;
const user = 'cognodb';
const password = process.env.COGNO_PASSWORD;
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function test() {
  const session = driver.session();
  try {
    const query = `
      MATCH (p:Project {id: 'proj-api'})
      OPTIONAL MATCH path = (p)-[:DEPENDS_ON*1..]->(pkg:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability)
      RETURN p { .id, .name, .team, .description } AS p, 
             collect({
               vulnerability: v { .cve_id, .severity, .summary },
               path: [node in nodes(path) | labels(node)[0] + ' ' + coalesce(node.name, node.cve_id)]
             }) as vulnerabilities
    `;
    const result = await session.run(query);
    console.log(JSON.stringify(result.records[0].get('vulnerabilities'), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await session.close();
    await driver.close();
  }
}
test();
