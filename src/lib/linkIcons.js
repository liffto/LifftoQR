// The fixed set of icons a link-tree link can carry, shared by the picker in
// the create form, the preview, and the public scan page — so a link drawn one
// place looks the same everywhere. The stored value is the `key`, a short
// string; `website` (a globe) is the default and the "custom" choice for
// anything without a brand.
//
// react-icons/fa6 for real brand marks. Each carries its brand colour, drawn on
// a fixed light chip (see LinkIconChip) so a black mark (X, TikTok) stays
// visible in dark mode too — the same trick a phone home screen uses for tiles.

import {
  FaGlobe,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaYoutube,
  FaXTwitter,
  FaTiktok,
  FaLinkedinIn,
  FaSnapchat,
  FaTelegram,
  FaPinterestP,
  FaSpotify,
  FaTwitch,
  FaDiscord,
  FaGithub,
  FaThreads,
  FaEnvelope,
  FaPhone,
  FaLink,
} from 'react-icons/fa6'

export const LINK_ICONS = [
  { key: 'website', name: 'Website', Icon: FaGlobe, color: '#1B59F5' },
  { key: 'instagram', name: 'Instagram', Icon: FaInstagram, color: '#E4405F' },
  { key: 'facebook', name: 'Facebook', Icon: FaFacebookF, color: '#1877F2' },
  { key: 'whatsapp', name: 'WhatsApp', Icon: FaWhatsapp, color: '#25D366' },
  { key: 'youtube', name: 'YouTube', Icon: FaYoutube, color: '#FF0000' },
  { key: 'x', name: 'X (Twitter)', Icon: FaXTwitter, color: '#000000' },
  { key: 'tiktok', name: 'TikTok', Icon: FaTiktok, color: '#000000' },
  { key: 'linkedin', name: 'LinkedIn', Icon: FaLinkedinIn, color: '#0A66C2' },
  { key: 'snapchat', name: 'Snapchat', Icon: FaSnapchat, color: '#0B0B0B' },
  { key: 'telegram', name: 'Telegram', Icon: FaTelegram, color: '#26A5E4' },
  { key: 'pinterest', name: 'Pinterest', Icon: FaPinterestP, color: '#BD081C' },
  { key: 'spotify', name: 'Spotify', Icon: FaSpotify, color: '#1DB954' },
  { key: 'twitch', name: 'Twitch', Icon: FaTwitch, color: '#9146FF' },
  { key: 'discord', name: 'Discord', Icon: FaDiscord, color: '#5865F2' },
  { key: 'github', name: 'GitHub', Icon: FaGithub, color: '#181717' },
  { key: 'threads', name: 'Threads', Icon: FaThreads, color: '#000000' },
  { key: 'email', name: 'Email', Icon: FaEnvelope, color: '#5B6472' },
  { key: 'phone', name: 'Phone', Icon: FaPhone, color: '#5B6472' },
  { key: 'link', name: 'Other link', Icon: FaLink, color: '#5B6472' },
]

const BY_KEY = Object.fromEntries(LINK_ICONS.map((i) => [i.key, i]))

/** The registry entry for a key, falling back to the globe for null/unknown. */
export function linkIcon(key) {
  return BY_KEY[key] || BY_KEY.website
}
