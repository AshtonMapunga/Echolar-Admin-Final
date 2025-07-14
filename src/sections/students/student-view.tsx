import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Chip
} from '@mui/material';
import { FilterList, Refresh } from '@mui/icons-material';
import AuthStudentService from 'src/services/student_Services';

interface Student {
  _id: string;
  name: string;
  email: string;
  profilepicture: string;
  level: 'O_Level' | 'A_Level' | 'Grade_7';
  phoneNumber: string;
  enrolledClasses: {
    enrolledclassId: string;
    paymentStatus: string;
    _id: string;
  }[];
  paidExamPapers: any[];
  subjects: string[];
  results: any[];
  aiaccess: string;
}

const StudentManagementScreen: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, levelFilter, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AuthStudentService.getAllStudent();
      if (data) {
        setStudents(data);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('Error fetching students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let result = [...students];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phoneNumber.includes(searchTerm))
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      result = result.filter(student => student.level === levelFilter);
    }

    // Apply status filter (example - you might need to adjust based on your data)
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(student => student.aiaccess === 'enabled');
      } else if (statusFilter === 'inactive') {
        result = result.filter(student => student.aiaccess !== 'enabled');
      }
    }

    setFilteredStudents(result);
  };

  const handleRefresh = () => {
    fetchStudents();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'O_Level':
        return 'primary';
      case 'A_Level':
        return 'secondary';
      case 'Grade_7':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'enabled' ? 'success' : 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Search Students"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Level</InputLabel>
            <Select
              value={levelFilter}
              label="Level"
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="O_Level">O Level</MenuItem>
              <MenuItem value="A_Level">A Level</MenuItem>
              <MenuItem value="Grade_7">Grade 7</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Profile</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Classes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <Avatar src={student.profilepicture} alt={student.name} />
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phoneNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.level.replace('_', ' ')}
                        color={getLevelColor(student.level)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.aiaccess === 'enabled' ? 'Active' : 'Inactive'}
                        color={getStatusColor(student.aiaccess)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {student.enrolledClasses.length} enrolled
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No students found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default StudentManagementScreen;