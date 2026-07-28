import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ComplaintForm() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    priority: 'medium'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
   
    let token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");


    

    if (!token || !userStr) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userStr);

    try {
      const response = await fetch('http://localhost:5000/complaint/postcomplaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'role': user.role || 'student' 
        },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          description: formData.description,
          hostel: user.hostel, 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit complaint');
      }

    
      navigate('/complaint');
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "w-full border border-gray-300 p-3.5 rounded-lg mt-1.5 outline-none focus:border-[#5b0e0e] focus:ring-1 focus:ring-[#5b0e0e] transition-all text-gray-800 bg-white shadow-sm hover:border-gray-400 disabled:opacity-50";
  const labelStyles = "block text-xs font-bold text-gray-500 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 relative">
        
        <button 
          onClick={() => navigate('/complaint')}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-xl font-bold"
          title="Close"
          disabled={isSubmitting}
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="text-center mb-6 border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-bold text-[#5b0e0e]">
              Raise a Complaint
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              Fill out the details below to notify the hostel administration.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className={labelStyles}>
              Complaint Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="title"
              placeholder="e.g. Broken window latch in Room 102"
              value={formData.title}
              onChange={handleChange}
              className={inputStyles}
              maxLength="100"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className={labelStyles}>
              Complaint Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={inputStyles}
              disabled={isSubmitting}
            >
              <option value="" disabled>Select Type</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Internet/WiFi">Internet / Wi-Fi</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Mess/Food">Mess / Food</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelStyles}>
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              name="description"
              placeholder="Provide specific details about the issue so we can fix it faster..."
              value={formData.description}
              onChange={handleChange}
              className={inputStyles + " resize-none h-32"}
              maxLength="500"
              disabled={isSubmitting}
            />
            <div className="flex justify-end mt-1.5">
              <span className={`text-xs font-medium ${formData.description.length >= 480 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.description.length} / 500
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-2">
            <button 
              type="button" 
              onClick={() => navigate('/complaint')}
              disabled={isSubmitting}
              className="w-1/3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3.5 rounded-lg font-bold transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-2/3 bg-[#5b0e0e] hover:bg-[#741616] text-white py-3.5 rounded-lg font-bold transition-colors duration-200 shadow-md shadow-[#5b0e0e]/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin text-xl leading-none">↻</span> Submitting...
                </>
              ) : (
                "Submit Complaint"
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default ComplaintForm;