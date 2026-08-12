import { NextResponse } from 'next/server';
import { read } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cve_id = searchParams.get('cve_id');

  if (!cve_id) {
    return NextResponse.json({ error: 'cve_id is required' }, { status: 400 });
  }

  try {
    // Multi-hop traversal to find paths from projects to the vulnerability
    const query = `
      MATCH path = (p:Project)-[:DEPENDS_ON*1..]->(pkg:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability {cve_id: $cve_id})
      RETURN p.name AS project, p.team AS team, [node in nodes(path) | labels(node)[0] + ' ' + coalesce(node.name, node.cve_id)] AS dependency_path
      ORDER BY project
    `;
    const result = await read(query, { cve_id });
    
    const impacts = result.records.map(record => ({
      project: record.get('project'),
      team: record.get('team'),
      path: record.get('dependency_path')
    }));

    return NextResponse.json({ impacts });
  } catch (error) {
    console.error('Error fetching impact:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
