import { NextResponse } from 'next/server';
import { read } from '@/lib/db';

export async function GET() {
  try {
    const query = `
      MATCH (p:Project)
      OPTIONAL MATCH (p)-[:DEPENDS_ON*1..]->(pkg:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability)
      RETURN p { .id, .name, .team, .description } AS p, count(DISTINCT v) as vuln_count
      ORDER BY p.name
    `;
    const result = await read(query);
    const projects = result.records.map(record => ({
      ...record.get('p'),
      vulnCount: record.get('vuln_count').toNumber()
    }));
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
