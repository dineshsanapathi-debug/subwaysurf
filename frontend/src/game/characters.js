export const CHARACTERS = {
  Dinesh: {
    name: 'Dinesh',
    title: 'Camo Rail Surfer',
    color: '#d4a373', // Camo Tan
    hoodieColor: '#e9d5a1', // Beige hood
    camoGreen: '#526046', // Olive camo patch
    camoBrown: '#6b4a2d', // Earth camo patch
    shirtColor: '#0f172a', // Black inner tee
    pantsColor: '#1e293b', // Dark charcoal jeans
    shoesColor: '#ef4444', // Retro red & white skate shoes
    skinColor: '#c68642', // Warm tan tone
    hairColor: '#171717', // Curly dark hair
    hasSkateboard: true,
    avatar: '/dinesh-avatar.jpg',
    icon: '🛹',
    description: 'Curly dark hair, trimmed beard, camo zip-up hoodie over black tee, dark jeans, retro red kicks, and a custom graffiti railboard.',
    stats: { speed: 99, jump: 95, magnet: 92 },
    ability: 'Speed Spark Rail Glide'
  },
  Jake: {
    name: 'Jake',
    title: 'The Mascot Runner',
    color: '#2563eb', // Denim Blue
    hoodieColor: '#94a3b8', // Grey hoodie
    skinColor: '#fcd5b4',
    capColor: '#ef4444', // Red cap
    capBrimColor: '#22c55e', // Green graffiti brim
    pantsColor: '#3b82f6', // Light blue jeans
    shoesColor: '#22c55e', // Green tongue kicks
    icon: '🧢',
    description: 'Iconic street runner with graffiti cap, grey hoodie, denim vest, and spray paint can.',
    stats: { speed: 95, jump: 88, magnet: 80 },
    ability: 'Super Sprinter Dash'
  },
  Tricky: {
    name: 'Tricky',
    title: 'Geek-Chic Skater',
    color: '#ffffff', // White crop top
    beanieColor: '#dc2626', // Red beanie
    hairColor: '#facc15', // Blonde hair
    glassesColor: '#0f172a', // Thick black frames
    skinColor: '#fde0cb',
    waistbandColor: '#ef4444', // Red waistband
    pantsColor: '#60a5fa', // Baggy boyfriend jeans
    shoesColor: '#22c55e', // Skate sneakers
    icon: '👓',
    description: 'Red beanie, blonde pigtails, signature black square glasses, crop top, and baggy skater denim.',
    stats: { speed: 88, jump: 98, magnet: 82 },
    ability: 'High-Flying Airtime'
  },
  Fresh: {
    name: 'Fresh',
    title: 'Retro Beatboxer',
    color: '#22c55e', // Green jersey
    hairColor: '#171717', // Flat-top fade
    glassesColor: '#0f172a', // Black glasses
    skinColor: '#8d5b4c', // Brown skin tone
    pantsColor: '#dc2626', // Red shorts
    shoesColor: '#ef4444', // Red kicks
    socksColor: '#ffffff', // White crew socks
    hasBoombox: true,
    icon: '📻',
    description: 'Flat-top fade haircut, black frames, green tank top, red shorts, and an 80s boombox on shoulder.',
    stats: { speed: 90, jump: 85, magnet: 88 },
    ability: 'Groovy Multiplier'
  },
  Yutani: {
    name: 'Yutani',
    title: 'Alien Bug Mascot',
    color: '#84cc16', // Lime green suit
    suitDark: '#65a30d',
    skinColor: '#fcd5b4',
    eyeColor: '#ffffff',
    stalkColor: '#7c3aed', // Purple antennae
    isAlienSuit: true,
    icon: '👽',
    description: 'Full lime-green alien bug mascot suit with stalk eyes, purple antennae, cute face, and 4 arms.',
    stats: { speed: 85, jump: 85, magnet: 100 },
    ability: 'Cosmic Magnet Pulse'
  }
};

// Aliases for backwards compatibility
CHARACTERS.Dash = CHARACTERS.Jake;
CHARACTERS.Luna = CHARACTERS.Tricky;
CHARACTERS.Bolt = CHARACTERS.Yutani;
