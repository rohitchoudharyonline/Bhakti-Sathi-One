const fs = require('fs');

const path = 'src/components/cms/CMSDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove PostEditor from imports
content = content.replace("import { PostEditor } from './PostEditor';\n", "");

// Remove from tabsConfig
content = content.replace(/    \{ id: 'post-editor', label: 'Post Editor', icon: FileEdit, count: null, show: canAccess\('post-editor'\) \},\n/g, "");

// Remove from activeCmsTab type
content = content.replace(/    \| 'post-editor'\n/g, "");

// Remove from canAccess switch
content = content.replace(/      case 'post-editor':\n/g, "");

// Remove the rendering logic entirely
const regex = /  \/\/ If on post-editor tab, render the dedicated PostEditor module\s*if \(activeCmsTab === 'post-editor'\) \{.*?\n  \}\n/s;
content = content.replace(regex, "");

fs.writeFileSync(path, content);
