import { linesForDisplay } from "../utils/lineItemText";

function LineItemDescription({ itemName, description, className = "crm-line-item-desc" }) {
  const lines = linesForDisplay(itemName, description);
  if (!lines.length) return null;

  if (lines.length === 1) {
    return <div className={`${className} crm-muted`}>{lines[0]}</div>;
  }

  return (
    <ul className={`${className} crm-line-item-list`}>
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

export default LineItemDescription;
