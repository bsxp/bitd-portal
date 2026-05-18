import type { Playbook, CrewType, Hold } from './types'

export interface CanonicalFaction {
  name: string
  tier: number
  hold: Hold
  category: string
  description: string
}

export const CANONICAL_FACTIONS: CanonicalFaction[] = [
  // ── Underworld ──
  { name: 'The Lampblacks', tier: 2, hold: 'weak', category: 'Underworld', description: 'Former laborers union turned to crime, led by Bazso Baz. Control Crow\'s Foot.' },
  { name: 'The Red Sashes', tier: 2, hold: 'weak', category: 'Underworld', description: 'Sword-wielding Iruvian noble criminals, led by Mylera Klev. Enemies of the Lampblacks.' },
  { name: 'The Billhooks', tier: 2, hold: 'strong', category: 'Underworld', description: 'Vicious gang known for brutal methods and a meat processing front in the Docks.' },
  { name: 'The Crows', tier: 2, hold: 'strong', category: 'Underworld', description: 'Thieves and extortionists. Leadership contested after Roric\'s death; now led by Lyssa.' },
  { name: 'The Hive', tier: 4, hold: 'strong', category: 'Underworld', description: 'Massive criminal syndicate run by a council of bosses. Deals in vice on a grand scale.' },
  { name: 'The Unseen', tier: 4, hold: 'strong', category: 'Underworld', description: 'Legendary secret society of spies and assassins. No one knows their true leaders.' },
  { name: 'The Dimmer Sisters', tier: 3, hold: 'strong', category: 'Underworld', description: 'Reclusive occultists in a Silkshore manor. Collect and trade in arcane artifacts.' },
  { name: 'The Silver Nails', tier: 1, hold: 'strong', category: 'Underworld', description: 'Mercenary company of Unity War veterans. Tough fighters looking for work.' },
  { name: 'The Foghounds', tier: 1, hold: 'strong', category: 'Underworld', description: 'Smugglers and scavengers who operate from the Docks.' },
  { name: 'The Lost', tier: 1, hold: 'weak', category: 'Underworld', description: 'Vagrant outcasts who deal in strange essences scavenged from the deathlands.' },
  { name: 'The Grinders', tier: 2, hold: 'strong', category: 'Underworld', description: 'Violent anarchist revolutionaries from Coalridge who target the wealthy elite.' },
  { name: 'The Wraiths', tier: 1, hold: 'strong', category: 'Underworld', description: 'Secretive gang of thieves and infiltrators. Masters of stealth and subterfuge.' },
  { name: 'Ulf Ironborn', tier: 1, hold: 'weak', category: 'Underworld', description: 'Small gang of Skovlan refugees. Fiercely independent and proud.' },
  { name: 'The Gray Cloaks', tier: 2, hold: 'weak', category: 'Underworld', description: 'Assassins and spies, formerly aligned with the Crows under Roric.' },

  // ── Institutions ──
  { name: 'The Bluecoats', tier: 3, hold: 'strong', category: 'Institutions', description: 'City police force, corrupt to the core. Enforce the law when it suits them.' },
  { name: 'The Inspectors', tier: 3, hold: 'strong', category: 'Institutions', description: 'Elite investigative body. More competent and less corrupt than the Bluecoats.' },
  { name: 'Ironhook Prison', tier: 3, hold: 'strong', category: 'Institutions', description: 'The city\'s towering prison. A brutal place rife with gangs and corruption.' },
  { name: 'The City Council', tier: 5, hold: 'strong', category: 'Institutions', description: 'Governing body of Doskvol. Wealthy elite who shape policy for personal gain.' },
  { name: 'The Ministry of Preservation', tier: 5, hold: 'strong', category: 'Institutions', description: 'Oversees spirit containment, the lightning barriers, and electroplasm supply.' },
  { name: 'The Leviathan Hunters', tier: 5, hold: 'strong', category: 'Institutions', description: 'Ships that hunt massive leviathans in the Void Sea for their blood — the city\'s fuel.' },
  { name: 'Imperial Military', tier: 6, hold: 'strong', category: 'Institutions', description: 'Imperial military forces. Garrison in Whitecrown, rarely intervene in city affairs.' },
  { name: 'The Spirit Wardens', tier: 4, hold: 'strong', category: 'Institutions', description: 'Destroy lingering ghosts and ensure all corpses are cremated. Feared and respected.' },
  { name: 'The Sparkwrights', tier: 3, hold: 'strong', category: 'Institutions', description: 'Engineers guild that maintains the lightning barriers protecting the city from ghosts.' },

  // ── The Fringe ──
  { name: 'The Reconciled', tier: 3, hold: 'strong', category: 'The Fringe', description: 'Organized coalition of ghosts who\'ve chosen cooperation over madness.' },
  { name: 'The Forgotten Gods', tier: 4, hold: 'strong', category: 'The Fringe', description: 'Servants of pre-cataclysm deities. Ancient, secretive, and powerful.' },
  { name: 'The Path of Echoes', tier: 3, hold: 'weak', category: 'The Fringe', description: 'Secretive spiritualist cult that seeks communion with the ghost field.' },
  { name: 'The Church of the Ecstasy of the Flesh', tier: 4, hold: 'strong', category: 'The Fringe', description: 'State-sanctioned religion. Preaches bodily pleasure as transcendence of the spirit.' },
  { name: 'Lord Scurlock', tier: 3, hold: 'strong', category: 'The Fringe', description: 'Mysterious noble with ancient dark powers. Lives in a Whitecrown estate.' },

  // ── Labor & Trade ──
  { name: 'The Gondoliers', tier: 3, hold: 'strong', category: 'Labor & Trade', description: 'Waterway transportation guild. Rumored to have secret dealings with ghosts.' },
  { name: 'The Ink Rakes', tier: 2, hold: 'weak', category: 'Labor & Trade', description: 'Journalists and broadsheet publishers. Trade in secrets and scandal.' },
  { name: 'The Dockers', tier: 2, hold: 'strong', category: 'Labor & Trade', description: 'Organized dockworkers. Control the flow of goods through the harbor.' },
  { name: 'The Cabbies', tier: 2, hold: 'weak', category: 'Labor & Trade', description: 'Carriage drivers loosely organized. Hear everything, know every street.' },
  { name: 'The Rail Jacks', tier: 2, hold: 'strong', category: 'Labor & Trade', description: 'Maintain the electro-rail lines between cities. Tough and resourceful.' },
  { name: 'The Servants', tier: 1, hold: 'weak', category: 'Labor & Trade', description: 'Service workers in wealthy districts. Overlooked, but they see everything.' },
  { name: 'Sailors', tier: 3, hold: 'weak', category: 'Labor & Trade', description: 'Merchant sailors and their crews. Tough, superstitious, and well-traveled.' },
  { name: 'The Brigade', tier: 2, hold: 'strong', category: 'Labor & Trade', description: 'Firefighters and emergency responders. Respected across all districts.' },
  { name: 'Skovlander Refugees', tier: 3, hold: 'weak', category: 'Labor & Trade', description: 'Displaced refugees from the Unity War. Concentrated in Charhollow and the Docks.' },
]

