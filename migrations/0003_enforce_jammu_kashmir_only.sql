-- Enforce the current Holidays Hunt product scope: Jammu & Kashmir only.
-- Existing page SEO registry is intentionally untouched.
UPDATE contents
SET structured_content = json_set(
  structured_content,
  '$.value',
  (SELECT json_group_array(json(value))
   FROM json_each(json_extract(structured_content, '$.value'))
   WHERE json_extract(value, '$.destinationTag') = 'kashmir')
),
updated_at = datetime('now')
WHERE id = 'registry-packages';

UPDATE contents
SET structured_content = json_set(
  structured_content,
  '$.value',
  json_object(
    'jammu-kashmir',
    json_extract(json_extract(structured_content, '$.value'), '$.jammu-kashmir')
  )
),
updated_at = datetime('now')
WHERE id = 'registry-destinations';

UPDATE contents
SET structured_content = json_set(
  structured_content,
  '$.value',
  (SELECT json_group_array(json(value))
   FROM json_each(json_extract(structured_content, '$.value'))
   WHERE lower(json_extract(value, '$.slug')) NOT LIKE '%himachal%'
     AND lower(json_extract(value, '$.title')) NOT LIKE '%himachal%'
     AND lower(json_extract(value, '$.title')) NOT LIKE '%manali%'
     AND lower(json_extract(value, '$.title')) NOT LIKE '%shimla%')
),
updated_at = datetime('now')
WHERE id = 'registry-blog-posts-v2';

UPDATE contents
SET structured_content = json_set(
  structured_content,
  '$.value',
  (SELECT json_group_array(json(value))
   FROM json_each(json_extract(structured_content, '$.value'))
   WHERE json_extract(value, '$.id') <> 'cat-himachal')
),
updated_at = datetime('now')
WHERE id = 'registry-blog-categories-v2';

UPDATE contents
SET structured_content = json_set(
  structured_content,
  '$.value',
  (SELECT json_group_array(json(value))
   FROM json_each(json_extract(structured_content, '$.value'))
   WHERE lower(COALESCE(json_extract(value, '$.destinationSlug'), '')) IN ('jammu-kashmir','kashmir','jammu')
      OR lower(COALESCE(json_extract(value, '$.destination'), '')) LIKE '%jammu%'
      OR lower(COALESCE(json_extract(value, '$.destination'), '')) LIKE '%kashmir%'
      OR lower(COALESCE(json_extract(value, '$.slug'), '')) LIKE '%kashmir%'
      OR lower(COALESCE(json_extract(value, '$.slug'), '')) LIKE '%vaishno-devi%')
),
updated_at = datetime('now')
WHERE id = 'registry-guides-v1';

UPDATE contents
SET structured_content = json_set(
  structured_content,
  '$.value',
  (SELECT json_group_array(json(value))
   FROM json_each(json_extract(structured_content, '$.value'))
   WHERE json_extract(value, '$.state') = 'Jammu & Kashmir')
),
updated_at = datetime('now')
WHERE id = 'registry-temples';

