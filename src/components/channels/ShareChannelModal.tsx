import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  CheckCircle2, 
  Link, 
  Globe, 
  Mail, 
  Clock, 
  Lock, 
  Loader, 
  RefreshCw, 
  User, 
  Search,
  Plus,
  AlertTriangle,
  ExternalLink,
  Trash
} from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../utils/supabase';
import { useAppContext } from '../../context/AppContext';
import Switch from '../ui/Switch';

interface ShareChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
}

type SharePermission = 'view' | 'edit' | 'admin';

interface SharedUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  permissions: SharePermission[];
  invitedAt: string;
}

const ShareChannelModal: React.FC<ShareChannelModalProps> = ({ 
  isOpen, 
  onClose,
  channelId,
  channelName 
}) => {
  const { currentUser } = useAppContext();
  
  const [isPublic, setIsPublic] = useState(false);
  const [publicLink, setPublicLink] = useState<string>('');
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);
  
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [shareLink, setShareLink] = useState<string>('');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [isLoadingSharedUsers, setIsLoadingSharedUsers] = useState(false);
  
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<SharePermission[]>(['view']);
  const [expiryDays, setExpiryDays] = useState<number | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  
  // Initialize modal data
  useEffect(() => {
    if (isOpen && channelId) {
      // Generate public link
      const publicUrl = `${window.location.origin}/public/channels/${channelId}`;
      setPublicLink(publicUrl);
      
      // Reset state
      setShareLink('');
      setShareError(null);
      
      // Load channel public status
      const getChannelPublicStatus = async () => {
        try {
          const { data, error } = await supabase
            .from('channels')
            .select('is_public')
            .eq('id', channelId)
            .single();
          
          if (error) {
            console.error('Error fetching channel status:', error);
          } else {
            setIsPublic(data?.is_public || false);
          }
        } catch (err) {
          console.error('Error in getChannelPublicStatus:', err);
        }
      };
      
      // Load shared users
      const loadSharedUsers = async () => {
        setIsLoadingSharedUsers(true);
        try {
          const { data, error } = await supabase
            .from('channel_members')
            .select('user_id, permissions, created_at')
            .eq('channel_id', channelId);
          
          if (error) {
            console.error('Error fetching shared users:', error);
            return;
          }
          
          if (!data || data.length === 0) {
            setSharedUsers([]);
            setIsLoadingSharedUsers(false);
            return;
          }
          
          // Get user details for each member
          const users: SharedUser[] = [];
          for (const member of data) {
            // Skip if missing user_id
            if (!member.user_id) continue;
            
            // Fetch user details
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('email, user_metadata')
              .eq('id', member.user_id)
              .single();
            
            if (userError) {
              console.error('Error fetching user details:', userError);
              continue;
            }
            
            if (userData && member.user_id !== currentUser?.id) {
              users.push({
                id: member.user_id,
                email: userData.email || '',
                name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || 'Unknown User',
                avatar: userData.user_metadata?.avatar_url,
                permissions: member.permissions || ['view'],
                invitedAt: member.created_at
              });
            }
          }
          
          setSharedUsers(users);
        } catch (err) {
          console.error('Error in loadSharedUsers:', err);
        } finally {
          setIsLoadingSharedUsers(false);
        }
      };
      
      getChannelPublicStatus();
      loadSharedUsers();
    }
  }, [isOpen, channelId, currentUser?.id]);
  
  // Handle generating a new share link
  const generateShareLink = async () => {
    if (!channelId || !currentUser) return;
    
    setIsGeneratingShare(true);
    setShareError(null);
    
    try {
      // Generate a unique token
      const shareToken = `${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
      
      // Calculate expiry date if set
      let expiresAt = null;
      if (expiryDays) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + expiryDays);
        expiresAt = expiry.toISOString();
      }
      
      // Save to database
      const { error } = await supabase.from('channel_shares').insert({
        channel_id: channelId,
        created_by: currentUser.id,
        share_token: shareToken,
        permissions: permissions,
        expires_at: expiresAt
      });
      
      if (error) {
        console.error('Error creating share link:', error);
        setShareError('Error creating share link. Please try again.');
        return;
      }
      
      // Set the share link
      const link = `${window.location.origin}/shared/${shareToken}`;
      setShareLink(link);
    } catch (err) {
      console.error('Error generating share link:', err);
      setShareError('An unexpected error occurred. Please try again.');
    } finally {
      setIsGeneratingShare(false);
    }
  };
  
  // Handle copying link to clipboard
  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicLink);
    setPublicLinkCopied(true);
    setTimeout(() => setPublicLinkCopied(false), 2000);
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  };
  
  // Handle toggling public status
  const togglePublicStatus = async () => {
    try {
      const { error } = await supabase
        .from('channels')
        .update({ is_public: !isPublic })
        .eq('id', channelId);
      
      if (error) {
        console.error('Error toggling public status:', error);
        return;
      }
      
      setIsPublic(!isPublic);
    } catch (err) {
      console.error('Error in togglePublicStatus:', err);
    }
  };
  
  // Handle sending invite
  const sendInvite = async () => {
    if (!email || !channelId || !currentUser) return;
    
    setIsSendingInvite(true);
    setInviteError(null);
    setInviteSuccess(null);
    
    try {
      // Check if the email is registered in the system
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();
      
      if (userError && !userError.message.includes('No rows found')) {
        throw new Error(`Error checking user: ${userError.message}`);
      }
      
      if (!users || !users.id) {
        // User not found, create a pending invitation
        const shareToken = `${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
        
        // Calculate expiry date if set
        let expiresAt = null;
        if (expiryDays) {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + expiryDays);
          expiresAt = expiry.toISOString();
        }
        
        // Save pending invitation
        const { error } = await supabase.from('channel_invitations').insert({
          channel_id: channelId,
          invited_by: currentUser.id,
          invited_email: email,
          share_token: shareToken,
          permissions: permissions,
          expires_at: expiresAt,
          status: 'pending'
        });
        
        if (error) {
          throw new Error('Failed to create invitation');
        }
        
        // In a real system, we would now send an email with the invitation link
        setInviteSuccess(`Invitation sent to ${email}`);
        
      } else {
        // User exists, add them to channel_members
        const { error } = await supabase.from('channel_members').insert({
          channel_id: channelId,
          user_id: users.id,
          permissions: permissions
        });
        
        if (error) {
          // Check if it's a uniqueness violation (user already has access)
          if (error.code === '23505') {
            // Update the existing permissions instead
            const { error: updateError } = await supabase
              .from('channel_members')
              .update({ permissions: permissions })
              .eq('channel_id', channelId)
              .eq('user_id', users.id);
            
            if (updateError) {
              throw new Error('Failed to update user permissions');
            }
            
            setInviteSuccess(`Updated permissions for ${email}`);
          } else {
            throw new Error('Failed to add user to channel');
          }
        } else {
          setInviteSuccess(`Added ${email} to channel`);
        }
        
        // Reload the shared users list
        loadSharedUsers();
      }
      
      // Clear the email field
      setEmail('');
    } catch (err) {
      console.error('Error sending invite:', err);
      setInviteError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSendingInvite(false);
    }
  };
  
  // Load user details after adding to channel_members
  const loadSharedUsers = async () => {
    setIsLoadingSharedUsers(true);
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select('user_id, permissions, created_at')
        .eq('channel_id', channelId);
      
      if (error) {
        console.error('Error fetching shared users:', error);
        return;
      }
      
      if (!data || data.length === 0) {
        setSharedUsers([]);
        setIsLoadingSharedUsers(false);
        return;
      }
      
      // Get user details for each member
      const users: SharedUser[] = [];
      for (const member of data) {
        // Skip if missing user_id
        if (!member.user_id) continue;
        
        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, user_metadata')
          .eq('id', member.user_id)
          .single();
        
        if (userError) {
          console.error('Error fetching user details:', userError);
          continue;
        }
        
        if (userData && member.user_id !== currentUser?.id) {
          users.push({
            id: member.user_id,
            email: userData.email || '',
            name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || 'Unknown User',
            avatar: userData.user_metadata?.avatar_url,
            permissions: member.permissions || ['view'],
            invitedAt: member.created_at
          });
        }
      }
      
      setSharedUsers(users);
    } catch (err) {
      console.error('Error in loadSharedUsers:', err);
    } finally {
      setIsLoadingSharedUsers(false);
    }
  };
  
  // Handle removing a user's access
  const removeUserAccess = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error removing user access:', error);
        return;
      }
      
      // Update the shared users list
      setSharedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error in removeUserAccess:', err);
    }
  };
  
  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20, 
      transition: { 
        duration: 0.3, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };
  
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };
  
  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.4, 
        delay: 0.1 
      } 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={onClose}
          />
          
          <div className="min-h-screen px-4 py-6 flex items-center justify-center">
            <motion.div
              className="bg-beige-50 rounded-xl shadow-warm-lg w-full max-w-2xl relative z-10 border border-beige-200 overflow-hidden"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-beige-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-coffee-800">Share Channel: {channelName}</h2>
                <button
                  className="text-coffee-500 hover:text-coffee-700 focus:outline-none p-1 rounded-full hover:bg-beige-200"
                  onClick={onClose}
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <motion.div 
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {/* Public Sharing Section */}
                  <div className="bg-beige-100 p-4 rounded-lg border border-beige-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Globe size={20} className="text-coffee-600 mr-2" />
                        <h3 className="font-medium text-coffee-800">Public Access</h3>
                      </div>
                      <Switch 
                        checked={isPublic} 
                        onChange={togglePublicStatus} 
                        label="Make channel public"
                      />
                    </div>
                    
                    {isPublic && (
                      <div className="space-y-3">
                        <p className="text-sm text-coffee-600">
                          Anyone with the link can view this channel's data without signing in.
                        </p>
                        
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={publicLink}
                            readOnly
                            className="flex-1 px-3 py-2 bg-beige-200 border border-beige-300 rounded-md text-coffee-800 text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={publicLinkCopied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            onClick={copyPublicLink}
                          >
                            {publicLinkCopied ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<ExternalLink size={16} />}
                            onClick={() => window.open(publicLink, '_blank')}
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Direct Sharing Section */}
                  <div>
                    <h3 className="font-medium text-coffee-800 mb-3">Share with People</h3>
                    
                    {/* Email Input */}
                    <div className="flex space-x-2 mb-4">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-coffee-500" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter email address"
                          className="pl-10 w-full px-3 py-2 bg-beige-100 border border-beige-200 rounded-md text-coffee-800"
                        />
                      </div>
                      <Button
                        variant="primary"
                        className="bg-coffee-600 hover:bg-coffee-700"
                        leftIcon={isSendingInvite ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                        onClick={sendInvite}
                        disabled={!email || isSendingInvite}
                      >
                        {isSendingInvite ? 'Sending...' : 'Invite'}
                      </Button>
                    </div>
                    
                    {/* Success message */}
                    {inviteSuccess && (
                      <motion.div 
                        className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-md text-sm"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                          <span>{inviteSuccess}</span>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Error message */}
                    {inviteError && (
                      <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-md text-sm">
                        <div className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-rose-500 mr-2 mt-0.5" />
                          <span>{inviteError}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Permission & Expiry Settings */}
                    <div className="bg-beige-100 p-4 rounded-lg border border-beige-200 mb-4">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-coffee-700 mb-2">Permissions</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={permissions.includes('view') ? 'primary' : 'outline'}
                            className={permissions.includes('view') ? 'bg-coffee-600' : ''}
                            onClick={() => setPermissions(['view'])}
                          >
                            View only
                          </Button>
                          <Button
                            size="sm"
                            variant={permissions.includes('edit') ? 'primary' : 'outline'}
                            className={permissions.includes('edit') ? 'bg-coffee-600' : ''}
                            onClick={() => setPermissions(['view', 'edit'])}
                          >
                            Can edit
                          </Button>
                          <Button
                            size="sm"
                            variant={permissions.includes('admin') ? 'primary' : 'outline'}
                            className={permissions.includes('admin') ? 'bg-coffee-600' : ''}
                            onClick={() => setPermissions(['view', 'edit', 'admin'])}
                          >
                            Admin
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-coffee-700 mb-2">Link expiration</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={expiryDays === null ? 'primary' : 'outline'}
                            className={expiryDays === null ? 'bg-coffee-600' : ''}
                            onClick={() => setExpiryDays(null)}
                          >
                            Never
                          </Button>
                          <Button
                            size="sm"
                            variant={expiryDays === 1 ? 'primary' : 'outline'}
                            className={expiryDays === 1 ? 'bg-coffee-600' : ''}
                            onClick={() => setExpiryDays(1)}
                          >
                            1 day
                          </Button>
                          <Button
                            size="sm"
                            variant={expiryDays === 7 ? 'primary' : 'outline'}
                            className={expiryDays === 7 ? 'bg-coffee-600' : ''}
                            onClick={() => setExpiryDays(7)}
                          >
                            7 days
                          </Button>
                          <Button
                            size="sm"
                            variant={expiryDays === 30 ? 'primary' : 'outline'}
                            className={expiryDays === 30 ? 'bg-coffee-600' : ''}
                            onClick={() => setExpiryDays(30)}
                          >
                            30 days
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Generate Link */}
                    <div className="mb-6">
                      <div className="mb-3 flex justify-between items-center">
                        <h4 className="text-sm font-medium text-coffee-700">Create a shareable link</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={isGeneratingShare ? <Loader size={14} className="animate-spin" /> : <Link size={14} />}
                          onClick={generateShareLink}
                          disabled={isGeneratingShare}
                        >
                          {isGeneratingShare ? 'Generating...' : 'Generate link'}
                        </Button>
                      </div>
                      
                      {shareError && (
                        <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-md text-sm">
                          <div className="flex items-start">
                            <AlertTriangle className="h-4 w-4 text-rose-500 mr-2 mt-0.5" />
                            <span>{shareError}</span>
                          </div>
                        </div>
                      )}
                      
                      {shareLink && (
                        <motion.div 
                          className="flex space-x-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 px-3 py-2 bg-beige-100 border border-beige-200 rounded-md text-coffee-800 text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={shareLinkCopied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            onClick={copyShareLink}
                          >
                            {shareLinkCopied ? 'Copied!' : 'Copy'}
                          </Button>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* People with Access */}
                    <div>
                      <h3 className="font-medium text-coffee-800 mb-3 flex items-center">
                        <User size={18} className="mr-2" />
                        People with Access
                      </h3>
                      
                      {isLoadingSharedUsers ? (
                        <div className="py-6 flex justify-center">
                          <Loader size={24} className="animate-spin text-coffee-500" />
                        </div>
                      ) : sharedUsers.length > 0 ? (
                        <ul className="space-y-2">
                          {sharedUsers.map(user => (
                            <li key={user.id} className="flex items-center justify-between bg-beige-100 p-3 rounded-lg">
                              <div className="flex items-center">
                                {user.avatar ? (
                                  <img 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-8 h-8 rounded-full mr-3 object-cover" 
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-beige-300 rounded-full flex items-center justify-center mr-3">
                                    <User size={16} className="text-coffee-600" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-coffee-800">{user.name}</p>
                                  <p className="text-xs text-coffee-500">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-beige-200 px-2 py-0.5 rounded text-coffee-700">
                                  {user.permissions.includes('admin') 
                                    ? 'Admin' 
                                    : user.permissions.includes('edit') 
                                      ? 'Editor' 
                                      : 'Viewer'}
                                </span>
                                <button
                                  className="text-coffee-500 hover:text-rose-600 p-1 rounded-full hover:bg-beige-200"
                                  onClick={() => removeUserAccess(user.id)}
                                  title="Remove access"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-4 text-coffee-500 bg-beige-100 rounded-lg">
                          No one else has access to this channel yet
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-beige-200 bg-beige-100">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareChannelModal;