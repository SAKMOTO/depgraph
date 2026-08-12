require('dotenv').config({ path: '.env.local' });
const neo4j = require('neo4j-driver');

const uri = process.env.COGNO_URI;
const user = 'cognodb';
const password = process.env.COGNO_PASSWORD;

if (!uri || !password) {
  console.error("Please set COGNO_URI and COGNO_PASSWORD in .env.local");
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function seed() {
  const session = driver.session();
  try {
    console.log('Clearing existing data...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('Inserting seed data...');
    const query = `
      // Create Projects
      CREATE (api:Project {id: 'proj-api', name: 'Core API Services', team: 'Backend Team', description: 'Main REST API'})
      CREATE (web:Project {id: 'proj-web', name: 'Customer Dashboard', team: 'Frontend Team', description: 'Next.js Customer Portal'})
      CREATE (mobile:Project {id: 'proj-mobile', name: 'Mobile App', team: 'Mobile Team', description: 'React Native iOS/Android App'})
      CREATE (internal:Project {id: 'proj-admin', name: 'Admin Tools', team: 'Ops Team', description: 'Internal admin dashboard'})

      // Create Packages
      CREATE (react:Package {id: 'pkg-react', name: 'react', ecosystem: 'npm'})
      CREATE (express:Package {id: 'pkg-express', name: 'express', ecosystem: 'npm'})
      CREATE (lodash:Package {id: 'pkg-lodash', name: 'lodash', ecosystem: 'npm'})
      CREATE (axios:Package {id: 'pkg-axios', name: 'axios', ecosystem: 'npm'})
      CREATE (spring:Package {id: 'pkg-spring', name: 'spring-boot', ecosystem: 'maven'})
      CREATE (log4j:Package {id: 'pkg-log4j', name: 'log4j-core', ecosystem: 'maven'})
      CREATE (mysql:Package {id: 'pkg-mysql', name: 'mysql-connector-java', ecosystem: 'maven'})
      
      // Secondary Packages (Transitive dependencies)
      CREATE (followRedirects:Package {id: 'pkg-follow-redirects', name: 'follow-redirects', ecosystem: 'npm'})
      CREATE (qs:Package {id: 'pkg-qs', name: 'qs', ecosystem: 'npm'})

      // Create Vulnerabilities
      CREATE (cveLog4j:Vulnerability {cve_id: 'CVE-2021-44228', severity: 'CRITICAL', summary: 'Log4Shell - JNDI features used in configuration do not protect against attacker controlled LDAP.'})
      CREATE (cveAxios:Vulnerability {cve_id: 'CVE-2023-45857', severity: 'HIGH', summary: 'Axios vulnerable to Server-Side Request Forgery (SSRF) when making requests.'})
      CREATE (cveLodash:Vulnerability {cve_id: 'CVE-2021-23337', severity: 'MEDIUM', summary: 'Command Injection in lodash.template'})

      // Project -> Package Dependencies
      CREATE (api)-[:DEPENDS_ON {version: '2.7.0'}]->(spring)
      CREATE (api)-[:DEPENDS_ON {version: '8.0.32'}]->(mysql)
      CREATE (web)-[:DEPENDS_ON {version: '18.2.0'}]->(react)
      CREATE (web)-[:DEPENDS_ON {version: '1.5.0'}]->(axios)
      CREATE (mobile)-[:DEPENDS_ON {version: '18.2.0'}]->(react)
      CREATE (mobile)-[:DEPENDS_ON {version: '4.17.21'}]->(lodash)
      CREATE (internal)-[:DEPENDS_ON {version: '4.18.2'}]->(express)
      CREATE (internal)-[:DEPENDS_ON {version: '1.4.0'}]->(axios)

      // Transitive Dependencies
      CREATE (spring)-[:DEPENDS_ON {version: '2.14.1'}]->(log4j)
      CREATE (express)-[:DEPENDS_ON {version: '6.9.4'}]->(qs)
      CREATE (axios)-[:DEPENDS_ON {version: '1.15.2'}]->(followRedirects)

      // Vulnerability mapping
      CREATE (log4j)-[:HAS_VULNERABILITY]->(cveLog4j)
      CREATE (axios)-[:HAS_VULNERABILITY]->(cveAxios)
      CREATE (lodash)-[:HAS_VULNERABILITY]->(cveLodash)
    `;
    await session.run(query);
    console.log('Seed data inserted successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
