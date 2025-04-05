import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, User, Lock, Unlock, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Header from '../components/layout/Header';

const SharedChannelAccess: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareInfo, setShareInfo] = useState<{
    channelId: string;
    channelName: string;
    invitedBy: string;
    permissions: string[];
    expiresAt: string | null;
  } | null>(null);
  
  // Fetch share information
  useEffect(() => {
    const getShareInfo = async () => {
      if (!shareToken) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch share info from Supabase
        const { data, error } = await supabase
          .from('channel_shares')
          .select(`
            id,
            channel_id,
            created_by,
            permissions,
            expires_at,
            channels:channel_id (name),
            users:created_by (email, user_metadata)
          `)
          .eq('share_token', shareToken)
          .single();
        
        if (error) {
          throw new Error('Invalid or expired share link');
        }
        
        // Check if share link has expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          throw new Error('This share link has expired');
        }
        
        // Set share info
        setShareInfo({
          channelId: data.channel_id,
          channelName: data.channels.name,
          invitedBy: data.users.user_metadata?.full_name || data.users.email?.split('@')[0] || 'A user',
          permissions: data.permissions || ['view'],
          expiresAt: data.expires_at,
        });
      } catch (err) {
        console.error('Error fetching share info:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    getShareInfo();
  }, [shareToken]);
  
  // Handle accepting the share invitation
  const handleAcceptInvitation = async () => {
    if (!currentUser || !shareInfo) return;
    
    setLoading(true);
    
    try {
      // Add user to channel_members table
      const { error } = await supabase
        .from('channel_members')
        .upsert({
          channel_id: shareInfo.channelId,
          user_id: currentUser.id,
          permissions: shareInfo.permissions,
          last_accessed: new Date().toISOString(),
        });
      
      if (error) {
        throw error;
      }
      
      // Navigate to the channel
      navigate(`/channels/${shareInfo.channelId}`);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to join channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle redirecting to sign in if not authenticated
  const handleSignIn = () => {
    // We'll store the share token in localStorage to redirect back after sign in
    localStorage.setItem('pendingShareToken', shareToken || '');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-beige-100">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <Card className="p-8">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
                <h2 className="text-xl font-semibold text-coffee-800 mb-2">Unable to Access Channel</h2>
                <p className="text-coffee-600 mb-6">{error}</p>
                <Button
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </Button>
              </div>
            ) : shareInfo ? (
              <div className="space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-beige-200 rounded-full mb-4"
                  >
                    {shareInfo.permissions.includes('edit') ? (
                      <Unlock size={32} className="text-coffee-600" />
                    ) : (
                      <Lock size={32} className="text-coffee-600" />
                    )}
                  </motion.div>
                  <h2 className="text-2xl font-bold text-coffee-800 mb-2">
                    Channel Invitation
                  </h2>
                  <p className="text-coffee-600">
                    {shareInfo.invitedBy} has invited you to join their channel
                  </p>
                </div>
                
                <div className="bg-beige-200 rounded-lg p-4">
                  <h3 className="font-medium text-coffee-800 mb-2">Channel: {shareInfo.channelName}</h3>
                  <p className="text-coffee-600 text-sm mb-2">
                    You've been granted the following permissions:
                  </p>
                  <ul className="list-disc list-inside text-sm text-coffee-700">
                    {shareInfo.permissions.includes('view') && (
                      <li>View channel data and visualizations</li>
                    )}
                    {shareInfo.permissions.includes('edit') && (
                      <li>Edit channel settings and configurations</li>
                    )}
                    {shareInfo.permissions.includes('admin') && (
                      <li>Full administrative access including sharing with others</li>
                    )}
                  </ul>
                  {shareInfo.expiresAt && (
                    <p className="text-xs text-coffee-500 mt-3">
                      This invitation expires on {new Date(shareInfo.expiresAt).toLocaleDateString()} at {new Date(shareInfo.expiresAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                
                <div className="pt-4 border-t border-beige-200">
                  {currentUser ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 bg-beige-100 p-3 rounded-lg">
                        <div className="w-10 h-10 bg-beige-200 rounded-full flex items-center justify-center">
                          <User size={20} className="text-coffee-600" />
                        </div>
                        <div>
                          <p className="font-medium text-coffee-800">{currentUser.name}</p>
                          <p className="text-sm text-coffee-500">{currentUser.email}</p>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-coffee-600 hover:bg-coffee-700"
                        rightIcon={<ArrowRight size={16} />}
                        onClick={handleAcceptInvitation}
                        isLoading={loading}
                      >
                        Join Channel
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-coffee-600 text-center">
                        You need to sign in to join this channel
                      </p>
                      <Button
                        className="w-full bg-coffee-600 hover:bg-coffee-700"
                        onClick={handleSignIn}
                      >
                        Sign In to Continue
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
                <h2 className="text-xl font-semibold text-coffee-800 mb-2">Invalid Invitation</h2>
                <p className="text-coffee-600 mb-6">This sharing link appears to be invalid or has expired.</p>
                <Button
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SharedChannelAccess;