export interface CartoonAvatar {
  id: string;
  name: string;
  category: string;
  url: string;
  bgGradient: string;
}

export const CARTOON_AVATARS: CartoonAvatar[] = [
  {
    id: 'avatar-1',
    name: 'Avatar 1',
    category: 'Cyber Bot',
    bgGradient: 'from-violet-500 to-indigo-600',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarOneAlpha',
  },
  {
    id: 'avatar-2',
    name: 'Avatar 2',
    category: 'Neo Hero',
    bgGradient: 'from-blue-500 to-cyan-500',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarTwoNeo',
  },
  {
    id: 'avatar-3',
    name: 'Avatar 3',
    category: 'Flame Spark',
    bgGradient: 'from-rose-500 to-red-600',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarThreeFlame',
  },
  {
    id: 'avatar-4',
    name: 'Avatar 4',
    category: 'Golden Titan',
    bgGradient: 'from-amber-400 to-orange-500',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarFourTitan',
  },
  {
    id: 'avatar-5',
    name: 'Avatar 5',
    category: 'Pulse Red',
    bgGradient: 'from-red-500 to-pink-600',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarFivePulse',
  },
  {
    id: 'avatar-6',
    name: 'Avatar 6',
    category: 'Iron Guard',
    bgGradient: 'from-slate-700 to-slate-900',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarSixGuard',
  },
  {
    id: 'avatar-7',
    name: 'Avatar 7',
    category: 'Shadow Knight',
    bgGradient: 'from-indigo-700 to-slate-900',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarSevenKnight',
  },
  {
    id: 'avatar-8',
    name: 'Avatar 8',
    category: 'Ocean Wave',
    bgGradient: 'from-sky-500 to-blue-600',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarEightWave',
  },
  {
    id: 'avatar-9',
    name: 'Avatar 9',
    category: 'Thunder Bolt',
    bgGradient: 'from-yellow-400 to-amber-600',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarNineBolt',
  },
  {
    id: 'avatar-10',
    name: 'Avatar 10',
    category: 'Emerald Bot',
    bgGradient: 'from-emerald-400 to-teal-600',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarTenEmerald',
  },
  {
    id: 'avatar-11',
    name: 'Avatar 11',
    category: 'Solar Flare',
    bgGradient: 'from-orange-500 to-amber-500',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarElevenSolar',
  },
  {
    id: 'avatar-12',
    name: 'Avatar 12',
    category: 'Cosmic Blaze',
    bgGradient: 'from-fuchsia-500 to-purple-700',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarTwelveBlaze',
  },
  {
    id: 'avatar-13',
    name: 'Avatar 13',
    category: 'Star Shield',
    bgGradient: 'from-blue-600 to-indigo-700',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarThirteenStar',
  },
  {
    id: 'avatar-14',
    name: 'Avatar 14',
    category: 'Frost Ice',
    bgGradient: 'from-cyan-400 to-blue-500',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarFourteenFrost',
  },
  {
    id: 'avatar-15',
    name: 'Avatar 15',
    category: 'Pixel Charm',
    bgGradient: 'from-pink-500 to-rose-600',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarFifteenCharm',
  },
  {
    id: 'avatar-16',
    name: 'Avatar 16',
    category: 'Medic Plus',
    bgGradient: 'from-teal-500 to-emerald-600',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AvatarSixteenMedic',
  },
];

export function getAvatarUrl(avatarIdOrUrl?: string | null): string {
  if (!avatarIdOrUrl) {
    return CARTOON_AVATARS[0].url;
  }
  const found = CARTOON_AVATARS.find((a) => a.id === avatarIdOrUrl);
  if (found) return found.url;
  if (avatarIdOrUrl.startsWith('http') || avatarIdOrUrl.startsWith('/')) {
    return avatarIdOrUrl;
  }
  return CARTOON_AVATARS[0].url;
}
