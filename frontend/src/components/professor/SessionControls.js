import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Typography } from '@mui/material';

const SessionControls = ({ classId, setClassId, classOptions, startSession, error }) => {
  return (
    <div className='flex flex-col items-center justify-center py-16'>
      <div className='text-center mb-10'>
        <h2 className='text-3xl font-bold text-gray-800 mb-2'>
          Professor Dashboard
        </h2>
        <p className='text-gray-600'>
          Start a new attendance session for your class
        </p>
      </div>
      <Box className='flex flex-col items-center space-y-6 bg-white p-8 rounded-xl shadow-lg max-w-md w-full'>
        <div className='w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-8 w-8 text-indigo-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        </div>
        <FormControl sx={{ minWidth: 280, marginBottom: 2 }}>
          <InputLabel>Select Class</InputLabel>
          <Select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            label='Select Class'
            sx={{ borderRadius: '10px' }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 224,
                  overflowY: 'auto',
                },
              },
            }}
          >
            <MenuItem value=''>-- Select a Class --</MenuItem>
            {classOptions.map((cls) => (
              <MenuItem key={cls.classId} value={cls.classId}>
                {cls.name} ({cls.classId})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant='contained'
          color='primary'
          onClick={startSession}
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
                d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          }
          sx={{
            padding: '12px 32px',
            borderRadius: '10px',
            textTransform: 'none',
            fontSize: '16px',
            background: 'linear-gradient(to right, #4f46e5, #6366f1)',
            boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
            },
          }}
        >
          Start Attendance Session
        </Button>
        {error && (
          <Typography
            className='text-center mt-2 bg-red-50 text-red-700 p-2 rounded-lg w-full'
          >
            {error}
          </Typography>
        )}
      </Box>
    </div>
  );
};

export default SessionControls;
