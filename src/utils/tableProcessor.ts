import { TableData, TableRow, HsnCodeForm } from '../types';

export const addHsnCodeColumn = (
  tableData: TableData,
  formData: HsnCodeForm
): TableData => {
  const hsnColumnName = 'HSN Code';
  
  // Find the Party Name column
  const partyNameColumn = tableData.headers.find(header => 
    header.toLowerCase().includes('hsn') && header.toLowerCase().includes('code')
  );

  console.log("partyNameColumn", partyNameColumn);
  
  // Check if HSN Code column already exists
  const hasHsnColumn = tableData.headers.includes(hsnColumnName);
  console.log("hasHsnColumn", hasHsnColumn);
  const newHeaders = hasHsnColumn ? [...tableData.headers] : [...tableData.headers, hsnColumnName];
  
  const newRows: TableRow[] = tableData.rows.map(row => {
    const newRow = { ...row };
    
    // Check if the Party Name in this row matches any of the selected values
    const shouldAddHsnCode = partyNameColumn && formData.selectedValues.some(selectedValue => {
      const partyName = row[partyNameColumn];
      return partyName && partyName.toLowerCase() === selectedValue.toLowerCase();
    });
    
    if (shouldAddHsnCode) {
      newRow[hsnColumnName] = formData.hsnCode;
    } else if (!hasHsnColumn) {
      // If column is new but this row doesn't match, add empty value
      newRow[hsnColumnName] = '';
    }
    
    return newRow;
  });
  
  return {
    headers: newHeaders,
    rows: newRows
  };
};

export const exportTableAsHtml = (tableData: TableData): string => {
  let html = '<table border="1" style="border-collapse: collapse; width: 100%;">\n';
  
  // Add headers
  html += '  <thead>\n    <tr>\n';
  tableData.headers.forEach(header => {
    html += `      <th style="padding: 8px; background-color: #f5f5f5;">${header}</th>\n`;
  });
  html += '    </tr>\n  </thead>\n';
  
  // Add rows
  html += '  <tbody>\n';
  tableData.rows.forEach(row => {
    html += '    <tr>\n';
    tableData.headers.forEach(header => {
      html += `      <td style="padding: 8px;">${row[header] || ''}</td>\n`;
    });
    html += '    </tr>\n';
  });
  html += '  </tbody>\n</table>';
  
  return html;
};

export const downloadTable = (tableData: TableData, fileName: string) => {
  const htmlContent = exportTableAsHtml(tableData);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.replace(/\.html$/, '_modified.html');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};