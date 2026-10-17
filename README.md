# Pearlies Dental Clinic — website

A multi-page, static dental clinic website. No build step, no dependencies —
open `index.html` and it works.

## Preview

```bash
cd dental-clinic
python3 -m http.server 5101 --bind 0.0.0.0
```

Then open http://localhost:5101

## Features

- Professional, clean, premium design system (CSS variables for easy rebranding)
- Full-page loading screen with progress bar
- Skeleton loading states on service/team/gallery grids
- Cinematic hero entrance, scroll reveals, parallax, card tilt, button ripples
- Responsive (mobile, tablet, desktop)
- Accessible: skip link, focus rings, reduced-motion support, semantic HTML
- SEO: meta tags, Open Graph, Dentist structured data
- Pages: Home, Services, About/Team, Gallery, Reviews, FAQ, Contact/Booking, Journal (index + 3 posts)

## Rebranding

Edit the `:root` variables at the top of `assets/styles.css` (colors) and
replace placeholder text ("Pearlies Dental Clinic", "Kalanki, Kathmandu", phone, email)
across the HTML files. The clinic name appears in the masthead, footer, loader
and structured data.

## Deploy

Any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages.
No build command needed.
