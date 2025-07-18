// src/hooks/useFileSystem.js
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

export const useFileSystem = () => {
  const saveFile = (content, fileName, type = 'text') => {
    if (type === 'pdf') {
      const doc = new jsPDF();
      doc.text(content, 10, 10);
      doc.save(`${fileName}.pdf`);
    } else {
      const blob = new Blob([content], { type: 'text/plain' });
      saveAs(blob, `${fileName}.txt`);
    }
  };

  const exportProject = async (files, projectName) => {
    const zip = new JSZip();
    files.forEach(file => {
      zip.file(`${file.name}.${getExtension(file.language)}`, file.content);
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${projectName}.zip`);
  };

  return { saveFile, exportProject };
};