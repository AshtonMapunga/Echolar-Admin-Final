import { useState, useEffect } from 'react';
import { Add, Edit, Delete, Refresh, Close } from '@mui/icons-material';
import {
  Box,
  Grid,
  Card,
  Paper,
  Table,
  Button,
  Dialog,
  TableRow,
  CardMedia,
  TextField,
  TableBody,
  Typography,
  IconButton,
  CardContent,
  CardActions,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar
} from '@mui/material';
import ExamPaperService from 'src/services/exam_services';

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  comment: string;
  _id: string;
}

interface ExamPaper {
  _id: string;
  examType: string;
  amount: string;
  title: string;
  level: string;
  fileUrl: string;
  access: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function ExamPaperManagement() {
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<ExamPaper | null>(null);
  const [error, setError] = useState('');
  const [newExamPaper, setNewExamPaper] = useState({
    examType: 'zimsec',
    amount: '',
    title: '',
    level: 'O_Level',
    fileUrl: '',
    access: 'public',
    questions: [{
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      comment: ''
    }]
  });

  // Fetch all exam papers
  const fetchExamPapers = async () => {
    try {
      setLoading(true);
      const data = await ExamPaperService.getAllExamPpr();
      if (data) {
        setExamPapers(data);
      } else {
        setError('Failed to fetch exam papers');
      }
    } catch (err) {
      console.error('Error fetching exam papers:', err);
      setError('Error fetching exam papers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamPapers();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewExamPaper({
      examType: 'zimsec',
      amount: '',
      title: '',
      level: 'O_Level',
      fileUrl: '',
      access: 'public',
      questions: [{
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        comment: ''
      }]
    });
  };

  const handleOpenDetailsDialog = (paper: ExamPaper) => {
    setSelectedPaper(paper);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedPaper(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExamPaper(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const updatedQuestions = [...newExamPaper.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setNewExamPaper(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...newExamPaper.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions
    };
    setNewExamPaper(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    setNewExamPaper(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          comment: ''
        }
      ]
    }));
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...newExamPaper.questions];
    updatedQuestions.splice(index, 1);
    setNewExamPaper(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleAddExamPaper = async () => {
    try {
      setLoading(true);
      const success = await ExamPaperService.addExamPaper(newExamPaper);
      if (success) {
        fetchExamPapers(); // Refresh the list
        handleCloseAddDialog();
      } else {
        setError('Failed to add exam paper');
      }
    } catch (err) {
      console.error('Error adding exam paper:', err);
      setError('Error adding exam paper. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Exam Paper Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={fetchExamPapers}
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
            Add Exam Paper
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
      ) : examPapers.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No exam papers found. Add your first exam paper!
        </Typography>
      ) : (
        <>
          {/* Grid View for Exam Papers */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {examPapers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((paper) => (
                <Grid item xs={12} sm={6} md={4} key={paper._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                    onClick={() => handleOpenDetailsDialog(paper)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image="/assets/images/exam-paper-placeholder.jpg"
                      alt={paper.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div">
                        {paper.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip label={paper.examType} size="small" color="primary" />
                        <Chip label={paper.level.replace('_', ' ')} size="small" color="secondary" />
                        <Chip label={`$${paper.amount}`} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {paper.questions.length} question{paper.questions.length !== 1 ? 's' : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Created: {formatDate(paper.createdAt)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton size="small">
                        <Edit color="primary" />
                      </IconButton>
                      <IconButton size="small">
                        <Delete color="error" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>

          {/* Table View for Pagination Control */}
          <TableContainer component={Paper} sx={{ display: 'none' }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[6, 12, 24]}
                    count={examPapers.length}
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

      {/* Exam Paper Details Dialog */}
      <Dialog 
        open={openDetailsDialog} 
        onClose={handleCloseDetailsDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Exam Paper Details</Typography>
            <IconButton onClick={handleCloseDetailsDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPaper && (
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar 
                  src="/assets/images/exam-paper-placeholder.jpg" 
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {selectedPaper.title}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip label={selectedPaper.examType} color="primary" />
                    <Chip label={selectedPaper.level.replace('_', ' ')} color="secondary" />
                    <Chip label={`$${selectedPaper.amount}`} />
                    <Chip label={selectedPaper.access} variant="outlined" />
                  </Box>
                </Box>
              </Box>

              <Box mb={3}>
                <Typography variant="h6" gutterBottom>File Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">
                  <strong>File URL:</strong> 
                  <a href={selectedPaper.fileUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                    {selectedPaper.fileUrl}
                  </a>
                </Typography>
                <Typography variant="body1">
                  <strong>Created:</strong> {formatDate(selectedPaper.createdAt)}
                </Typography>
                <Typography variant="body1">
                  <strong>Last Updated:</strong> {formatDate(selectedPaper.updatedAt)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Questions ({selectedPaper.questions.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {selectedPaper.questions.map((question, qIndex) => (
                    <Box key={qIndex} mb={3} p={2} sx={{ border: '1px solid #eee', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Question {qIndex + 1}
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                        {question.questionText}
                      </Typography>

                      <Typography variant="subtitle2" gutterBottom>Options:</Typography>
                      <List dense>
                        {question.options.map((option, oIndex) => (
                          <ListItem 
                            key={oIndex} 
                            sx={{ 
                              backgroundColor: option === question.correctAnswer ? '#e8f5e9' : 'transparent',
                              borderRadius: 1
                            }}
                          >
                            <ListItemText 
                              primary={`Option ${oIndex + 1}: ${option}`} 
                              primaryTypographyProps={{
                                fontWeight: option === question.correctAnswer ? 'bold' : 'normal'
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      {question.comment && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" gutterBottom>Explanation:</Typography>
                          <Typography variant="body2">{question.comment}</Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Exam Paper Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Exam Paper</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Title"
                  name="title"
                  value={newExamPaper.title}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Amount"
                  name="amount"
                  value={newExamPaper.amount}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Exam Type</InputLabel>
                  <Select
                    name="examType"
                    value={newExamPaper.examType}
                    onChange={(e) => setNewExamPaper({...newExamPaper, examType: e.target.value})}
                    label="Exam Type"
                    required
                  >
                    <MenuItem value="zimsec">ZIMSEC</MenuItem>
                    <MenuItem value="cambridge">Cambridge</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Level</InputLabel>
                  <Select
                    name="level"
                    value={newExamPaper.level}
                    onChange={(e) => setNewExamPaper({...newExamPaper, level: e.target.value})}
                    label="Level"
                    required
                  >
                    <MenuItem value="O_Level">O Level</MenuItem>
                    <MenuItem value="A_Level">A Level</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="File URL"
                  name="fileUrl"
                  value={newExamPaper.fileUrl}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Questions
            </Typography>

            {newExamPaper.questions.map((question, qIndex) => (
              <Box key={qIndex} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">Question {qIndex + 1}</Typography>
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => removeQuestion(qIndex)}
                    disabled={newExamPaper.questions.length <= 1}
                  >
                    Remove
                  </Button>
                </Box>
                
                <TextField
                  label="Question Text"
                  value={question.questionText}
                  onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                  multiline
                />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Options:</Typography>
                <Grid container spacing={2}>
                  {question.options.map((option, oIndex) => (
                    <Grid item xs={12} sm={6} key={oIndex}>
                      <TextField
                        label={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        fullWidth
                        sx={{ mb: 1 }}
                        required
                      />
                    </Grid>
                  ))}
                </Grid>

                <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={question.correctAnswer}
                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                    label="Correct Answer"
                    required
                  >
                    {question.options.map((option, index) => (
                      <MenuItem 
                        key={index} 
                        value={option}
                        disabled={!option.trim()}
                      >
                        Option {index + 1} {!option.trim() && '(empty)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Comment/Explanation"
                  value={question.comment}
                  onChange={(e) => handleQuestionChange(qIndex, 'comment', e.target.value)}
                  fullWidth
                  sx={{ mb: 1 }}
                  multiline
                  rows={2}
                />
              </Box>
            ))}

            <Button 
              variant="outlined" 
              onClick={addQuestion}
              sx={{ mt: 1 }}
            >
              Add Another Question
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddExamPaper} 
            variant="contained" 
            color="primary"
            disabled={loading || 
              !newExamPaper.title || 
              !newExamPaper.amount || 
              !newExamPaper.fileUrl ||
              newExamPaper.questions.some(q => 
                !q.questionText || 
                q.options.some(opt => !opt.trim()) || 
                !q.correctAnswer
              )
            }
          >
            {loading ? <CircularProgress size={24} /> : 'Add Exam Paper'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}