export const PLAYBOOK_XP_TRIGGERS: Record<Playbook, string> = {
  cutter: 'Address a challenge with violence or coercion.',
  hound: 'Address a challenge with tracking or violence.',
  leech: 'Address a challenge with technical skill or ingenuity.',
  lurk: 'Address a challenge with stealth or evasion.',
  slide: 'Address a challenge with deception or influence.',
  spider: 'Address a challenge with calculation or conspiracy.',
  whisper: 'Address a challenge with knowledge or arcane power.',
}

export const CREW_XP_TRIGGERS: Record<CrewType, string> = {
  assassins: 'Execute a successful accident, disappearance, murder, or ransom.',
  bravos: 'Execute a successful battle, extortion, sabotage, or smash & grab.',
  cult: 'Execute a successful artifact acquisition, augury, consecration, or sacrifice.',
  hawkers: 'Execute a successful product procurement, covert sale, show of force, or social event.',
  shadows: 'Execute a successful burglary, espionage, robbery, or sabotage.',
  smugglers: 'Execute a successful clandestine delivery, territory control, or expedition.',
}

export const PLAYBOOK_ITEMS: Record<Playbook, string[]> = {
  cutter: ['Fine hand weapon', 'Fine heavy weapon', 'Scary weapon or tool', 'Manacles & chain', 'Rage essence vial', 'Spiritbane charm'],
  hound: ['Fine pair of pistols', 'Fine long rifle', 'Electroplasmic ammunition', 'A trained hunting pet', 'Spyglass', 'Spiritbane charm'],
  leech: ['Fine tinkering tools', 'Fine wrecking tools', 'Blowgun & darts, syringes', 'Bandolier (3 uses)', 'Gadgets (2 uses)', 'Spiritbane charm'],
  lurk: ['Fine lockpicks', 'Fine shadow cloak', 'Light climbing gear', 'Silence potion vial', 'Dark-sight goggles', 'Spiritbane charm'],
  slide: ['Fine clothes & jewelry', 'Fine disguise kit', 'Fine loaded dice, cards', 'Trance powder', 'A cane-sword', 'Spiritbane charm'],
  spider: ['Fine cover identity', 'Fine bottle of whiskey', 'Blueprints', 'Small wrecking tools', 'Spiritbane charm', 'Signal ring'],
  whisper: ['Fine lightning hook', 'Fine spirit mask', 'Electroplasm vials', 'Spirit bottles (2)', 'Ghost key', 'Spiritbane charm'],
}

