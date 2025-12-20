import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@mui/material';

const QRDisplay = ({ error, qrCodeImage, qrUrl, sessionId, exportAttendance, endSession }) => {
  return (
    <div className='bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-indigo-100'>
      <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6 mr-2 text-indigo-600'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z'
          />
        </svg>
        Scan QR to Mark Attendance
      </h2>
      {error ? (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 w-full'>
          <p>{error}</p>
        </div>
      ) : qrCodeImage ? (
        <div className='flex flex-col items-center'>
          <div className='p-4 bg-white rounded-lg shadow-md mb-4 border-4 border-indigo-100'>
            <QRCodeCanvas value={qrUrl} size={256} />
          </div>
          <p className='text-sm text-gray-500 mb-4 max-w-md truncate bg-gray-50 px-3 py-2 rounded-full'>
            QR URL: {qrUrl}
          </p>
          <div className='bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg'>
            <p className='font-medium'>
              Session ID: {sessionId || 'N/A'}
            </p>
            <p className='text-sm'>
              QR code refreshes every second
            </p>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-center h-64 w-64'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600'></div>
        </div>
      )}
      <div className='flex space-x-4 mt-8'>
        <Button
          variant='contained'
          color='success'
          onClick={exportAttendance}
          startIcon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
              />
            </svg>
          }
          sx={{
            padding: '10px 24px',
            borderRadius: '10px',
            textTransform: 'none',
            boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
          }}
        >
          Export to Excel
        </Button>
        <Button
          variant='outlined'
          color='error'
          onClick={endSession}
          startIcon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          }
          sx={{
            padding: '10px 24px',
            borderRadius: '10px',
            textTransform: 'none',
            borderWidth: '2px',
          }}
        >
          End Session
        </Button>
      </div>
    </div>
  );
};

export default QRDisplay;
