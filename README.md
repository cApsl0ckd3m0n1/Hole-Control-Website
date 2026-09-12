# Hole Control website

Live website: https://holecontrol.duckdns.org/

This repository holds the website source and version history. The site is
served separately by Caddy; GitHub Pages has been disabled. Pushing to `main`
updates the source on GitHub but does not automatically deploy the live site.
This remains a separate project from the existing holecontrol.space website.

Plain HTML and CSS with a small optional animation script. No dependencies,
backend, database, tracking, or external fonts.

## Preview locally

Run `python3 -m http.server 8000` in this folder and open localhost:8000.

## Content and remaining work

The copy draws on the owner's descriptions of HC: old-school gamers,
wormhole hunting, nullsec targets through connections, small gang and black ops,
and a level-headed community. The public alliance charter remains linked.
The original HC banner is preserved at assets/hole-control-banner.png.
The page selects 640px, 1280px, or 1920px WebP copies for smaller downloads,
with the original PNG as a fallback. No artwork is cropped.
The site uses orange and purple accents drawn from the banner and preserves
its full artwork at all widths. Responsive layouts, layered backgrounds,
optional entrance transitions, and floating section navigation are included.

The contact section links to the owner-supplied Legio Noctis Discord invite,
for Hole Control’s executor corporation (Legion of the Night). This is the
corporation’s public contact Discord. Dedicated
recruitment and diplomatic contact details remain pending. The existing
holecontrol.space domain is not being changed. The historical superlative
about alliance age awaits a supporting source before publication. No
operational charter details are duplicated in the site.

The page uses live-site wording and a compact expandable menu on mobile.
Existing noindex metadata remains in place; search-engine indexing is a separate
setting. The live website is public; noindex is not access control.

## Editing and publishing

Edit index.html, styles.css, and motion.js. Motion respects reduced-motion
preferences; content stays visible without JavaScript. Keep relative asset
paths. Review the diff, then commit and push source changes.

Publishing is a separate step: copy only index.html, styles.css, motion.js,
and assets/ into the configured web root. Do not serve the Git checkout,
.git directory, credentials, or private operational documentation. Content
updates do not require a Caddy reload; configuration changes do.

Server-specific deployment and recovery instructions are maintained in the
private Home-Lab-SEAT repository. Keep secrets, private data, infrastructure
details, and credentials out of this public repository.

## Graphics and optimisation

The banner has a CSS wormhole backdrop and a restrained pointer tilt on desktop.
Phones and reduced-motion users receive the static version. Tilt updates are
limited to one animation frame at a time and stop when interaction ends.

WebP copies are approximately 46 KB, 104 KB and 162 KB, compared with the
2.98 MB original. Regenerate them with `python3 scripts/optimise-banner.py`
in a temporary Python environment containing Pillow; Pillow is not a site runtime
dependency. The committed image copies require no build on the web server.

CSS and JavaScript references include content-hash query versions. After editing
either file, refresh its version in index.html to the first 12 characters of its
SHA-256 hash so existing browsers request the new version.

For an existing deployment, run `sudo bash scripts/publish.sh /path/to/web-root`
on the web server. The path is the actual existing serving directory. This
copies the explicit public-file list, preserves a sibling backup, publishes
assets before HTML, and compares deployed files with the staged copies.
It never copies the Git directory or changes Caddy. A failure can leave a partial
update; restore the saved backup if required. Backups are local and still need
an independent copy for disaster recovery. Check the live HTTPS page after publishing.
