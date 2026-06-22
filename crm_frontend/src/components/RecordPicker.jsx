import { useEffect, useState } from "react";

import { apiFetch } from "../utils/api";
import { RECORD_SEARCH_ENTITIES } from "../utils/documents";

function RecordPicker({ value, onChange, disabled }) {
  const [entityKey, setEntityKey] = useState(value?.module || "contacts");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const entity = RECORD_SEARCH_ENTITIES.find((e) => e.key === entityKey) || RECORD_SEARCH_ENTITIES[0];

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ search: search.trim(), limit: "8", page: "1" });
      apiFetch(`${entity.endpoint}?${params}`)
        .then((data) => setResults(data.items || data || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, entity.endpoint]);

  const selectRecord = (item) => {
    const label = item[entity.labelField] || `#${item.id}`;
    onChange({ module: entity.key, recordId: item.id, label: `${entity.label}: ${label}` });
    setSearch("");
    setResults([]);
  };

  const clear = () => {
    onChange(null);
    setSearch("");
    setResults([]);
  };

  return (
    <div className="crm-record-picker">
      {value ? (
        <div className="crm-record-picker-selected">
          <span>{value.label}</span>
          <button type="button" className="crm-btn crm-btn-sm crm-btn-outline" onClick={clear} disabled={disabled}>
            Clear
          </button>
        </div>
      ) : (
        <>
          <div className="crm-form-grid crm-record-picker-row">
            <select value={entityKey} onChange={(e) => setEntityKey(e.target.value)} disabled={disabled}>
              {RECORD_SEARCH_ENTITIES.map((e) => (
                <option key={e.key} value={e.key}>{e.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder={`Search ${entity.label.toLowerCase()}s…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={disabled}
            />
          </div>
          {loading && <p className="crm-muted crm-mt-sm">Searching…</p>}
          {!loading && results.length > 0 && (
            <ul className="crm-record-picker-results">
              {results.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => selectRecord(item)} disabled={disabled}>
                    {item[entity.labelField] || `#${item.id}`}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default RecordPicker;
