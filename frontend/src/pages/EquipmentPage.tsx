import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  api,
  getErrorMessage,
  listEquipment,
  getEquipmentAssignments,
  assignEquipment,
  returnEquipment,
  deleteEquipmentAssignment,
  EquipmentItem,
  EquipmentAssignment,
} from '@/lib/api';
import {
  PageHeader,
  Button,
  Table,
  Badge,
  Spinner,
  EmptyState,
  statusColor,
  Field,
  inputClass,
  Card,
  InlineAlert,
} from '@/components/ui';

const CATEGORIES = ['BALL', 'UNIFORM', 'PROTECTIVE_GEAR', 'TRAINING_TOOL', 'MATCH_GEAR', 'MEDICAL', 'ELECTRONIC', 'OFFICE', 'OTHER'];
const CONDITIONS = ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'];
const STATUSES = ['AVAILABLE', 'ISSUED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED'];

const EMPTY_FORM = {
  name: '',
  category: 'BALL',
  assetNumber: '',
  serialNumber: '',
  quantity: 1,
  condition: 'GOOD',
  status: 'AVAILABLE',
  sportId: '',
  storageLocation: '',
  purchasedDate: '',
  purchaseCost: '',
  notes: '',
};

interface SportOption {
  id: string;
  name: string;
}

interface AthleteOption {
  id: string;
  fullName: string;
}

interface TeamOption {
  id: string;
  name: string;
}

