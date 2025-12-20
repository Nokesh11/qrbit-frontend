import React from 'react';
import { Box, Typography, Button, TextField, Slider } from '@mui/material';

const QRScanner = ({ 
  error, 
  cameraError, 
  scanning, 
  setScanning, 
  setCameraError, 
  videoRef, 
  zoomSupported, 
  currentZoom, 
  handleZoomChange, 
  zoomMin, 
  zoomMax, 
  zoomStep, 
  manualQrInput, 
  setManualQrInput, 
  handleManualQrSubmit, 
  processing,
  deviceFingerprint,
  setError
}) => {
  return (
    <Box className="flex flex-col items-center space-y-6 py-12">
      <Typography variant="h5" className="text-indigo-800 font-bold">
        Student Dashboard
      </Typography>
      <Typography className="text-gray-600 text-center max-w-md">
        Scan the QR code quickly, as it refreshes every second.
      </Typography>
      {cameraError ? (
        <Box className="text-center space-y-2">
          <Typography className="bg-red-50 text-red-700 p-2 rounded-lg w-full max-w-md">
            {cameraError}
          </Typography>
          <Button variant="outlined" onClick={() => { setScanning(true); setCameraError(null); }}>
            Retry Camera
          </Button>
        </Box>
      ) : (
        <>
          <video
            ref={videoRef}
            style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
            autoPlay
            muted
            playsInline
            className="qr-video"
          />
          {zoomSupported && (
            <Box sx={{ width: '100%', maxWidth: '400px', mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Zoom
              </Typography>
              <Slider
                value={currentZoom}
                onChange={handleZoomChange}
                min={zoomMin}
                max={zoomMax}
                step={zoomStep}
                aria-labelledby="zoom-slider"
                valueLabelDisplay="auto"
              />
            </Box>
          )}
        </>
      )}
      <Typography className="text-gray-600 text-center">
        {cameraError ? "Use the manual input below to enter the QR URL." : "Point your camera at the QR code. Ensure camera permissions are granted."}
      </Typography>
      <Box className="flex flex-col items-center space-y-2 w-full max-w-md">
        <TextField
          label="Paste QR URL (if scanner fails)"
          value={manualQrInput}
          onChange={(e) => setManualQrInput(e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
        />
        <Button variant="outlined" onClick={handleManualQrSubmit} disabled={processing}>
          Submit Manual QR
        </Button>
      </Box>
      {error && (
        <Box className="text-center space-y-2 w-full max-w-md">
          <Typography className="bg-red-50 text-red-700 p-2 rounded-lg">
            {error}
          </Typography>
          <Button variant="outlined" onClick={() => { setError(null); setScanning(true); }}>
            Scan
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default QRScanner;
