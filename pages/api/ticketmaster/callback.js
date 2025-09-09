// pages/api/ticketmaster/callback.js
export default async function handler(req, res) {
  const { code } = req.query; // the OAuth code returned by Ticketmaster
  // Exchange the code for an access token (POST to Ticketmaster's OAuth token endpoint)
  // Save token in DB or session
   return res.redirect(302, "/thanks");// or wherever you want the user to land
}
