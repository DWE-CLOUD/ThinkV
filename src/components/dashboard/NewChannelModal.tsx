import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Key, Copy, AlertCircle, Lock } from 'lucide-react';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { generateApiKey } from '../../utils/supabase';

interface NewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIELD_COLORS = [
  '#c4a389', '#bd8755', '#a06e46', '#cb9b65', 
  '#c38455', '#b06f45', '#92583a', '#764834'
];

const NewChannelModal: React.FC<NewChannelModalProps> = ({ isOpen, onClose }) => {
  const { createChannel, error, setError } = useAppContext();
  
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [fields, setFields] = useState([
    { id: '1', name: 'Field 1', fieldNumber: 1, color: FIELD_COLORS[0], unit: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Clear the error when the modal is opened/closed
  useEffect(() => {
    if (setError) {
      setError(null);
    }
  }, [isOpen, setError]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsPublic(true);
    setTags([]);
    setTagInput('');
    setFields([
      { id: '1', name: 'Field 1', fieldNumber: 1, color: FIELD_COLORS[0], unit: '' }
    ]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddField = () => {
    const newFieldNumber = fields.length + 1;
    const colorIndex = newFieldNumber % FIELD_COLORS.length;
    
    setFields([
      ...fields,
      {
        id: String(Date.now()),
        name: `Field ${newFieldNumber}`,
        fieldNumber: newFieldNumber,
        color: FIELD_COLORS[colorIndex],
        unit: ''
      }
    ]);
  };

  const handleRemoveField = (id: string) => {
    if (fields.length > 1) {
      const updatedFields = fields.filter(field => field.id !== id);
      // Renumber fields
      const renumberedFields = updatedFields.map((field, index) => ({
        ...field,
        fieldNumber: index + 1,
        name: field.name === `Field ${field.fieldNumber}` ? `Field ${index + 1}` : field.name
      }));
      setFields(renumberedFields);
    }
  };

  const handleFieldChange = (id: string, key: string, value: string) => {
    setFields(
      fields.map(field => 
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await createChannel({
        name,
        description,
        isPublic,
        tags,
        fields
      });
      
      if (result) {
        handleClose();
      }
    } catch (err) {
      console.error("Error creating channel:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
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
            onClick={handleClose}
          />
          
          <div className="min-h-screen px-4 flex items-center justify-center">
            <motion.div
              className="bg-beige-50 rounded-lg shadow-warm-lg w-full max-w-2xl relative z-10 border border-beige-200 overflow-hidden"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
            >
              <div className="px-6 py-5 border-b border-beige-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-coffee-800">Create New Channel</h2>
                <motion.button
                  className="text-coffee-500 hover:text-coffee-700 focus:outline-none p-1 rounded-full hover:bg-beige-200"
                  onClick={handleClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-rose-500 mr-2" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Channel Name */}
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                      Channel Name*
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-beige-100 border border-beige-300 rounded-lg shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
                      placeholder="e.g., Home Weather Station"
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-beige-100 border border-beige-300 rounded-lg shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
                      placeholder="Describe what this channel is used for..."
                    />
                  </div>
                  
                  {/* Privacy */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="h-4 w-4 text-coffee-600 focus:ring-coffee-500 bg-beige-100 border-beige-300 rounded"
                      />
                      <span className="ml-2 text-sm text-coffee-700">
                        Make this channel public
                      </span>
                    </label>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map(tag => (
                        <motion.span 
                          key={tag} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-coffee-100 text-coffee-700"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          layout
                        >
                          {tag}
                          <motion.button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 inline-flex items-center justify-center text-coffee-500 hover:text-coffee-700"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <X size={14} />
                          </motion.button>
                        </motion.span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="w-full px-3 py-2 bg-beige-100 border border-beige-300 rounded-lg shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
                      placeholder="Add tags and press Enter..."
                    />
                  </div>
                  
                  {/* Fields */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-coffee-700">
                        Channel Fields*
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddField}
                        leftIcon={<Plus size={16} />}
                      >
                        Add Field
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <motion.div
                          key={field.id}
                          className="flex gap-3 p-3 border border-beige-300 rounded-md bg-beige-100"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
                          exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                          layout
                          whileHover={{ boxShadow: "0 2px 4px -1px rgba(101, 78, 60, 0.06), 0 1px 2px -1px rgba(101, 78, 60, 0.03)" }}
                        >
                          <div className="flex-1">
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-beige-50 border border-beige-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800 mb-2"
                              placeholder="Field Name"
                              required
                            />
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={field.unit}
                                  onChange={(e) => handleFieldChange(field.id, 'unit', e.target.value)}
                                  className="w-full px-3 py-2 bg-beige-50 border border-beige-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
                                  placeholder="Unit (optional)"
                                />
                              </div>
                              <div>
                                <input
                                  type="color"
                                  value={field.color}
                                  onChange={(e) => handleFieldChange(field.id, 'color', e.target.value)}
                                  className="h-10 w-14 p-1 bg-beige-50 border border-beige-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
                                />
                              </div>
                            </div>
                          </div>
                          <motion.button
                            type="button"
                            onClick={() => handleRemoveField(field.id)}
                            disabled={fields.length <= 1}
                            className={`self-center p-2 rounded-full ${
                              fields.length <= 1 
                                ? 'text-beige-300 cursor-not-allowed' 
                                : 'text-coffee-500 hover:text-rose-600 hover:bg-beige-200'
                            }`}
                            whileHover={fields.length > 1 ? { scale: 1.1, backgroundColor: "rgba(225, 215, 204, 0.5)" } : {}}
                            whileTap={fields.length > 1 ? { scale: 0.9 } : {}}
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!name || fields.some(f => !f.name) || isLoading}
                    className="bg-coffee-600 hover:bg-coffee-700"
                    isLoading={isLoading}
                  >
                    Create Channel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewChannelModal;