/* =====================================================================
   WABI ARCHITECTS — PROJECT LIST
   ---------------------------------------------------------------------
   Every project on the website comes from this one file:
     • Projects page  — all projects, in the order listed here
     • Finishing page — every project whose "work" includes "finishing"
     • Homepage       — "More from the portfolio" shows the newest ones

   TO ADD A NEW PROJECT
   1. Put its pictures in  assets/img/projects/<project-id>/
      (JPG, about 1600 px wide is plenty).
      Name them 01.jpg, 02.jpg … in the order you want them shown —
      01.jpg is the cover.
   2. Copy the TEMPLATE block below, paste it at the TOP of the list
      (the newest project shows first), and fill it in.
   3. Save. That's it — the cards, sketch, details and gallery build
      themselves. Leave out any line you don't know.

   ---------------------------------------------------------------------
   TEMPLATE  (copy everything from { to }, )
   {
     id: 'bole-apartment',                 // short name, no spaces — used in links
     title: 'Bole Apartment',
     work: ['design'],                     // 'design', 'finishing' or both
     type: 'Apartment Building',           // shown under the title
     category: 'Residential',              // Residential · Hospitality · Commercial · Mixed-use · Public
     year: '2026',
     location: 'Bole, Addis Ababa',
     client: 'Private',
     status: 'In progress',                // 'Completed', 'In progress' — or leave out
     storeys: { above: 7, basements: 1, mezzanine: 0 },   // G+7, B-1  (leave out for interiors)
     site: '579 m²',
     scope: ['Architecture', 'Interior design'],
     description: 'Two or three sentences about the project.',
     images: gallery('bole-apartment', 6),  // 01.jpg … 06.jpg — the first one is the cover
     drawings: [                           // optional: plans, elevations, sheets
       { src: 'assets/img/projects/bole-apartment/drawing-01.jpg', caption: 'Front elevation' }
     ]
   },
   ===================================================================== */

/* gallery('my-project', 6)  ->  assets/img/projects/my-project/01.jpg … 06.jpg */
function gallery(id, n) {
  var out = [];
  for (var i = 1; i <= n; i++) out.push('assets/img/projects/' + id + '/' + (i < 10 ? '0' : '') + i + '.jpg');
  return out;
}

