/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/components/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/styles/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    // shared siblings if you import from them:
    "../btv-core/**/*.{ts,tsx,js,jsx,mdx}",
    "../btv-creative/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: { colors: { neutral: { 950: "#0a0a0a" } } },
  },
  safelist: [
    "bg-white","text-black","bg-neutral-900","text-neutral-300","hover:bg-neutral-800",
    "grid","grid-cols-1","md:grid-cols-2","md:grid-cols-3","gap-3",
    "aspect-video","rounded-xl","border","border-neutral-800","bg-black","bg-neutral-950",
    "absolute","left-2","top-2","text-xs","px-2","py-1","rounded","bg-white/80",
    "left-1/2","-translate-x-1/2",
  "pointer-events-none","pointer-events-auto",
  "z-10","z-20",
  "bg-white/80","opacity-60"
  ],
  darkMode: ["class"],
  plugins: [],
};
