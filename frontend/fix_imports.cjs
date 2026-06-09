const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('@/data/mockData')) {
    content = content.replace(/@\/data\/mockData/g, '@/constants/mockData');
    changed = true;
  }
  
  if (content.includes('useAuthStore')) {
    content = content.replace(/useAuthStore/g, 'useAuth');
    changed = true;
  }

  if (content.includes('@/store/authStore')) {
    content = content.replace(/@\/store\/authStore/g, '@/hooks/useAuth');
    changed = true;
  }
  
  if (content.includes('@/components/layout/AppLayout')) {
    content = content.replace(/@\/components\/layout\/AppLayout/g, '@/layouts/MainLayout');
    changed = true;
  }

  // Quick fix for AuthLayout, etc. if needed...

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed imports in', file);
  }
});
