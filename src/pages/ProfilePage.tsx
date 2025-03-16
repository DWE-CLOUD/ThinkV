import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Mail, Key, Image as ImageIcon, Save, Loader } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser?.bio || '',
        avatarUrl: currentUser?.avatar || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    try {
      await updateUserProfile({
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatarUrl
      });
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
      // Show success message for 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-beige-100">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-medium text-coffee-800 mb-4">Please log in to view your profile</h2>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-coffee-800">Your Profile</h1>
          <p className="text-coffee-600">Manage your personal information and account preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with menu */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <ul className="divide-y divide-beige-200">
                <li>
                  <a 
                    href="/profile" 
                    className="flex items-center px-6 py-4 bg-beige-100 border-l-4 border-coffee-600 text-coffee-800 font-medium"
                  >
                    <User className="mr-3 h-5 w-5 text-coffee-600" />
                    Profile Information
                  </a>
                </li>
                <li>
                  <a 
                    href="/settings" 
                    className="flex items-center px-6 py-4 hover:bg-beige-100 text-coffee-700 hover:text-coffee-800"
                  >
                    <Settings className="mr-3 h-5 w-5 text-coffee-500" />
                    Account Settings
                  </a>
                </li>
                <li>
                  <a 
                    href="/devices" 
                    className="flex items-center px-6 py-4 hover:bg-beige-100 text-coffee-700 hover:text-coffee-800"
                  >
                    <Settings className="mr-3 h-5 w-5 text-coffee-500" />
                    Devices
                  </a>
                </li>
              </ul>
            </Card>
          </motion.div>

          {/* Main content */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-coffee-800">Profile Information</h2>
                <p className="text-coffee-600 text-sm">Update your personal details and public profile</p>
              </div>

              {successMessage && (
                <motion.div 
                  className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {successMessage}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative">
                    {formData.avatarUrl ? (
                      <img 
                        src={formData.avatarUrl} 
                        alt={formData.name || 'User'} 
                        className="h-24 w-24 rounded-full object-cover border-2 border-beige-200"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-beige-200 flex items-center justify-center text-coffee-600">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                      Profile Photo
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        name="avatarUrl"
                        value={formData.avatarUrl}
                        onChange={handleChange}
                        placeholder="Enter avatar URL"
                        className="flex-1 px-3 py-2 bg-beige-100 border border-beige-300 rounded-lg shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        leftIcon={<ImageIcon size={16} />}
                      >
                        Change
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-coffee-500">
                      Enter a URL for your profile image
                    </p>
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-coffee-700 mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={16} className="text-coffee-500" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 w-full px-3 py-2 bg-beige-100 border border-beige-300 rounded-lg shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-coffee-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-coffee-500" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        readOnly
                        className="pl-10 w-full px-3 py-2 bg-beige-100 border border-beige-300 rounded-lg shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800 opacity-75"
                      />
                    </div>
                    <p className="mt-1 text-xs text-coffee-500">
                      Email cannot be changed. Contact support for help.
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-coffee-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 bg-beige-100 border border-beige-300 rounded-lg shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
                    placeholder="Tell us a bit about yourself..."
                  />
                  <p className="mt-1 text-xs text-coffee-500">
                    Brief description for your profile.
                  </p>
                </div>

                {/* Submit button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    leftIcon={isLoading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;