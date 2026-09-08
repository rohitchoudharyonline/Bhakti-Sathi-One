const fs = require('fs');
const path = 'src/components/cms/CMSDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// The sed command above was wrong. Let's do it cleanly in JS.
// Find the lucide-react imports block.
const importMatch = content.match(/import \{([^}]*?)\} from 'lucide-react';/);
if (importMatch) {
  let imports = importMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
  
  // Deduplicate
  imports = [...new Set(imports)];
  
  content = content.replace(importMatch[0], `import {\n  ${imports.join(',\n  ')}\n} from 'lucide-react';`);
  fs.writeFileSync(path, content);
}