export const STANDARD_ITEMS = [
  'A Blade or Two',
  'Throwing Knives',
  'A Pistol',
  'A 2nd Pistol',
  'A Large Weapon',
  'An Unusual Weapon',
  'Armor',
  'Armor +Heavy',
  'Burglary Gear',
  'Climbing Gear',
  'Arcane Implements',
  'Documents',
  'Subterfuge Supplies',
  'Demolition Tools',
  'Tinkering Tools',
  'Lantern',
]

export const LOAD_LIMITS: Record<Playbook, { light: number; normal: number; heavy: number }> = {
  cutter: { light: 3, normal: 5, heavy: 6 },
  hound: { light: 3, normal: 5, heavy: 6 },
  leech: { light: 3, normal: 5, heavy: 6 },
  lurk: { light: 3, normal: 5, heavy: 6 },
  slide: { light: 3, normal: 5, heavy: 6 },
  spider: { light: 3, normal: 5, heavy: 6 },
  whisper: { light: 3, normal: 5, heavy: 6 },
}

export const PLAN_TYPES = [
  { name: 'Assault', detail: 'Point of attack' },
  { name: 'Deception', detail: 'Method of deception' },
  { name: 'Stealth', detail: 'Point of infiltration' },
  { name: 'Occult', detail: 'Arcane method' },
  { name: 'Social', detail: 'Social connection' },
  { name: 'Transport', detail: 'Route & means' },
] as const

export const REPUTATION_OPTIONS = [
  'Ambitious', 'Brutal', 'Daring', 'Honorable',
  'Professional', 'Savvy', 'Subtle', 'Strange',
] as const

export interface ClaimDefinition {
  name: string
  description: string
}

