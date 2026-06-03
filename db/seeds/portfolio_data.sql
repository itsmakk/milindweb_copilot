-- ============================================================================
--  portfolio_data.sql — initial content for the static site
--  Idempotent. Mirrors data/* and config.js so the static site can be served
--  from the DB instead of static JSON/JS.
-- ============================================================================

-- Profile (singleton, id=1)
INSERT INTO portfolio.profile (
  id, brand_name, brand_short_name, tagline, description, logo_mark, founded_year,
  language, locale, contact, social, seo, analytics, theme
) VALUES (
  1,
  'MilindWeb',
  'MilindWeb',
  'Life should be great rather than long',
  'Freelance digital marketing, web development, business automation, engineering projects, photography, graphics, electrical and automotive services across Maharashtra, India.',
  'M', 2022,
  'en', 'en_IN',
  jsonb_build_object(
    'email', 'Aartitechservices@gmail.com',
    'phone', '+91 9869787575',
    'phoneRaw', '919869787575',
    'whatsapp', '919869787575',
    'address', jsonb_build_object(
      'street','Uran','city','Navi Mumbai','state','Maharashtra','country','India','postal','400702'
    ),
    'hours','Mon to Fri 10:00 - 18:00 IST',
    'serviceAreas', jsonb_build_array(
      'Navi Mumbai','Pune','Nagpur','Sambhaji Nagar','Nanded','Latur','Parbhani','Hingoli'
    )
  ),
  jsonb_build_object(
    'whatsapp','https://wa.me/919869787575',
    'telegram','https://t.me/itsmakk',
    'instagram','https://instagram.com/aartitechservices',
    'facebook','https://fb.me/AartiTechServices',
    'twitter','https://twitter.com/milindweb',
    'linkedin','https://linkedin.com/company/milindweb',
    'youtube','',
    'github','https://github.com/itsmakk'
  ),
  jsonb_build_object(
    'author','MilindWeb','robots','index, follow','ogType','website',
    'ogImage','img/og-cover.jpg','twitterCard','summary_large_image',
    'twitterHandle','@milindweb','themeColor','#0a0a0f'
  ),
  jsonb_build_object('googleAnalyticsId','','facebookPixelId','','clarityId',''),
  jsonb_build_object(
    'default','dark',
    'tokens', jsonb_build_object(
      '--brand-1','#6366f1','--brand-2','#8b5cf6','--brand-3','#06b6d4'
    )
  )
) ON CONFLICT (id) DO NOTHING;

-- Services
INSERT INTO portfolio.services (code, slug, title, icon, tagline, summary, bullets, sort_order) VALUES
  ('digital-marketing','freelance_seo_consultant.html','Digital Marketing & SEO','fa-chart-line',
   'Rank higher. Get found. Convert more.',
   'Improve online visibility, attract qualified leads, and grow your business through SEO, Google Ads, social media marketing, content marketing, local SEO, and performance-driven digital strategies.',
   jsonb_build_array(
     'Search Engine Optimization (On-page, Off-page, Technical)',
     'Google Ads & PPC Campaigns',
     'Social Media Marketing & Management',
     'Content Marketing & Strategy',
     'Local SEO & Google Business Profile'
   ), 10),
  ('web-development','website-tech-solutions.html','Website Development','fa-laptop-code',
   'Modern. Responsive. Built to perform.',
   'Design and develop modern, responsive, SEO-friendly websites, landing pages, business portals, and custom web applications that prioritize performance, security, scalability, and user experience.',
   jsonb_build_array(
     'Responsive Business & Portfolio Websites',
     'Landing Pages & Sales Funnels',
     'Custom Web Applications & Portals',
     'SEO-friendly, fast, accessible code',
     'Maintenance, Hosting & Domain Support'
   ), 20),
  ('business-automation','automation.html','Business Automation','fa-gears',
   'Digitize. Automate. Scale.',
   'Streamline operations with custom software: Hospital & Clinic Management, Society Management, Seniority Platforms, Member Portals, workflow automation, reporting systems, and process digitization.',
   jsonb_build_array(
     'Hospital & Clinic Management Systems',
     'Society & Member Management Software',
     'Seniority & Promotion Platforms',
     'Workflow Automation & Reporting',
     'Google Sheets / API Integrations'
   ), 30),
  ('engineering-projects','project.html','Engineering Projects & Training','fa-microchip',
   'Industry-ready. Hands-on. Career-focused.',
   'Industry-oriented engineering solutions and training: IoT, embedded systems, robotics, industrial automation, PLC/SCADA, AI/ML, technical documentation, workshops, apprentice and skill development programs.',
   jsonb_build_array(
     'IoT, Embedded, Robotics & AI/ML Projects',
     'PLC / SCADA & Industrial Automation',
     'Apprentice & Industrial Training',
     'Workshops on Arduino, ESP32, Excel',
     'Reports, PPTs, Circuit Diagrams & Code'
   ), 40),
  ('photography','photography.html','Photography, Videography & Drone','fa-camera-retro',
   'Capture. Elevate. Inspire.',
   'Professional photography and videography for events, businesses, products, and promotions. Includes drone aerial shoots, cinematic coverage, equipment rental, and aerial inspections.',
   jsonb_build_array(
     'Event, Product & Corporate Photography',
     'Cinematic Videography & Editing',
     'Drone Photography & Aerial Filming',
     'Aerial Inspections & Surveys',
     'Camera & Drone Equipment Rental'
   ), 50),
  ('graphics-branding','graphics.html','Graphics & Branding','fa-paint-brush',
   'Designs that speak. Brands that stick.',
   'Build a strong visual identity with professional logo design, business branding, marketing materials, social media creatives, promotional graphics, presentations, and video editing.',
   jsonb_build_array(
     'Logo Design & Brand Identity Kits',
     'Marketing Collateral & Presentations',
     'Social Media Creatives & Ads',
     'Wedding & Event Invitations',
     'Professional Video Editing & Reels'
   ), 60),
  ('electrical','electrical.html','Electrical Services','fa-bolt',
   'Safe. Reliable. Efficient.',
   'Professional electrical installation, maintenance, troubleshooting, and repair for residential, commercial, and industrial applications — including energy-efficient and solar solutions.',
   jsonb_build_array(
     'Wiring, Panels & Switchgear Installation',
     'Industrial Electrical Maintenance',
     'Troubleshooting & Repair',
     'Energy-Efficient Upgrades',
     'Solar Power System Installation'
   ), 70),
  ('automotive','automotive.html','Automotive Services','fa-motorcycle',
   'Keep moving. Stay safe.',
   'Comprehensive two-wheeler maintenance and repair: routine servicing, diagnostics, engine and electrical work, preventive maintenance, and electric two-wheeler servicing.',
   jsonb_build_array(
     'Routine Servicing & Tune-ups',
     'Diagnostics & Engine Repairs',
     'Electrical Troubleshooting',
     'Preventive Maintenance Packages',
     'Electric Two-Wheeler Servicing'
   ), 80)
ON CONFLICT (code) DO NOTHING;

-- Team
INSERT INTO portfolio.team (name, role, bio, avatar, sort_order) VALUES
  ('Er. Aarti', 'CEO & Founder',
   'DEE, B.E (Electrical). Digital Marketing Executive with 2+ years experience.', 'A', 10),
  ('Er. M!l!nd', 'Co-Founder',
   'DEE, B.E (Instrumentation). 7+ years in Defence Industry.', 'M', 20)
ON CONFLICT DO NOTHING;

-- Testimonials
INSERT INTO portfolio.testimonials (name, role, quote, initials, rating, sort_order) VALUES
  ('Priya S.',  'Founder, Blossom Boutique (Pune)',
   'Milind redesigned our catalogue site and ran our Google Ads for three months. Our online orders grew 3x and the site finally feels like our brand.', 'PS', 5, 10),
  ('Rakesh P.', 'Workshop Attendee (Nanded)',
   'The Arduino workshop was exactly what I needed as a 2nd-year engineering student. Clear explanations, real projects, and great follow-up support.', 'RP', 5, 20),
  ('Anita M.',  'Owner, Anita''s Kitchen (Navi Mumbai)',
   'Quick, honest, and surprisingly affordable. The drone shoot of our kitchen opening looked cinematic and brought in walk-ins all week.', 'AM', 5, 30),
  ('Vikram D.', 'Engineering Student (Sambhaji Nagar)',
   'MilindWeb built my final-year project from scratch and explained every line. The documentation and after-delivery support were top-notch.', 'VD', 4, 40),
  ('Sneha K.',  'Marketing Lead, TechSeva (Nagpur)',
   'We hired MilindWeb for SEO and a new website. The leads started coming in within 6 weeks — and they keep coming. Highly recommended.', 'SK', 5, 50)
ON CONFLICT DO NOTHING;

-- FAQ
INSERT INTO portfolio.faq (question, answer, sort_order) VALUES
  ('What is your typical turnaround time?',
   'Most small projects (logos, one-page sites, social posts) take 3–7 days. Larger builds (multi-page sites, automation scripts, full SEO sprints) take 2–6 weeks. We always share a written timeline before starting.', 10),
  ('How do you price projects?',
   'Fixed-scope quotes based on deliverables — not hourly. You''ll get a written proposal with line items, timeline, and a clear total. We never send surprise invoices.', 20),
  ('Do you work with clients outside Maharashtra?',
   'Yes. We serve clients across India and abroad. On-site visits are limited to Navi Mumbai / Pune / Sambhaji Nagar / Nanded; everything else is delivered remotely with scheduled video calls.', 30),
  ('Can I see samples before I commit?',
   'Absolutely. We have a portfolio in each service section, and we''ll gladly share private samples on request. Just mention what you''re looking for in your first message.', 40),
  ('Do you sign NDAs?',
   'Yes. Mutual NDAs are standard for any project involving confidential data, unreleased products, or proprietary business processes. We sign first, then start work.', 50),
  ('What if I am not happy with the work?',
   'We work in tight iterations with feedback at every milestone, so surprises are rare. If the final deliverable doesn''t match the agreed scope, we''ll revise it at no extra cost until it does.', 60),
  ('Which payment methods do you accept?',
   'UPI, bank transfer (NEFT/IMPS), and Razorpay. For projects over ₹25,000 we typically split 50% upfront and 50% on delivery. International clients can pay via Wise or PayPal.', 70),
  ('Do you offer ongoing support after launch?',
   'Yes. Every project includes 30 days of free post-delivery support. After that, you can opt for a monthly retainer for hosting, updates, content, or analytics.', 80)
ON CONFLICT DO NOTHING;
