import React, { useState } from 'react';
import Papa from 'papaparse';

export default function BulkUploadModal({ isOpen, onClose, onBulkSubmit }) {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  
  // State to hold the mapping choices
  const [mapping, setMapping] = useState({
    roomNumber: '',
    capacity: '',
    status: '',
  });

  if (!isOpen) return null;

  // Handles the file selection and parses the CSV headers
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setHeaders(results.meta.fields); // Get the column names
          setCsvData(results.data); // Get the actual rows
        },
      });
    }
  };

  const handleMappingChange = (dbField, csvHeader) => {
    setMapping((prev) => ({ ...prev, [dbField]: csvHeader }));
  };

  const handleSubmit = () => {
    // Transform the raw CSV data using the user's mapping
    const formattedRooms = csvData.map((row) => ({
      roomNumber: row[mapping.roomNumber],
      capacity: parseInt(row[mapping.capacity] || 2), // Default to 2 if missing
      status: row[mapping.status]?.toUpperCase() || 'STUDENT',
    }));

    onBulkSubmit(formattedRooms);
    resetAndClose();
  };

  const resetAndClose = () => {
    setFile(null);
    setHeaders([]);
    setCsvData([]);
    setMapping({ roomNumber: '', capacity: '', status: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        <div className="bg-[#6d0f16] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Bulk Upload Rooms</h2>
          <button onClick={resetAndClose} className="text-white hover:text-gray-300 font-bold text-xl">×</button>
        </div>

        <div className="p-6">
          {/* STEP 1: Upload File */}
          {!csvData.length > 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
              <p className="text-gray-600 mb-4 font-medium">Select a CSV file to upload</p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6d0f16] file:text-white hover:file:bg-[#530b11] transition cursor-pointer"
              />
            </div>
          ) : (
            /* STEP 2: Column Mapper */
            <div className="space-y-5">
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm mb-4">
                Successfully loaded <strong>{csvData.length}</strong> rows from {file.name}. Please map your columns below.
              </div>

              {/* Mapper Rows */}
              {[
                { label: 'Room Number (Required)', field: 'roomNumber' },
                { label: 'Capacity', field: 'capacity' },
                { label: 'Status (Student/Guest)', field: 'status' }
              ].map((item) => (
                <div key={item.field} className="flex justify-between items-center gap-4 border-b pb-3">
                  <span className="font-medium text-gray-700 w-1/2">{item.label}</span>
                  <select
                    className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#6d0f16]"
                    value={mapping[item.field]}
                    onChange={(e) => handleMappingChange(item.field, e.target.value)}
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map((header, idx) => (
                      <option key={idx} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="pt-4 flex gap-3 justify-end mt-2">
                <button
                  onClick={resetAndClose}
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!mapping.roomNumber} // Must map room number
                  className="px-5 py-2 text-sm font-medium text-white bg-[#6d0f16] hover:bg-[#530b11] rounded-lg shadow-md transition disabled:bg-gray-400"
                >
                  Process & Upload
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}