import React from 'react';

const AttendanceStats = ({ counts }) => {
  return (
    <>
      <h2 className='text-2xl font-semibold text-gray-800 mb-6'>
        Attendance Summary
      </h2>
      <div className='grid grid-cols-3 gap-4 mb-8'>
        <div className='bg-blue-50 rounded-lg p-4 text-center'>
          <p className='text-sm text-blue-700 font-medium'>PRESENT</p>
          <p className='text-3xl font-bold text-blue-800 mt-2'>
            {counts.present}
          </p>
        </div>
        <div className='bg-red-50 rounded-lg p-4 text-center'>
          <p className='text-sm text-red-700 font-medium'>ABSENT</p>
          <p className='text-3xl font-bold text-red-800 mt-2'>
            {counts.absent}
          </p>
        </div>
        <div className='bg-gray-50 rounded-lg p-4 text-center'>
          <p className='text-sm text-gray-700 font-medium'>TOTAL</p>
          <p className='text-3xl font-bold text-gray-800 mt-2'>
            {counts.total}
          </p>
        </div>
      </div>
      <div>
        <div className='flex justify-between mb-2'>
          <span className='text-sm font-medium text-gray-700'>
            Attendance Progress
          </span>
          <span className='text-sm font-medium text-gray-700'>
            {counts.total > 0
              ? Math.round((counts.present / counts.total) * 100)
              : 0}
            %
          </span>
        </div>
        <div className='overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200'>
          <div
            style={{
              width: `${
                counts.total > 0
                  ? (counts.present / counts.total) * 100
                  : 0
              }%`,
            }}
            className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-300'
          ></div>
        </div>
      </div>
    </>
  );
};

export default AttendanceStats;
