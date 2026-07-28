import { useRef, useState } from 'react';

const API_BASE = 'http://localhost:5000/api/admin';

export default function RankUpdatePanel() {
  const fileRef = useRef(null);
  const [step, setStep]         = useState('idle');
  const [preview, setPreview]   = useState(null);
  const [mappings, setMappings] = useState({});
  const [result, setResult]     = useState(null);
  const [errMsg, setErrMsg]     = useState('');

  const REQUIRED = ['roll_no', 'individual_rank'];
  const OPTIONAL = ['cgpa', 'name'];
  const ALL      = [...REQUIRED, ...OPTIONAL];

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStep('uploading'); setErrMsg(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch(`${API_BASE}/rank-update/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? 'Upload failed');
      setPreview(data);
      setMappings(data.detectedMappings ?? {});
      setStep('preview');
    } catch (err) { setErrMsg(err.message); setStep('error'); }
  };

  const handleConfirm = async () => {
    setStep('confirming'); setErrMsg('');
    try {
      const res  = await fetch(`${API_BASE}/rank-update/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: preview.fileId, mappings }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? 'Update failed');
      setResult(data); setStep('done');
    } catch (err) { setErrMsg(err.message); setStep('error'); }
  };

  const reset = () => {
    setStep('idle'); setPreview(null); setMappings({}); setResult(null); setErrMsg('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="bg-card border border-border rounded shadow-sm px-6 py-5 flex flex-col gap-3">
      <div>
        <h2 className="text-[14px] font-bold text-text-primary">Rank &amp; CGPA Update</h2>
        <p className="text-[11px] text-text-muted mt-0.5">
          Upload CSV/XLSX with <strong>Roll No</strong>, <strong>Rank/S.No.</strong> and optionally <strong>CGPA</strong>.
          Students are matched by roll number — existing values are overwritten. New student records can only be inserted via bulk import.
        </p>
      </div>

      {(step === 'idle' || step === 'error') && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="rank-csv-input"
            className="flex items-center gap-3 border-2 border-dashed border-border rounded-lg px-4 py-4 cursor-pointer hover:border-indigo-400 transition-colors text-[12px] text-text-muted"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Click to upload <strong>.csv</strong> / <strong>.xlsx</strong>
            <input
              id="rank-csv-input"
              ref={fileRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={handleFile}
            />
          </label>
          {errMsg && <p className="text-[11px] text-crimson font-semibold">{errMsg}</p>}
        </div>
      )}

      {step === 'uploading'  && <p className="text-[12px] text-text-muted animate-pulse">Parsing file…</p>}
      {step === 'confirming' && <p className="text-[12px] text-text-muted animate-pulse">Applying updates…</p>}

      {step === 'preview' && preview && (
        <div className="flex flex-col gap-3">
          <div className="text-[11px] bg-blue-50 border border-blue-200 text-blue-800 rounded px-3 py-2">
            Detected <strong>{preview.rowCount}</strong> rows. Verify or manually assign mappings below, then confirm.
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ALL.map(field => (
              <label key={field} className="text-[11px] font-semibold text-text-secondary flex flex-col gap-1">
                <span>
                  {field.replace('_', ' ').toUpperCase()}
                  {REQUIRED.includes(field) && <span className="text-crimson ml-1">*</span>}
                </span>
                <select
                  className="border border-border rounded px-2 py-1 bg-canvas text-[11px]"
                  value={mappings[field] ?? ''}
                  onChange={e => setMappings(m => ({ ...m, [field]: e.target.value || undefined }))}
                >
                  <option value="">— not mapped —</option>
                  {preview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border border-border rounded">
              <thead className="bg-canvas text-text-secondary">
                <tr>
                  <th className="text-left px-3 py-1.5">Roll No</th>
                  <th className="text-left px-3 py-1.5">Rank</th>
                  <th className="text-left px-3 py-1.5">CGPA</th>
                  <th className="text-left px-3 py-1.5">Name</th>
                </tr>
              </thead>
              <tbody>
                {preview.rawRows.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-1.5 font-mono">{mappings.roll_no ? row[mappings.roll_no] : '-'}</td>
                    <td className="px-3 py-1.5">{mappings.individual_rank ? row[mappings.individual_rank] : '-'}</td>
                    <td className="px-3 py-1.5">{mappings.cgpa ? row[mappings.cgpa] : '-'}</td>
                    <td className="px-3 py-1.5 text-text-muted">{mappings.name ? row[mappings.name] : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 mt-1">
            <button
              onClick={handleConfirm}
              disabled={!mappings.roll_no || !mappings.individual_rank}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[12px] font-bold disabled:opacity-50 transition-colors"
            >
              CONFIRM &amp; UPDATE
            </button>
            <button onClick={reset} className="px-4 py-2 border border-border rounded text-[12px] text-text-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div className="flex flex-col gap-2">
          <div className="bg-green-50 border border-green-200 text-green-800 rounded px-3 py-2 text-[12px]">
            ✓ <strong>{result.updated}</strong> updated &nbsp;·&nbsp;
            <strong>{result.skipped}</strong> skipped &nbsp;·&nbsp;
            <strong>{result.notFound?.length ?? 0}</strong> not found
          </div>
          {result.notFound?.length > 0 && (
            <details className="text-[11px]">
              <summary className="cursor-pointer text-text-secondary font-semibold">
                Not found ({result.notFound.length})
              </summary>
              <div className="mt-1 font-mono text-crimson bg-red-50 rounded px-3 py-2 max-h-28 overflow-y-auto">
                {result.notFound.join(', ')}
              </div>
            </details>
          )}
          <button onClick={reset} className="self-start px-4 py-2 border border-border rounded text-[12px] text-text-secondary">
            Upload Another
          </button>
        </div>
      )}
    </div>
  );
}
