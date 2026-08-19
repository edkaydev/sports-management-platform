import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Trophy, Users, Calendar, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { tournamentService, type TournamentData, type TournamentParticipant, type TournamentMatch } from '@/lib/services/tournament.service';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

// ─── Step indicators ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Event Details', icon: Trophy },
  { id: 2, label: 'Participants', icon: Users },
  { id: 3, label: 'Schedule', icon: Calendar },
  { id: 4, label: 'Confirm', icon: CheckCircle2 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState extends Omit<TournamentData, 'participants' | 'matches'> {}

const EMPTY_FORM: FormState = {
  name: '',
  type: 'TOURNAMENT',
  level: 'UNIVERSITY',
  sportId: '',
  venue: '',
  startDate: '',
  endDate: '',
  format: 'KNOCKOUT',
  description: '',
  maxTeams: undefined,
  maxParticipants: undefined,
  registrationDeadline: '',
  organizer: '',
  hostInstitution: '',
};

// ─── Helper: generate round-robin fixtures ─────────────────────────────────

function generateRoundRobin(teamIds: string[]): Array<{ home: string; away: string; round: number }> {
  const teams = [...teamIds];
  if (teams.length % 2 !== 0) teams.push('BYE');
  const n = teams.length;
  const rounds: Array<{ home: string; away: string; round: number }> = [];

  for (let r = 0; r < n - 1; r++) {
    for (let i = 0; i < n / 2; i++) {
      const home = teams[i];
      const away = teams[n - 1 - i];
      if (home !== 'BYE' && away !== 'BYE') {
        rounds.push({ home, away, round: r + 1 });
      }
    }
    // Rotate teams (keep first fixed)
    teams.splice(1, 0, teams.pop()!);
  }
  return rounds;
}

// ─── Helper: generate knockout fixtures ────────────────────────────────────

function generateKnockout(teamIds: string[]): Array<{ home: string; away: string; round: number }> {
  const fixtures: Array<{ home: string; away: string; round: number }> = [];
  let round = 1;
  let teams = [...teamIds];

  while (teams.length > 1) {
    const nextRound: string[] = [];
    for (let i = 0; i < teams.length - 1; i += 2) {
      fixtures.push({ home: teams[i], away: teams[i + 1], round });
      nextRound.push(`winner_r${round}_m${Math.floor(i / 2) + 1}`);
    }
    if (teams.length % 2 !== 0) nextRound.push(teams[teams.length - 1]);
    teams = nextRound;
    round++;
  }
  return fixtures;
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function TournamentCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For adding participants
  const [participantType, setParticipantType] = useState<'TEAM' | 'INDIVIDUAL'>('TEAM');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedAthleteId, setSelectedAthleteId] = useState('');

  // For match scheduling
  const [matchDate, setMatchDate] = useState(form.startDate || '');
  const [matchVenue, setMatchVenue] = useState(form.venue || '');

  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports')).data as any[],
  });

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await api.get('/teams')).data as any[],
  });

  const { data: athletes } = useQuery({
    queryKey: ['athletes-list'],
    queryFn: async () => {
      const res = await api.get('/athletes', { params: { pageSize: 200 } });
      const d = res.data;
      return Array.isArray(d) ? d : d?.athletes ?? d?.data ?? [];
    },
  });

  // Filter teams by selected sport
  const filteredTeams = form.sportId
    ? (teams ?? []).filter((t: any) => t.sportId === form.sportId)
    : (teams ?? []);

  // ── Step 1 handlers ────────────────────────────────────────────────────────

  function canProceedStep1() {
    return form.name.trim().length > 0;
  }

  // ── Step 2 handlers ────────────────────────────────────────────────────────

  function addParticipant() {
    if (participantType === 'TEAM' && !selectedTeamId) return;
    if (participantType === 'INDIVIDUAL' && !selectedAthleteId) return;

    const alreadyAdded =
      participantType === 'TEAM'
        ? participants.some((p) => p.teamId === selectedTeamId)
        : participants.some((p) => p.athleteId === selectedAthleteId);

    if (alreadyAdded) {
      toast.warning('Already added');
      return;
    }

    setParticipants((prev) => [
      ...prev,
      {
        participantType,
        teamId: participantType === 'TEAM' ? selectedTeamId : undefined,
        athleteId: participantType === 'INDIVIDUAL' ? selectedAthleteId : undefined,
      },
    ]);
    setSelectedTeamId('');
    setSelectedAthleteId('');
  }

  function removeParticipant(idx: number) {
    setParticipants((prev) => prev.filter((_, i) => i !== idx));
  }

  function getParticipantLabel(p: TournamentParticipant) {
    if (p.participantType === 'TEAM') {
      return (teams ?? []).find((t: any) => t.id === p.teamId)?.name ?? p.teamId;
    }
    const a = (athletes ?? []).find((a: any) => a.id === p.athleteId);
    return a ? `${a.fullName} (${a.registrationNumber ?? ''})` : p.athleteId;
  }

  // ── Step 3 handlers ────────────────────────────────────────────────────────

  function autoGenerateFixtures() {
    const teamIds = participants
      .filter((p) => p.participantType === 'TEAM' && p.teamId)
      .map((p) => p.teamId!);

    if (teamIds.length < 2) {
      toast.error('Need at least 2 teams to generate fixtures');
      return;
    }

    const fixtures =
      form.format === 'ROUND_ROBIN'
        ? generateRoundRobin(teamIds)
        : generateKnockout(teamIds);

    const defaultDate = matchDate || form.startDate || new Date().toISOString().slice(0, 10);

    setMatches(
      fixtures.map((f, idx) => ({
        homeTeamId: f.home,
        awayTeamId: f.away,
        scheduledDate: defaultDate,
        venue: matchVenue || form.venue || '',
        round: `Round ${f.round}`,
        matchNumber: idx + 1,
        matchType: 'TOURNAMENT',
      }))
    );
    toast.success(`Generated ${fixtures.length} fixture(s)`);
  }

  function updateMatch(idx: number, field: keyof TournamentMatch, value: string) {
    setMatches((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  }

  function removeMatch(idx: number) {
    setMatches((prev) => prev.filter((_, i) => i !== idx));
  }

  function addBlankMatch() {
    setMatches((prev) => [
      ...prev,
      {
        scheduledDate: matchDate || form.startDate || new Date().toISOString().slice(0, 10),
        venue: matchVenue || form.venue || '',
        round: '',
        matchNumber: prev.length + 1,
        matchType: 'TOURNAMENT',
      },
    ]);
  }


  // ── Final submit ─────────────────────────────────────────────────────────

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      // 1. Create the event
      const event = await tournamentService.create(form);
      setCreatedEventId(event.id ?? event.data?.id);
      const eventId: string = event.id ?? event.data?.id;

      // 2. Add participants
      if (participants.length > 0) {
        const pResults = await tournamentService.addParticipants(eventId, participants);
        const failed = pResults.filter((r) => !r.success);
        if (failed.length) {
          toast.warning(`${failed.length} participant(s) failed to register`);
        }
      }

      // 3. Schedule matches
      if (matches.length > 0) {
        const mResults = await tournamentService.createMatches(eventId, matches);
        const failed = mResults.filter((r) => !r.success);
        if (failed.length) {
          toast.warning(`${failed.length} match(es) failed to schedule`);
        }
      }

      toast.success(`${form.type === 'GALA' ? 'Gala' : 'Tournament'} "${form.name}" created!`);
      setStep(4);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const selectClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Create Tournament / Gala"
        subtitle="Set up a new competition event with participants and fixtures"
      />

      {/* Step progress */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-umu-red text-white' : isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${isDone ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Event Details ─────────────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-base">Event Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Inter-Faculty Football Tournament 2026"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  className={selectClass}
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {['GALA', 'TOURNAMENT', 'LEAGUE', 'COMPETITION', 'FRIENDLY'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format *</label>
                <select
                  className={selectClass}
                  value={form.format}
                  onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
                >
                  {['KNOCKOUT', 'ROUND_ROBIN', 'LEAGUE', 'GROUP_STAGE', 'SINGLE_MATCH', 'OTHER'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  className={selectClass}
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                >
                  {['CAMPUS', 'FACULTY', 'UNIVERSITY', 'LOCAL', 'NATIONAL', 'REGIONAL', 'INTERNATIONAL'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                <select
                  className={selectClass}
                  value={form.sportId ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, sportId: e.target.value || undefined }))}
                >
                  <option value="">Any / Multi-sport (Gala)</option>
                  {(sports ?? []).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={form.startDate ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input
                  type="date"
                  value={form.endDate ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <Input
                  value={form.venue ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                  placeholder="e.g. UMU Sports Ground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                <Input
                  value={form.organizer ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))}
                  placeholder="Sports Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
                <Input
                  type="date"
                  value={form.registrationDeadline ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, registrationDeadline: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Teams</label>
                <Input
                  type="number"
                  min={2}
                  value={form.maxTeams ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, maxTeams: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                  placeholder="16"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the event, rules, prizes…"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(2)} disabled={!canProceedStep1()}>
                Next: Participants <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Participants ─────────────────────────────────────────── */}
      {step === 2 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-base">Register Participants</h3>
            <p className="text-sm text-gray-500">Add the teams or individual athletes competing in this event.</p>

            {/* Add participant row */}
            <div className="flex items-end gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className={selectClass + ' w-32'}
                  value={participantType}
                  onChange={(e) => setParticipantType(e.target.value as 'TEAM' | 'INDIVIDUAL')}
                >
                  <option value="TEAM">Team</option>
                  <option value="INDIVIDUAL">Individual</option>
                </select>
              </div>

              {participantType === 'TEAM' ? (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team {form.sportId ? '(filtered by sport)' : ''}
                  </label>
                  <select
                    className={selectClass}
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                  >
                    <option value="">Select team…</option>
                    {filteredTeams.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.sport?.name ? `(${t.sport.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Athlete</label>
                  <select
                    className={selectClass}
                    value={selectedAthleteId}
                    onChange={(e) => setSelectedAthleteId(e.target.value)}
                  >
                    <option value="">Select athlete…</option>
                    {(athletes ?? []).map((a: any) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({a.registrationNumber ?? 'No reg.'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button onClick={addParticipant} type="button">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {/* Participants list */}
            {participants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No participants added yet. You can also add them later from the event detail page.</p>
            ) : (
              <div className="space-y-2">
                {participants.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-2 bg-white border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{p.participantType}</Badge>
                      <span className="text-sm font-medium">{getParticipantLabel(p)}</span>
                    </div>
                    <button
                      onClick={() => removeParticipant(idx)}
                      className="text-destructive hover:opacity-70"
                      aria-label="Remove participant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next: Schedule <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Schedule ────────────────────────────────────────────── */}
      {step === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-base">Schedule Fixtures</h3>
            <p className="text-sm text-gray-500">Auto-generate fixtures from participants or add them manually.</p>

            {/* Default date/venue for auto-gen */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Match Date</label>
                <Input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Venue</label>
                <Input
                  value={matchVenue}
                  onChange={(e) => setMatchVenue(e.target.value)}
                  placeholder={form.venue ?? 'Match venue'}
                />
              </div>
              <div className="col-span-2 flex gap-2">
                <Button
                  variant="secondary"
                  onClick={autoGenerateFixtures}
                  disabled={participants.filter((p) => p.participantType === 'TEAM').length < 2}
                >
                  Auto-generate {form.format === 'ROUND_ROBIN' ? 'Round Robin' : 'Knockout'} Fixtures
                </Button>
                <Button variant="outline" onClick={addBlankMatch}>
                  <Plus className="w-4 h-4 mr-1" /> Add Manually
                </Button>
              </div>
            </div>

            {/* Matches list */}
            {matches.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No fixtures yet. Generate them automatically or add manually.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg text-sm"
                  >
                    <span className="col-span-1 text-gray-400 text-xs font-mono">#{idx + 1}</span>
                    <div className="col-span-3">
                      <select
                        className={selectClass + ' text-xs'}
                        value={m.homeTeamId ?? ''}
                        onChange={(e) => updateMatch(idx, 'homeTeamId', e.target.value)}
                      >
                        <option value="">Home…</option>
                        {(teams ?? []).map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <span className="col-span-1 text-center text-gray-400 text-xs">vs</span>
                    <div className="col-span-3">
                      <select
                        className={selectClass + ' text-xs'}
                        value={m.awayTeamId ?? ''}
                        onChange={(e) => updateMatch(idx, 'awayTeamId', e.target.value)}
                      >
                        <option value="">Away…</option>
                        {(teams ?? []).map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="date"
                        value={m.scheduledDate?.slice(0, 10) ?? ''}
                        onChange={(e) => updateMatch(idx, 'scheduledDate', e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        value={m.round ?? ''}
                        onChange={(e) => updateMatch(idx, 'round', e.target.value)}
                        placeholder="R1"
                        className="text-xs h-8"
                      />
                    </div>
                    <button
                      onClick={() => removeMatch(idx)}
                      className="col-span-1 flex items-center justify-center text-destructive hover:opacity-70"
                      aria-label="Remove match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {matches.length > 0 && (
              <p className="text-xs text-gray-400">{matches.length} fixture(s) scheduled</p>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(4)}>
                Review & Confirm <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Confirm / Done ───────────────────────────────────────── */}
      {step === 4 && !createdEventId && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-base">Confirm &amp; Create</h3>

            <div className="rounded-lg bg-gray-50 border border-gray-200 divide-y divide-gray-200">
              <SummaryRow label="Name" value={form.name} />
              <SummaryRow label="Type" value={`${form.type} (${form.format})`} />
              <SummaryRow label="Level" value={form.level} />
              <SummaryRow label="Sport" value={(sports ?? []).find((s: any) => s.id === form.sportId)?.name ?? 'Any'} />
              <SummaryRow label="Venue" value={form.venue || '—'} />
              <SummaryRow label="Dates" value={[form.startDate, form.endDate].filter(Boolean).join(' → ') || '—'} />
              <SummaryRow label="Participants" value={`${participants.length} registered`} />
              <SummaryRow label="Fixtures" value={`${matches.length} scheduled`} />
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-umu-red hover:bg-umu-red-dark text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Create {form.type === 'GALA' ? 'Gala' : 'Tournament'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Done screen ───────────────────────────────────────────────────── */}
      {step === 4 && createdEventId && (
        <Card>
          <CardContent className="pt-10 pb-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {form.type === 'GALA' ? 'Gala' : 'Tournament'} Created!
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              <span className="font-medium">{form.name}</span> has been set up with {participants.length} participant(s) and {matches.length} fixture(s).
            </p>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => navigate('/events-admin')}>
                View Events
              </Button>
              <Button
                onClick={() => {
                  setStep(1);
                  setForm(EMPTY_FORM);
                  setParticipants([]);
                  setMatches([]);
                  setCreatedEventId(null);
                }}
              >
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Helper component ─────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
