import { defineSiteContent } from '@profitstudio/booking-engine';

/**
 * What the owner can change in the dashboard (Website). The defaults are the
 * site's own copy and photos: until the owner publishes, the page shows
 * exactly these.
 *
 * Not here on purpose: services, prices, durations, opening hours, the
 * business name, address, phone and email — they come from the engine.
 *
 * Never rename or reuse an id once the site is live (the owner's text is stored
 * under it). Add a new id instead.
 *
 * This file is also imported by vite.config.ts (build-time content), so it may
 * only import from the engine package.
 */

const SEO_HELP =
  'Search engines and link previews show new text after the website is next deployed.';

export const siteContent = defineSiteContent({
  sections: [
    {
      id: 'brand',
      label: 'Brand',
      description: 'Logo, colours and the heading style. The layout stays the same.',
      fields: [
        {
          type: 'image',
          id: 'brand.logo',
          label: 'Logo',
          help: 'Optional. A wide logo on a transparent or paper-coloured background. Until you add one, the shop name is set in the heading typeface.',
          default: null,
          aspectRatio: 4,
        },
        {
          type: 'color',
          id: 'brand.board',
          label: 'Board green',
          help: 'The menu board, the footer and the headings. It carries paper-coloured text, so it must stay dark.',
          default: '#163B2C',
          contrastWith: '#F3EDE1',
          minContrast: 7,
        },
        {
          type: 'color',
          id: 'brand.accent',
          label: 'Accent',
          help: 'The Book buttons. Paper-coloured text sits on it.',
          default: '#6B1E23',
          contrastWith: '#F3EDE1',
          minContrast: 4.5,
        },
        {
          type: 'choice',
          id: 'brand.headings',
          label: 'Heading style',
          default: 'slab',
          options: [
            { value: 'slab', label: 'Heritage slab', description: 'Sturdy, sign-painted lettering (Besley).' },
            { value: 'serif', label: 'High-contrast serif', description: 'Finer and more editorial (DM Serif Display).' },
            { value: 'grotesk', label: 'Modern grotesk', description: 'Bold and plain (Schibsted Grotesk).' },
          ],
        },
      ],
    },
    {
      id: 'seo',
      label: 'Search & sharing',
      description: 'How the site appears in search results and link previews.',
      fields: [
        {
          type: 'text',
          id: 'seo.title',
          label: 'Page title',
          help: SEO_HELP,
          default: 'Northline Barbers — Barbershop in Brooklyn, New York',
          maxLength: 70,
          required: true,
        },
        {
          type: 'longText',
          id: 'seo.description',
          label: 'Description',
          help: SEO_HELP,
          default:
            'Cuts, fades, beard trims and hot-towel shaves in Brooklyn. See the menu and prices, check our hours and book a chair online in a minute or two.',
          maxLength: 160,
          rows: 3,
          required: true,
        },
      ],
    },
    {
      id: 'hero',
      label: 'Hero',
      description: 'The first screen visitors see.',
      fields: [
        {
          type: 'text',
          id: 'hero.kicker',
          label: 'Small line above the headline',
          default: 'Barbershop · Brooklyn, New York',
          maxLength: 48,
        },
        {
          type: 'text',
          id: 'hero.title',
          label: 'Headline',
          default: 'Sharp cuts, easy chairs.',
          maxLength: 48,
          required: true,
        },
        {
          type: 'longText',
          id: 'hero.lede',
          label: 'Introduction',
          default:
            'Cuts, fades, beards and hot-towel shaves for regulars, first-timers and everyone in between. Grab a time from your phone in a minute or two.',
          maxLength: 220,
          rows: 3,
        },
        {
          type: 'text',
          id: 'hero.cta',
          label: 'Button',
          default: 'Book a chair',
          maxLength: 24,
          required: true,
        },
        {
          type: 'image',
          id: 'hero.photo',
          label: 'Photo',
          help: 'A close, warm photo of the work. Portrait (4:5); the edges may be cropped on phones.',
          default: {
            src: '/photos/hero-fade-960.webp',
            alt: "A barber's clippers sharpening the line of a skin fade above a client's ear, in warm shop light",
            width: 960,
            height: 1200,
          },
          aspectRatio: 4 / 5,
        },
      ],
    },
    {
      id: 'menu',
      label: 'The menu',
      description: 'Services, prices and times come from Services in this dashboard.',
      fields: [
        { type: 'text', id: 'menu.title', label: 'Title', default: 'The menu', maxLength: 40, required: true },
        {
          type: 'longText',
          id: 'menu.lede',
          label: 'Introduction',
          default:
            "Straight prices, honest timings. Not sure which one you need? Book the closest and we'll sort it out in the chair.",
          maxLength: 200,
          rows: 3,
        },
      ],
    },
    {
      id: 'book',
      label: 'Booking',
      description: 'The booking section. The steps themselves are part of the site.',
      fields: [
        { type: 'text', id: 'book.title', label: 'Title', default: 'Book a chair', maxLength: 40, required: true },
        {
          type: 'longText',
          id: 'book.lede',
          label: 'Introduction',
          default: "Choose a service, pick a time, confirm with the code we email you. That's it.",
          maxLength: 200,
          rows: 2,
        },
        {
          type: 'text',
          id: 'book.pending',
          label: 'Message after a request',
          help: 'Shown when a client has confirmed their email and you still need to confirm the appointment.',
          default: "Request received — we'll confirm your chair shortly.",
          maxLength: 90,
          required: true,
        },
        {
          type: 'text',
          id: 'book.confirmed',
          label: 'Message after an instant booking',
          help: 'Shown when instant confirmation is on (Settings).',
          default: "You're booked. See you in the chair.",
          maxLength: 90,
          required: true,
        },
      ],
    },
    {
      id: 'team',
      label: 'The barbers',
      description: 'Until you save your own team, the site shows sample profiles labelled as samples.',
      fields: [
        { type: 'text', id: 'team.title', label: 'Title', default: 'The barbers', maxLength: 40, required: true },
        {
          type: 'longText',
          id: 'team.lede',
          label: 'Introduction',
          default: "You book a time, not a barber: we keep one calendar and have a chair ready when you walk in.",
          maxLength: 200,
          rows: 2,
        },
        {
          type: 'list',
          id: 'team.members',
          label: 'Team',
          itemLabel: 'Barber',
          maxItems: 8,
          minItems: 1,
          fields: [
            { type: 'text', id: 'name', label: 'Name', default: '', maxLength: 40, required: true },
            { type: 'text', id: 'role', label: 'Speciality', default: '', maxLength: 48 },
            { type: 'longText', id: 'bio', label: 'Short bio', default: '', maxLength: 220, rows: 3 },
            {
              type: 'image',
              id: 'photo',
              label: 'Portrait',
              help: 'Portrait (4:5). Without one, the card shows a photo of the tools labelled "Sample photo".',
              default: null,
              aspectRatio: 4 / 5,
            },
          ],
          default: [
            {
              name: 'Andre W.',
              role: 'Fades & line-ups',
              bio: "Skin fades, tapers and line-ups that still look sharp in week three. Happy to talk sneakers — or to work in comfortable silence.",
            },
            {
              name: 'Rosa M.',
              role: 'Scissor cuts & longer hair',
              bio: 'Scissor work, textured crops and growing it out without the awkward stage. Ask her for a plan, not a lecture.',
            },
            {
              name: 'Sam O.',
              role: 'Shaves & beards',
              bio: 'Hot-towel shaves and beard shaping. Brings the calm, keeps the razor steady and the towels properly hot.',
            },
          ],
        },
      ],
    },
    {
      id: 'shop',
      label: 'The shop',
      description: 'What a first-timer can expect.',
      fields: [
        { type: 'text', id: 'shop.title', label: 'Title', default: 'The shop', maxLength: 40, required: true },
        {
          type: 'longText',
          id: 'shop.lede',
          label: 'Introduction',
          default:
            'A bright room with classic hydraulic chairs, records on through the day and the kettle always on. First time in? Here is how a visit goes.',
          maxLength: 260,
          rows: 3,
        },
        {
          type: 'image',
          id: 'shop.photo',
          label: 'Photo of the room',
          help: 'Landscape (3:2). Shown wide; the top and bottom may be cropped.',
          default: {
            src: '/photos/shop-chairs-1280.webp',
            alt: 'A row of green leather barber chairs with chrome frames on a black-and-white tiled floor',
            width: 1280,
            height: 853,
          },
          aspectRatio: 3 / 2,
        },
        {
          type: 'image',
          id: 'shop.detail',
          label: 'Detail photo',
          help: 'Portrait (4:5): a close-up of the work.',
          default: {
            src: '/photos/shop-lather-720.webp',
            alt: 'A client leans back while a barber brushes warm lather into his beard before a shave',
            width: 720,
            height: 900,
          },
          aspectRatio: 4 / 5,
        },
        {
          type: 'list',
          id: 'shop.notes',
          label: 'About the room',
          itemLabel: 'Note',
          maxItems: 4,
          fields: [
            { type: 'text', id: 'title', label: 'Title', default: '', maxLength: 32, required: true },
            { type: 'longText', id: 'text', label: 'Text', default: '', maxLength: 180, rows: 2 },
          ],
          default: [
            { title: 'The chairs', text: 'Old-school hydraulic chairs with a proper headrest. Sit back; we do the adjusting.' },
            { title: 'The music', text: 'Soul and jazz through the day, a little more bass after five. Too loud? Just say so.' },
            { title: 'The pace', text: "Unhurried. Every appointment has its own time, so nobody's rushed out of the chair." },
          ],
        },
        {
          type: 'list',
          id: 'shop.steps',
          label: 'A first visit, step by step',
          itemLabel: 'Step',
          maxItems: 5,
          fields: [
            { type: 'text', id: 'title', label: 'Title', default: '', maxLength: 32, required: true },
            { type: 'longText', id: 'text', label: 'Text', default: '', maxLength: 180, rows: 2 },
          ],
          default: [
            { title: 'Arrive at your time', text: 'No need to come early. Say hi at the counter and grab a seat.' },
            { title: 'Talk it through', text: "How you wear it, what's bugging you, what you'd like next time. Photos welcome." },
            { title: 'The cut', text: 'Clippers, scissors or a razor — whatever the job needs, and nothing it doesn\'t.' },
            { title: 'The finish', text: 'A clean neckline, a quick style and a look in the mirror together before you go.' },
          ],
        },
      ],
    },
    {
      id: 'reviews',
      label: 'Kind words',
      description: 'Until you save your own, the site shows placeholder examples labelled as such. Only add words clients really wrote.',
      fields: [
        { type: 'toggle', id: 'reviews.show', label: 'Show this section', default: true },
        { type: 'text', id: 'reviews.title', label: 'Title', default: 'Kind words', maxLength: 40, required: true },
        {
          type: 'list',
          id: 'reviews.items',
          label: 'Quotes',
          itemLabel: 'Quote',
          maxItems: 6,
          minItems: 1,
          fields: [
            { type: 'longText', id: 'quote', label: 'Quote', default: '', maxLength: 240, rows: 3, required: true },
            { type: 'text', id: 'name', label: 'Who said it', default: '', maxLength: 48 },
          ],
          default: [
            {
              quote: 'Came in nervous about my first fade. Left booking the next one.',
              name: 'Example: a first-timer',
            },
            {
              quote: 'Booked at nine, in the chair by lunch. Same cut I always ask for, done right.',
              name: 'Example: a regular',
            },
            {
              quote: 'Patient with my son, quick with me. We both walked out happy.',
              name: 'Example: a parent',
            },
          ],
        },
      ],
    },
    {
      id: 'visit',
      label: 'Hours & directions',
      description: 'Hours, address, phone and email come from Settings and Hours in this dashboard.',
      fields: [
        { type: 'text', id: 'visit.title', label: 'Title', default: 'Hours & directions', maxLength: 40, required: true },
        {
          type: 'longText',
          id: 'visit.directions',
          label: 'Getting here',
          default:
            'Tap Directions for the quickest route from wherever you are. Running late, or need to move your appointment? Give us a call.',
          maxLength: 280,
          rows: 3,
        },
        {
          type: 'image',
          id: 'visit.photo',
          label: 'Shopfront photo',
          help: 'Optional: your own shopfront, portrait (4:5). Until you add one, the site shows a painted window sign.',
          default: null,
          aspectRatio: 4 / 5,
        },
      ],
    },
    {
      id: 'footer',
      label: 'Footer',
      fields: [
        {
          type: 'text',
          id: 'footer.note',
          label: 'Footer line',
          default: 'Cuts, fades, beards and hot-towel shaves in Brooklyn, New York.',
          maxLength: 100,
        },
      ],
    },
  ],
});

export type SiteContent = typeof siteContent;
