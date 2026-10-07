# Deploying planetpilot.world

The site is plain static HTML, CSS and a little JS. There is no build step: the
`docs/` folder IS the website, and only `docs/` is published (GitHub Pages serves
`main` / `docs`). `tools/`, `deploy/` and this file stay private. Test locally:

    python -m http.server 8180 -d docs
    # then open http://127.0.0.1:8180/

Recommended host: **(a) GitHub Pages**, free, with HTTPS. (b) Railway is the
alternative if you would rather keep everything on Railway (paid plan usage).

Nothing has been pushed, deployed or changed in DNS yet.

---

## Before going live: the placeholders

All links that are not known yet live in ONE file, `docs/assets/js/config.js`:

| Setting | Now | Set it to |
| --- | --- | --- |
| `STEAM_URL` | empty: Wishlist buttons open a Steam search for "Planet Pilot" | the store URL, e.g. `https://store.steampowered.com/app/1234567/Planet_Pilot/` |
| `YOUTUBE_ID` | empty: the trailer slot shows the key art and "Trailer coming soon" | the video id after `watch?v=` |
| `DISCORD_URL` | empty: shown as "Discord: coming soon" | the invite link |
| `OPEN_DATA_ZIP_URL` | empty: "Download at launch" | the release asset `planetpilot-odbl-v<version>.zip` |
| `OPEN_DATA_REPO_URL` | empty: "Published at launch" | the public repo with the bake scripts and the two CC BY-SA models |

Edit, commit, push: the site updates in about a minute.

Also do before launch:
- **Email addresses.** The pages use `privacy@` (also the game's contact, and the
  open-data contact), `press@`, `support@` and `bugs@planetpilot.world`. In Namecheap: Domain List > planetpilot.world >
  Manage > Mail Settings > **Email Forwarding**, and forward each one (or a
  catch-all `*`) to your inbox. This adds Namecheap's MX records; it does not
  conflict with the website records below.
- **Privacy policy and open data** (`/privacy/`, `/open-data/`): the text is
  `store/steam/PRIVACY_POLICY.md` and `store/steam/OPEN_DATA.md` from the game's
  dev branch (the game links these two pages), plus a short "This website"
  section on /privacy/. Keep them in step when those files change. /privacy/
  is marked "Draft, to be reviewed": delete the yellow notice in
  `docs/privacy/index.html` after the lawyer's review. The policy promises
  90-day retention, which needs the server change listed at the end of
  PRIVACY_POLICY.md before launch.
- **Screenshots.** `tools/build_assets.py` maps slot names to
  `store/steam/screenshots_v2/*.png` (SLOTS) and redraws the old "Sparrow Cub"
  label in shots 08 and 09 (LABEL_FIX; drop it once they are recaptured). Run
  `python tools/build_assets.py` after any art change; no HTML edits needed.

---

## (a) GitHub Pages (recommended, free)

### 1. Create the repo and turn on Pages (one command)

Needs Arthur's OK to create a **public** repo `ArthurPluto/planetpilot-site`.

    bash deploy/github-pages.sh

It creates the repo, pushes `main`, enables Pages from `main` / `docs` and sets the
custom domain `planetpilot.world` (`docs/CNAME` says the same).
Other owner or name: `OWNER=... REPO=... bash deploy/github-pages.sh`.

Manual equivalent: create the public repo on github.com, `git remote add origin
...` and `git push -u origin main`, then Settings > Pages > Source "Deploy from a
branch", branch `main`, folder `/docs`, Custom domain `planetpilot.world`.

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
are served as is.) Only `docs/` is served. Sizes are well inside the limits: about 22 MB in total, the
hero loop is 4.6 MB, the press ZIP 10 MB.

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

As planned in `store/steam/OPEN_DATA.md`: one ZIP per game release,
`planetpilot-odbl-v<version>.zip` (about 200 MB), with every file listed on the
page, `ODBL_LICENSE.txt`, `ODBL_SOURCES.txt` and a README on the binary formats,
as a GitHub release asset of a public repo (for example
`ArthurPluto/planetpilot-open-data`). Put the bake scripts and the two CC BY-SA
models (`christ_redeemer.glb`, `mount_rushmore.glb` with their notice) in the same
repo. Then set `OPEN_DATA_ZIP_URL` and `OPEN_DATA_REPO_URL`. Creating that repo
also needs Arthur's OK.
