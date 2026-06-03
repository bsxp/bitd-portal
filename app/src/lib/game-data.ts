import type { Playbook, CrewType, Hold } from './types'
import { ACTION_RATINGS } from './types'

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

export interface SpecialAbility {
  name: string
  description: string
}

export const PLAYBOOK_ABILITIES: Record<Playbook, SpecialAbility[]> = {
  cutter: [
    { name: 'Battleborn', description: 'You may expend your special armor to reduce harm from an attack in combat or to push yourself during a fight.' },
    { name: 'Bodyguard', description: 'When you protect a teammate, take +1d to your resistance roll. When you gather info to anticipate possible threats in the current situation, you get +1 effect.' },
    { name: 'Ghost Fighter', description: 'You may imbue your hands, melee weapons, or tools with spirit energy. You gain potency in combat vs. the supernatural.' },
    { name: 'Leader', description: 'When you Command a cohort in combat, they continue to fight when they would otherwise break (they\'re not taken out when they suffer level 3 harm). They gain potency and 1 armor.' },
    { name: 'Mule', description: 'Your load limits are higher. Light: 5. Normal: 7. Heavy: 8.' },
    { name: 'Not to Be Trifled With', description: 'You can push yourself to do one of the following: perform a feat of physical force that verges on the superhuman — engage a small gang on equal footing in close combat.' },
    { name: 'Savage', description: 'When you unleash physical violence, it\'s especially frightening. When you Command a frightened target, take +1d.' },
    { name: 'Vigorous', description: 'You recover from harm faster. Permanently fill in one of your healing clock segments. Take +1d to healing treatment rolls.' },
    { name: 'Veteran', description: 'Choose a special ability from another source.' },
  ],
  hound: [
    { name: 'Sharpshooter', description: 'You can push yourself to do one of the following: make a ranged attack at extreme distance beyond what\'s normal for the weapon — unleash a barrage of rapid fire to suppress the enemy.' },
    { name: 'Focused', description: 'You may expend your special armor to resist a consequence of surprise or mental harm (fear, confusion, losing track of someone) or to push yourself for ranged combat or tracking.' },
    { name: 'Ghost Hunter', description: 'Your hunting pet is imbued with spirit energy. It gains potency when tracking or fighting the supernatural, and gains an arcane ability: ghost form, spirit sight, or another.' },
    { name: 'Scout', description: 'When you gather info to discover the location of a target, you get +1 effect. When you hide in a prepared position or use camouflage, you get +1d to rolls to avoid detection.' },
    { name: 'Survivor', description: 'From physical training and target practice, you recover from harm faster. Permanently fill in one of your healing clock segments. Take +1d to healing treatment rolls.' },
    { name: 'Tough as Nails', description: 'Penalties from harm are one level less severe (though level 4 harm is still fatal).' },
    { name: 'Vengeful', description: 'You gain an additional xp trigger: You got payback against someone who harmed you or someone you care about. If your crew helped you get payback, also mark crew xp.' },
    { name: 'Veteran', description: 'Choose a special ability from another source.' },
  ],
  leech: [
    { name: 'Alchemist', description: 'When you invent or craft a creation with alchemical features, take +1 result level to your roll. You begin with one special formula already known.' },
    { name: 'Analyst', description: 'During downtime, you get two ticks to distribute among any long term project clocks that involve investigation or learning a new formula or design plan.' },
    { name: 'Artificer', description: 'When you invent or craft a creation with spark-craft features, take +1 result level to your roll. You begin with one special design already known.' },
    { name: 'Fortitude', description: 'You may expend your special armor to resist a consequence of fatigue, weakness, or chemical effects, or to push yourself when working with technical skill or handling alchemicals.' },
    { name: 'Ghost Ward', description: 'You know how to Wreck an area with arcane substances and methods so it is resistant to supernatural entities and effects.' },
    { name: 'Physicker', description: 'You can Tinker with bones, blood, and bodily humours to treat wounds or stabilize the dying. You may Study a malady or corpse. Everyone in your crew gets +1d to their healing treatment rolls.' },
    { name: 'Saboteur', description: 'When you Wreck, your work is much quieter than it should be and the damage is hidden from casual inspection.' },
    { name: 'Venomous', description: 'Choose a drug or poison (from your bandolier stock) to which you have become immune. You can push yourself to secrete it through your skin or saliva.' },
    { name: 'Veteran', description: 'Choose a special ability from another source.' },
  ],
  lurk: [
    { name: 'Infiltrator', description: 'You are not affected by quality or Tier when you bypass security measures.' },
    { name: 'Ambush', description: 'When you attack from hiding or spring a trap, you get +1d.' },
    { name: 'Daredevil', description: 'When you roll a desperate action, you get +1d to your roll if you also take -1d to any resistance rolls against consequences from your action.' },
    { name: 'The Devil\'s Footsteps', description: 'When you push yourself, choose one of the following additional benefits: perform a feat of athletics that verges on the superhuman — maneuver to confuse your enemies so they mistakenly attack each other.' },
    { name: 'Expertise', description: 'Choose one of your action ratings. When you lead a group action using that action, you can suffer only 1 stress at most, regardless of the number of failed rolls.' },
    { name: 'Ghost Veil', description: 'You may expend your special armor to resist a consequence of detection or to push yourself for a feat of stealth or athletics.' },
    { name: 'Reflexes', description: 'When there\'s a question about who acts first, the answer is you.' },
    { name: 'Shadow', description: 'You may expend your special armor to resist a consequence from detection or to push yourself when you contort to avoid detection.' },
    { name: 'Veteran', description: 'Choose a special ability from another source.' },
  ],
  slide: [
    { name: 'Rook\'s Gambit', description: 'Take 2 stress to roll your best action rating while performing a different action. Say how you adapt your skill to this situation.' },
    { name: 'Cloak & Dagger', description: 'When you use a disguise or other form of covert misdirection, you get +1d to rolls to confuse or redirect suspicion.' },
    { name: 'Ghost Voice', description: 'You know the secret method to interact with a ghost or demon as if it were a normal person, rather than as an arcane entity. You gain potency when communicating with the supernatural.' },
    { name: 'Like Looking into a Mirror', description: 'You can always tell when someone is lying to you.' },
    { name: 'A Little Something on the Side', description: 'At the end of each downtime phase, you earn +2 stash.' },
    { name: 'Mesmerism', description: 'When you Sway someone, you may cause them to forget that it\'s happened until they next interact with you.' },
    { name: 'Subterfuge', description: 'You may expend your special armor to resist a consequence from suspicion or persuasion, or to push yourself for subterfuge.' },
    { name: 'Trust in Me', description: 'You get +1d vs. a target with whom you have an intimate relationship.' },
    { name: 'Veteran', description: 'Choose a special ability from another source.' },
  ],
  spider: [
    { name: 'Foresight', description: 'Two free load of items per score. After the engagement roll, you may spend 1 stress to flash back for free.' },
    { name: 'Calculating', description: 'Due to your careful planning, during downtime, you may give yourself or a crew member +1 downtime activity.' },
    { name: 'Connected', description: 'During downtime, you get +1 result level when you acquire an asset or reduce heat.' },
    { name: 'Ghost Contract', description: 'When you shake on a deal, you and your partner in it are bound to honor the agreement or suffer level 3 harm, "Cursed."' },
    { name: 'Jail Bird', description: 'When incarcerated, your wanted level counts as 1 less, your Tier as 1 more, and you gain +1 faction status with a chosen group while you are in prison.' },
    { name: 'Mastermind', description: 'You may expend your special armor to protect a teammate, or to push yourself when you gather information or work on a long-term project.' },
    { name: 'Weaving the Web', description: 'You gain +1d to Consort when you gather information on a target for a score. You get +1d to the engagement roll for that operation.' },
    { name: 'Veteran', description: 'Choose a special ability from another source.' },
  ],
  whisper: [
    { name: 'Compel', description: 'You can Attune to the ghost field to force a nearby ghost to appear and obey a command you give it. You are not supernaturally terrified by a ghost you summon or compel (though your allies may be).' },
    { name: 'Ghost Mind', description: 'You\'re always aware of supernatural entities in your presence. Take +1d when you gather info about the supernatural.' },
    { name: 'Iron Will', description: 'You\'re immune to the terror that some supernatural entities inflict on sight. Take +1d to resistance rolls with Resolve.' },
    { name: 'Occultist', description: 'You know the secret ways to Consort with ancient powers, forgotten gods or demons. Once you\'ve consorted with one, you get +1d to command cultists who worship it.' },
    { name: 'Ritual', description: 'You can Study an occult ritual (or create a new one) to summon a supernatural effect or being. You know the arcane methods to perform ritual sorcery. You begin with one ritual already learned.' },
    { name: 'Strange Methods', description: 'When you invent or craft a creation with arcane features, take +1 result level to your roll. You begin with one arcane design already known.' },
    { name: 'Tempest', description: 'You can push yourself to do one of the following: unleash a stroke of lightning as a weapon, or summon a storm in your immediate vicinity (torrential rain, roaring winds, heavy fog, chilling frost/snow, etc.).' },
    { name: 'Warded', description: 'You may expend your special armor to resist a supernatural consequence, or to push yourself when you deal with arcane forces.' },
    { name: 'Veteran', description: 'Choose a special ability from another source.' },
  ],
}