UPDATE contents
SET structured_content = json_set(
  structured_content,
  '$.value',
  '{"agencyName":"Holidays Hunt","tagline":"Jammu & Kashmir Tour & Travel Specialist","email":"info@holidayshunt.com","phone":"+91 94199 15255","whatsapp":"+919419915255","address":"Holidays Hunt Travel & Hospitality Pvt Ltd, Boulevard / Rajbagh, Srinagar, Kashmir / Katra / New Delhi","currencySymbol":"₹","taxRegistrationNumber":"GSTIN: 07AAACH2953L1ZM","bankName":"HDFC Bank Ltd.","accountName":"Holidays Hunt","accountNumber":"50200099887766","ifscCode":"HDFC0000456","upiId":"holidayshunt@hdfcbank","invoicePrefix":"HH-2026-","voucherPrefix":"VOU-HH-","invoiceTerms":["1. 25% Advance payment required to confirm hotel reservations and dedicated vehicle booking.","2. Balance payment must be settled before check-in or commencement of sightseeing as per voucher.","3. All inclusions are clearly stated in the official tour voucher.","4. AC operates in plain areas and will be switched off on hilly drives for vehicle safety.","5. 24x7 guest support team and emergency assistance available throughout the trip."],"faqs":[{"id":"faq-1","question":"What destinations does Holidays Hunt specialize in?","answer":"Holidays Hunt specializes in Jammu & Kashmir tours, covering Kashmir Valley, Jammu, Katra and popular destinations such as Srinagar, Gulmarg, Pahalgam, Sonamarg, Doodhpathri, Patnitop and Bhaderwah."},{"id":"faq-2","question":"Can Holidays Hunt customize a Jammu & Kashmir tour for my family?","answer":"Yes. We can customize the duration, sightseeing, hotel category, private vehicle and pace of your Jammu & Kashmir trip based on your family size, travel dates and preferences."},{"id":"faq-3","question":"Can I customize a Jammu & Kashmir honeymoon tour?","answer":"Yes. We can plan a private Jammu & Kashmir honeymoon with romantic stays, houseboat nights, sightseeing and a flexible itinerary based on your travel dates and preferences."},{"id":"faq-4","question":"Which places can I cover in a Kashmir tour?","answer":"Popular Kashmir itineraries include Srinagar, Gulmarg, Pahalgam, Sonamarg and Doodhpathri. Depending on the trip, we can also add a houseboat stay, Shikara ride and other local experiences."},{"id":"faq-5","question":"Does Holidays Hunt offer pilgrimage tours in Jammu & Kashmir?","answer":"Yes. We offer Jammu & Kashmir pilgrimage tours covering places such as Mata Vaishno Devi, Shiv Khori, Baba Dhansar, Raghunath Temple and other important religious sites in the region."},{"id":"faq-6","question":"What type of hotels and vehicles are available?","answer":"We offer different hotel categories and private vehicle options for Jammu & Kashmir trips depending on the destination, group size, travel dates and budget."},{"id":"faq-7","question":"Is a private cab available for Jammu & Kashmir tours?","answer":"Yes. Private cabs with experienced local drivers can be arranged for airport and railway transfers, intercity travel and sightseeing across Jammu & Kashmir."},{"id":"faq-8","question":"Can senior citizens and families travel comfortably in Jammu & Kashmir?","answer":"Yes. We plan practical sightseeing schedules, comfortable stays and suitable private transport, with the itinerary adjusted to the needs of families and senior travellers."},{"id":"faq-9","question":"What is the payment and booking process?","answer":"Once you approve the itinerary and quotation, the required advance payment is collected to confirm the selected hotels and vehicle. The payment schedule is shared before booking."},{"id":"faq-10","question":"What is the cancellation policy for Holidays Hunt tours?","answer":"Cancellation charges depend on the travel date, hotel and service providers involved. The applicable cancellation terms are shared with your quotation or booking confirmation before payment."}],"footerMenus":[{"id":"fm-discover","title":"DISCOVER US","items":[{"id":"fmi-about","label":"About us","url":"about"},{"id":"fmi-careers","label":"Careers","url":"careers"},{"id":"fmi-contact","label":"Contact us","url":"locate_us"},{"id":"fmi-faq","label":"FAQ","url":"faq"},{"id":"fmi-guide","label":"Guide","url":"guide"},{"id":"fmi-sitemap","label":"Sitemap","url":"sitemap"}]},{"id":"fm-yatras","title":"JAMMU & KASHMIR PILGRIMAGE","items":[{"id":"fmi-vd","label":"Vaishno Devi Yatra","url":"pilgrimage"},{"id":"fmi-shiv","label":"Jammu & Kashmir Pilgrimage","url":"pilgrimage"},{"id":"fmi-fam","label":"Family Tours","url":"family"}]},{"id":"fm-tours","title":"TOP TOURS","items":[{"id":"fmi-t-kashmir","label":"Kashmir Tour Packages","url":"kashmir"},{"id":"fmi-t-vaishno","label":"Mata Vaishno Devi Tours","url":"jammu"},{"id":"fmi-t-family","label":"Kashmir Family Tours","url":"family"},{"id":"fmi-t-honeymoon","label":"Kashmir Honeymoon Tours","url":"honeymoon"}]},{"id":"fm-security","title":"SECURITY & TRUST","items":[{"id":"fmi-terms","label":"Terms & Conditions","url":"terms"},{"id":"fmi-cancel","label":"Cancellation Policy","url":"cancellation"},{"id":"fmi-privacy","label":"Privacy Policy","url":"privacy"},{"id":"fmi-sec","label":"100% Verified Stays","url":"security"}]}],"bottomNavItems":[{"id":"bnav-explore","label":"Explore","icon":"home","actionType":"home","enabled":true},{"id":"bnav-tours","label":"Tours","icon":"tours","actionType":"tours","badge":"count","enabled":true},{"id":"bnav-destinations","label":"Destinations","icon":"destinations","actionType":"destinations","enabled":true},{"id":"bnav-chat","label":"Chat","icon":"chat","actionType":"whatsapp","enabled":true}],"sacredMantra":""}'
),
updated_at = datetime('now')
WHERE id = 'registry-settings-v2';
