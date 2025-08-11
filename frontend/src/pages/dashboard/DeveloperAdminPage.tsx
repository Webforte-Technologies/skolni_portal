import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import { api } from '../../services/apiClient';
import SparklineStatCard from '../../components/dashboard/SparklineStatCard';

const DeveloperAdminPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [flags, setFlags] = useState<any[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [schools, setSchools] = useState<any>({ data: [], total: 0 });
  const [quality, setQuality] = useState<any>(null);
  const [modQueue, setModQueue] = useState<any[]>([]);
  const [modTotal, setModTotal] = useState(0);
  const [modPage, setModPage] = useState(0);
  const [modStatus, setModStatus] = useState<'pending'|'approved'|'rejected'>('pending');
  const [modEdit, setModEdit] = useState<{ id: string; notes: string; score: string } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const pageSize = 20;

  const fetchHealth = async () => {
    const res = await api.get<any>('/admin/system/health');
    setHealth(res.data.data);
  };

  const fetchMetrics = async () => {
    const res = await api.get<any>('/admin/system/metrics');
    setMetrics(res.data.data);
  };

  const fetchFlags = async () => {
    const res = await api.get<any>('/admin/feature-flags');
    setFlags(res.data.data || []);
  };

  const fetchCredits = async () => {
    const res = await api.get<any>('/admin/credits/analytics');
    setCredits(res.data.data);
  };

  const fetchSchools = async () => {
    const res = await api.get<any>('/admin/schools?limit=10&offset=0');
    setSchools(res.data.data);
  };

  const fetchQuality = async () => {
    const res = await api.get<any>('/admin/quality/metrics');
    setQuality(res.data.data);
  };

  const modPageSize = 10;
  const fetchModerationQueue = async () => {
    const res = await api.get<any>(`/admin/moderation/queue?status=${modStatus}&limit=${modPageSize}&offset=${modPage * modPageSize}`);
    setModQueue(res.data.data.data || []);
    setModTotal(res.data.data.total || 0);
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await api.get<any>(`/admin/users?limit=${pageSize}&offset=${userPage * pageSize}&q=${encodeURIComponent(userQuery)}`);
      setUsers(res.data.data.data);
      setUsersTotal(res.data.data.total);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchMetrics();
    fetchFlags();
    fetchCredits();
    fetchSchools();
    fetchQuality();
  }, []);

  useEffect(() => {
    const i = setInterval(() => { fetchHealth(); fetchMetrics(); }, 15000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => { fetchUsers(); }, [userPage]);
  useEffect(() => { fetchModerationQueue(); }, [modPage, modStatus]);

  const toggleFlag = async (key: string, value: boolean) => {
    await api.put(`/admin/feature-flags/${key}`, { value });
    fetchFlags();
  };

  const totalPages = useMemo(() => Math.ceil(usersTotal / pageSize), [usersTotal]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Developer Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="System Health">
          <div className="text-sm space-y-1">
            <div>Status: {health?.status || '...'}</div>
            <div>Uptime: {health?.process?.uptime_s}s</div>
            <div>DB RTT: {health?.db?.roundtrip_ms} ms</div>
            <div>Node: {health?.process?.node}</div>
          </div>
        </Card>
        <Card title="Metrics">
          <div className="text-sm space-y-1">
            <div>Total requests: {metrics?.total_requests ?? 0}</div>
            <div>Avg resp: {metrics?.avg_response_ms ?? 0} ms</div>
          </div>
        </Card>
        <Card title="Feature Flags">
          <div className="space-y-2">
            {flags.map(f => (
              <div key={f.key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{f.key}</div>
                  <div className="text-xs text-neutral-500">{f.description}</div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" checked={!!f.value} onChange={() => toggleFlag(f.key, !f.value)} />
                  <div className={`w-10 h-5 rounded-full transition ${f.value ? 'bg-green-500' : 'bg-neutral-300'}`}>
                    <div className={`h-5 w-5 bg-white rounded-full shadow transform transition ${f.value ? 'translate-x-5' : ''}`}></div>
                  </div>
                </label>
              </div>
            ))}
            {!flags.length && <div className="text-sm text-neutral-500">No flags</div>}
          </div>
        </Card>
      </div>

      <Card title="Credits Analytics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-neutral-500">Total Balance</div>
            <div className="text-2xl font-semibold">{credits?.totals?.balance ?? 0}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-500">Total Purchased</div>
            <div className="text-2xl font-semibold">{credits?.totals?.purchased ?? 0}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-500">Total Used</div>
            <div className="text-2xl font-semibold">{credits?.totals?.used ?? 0}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium mb-2">Top Users (usage)</div>
            <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-800">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-900"><tr><th className="p-2 text-left">User</th><th className="p-2 text-right">Used</th></tr></thead>
                <tbody>
                  {(credits?.top_users || []).map((u:any) => (
                    <tr key={u.id} className="border-t border-neutral-200 dark:border-neutral-800">
                      <td className="p-2">{u.first_name} {u.last_name} <span className="text-neutral-500">({u.email})</span></td>
                      <td className="p-2 text-right">{u.used}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Top Schools (usage)</div>
            <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-800">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-900"><tr><th className="p-2 text-left">School</th><th className="p-2 text-right">Used</th></tr></thead>
                <tbody>
                  {(credits?.top_schools || []).map((s:any) => (
                    <tr key={s.id} className="border-t border-neutral-200 dark:border-neutral-800">
                      <td className="p-2">{s.name}</td>
                      <td className="p-2 text-right">{s.used}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Quality Metrics">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SparklineStatCard title="Pending" value={(quality?.counts || []).find((c:any)=>c.moderation_status==='pending')?.count || 0} data={(quality?.trends?.d7||[]).map((d:any)=>Number(d.total))} />
          <SparklineStatCard title="Approved" value={(quality?.counts || []).find((c:any)=>c.moderation_status==='approved')?.count || 0} data={(quality?.trends?.d7||[]).map((d:any)=>Number(d.total))} color="#22c55e" />
          <SparklineStatCard title="Rejected" value={(quality?.counts || []).find((c:any)=>c.moderation_status==='rejected')?.count || 0} data={(quality?.trends?.d7||[]).map((d:any)=>Number(d.total))} color="#ef4444" />
          <Card>
            <div className="text-sm text-neutral-500">Avg Quality</div>
            <div className="text-2xl font-semibold">{quality?.avg_overall ?? '–'}</div>
          </Card>
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">By file type</div>
          <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-800">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900"><tr><th className="p-2 text-left">Type</th><th className="p-2 text-right">Avg Quality</th><th className="p-2 text-right">Total</th></tr></thead>
              <tbody>
                {(quality?.by_type || []).map((t:any)=>(
                  <tr key={t.file_type} className="border-t border-neutral-200 dark:border-neutral-800">
                    <td className="p-2">{t.file_type}</td>
                    <td className="p-2 text-right">{t.avg_quality ?? '–'}</td>
                    <td className="p-2 text-right">{t.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card title="Moderation Queue">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm">Status</label>
          <select className="border rounded p-1" value={modStatus} onChange={e => { setModStatus(e.target.value as any); setModPage(0); }}>
            {['pending','approved','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-800">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">School</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {modQueue.map(item => (
                <React.Fragment key={item.id}>
                  <tr className="border-t border-neutral-200 dark:border-neutral-800">
                    <td className="p-2">{item.title}</td>
                    <td className="p-2">{item.file_type}</td>
                    <td className="p-2">{item.first_name} {item.last_name} <span className="text-neutral-500">({item.email})</span></td>
                    <td className="p-2">{item.school_name || '-'}</td>
                    <td className="p-2">{new Date(item.created_at).toLocaleString()}</td>
                    <td className="p-2">
                      {modStatus==='pending' ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setModEdit({ id: item.id, notes: '', score: '' })}>Decide</Button>
                        </div>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                  </tr>
                  {modEdit?.id === item.id && (
                    <tr className="bg-neutral-50 dark:bg-neutral-900">
                      <td colSpan={6} className="p-3">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                          <div className="md:col-span-3">
                            <label className="block text-sm mb-1">Notes (optional)</label>
                            <textarea className="w-full border rounded p-2 text-sm" rows={2} value={modEdit.notes} onChange={e => setModEdit({ ...modEdit, notes: e.target.value })} />
                          </div>
                          <div>
                            <InputField name="score" label="Quality score (0-10)" type="number" value={modEdit.score} onChange={e => setModEdit({ ...modEdit, score: e.target.value })} />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={async ()=>{ await api.post(`/admin/moderation/${item.id}/decision`, { status: 'approved', notes: modEdit?.notes || undefined, quality_score: modEdit?.score ? Number(modEdit.score) : undefined }); setModEdit(null); fetchModerationQueue(); fetchQuality(); }}>Approve</Button>
                            <Button size="sm" variant="secondary" onClick={async ()=>{ await api.post(`/admin/moderation/${item.id}/decision`, { status: 'rejected', notes: modEdit?.notes || undefined, quality_score: modEdit?.score ? Number(modEdit.score) : undefined }); setModEdit(null); fetchModerationQueue(); fetchQuality(); }}>Reject</Button>
                            <Button size="sm" variant="danger" onClick={()=> setModEdit(null)}>Cancel</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-3 text-sm">
          <div>Total: {modTotal}</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" disabled={modPage<=0} onClick={() => setModPage(p => Math.max(0, p-1))}>Prev</Button>
            <div>{modPage+1} / {Math.max(1, Math.ceil(modTotal / modPageSize))}</div>
            <Button variant="secondary" disabled={(modPage+1)>=Math.ceil(modTotal / modPageSize)} onClick={() => setModPage(p => p+1)}>Next</Button>
          </div>
        </div>
      </Card>

      <Card title="School Management (read-only)">
        <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-800">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">City</th>
                <th className="p-2 text-left">Users</th>
                <th className="p-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {(schools?.data || []).map((s:any) => (
                <tr key={s.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.city || '-'}</td>
                  <td className="p-2">{s.users_count || 0}</td>
                  <td className="p-2">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="User Management">
        <div className="flex items-center gap-2 mb-3">
          <InputField name="search" label="Search" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Name or email" />
          <Button onClick={() => { setUserPage(0); fetchUsers(); }} isLoading={isLoadingUsers}>Search</Button>
        </div>
        <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-800">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-left">Credits</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="p-2">{u.first_name} {u.last_name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">
                    <select className="bg-transparent border rounded p-1" value={u.role} onChange={async (e) => {
                      const role = e.target.value;
                      await api.put(`/admin/users/${u.id}`, { role });
                      fetchUsers();
                    }}>
                      {['platform_admin','school_admin','teacher_school','teacher_individual'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only" checked={!!u.is_active} onChange={async () => { await api.put(`/admin/users/${u.id}`, { is_active: !u.is_active }); fetchUsers(); }} />
                      <div className={`w-10 h-5 rounded-full transition ${u.is_active ? 'bg-green-500' : 'bg-neutral-300'}`}>
                        <div className={`h-5 w-5 bg-white rounded-full shadow transform transition ${u.is_active ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <Button size="sm" onClick={async () => { const amt = Number(prompt('Add credits amount')); if (amt>0) { await api.post(`/admin/users/${u.id}/credits`, { type: 'add', amount: amt }); fetchUsers(); }}}>Add</Button>
                      <Button size="sm" variant="secondary" onClick={async () => { const amt = Number(prompt('Deduct credits amount')); if (amt>0) { await api.post(`/admin/users/${u.id}/credits`, { type: 'deduct', amount: amt }); fetchUsers(); }}}>Deduct</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-3 text-sm">
          <div>Total: {usersTotal}</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" disabled={userPage<=0} onClick={() => setUserPage(p => Math.max(0, p-1))}>Prev</Button>
            <div>{userPage+1} / {Math.max(1,totalPages)}</div>
            <Button variant="secondary" disabled={(userPage+1)>=totalPages} onClick={() => setUserPage(p => p+1)}>Next</Button>
          </div>
        </div>
      </Card>

      <Card title="API Testing">
        <ApiTester />
      </Card>
    </div>
  );
};

const ApiTester: React.FC = () => {
  const [method, setMethod] = useState<'GET'|'POST'|'PUT'|'DELETE'>('GET');
  const [path, setPath] = useState('/admin/ping');
  const [body, setBody] = useState('{}');
  const [resp, setResp] = useState<any>(null);

  const send = async () => {
    try {
      const url = path.startsWith('/api') ? path.replace('/api','') : path;
      if (method === 'GET' || method === 'DELETE') {
        const fn = method === 'GET' ? api.get : api.delete;
        const r = await fn<any>(url);
        setResp(r.data);
      } else {
        const data = body ? JSON.parse(body) : undefined;
        const fn = method === 'POST' ? api.post : api.put;
        const r = await fn<any>(url, data);
        setResp(r.data);
      }
    } catch (e: any) {
      setResp({ error: e?.response?.data || String(e) });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <select className="border rounded p-2" value={method} onChange={e => setMethod(e.target.value as any)}>
          {['GET','POST','PUT','DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input className="flex-1 border rounded p-2" value={path} onChange={e => setPath(e.target.value)} placeholder="/admin/..." />
        <Button onClick={send}>Send</Button>
      </div>
      {(method==='POST'||method==='PUT') && (
        <textarea className="w-full border rounded p-2 font-mono text-xs" rows={6} value={body} onChange={e => setBody(e.target.value)} />
      )}
      <pre className="bg-neutral-950 text-neutral-100 p-3 rounded text-xs overflow-auto max-h-80">{JSON.stringify(resp, null, 2)}</pre>
    </div>
  );
};

export default DeveloperAdminPage;


