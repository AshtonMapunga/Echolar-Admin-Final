import { useState, useEffect } from 'react';

import { Add, Edit, Delete, Refresh, Visibility, ExpandMore, ExpandLess } from '@mui/icons-material';
import {
  Box,
  Chip,
  Grid,
  Card,
  Paper,
  Table,
  Button,
  Dialog,
  Select,
  Divider,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  CardMedia,
  Typography,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  CardContent,
  CardActions,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
  CircularProgress
} from '@mui/material';

import ClassService from 'src/services/classes_services';

interface ClassItem {
  _id: string;
  name: string;
  classstatus: string;
  ratings: string;
  schoolID: string;
  level: string;
  meetinglink: string;
  classpageimageurl: string;
  classprice: string;
  teacherId: string;
  students: string[];
  timetable: {
    day: string;
    subjectId: string;
    time: string;
  }[];
  topics: any[];
  createdAt: string;
  updatedAt: string;
}

const LEVEL_FILTERS = [
  'All Levels',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Form 1',
  'Form 2',
  'Form 3',
  'Form 4',
  'Form 5',
  'Form 6',
  'O_Level',
  'A_Level'
];

export default function ClassesManagement() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [error, setError] = useState('');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [newClass, setNewClass] = useState({
    name: '',
    classstatus: 'active',
    ratings: '0',
    schoolID: '',
    level: '',
    meetinglink: '',
    classpageimageurl: '',
    classprice: '',
    teacherId: '',
    students: [],
    timetable: [],
    topics: []
  });

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await ClassService.getAllClasses();
      if (data) {
        setClasses(data);
        setFilteredClasses(data);
      } else {
        setError('Failed to fetch classes');
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Error fetching classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Apply level filter
  useEffect(() => {
    if (levelFilter === 'All Levels') {
      setFilteredClasses(classes);
    } else {
      setFilteredClasses(classes.filter(cls => cls.level === levelFilter));
    }
    setPage(0);
  }, [levelFilter, classes]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewClass({
      name: '',
      classstatus: 'active',
      ratings: '0',
      schoolID: '',
      level: '',
      meetinglink: '',
      classpageimageurl: '',
      classprice: '',
      teacherId: '',
      students: [],
      timetable: [],
      topics: []
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClass(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLevelChange = (e: any) => {
    setNewClass(prev => ({
      ...prev,
      level: e.target.value
    }));
  };

  const handleAddClass = async () => {
    try {
      setLoading(true);
      const success = await ClassService.addClass(newClass);
      if (success) {
        fetchClasses(); // Refresh the list
        handleCloseAddDialog();
      } else {
        setError('Failed to add class');
      }
    } catch (err) {
      console.error('Error adding class:', err);
      setError('Error adding class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandClass = (classId: string) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  // Function to format date
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Class Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={fetchClasses}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Add />}
            onClick={handleOpenAddDialog}
          >
            Add Class
          </Button>
        </Box>
      </Box>

      {/* Level Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Level</InputLabel>
          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            label="Filter by Level"
          >
            {LEVEL_FILTERS.map(level => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
      ) : filteredClasses.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No classes found. Add your first class!
        </Typography>
      ) : (
        <>
          {/* Grid View for Classes */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {filteredClasses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((classItem) => (
                <Grid item xs={12} key={classItem._id}>
                  <Card>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                      <CardMedia
                        component="img"
                        sx={{ width: { xs: '100%', md: 200 }, height: 200, objectFit: 'cover' }}
                        image={classItem.classpageimageurl || 'https://via.placeholder.com/200'}
                        alt={classItem.name}
                      />
                      <Box sx={{ flex: 1 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h5" component="div">
                              {classItem.name}
                            </Typography>
                            <Box>
                              <Chip
                                label={classItem.classstatus}
                                color={classItem.classstatus === 'active' ? 'success' : 'error'}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={`${classItem.ratings} ★`}
                                color="primary"
                                size="small"
                              />
                            </Box>
                          </Box>
                          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                            Level: {classItem.level} | Price: ${classItem.classprice}
                          </Typography>
                          
                          <Box sx={{ mt: 2 }}>
                            <Button
                              size="small"
                              onClick={() => toggleExpandClass(classItem._id)}
                              endIcon={expandedClass === classItem._id ? <ExpandLess /> : <ExpandMore />}
                            >
                              {expandedClass === classItem._id ? 'Hide Details' : 'Show Details'}
                            </Button>
                          </Box>

                          {expandedClass === classItem._id && (
                            <Box sx={{ mt: 2 }}>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="subtitle2">Timetable:</Typography>
                              <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                                {classItem.timetable.map((item, index) => (
                                  <li key={index}>
                                    {item.day}: {item.time}
                                  </li>
                                ))}
                              </Box>
                              <Typography variant="subtitle2">Meeting Link:</Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <a href={classItem.meetinglink} target="_blank" rel="noopener noreferrer">
                                  {classItem.meetinglink}
                                </a>
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Created: {formatDate(classItem.createdAt)}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                        <CardActions>
                          <IconButton onClick={() => handleViewDetails(classItem)}>
                            <Visibility color="info" />
                          </IconButton>
                          <IconButton>
                            <Edit color="primary" />
                          </IconButton>
                          <IconButton>
                            <Delete color="error" />
                          </IconButton>
                        </CardActions>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
          </Grid>

          {/* Pagination */}
          <TableContainer component={Paper} sx={{ display: 'none' }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={filteredClasses.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Class Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Class Details</DialogTitle>
        <DialogContent dividers>
          {selectedClass && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {selectedClass.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={selectedClass.classstatus}
                      color={selectedClass.classstatus === 'active' ? 'success' : 'error'}
                    />
                    <Chip
                      label={`${selectedClass.ratings} ★`}
                      color="primary"
                    />
                    <Chip
                      label={selectedClass.level}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body1" gutterBottom>
                    <strong>Price:</strong> ${selectedClass.classprice}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Meeting Link:</strong>{' '}
                    <a href={selectedClass.meetinglink} target="_blank" rel="noopener noreferrer">
                      {selectedClass.meetinglink}
                    </a>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Created:</strong> {formatDate(selectedClass.createdAt)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Updated:</strong> {formatDate(selectedClass.updatedAt)}
                  </Typography>
                </Box>
                <Box sx={{ width: { xs: '100%', md: 300 } }}>
                  <CardMedia
                    component="img"
                    image={selectedClass.classpageimageurl || 'https://via.placeholder.com/300'}
                    alt={selectedClass.name}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Timetable
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedClass.timetable.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.day}</TableCell>
                        <TableCell>{item.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom>
                Topics
              </Typography>
              {selectedClass.topics.length > 0 ? (
                selectedClass.topics.map((topic, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {topic.title}
                    </Typography>
                    {topic.lessons.map((lesson, lessonIndex) => (
                      <Box key={lessonIndex} sx={{ pl: 2, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {lesson.lessontitle}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {lesson.lessonDescription}
                        </Typography>
                        {lesson.videoResources && lesson.videoResources.length > 0 && (
                          <>
                            <Typography variant="caption" display="block" gutterBottom>
                              Video Resources:
                            </Typography>
                            <Box component="ul" sx={{ pl: 2 }}>
                              {lesson.videoResources.map((video, videoIndex) => (
                                <li key={videoIndex}>
                                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                                    {video.title}
                                  </a>
                                </li>
                              ))}
                            </Box>
                          </>
                        )}
                      </Box>
                    ))}
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No topics added yet.</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Class Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Class Name"
              name="name"
              value={newClass.name}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
              required
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Level</InputLabel>
              <Select
                name="level"
                value={newClass.level}
                onChange={handleLevelChange}
                label="Level"
                required
              >
                {LEVEL_FILTERS.filter(level => level !== 'All Levels').map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Class Status"
              name="classstatus"
              value={newClass.classstatus}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
              required
            />

            <TextField
              label="Ratings"
              name="ratings"
              type="number"
              value={newClass.ratings}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
            />

            <TextField
              label="Meeting Link"
              name="meetinglink"
              value={newClass.meetinglink}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
            />

            <TextField
              label="Class Image URL"
              name="classpageimageurl"
              value={newClass.classpageimageurl}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
            />

            <TextField
              label="Class Price ($)"
              name="classprice"
              type="number"
              value={newClass.classprice}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
            />

            {newClass.classpageimageurl && (
              <Box sx={{ mt: 2, mb: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Image Preview:</Typography>
                <img
                  src={newClass.classpageimageurl}
                  alt="Class preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddClass} 
            variant="contained" 
            color="primary"
            disabled={loading || !newClass.name || !newClass.level || !newClass.classstatus}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Class'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}