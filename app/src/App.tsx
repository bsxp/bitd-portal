import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CharacterSheet } from '@/components/CharacterSheet'
import { CrewSheet } from '@/components/CrewSheet'
import { ClockDashboard } from '@/components/ClockDashboard'
import { FactionTracker } from '@/components/FactionTracker'
import { Overview } from '@/components/Overview'
import { GameProvider, useGame } from '@/lib/store'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Shield, Users, Clock, Swords, Eye, EyeOff, Plus, Home } from 'lucide-react'
import type { Clock as ClockType } from '@/lib/types'

function AppContent() {
  const {
    role, setRole,
    characters, updateCharacter,
    crew, updateCrew,
    clocks, updateClock, addClock, deleteClock,
    factions, updateFaction,
    activeCharacterId, setActiveCharacter,
    endScore,
  } = useGame()

  const [newClockOpen, setNewClockOpen] = useState(false)
  const [newClockName, setNewClockName] = useState('')
  const [newClockSegments, setNewClockSegments] = useState('4')
  const [newClockVisible, setNewClockVisible] = useState(true)

  const [activeTab, setActiveTab] = useState('overview')

  const isGM = role === 'gm'
  const activeCharacter = characters.find((c) => c.id === activeCharacterId)
  const visibleClocks = isGM ? clocks : clocks.filter((c) => c.visible_to_players)

  function navigateToCharacter(id: string) {
    setActiveCharacter(id)
    setActiveTab('characters')
  }

  function handleAddClock() {
    const clock: ClockType = {
      id: crypto.randomUUID(),
      campaign_id: 'demo',
      name: newClockName || 'New Clock',
      segments: parseInt(newClockSegments),
      filled: 0,
      clock_type: 'general',
      visible_to_players: newClockVisible,
      active: true,
      notes: null,
      created_at: new Date().toISOString(),
    }
    addClock(clock)
    setNewClockName('')
    setNewClockSegments('4')
    setNewClockVisible(true)
    setNewClockOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <h1 className="text-lg font-bold tracking-tight">
            Blades in the Dark
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRole(isGM ? 'player' : 'gm')}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                isGM
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-600'
                  : 'border-blue-500/50 bg-blue-500/10 text-blue-600',
              )}
            >
              {isGM ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {isGM ? 'GM View' : 'Player View'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="overview" className="gap-1.5">
              <Home className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-1.5">
              <Users className="h-4 w-4" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="crew" className="gap-1.5">
              <Shield className="h-4 w-4" />
              Crew
            </TabsTrigger>
            <TabsTrigger value="clocks" className="gap-1.5">
              <Clock className="h-4 w-4" />
              Clocks
            </TabsTrigger>
            {isGM && (
              <TabsTrigger value="factions" className="gap-1.5">
                <Swords className="h-4 w-4" />
                Factions
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Overview
              characters={characters}
              crew={crew}
              clocks={visibleClocks}
              factions={isGM ? factions : undefined}
              isGM={isGM}
              onCharacterClick={navigateToCharacter}
              onCharacterUpdate={updateCharacter}
              onCrewUpdate={updateCrew}
              onEndScore={endScore}
            />
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters">
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCharacter(c.id)}
                  className={cn(
                    'whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                    activeCharacterId === c.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted hover:border-primary/50',
                  )}
                >
                  {c.name}
                  {c.playbook && (
                    <span className="ml-1.5 text-xs opacity-70">({c.playbook})</span>
                  )}
                </button>
              ))}
            </div>
            {activeCharacter && (
              <CharacterSheet
                character={activeCharacter}
                onUpdate={(updates) => updateCharacter(activeCharacter.id, updates)}
              />
            )}
          </TabsContent>

          {/* Crew Tab */}
          <TabsContent value="crew">
            {crew && (
              <CrewSheet
                crew={crew}
                onUpdate={updateCrew}
              />
            )}
          </TabsContent>

          {/* Clocks Tab */}
          <TabsContent value="clocks">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Progress Clocks</h2>
              {isGM && (
                <Dialog open={newClockOpen} onOpenChange={setNewClockOpen}>
                  <DialogTrigger
                    render={<Button size="sm" className="gap-1" />}
                  >
                    <Plus className="h-4 w-4" />
                    Add Clock
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Clock</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={newClockName}
                          onChange={(e) => setNewClockName(e.target.value)}
                          placeholder="Clock name..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Segments</Label>
                        <Select value={newClockSegments} onValueChange={(v) => { if (v) setNewClockSegments(v) }}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4">4 segments</SelectItem>
                            <SelectItem value="6">6 segments</SelectItem>
                            <SelectItem value="8">8 segments</SelectItem>
                            <SelectItem value="12">12 segments</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setNewClockVisible(!newClockVisible)}
                          className={cn(
                            'flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors',
                            newClockVisible
                              ? 'border-green-500/50 bg-green-500/10'
                              : 'border-red-500/50 bg-red-500/10',
                          )}
                        >
                          {newClockVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          {newClockVisible ? 'Visible to players' : 'GM only'}
                        </button>
                      </div>
                      <Button onClick={handleAddClock} className="w-full">
                        Create Clock
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <ClockDashboard
              clocks={visibleClocks}
              onUpdate={updateClock}
              onDelete={isGM ? deleteClock : undefined}
              isGM={isGM}
            />
          </TabsContent>

          {/* Factions Tab (GM only) */}
          {isGM && (
            <TabsContent value="factions">
              <FactionTracker
                factions={factions}
                onUpdate={updateFaction}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <TooltipProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </TooltipProvider>
  )
}
