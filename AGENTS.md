# Playlist publishing workflow

The site owner has requested a standing workflow: when they describe a new listening mood, create the corresponding original article, update the site, verify it, then commit, push to origin/main, and deploy to the existing Cloudflare Worker. Do not require a separate publishing request each time. Ask only when a missing decision, expired authorization, or privacy-sensitive detail prevents safe completion.

- Write Korean articles centered on the owner's supplied real experiences and the specific reasons for each song and transition. Do not invent experiences, quotations, contract details, or listening results.
- Aim for original publisher value, not a song list padded to an arbitrary word count. Never promise AdSense approval or imply any fixed length guarantees it.
- Use the real one-person authorship: KPOP YANGON 운영자, with Person authorship in article structured data and KPOP YANGON as publisher.
- Check new tracks against existing articles; avoid duplicates unless the owner explicitly asks to reuse a track.
- Verify official artist, label, broadcaster, or licensed distributor video sources and public/embeddable status. Create the matching public YouTube playlist when authorization is available, and verify its order before connecting it.
- Update the homepage latest playlist/TOP 5 candidates, scene playlist cards, archive, and sitemap. Use the actual publication date in Asia/Rangoon.
- Verify JavaScript syntax, internal links, track/video mappings, canonical metadata, sitemap, and deployed responses. Distinguish server/metadata checks from actual device playback tests.
- Keep credentials, OAuth tokens, and local YouTube synchronization state out of Git and public assets. Preserve unrelated user changes and stage only the intended task files.
- Keep alcohol as contextual scenery when relevant; do not promote it as a sleep aid or make unsupported health claims.
- Report the live article link and commit identifier concisely after publishing, and state any remaining playback or authorization limitations honestly.
