// node scripts/fetch-tm-url.mjs "NBA YoungBoy" "Raleigh" "2025-10-01" "2025-10-31"
import fetch from "node-fetch";

const API_KEY = process.env.TM_API_KEY;
if (!API_KEY) throw new Error("Set TM_API_KEY in your env.");

const [artist = "NBA YoungBoy", city = "Raleigh", from = "2025-10-01", to = "2025-10-31"] = process.argv.slice(2);

// 1) find attractionId
const aRes = await fetch(`https://app.ticketmaster.com/discovery/v2/attractions.json?keyword=${encodeURIComponent(artist)}&countryCode=US&apikey=${API_KEY}`);
const aJson = await aRes.json();
const attraction = aJson?._embedded?.attractions?.[0];
const attractionId = attraction?.id;

const fromUTC = `${from}T00:00:00Z`;
const toUTC   = `${to}T23:59:59Z`;

// 2) fetch events
const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
if (attractionId) url.searchParams.set("attractionId", attractionId);
else url.searchParams.set("keyword", artist);
url.searchParams.set("city", city);
url.searchParams.set("countryCode", "US");
url.searchParams.set("startDateTime", fromUTC);
url.searchParams.set("endDateTime", toUTC);
url.searchParams.set("size", "25");
url.searchParams.set("sort", "date,asc");
url.searchParams.set("apikey", API_KEY);

const eRes = await fetch(url);
const eJson = await eRes.json();

const events = eJson?._embedded?.events || [];
if (!events.length) {
  console.log("No events found.");
  process.exit(0);
}

for (const ev of events) {
  const name = ev.name;
  const date = ev.dates?.start?.localDate || "";
  const venue = ev._embedded?.venues?.[0]?.name || "";
  const link = ev.url;
  console.log(`${date} | ${venue} | ${name}\n${link}\n`);
}

// Optionally print just the first URL for automation
console.log("FIRST_URL=", events[0]?.url || "");
