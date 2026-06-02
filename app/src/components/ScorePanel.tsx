import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ClockDisplay } from '@/components/trackers/ClockDisplay'
import { useGame, COIN_CAPACITY } from '@/lib/store'
import { PLAN_TYPES } from '@/lib/game-data'
import { POSITION_INFO } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Target, Plus, Flag, X, Coins, TrendingUp, Flame, History, AlertTriangle } from 'lucide-react'
import type { Position, Clock, Score } from '@/lib/types'

const POSITIONS: Position[] = ['controlled', 'risky', 'desperate']

const POSITION_STYLES: Record<Position, string> = {
  controlled: 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400',
  risky: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  desperate: 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
}

// The engagement roll sets where the crew BEGINS the action. This is distinct
// from POSITION_INFO, which describes the consequences of an action roll at that
// position. Notably, a desperate *starting* position grants no xp on its own —
// xp comes from rolling a desperate action during play.
const STARTING_POSITION_INFO: Record<Position, string> = {
  controlled: "Good result on the engagement roll — you're in a controlled position when the action starts.",
  risky: "Mixed result on the engagement roll — you're in a risky position when the action starts.",
  desperate: "Bad result on the engagement roll — you're in a desperate position when the action starts.",
}

export function ScorePanel({ isGM }: { isGM: boolean }) {
  const {
    currentScore, scoreHistory, startScore, updateScore, wrapScore, abandonScore,
    characters, updateCharacter,
    clocks, addClock, updateClock, deleteClock,
    crew,
  } = useGame()

  const [wrapping, setWrapping] = useState(false)
  const [newClockName, setNewClockName] = useState('')
  const [newClockSegments, setNewClockSegments] = useState(4)

  const scoreClocks = clocks.filter((c) => c.scope === 'score' && c.active)

  // ── NO ACTIVE SCORE (Free Play / Downtime) ──
  if (!currentScore) {
    // Ephemeral coin will be wiped (capped to capacity) when the next score
    // starts. Surface who stands to lose how much so the GM can prompt players
    // to spend or stash it first.
    const ephemeralLosses: { name: string; lose: number }[] = []
    if (crew && crew.coin > COIN_CAPACITY) {
      ephemeralLosses.push({ name: crew.name, lose: crew.coin - COIN_CAPACITY })
    }
    for (const c of characters) {
      if (c.coin > COIN_CAPACITY) ephemeralLosses.push({ name: c.name, lose: c.coin - COIN_CAPACITY })
    }

    return (
      <div className="space-y-10">
        <div className="mx-auto max-w-md pt-12 text-center">
          <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold">No active score</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The crew is in free play or downtime. When you pick a target and commit to a job, start the score here.
          </p>
          {isGM && ephemeralLosses.length > 0 && (
            <div className="mt-4 rounded-md border-2 border-amber-500/50 bg-amber-500/10 p-3 text-left">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Ephemeral coin will be wiped at the next score
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Coin above capacity ({COIN_CAPACITY}) is lost when the score starts. Have them spend or stash it first.
              </p>
              <ul className="mt-2 space-y-0.5 text-xs text-amber-700 dark:text-amber-400">
                {ephemeralLosses.map((e) => (
                  <li key={e.name} className="flex items-center gap-1">
                    <Coins className="h-3 w-3 shrink-0" />
                    <span><strong>{e.name}</strong> loses {e.lose} coin</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isGM && (
            <Button className="mt-4 gap-1.5" onClick={startScore}>
              <Plus className="h-4 w-4" />
              Plan a Score
            </Button>
          )}
        </div>
        {scoreHistory.length > 0 && <ScoreLog scores={scoreHistory} />}
      </div>
    )
  }

  const score = currentScore

  function handleAddClock() {
    const name = newClockName.trim()
    if (!name) return
    const clock: Clock = {
      id: crypto.randomUUID(),
      campaign_id: 'demo',
      name,
      segments: newClockSegments,
      filled: 0,
      clock_type: 'general',
      scope: 'score',
      visible_to_players: true,
      active: true,
      notes: null,
      created_at: new Date().toISOString(),
    }
    addClock(clock)
    setNewClockName('')
    setNewClockSegments(4)
  }

  // ════════════════════════════════════════
  //  PLANNING PHASE
  // ════════════════════════════════════════
  if (score.status === 'planning') {
    const selectedPlan = PLAN_TYPES.find((p) => p.name === score.plan_type)
    const canBegin = !!score.plan_type && !!score.position

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Target className="h-5 w-5" />
            Planning a Score
          </h2>
          {isGM && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={abandonScore}>
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          )}
        </div>

        {/* Target & title */}
        <Card>
          <CardContent className="space-y-3 pt-4">
            <div>
              <Label className="text-xs text-muted-foreground">Score Name</Label>
              <Input
                value={score.title}
                onChange={(e) => updateScore({ title: e.target.value })}
                placeholder="The Brightstone Job..."
                className="mt-1"
                readOnly={!isGM}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Target</Label>
              <Input
                value={score.target ?? ''}
                onChange={(e) => updateScore({ target: e.target.value || null })}
                placeholder="Who or what is the objective?"
                className="mt-1"
                readOnly={!isGM}
              />
            </div>
          </CardContent>
        </Card>

        {/* Plan type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Choose a Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PLAN_TYPES.map((plan) => (
                <button
                  key={plan.name}
                  onClick={() => isGM && updateScore({ plan_type: plan.name })}
                  disabled={!isGM}
                  className={cn(
                    'rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors',
                    score.plan_type === plan.name
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30 hover:border-primary/50',
                  )}
                >
                  {plan.name}
                </button>
              ))}
            </div>
            {selectedPlan && (
              <div>
                <Label className="text-xs text-muted-foreground">{selectedPlan.detail}</Label>
                <Input
                  value={score.plan_detail ?? ''}
                  onChange={(e) => updateScore({ plan_detail: e.target.value || null })}
                  placeholder={`Provide the detail: ${selectedPlan.detail.toLowerCase()}...`}
                  className="mt-1"
                  readOnly={!isGM}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load loadout per character */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Load</CardTitle>
            <p className="text-xs text-muted-foreground">Each scoundrel commits to a load level before the job.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {characters.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.name}</span>
                <div className="flex gap-1.5">
                  {(['light', 'normal', 'heavy'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => updateCharacter(c.id, { load_level: c.load_level === lvl ? null : lvl })}
                      className={cn(
                        'rounded border-2 px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                        c.load_level === lvl
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 hover:border-primary/50',
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Starting position (set from the engagement roll made at the table) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Starting Position</CardTitle>
            <p className="text-xs text-muted-foreground">
              Make the engagement roll at the table, then set where the crew begins the action.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => isGM && updateScore({ position: score.position === pos ? null : pos })}
                  disabled={!isGM}
                  className={cn(
                    'rounded-md border-2 px-3 py-2 text-sm font-semibold capitalize transition-colors',
                    score.position === pos
                      ? POSITION_STYLES[pos]
                      : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50',
                  )}
                >
                  {pos}
                </button>
              ))}
            </div>
            {score.position && (
              <p className="text-xs text-muted-foreground">{STARTING_POSITION_INFO[score.position]}</p>
            )}
          </CardContent>
        </Card>

        {isGM && (
          <Button
            className="w-full gap-1.5"
            size="lg"
            disabled={!canBegin}
            onClick={() => updateScore({ status: 'active' })}
          >
            <Flag className="h-4 w-4" />
            {canBegin ? 'Begin the Score' : 'Pick a plan and starting position to begin'}
          </Button>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════
  //  ACTIVE PHASE
  // ════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* Position banner — the persistent "where do we stand" reference */}
      <div className={cn('rounded-lg border-2 p-4', score.position && POSITION_STYLES[score.position])}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 shrink-0" />
              <span className="truncate text-lg font-bold text-foreground">{score.title}</span>
            </div>
            {score.target && <p className="mt-0.5 text-sm text-muted-foreground">{score.target}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {score.plan_type && (
                <Badge variant="outline" className="text-xs">{score.plan_type}</Badge>
              )}
              {score.plan_detail && (
                <span className="text-xs text-muted-foreground">{score.plan_detail}</span>
              )}
            </div>
          </div>
          {score.position && (
            <div className="text-right">
              <div className="text-sm font-bold uppercase tracking-wide">
                {POSITION_INFO[score.position].label}
              </div>
              <div className="text-[10px] uppercase opacity-70">starting position</div>
            </div>
          )}
        </div>
      </div>

      {/* Score clocks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Score Clocks</CardTitle>
          <p className="text-xs text-muted-foreground">Obstacles, alarms, and progress for this job. Cleared when you wrap.</p>
        </CardHeader>
        <CardContent>
          {scoreClocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active clocks yet.</p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {scoreClocks.map((clock) => (
                <div key={clock.id} className="flex flex-col items-center gap-1">
                  <ClockDisplay
                    segments={clock.segments}
                    filled={clock.filled}
                    size={64}
                    onSegmentClick={isGM ? (filled) => updateClock(clock.id, { filled }) : undefined}
                    readonly={!isGM}
                  />
                  <span className="w-24 break-words text-center text-xs font-medium leading-tight">{clock.name}</span>
                  {isGM && (
                    <button
                      className="text-[10px] text-destructive hover:underline"
                      onClick={() => deleteClock(clock.id)}
                    >
                      remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isGM && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
              <Input
                value={newClockName}
                onChange={(e) => setNewClockName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddClock()}
                placeholder="New clock (e.g. Alert the guards)..."
                className="h-8 min-w-[12rem] flex-1 text-sm"
              />
              <div className="flex gap-1">
                {[4, 6, 8, 10, 12].map((seg) => (
                  <button
                    key={seg}
                    onClick={() => setNewClockSegments(seg)}
                    className={cn(
                      'h-8 w-8 rounded border-2 text-xs font-medium transition-colors',
                      newClockSegments === seg
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30',
                    )}
                  >
                    {seg}
                  </button>
                ))}
              </div>
              <Button size="sm" className="h-8 gap-1" onClick={handleAddClock}>
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crew at a glance — light reference during the score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Crew</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {characters.map((c) => (
            <div key={c.id} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0 truncate font-medium">{c.name}</span>
              <div className="flex flex-1 items-center gap-1">
                <span className="text-xs text-muted-foreground">Stress</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn('h-2.5 w-2.5 rounded-sm', i < c.stress ? 'bg-red-500' : 'bg-muted-foreground/20')}
                    />
                  ))}
                </div>
              </div>
              {c.load_level && <Badge variant="outline" className="text-[10px] capitalize">{c.load_level}</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="pt-4">
          <Label className="text-xs text-muted-foreground">Score Notes</Label>
          <textarea
            value={score.notes ?? ''}
            onChange={(e) => updateScore({ notes: e.target.value || null })}
            placeholder="What's happening, complications, what the crew has learned..."
            className="mt-1 w-full min-h-[70px] resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </CardContent>
      </Card>

      {/* Wrap the score */}
      {isGM && (
        wrapping ? (
          <Card className="border-primary/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Wrap the Score — Payoff</CardTitle>
              <p className="text-xs text-muted-foreground">
                Pay out to the crew, then load, armor, and score clocks reset for downtime.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Outcome</Label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(['success', 'failure'] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => updateScore({ outcome: o })}
                      className={cn(
                        'rounded-md border-2 px-3 py-2 text-sm font-semibold capitalize transition-colors',
                        score.outcome === o
                          ? o === 'success'
                            ? 'border-green-500/50 bg-green-500/15 text-green-700 dark:text-green-400'
                            : 'border-red-500/50 bg-red-500/15 text-red-600 dark:text-red-400'
                          : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50',
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <PayoffStepper
                  icon={<Coins className="h-3.5 w-3.5 text-yellow-600" />}
                  label="Coin"
                  value={score.payoff_coin}
                  onChange={(v) => updateScore({ payoff_coin: v })}
                />
                <PayoffStepper
                  icon={<TrendingUp className="h-3.5 w-3.5 text-blue-500" />}
                  label="Rep"
                  value={score.rep_gained}
                  onChange={(v) => updateScore({ rep_gained: v })}
                />
                <PayoffStepper
                  icon={<Flame className="h-3.5 w-3.5 text-orange-500" />}
                  label="Heat"
                  value={score.heat_gained}
                  onChange={(v) => updateScore({ heat_gained: v })}
                />
              </div>
              {crew && (
                <p className="text-xs text-muted-foreground">
                  {crew.name}: {crew.coin} → <strong>{crew.coin + score.payoff_coin}</strong> coin,
                  {' '}rep {crew.rep} → <strong>{Math.min(12, crew.rep + score.rep_gained)}</strong>,
                  {' '}heat {crew.heat} → <strong>{(crew.heat + score.heat_gained) % 9}</strong>
                  {Math.floor((crew.heat + score.heat_gained) / 9) > 0 && (
                    <span className="text-red-600"> (+{Math.floor((crew.heat + score.heat_gained) / 9)} wanted)</span>
                  )}
                </p>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">What happened (recap for the log)</Label>
                <textarea
                  value={score.outcome_notes ?? ''}
                  onChange={(e) => updateScore({ outcome_notes: e.target.value || null })}
                  placeholder="The DM's summary of how the job went..."
                  className="mt-1 w-full min-h-[60px] resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-1.5"
                  disabled={!score.outcome}
                  onClick={() => { wrapScore(); setWrapping(false) }}
                >
                  <Flag className="h-4 w-4" />
                  {score.outcome ? 'Confirm & End Score' : 'Pick an outcome to end the score'}
                </Button>
                <Button variant="ghost" onClick={() => setWrapping(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-2">
            <Button className="flex-1 gap-1.5" size="lg" onClick={() => setWrapping(true)}>
              <Flag className="h-4 w-4" />
              Wrap the Score
            </Button>
            <Button variant="ghost" className="text-muted-foreground" onClick={abandonScore}>
              Abandon
            </Button>
          </div>
        )
      )}
    </div>
  )
}

function ScoreLog({ scores }: { scores: Score[] }) {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <History className="h-4 w-4" />
        Score Log
      </h3>
      {scores.map((s) => (
        <Card key={s.id}>
          <CardContent className="space-y-2 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate font-semibold">{s.title}</span>
                {s.outcome && (
                  <Badge
                    className={cn(
                      'text-[10px] uppercase',
                      s.outcome === 'success'
                        ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                        : 'bg-red-500/15 text-red-600 dark:text-red-400',
                    )}
                  >
                    {s.outcome}
                  </Badge>
                )}
              </div>
              {s.completed_at && (
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {new Date(s.completed_at).toLocaleDateString()}
                </span>
              )}
            </div>
            {s.target && <p className="text-xs text-muted-foreground">{s.target}</p>}
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3 text-yellow-600" /> {s.payoff_coin} coin
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-blue-500" /> {s.rep_gained >= 0 ? '+' : ''}{s.rep_gained} rep
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" /> {s.heat_gained >= 0 ? '+' : ''}{s.heat_gained} heat
              </span>
            </div>
            {s.outcome_notes && <p className="text-sm">{s.outcome_notes}</p>}
            {s.notes && <p className="text-xs italic text-muted-foreground">{s.notes}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PayoffStepper({
  icon, label, value, onChange,
}: {
  icon: React.ReactNode
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <Label className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </Label>
      <div className="mt-1 flex items-center gap-1">
        <Button
          variant="outline" size="icon" className="h-7 w-7"
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          –
        </Button>
        <span className="w-8 text-center text-lg font-bold tabular-nums">{value}</span>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onChange(value + 1)}>
          +
        </Button>
      </div>
    </div>
  )
}
