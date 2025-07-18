import React from "react";
import { useTheme } from "../../../store/ThemeProvider";
import api from "../../../api/api";
import toast from 'react-hot-toast';

const ContactPage = () => {
  const { darkMode } = useTheme();
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.post('/api/contact', formData);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  if (submitted) {
    return (
      <div className={`flex items-center justify-center min-h-[calc(100vh-74px)] ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="mb-4">
            Thanks for contacting us. We will soon notify you.
          </p>
          <p className="text-blue-500">Regards,</p>
          <p className="font-semibold">The Collabspace Team</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center min-h-[calc(100vh-74px)] ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          We'd love to hear from you! If you have any questions or feedback,
          feel free to reach out to us.
        </p>
        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label
              className={`block text-left mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              htmlFor="name"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label
              className={`block text-left mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label
              className={`block text-left mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              htmlFor="message"
            >
              Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
              rows="4"
            ></textarea>
          </div>
          <button
            type="submit"
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;