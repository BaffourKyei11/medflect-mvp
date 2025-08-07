import React from 'react';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Application settings will be implemented here
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
