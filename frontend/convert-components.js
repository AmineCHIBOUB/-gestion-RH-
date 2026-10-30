const fs = require('fs');
const path = require('path');

function convertComponentToStandalone(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Ajouter les imports nécessaires
  if (!content.includes('import { CommonModule }')) {
    content = content.replace(
      "import { Component",
      "import { CommonModule } from '@angular/common';\nimport { Component"
    );
  }
  
  if (!content.includes('SharedMaterialModule')) {
    content = content.replace(
      "import { Component",
      "import { SharedMaterialModule } from '../../shared/material.module';\nimport { Component"
    );
  }
  
  // Convertir en standalone
  if (!content.includes('standalone: true')) {
    content = content.replace(
      /@Component\(\{\s*selector:/,
      '@Component({\n  standalone: true,\n  imports: [CommonModule, SharedMaterialModule],\n  selector:'
    );
  }
  
  // Typer les erreurs
  content = content.replace(/error: \(/g, 'error: (error: any) =>');
  content = content.replace(/error\) => \{/g, 'error: any) => {');
  
  fs.writeFileSync(filePath, content);
  console.log(`Converti: ${filePath}`);
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.component.ts')) {
      convertComponentToStandalone(fullPath);
    }
  });
}

// Traiter tous les composants
processDirectory('./src/app/admin/components');
console.log('Conversion terminée!');