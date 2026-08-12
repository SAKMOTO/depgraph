'use client';

import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Layers, Network, X, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('vulnerabilities');
  const [data, setData] = useState({ projects: [], vulnerabilities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [projRes, vulnRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/vulnerabilities')
        ]);
        
        const projData = await projRes.json();
        const vulnData = await vulnRes.json();

        if (projData.error || vulnData.error) {
          throw new Error(projData.error || vulnData.error);
        }

        setData({
          projects: projData.projects,
          vulnerabilities: vulnData.vulnerabilities
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openImpactModal = async (vuln) => {
    setSelectedItem(vuln);
    setImpactData(null);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/impact?cve_id=${vuln.cve_id}`);
      const data = await res.json();
      setImpactData(data.impacts);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const openProjectModal = async (project) => {
    setSelectedItem(project);
    setImpactData(null);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      const data = await res.json();
      setImpactData(data.vulnerabilities);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setImpactData(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Activity className={styles.spinner} size={48} />
        <h2>Loading Graph Data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <ShieldAlert size={48} style={{ marginBottom: '16px' }} />
          <h2>Database Connection Error</h2>
          <p>{error}</p>
          <p style={{ marginTop: '16px', fontSize: '0.9rem' }}>
            Ensure you have set COGNO_URI and COGNO_PASSWORD in your .env.local file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Network className={styles.icon} size={40} />
          DepGraph
        </h1>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'vulnerabilities' ? styles.active : ''}`}
          onClick={() => setActiveTab('vulnerabilities')}
        >
          <ShieldAlert size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/>
          Vulnerabilities
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'projects' ? styles.active : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <Layers size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/>
          Projects
        </button>
      </div>

      <div className={styles.grid}>
        {activeTab === 'vulnerabilities' && data.vulnerabilities.map((vuln, i) => (
          <div 
            key={vuln.cve_id} 
            className={`${styles.card} ${styles['glass-panel']} ${styles['animate-fade-in']} styles.delay-${(i%3)+1}`}
            onClick={() => openImpactModal(vuln)}
          >
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>{vuln.cve_id}</h3>
              </div>
              <span className={`${styles.badge} ${styles[vuln.severity.toLowerCase()]}`}>
                {vuln.severity}
              </span>
            </div>
            <p className={styles.cardBody}>{vuln.summary}</p>
            <div className={styles.metric}>
              <Network size={16} />
              <span>Blast Radius: <span className={styles.metricValue}>{vuln.affectedProjects}</span> projects affected</span>
            </div>
          </div>
        ))}

        {activeTab === 'projects' && data.projects.map((proj, i) => (
          <div 
            key={proj.id} 
            className={`${styles.card} ${styles['glass-panel']} ${styles['animate-fade-in']} styles.delay-${(i%3)+1}`}
            onClick={() => openProjectModal(proj)}
          >
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>{proj.name}</h3>
                <span className={styles.cardSubtitle}>{proj.team}</span>
              </div>
              {proj.vulnCount > 0 && (
                <span className={`${styles.badge} ${styles.critical}`}>
                  {proj.vulnCount} Risks
                </span>
              )}
              {proj.vulnCount === 0 && (
                <span className={`${styles.badge} ${styles.success}`}>
                  Secure
                </span>
              )}
            </div>
            <p className={styles.cardBody}>{proj.description}</p>
            <div className={styles.metric}>
              <ShieldAlert size={16} />
              <span>Inherits <span className={styles.metricValue}>{proj.vulnCount}</span> vulnerabilities</span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              <X size={24} />
            </button>
            
            <div className={styles.modalHeader}>
              {selectedItem.cve_id ? (
                <>
                  <h2 className={styles.title} style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                    Impact Analysis: {selectedItem.cve_id}
                  </h2>
                  <p className={styles.cardBody}>{selectedItem.summary}</p>
                </>
              ) : (
                <>
                  <h2 className={styles.title} style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                    Security Audit: {selectedItem.name}
                  </h2>
                  <p className={styles.cardBody}>Team: {selectedItem.team}</p>
                </>
              )}
            </div>

            {modalLoading ? (
              <div className={styles.loadingState} style={{ padding: '40px 0' }}>
                <Activity className={styles.spinner} size={32} />
                <p>Tracing graph dependencies...</p>
              </div>
            ) : (
              <div>
                {impactData && impactData.length === 0 ? (
                  <p style={{ color: 'var(--success)', textAlign: 'center', padding: '40px 0' }}>
                    No vulnerabilities found in the dependency tree!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {selectedItem.cve_id 
                      ? impactData?.map((impact, i) => (
                        <div key={i} className={styles.glassPanel} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                          <h4 style={{ marginBottom: '12px', color: 'var(--foreground)' }}>{impact.project} ({impact.team})</h4>
                          <div className={styles.pathItem}>
                            {impact.path.map((node, j) => (
                              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className={styles.pathNode}>{node}</span>
                                {j < impact.path.length - 1 && <ArrowRight className={styles.pathArrow} size={16} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                      : impactData?.map((vulnData, i) => (
                        <div key={i} className={styles.glassPanel} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h4 style={{ color: 'var(--foreground)' }}>{vulnData.vulnerability.cve_id}</h4>
                            <span className={`${styles.badge} ${styles[vulnData.vulnerability.severity.toLowerCase()]}`}>
                              {vulnData.vulnerability.severity}
                            </span>
                          </div>
                          <div className={styles.pathItem} style={{ marginTop: '16px' }}>
                            {vulnData.path.map((node, j) => (
                              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className={styles.pathNode}>{node}</span>
                                {j < vulnData.path.length - 1 && <ArrowRight className={styles.pathArrow} size={16} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
