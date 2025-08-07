import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/UI/Card';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/UI/Table';
import { Input } from '../../components/UI/Input';
import { format } from 'date-fns';

interface Interaction {
  id: string;
  user_email: string;
  patient_id: string;
  patient_first_name?: string;
  patient_last_name?: string;
  action: string;
  model: string;
  provider?: string;
  tokens: number;
  duration: number;
  confidence_score?: number;
  created_at: string;
  nlp_results?: any;
  error_log?: string;
  security_hash?: string;
}

export const AuditDashboard: React.FC = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ user: '', model: '', provider: '', action: '', date: '' });
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([k, v]) => v && params.append(k, v));
      const res = await fetch(`/api/ai/interactions?${params.toString()}`);
      const json = await res.json();
      setInteractions(json.data?.interactions || []);
      setLoading(false);
    }
    fetchData();
  }, [filter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">LLM & Clinical NLP Audit Dashboard</h2>
          <div className="flex flex-wrap gap-2 mt-4">
            <Input placeholder="User Email" value={filter.user} onChange={e => setFilter(f => ({ ...f, user: e.target.value }))} />
            <Input placeholder="Model" value={filter.model} onChange={e => setFilter(f => ({ ...f, model: e.target.value }))} />
            <Input placeholder="Provider" value={filter.provider} onChange={e => setFilter(f => ({ ...f, provider: e.target.value }))} />
            <Input placeholder="Action" value={filter.action} onChange={e => setFilter(f => ({ ...f, action: e.target.value }))} />
            <Input type="date" value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-lg">Loading interactions...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <Tr>
                    <Th></Th>
                    <Th>User</Th>
                    <Th>Patient</Th>
                    <Th>Action</Th>
                    <Th>Model</Th>
                    <Th>Provider</Th>
                    <Th>Tokens</Th>
                    <Th>Duration (ms)</Th>
                    <Th>Confidence</Th>
                    <Th>Date</Th>
                  </Tr>
                </THead>
                <TBody>
                  {interactions.map(row => (
                    <React.Fragment key={row.id}>
                      <Tr>
                        <Td>
                          <button
                            aria-label="Expand row"
                            className="text-blue-600 hover:underline"
                            onClick={() => setExpanded(e => ({ ...e, [row.id]: !e[row.id] }))}
                          >
                            {expanded[row.id] ? '▼' : '▶'}
                          </button>
                        </Td>
                        <Td>{row.user_email}</Td>
                        <Td>{row.patient_first_name} {row.patient_last_name}</Td>
                        <Td>{row.action}</Td>
                        <Td>{row.model}</Td>
                        <Td>{row.provider}</Td>
                        <Td>{row.tokens}</Td>
                        <Td>{row.duration}</Td>
                        <Td>{row.confidence_score?.toFixed(2) ?? '-'}</Td>
                        <Td>{format(new Date(row.created_at), 'yyyy-MM-dd HH:mm')}</Td>
                      </Tr>
                      {expanded[row.id] && (
                        <Tr>
                          <Td colSpan={10} className="bg-gray-50 dark:bg-gray-900 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-1">NLP Results</h4>
                                {row.nlp_results ? (
                                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-x-auto">
                                    {JSON.stringify(row.nlp_results, null, 2)}
                                  </pre>
                                ) : (
                                  <span className="text-gray-500">No NLP data</span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">Error Log</h4>
                                {row.error_log ? (
                                  <pre className="text-xs bg-red-100 dark:bg-red-900 rounded p-2 overflow-x-auto">
                                    {row.error_log}
                                  </pre>
                                ) : (
                                  <span className="text-gray-500">No errors</span>
                                )}
                                <h4 className="font-semibold mt-4 mb-1">Traceability</h4>
                                <div className="text-xs">
                                  <div>Security Hash: <span className="break-all">{row.security_hash || '-'}</span></div>
                                  <div>Interaction ID: <span className="break-all">{row.id}</span></div>
                                </div>
                              </div>
                            </div>
                          </Td>
                        </Tr>
                      )}
                    </React.Fragment>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditDashboard;
