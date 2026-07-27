import { useState } from 'react';
import client from '../../../room_allocation/api/client.js';

export default function StudentImportModal({ isOpen, onClose, onSuccess, hostels = [], activeHostelId = '' }) {
  const [step, setStep] = useState('SELECT_HOSTEL'); // SELECT_HOSTEL, UPLOAD, MAPPING, REPORT
  const [file, setFile] = useState(null);
  const [selectedHostelId, setSelectedHostelId] = useState(activeHostelId || (hostels[0]?.id || ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mapping state
  const [fileId, setFileId] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [mappings, setMappings] = useState({});
  const [dbFields] = useState([
    'name', 'father_name', 'email', 'roll_no',
    'phone', 'parent_number', 'category', 'blood_group', 'state',
    'address', 'pincode', 'department', 'cgpa', 'joining_year', 'individual_rank'
  ]);

  // Report state
  const [report, setReport] = useState(null);

  if (!isOpen) return null;

  const resetState = () => {
    setStep('SELECT_HOSTEL');
    setFile(null);
    setLoading(false);
    setError(null);
    setFileId(null);
    setCsvHeaders([]);
    setMappings({});
    setReport(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // NOTE: Using the raw client to skip default JSON headers for FormData
      const res = await client.post('/import/students/upload', formData);
      
      const data = res.result ?? res;
      setFileId(data.fileId);
      setCsvHeaders(data.headers);
      
      // Merge detected mappings
      const initialMap = {};
      dbFields.forEach(field => {
        initialMap[field] = data.detectedMappings[field] || '';
      });
      setMappings(initialMap);
      
      setStep('MAPPING');
    } catch (err) {
      setError(err.message || "Failed to upload CSV.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    // Clean mappings to remove empty ones
    const finalMappings = {};
    Object.keys(mappings).forEach(dbField => {
      if (mappings[dbField]) finalMappings[dbField] = mappings[dbField];
    });

    try {
      const res = await client.post('/import/students/confirm', {
        fileId,
        mappings: finalMappings,
        hostelId: selectedHostelId
      });
      
      setReport(res.result ?? res);
      setStep('REPORT');
      if (onSuccess) onSuccess(); // Trigger background refresh
    } catch (err) {
      setError(err.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-canvas border border-border shadow-xl rounded-xl w-full max-w-4xl flex flex-col my-auto relative">
        <div className="bg-card px-6 py-4 border-b border-border flex justify-between items-center rounded-t-xl">
          <h2 className="text-lg font-black text-text-primary tracking-tight">Import Students via Spreadsheet</h2>
          <button onClick={handleClose} className="text-text-muted hover:text-crimson font-bold text-xl leading-none">&times;</button>
        </div>

        <div className="p-6 flex flex-col gap-5 bg-canvas max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-medium">
              {error}
            </div>
          )}

          {step === 'SELECT_HOSTEL' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-text-secondary">
                Select the target hostel where the imported students will be assigned.
              </p>
              <div className="border border-border rounded-xl p-8 flex flex-col items-center justify-center bg-card">
                <label className="text-sm font-bold text-text-primary mb-2">Target Hostel</label>
                <select 
                  value={selectedHostelId} 
                  onChange={(e) => setSelectedHostelId(e.target.value)}
                  className="w-full max-w-sm bg-canvas border border-border text-text-primary text-sm rounded px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="" disabled>-- Select a Hostel --</option>
                  {hostels.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 'UPLOAD' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-text-secondary">
                Upload a CSV, XLS, or XLSX file containing student data. You will be able to map the columns in the next step before any data is inserted.
              </p>
              <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center bg-card">
                <input 
                  type="file" 
                  accept=".csv, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                  onChange={e => setFile(e.target.files[0])}
                  className="block w-full max-w-sm text-sm text-text-secondary
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-bold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>
          )}

          {step === 'MAPPING' && (
            <div className="flex flex-col gap-4">
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-4 py-3 rounded text-sm">
                <strong>Target Hostel:</strong> {hostels.find(h => h.id === selectedHostelId)?.name || 'Unknown'}<br/>
                <strong>Review Column Mapping:</strong> We've auto-detected some columns. Please map any missing columns required for your import.
              </div>
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="bg-canvas border-b border-border text-text-secondary text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-black">Database Field</th>
                      <th className="px-4 py-3 font-black">CSV Column</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dbFields.map(dbField => {
                      const isRequired = ['name', 'department'].includes(dbField);
                      return (
                        <tr key={dbField} className="hover:bg-canvas transition-colors">
                          <td className="px-4 py-3 font-medium text-text-primary">
                            {dbField} {isRequired && <span className="text-crimson ml-1">*</span>}
                          </td>
                          <td className="px-4 py-3">
                            <select 
                              value={mappings[dbField]} 
                              onChange={(e) => setMappings({ ...mappings, [dbField]: e.target.value })}
                              className="w-full bg-canvas border border-border text-text-primary text-sm rounded px-3 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            >
                              <option value="">-- Ignore / Not Present --</option>
                              {csvHeaders.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'REPORT' && report && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-emerald-600">{report.insertedCount}</span>
                  <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest mt-1">Students Inserted</span>
                </div>
                <div className={`border rounded-lg p-5 flex flex-col items-center justify-center ${report.skippedRows > 0 ? 'bg-red-50 border-red-200' : 'bg-card border-border'}`}>
                  <span className={`text-3xl font-black ${report.skippedRows > 0 ? 'text-red-600' : 'text-text-primary'}`}>{report.skippedRows}</span>
                  <span className={`text-sm font-bold uppercase tracking-widest mt-1 ${report.skippedRows > 0 ? 'text-red-800' : 'text-text-secondary'}`}>Rows Skipped</span>
                </div>
              </div>

              {report.failedRows && report.failedRows.length > 0 && (
                <div className="border border-red-200 rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-200 font-bold text-red-800 text-sm">
                    Error Log ({report.failedRows.length} rows)
                  </div>
                  <div className="max-h-64 overflow-y-auto bg-white p-0">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase sticky top-0">
                        <tr>
                          <th className="px-4 py-2 font-black w-24">Row #</th>
                          <th className="px-4 py-2 font-black">Errors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {report.failedRows.map((fr, i) => (
                          <tr key={i} className="hover:bg-red-50/50">
                            <td className="px-4 py-2 font-bold text-gray-700 align-top">Row {fr.row}</td>
                            <td className="px-4 py-2 text-red-600">
                              <ul className="list-disc pl-4 space-y-1">
                                {fr.errors.map((e, ei) => <li key={ei}>{e}</li>)}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-card flex justify-end gap-3 rounded-b-xl">
          {step !== 'REPORT' && (
            <button 
              onClick={handleClose} 
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          {step === 'SELECT_HOSTEL' && (
            <button 
              onClick={() => setStep('UPLOAD')}
              disabled={!selectedHostelId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded text-sm font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              Next: Upload File
            </button>
          )}

          {step === 'UPLOAD' && (
            <button 
              onClick={handleUpload}
              disabled={loading || !file}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded text-sm font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {loading ? 'Uploading...' : 'Next: Map Columns'}
            </button>
          )}

          {step === 'MAPPING' && (
            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded text-sm font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
              {loading ? 'Importing...' : `Confirm Import to ${hostels.find(h => h.id === selectedHostelId)?.name}`}
            </button>
          )}

          {step === 'REPORT' && (
            <button 
              onClick={handleClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded text-sm font-bold shadow-sm transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
