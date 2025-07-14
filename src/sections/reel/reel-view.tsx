import { useState, useEffect } from 'react';

import { Add, Edit, Delete, Refresh, Visibility } from '@mui/icons-material';
import {
  Box,
  Chip,
  Paper,
  Table,
  Button,
  Dialog,
  Avatar,
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

import RealmService from 'src/services/reels_services';

interface Reel {
  _id: string;
  title: string;
  level: string;
  exprydate: string;
  videourl: string;
  accessed: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReelsManagement() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [error, setError] = useState('');
  const [newReel, setNewReel] = useState({
    title: '',
    level: '',
    exprydate: '',
    videourl: '',
    accessed: ''
  });

  // Fetch all reels
  const fetchReels = async () => {
    try {
      setLoading(true);
      const data = await RealmService.getAllRealms();
      if (data) {
        setReels(data);
      } else {
        setError('Failed to fetch reels');
      }
    } catch (err) {
      console.error('Error fetching reels:', err);
      setError('Error fetching reels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (reel: Reel) => {
    setSelectedReel(reel);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReel(null);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewReel({
      title: '',
      level: '',
      exprydate: '',
      videourl: '',
      accessed: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewReel(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddReel = async () => {
    try {
      setLoading(true);
      const success = await RealmService.addReel(newReel);
      if (success) {
        fetchReels(); // Refresh the list
        handleCloseAddDialog();
      } else {
        setError('Failed to add reel');
      }
    } catch (err) {
      console.error('Error adding reel:', err);
      setError('Error adding reel. Please try again.');
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
          Reels Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={fetchReels}
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
            Add Reel
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
            <Table stickyHeader aria-label="reels table">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Video URL</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reels
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((reel) => (
                    <TableRow hover key={reel._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {reel.title.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography fontWeight="medium">{reel.title}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{reel.level}</TableCell>
                      <TableCell>
                        <Tooltip title={reel.videourl}>
                          <Typography sx={{ 
                            maxWidth: 150, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {reel.videourl}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatDate(reel.exprydate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={reel.accessed}
                          color={reel.accessed === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(reel.createdAt)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleViewDetails(reel)}>
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
            count={reels.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Reel Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Reel Details</DialogTitle>
        <DialogContent dividers>
          {selectedReel && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, fontSize: 32, mr: 3, bgcolor: 'primary.main' }}>
                  {selectedReel.title.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5">{selectedReel.title}</Typography>
                  <Chip
                    label={selectedReel.accessed}
                    color={selectedReel.accessed === 'active' ? 'success' : 'default'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                <TextField
                  label="Level"
                  value={selectedReel.level}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Expiry Date"
                  value={formatDate(selectedReel.exprydate)}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Created At"
                  value={formatDate(selectedReel.createdAt)}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Updated At"
                  value={formatDate(selectedReel.updatedAt)}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Video URL
              </Typography>
              <TextField
                value={selectedReel.videourl}
                fullWidth
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Reel Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Reel</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={newReel.title}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
            />
            <TextField
              label="Level"
              name="level"
              value={newReel.level}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
            />
            <TextField
              label="Expiry Date"
              name="exprydate"
              type="date"
              value={newReel.exprydate}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Video URL"
              name="videourl"
              value={newReel.videourl}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
            />
            <TextField
              label="Access Status"
              name="accessed"
              value={newReel.accessed}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddReel} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Reel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}