export const CREW_CLAIMS: Record<CrewType, ClaimDefinition[][]> = {
  assassins: [
    [
      { name: 'Training Rooms', description: 'Your Skulks cohorts get +1 scale.' },
      { name: 'Vice Den', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
      { name: 'Fixer', description: '+2 coin in payoff for scores involving lower-class clients.' },
      { name: 'Informants', description: '+1d to gather information for a score.' },
      { name: 'Hagfish Farm', description: 'When you reduce heat after a killing, +1d to the roll and convenient corpse disposal.' },
    ],
    [
      { name: 'Victim Trophies', description: '+1 rep per score.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Lair', description: 'Your crew\'s headquarters.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Cover Operation', description: '-2 heat per score.' },
    ],
    [
      { name: 'Protection Racket', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
      { name: 'Infirmary', description: '+1d to healing treatment rolls.' },
      { name: 'Envoy', description: '+2 coin in payoff for scores involving high-class clients.' },
      { name: 'Cover Identities', description: '+1d to the engagement roll for deception and social plans.' },
      { name: 'City Records', description: '+1d to the engagement roll for stealth plans.' },
    ],
  ],
  bravos: [
    [
      { name: 'Barracks', description: 'Your Thug cohorts get +1 scale.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Terrorized Citizens', description: '+2 coin in payoff for scores involving battle or extortion.' },
      { name: 'Informants', description: '+1d to gather information for a score.' },
      { name: 'Protection Racket', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
    ],
    [
      { name: 'Fighting Pits', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Lair', description: 'Your crew\'s headquarters.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
    ],
    [
      { name: 'Infirmary', description: '+1d to healing treatment rolls.' },
      { name: 'Bluecoat Intimidation', description: '-2 heat per score.' },
      { name: 'Street Fence', description: '+2 coin in payoff for scores involving lower-class targets.' },
      { name: 'Warehouses', description: '+1d to acquire asset rolls.' },
      { name: 'Bluecoat Confederates', description: '+1d to the engagement roll for assault plans.' },
    ],
  ],
  cult: [
    [
      { name: 'Cloister', description: 'Your Adept cohorts get +1 scale.' },
      { name: 'Vice Den', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
      { name: 'Offertory', description: '+2 coin in payoff for scores involving occult operations.' },
      { name: 'Ancient Obelisk', description: '-1 stress cost for all arcane powers and rituals.' },
      { name: 'Ancient Tower', description: '+1d to Consort with arcane entities on-site.' },
    ],
    [
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Lair', description: 'Your crew\'s headquarters.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
    ],
    [
      { name: 'Spirit Well', description: '+1d to Attune rolls on-site.' },
      { name: 'Ancient Gate', description: 'Safe passage in the deathlands.' },
      { name: 'Sanctuary', description: '+1d to Command and Sway rolls on-site.' },
      { name: 'Sacred Nexus', description: '+1d to healing treatment rolls.' },
      { name: 'Ancient Altar', description: '+1d to the engagement roll for occult plans.' },
    ],
  ],
  hawkers: [
    [
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Personal Clothier', description: '+1d to the engagement roll for social plans.' },
      { name: 'Local Graft', description: '+2 coin in payoff for scores involving show of force or socializing.' },
      { name: 'Lookouts', description: '+1d to Hunt or Survey on your turf.' },
      { name: 'Informants', description: '+1d to gather information for a score.' },
    ],
    [
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Lair', description: 'Your crew\'s headquarters.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Luxury Venue', description: '+1d to Consort and Sway rolls on-site.' },
    ],
    [
      { name: 'Foreign Market', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
      { name: 'Vice Den', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
      { name: 'Surplus Cache', description: '+2 coin in payoff for scores involving product sale or supply.' },
      { name: 'Cover Operation', description: '-2 heat per score.' },
      { name: 'Cover Identities', description: '+1d to the engagement roll for deception and social plans.' },
    ],
  ],
  shadows: [
    [
      { name: 'Interrogation Chamber', description: '+1d to Command and Sway on-site.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Loyal Fence', description: '+2 coin in payoff for scores involving burglary or robbery.' },
      { name: 'Gambling Den', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
      { name: 'Tavern', description: '+1d to Consort and Sway rolls on-site.' },
    ],
    [
      { name: 'Drug Den', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
      { name: 'Informants', description: '+1d to gather information for a score.' },
      { name: 'Lair', description: 'Your crew\'s headquarters.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Lookouts', description: '+1d to Hunt or Survey on your turf.' },
    ],
    [
      { name: 'Hagfish Farm', description: 'When you reduce heat after a killing, +1d to the roll and convenient corpse disposal.' },
      { name: 'Infirmary', description: '+1d to healing treatment rolls.' },
      { name: 'Covert Drop', description: '+2 coin in payoff for scores involving espionage or sabotage.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Secret Pathways', description: '+1d to the engagement roll for stealth plans.' },
    ],
  ],
  smugglers: [
    [
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Side Business', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
      { name: 'Luxury Fence', description: '+2 coin in payoff for scores involving high-class targets.' },
      { name: 'Vice Den', description: 'Downtime: roll Tier dice, earn coin equal to highest result minus heat.' },
      { name: 'Tavern', description: '+1d to Consort and Sway rolls on-site.' },
    ],
    [
      { name: 'Ancient Gate', description: 'Safe passage in the deathlands.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Lair', description: 'Your crew\'s headquarters.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
      { name: 'Turf', description: 'Counts as turf for advancing tier.' },
    ],
    [
      { name: 'Secret Routes', description: '+1d to the engagement roll for transport plans.' },
      { name: 'Informants', description: '+1d to gather information for a score.' },
      { name: 'Fleet', description: 'Your cohorts have their own vehicles, quality equal to Tier.' },
      { name: 'Cover Operation', description: '-2 heat per score.' },
      { name: 'Warehouses', description: '+1d to acquire asset rolls.' },
    ],
  ],
}
