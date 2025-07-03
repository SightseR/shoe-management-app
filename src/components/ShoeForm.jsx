import React, { useState, useEffect } from 'react';


const ShoeForm = ({ shoe, onSave, onCancel }) => {
  
  const [size, setSize] = useState(shoe?.size || 20); 
  const [season, setSeason] = useState(shoe?.season || 'Summer'); 
  const [imageUrl, setImageUrl] = useState(shoe?.imageUrl || '');
  const [details, setDetails] = useState(shoe?.details || '');
  const [error, setError] = useState(''); 

 
  useEffect(() => {
    if (shoe) {
      setSize(shoe.size);
      setSeason(shoe.season);
      setImageUrl(shoe.imageUrl);
      setDetails(shoe.details);
    } else {
      
      setSize(20);
      setSeason('Summer');
      setImageUrl('');
      setDetails('');
    }
    setError(''); 
  }, [shoe]);

  
  const handleSubmit = (e) => {
    e.preventDefault(); 

    
    if (size < 20 || size > 50) {
      setError('Shoe size must be between 20 and 50.');
      return;
    }

    setError(''); 

    
    const newShoe = {
      size: Number(size), 
      season,
      imageUrl,
      details,
    };

    onSave(newShoe); 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Shoe Size Input */}
      <div>
        <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
          Shoe Size (20-50):
        </label>
        <input
          type="number"
          id="size"
          min="20"
          max="50"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Season Radio Buttons */}
      <div>
        <span className="block text-sm font-medium text-gray-700 mb-1">Season:</span>
        <div className="mt-2 flex flex-wrap gap-4">
          {['Summer', 'Autumn/Spring', 'Winter'].map((s) => (
            <label key={s} className="inline-flex items-center">
              <input
                type="radio"
                name="season"
                value={s}
                checked={season === s}
                onChange={(e) => setSeason(e.target.value)}
                className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-gray-700">{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Image URL Input (simulating image upload) */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Image URL (Optional):
        </label>
        <input
          type="url" 
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., https://example.com/shoe.jpg"
        />
        <p className="mt-1 text-xs text-gray-500">
          In a real app, this would be an image upload. For this demo, please provide an image URL.
        </p>
      </div>

      {/* Details Textarea */}
      <div>
        <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
          Details:
        </label>
        <textarea
          id="details"
          rows="3"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter any additional details about the shoe..."
        ></textarea>
      </div>

      {/* Form Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
        >
          {shoe ? 'Update Shoe' : 'Add Shoe'}
        </button>
      </div>
    </form>
  );
};

export default ShoeForm;