window.WABI_PROJECTS = [

  /* ---------------- design & visualisation ---------------- */
  {
    id: 'gulifa-coffee',
    title: 'Gulifa Coffee',
    work: ['design'],
    type: 'Café',
    category: 'Hospitality',
    year: '2025', date: 'January 2025',
    location: 'Addis Ababa',
    client: 'Gulifa Coffee',
    scope: ['Architecture', 'Interior design'],
    description: "A signature café for the Gulifa Coffee brand — a light steel-and-glass pavilion wrapped in landscaping, with a bright interior in the brand's teal and warm timber palette. The design moves from a street-front terrace through a daylit dining hall to the barista counter and display, giving the brand a calm, modern home.",
    images: gallery('gulifa-coffee', 8)
  },
  {
    id: 'residential-design',
    title: 'Residential Design',
    work: ['design'],
    type: 'Family Residence',
    category: 'Residential',
    year: '2024', date: 'August 2024',
    location: 'Addis Ababa',
    client: 'Private',
    storeys: { above: 4, basements: 0 },
    scope: ['Interior design'],
    description: 'Interior design for a G+4 family residence, planned around one long open space — a kitchen with an island counter and bar seating that runs straight into an oval dining table. Navy accents tie the rooms together, timber slat walls and built-in shelving warm the bedrooms and study corners, and full-height sheer curtains keep the living rooms bright.',
    images: gallery('residential-design', 7)
  },
  {
    id: 'business-commercial-space',
    title: 'Business / Commercial Space',
    work: ['design'],
    type: 'Office Interior',
    category: 'Commercial',
    year: '2024', date: 'April 2024',
    location: 'Addis Ababa',
    client: '3TMB P.L.C',
    site: '86 m² designed area',
    scope: ['Interior design'],
    description: 'The office design balanced the needs of different roles while bringing in green accents. The reception area for the secretary and manager needed careful planning so it would not feel cramped, while the spacious CEO office offers ample room and privacy.',
    images: gallery('business-commercial-space', 4),
    drawings: [{ src: 'assets/img/proj/sheet-19.jpg', caption: 'Portfolio sheet' }]
  },
  {
    id: 'liquor-store',
    title: 'Liquor Store',
    work: ['design'],
    type: 'Retail Interior',
    category: 'Commercial',
    year: '2024', date: 'March 2024',
    location: 'Mekelle',
    client: 'Private',
    scope: ['Interior design', 'Shopfront'],
    description: 'A retail interior for a liquor store in Mekelle. Back-lit shelving set into dark timber walls frames the bottles, a central display island and tufted ottoman break up the floor, and a lounge corner by the glazing gives customers a place to sit and taste. Outside, a full-height glazed shopfront with timber fins brings the store to the street.',
    images: gallery('liquor-store', 8)
  },
  {
    id: 'ascent-hotel',
    title: 'Ascent Hotel',
    work: ['design'],
    type: 'Hotel',
    category: 'Hospitality',
    year: '2024', date: 'February 2024',
    location: 'Addis Ababa',
    client: 'Private',
    scope: ['Hospitality design', 'Interior design'],
    description: 'Elevating hospitality through a fusion of form and function. The design blends careful detailing with practical planning — carefully designed guest rooms, a refreshing rooftop pool, and inviting lounge areas across two floors.',
    images: gallery('ascent-hotel', 6)
  },
  {
    id: 'residence-lounge-entertainment',
    title: 'Residence Lounge & Entertainment',
    work: ['design'],
    type: 'Residential Interior',
    category: 'Residential',
    year: '2024',
    location: 'Addis Ababa',
    client: 'Private',
    scope: ['Interior design'],
    description: "A full interior scheme for a private residence's lounge and entertainment floor — dark timber coffered ceilings, a sculptural bar, aquarium feature walls and layered pendant lighting create a rich, club-like atmosphere for hosting, balanced with soft seating groups for everyday family life.",
    images: gallery('residence-lounge-entertainment', 8)
  },
  {
    id: 'rooftop-restaurant-lounge',
    title: 'Rooftop Restaurant & Lounge',
    work: ['design'],
    type: 'Restaurant',
    category: 'Hospitality',
    year: '2024',
    location: 'Addis Ababa',
    client: 'Private',
    scope: ['Hospitality design', 'Interior design'],
    description: 'A rooftop restaurant and lounge designed around open-air dining — warm timber, greenery and layered lighting under a pergola canopy, with panoramic views over the city. Seating zones move from intimate booths to long shared tables.',
    images: gallery('rooftop-restaurant-lounge', 6)
  },
  {
    id: 'residence',
    title: 'Residence',
    work: ['design'],
    type: 'Apartment Building',
    category: 'Residential',
    year: '2023', date: 'July 2023',
    location: 'Addis Ababa',
    client: 'Private',
    storeys: { above: 4, basements: 0 },
    site: '298 m²',
    scope: ['Architecture', 'Interior design'],
    description: 'A G+4 apartment building in Addis Ababa, designed inside and out. Each unit is planned around an open kitchen and dining area, with a calm grey-and-timber palette, textured plaster feature walls, lit shelving niches and built-in wardrobes. A 3D cutaway of the typical floor shows how every room fits together.',
    images: gallery('residence', 6),
    drawings: [{ src: 'assets/img/proj/sheet-06.jpg', caption: 'Portfolio sheet — architecture' }, { src: 'assets/img/proj/sheet-07.jpg', caption: 'Portfolio sheet — interiors' }]
  },
  {
    // NEW — from the Renders folder. Real name, client, location and year to confirm.
    id: 'villa-roof-terrace',
    title: 'Villa with Roof Terrace',
    work: ['design'],
    type: 'Private Villa',
    category: 'Residential',
    scope: ['Architecture', 'Roof terrace'],
    description: 'A contemporary family villa with timber louvres across the facade, a planted entrance court and a roof terrace under a steel pergola — with an outdoor kitchen, lounge seating and views over the neighbourhood.',
    images: gallery('villa-roof-terrace', 8)
  },
  {
    // NEW — from the Renders folder. Real name, client, location and year to confirm.
    id: 'open-plan-office',
    title: 'Open-Plan Office',
    work: ['design'],
    type: 'Office Interior',
    category: 'Commercial',
    scope: ['Interior design'],
    description: "A bright open-plan office organised by timber slat screens — a marble-floored reception and lounge, rows of shared workstations, a glazed meeting room and a private director's office.",
    images: gallery('open-plan-office', 7)
  },
  {
    // NEW — from the Renders folder. Real name, client, location and year to confirm.
    id: 'fashion-boutique',
    title: 'Fashion Boutique',
    work: ['design'],
    type: 'Retail Interior',
    category: 'Commercial',
    scope: ['Interior design'],
    description: 'A boutique fit-out with black steel display shelving, central display tables and warm timber accents, laid out so shoppers can move easily through every collection.',
    images: gallery('fashion-boutique', 6)
  },
  {
    id: 'oec-headquarters',
    title: 'OEC Headquarters',
    work: ['design', 'finishing'],
    type: 'Institutional HQ — Renovation',
    category: 'Public',
    year: '2021', date: 'December 2021',
    location: 'Near the Vatican Embassy, Addis Ababa',
    client: 'OEC (Organization of Educational Cooperation)',
    status: 'In progress',
    storeys: { above: 3, basements: 2 },
    site: '3,756 m²',
    scope: ['Interior design', 'Exterior design', 'Renovation', 'Site supervision — Phase 1', 'Finishing'],
    description: "To establish its new headquarters, the OEC is renovating a former G+3 Ethiopian Defense Office building, including two basements. We designed the exterior and a collaborative, innovative workspace tailored to the OEC's operational needs, and supervised phase one of the works on site.",
    images: gallery('oec-headquarters', 10),
    drawings: [{ src: 'assets/img/projects/oec-headquarters/drawing-01.jpg', caption: 'Front elevation' }, { src: 'assets/img/proj/sheet-17.jpg', caption: 'Portfolio sheet — exterior' }, { src: 'assets/img/proj/sheet-18.jpg', caption: 'Portfolio sheet — interiors' }],
    finishing: { scope: 'We designed this project and supervised phase one of the works on site — from the drawings through to the built result.', tags: ['Interior design', 'Site supervision — Phase 1', 'Finishing'] }
  },

  /* ---------------- architecture (renders + drawings) ---------------- */
  {
    id: 'g3-residence', title: 'G+3 Residence', work: ['design'], type: 'Private Residence', category: 'Residential',
    storeys: { above: 3, basements: 0 }, site: '120 m²', scope: ['Architectural design'],
    description: 'Architectural design for a G+3 private residence on a compact 120 m² plot.',
    images: gallery('g3-residence', 3),
    drawings: [{ src: 'assets/img/projects/g3-residence/drawing-01.jpg', caption: 'Front elevation' }, { src: 'assets/img/projects/g3-residence/drawing-02.jpg', caption: 'Ground floor plan' }, { src: 'assets/img/proj/sheet-05.jpg', caption: 'Portfolio sheet' }]
  },
  {
    id: 'b-g7-apartment', title: 'B+G+7 Apartment', work: ['design'], type: 'Apartment Building', category: 'Residential',
    storeys: { above: 7, basements: 1 }, site: '579 m²', scope: ['Architectural design'],
    description: 'Architectural design for a B+G+7 apartment building on a 579 m² site.',
    images: gallery('b-g7-apartment', 6),
    drawings: [{ src: 'assets/img/projects/b-g7-apartment/drawing-01.jpg', caption: 'Front elevation' }, { src: 'assets/img/projects/b-g7-apartment/drawing-02.jpg', caption: 'Ground floor plan' }, { src: 'assets/img/projects/b-g7-apartment/drawing-03.jpg', caption: 'Section' }, { src: 'assets/img/proj/sheet-08.jpg', caption: 'Portfolio sheet' }]
  },
  {
    id: 'g-m8-apartment', title: 'G+M+8 Apartment', work: ['design'], type: 'Apartment Building', category: 'Residential',
    storeys: { above: 8, basements: 0, mezzanine: 1 }, site: '384 m²', scope: ['Architectural design'],
    description: 'Architectural design for a G+M+8 apartment building — ground, mezzanine and eight floors — on a 384 m² site.',
    images: gallery('g-m8-apartment', 7),
    captions: ['Dusk', 'Street view', 'Entrance podium', 'Street view', 'Aerial view', 'Street view', 'Massing model'],
    drawings: [{ src: 'assets/img/proj/sheet-09.jpg', caption: 'Portfolio sheet' }]
  },
  {
    id: 'b-g-m12-apartment', title: 'B+G+M+12 Apartment', work: ['design'], type: 'High-Rise Apartment', category: 'Residential',
    storeys: { above: 12, basements: 1, mezzanine: 1 }, site: '412 m²', scope: ['Architectural design'],
    description: 'Architectural design for a B+G+M+12 high-rise apartment building on a 412 m² site.',
    images: gallery('b-g-m12-apartment', 3),
    drawings: [{ src: 'assets/img/proj/sheet-10.jpg', caption: 'Portfolio sheet' }]
  },

  /* ---------------- finishing on site ---------------- */
  {
    id: 'siinqe-bank',
    title: 'Siinqe Bank',
    work: ['finishing'],
    type: 'Bank HQ Tower',
    category: 'Commercial',
    location: 'Bole Mettammia, Addis Ababa',
    status: 'Completed',
    storeys: { above: 15, basements: 3 },
    scope: ['Ceramic & porcelain tile'],
    description: 'We tiled the teller halls, the office floors and the basement service areas.',
    cover: 'assets/img/finishing/siinqe-building.jpg',
    images: ['assets/img/finishing/siinqe-building.jpg', 'assets/img/finishing/siinqe-before.jpg', 'assets/img/finishing/siinqe-after-1.jpg', 'assets/img/finishing/siinqe-after-2.jpg'],
    captions: ['Building', 'Before', 'After', 'After'],
    finishing: { tags: ['Teller halls', 'Office floors', 'Basement service areas'] }
  },
  {
    id: 'grand-view',
    title: 'Grand View',
    work: ['finishing'],
    type: 'Mixed-Use Tower',
    category: 'Mixed-use',
    location: 'Bole, near the Rwanda Embassy',
    status: 'In progress',
    storeys: { above: 19, basements: 5 },
    scope: ['Waterproofing', 'Floor & wall tile'],
    description: 'Floor and wall tile across every level, including all five basement floors. We waterproof first, then tile.',
    cover: 'assets/img/finishing/grandview-building.jpg',
    images: ['assets/img/finishing/grandview-building.jpg', 'assets/img/finishing/grandview-before.jpg', 'assets/img/finishing/grandview-progress-1.jpg', 'assets/img/finishing/grandview-progress-2.jpg'],
    captions: ['Building', 'Before', 'Setting out', 'In progress'],
    finishing: { tags: ['Every floor', '5 basement levels', 'Waterproofing'] }
  },
  {
    id: 'awash-bank',
    title: 'Awash Bank',
    work: ['finishing'],
    type: 'Bank HQ Tower',
    category: 'Commercial',
    location: 'Near Kadisko, Addis Ababa',
    status: 'Completed',
    storeys: { above: 14, basements: 2 },
    scope: ['Ceramic & porcelain tile'],
    description: "Tile work in the banking halls and back-office floors, to the bank's standard finish.",
    finishing: { tags: ['Banking halls', 'Back-office floors'] }
  },
  {
    id: 'africa-insurance',
    title: 'Africa Insurance',
    work: ['finishing'],
    type: 'Insurance HQ Tower',
    category: 'Commercial',
    location: 'Near Urael Church, Addis Ababa',
    status: 'In progress',
    storeys: { above: 22, basements: 3 },
    scope: ['Tile & finishing'],
    description: 'Our biggest job yet — tile and finishing across 22 office floors, the lobby and three basement levels.',
    highlight: true,
    finishing: { tags: ['22 office floors', 'Lobby', '3 basement levels'] }
  },
  {
    id: 'tsehay-real-estate',
    title: 'Tsehay Real Estate',
    work: ['finishing'],
    type: 'Real Estate Tower',
    category: 'Mixed-use',
    location: 'Near CMC Roundabout, Addis Ababa',
    status: 'Completed',
    storeys: { above: 13, basements: 1 },
    scope: ['Floor & wall tile'],
    description: 'Floor and wall tile in the homes, offices and shared areas, across all thirteen floors.',
    cover: 'assets/img/finishing/tsehay-3.jpg',
    images: ['assets/img/finishing/tsehay-1.jpg', 'assets/img/finishing/tsehay-2.jpg', 'assets/img/finishing/tsehay-3.jpg', 'assets/img/finishing/tsehay-4.jpg'],
    captions: ['Laying', 'Pattern tile', 'Finished', 'Finished'],
    finishing: { tags: ['Homes', 'Offices', 'Shared areas'] }
  },
  {
    id: 'oromia-higher-court',
    title: 'Oromia Higher Court',
    work: ['finishing'],
    type: 'Judicial HQ',
    category: 'Public',
    location: 'Near 6 Kilo, Addis Ababa',
    status: 'Completed',
    storeys: { above: 13, basements: 2 },
    scope: ['Ceramic & porcelain tile'],
    description: 'Tile work in the courtrooms, public halls and offices, built to handle heavy daily use.',
    finishing: { tags: ['Courtrooms', 'Public halls', 'Offices'] }
  },
  {
    id: 'grove-garden-amphitheater',
    title: 'Grove Garden Amphitheater',
    work: ['finishing'],
    type: 'Public Outdoor Venue',
    category: 'Public',
    location: 'Addis Ababa',
    status: 'In progress',
    venue: true,
    scope: ['Outdoor tile'],
    description: 'Tile for the seating area and the walkways around the garden.',
    finishing: { tags: ['Tiered seating', 'Garden walkways'] }
  },

  /* ---------------- architecture (portfolio sheets only) ---------------- */
  {
    id: '4b-g20-mixed-use', title: '4B+G+20 Mixed-Use', work: ['design'], type: 'Mixed-Use Building', category: 'Mixed-use',
    storeys: { above: 20, basements: 4 }, site: '3,454 m²', scope: ['Architectural design'],
    description: 'Architectural design for a 4B+G+20 mixed-use building on a 3,454 m² site.',
    drawings: [{ src: 'assets/img/proj/sheet-11.jpg', caption: 'Portfolio sheet' }]
  },
  {
    id: '6b-g31-mixed-use', title: '6B+G+31 Mixed-Use', work: ['design'], type: 'Mixed-Use Tower', category: 'Mixed-use',
    storeys: { above: 31, basements: 6 }, site: '7,318 m²', scope: ['Architectural design'],
    description: 'Architectural design for a 6B+G+31 mixed-use tower on a 7,318 m² site.',
    drawings: [{ src: 'assets/img/proj/sheet-12.jpg', caption: 'Portfolio sheet' }]
  },
  {
    id: '6b-g31-mixed-use-hotel', title: '6B+G+31 Mixed-Use + Hotel', work: ['design'], type: 'Mixed-Use Tower + Hotel', category: 'Mixed-use',
    storeys: { above: 31, basements: 6 }, site: '20,213 m²', scope: ['Architectural design'],
    description: 'Architectural design for a 6B+G+31 mixed-use tower with a hotel, on a 20,213 m² site.',
    drawings: [{ src: 'assets/img/proj/sheet-13.jpg', caption: 'Portfolio sheet' }]
  },
  {
    id: '6b-g35-office', title: '6B+G+35 Office Building', work: ['design'], type: 'Office Tower', category: 'Commercial',
    storeys: { above: 35, basements: 6 }, site: '1,800 m²', scope: ['Exterior design'],
    description: 'Exterior design for a 6B+G+35 office tower on a 1,800 m² site.',
    drawings: [{ src: 'assets/img/proj/sheet-14.jpg', caption: 'Portfolio sheet' }]
  },
  {
    id: '3b-g19-apartment', title: '3B+G+19 Apartment', work: ['design'], type: 'Apartment Tower', category: 'Residential',
    storeys: { above: 19, basements: 3 }, site: '1,280 m² per floor', scope: ['Design modification', 'Site supervision'],
    description: 'Design modification and site supervision for a 3B+G+19 apartment tower with 1,280 m² floor plates.',
    drawings: [{ src: 'assets/img/proj/sheet-15.jpg', caption: 'Portfolio sheet' }]
  }

];
