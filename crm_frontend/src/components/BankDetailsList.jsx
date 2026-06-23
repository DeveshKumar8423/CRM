import { parseBankInstructions } from "../utils/bankDetails";

function BankDetailsList({ text, className = "" }) {
  const rows = parseBankInstructions(text);
  if (!rows.length) return null;

  return (
    <div className={`crm-bank-details ${className}`.trim()}>
      {rows.map((row) => (
        <p key={row.label}>
          <strong>{row.label}:</strong> {row.value}
        </p>
      ))}
    </div>
  );
}

export default BankDetailsList;
