import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Box, Typography } from '@mui/material';
import SessionControls from './components/professor/SessionControls';
import AttendanceStats from './components/professor/AttendanceStats';
import ScannedStudentList from './components/professor/ScannedStudentList';
import QRDisplay from './components/professor/QRDisplay';

const socket = io('https://qr-backend-3-0.onrender.com', { autoConnect: true });

function ProfessorDashboard() {
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [classId, setClassId] = useState('');
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ present: 0, absent: 0, total: 0 });
  const [sessionActive, setSessionActive] = useState(false);
  const [warning, setWarning] = useState('');
  const [classOptions, setClassOptions] = useState([]);
  const [qrToken, setQrToken] = useState('');
  const [scannedStudents, setScannedStudents] = useState([]);
  const [lastFetch, setLastFetch] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [finalTime, setFinalTime] = useState(null);
  const intervalRef = useRef(null); // Ref for polling interval
  const timerRef = useRef(null);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('https://qr-backend-3-0.onrender.com/api/classes');
      console.log('Raw API response:', res.data);
      setClassOptions(res.data);
      console.log('Set classOptions:', res.data.length, res.data);
    } catch (err) {
      setError('Failed to load class list');
      console.error('Fetch classes error:', err.message);
    }
  };

  useEffect(() => {
    fetchClasses();
    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', () => console.log('Socket disconnected'));
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const startSession = () => {
    if (!classId) {
      setError('Please select a class');
      return;
    }
    socket.emit('startSession', { classId });
  };

  const endSession = () => {
    socket.emit('endSession', sessionId);
  };

  const fetchQR = useCallback(async () => {
    if (!sessionActive || !sessionId || !qrToken) return;
    const now = Date.now();
    if (now - lastFetch < 500) return; // Debounce to every 500ms
    setLastFetch(now);
    try {
      const res = await axios.get(`https://qr-backend-3-0.onrender.com/api/qr?sessionId=${sessionId}`);
      setQrCodeImage(res.data.qrCode);
      setQrUrl(res.data.qrUrl);
      console.log('Generated QR URL from backend:', res.data.qrUrl);
      setError(null);
    } catch (err) {
      setError('Failed to fetch QR code');
      console.error('Fetch QR error:', err.message);
    }
  }, [sessionActive, sessionId, qrToken, lastFetch]);

  useEffect(() => {
    socket.on('sessionStarted', ({ sessionId, classId, qrToken }) => {
      setSessionId(sessionId);
      setClassId(classId);
      setQrToken(qrToken);
      setSessionActive(true);
      setElapsedTime(0);
      setIsRunning(true);
      setFinalTime(null);
      fetchQR();
    });

    socket.on('qrUpdate', ({ sessionId, qrToken }) => {
      setQrToken(qrToken);
      fetchQR();
    });

    socket.on('sessionEnded', () => {
      setSessionActive(false);
      setQrCodeImage('');
      setQrUrl('');
      setSessionId('');
      setQrToken('');
      setCounts({ present: 0, absent: 0, total: 0 });
      setScannedStudents([]);
      setWarning('');
      setIsRunning(false);
      setFinalTime(elapsedTime);
    });

    socket.on('attendanceUpdate', (data) => {
      setCounts({
        present: data.present,
        absent: data.absent,
        total: data.total,
      });
      setScannedStudents(data.scannedStudents || []);
    });

    socket.on('columnWarning', (message) => {
      setWarning(message);
    });

    return () => {
      socket.off('sessionStarted');
      socket.off('qrUpdate');
      socket.off('sessionEnded');
      socket.off('attendanceUpdate');
      socket.off('columnWarning');
    };
  }, [fetchQR, elapsedTime]);

  useEffect(() => {
    if (sessionActive) fetchQR();
  }, [sessionActive, fetchQR]);

  const exportAttendance = () => {
    if (sessionActive) {
      window.location.href = `https://qr-backend-3-0.onrender.com/api/export?sessionId=${sessionId}`;
    }
  };

  // Dedicated useEffect for serverShutdown and connect_error
  useEffect(() => {
    socket.on('serverShutdown', ({ message }) => {
      console.log('Server shutting down:', message);
      setError('Server is restarting, please wait...');
      if (intervalRef.current) clearInterval(intervalRef.current);
      socket.disconnect();
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      socket.disconnect();
    });

    return () => {
      socket.off('serverShutdown');
      socket.off('connect_error');
      socket.disconnect(); // Ensure disconnect on unmount
    };
  }, []);

  // Polling for attendance updates (reduced to 15000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionId) {
        axios.get(`https://qr-backend-3-0.onrender.com/api/attendance/count?sessionId=${sessionId}`)
          .then(res => {
            setCounts({
              present: res.data.present,
              absent: res.data.absent,
              total: res.data.total,
            });
            setScannedStudents(res.data.scannedStudents || []);
          })
          .catch(err => {
            console.error('Attendance count fetch error:', err.message);
            setError('Failed to fetch attendance counts');
          });
      }
    }, 15000);
    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, [sessionId]);

  // Stopwatch logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50'>
      <header className='bg-white shadow-md backdrop-blur-sm bg-white/90 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-indigo-800 flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8 mr-2 text-indigo-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
              />
            </svg>
            QR Attendance System
          </h1>
          <div className='flex items-center space-x-4'>
            {classId && (
              <span className='text-sm font-medium px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full'>
                Class: {classId}
              </span>
            )}
            <div className='h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-md'>
              <span className='text-white font-medium'>P</span>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative'>
        {!sessionActive ? (
          <SessionControls 
            classId={classId}
            setClassId={setClassId}
            classOptions={classOptions}
            startSession={startSession}
            error={error}
          />
        ) : (
          <>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <QRDisplay 
                error={error}
                qrCodeImage={qrCodeImage}
                qrUrl={qrUrl}
                sessionId={sessionId}
                exportAttendance={exportAttendance}
                endSession={endSession}
              />
              <div className='bg-white rounded-xl shadow-lg p-6'>
                <AttendanceStats counts={counts} />
                {warning && (
                  <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6'>
                    <div className='flex'>
                      <div className='flex-shrink-0'>
                        <svg className='h-5 w-5 text-yellow-400' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'>
                          <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                        </svg>
                      </div>
                      <div className='ml-3'>
                        <p className='text-sm text-yellow-700'>{warning}</p>
                      </div>
                    </div>
                  </div>
                )}
                <ScannedStudentList scannedStudents={scannedStudents} />
                <div className='mt-8 text-center'>
                  <p className='text-sm text-gray-500 flex items-center justify-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-1'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 10V3L4 14h7v7l9-11h-7z'
                      />
                    </svg>
                    Attendance updates in real-time as students scan the QR code
                  </p>
                </div>
              </div>
            </div>
            {/* Stopwatch */}
            {(sessionActive || finalTime !== null) && (
              <Box 
                sx={{ 
                  position: 'fixed', 
                  bottom: 16, 
                  right: 16, 
                  backgroundColor: 'white', 
                  padding: 2, 
                  borderRadius: 2, 
                  boxShadow: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1 
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {isRunning ? formatTime(elapsedTime) : `Session Time: ${formatTime(finalTime)}`}
                </Typography>
              </Box>
            )}
          </>
        )}
      </main>
      <footer className='bg-white mt-12 py-6 border-t border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <p className='text-center text-sm text-gray-500'>
            QR Attendance System © {new Date().getFullYear()} | All rights
            reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

export default ProfessorDashboard;