# Deploying planetpilot.world

The site is plain static HTML, CSS and a little JS. There is no build step: the
repository root IS the website. Test it locally with:

    python -m http.server 8180
    # then open http://127.0.0.1:8180/

Recommended host: **(a) GitHub Pages**, free, with HTTPS. (b) Railway is the
alternative if you would rather keep everything on Railway (paid plan usage).

Nothing has been pushed, deployed or changed in DNS yet.

---

## Before going live: the placeholders

All links that are not known yet live in ONE file, `assets/js/config.js`:

| Setting | Now | Set it to |
| --- | --- | --- |
| `STEAM_URL` | empty: Wishlist buttons open a Steam search for "Planet Pilot" | the store URL, e.g. `https://store.steampowered.com/app/1234567/Planet_Pilot/` |
| `YOUTUBE_ID` | empty: the trailer slot shows the key art and "Trailer coming soon" | the video id after `watch?v=` |
| `DISCORD_URL` | empty: shown as "Discord: coming soon" | the invite link |
| `OPEN_DATA_BASE` | empty: downloads say "Download at launch" | the GitHub release download URL, ending in `/` |
| `OPEN_DATA_SCRIPTS_URL` | empty: the button opens an email to opendata@ | the repo or folder holding the bake scripts |

Edit, commit, push: the site updates in about a minute.

Also do before launch:
- **Email addresses.** The pages use `privacy@`, `press@`, `support@`, `bugs@` and
  `opendata@planetpilot.world`. In Namecheap: Domain List > planetpilot.world >
  Manage > Mail Settings > **Email Forwarding**, and forward each one (or a
  catch-all `*`) to your inbox. This adds Namecheap's MX records; it does not
  conflict with the website records below.
- **Privacy policy** (`/privacy/`): marked "Draft, to be reviewed". Have it
  reviewed, then delete the yellow notice in `privacy/index.html`. If the legal
  workstream finishes `store/steam/PRIVACY_POLICY.md` (branch ln-legal), replace
  the text with it.
- **Screenshots v2.** When `store/steam/screenshots_v2` is ready: fill `SLOTS_V2`
  in `tools/build_assets.py` (slot name -> new PNG file name) and run
  `python tools/build_assets.py`. It rewrites `assets/shots/*`, the key art, the
  fonts and the press ZIP. No HTML edits needed.

---

## (a) GitHub Pages (recommended, free)

### 1. Create the repo and turn on Pages (one command)

Needs Arthur's OK to create a **public** repo `ArthurPluto/planetpilot-site`.

    bash deploy/github-pages.sh

It creates the repo, pushes `main`, enables Pages from `main` / root and sets the
custom domain `planetpilot.world` (the `CNAME` file in the repo says the same).
Other owner or name: `OWNER=... REPO=... bash deploy/github-pages.sh`.

Manual equivalent: create the public repo on github.com, `git remote add origin
...` and `git push -u origin main`, then Settings > Pages > Source "Deploy from a
branch", branch `main`, folder `/ (root)`, Custom domain `planetpilot.world`.

### 2. Namecheap DNS

Namecheap > Domain List > planetpilot.world > Manage > **Advanced DNS**.

First **delete** the default records Namecheap adds to a new domain: the
`CNAME www -> parkingpage.namecheap.com` and the `URL Redirect @` record.

Then add exactly these (TTL Automatic):

| Type | Host | Value |
| --- | --- | --- |
| A Record | `@` | `185.199.108.153` |
| A Record | `@` | `185.199.109.153` |
| A Record | `@` | `185.199.110.153` |
| A Record | `@` | `185.199.111.153` |
| CNAME Record | `www` | `arthurpluto.github.io.` |

Optional, for IPv6 (recommended):

| Type | Host | Value |
| --- | --- | --- |
| AAAA Record | `@` | `2606:50c0:8000::153` |
| AAAA Record | `@` | `2606:50c0:8001::153` |
| AAAA Record | `@` | `2606:50c0:8002::153` |
| AAAA Record | `@` | `2606:50c0:8003::153` |

The CNAME target is `<github user>.github.io` in lower case, never the repo
name. Leave the Mail Settings MX records alone.

Recommended against domain takeover: verify the domain on your GitHub account
(github.com > Settings > Pages > Add a domain). GitHub shows one TXT record
(`_github-pages-challenge-arthurpluto` with a code); add it in Advanced DNS too.

Check propagation (usually minutes, up to a few hours):

    nslookup planetpilot.world
    nslookup www.planetpilot.world

### 3. HTTPS

Once the records resolve, GitHub issues a Let's Encrypt certificate by itself
(up to about an hour). Then tick **Enforce HTTPS** in Settings > Pages, or:

    gh api -X PUT repos/ArthurPluto/planetpilot-site/pages -F https_enforced=true

`www.planetpilot.world` then redirects to `https://planetpilot.world/`.

### 4. Updating the site later

    git add -A && git commit -m "..." && git push

GitHub Pages rebuilds in about a minute. (`.nojekyll` is in the repo so files
are served as is.) Sizes are well inside the limits: about 22 MB in total, the
hero loop is 4.6 MB, the press ZIP 11 MB.

---

## (b) Railway (alternative)

Uses `deploy/railway/Dockerfile` (Caddy serving the folder, gzip/zstd, cache
headers for /assets, the custom 404 page).

    railway init                     # new project, e.g. "planetpilot-site"
    railway variables --set RAILWAY_DOCKERFILE_PATH=deploy/railway/Dockerfile
    railway up                       # build and deploy from this folder
    railway domain planetpilot.world # prints the DNS target(s)

DNS in Namecheap Advanced DNS (delete the parking records first, as above):
- `www`: CNAME Record to the target Railway prints (`xxxx.up.railway.app`).
- `@` (apex): Namecheap cannot put a CNAME on `@`, so use an **ALIAS Record**
  `@` -> the same Railway target, or point `@` with a URL Redirect Record to
  `https://www.planetpilot.world` and use www as the main address.
- Add the `_railway-verify` TXT record if Railway asks for one.

Railway issues HTTPS on its own once DNS resolves. Downsides compared to (a):
it bills usage, and the apex needs the ALIAS workaround.

---

## Open data release (for /open-data/)

Package the ODbL databases from the game repo
(`C:\Users\arthu\skybound-godot\data\world\odbl\`) as release assets, with the
file names in `OPEN_DATA_FILES` in `assets/js/config.js`:

| Asset | Contents |
| --- | --- |
| `planetpilot-odbl-buildings.zip` | `buildings/` (all region .bin + index.bin), `city_towers.json`, `LICENSE.txt` |
| `planetpilot-odbl-roads.zip` | `roadgraph.bin`, `roads.bin`, `roadprof/`, `LICENSE.txt` |
| `planetpilot-odbl-green.zip` | `green/`, `LICENSE.txt` |
| `planetpilot-odbl-city-water.zip` | `city_water.bin`, the patched lake data, `LICENSE.txt` |
| `planetpilot-odbl-coast.zip` | `coast_ov_osm.bin`, `LICENSE.txt` |
| `SOURCES.txt` | as is |

Then put the release URL (ending in `/`) in `OPEN_DATA_BASE`. Publishing the bake
scripts (`tools/bake_*.py` etc. listed on the page) next to it satisfies the
"method" part; set `OPEN_DATA_SCRIPTS_URL` to it.
