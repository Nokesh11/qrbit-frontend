import React from 'react';
import { 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Box, 
  Button 
} from '@mui/material';
import Confetti from 'react-confetti';

const AttendanceHistory = ({ 
  email, 
  attendance, 
  marked, 
  showConfetti, 
  error, 
  logout 
}) => {
  return (
    <div className="space-y-6">
      <Typography variant="h5" className="text-center text-indigo-800 font-bold">
        Welcome, {email}
      </Typography>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      {marked && !showConfetti && (
        <Typography className="text-center text-green-600 text-xl font-medium bg-green-50 p-3 rounded-lg">
          Marked Present Successfully!
        </Typography>
      )}
      {error && (
        <Typography className="text-center bg-red-50 text-red-700 p-2 rounded-lg">
          {error}
        </Typography>
      )}
      <Typography variant="h6" className="text-center text-indigo-700 font-semibold mt-6">
        Your Attendance History
      </Typography>
      {attendance.length > 0 ? (
        <TableContainer className="border border-gray-200 rounded-lg overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow className="bg-indigo-50">
                <TableCell><Typography className="text-indigo-700 font-medium">Date</Typography></TableCell>
                <TableCell><Typography className="text-indigo-700 font-medium">Time</Typography></TableCell>
                <TableCell><Typography className="text-indigo-700 font-medium">Session ID</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.map((record) => (
                <TableRow key={record._id} className="hover:bg-gray-50">
                  <TableCell>{new Date(record.timestamp).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</TableCell>
                  <TableCell>{new Date(record.timestamp).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}</TableCell>
                  <TableCell>{record.sessionId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography className="text-center text-gray-500">No attendance records yet</Typography>
      )}
      <Box className="flex justify-center mt-6">
        <Button
          variant="outlined"
          color="secondary"
          onClick={logout}
          sx={{
            padding: "10px 24px",
            borderRadius: "10px",
            textTransform: "none",
            borderWidth: "2px",
            color: "#e11d48",
            borderColor: "#e11d48",
            "&:hover": { backgroundColor: "#fef2f2", borderColor: "#dc2626" },
          }}
        >
          Logout
        </Button>
      </Box>
    </div>
  );
};

export default AttendanceHistory;
