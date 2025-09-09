import React from 'react';
import './ResponsiveTable.css';

const ResponsiveTable = ({ columns, data, renderRow, onEdit, onDelete, loading, error }) => {
  if (loading) return <div className="table-loading">Loading...</div>;
  if (error) return <div className="table-error">Error: {error}</div>;
  if (!data || data.length === 0) return <div className="table-empty">No data available</div>;

  return (
    <div className="responsive-table-container">
      <div className="table-scroll">
        <table className="responsive-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} data-label={column.label}>
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr key={item._id || rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={`${rowIndex}-${colIndex}`} data-label={column.label}>
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="actions-cell">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(item)}
                        className="btn-edit"
                        aria-label={`Edit ${item.username || 'item'}`}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(item._id)}
                        className="btn-delete"
                        aria-label={`Delete ${item.username || 'item'}`}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsiveTable;
