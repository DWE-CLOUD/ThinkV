import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Key, Copy, AlertCircle, Lock, BarChart2, Layers, Cpu, Activity, ChevronRight } from 'lucide-react';
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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [fields, setFields] = useState([
    { id: '1', name: 'Field 1', fieldNumber: 1, color: FIELD_COLORS[0], unit: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Clear the error when the modal is opened/closed
  useEffect(() => {
    if (setError) {
      setError(null);
    }
    setApiError(null);
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
    setCurrentStep(1);
    setApiError(null);
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

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return name.trim() !== '';
      case 2:
        return fields.every(field => field.name.trim() !== '');
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);
    
    try {
      const result = await createChannel({
        name,
        description,
        isPublic,
        tags,
        fields,
        userId: '', // Will be filled by context
      });
      
      if (result) {
        handleClose();
      } else {
        setApiError("Failed to create channel. Please try again.");
      }
    } catch (err) {
      console.error("Error creating channel:", err);
      setApiError(err instanceof Error ? err.message : "An unexpected error occurred");
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

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-coffee-600 text-white' : 'bg-beige-200 text-coffee-600'}`}>
          1
        </div>
        <div className={`w-10 h-1 ${currentStep >= 2 ? 'bg-coffee-600' : 'bg-beige-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-coffee-600 text-white' : 'bg-beige-200 text-coffee-600'}`}>
          2
        </div>
        <div className={`w-10 h-1 ${currentStep >= 3 ? 'bg-coffee-600' : 'bg-beige-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-coffee-600 text-white' : 'bg-beige-200 text-coffee-600'}`}>
          3
        </div>
      </div>
    </div>
  );

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
          
          <div className="min-h-screen px-4 py-6 md:py-8 flex items-center justify-center">
            <motion.div
              className="bg-beige-50 rounded-lg shadow-warm-lg w-full max-w-2xl relative z-10 border border-beige-200 overflow-hidden"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
            >
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-beige-200 flex justify-between items-center">
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
              
              <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-6">
                {renderStepIndicator()}
                
                {error && (
                  <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                
                {apiError && (
                  <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{apiError}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center justify-center mb-4">
                            <motion.div 
                              className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center"
                              animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 5, 0, -5, 0] 
                              }}
                              transition={{ 
                                duration: 6, 
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              <Layers size={32} className="text-coffee-600" />
                            </motion.div>
                          </div>
                          <h3 className="text-lg font-medium text-coffee-800">Basic Channel Information</h3>
                          <p className="text-coffee-600 text-sm max-w-md mx-auto mt-1">Create a channel to visualize data from your IoT devices</p>
                        </div>
                        
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
                          <p className="mt-1 text-xs text-coffee-500 ml-6">Public channels can be viewed by anyone with the link</p>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center justify-center mb-4">
                            <motion.div 
                              className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center"
                              animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 5, 0, -5, 0] 
                              }}
                              transition={{ 
                                duration: 6, 
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              <BarChart2 size={32} className="text-coffee-600" />
                            </motion.div>
                          </div>
                          <h3 className="text-lg font-medium text-coffee-800">Define Data Fields</h3>
                          <p className="text-coffee-600 text-sm max-w-md mx-auto mt-1">Specify the data fields that your devices will send</p>
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
                                className="flex flex-col sm:flex-row gap-3 p-3 border border-beige-300 rounded-md bg-beige-100"
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
                                  <div className="flex flex-col sm:flex-row gap-2">
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
                                  aria-label="Remove field"
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
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center justify-center mb-4">
                            <motion.div 
                              className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center"
                              animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 5, 0, -5, 0] 
                              }}
                              transition={{ 
                                duration: 6, 
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              <Cpu size={32} className="text-coffee-600" />
                            </motion.div>
                          </div>
                          <h3 className="text-lg font-medium text-coffee-800">Finalize Your Channel</h3>
                          <p className="text-coffee-600 text-sm max-w-md mx-auto mt-1">Add tags and finalize your channel setup</p>
                        </div>
                        
                        {/* Tags */}
                        <div>
                          <label className="block text-sm font-medium text-coffee-700 mb-1">
                            Tags (Optional)
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
                          <p className="mt-1 text-xs text-coffee-500">Organize your channels with tags like "home", "weather", "energy", etc.</p>
                        </div>
                        
                        <div className="bg-beige-100 border border-beige-200 rounded-lg p-5 mt-6">
                          <h3 className="text-lg font-medium text-coffee-800 mb-3">Channel Summary</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-coffee-600">Name:</span>
                              <span className="font-medium text-coffee-800">{name}</span>
                            </div>
                            {description && (
                              <div className="flex justify-between">
                                <span className="text-coffee-600">Description:</span>
                                <span className="font-medium text-coffee-800 max-w-[60%] text-right">{description}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-coffee-600">Visibility:</span>
                              <span className="font-medium text-coffee-800">{isPublic ? 'Public' : 'Private'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-coffee-600">Fields:</span>
                              <span className="font-medium text-coffee-800">{fields.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-coffee-600">Tags:</span>
                              <span className="font-medium text-coffee-800">{tags.length > 0 ? tags.join(', ') : 'None'}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-3">
                    <div>
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                        >
                          Back
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                      >
                        Cancel
                      </Button>
                      {currentStep < 3 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!isStepValid(currentStep)}
                          className="bg-coffee-600 hover:bg-coffee-700"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="bg-coffee-600 hover:bg-coffee-700"
                          isLoading={isLoading}
                        >
                          Create Channel
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewChannelModal;