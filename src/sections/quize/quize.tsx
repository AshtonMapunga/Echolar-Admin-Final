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
  FormControl,
  InputLabel,
  Select,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import QuizeServices from 'src/services/quize_services';

interface Teacher {
  _id: string;
  name: string;
  email: string;
}

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  _id: string;
}

interface Quiz {
  _id: string;
  title: string;
  teacherId: Teacher;
  classId: any;
  questions: Question[];
  subjectId: any;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState('');
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    dueDate: '',
    questions: [{
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    }]
  });

  // Fetch all quizzes
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await QuizeServices.getAllQuize();
      if (data) {
        setQuizzes(data);
      } else {
        setError('Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Error fetching quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleQuizClick = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedQuiz(null);
  };

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
    setNewQuiz({
      title: '',
      dueDate: '',
      questions: [{
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: ''
      }]
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewQuiz(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setNewQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...newQuiz.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions
    };
    setNewQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: ''
        }
      ]
    }));
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions.splice(index, 1);
    setNewQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleAddQuiz = async () => {
    try {
      setLoading(true);
      const success = await QuizeServices.addQuize(newQuiz);
      if (success) {
        fetchQuizzes(); // Refresh the list
        handleCloseAddDialog();
      } else {
        setError('Failed to add quiz');
      }
    } catch (err) {
      console.error('Error adding quiz:', err);
      setError('Error adding quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quiz Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={fetchQuizzes}
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
            Add Quiz
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
      ) : quizzes.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No quizzes found. Add your first quiz!
        </Typography>
      ) : (
        <>
          {/* Grid View for Quizzes */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {quizzes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((quiz) => (
                <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                    onClick={() => handleQuizClick(quiz)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div">
                        {quiz.title}
                      </Typography>
                      
                      {quiz.teacherId && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            {quiz.teacherId.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {quiz.teacherId.name}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip 
                          label={`${quiz.questions.length} Qs`} 
                          size="small" 
                          color="primary" 
                        />
                        <Chip 
                          label={`Due: ${formatDate(quiz.dueDate)}`} 
                          size="small" 
                          color={new Date(quiz.dueDate) < new Date() ? 'error' : 'default'}
                        />
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Created: {formatDate(quiz.createdAt)}
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
                    count={quizzes.length}
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

      {/* Add Quiz Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Quiz</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Quiz Title"
                  name="title"
                  value={newQuiz.title}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Due Date & Time"
                  name="dueDate"
                  type="datetime-local"
                  value={newQuiz.dueDate}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Questions
            </Typography>

            {newQuiz.questions.map((question, qIndex) => (
              <Box key={qIndex} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">Question {qIndex + 1}</Typography>
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => removeQuestion(qIndex)}
                    disabled={newQuiz.questions.length <= 1}
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
            onClick={handleAddQuiz} 
            variant="contained" 
            color="primary"
            disabled={loading || 
              !newQuiz.title || 
              !newQuiz.dueDate ||
              newQuiz.questions.some(q => 
                !q.questionText || 
                q.options.some(opt => !opt.trim()) || 
                !q.correctAnswer
              )
            }
          >
            {loading ? <CircularProgress size={24} /> : 'Add Quiz'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Detail Dialog */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDetailDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Quiz Details</Typography>
            <IconButton onClick={handleCloseDetailDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedQuiz && (
            <Box>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  {selectedQuiz.title}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                    {selectedQuiz.teacherId?.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="body1">
                    Created by: {selectedQuiz.teacherId?.name || 'Unknown'}
                  </Typography>
                </Box>

                <Box display="flex" gap={2} mb={2}>
                  <Chip 
                    label={`Due: ${formatDate(selectedQuiz.dueDate)}`} 
                    color={new Date(selectedQuiz.dueDate) < new Date() ? 'error' : 'primary'}
                  />
                  <Chip 
                    label={`Created: ${formatDate(selectedQuiz.createdAt)}`} 
                    color="default"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Questions ({selectedQuiz.questions.length})
              </Typography>

              <List>
                {selectedQuiz.questions.map((question, qIndex) => (
                  <Box key={question._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`${qIndex + 1}. ${question.questionText}`}
                        secondary={
                          <Box component="span" display="block">
                            <Typography variant="body2" color="text.primary" mt={1}>
                              Options:
                            </Typography>
                            <List dense>
                              {question.options.map((option, oIndex) => (
                                <ListItem 
                                  key={oIndex} 
                                  sx={{ 
                                    pl: 4,
                                    backgroundColor: option === question.correctAnswer ? 'action.selected' : 'inherit'
                                  }}
                                >
                                  <ListItemText
                                    primary={`${String.fromCharCode(65 + oIndex)}. ${option}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        }
                      />
                    </ListItem>
                    {qIndex < selectedQuiz.questions.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}