import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import MultiSelect from "./MultiSelect";
import { SelectOption, HsnCodeForm } from "../types";

interface HsnFormProps {
  options: SelectOption[];
  onSubmit: (formData: HsnCodeForm) => void;
  isProcessing?: boolean;
}

const HsnForm: React.FC<HsnFormProps> = ({
  options,
  onSubmit,
  isProcessing = false,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [hsnCode, setHsnCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedValues.length === 0) {
      alert("Please select at least one value");
      return;
    }

    if (!hsnCode.trim()) {
      alert("Please enter an HSN code");
      return;
    }

    onSubmit({
      selectedValues,
      hsnCode: hsnCode.trim(),
    });

    // Reset form
    setSelectedValues([]);
    setHsnCode("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Add HSN Code</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Party Names
          </label>
          <MultiSelect
            options={options}
            value={selectedValues}
            onChange={setSelectedValues}
            placeholder="Select party names..."
            searchPlaceholder="Search party names..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Rows with these party names will receive the HSN code
          </p>
        </div>

        <div>
          <label
            htmlFor="hsnCode"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            HSN Code
          </label>
          <input
            type="number"
            id="hsnCode"
            value={hsnCode}
            onChange={(e) => setHsnCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-colors duration-200"
            placeholder="Enter HSN code (numbers only)"
            min="0"
          />
        </div>

        <button
          type="submit"
          disabled={
            isProcessing || selectedValues.length === 0 || !hsnCode.trim()
          }
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add HSN Code
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default HsnForm;
