import React from 'react';
import { Typography } from '@mui/material';

const ScannedStudentList = ({ scannedStudents }) => {
  return (
    <div className='mt-6'>
      <Typography variant='h6' className='text-gray-800 mb-4'>
        Scanned Students
      </Typography>
      {scannedStudents.length > 0 ? (
        <div className='max-h-[10rem] overflow-y-auto border border-gray-200 rounded-lg'>
          {scannedStudents.map((student) => (
            <div
              key={student.email}
              className='border-b border-gray-100 py-2 px-4 hover:bg-gray-50'
            >
              <Typography className='text-sm text-gray-700'>
                {student.email} - Scanned at{' '}
                {new Date(student.timestamp).toLocaleTimeString(
                  'en-IN',
                  { timeZone: 'Asia/Kolkata' }
                )}
              </Typography>
            </div>
          ))}
        </div>
      ) : (
        <Typography className='text-sm text-gray-500 text-center'>
          No students scanned yet
        </Typography>
      )}
    </div>
  );
};

export default ScannedStudentList;
