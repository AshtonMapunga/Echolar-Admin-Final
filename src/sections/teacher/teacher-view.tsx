import { useState, useEffect } from 'react';

import { Add, Edit, Delete, Refresh, Visibility } from '@mui/icons-material';
import {
  Box,
  Chip,
  Paper,
  Table,
  Button,
  Avatar,
  Dialog,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
  CircularProgress
} from '@mui/material';

import AuthService from 'src/services/teacher_services';

interface Teacher {
  _id: string;
  name: string;
  level: string;
  phoneNumber: string;
  approved: boolean;
  email: string;
  role: string;
  classId: string;
  subjects: string[];
  timetable: {
    day: string;
    subjectId: string;
    time: string;
  }[];
}

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await AuthService.getAllTeacher();
      if (data) {
        setTeachers(data);
      } else {
        setError('Failed to fetch teachers');
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Error fetching teachers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeacher(null);
  };

  // Function to get initials for avatar
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Teacher Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={fetchTeachers}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Add />}
          >
            Add Teacher
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="teacher table">
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subjects</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((teacher) => (
                    <TableRow hover key={teacher._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {getInitials(teacher.name)}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="medium">{teacher.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {teacher.role}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography>{teacher.email}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {teacher.phoneNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{teacher.level}</TableCell>
                      <TableCell>
                        <Chip
                          label={teacher.approved ? 'Approved' : 'Pending'}
                          color={teacher.approved ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {teacher.subjects.length > 0 ? (
                          <Tooltip title={teacher.subjects.join(', ')}>
                            <span>{teacher.subjects.length} subjects</span>
                          </Tooltip>
                        ) : (
                          'No subjects'
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleViewDetails(teacher)}>
                          <Visibility color="info" />
                        </IconButton>
                        <IconButton>
                          <Edit color="primary" />
                        </IconButton>
                        <IconButton>
                          <Delete color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={teachers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Teacher Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Teacher Details</DialogTitle>
        <DialogContent dividers>
          {selectedTeacher && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, fontSize: 32, mr: 3, bgcolor: 'primary.main' }}>
                  {getInitials(selectedTeacher.name)}
                </Avatar>
                <Box>
                  <Typography variant="h5">{selectedTeacher.name}</Typography>
                  <Typography color="text.secondary">{selectedTeacher.role}</Typography>
                  <Chip
                    label={selectedTeacher.approved ? 'Approved' : 'Pending'}
                    color={selectedTeacher.approved ? 'success' : 'warning'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                <TextField
                  label="Email"
                  value={selectedTeacher.email}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Phone Number"
                  value={selectedTeacher.phoneNumber}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Level"
                  value={selectedTeacher.level}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Class ID"
                  value={selectedTeacher.classId}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Timetable
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Subject ID</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTeacher.timetable.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.day}</TableCell>
                        <TableCell>{item.subjectId}</TableCell>
                        <TableCell>{item.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}