export default function EquipmentPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EquipmentItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [assignItem, setAssignItem] = useState<EquipmentItem | null>(null);
  const [assignForm, setAssignForm] = useState({ assignedToType: 'ATHLETE', athleteId: '', teamId: '', quantity: 1, dueDate: '', notes: '' });
  const [assignError, setAssignError] = useState('');
  const [trackingItem, setTrackingItem] = useState<EquipmentItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['equipment', search, categoryFilter, statusFilter],
    queryFn: () =>
      listEquipment({
        search: search || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        pageSize: 100,
      }),
  });

  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports')).data.data as SportOption[],
  });

  const { data: athletes } = useQuery({
    queryKey: ['athlete-options'],
    queryFn: async () => (await api.get('/athletes', { params: { pageSize: 500 } })).data.data as AthleteOption[],
    enabled: !!assignItem,
  });

  const { data: teams } = useQuery({
    queryKey: ['team-options'],
    queryFn: async () => (await api.get('/teams', { params: { isActive: true } })).data.data as TeamOption[],
    enabled: !!assignItem,
  });

  const { data: assignments } = useQuery({
    queryKey: ['equipment-assignments', trackingItem?.id],
    queryFn: () => getEquipmentAssignments(trackingItem!.id),
    enabled: !!trackingItem,
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['equipment'] });
    qc.invalidateQueries({ queryKey: ['equipment-assignments'] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        assetNumber: form.assetNumber || null,
        serialNumber: form.serialNumber || null,
        quantity: Number(form.quantity),
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
        purchasedDate: form.purchasedDate || null,
        sportId: form.sportId || null,
        storageLocation: form.storageLocation || null,
        notes: form.notes || null,
      };
      if (editing) {
        await api.patch(`/equipment/${editing.id}`, payload);
      } else {
        await api.post('/equipment', payload);
      }
    },
    onSuccess: () => {
      invalidateAll();
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/equipment/${id}`);
    },
    onSuccess: () => invalidateAll(),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const assign = useMutation({
    mutationFn: async () => {
      if (!assignItem) return;
      await assignEquipment(assignItem.id, {
        assignedToType: assignForm.assignedToType,
        athleteId: assignForm.assignedToType === 'ATHLETE' ? assignForm.athleteId : null,
        teamId: assignForm.assignedToType === 'TEAM' ? assignForm.teamId : null,
        quantity: Number(assignForm.quantity),
        dueDate: assignForm.dueDate || null,
        notes: assignForm.notes || null,
      });
    },
    onSuccess: () => {
      invalidateAll();
      setAssignItem(null);
      setAssignError('');
      setAssignForm({ assignedToType: 'ATHLETE', athleteId: '', teamId: '', quantity: 1, dueDate: '', notes: '' });
    },
    onError: (err) => setAssignError(getErrorMessage(err)),
  });

  const doReturn = useMutation({
    mutationFn: async (a: EquipmentAssignment) => {
      await returnEquipment(a.id, { conditionOnReturn: null, notes: 'Returned' });
    },
    onSuccess: () => invalidateAll(),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const unassign = useMutation({
    mutationFn: async (id: string) => {
      await deleteEquipmentAssignment(id);
    },
    onSuccess: () => invalidateAll(),
    onError: (err) => setError(getErrorMessage(err)),
  });

  function startEdit(item: EquipmentItem) {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      assetNumber: item.assetNumber ?? '',
      serialNumber: item.serialNumber ?? '',
      quantity: item.quantity,
      condition: item.condition,
      status: item.status,
      sportId: item.sportId ?? '',
      storageLocation: item.storageLocation ?? '',
      purchasedDate: item.purchasedDate ? item.purchasedDate.slice(0, 10) : '',
      purchaseCost: item.purchaseCost ? String(item.purchaseCost) : '',
      notes: item.notes ?? '',
    });
    setShowForm(true);
    setError('');
  }

  function set<K extends keyof typeof form>(key: K, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const items = data?.items ?? [];
  const activeAssignments = assignments?.filter((a) => !a.returnedAt) ?? [];

  return (
    <div>
      <PageHeader
        title="Department Equipment"
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(EMPTY_FORM);
              setShowForm((v) => !v);
            }}
          >
            {showForm ? 'Close' : 'Add Item'}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <h3 className="font-semibold text-gray-900">{editing ? `Edit ${editing.name}` : 'Add Equipment Item'}</h3>
            {error && <InlineAlert type="error" message={error} />}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Name" required>
                <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </Field>
              <Field label="Asset Number">
                <input className={inputClass} value={form.assetNumber} onChange={(e) => set('assetNumber', e.target.value)} placeholder="e.g. EQ-001" />
              </Field>
              <Field label="Serial Number">
                <input className={inputClass} value={form.serialNumber} onChange={(e) => set('serialNumber', e.target.value)} />
              </Field>
              <Field label="Category" required>
                <select className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Quantity" required>
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => set('quantity', Number(e.target.value))}
                  required
                />
              </Field>
              <Field label="Sport">
                <select className={inputClass} value={form.sportId} onChange={(e) => set('sportId', e.target.value)}>
                  <option value="">Department (all sports)</option>
                  {sports?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Condition">
                <select className={inputClass} value={form.condition} onChange={(e) => set('condition', e.target.value)}>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Storage Location">
                <input className={inputClass} value={form.storageLocation} onChange={(e) => set('storageLocation', e.target.value)} placeholder="e.g. Sports store, Room 3" />
              </Field>
              <Field label="Purchased Date">
                <input className={inputClass} type="date" value={form.purchasedDate} onChange={(e) => set('purchasedDate', e.target.value)} />
              </Field>
              <Field label="Purchase Cost (UGX)">
                <input className={inputClass} type="number" min={0} value={form.purchaseCost} onChange={(e) => set('purchaseCost', e.target.value)} />
              </Field>
              <Field label="Notes">
                <input className={inputClass} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit">{editing ? 'Save Changes' : 'Save Item'}</Button>
            </div>
          </form>
        </Card>
      )}

      {assignItem && (
        <Card className="mb-6">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              assign.mutate();
            }}
          >
            <h3 className="font-semibold text-gray-900">Assign "{assignItem.name}"</h3>
            {assignError && <InlineAlert type="error" message={assignError} />}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Assign To" required>
                <select
                  className={inputClass}
                  value={assignForm.assignedToType}
                  onChange={(e) => setAssignForm((f) => ({ ...f, assignedToType: e.target.value }))}
                >
                  <option value="ATHLETE">Athlete</option>
                  <option value="TEAM">Team</option>
                </select>
              </Field>
              {assignForm.assignedToType === 'ATHLETE' ? (
                <Field label="Athlete" required>
                  <select
                    className={inputClass}
                    value={assignForm.athleteId}
                    onChange={(e) => setAssignForm((f) => ({ ...f, athleteId: e.target.value }))}
                    required
                  >
                    <option value="">Select athlete…</option>
                    {athletes?.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field label="Team" required>
                  <select
                    className={inputClass}
                    value={assignForm.teamId}
                    onChange={(e) => setAssignForm((f) => ({ ...f, teamId: e.target.value }))}
                    required
                  >
                    <option value="">Select team…</option>
                    {teams?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Quantity" required>
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  value={assignForm.quantity}
                  onChange={(e) => setAssignForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                  required
                />
              </Field>
              <Field label="Due Date">
                <input
                  className={inputClass}
                  type="date"
                  value={assignForm.dueDate}
                  onChange={(e) => setAssignForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </Field>
              <Field label="Notes">
                <input
                  className={inputClass}
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAssignItem(null)}>
                Cancel
              </Button>
              <Button type="submit">Assign</Button>
            </div>
          </form>
        </Card>
      )}

      {trackingItem && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Assignments — {trackingItem.name}</h3>
            <Button variant="secondary" onClick={() => setTrackingItem(null)}>
              Close
            </Button>
          </div>
          {activeAssignments.length === 0 && !assignments?.length ? (
            <EmptyState message="No assignments recorded for this item." />
          ) : (
            <Table headers={['Assigned To', 'Quantity', 'Assigned', 'Due', 'Status', 'Actions']}>
              {(assignments ?? []).map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">
                    {a.assignedToType === 'ATHLETE' ? a.athlete?.fullName ?? 'Athlete' : a.team?.name ?? 'Team'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{a.quantity}</td>
                  <td className="px-4 py-2.5 text-gray-600">{new Date(a.assignedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-gray-600">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-2.5">
                    <Badge color={a.returnedAt ? 'gray' : 'green'}>{a.returnedAt ? 'Returned' : 'Issued'}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      {!a.returnedAt && (
                        <button
                          className="text-sm text-primary font-medium hover:underline"
                          onClick={() => {
                            if (window.confirm(`Mark this assignment as returned?`)) doReturn.mutate(a);
                          }}
                        >
                          Return
                        </button>
                      )}
                      <button
                        className="text-sm text-danger font-medium hover:underline"
                        onClick={() => {
                          if (window.confirm('Remove this assignment?')) unassign.mutate(a.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className={`${inputClass} max-w-xs`}
          placeholder="Search name, asset or serial…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={`${inputClass} max-w-[180px]`} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select className={`${inputClass} max-w-[180px]`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !items.length ? (
        <EmptyState message="No equipment found. Register your first item." />
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-x-auto">
          <Table headers={['Asset #', 'Name', 'Category', 'Qty', 'Condition', 'Status', 'Sport', 'Location', 'Actions']}>
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-mono text-sm text-gray-900">{item.assetNumber ?? '—'}</td>
                <td className="px-4 py-2.5 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{item.category.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2.5 text-gray-600">{item.quantity}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(item.condition)}>{item.condition}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(item.status)}>{item.status.replace(/_/g, ' ')}</Badge>
                </td>
                <td className="px-4 py-2.5 text-gray-600">{item.sport?.name ?? 'Department'}</td>
                <td className="px-4 py-2.5 text-gray-600">{item.storageLocation ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2 whitespace-nowrap">
                    <button className="text-sm text-primary font-medium hover:underline" onClick={() => setAssignItem(item)}>
                      Assign
                    </button>
                    <button className="text-sm text-primary font-medium hover:underline" onClick={() => setTrackingItem(item)}>
                      Track
                    </button>
                    <button className="text-sm text-primary font-medium hover:underline" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button
                      className="text-sm text-danger font-medium hover:underline"
                      onClick={() => {
                        if (window.confirm(`Delete ${item.name}?`)) remove.mutate(item.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
