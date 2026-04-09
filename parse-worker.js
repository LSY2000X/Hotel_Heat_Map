importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');

self.onmessage = function(e) {
  const buf = e.data;
  try {
    const wb = XLSX.read(buf, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null });
    self.postMessage({ ok: true, rows });
  } catch(err) {
    self.postMessage({ ok: false, error: err.message });
  }
};
