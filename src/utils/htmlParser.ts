import { TableData, TableDataType, TableRow } from '../types';
import * as XLSX from "xlsx";


export const extractTableFromHtml = (htmlContent: string): TableData | null => {
  try {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Find the first table in the document
    const table = doc.querySelector('table');
    
    if (!table) {
      throw new Error('No table found in the HTML file');
    }

    // Extract headers
    const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
    if (!headerRow) {
      throw new Error('No table rows found');
    }

    const headers: string[] = [];
    const headerCells = headerRow.querySelectorAll('th, td');
    headerCells.forEach(cell => {
      headers.push(cell.textContent?.trim() || '');
    });

    if (headers.length === 0) {
      throw new Error('No table headers found');
    }

    // Extract rows
    const rows: TableRow[] = [];
    const tbody = table.querySelector('tbody') || table;
    const tableRows = tbody.querySelectorAll('tr');
    
    // Skip the header row if there's no tbody
    const startIndex = table.querySelector('tbody') ? 0 : 1;
    
    for (let i = startIndex; i < tableRows.length; i++) {
      const row = tableRows[i];
      const cells = row.querySelectorAll('td, th');
      
      if (cells.length === 0) continue;
      
      const rowData: TableRow = {};
      cells.forEach((cell, cellIndex) => {
        if (cellIndex < headers.length) {
          rowData[headers[cellIndex]] = cell.textContent?.trim() || '';
        }
      });
      
      rows.push(rowData);
    }

    return {
      headers,
      rows
    };
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return null;
  }
};

export const generateUniqueValues = (tableData: TableData): string[] => {
  const partyNameColumn = tableData.headers.find(header => 
    header.toLowerCase().includes('party') && header.toLowerCase().includes('name')
  );
  
  if (!partyNameColumn) {
    // Fallback: if no "Party Name" column found, return empty array
    console.warn('No "Party Name" column found in the table');
    return [];
  }

  const uniqueValues = new Set<string>();
  
  tableData.rows.forEach(row => {
    const partyName = row[partyNameColumn];
    if (partyName && partyName.trim()) {
      uniqueValues.add(partyName.trim());
    }
  });
  
  return Array.from(uniqueValues).sort();
};


export function downloadExcel(tableData: TableDataType, fileName: string) {
  // Convert rows into sheet-compatible JSON
  const worksheet = XLSX.utils.json_to_sheet(tableData.rows);

  // Create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Table");

  // Download as Excel
  XLSX.writeFile(workbook, `${fileName.replace(/\.[^/.]+$/, "")}.xlsx`);
}
