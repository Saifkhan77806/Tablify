import React, { useCallback, useEffect, useState } from "react";
import { FileText, Download, RefreshCw, FileSpreadsheet } from "lucide-react";
import FileUpload from "./components/FileUpload";
import TableDisplay from "./components/TableDisplay";
import HsnForm from "./components/HsnForm";
import { TableData, SelectOption, HsnCodeForm, TableDataType } from "./types";
import {
  downloadExcel,
  extractTableFromHtml,
  generateUniqueValues,
} from "./utils/htmlParser";
import { addHsnCodeColumn, downloadTable } from "./utils/tableProcessor";

function App() {
  const [originalTableData, setOriginalTableData] = useState<TableData | null>(
    null
  );
  const [currentTableData, setCurrentTableData] = useState<TableData | null>(
    null
  );
  const [fileName, setFileName] = useState<string>("");
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [valueLeft, setValueLeft] = useState<number>();

  useEffect(() => {
    if (!currentTableData) return;

    // count rows without HSNCode
    const remaining = currentTableData.rows.filter(
      (row) => !row.HSNCode
    ).length;
    setValueLeft(remaining);
  }, [currentTableData]);

  interface FormDataType {
    hsnCode: string;
    selectedValues: string[];
  }

  function updateTableData(
    formData: FormDataType,
    tableData: TableDataType
  ): TableDataType {
    const { hsnCode, selectedValues } = formData;

    return {
      ...tableData,
      rows: tableData.rows.map((row) =>
        selectedValues.includes(row.Product)
          ? { ...row, HSNCode: hsnCode }
          : row
      ),
    };
  }
  const getUniqueOptions = useCallback(
    (options: SelectOption[]): SelectOption[] => {
      const seen = new Set<string>();
      return options.filter((option) => {
        if (seen.has(option.value as string)) {
          return false;
        }
        seen.add(option.value as string);
        return true;
      });
    },
    [currentTableData, options]
  );

  const handleFileUpload = (content: string, uploadedFileName: string) => {
    setError("");
    setIsProcessing(true);

    try {
      const tableData = extractTableFromHtml(content);

      if (!tableData) {
        setError(
          "Could not extract table from the HTML file. Please ensure the file contains a valid HTML table."
        );
        return;
      }

      setOriginalTableData(tableData);
      setCurrentTableData(tableData);
      setFileName(uploadedFileName);

      const selectOptions: SelectOption[] = getUniqueOptions(
        tableData.rows.map((items) => ({
          value: !items["HSNCode"] ? items["Product"] : "",
          label: !items["HSNCode"] ? items["Product"] : "",
        }))
      );

      setOptions(selectOptions);
    } catch (error) {
      console.error("Error processing file:", error);
      setError("Error processing the HTML file. Please check the file format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHsnSubmit = (formData: HsnCodeForm) => {
    if (!currentTableData) return;

    setIsProcessing(true);

    try {
      const updatedTable = updateTableData(
        formData,
        currentTableData as TableDataType
      );

      setCurrentTableData(updatedTable);
    } catch (error) {
      console.error("Error adding HSN code:", error);
      setError("Error adding HSN code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (currentTableData && fileName) {
      downloadTable(currentTableData, fileName);
    }
  };

  const handleReset = () => {
    if (originalTableData) {
      setCurrentTableData(originalTableData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              HTML Table Processor
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an HTML file to extract tables, add HSN codes based on row
            matching, and download the modified results.
          </p>
          <p className="text-gray-600">
            Total value left{" "}
            <span className="font-bold text-black">{valueLeft}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload Section */}
          <div className="lg:col-span-3">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>

          {currentTableData && (
            <>
              {/* HSN Form Section */}
              <div className="lg:col-span-1">
                <HsnForm
                  options={options}
                  onSubmit={handleHsnSubmit}
                  isProcessing={isProcessing}
                />
              </div>

              {/* Table Display Section */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {/* Table Actions */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Extracted Table {fileName && `from ${fileName}`}
                    </h2>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                        disabled={isProcessing}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                      </button>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                        disabled={isProcessing}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() =>
                          currentTableData &&
                          fileName &&
                          downloadExcel(
                            currentTableData as TableDataType,
                            fileName
                          )
                        }
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        disabled={isProcessing}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <TableDisplay tableData={currentTableData} />
                </div>
              </div>
            </>
          )}
        </div>

        {!currentTableData && (
          <div className="text-center mt-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to Process
            </h3>
            <p className="text-gray-600">
              Upload an HTML file containing a table to get started. The app
              will automatically extract the table data and allow you to add HSN
              codes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
