import React from 'react';

const ShoeTable = ({ shoes, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
      {shoes.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No shoe records found. Click '+' to add one!</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                Shoe Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Season
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shoes.map((shoe) => (
              <tr key={shoe.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {shoe.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shoe.season}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shoe.imageUrl ? (
                    <img
                      src={shoe.imageUrl}
                      alt={`Shoe size ${shoe.size}`}
                      className="h-16 w-16 object-cover rounded-md shadow-sm"
                      onError={(e) => {
                        // Fallback for broken image URLs
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = `https://placehold.co/64x64/E0E0E0/333333?text=No+Image`;
                      }}
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                  {shoe.details || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onEdit(shoe)}
                      className="text-indigo-600 hover:text-indigo-900 px-3 py-1 rounded-md border border-indigo-600 hover:border-indigo-900 transition duration-150 ease-in-out"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(shoe.id)}
                      className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md border border-red-600 hover:border-red-900 transition duration-150 ease-in-out"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ShoeTable;
