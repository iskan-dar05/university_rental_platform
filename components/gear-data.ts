export type GearItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  alt: string;
  available: number;
  condition: string;
  includes: string[];
};

export const categories = [
  "All gear",
  "Media & production",
  "Computing",
  "Event supplies",
  "Audio",
];

export const gear: GearItem[] = [
  {
    id: "canon-dslr-kit",
    name: "Canon DSLR Kit",
    category: "Media & production",
    description: "Capture crisp stills and video for class projects, interviews, and campus events.",
    price: 18,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85",
    alt: "Digital camera ready for a photo shoot",
    available: 3,
    condition: "Excellent",
    includes: ["Canon DSLR body", "18-55mm lens", "2 batteries", "Shoulder strap"],
  },
  {
    id: "event-speaker",
    name: "Portable Speaker",
    category: "Event supplies",
    description: "A portable sound system for presentations, club events, and small gatherings.",
    price: 12,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=85",
    alt: "Portable speaker on a clean background",
    available: 5,
    condition: "Good",
    includes: ["Bluetooth speaker", "Power adapter", "Carry case"],
  },
  {
    id: "camera-tripod",
    name: "Camera Tripod",
    category: "Media & production",
    description: "Keep your camera steady for long exposures, interviews, and group portraits.",
    price: 6,
    image: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=1000&q=85",
    alt: "Camera tripod set up for a shoot",
    available: 4,
    condition: "Excellent",
    includes: ["Aluminum tripod", "Quick-release plate", "Carry bag"],
  },
  {
    id: "portrait-lens",
    name: "Portrait Lens",
    category: "Media & production",
    description: "A bright prime lens for portraits, low-light scenes, and documentary work.",
    price: 10,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=1000&q=85",
    alt: "Camera lens photographed up close",
    available: 2,
    condition: "Excellent",
    includes: ["50mm lens", "Front and rear caps", "Protective pouch"],
  },
  {
    id: "folding-chair",
    name: "Event Chair Set",
    category: "Event supplies",
    description: "A set of lightweight folding chairs for pop-ups, screenings, and presentations.",
    price: 9,
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=85",
    alt: "Modern chair in a bright studio",
    available: 6,
    condition: "Good",
    includes: ["4 folding chairs", "Storage straps"],
  },
  {
    id: "studio-microphone",
    name: "Studio Microphone",
    category: "Audio",
    description: "Record clear voice audio for podcasts, voiceovers, and narrated presentations.",
    price: 8,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=85",
    alt: "Microphone in a recording studio",
    available: 2,
    condition: "Excellent",
    includes: ["USB condenser mic", "Desk stand", "Pop filter", "USB cable"],
  },
  {
    id: "portable-projector",
    name: "Portable Projector",
    category: "Event supplies",
    description: "Share a film, presentation, or portfolio on a big screen in any classroom.",
    price: 14,
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=1000&q=85",
    alt: "Projector displaying a film in a dark room",
    available: 1,
    condition: "Good",
    includes: ["1080p projector", "HDMI cable", "Remote", "Carry case"],
  },
  {
    id: "creator-laptop",
    name: "Creator Laptop",
    category: "Computing",
    description: "A capable laptop for editing, design software, and production on the go.",
    price: 24,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85",
    alt: "Open laptop on a desk",
    available: 4,
    condition: "Excellent",
    includes: ["16GB RAM laptop", "Power adapter", "Protective sleeve"],
  },
  {
    id: "led-light-kit",
    name: "LED Light Kit",
    category: "Media & production",
    description: "Shape a soft, balanced light for portrait sessions, interviews, and product shots.",
    price: 16,
    image: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=1000&q=85",
    alt: "Photography lighting equipment in a studio",
    available: 3,
    condition: "Good",
    includes: ["2 LED panels", "Diffusers", "2 light stands", "Carry bag"],
  },
  {
    id: "wireless-mic-kit",
    name: "Wireless Mic Kit",
    category: "Audio",
    description: "Move freely on camera with a compact wireless microphone kit for interviews.",
    price: 11,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1000&q=85",
    alt: "Audio recording equipment arranged on a desk",
    available: 2,
    condition: "Good",
    includes: ["Wireless transmitter", "Receiver", "Lavalier mic", "Charging cable"],
  },
];

export function getGearItem(id: string) {
  return gear.find((item) => item.id === id);
}