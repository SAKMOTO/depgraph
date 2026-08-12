import { NextResponse } from 'next/server';
import { read } from '@/lib/db';

export async function GET() {
  try {
    const query = `
      MATCH (v:Vulnerability)
      OPTIONAL MATCH (v)<-[:HAS_VULNERABILITY]-(pkg:Package)<-[:DEPENDS_ON*1..]-(p:Project)
      RETURN v { .cve_id, .severity, .summary } AS v, count(DISTINCT p) as affected_projects
      ORDER BY 
        CASE v.severity 
          WHEN 'CRITICAL' THEN 1 
          WHEN 'HIGH' THEN 2 
          WHEN 'MEDIUM' THEN 3 
          ELSE 4 
        END, v.cve_id DESC
    `;
    const result = await read(query);
    const vulnerabilities = result.records.map(record => ({
      ...record.get('v'),
      affectedProjects: record.get('affected_projects').toNumber()
    }));
    return NextResponse.json({ vulnerabilities });
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