// Each playbook's "Shady Friends" — the NPC contacts you pick a friend (and
// rivals) from during character creation. Names match the BitD playbook sheets.
export const PLAYBOOK_CONTACTS: Record<Playbook, string[]> = {
  cutter: [
    'Marlane, a pugilist',
    'Chael, a vicious thug',
    'Mylera, a hostess at the Red Lamp',
    'Veleris, a vicious noble',
    'Grace, a sharp-eyed beggar',
    'Sether, a torturer',
  ],
  hound: [
    'Bricks, a Skovlander gang leader',
    'Sora, a bounty hunter',
    'Roalan, an Iruvian arms dealer',
    'Casta, a physicker',
    'Marla, a fence',
    'Vencel, a hunting guide',
  ],
  leech: [
    'Stamtitz, a teacher of the wreck arts',
    'Roslyn, an alchemist',
    'Vextic, a strange scholar',
    'Malista, a priestess of the Ecstatic Flame',
    'Adicus Sant, a doctor',
    'Nestor, a corpse thief',
  ],
  lurk: [
    'Telda, a beggar',
    'Darmot, a bluecoat',
    'Frake, a locksmith',
    'Roslyn Kellis, a noble',
    'Petra, a city clerk',
  ],
  slide: [
    'Bryl, a drug dealer',
    'Bazso Baz, a gang leader',
    'Klyra, a tavern owner',
    'Nyryx, a prostitute',
    'Harker, a jail-bird',
  ],
  spider: [
    'Lydra, a deal broker',
    'Severos, a tavern owner',
    'Bell, an apothecary',
    'Eckerd, a spy',
    'Vond, an assassin',
    'Hutton, a city clerk',
  ],
  whisper: [
    'Quellyn, a fellow whisper',
    'Mateu, a student of the arcane',
    'Veleris, a vampire',
    'Roethe, an artifact collector',
    'Drysin, an arcane researcher',
    'Andrel, a sculptor',
  ],
}

