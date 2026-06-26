const fs = require('fs');
const path = require('path');

function removeReactImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      removeReactImports(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix: import React from 'react';
      content = content.replace(/^import React\s*from\s*['"]react['"];\s*$/gm, '');
      
      // Fix: import React, { useState } from 'react';
      content = content.replace(/^import React,\s*\{\s*(.*?)\s*\}\s*from\s*['"]react['"];/gm, "import { $1 } from 'react';");
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

removeReactImports(path.join(__dirname, 'src'));
console.log('Done!');
