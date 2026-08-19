import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api, { downloadFile } from '@/lib/api';
import { PageHeader, Card, Table, Spinner, EmptyState, Button, Field, inputClass, statusColor, Badge } from '@/components/ui';

export default function ReportsPage() {
  const [report, setReport] = useState('overview');
  const [season, setSeason] = useState('2025/2026');

  const { data: overview } = useQuery({
    queryKey: ['reports', 'overview'],
    queryFn: async () => (await api.get('/reports/overview')).data.data,
    enabled: report === 'overview',
  });

  const { data: academic, isLoading: loadingAcademic } = useQuery({
    queryKey: ['reports', 'academic', season],
    queryFn: async () =>
      (await api.get('/reports/academic-standing', { params: { season } })).data.data,
    enabled: report === 'academic',
  });

  const { data: scholarships } = useQuery({
    queryKey: ['reports', 'scholarships'],
    queryFn: async () => (await api.get('/reports/scholarships')).data.data,
    enabled: report === 'scholarships',
  });

  const { data: athletes, isLoading: loadingAthletes } = useQuery({
    queryKey: ['reports', 'athletes'],
    queryFn: async () => (await api.get('/reports/athletes')).data.data,
    enabled: report === 'athletes',
  });

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'athletes', label: 'Athletes' },
    { key: 'academic', label: 'Academic Standing' },
    { key: 'scholarships', label: 'Scholarships' },
  ];

  return (
    <div>
      <PageHeader title="Reports & Analytics" />
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${
              report === t.key
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted hover:text-gray-900'
            }`}
            onClick={() => setReport(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {report === 'overview' &&
        (overview ? (
          <>
            <div className="mb-6 flex gap-2">
              <Button variant="secondary" onClick={() => downloadFile('/reports/overview?format=pdf', 'department-overview.pdf')}>
                Download PDF
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-sm text-muted">Total Athletes</div>
                <div className="text-2xl font-semibold mt-1">{overview.totalAthletes}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted">Active Teams</div>
                <div className="text-2xl font-semibold mt-1">{overview.activeTeams}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted">Active Scholarships</div>
                <div className="text-2xl font-semibold mt-1">{overview.activeScholarships}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted">Documents</div>
                <div className="text-2xl font-semibold mt-1">{overview.totalDocuments}</div>
              </Card>
            </div>
          </>
        ) : (
          <Spinner />
        ))}

      {report === 'athletes' && (
        <>
          <div className="mb-4 flex gap-2">
            <Button variant="secondary" onClick={() => downloadFile('/reports/athletes?format=csv', 'athletes.csv')}>
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => downloadFile('/reports/athletes?format=pdf', 'athletes.pdf')}>
              Export PDF
            </Button>
          </div>
          {loadingAthletes ? (
            <Spinner />
          ) : !athletes?.athletes?.length ? (
            <EmptyState message="No athlete data." />
          ) : (
            <div className="bg-surface border border-border rounded-lg">
              <Table headers={['Name', 'Reg. No.', 'Programme', 'Sports', 'GPA', 'Standing']}>
                {athletes.athletes.map((a: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-2.5 text-gray-600">{a.registrationNumber}</td>
                    <td className="px-4 py-2.5 text-gray-600">{a.programme || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600">{a.sports || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600">{a.gpa || '—'}</td>
                    <td className="px-4 py-2.5">
                      {a.academicStanding && (
                        <Badge color={statusColor(a.academicStanding)}>{a.academicStanding}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
        </>
      )}

      {report === 'academic' && (
        <>
            <div className="flex gap-2 items-end flex-wrap">
              <div className="max-w-[200px]">
                <Field label="Season">
                  <input className={inputClass} value={season} onChange={(e) => setSeason(e.target.value)} />
                </Field>
              </div>
              <Button variant="secondary" onClick={() => downloadFile(`/reports/academic-standing?season=${encodeURIComponent(season)}&format=csv`, 'academic-standing.csv')}>
                Export CSV
              </Button>
              <Button variant="secondary" onClick={() => downloadFile(`/reports/academic-standing?season=${encodeURIComponent(season)}&format=pdf`, 'academic-standing.pdf')}>
                Export PDF
              </Button>
            </div>
          {loadingAcademic ? (
            <Spinner />
          ) : !academic?.records?.length ? (
            <EmptyState message="No academic records for this season." />
          ) : (
            <div className="bg-surface border border-border rounded-lg">
              <Table headers={['Athlete', 'Semester', 'GPA', 'Failed', 'Standing']}>
                {academic.records.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.semester}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.gpa || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.failedUnits}</td>
                    <td className="px-4 py-2.5">
                      <Badge color={statusColor(r.standing)}>{r.standing}</Badge>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
        </>
      )}

      {report === 'scholarships' &&
        (scholarships ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-muted">Total</div>
              <div className="text-2xl font-semibold mt-1">{scholarships.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted">Active</div>
              <div className="text-2xl font-semibold mt-1">{scholarships.active}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted">Expiring 30 days</div>
              <div className="text-2xl font-semibold mt-1">{scholarships.expiringWithin30Days}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted">Expiring 90 days</div>
              <div className="text-2xl font-semibold mt-1">{scholarships.expiringWithin90Days}</div>
            </Card>
          </div>
        ) : (
          <Spinner />
        ))}
    </div>
  );
}
