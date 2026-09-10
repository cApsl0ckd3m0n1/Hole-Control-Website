# Hole Control website

Public design preview for a new Hole Control alliance website. This is a
separate project from the existing alliance website and Home Lab documentation.

Plain HTML and CSS with a small optional animation script, served by GitHub Pages from `main` at the repository root.
No dependencies, backend, database, tracking, or external fonts.

## Preview locally

Run `python3 -m http.server 8000` in this folder and open localhost:8000.

## Content and remaining work

The copy draws on the owner's descriptions of HC: old-school gamers,
wormhole hunting, nullsec targets through connections, small gang and black ops,
and a level-headed community. The public alliance charter remains linked. It is a design preview, not the final website.
The supplied HC banner is included unchanged at assets/hole-control-banner.png.
Both uploaded copies were byte-identical; only one is stored. The site uses
orange and purple accents drawn from the banner and preserves the full artwork
at all widths. Recruitment and diplomatic contact links and a new domain
are pending. The existing holecontrol.space domain is not being changed.
The historical superlative about alliance age awaits a supporting source before
publication. No operational charter details are duplicated in the site.

GitHub Pages is public. The noindex metadata requests that search engines do
not index this draft; it is not access control.

## Editing

Edit index.html, styles.css, and motion.js. Motion respects reduced-motion preferences; content stays visible without JavaScript. Use relative asset paths for GitHub project
Pages. Keep secrets, private data, infrastructure details, and credentials out
of this repository. Review the diff before pushing; main publishes the preview.
