import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  channelName: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  channelName,
  isDeleting,
  onClose,
  onConfirm
}) => {
  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="min-h-screen px-4 flex items-center justify-center">
            <motion.div
              className="bg-beige-50 rounded-xl shadow-warm-lg w-full max-w-md relative z-10 border border-beige-200 overflow-hidden"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-beige-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-coffee-800 flex items-center">
                  <Trash2 size={20} className="mr-2 text-rose-600" />
                  Delete Channel
                </h2>
                <button
                  className="text-coffee-500 hover:text-coffee-700 focus:outline-none p-1 rounded-full hover:bg-beige-200"
                  onClick={onClose}
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Body */}
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-coffee-800">Are you absolutely sure?</h3>
                    <p className="mt-2 text-coffee-600">
                      This action <span className="font-medium text-rose-600">cannot be undone</span>. This will permanently delete the channel 
                      <span className="font-medium"> {channelName}</span>, its data, and remove all collaborators.
                    </p>
                    <div className="mt-4 bg-beige-100 border border-beige-200 p-4 rounded-md">
                      <p className="text-sm text-coffee-600">
                        <span className="font-medium">Warning:</span> All data points associated with this channel will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 bg-beige-100 border-t border-beige-200 flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={onConfirm}
                  isLoading={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Channel'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;