export const CREW_ABILITIES: Record<CrewType, SpecialAbility[]> = {
  assassins: [
    { name: 'Predators', description: 'When you Gather Info to locate a target or plan an ambush, you get +1 effect.' },
    { name: 'Emperors of the Underworld', description: 'Add +1d to a Command or Sway roll when you give an ultimatum, lay down the law, or deliver a threat to another member of the underworld.' },
    { name: 'Crow\'s Veil', description: 'After your crew kills someone, take +1d to rolls to lay low and reduce heat from the law.' },
    { name: 'Ghost Division', description: 'Your hunting grounds extend into the spirit world. You may add the spectral trait to your cohorts, even gangs.' },
    { name: 'Patron', description: 'Your crew is favored by an important person of higher Tier. When the patron calls on you for a special mission, gain +1 rep for the operation and an extra die to the engagement roll.' },
    { name: 'No Traces', description: 'When your crew makes a killing, you reduce the heat from the job by 2.' },
    { name: 'Vipers', description: 'Each PC may add 1 minor ability from a different crew type, as if they had the Veteran ability — or pick a damage bonus for poisons.' },
    { name: 'Veteran', description: 'Choose a special ability from another crew.' },
  ],
  bravos: [
    { name: 'Insurance', description: 'When a member of your crew is arrested, your contacts and threats help. Take +1d to incarceration rolls.' },
    { name: 'Forged Papers', description: 'When you fast-talk officials, you have the papers to back it up. Take +1d when you smuggle goods or people past inspection.' },
    { name: 'Deadly', description: 'Each PC may add +1 harm to attacks they make in dangerous situations during combat.' },
    { name: 'Vipers', description: 'When you Skirmish or Wreck to inflict harm with a gang, you get +1 scale for the action.' },
    { name: 'Patron', description: 'Your crew is favored by an important person of higher Tier. When the patron calls on you for a special mission, gain +1 rep for the operation and an extra die to the engagement roll.' },
    { name: 'War Dogs', description: 'Take +1d to a roll when you Skirmish or Wreck against a foe of higher Tier (and you do not suffer reduced effect for their advantage).' },
    { name: 'The Coats Are Off', description: 'When your gang fights with you and stands their ground, they gain +1 scale and morale.' },
    { name: 'Veteran', description: 'Choose a special ability from another crew.' },
  ],
  cult: [
    { name: 'Anointed', description: 'When you perform an arcane ritual, take +1d to the roll. You may use a Tier-equal arcane implement as if it were Fine quality.' },
    { name: 'Chosen', description: 'One member of your crew is the chosen of your deity. They begin with +1 stress box and may serve as a special cohort.' },
    { name: 'Conviction', description: 'You may use your faith to push yourself or resist a consequence, drawing on the favor of your deity rather than your own stress reserves.' },
    { name: 'Zealotry', description: 'When your crew faces certain death or terrible fortune in service of your deity, you may sacrifice a member to call upon a miracle.' },
    { name: 'Glin', description: 'Your crew is shrouded in your deity\'s power. Take +1d to lay low or hide from earthly authorities while honoring your faith.' },
    { name: 'Sworn', description: 'When a member of your cult dies, their spirit lingers to aid the crew. You may add the spectral trait to a cohort.' },
    { name: 'Communion', description: 'When you Attune to commune with your deity for guidance, the GM will tell you the path forward and you take +1d to the engagement roll for any operation it sanctions.' },
    { name: 'Veteran', description: 'Choose a special ability from another crew.' },
  ],
  hawkers: [
    { name: 'Closer', description: 'When you make a deal to sell goods or services, you may push yourself to get +1 result level on the transaction.' },
    { name: 'Higher Ambition', description: 'You gain an additional xp trigger: you contended with challenges above your current station. When in doubt, the GM decides.' },
    { name: 'Hometown Hero', description: 'When you reduce heat by laying low in your hunting grounds, take +1d. The locals help cover for you.' },
    { name: 'Honest Work', description: 'Once per downtime phase, gain +1 coin from a legitimate front business that washes your dirty money.' },
    { name: 'Patron', description: 'Your crew is favored by an important person of higher Tier. When the patron calls on you for a special mission, gain +1 rep for the operation and an extra die to the engagement roll.' },
    { name: 'Sumptuous Manor', description: 'Your crew\'s lair includes a luxurious venue. Take +1d to Consort and Sway rolls made there.' },
    { name: 'The Good Stuff', description: 'When you sell quality product, the customer is hooked. Take +1 coin per sale and +1d to rolls to entangle them as a contact.' },
    { name: 'Veteran', description: 'Choose a special ability from another crew.' },
  ],
  shadows: [
    { name: 'Everyone Steals', description: 'When your crew earns coin from a score, you also earn +1 stash (split among the crew) from the small valuables you skim along the way.' },
    { name: 'Ghost Echoes', description: 'Your crew can attune to the echoes of the past in a location. When you Gather Information about a place\'s history or hidden features, you get +1 effect.' },
    { name: 'Patron', description: 'Your crew is favored by an important person of higher Tier. When the patron calls on you for a special mission, gain +1 rep for the operation and an extra die to the engagement roll.' },
    { name: 'Pack Rats', description: 'You get an extra item slot when you choose your gear for a score, and your "fine" items are of exceptional quality.' },
    { name: 'Second Story', description: 'Your crew is expert at infiltration from above. When you use climbing gear or rooftop approaches, you get +1d to rolls to bypass an obstacle or avoid detection.' },
    { name: 'Slippery', description: 'After the crew rolls for an entanglement, you may spend 2 rep to roll again and take the better result. The crew is hard to pin down.' },
    { name: 'Synchronized', description: 'When your crew performs a group action, the leader may suffer only 1 stress at most from the roll, no matter how many crew members fail.' },
    { name: 'Veteran', description: 'Choose a special ability from another crew.' },
  ],
  smugglers: [
    { name: 'Steady Hands', description: 'When your crew transports goods or people, take +1d to the engagement roll for the operation.' },
    { name: 'Like Part of the Family', description: 'When you acquire an asset or reduce heat by working with a vehicle crew or transport cohort, you get +1 result level.' },
    { name: 'All Hands', description: 'When members of your crew work together to crew a vehicle or vessel, the whole group acts as one and the leader suffers reduced stress from the group action.' },
    { name: 'Reavers', description: 'Your vehicles are built for trouble. Your crew\'s vehicles get +1 quality, and gain a built-in feature (armor, speed, or a hidden compartment).' },
    { name: 'Patron', description: 'Your crew is favored by an important person of higher Tier. When the patron calls on you for a special mission, gain +1 rep for the operation and an extra die to the engagement roll.' },
    { name: 'Ghost Passage', description: 'Your crew knows safe routes through the deathlands and ghost field. You may travel into spirit-haunted territory without the usual dangers.' },
    { name: 'A Little Something for the Effort', description: 'When your crew completes a delivery or transport score, each PC earns +1 stash.' },
    { name: 'Veteran', description: 'Choose a special ability from another crew.' },
  ],
}

