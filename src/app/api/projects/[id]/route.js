import { NextResponse } from 'next/server';
import { read } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const query = `
      MATCH (p:Project {id: $id})
      OPTIONAL MATCH (p)-[r:DEPENDS_ON]->(pkg:Package)
      WITH p, collect(DISTINCT { name: pkg.name, version: r.version, ecosystem: pkg.ecosystem }) AS dependencies
      OPTIONAL MATCH path = (p)-[:DEPENDS_ON*1..]->(pkg2:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability)
      RETURN p { .id, .name, .team, .description } AS p, 
             dependencies,
             collect(DISTINCT {
               vulnerability: v { .cve_id, .severity, .summary },
               path: [node in nodes(path) | labels(node)[0] + ' ' + coalesce(node.name, node.cve_id)]
             }) as vulnerabilities
    `;
    const result = await read(query, { id });
    
    if (result.records.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const record = result.records[0];
    const project = record.get('p');
    const dependencies = record.get('dependencies').filter(d => d.name != null);
    // Filter out null vulnerabilities if a project has none
    const vulnerabilities = record.get('vulnerabilities').filter(v => v.vulnerability.cve_id != null);

    return NextResponse.json({ project, dependencies, vulnerabilities });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
