import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Calendar, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Clinical Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome back, Dr. Sample User
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Patients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
            </div>
            <Users className="w-8 h-8 text-teal-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Consultations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Dashboard content will be implemented here
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