// ── Abilities that require extra player input when selected ──
// Captured into Character.ability_details under `${abilityName}:${field.key}`.
// `options` are suggestions only — every field also accepts free text.
export type AbilityInputKind = 'select' | 'text'

export interface AbilityInputField {
  key: string
  kind: AbilityInputKind
  label: string
  placeholder?: string
  options?: string[]
}

// Every ability name except Veteran — the pool Veteran can pull from.
const VETERAN_OPTIONS = Array.from(
  new Set(Object.values(PLAYBOOK_ABILITIES).flat().map((a) => a.name)),
)
  .filter((name) => name !== 'Veteran')
  .sort()

const ACTION_OPTIONS = Object.values(ACTION_RATINGS)
  .flat()
  .map((a) => a.charAt(0).toUpperCase() + a.slice(1))

export const ABILITY_INPUTS: Record<string, AbilityInputField[]> = {
  Veteran: [
    { key: 'pick', kind: 'select', label: 'Ability from another playbook', placeholder: 'Choose or type an ability…', options: VETERAN_OPTIONS },
  ],
  'Ghost Hunter': [
    { key: 'pet', kind: 'text', label: 'Your hunting pet', placeholder: 'Describe your pet (species, name, look)…' },
    { key: 'arcane', kind: 'select', label: "Pet's arcane ability", placeholder: 'Choose or type…', options: ['Ghost form', 'Spirit sight', 'Ghost touch', 'Ghostly howl', 'Possession'] },
  ],
  Expertise: [
    { key: 'action', kind: 'select', label: 'Action rating', placeholder: 'Choose an action…', options: ACTION_OPTIONS },
  ],
  Venomous: [
    { key: 'toxin', kind: 'select', label: 'Drug or poison', placeholder: 'Choose or type…', options: ['Drift', 'Trance powder', 'Battlebrew', 'Grave dust', 'Spark essence', 'Standstill', 'Croaker'] },
  ],
  Alchemist: [
    { key: 'formula', kind: 'text', label: 'Starting special formula', placeholder: 'Name the formula you begin knowing…' },
  ],
  Artificer: [
    { key: 'design', kind: 'text', label: 'Starting special design', placeholder: 'Name the spark-craft design you begin knowing…' },
  ],
  Ritual: [
    { key: 'ritual', kind: 'text', label: 'Starting ritual', placeholder: 'Name the ritual you begin knowing…' },
  ],
  'Strange Methods': [
    { key: 'design', kind: 'text', label: 'Starting arcane design', placeholder: 'Name the arcane design you begin knowing…' },
  ],
}

