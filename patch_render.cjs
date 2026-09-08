const fs = require('fs');

const path = 'src/components/cms/CMSDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const newRender = `        {/* WORDPRESS STYLE: RANK MATH SEO */}
        {activeCmsTab === 'seo' && canAccess('guides') && <SEOManager />}

        {/* WORDPRESS STYLE: CATEGORIES & TAGS */}
        {activeCmsTab === 'categories' && canAccess('guides') && <CategoriesManager />}

        {/* TAB 2.5: PILGRIMAGE & TRAVEL GUIDES CMS (WITH AI SEO GENERATOR) */}`;

content = content.replace('{/* TAB 2.5: PILGRIMAGE & TRAVEL GUIDES CMS (WITH AI SEO GENERATOR) */}', newRender);

fs.writeFileSync(path, content);
