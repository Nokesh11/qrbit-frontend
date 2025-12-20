import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { BrowserQRCodeReader } from '@zxing/browser';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Box, Typography } from "@mui/material";
import QRScanner from './components/student/QRScanner';
import AttendanceHistory from './components/student/AttendanceHistory';

const socket = io("https://qr-backend-3-0.onrender.com", { autoConnect: true });

function StudentDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [classId, setClassId] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [manualQrInput, setManualQrInput] = useState("");
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [zoomMin, setZoomMin] = useState(1);
  const [zoomMax, setZoomMax] = useState(5);
  const [zoomStep, setZoomStep] = useState(0.1);
  const [currentZoom, setCurrentZoom] = useState(1);
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const scanningRef = useRef(false);
  const lastScanTime = useRef(0);
  const videoTrackRef = useRef(null);

  useEffect(() => {
    const loadFingerprint = async () => {
      const storedFingerprint = localStorage.getItem('deviceFingerprint');
      if (storedFingerprint) {
        console.log('Reusing stored deviceFingerprint:', storedFingerprint);
        setDeviceFingerprint(storedFingerprint);
        return;
      }

      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fingerprint = result.visitorId;
        localStorage.setItem('deviceFingerprint', fingerprint);
        console.log('Generated new deviceFingerprint:', fingerprint);
        console.log('Fingerprint components (for debug):', result.components);
        setDeviceFingerprint(fingerprint);
      } catch (err) {
        console.error('FingerprintJS load error:', err);
        setError('Failed to generate device fingerprint. Please disable ad-blockers or try another browser.');
        const fallbackHash = Math.abs(Date.now() + Math.random()).toString(16);
        localStorage.setItem('deviceFingerprint', fallbackHash);
        setDeviceFingerprint(fallbackHash);
      }
    };

    loadFingerprint();
  }, []);

  const logout = () => {
    setToken("");
    setEmail("");
    setAttendance([]);
    setMarked(false);
    setSessionId("");
    setClassId("");
    setQrToken("");
    setError(null);
    setCameraError(null);
    window.location.search = "";
  };

  const initializeScanner = async () => {
    try {
      setCameraError(null);
      setScanning(true);
      codeReader.current = new BrowserQRCodeReader(null, { tryHarder: true });
      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      if (devices.length === 0) {
        setCameraError('No camera found. Please use manual QR input.');
        setScanning(false);
        return;
      }
      console.log('Available cameras:', devices);
    } catch (err) {
      console.error('Camera initialization error:', err);
      setCameraError('Failed to access camera. Please grant permissions or use manual QR input.');
      setScanning(false);
    }
  };

  const validateQrCode = async (qrUrl) => {
    if (!deviceFingerprint) {
      console.error('Device fingerprint not ready');
      return { valid: false, error: 'Device fingerprint not ready. Please reload the page.' };
    }

    try {
      const url = new URL(qrUrl);
      const sessionId = url.searchParams.get('sessionId');
      const qrToken = url.searchParams.get('token');
      if (!sessionId || !qrToken) {
        return { valid: false, error: 'Invalid QR code format' };
      }

      const res = await axios.get('https://qr-backend-3-0.onrender.com/api/validate-qr', {
        params: { sessionId, qrToken, deviceFingerprint }
      });
      return res.data;
    } catch (err) {
      console.error('QR validation error:', err);
      return { valid: false, error: err.response?.data?.error || 'Failed to validate QR code' };
    }
  };

  useEffect(() => {
    scanningRef.current = scanning;
  }, [scanning]);

  useEffect(() => {
    if (videoRef.current && scanning && !processing && !cameraError && deviceFingerprint) {
      initializeScanner();
      if (codeReader.current) {
        codeReader.current.decodeFromVideoDevice(null, videoRef.current, async (result, error) => {
          if (!scanningRef.current) return;
          const now = Date.now();
          if (now - lastScanTime.current < 125) return;
          lastScanTime.current = now;

          if (result) {
            console.log('QR Scanned:', result.text);
            setScanning(false);
            setProcessing(true);
            try {
              const validation = await validateQrCode(result.text);
              if (validation.valid) {
                const url = new URL(result.text);
                url.searchParams.set('deviceFingerprint', deviceFingerprint);
                console.log('Redirecting to auth:', url.toString());
                window.location.href = url.toString();
              } else {
                setError(validation.error);
                setProcessing(false);
              }
            } catch (err) {
              console.error('Error processing QR:', err);
              setError('Failed to process QR code');
              setProcessing(false);
            }
          }
          if (error && error.name !== 'NotFoundException') {
            console.warn('ZXing Scan Warning:', error.message || 'Unknown error');
            if (error.name === 'NotAllowedError') {
              setCameraError('Camera access denied. Please grant camera permissions or use manual QR input.');
              setScanning(false);
            } else if (error.name === 'NotReadableError') {
              setCameraError('Unable to access camera. Please check if another app is using it or use manual QR input.');
              setScanning(false);
            } else {
              setError('No QR code detected. Please adjust camera or use manual QR input.');
            }
          }
        }).catch(err => {
          console.error('ZXing Initialization Error:', err);
          setCameraError('Failed to initialize QR scanner. Please ensure camera permissions are granted or use manual QR input.');
          setScanning(false);
        });
      }
    }

    return () => {
      try {
        if (codeReader.current && typeof codeReader.current.reset === 'function') {
          codeReader.current.reset();
          console.log('QR scanner reset');
        }
      } catch (err) {
        console.error('Error resetting QR scanner:', err);
      }
    };
  }, [deviceFingerprint, scanning, processing, cameraError]);

  // Stop video stream when scanning ends
  useEffect(() => {
    if (!scanning && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getVideoTracks();
      tracks.forEach(track => track.stop()); // Stop each track
      videoRef.current.srcObject = null; // Null it out
      console.log('Video stream stopped and cleaned up');
      videoTrackRef.current = null; // Clear ref
    }
  }, [scanning]);

  // Check for zoom support once video stream is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkZoomCapabilities = () => {
      const stream = video.srcObject;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        videoTrackRef.current = track;
        const capabilities = track.getCapabilities();
        if ('zoom' in capabilities) {
          setZoomSupported(true);
          setZoomMin(capabilities.zoom.min);
          setZoomMax(capabilities.zoom.max);
          setZoomStep(capabilities.zoom.step || 0.1);
          setCurrentZoom(capabilities.zoom.min);
        }
      }
    };

    video.addEventListener('loadedmetadata', checkZoomCapabilities);

    return () => {
      video.removeEventListener('loadedmetadata', checkZoomCapabilities);
    };
  }, [scanning]);

  // Handle zoom change
  const handleZoomChange = (event, newValue) => {
    setCurrentZoom(newValue);
    if (videoTrackRef.current) {
      videoTrackRef.current.applyConstraints({ advanced: [{ zoom: newValue }] })
        .catch(err => console.error('Error applying zoom constraints:', err));
    }
  };

  const handleManualQrSubmit = async () => {
    console.log('Manual QR input received:', manualQrInput);
    if (!manualQrInput) {
      setError("Please enter a QR URL");
      return;
    }
    setProcessing(true);
    try {
      const validation = await validateQrCode(manualQrInput);
      if (validation.valid) {
        const url = new URL(manualQrInput);
        url.searchParams.set('deviceFingerprint', deviceFingerprint);
        console.log('Manual QR redirect:', url.toString());
        window.location.href = url.toString();
      } else {
        setError(validation.error);
        setProcessing(false);
      }
    } catch (err) {
      console.error('Manual QR Error:', err);
      setError("Invalid QR URL format");
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (deviceFingerprint && !processing) {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionIdParam = urlParams.get("sessionId");
      const classIdParam = urlParams.get("classId");
      const tokenParam = urlParams.get("token");
      const startTimeParam = urlParams.get("startTime");
      if (sessionIdParam && classIdParam && tokenParam && startTimeParam && !urlParams.get("deviceFingerprint")) {
        console.log('Intercepted QR URL paste:', window.location.href);
        setProcessing(true);
        const url = new URL(window.location.href);
        url.searchParams.set('deviceFingerprint', deviceFingerprint);
        console.log('Redirecting with fingerprint:', url.toString());
        window.location.href = url.toString();
      }
    }
  }, [deviceFingerprint, processing]);

  const fetchAttendance = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const newToken = urlParams.get("token");
    const isMarked = urlParams.get("marked") === "true";
    const newSessionId = urlParams.get("sessionId");
    const errorMsg = urlParams.get("error");

    console.log('Fetching attendance with:', { newToken, isMarked, newSessionId, errorMsg });

    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      setProcessing(false);
      return;
    }

    if (!newToken && !token) {
      setError("Please scan the QR code from the professor’s dashboard to mark attendance.");
      setProcessing(false);
      return;
    }

    const authToken = newToken || token;
    setToken(authToken);
    setMarked(isMarked);
    setSessionId(newSessionId || sessionId);

    if (!newToken) return;

    try {
      const res = await axios.get("https://qr-backend-3-0.onrender.com/api/student/attendance", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setAttendance(res.data);
      if (res.data.length > 0) setEmail(res.data[0].email);

      if (isMarked && !marked) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (err) {
      console.error("Fetch Attendance Error:", err.message);
      setError("Failed to fetch attendance data");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    socket.on("connect", () => console.log("Student socket connected"));
    socket.on("disconnect", () => console.log("Student socket disconnected"));

    socket.on("sessionStarted", ({ sessionId, classId, qrToken }) => {
      console.log('Session started received:', { sessionId, classId, qrToken });
      setSessionId(sessionId);
      setClassId(classId);
      setQrToken(qrToken);
      fetchAttendance();
    });

    socket.on("sessionEnded", ({ sessionId: endedSessionId }) => {
      console.log('Session ended:', endedSessionId);
      if (endedSessionId === sessionId) {
        logout();
      }
      fetchAttendance();
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("sessionStarted");
      socket.off("sessionEnded");
    };
  }, [sessionId]);

  useEffect(() => {
    socket.on('serverShutdown', ({ message }) => {
      console.log('Server shutting down:', message);
      setError('Server is restarting, please wait...');
      socket.disconnect();
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      socket.disconnect();
    });

    return () => {
      socket.off('serverShutdown');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchAttendance(); // Initial fetch
  }, []);

  if (processing || !deviceFingerprint) {
    return (
      <Box className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center'>
        <Typography variant="h6" className="text-indigo-800">
          {deviceFingerprint ? 'Processing QR code, please wait...' : 'Generating device fingerprint, please wait...'}
        </Typography>
      </Box>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-md backdrop-blur-sm bg-white/90 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-2 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            QR Attendance System
          </h1>
          <div className="flex items-center space-x-4">
            {email && (
              <span className="text-sm font-medium px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                {email}
              </span>
            )}
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-medium">S</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
          {!token ? (
            <QRScanner 
              error={error}
              cameraError={cameraError}
              scanning={scanning}
              setScanning={setScanning}
              setCameraError={setCameraError}
              videoRef={videoRef}
              zoomSupported={zoomSupported}
              currentZoom={currentZoom}
              handleZoomChange={handleZoomChange}
              zoomMin={zoomMin}
              zoomMax={zoomMax}
              zoomStep={zoomStep}
              manualQrInput={manualQrInput}
              setManualQrInput={setManualQrInput}
              handleManualQrSubmit={handleManualQrSubmit}
              processing={processing}
              deviceFingerprint={deviceFingerprint}
              setError={setError}
            />
          ) : (
            <AttendanceHistory 
              email={email}
              attendance={attendance}
              marked={marked}
              showConfetti={showConfetti}
              error={error}
              logout={logout}
            />
          )}
        </div>
      </main>

      <footer className="bg-white mt-12 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            QR Attendance System © {new Date().getFullYear()} | All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

export default StudentDashboard;