// Abilities that grant a special-armor box. Selecting one flips on the
// character's special armor; deselecting (with no other such ability) flips it off.
export const SPECIAL_ARMOR_ABILITIES = new Set<string>([
  'Battleborn', // Cutter
  'Focused',    // Hound
  'Fortitude',  // Leech
  'Ghost Veil', // Lurk
  'Shadow',     // Lurk
  'Subterfuge', // Slide
  'Mastermind', // Spider
  'Warded',     // Whisper
])

// Stress boxes per playbook. The Hound runs hot — one extra box.
export const PLAYBOOK_MAX_STRESS: Record<Playbook, number> = {
  cutter: 9,
  hound: 10,
  leech: 9,
  lurk: 9,
  slide: 9,
  spider: 9,
  whisper: 9,
}

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

export interface GameItem {
  name: string
  load: number
}

export const PLAYBOOK_ITEMS: Record<Playbook, GameItem[]> = {
  cutter: [
    { name: 'Fine hand weapon', load: 1 },
    { name: 'Fine heavy weapon', load: 2 },
    { name: 'Scary weapon or tool', load: 1 },
    { name: 'Manacles & chain', load: 1 },
    { name: 'Rage essence vial', load: 1 },
    { name: 'Spiritbane charm', load: 1 },
  ],
  hound: [
    { name: 'Fine pair of pistols', load: 1 },
    { name: 'Fine long rifle', load: 2 },
    { name: 'Electroplasmic ammunition', load: 1 },
    { name: 'A trained hunting pet', load: 0 },
    { name: 'Spyglass', load: 1 },
    { name: 'Spiritbane charm', load: 1 },
  ],
  leech: [
    { name: 'Fine tinkering tools', load: 1 },
    { name: 'Fine wrecking tools', load: 2 },
    { name: 'Blowgun & darts, syringes', load: 1 },
    { name: 'Bandolier', load: 1 },
    { name: 'Gadgets', load: 1 },
    { name: 'Spiritbane charm', load: 1 },
  ],
  lurk: [
    { name: 'Fine lockpicks', load: 1 },
    { name: 'Fine shadow cloak', load: 2 },
    { name: 'Light climbing gear', load: 1 },
    { name: 'Silence potion vial', load: 1 },
    { name: 'Dark-sight goggles', load: 1 },
    { name: 'Spiritbane charm', load: 1 },
  ],
  slide: [
    { name: 'Fine clothes & jewelry', load: 1 },
    { name: 'Fine disguise kit', load: 1 },
    { name: 'Fine loaded dice, cards', load: 1 },
    { name: 'Trance powder', load: 1 },
    { name: 'A cane-sword', load: 1 },
    { name: 'Spiritbane charm', load: 1 },
  ],
  spider: [
    { name: 'Fine cover identity', load: 0 },
    { name: 'Fine bottle of whiskey', load: 1 },
    { name: 'Blueprints', load: 1 },
    { name: 'Small wrecking tools', load: 1 },
    { name: 'Spiritbane charm', load: 1 },
    { name: 'Signal ring', load: 0 },
  ],
  whisper: [
    { name: 'Fine lightning hook', load: 2 },
    { name: 'Fine spirit mask', load: 1 },
    { name: 'Electroplasm vials', load: 1 },
    { name: 'Spirit bottles (2)', load: 1 },
    { name: 'Ghost key', load: 0 },
    { name: 'Spiritbane charm', load: 1 },
  ],
}

export const STANDARD_ITEMS: GameItem[] = [
  { name: 'A Blade or Two', load: 1 },
  { name: 'Throwing Knives', load: 1 },
  { name: 'A Pistol', load: 1 },
  { name: 'A 2nd Pistol', load: 1 },
  { name: 'A Large Weapon', load: 2 },
  { name: 'An Unusual Weapon', load: 1 },
  { name: 'Armor', load: 2 },
  { name: '+Heavy', load: 3 },
  { name: 'Burglary Gear', load: 1 },
  { name: 'Climbing Gear', load: 2 },
  { name: 'Arcane Implements', load: 1 },
  { name: 'Documents', load: 1 },
  { name: 'Subterfuge Supplies', load: 1 },
  { name: 'Demolition Tools', load: 2 },
  { name: 'Tinkering Tools', load: 1 },
  { name: 'Lantern', load: 1 },
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

// The claims grid is 3 rows x 5 columns. Each claim is keyed by its position
// as `${row},${col}` (rows 0-2, cols 0-4) — position-based because several
// cells share the name "Turf". The center cell (1,2) is the crew's Lair.
export const CLAIMS_ROWS = 3
export const CLAIMS_COLS = 5
export const CLAIM_LAIR_ROW = 1
export const CLAIM_LAIR_COL = 2

export function claimKey(r: number, c: number): string {
  return `${r},${c}`
}

export function isLairCell(r: number, c: number): boolean {
  return r === CLAIM_LAIR_ROW && c === CLAIM_LAIR_COL
}

// Orthogonal (up/down/left/right) neighbors of a cell within the 3x5 grid.
export function claimNeighbors(r: number, c: number): Array<[number, number]> {
  const deltas: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  const result: Array<[number, number]> = []
  for (const [dr, dc] of deltas) {
    const nr = r + dr
    const nc = c + dc
    if (nr >= 0 && nr < CLAIMS_ROWS && nc >= 0 && nc < CLAIMS_COLS) {
      result.push([nr, nc])
    }
  }
  return result
}

// A claim may be seized only if it is adjacent to an already-seized claim or
// the Lair. The Lair itself is always considered held.
export function canSeizeClaim(r: number, c: number, claimsSeized: string[]): boolean {
  if (isLairCell(r, c)) return true
  return claimNeighbors(r, c).some(
    ([nr, nc]) => isLairCell(nr, nc) || claimsSeized.includes(claimKey(nr, nc)),
  )
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

// ── Crew Upgrades ──
// Filled boxes are modeled as repeated entries in Crew.upgrades: the number of
// boxes filled for an upgrade = the count of its `name` in the array. A 2-box
// upgrade's 2nd box grants `secondBenefit`. A 4-box upgrade (Training group)
// grants its `unlock` (e.g. Mastery) — that unlock is DERIVED, not stored.
export interface CrewUpgrade {
  name: string
  boxes: 1 | 2 | 4
  description: string
  // The additional benefit gained when the 2nd box of a 2-box upgrade is filled.
  secondBenefit?: string
  // The linked ability granted once all 4 boxes of a 4-box group are filled.
  unlock?: string
}

export const COMMON_CREW_UPGRADES: { group: string; upgrades: CrewUpgrade[] }[] = [
  {
    group: 'Lair',
    upgrades: [
      { name: 'Carriage', boxes: 2, description: 'You have a carriage, two goats to pull it, and a stable. (Most carriages in Doskvol use the large Akorosian goat as their draft animal.)', secondBenefit: 'A second box improves the carriage with armor and larger, swifter goats.' },
      { name: 'Boat', boxes: 2, description: 'You have a boat, a dock on a waterway, and a small shack to store boating supplies.', secondBenefit: 'A second box improves the boat with armor and more cargo capacity.' },
      { name: 'Hidden', boxes: 1, description: 'Your lair has a secret location and is disguised to hide it from view. If your lair is discovered, use downtime activities and pay coin equal to your Tier to relocate it and hide it once again.' },
      { name: 'Quarters', boxes: 1, description: 'Your lair includes living quarters for the crew. Without this upgrade, each PC sleeps elsewhere, and is vulnerable when they do so.' },
      { name: 'Secure', boxes: 2, description: 'Your lair has locks, alarms, and traps to thwart intruders.', secondBenefit: 'A second box improves the defenses to include arcane measures that work against spirits. You might roll your crew\'s Tier if these measures are ever put to the test.' },
      { name: 'Vault', boxes: 2, description: 'Your lair has a secure vault, increasing your storage capacity for coin to 8.', secondBenefit: 'A second box increases your capacity to 16. A separate part of your vault can be used as a holding cell.' },
      { name: 'Workshop', boxes: 1, description: 'Your lair has a workshop appointed with tools for tinkering and alchemy, as well as a small library of books, documents, and maps. You may accomplish long-term projects with these assets without leaving your lair.' },
    ],
  },
  {
    group: 'Quality',
    upgrades: [
      { name: 'Documents', boxes: 1, description: 'Improves the quality rating of all the PCs\' documents, beyond the quality established by the crew\'s Tier and fine items.' },
      { name: 'Gear', boxes: 1, description: 'Improves the quality rating of all the PCs\' gear (covers Burglary Gear and Climbing Gear), beyond Tier and fine items.' },
      { name: 'Implements', boxes: 1, description: 'Improves the quality rating of all the PCs\' arcane implements, beyond Tier and fine items.' },
      { name: 'Supplies', boxes: 1, description: 'Improves the quality rating of all the PCs\' subterfuge supplies, beyond Tier and fine items.' },
      { name: 'Tools', boxes: 1, description: 'Improves the quality rating of all the PCs\' tools (covers Demolitions Tools and Tinkering Tools), beyond Tier and fine items.' },
      { name: 'Weapons', boxes: 1, description: 'Improves the quality rating of all the PCs\' weapons, beyond Tier and fine items.' },
    ],
  },
  {
    group: 'Training',
    upgrades: [
      { name: 'Insight', boxes: 1, description: 'When you train Insight during downtime, you mark 2 xp (instead of 1) on the Insight track.', unlock: 'Mastery' },
      { name: 'Prowess', boxes: 1, description: 'When you train Prowess during downtime, you mark 2 xp (instead of 1) on the Prowess track.', unlock: 'Mastery' },
      { name: 'Resolve', boxes: 1, description: 'When you train Resolve during downtime, you mark 2 xp (instead of 1) on the Resolve track.', unlock: 'Mastery' },
      { name: 'Personal', boxes: 1, description: 'When you train your playbook during downtime, you mark 2 xp (instead of 1) on your playbook xp track.', unlock: 'Mastery' },
    ],
  },
  {
    group: 'Cohorts',
    upgrades: [
      { name: 'Gang', boxes: 1, description: 'A cohort is a gang or a single expert NPC who works for your crew. This adds a Gang cohort (Adepts, Rooks, Rovers, Skulks, or Thugs). Recruiting a new cohort costs two upgrade boxes.' },
      { name: 'Expert', boxes: 1, description: 'A cohort is a gang or a single expert NPC who works for your crew. This adds an Expert cohort (a Doctor, Spy, Occultist, Assassin, etc.). Recruiting a new cohort costs two upgrade boxes.' },
    ],
  },
]

// The derived unlock granted by the Training group: filling all 4 of these
// boxes grants Mastery. Keyed by group name → { unlock, description, prerequisites }.
export const CREW_UPGRADE_UNLOCKS: Record<string, { unlock: string; description: string; prerequisites: string[] }> = {
  Training: {
    unlock: 'Mastery',
    description: 'Your crew has access to master level training. You may advance your PCs\' action ratings to 4 (until you unlock this upgrade, PC action ratings are capped at 3). This costs four upgrade boxes to unlock.',
    prerequisites: ['Insight', 'Prowess', 'Resolve', 'Personal'],
  },
}

export const CREW_SPECIFIC_UPGRADES: Record<CrewType, CrewUpgrade[]> = {
  assassins: [
    { name: 'Assassin Rigging', boxes: 1, description: 'You get 2 free load worth of weapon or gear items. For example, you could carry a pistol (a weapon) and burglary tools (gear) for zero load.' },
    { name: 'Ironhook Contacts', boxes: 1, description: 'Your Tier is effectively +1 higher in prison. This counts for any Tier-related element in prison, including the incarceration roll.' },
    { name: 'Elite Skulks', boxes: 1, description: 'All of your cohorts with the Skulks type get +1d to quality rolls for Skulk-related actions.' },
    { name: 'Elite Thugs', boxes: 1, description: 'All of your cohorts with the Thugs type get +1d to quality rolls for Thug-related actions.' },
    { name: 'Hardened', boxes: 1, description: 'Each PC gets +1 trauma box. This costs three upgrades to unlock, not just one. This may bring a PC with 4 trauma back into play if you wish.' },
  ],
  bravos: [
    { name: 'Bravos Rigging', boxes: 1, description: 'You get 2 free load worth of weapon or armor items. For example, you could carry a sword & pistol or wear normal armor for zero load.' },
    { name: 'Ironhook Contacts', boxes: 1, description: 'Your Tier is effectively +1 higher in prison. This counts for any Tier-related element in prison, including the incarceration roll.' },
    { name: 'Elite Rovers', boxes: 1, description: 'All of your cohorts with the Rovers type get +1d to quality rolls for Rover-related actions.' },
    { name: 'Elite Thugs', boxes: 1, description: 'All of your cohorts with the Thugs type get +1d to quality rolls for Thug-related actions.' },
    { name: 'Hardened', boxes: 1, description: 'Each PC gets +1 trauma box. This costs three upgrades to unlock, not just one. This may bring a PC with 4 trauma back into play if you wish.' },
  ],
  cult: [
    { name: 'Cult Rigging', boxes: 1, description: 'You get 2 free load worth of document or implement items. For example, you could carry a profane book of curses and a demon\'s hand for zero load.' },
    { name: 'Ritual Sanctum in Lair', boxes: 1, description: 'This counts as a sacred and arcane workshop for occult practices and rituals.' },
    { name: 'Elite Adepts', boxes: 1, description: 'All of your cohorts with the Adepts type get +1d to quality rolls for Adept-related actions.' },
    { name: 'Elite Thugs', boxes: 1, description: 'All of your cohorts with the Thugs type get +1d to quality rolls for Thug-related actions.' },
    { name: 'Ordained', boxes: 1, description: 'Each PC gets +1 trauma box. This costs three upgrades to unlock, not just one. This may bring a PC with 4 trauma back into play if you wish.' },
  ],
  hawkers: [
    { name: 'Hawker Rigging', boxes: 1, description: 'One carried item is concealed and has no load. For example, you could carry a load of drugs or a weapon, perfectly concealed, for zero load.' },
    { name: 'Ironhook Contacts', boxes: 1, description: 'Your Tier is effectively +1 higher in prison. This counts for any Tier-related element in prison, including the incarceration roll.' },
    { name: 'Elite Rooks', boxes: 1, description: 'All of your cohorts with the Rooks type get +1d to quality rolls for Rook-related actions.' },
    { name: 'Elite Thugs', boxes: 1, description: 'All of your cohorts with the Thugs type get +1d to quality rolls for Thug-related actions.' },
    { name: 'Composed', boxes: 1, description: 'Each PC gets +1 stress box. This costs three upgrades to unlock, not just one.' },
  ],
  shadows: [
    { name: 'Thief Rigging', boxes: 1, description: 'You get 2 free load worth of tool or gear items. For example, you could carry burglary gear and tinkering tools for zero load.' },
    { name: 'Underground Maps and Passkeys', boxes: 1, description: 'You have easy passage through the underground canals, tunnels, and basements of the city.' },
    { name: 'Elite Rooks', boxes: 1, description: 'All of your cohorts with the Rooks type get +1d to quality rolls for Rook-related actions.' },
    { name: 'Elite Skulks', boxes: 1, description: 'All of your cohorts with the Skulks type get +1d to quality rolls for Skulk-related actions.' },
    { name: 'Steady', boxes: 1, description: 'Each PC gets +1 stress box. This costs three upgrades to unlock, not just one.' },
  ],
  smugglers: [
    { name: 'Smuggler Rigging', boxes: 1, description: 'Two of your carried items are perfectly concealed. You could carry 1 load of contraband and a pistol, perfectly concealed, even against a pat down.' },
    { name: 'Camouflage', boxes: 1, description: 'Your vehicles are perfectly concealed when at rest. They blend in as part of the environment, or as an uninteresting civilian vehicle (your choice).' },
    { name: 'Elite Rovers', boxes: 1, description: 'All of your cohorts with the Rovers type get +1d to quality rolls for Rover-related actions.' },
    { name: 'Barge', boxes: 1, description: 'Add mobility to your lair. You can move it to a new location as a downtime activity.' },
    { name: 'Steady', boxes: 1, description: 'Each PC gets +1 stress box. This costs three upgrades to unlock, not just one.' },
    { name: 'Vehicle', boxes: 2, description: 'All smugglers start with a vehicle (a boat or carriage).', secondBenefit: 'When the vehicle is upgraded (the second box), it also gets armor.' },
  ],
}
