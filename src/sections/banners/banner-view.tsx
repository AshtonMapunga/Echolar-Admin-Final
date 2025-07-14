import { useState, useEffect } from 'react';

import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
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
  CircularProgress
} from '@mui/material';

import BannersService from 'src/services/banners_services';

interface Banner {
  _id: string;
  title: string;
  description: string;
  imageurl: string;
  createdAt: string;
  updatedAt: string;
}

export default function BannersManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6); // Changed for grid display
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [error, setError] = useState('');
  const [newBanner, setNewBanner] = useState({
    title: '',
    description: '',
    imageurl: ''
  });

  // Fetch all banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await BannersService.getAllBanners();
      if (data) {
        setBanners(data);
      } else {
        setError('Failed to fetch banners');
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Error fetching banners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
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
    setNewBanner({
      title: '',
      description: '',
      imageurl: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBanner(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBanner = async () => {
    try {
      setLoading(true);
      const success = await BannersService.addBanner(newBanner);
      if (success) {
        fetchBanners(); // Refresh the list
        handleCloseAddDialog();
      } else {
        setError('Failed to add banner');
      }
    } catch (err) {
      console.error('Error adding banner:', err);
      setError('Error adding banner. Please try again.');
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
          Banner Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={fetchBanners}
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
            Add Banner
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
      ) : banners.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No banners found. Add your first banner!
        </Typography>
      ) : (
        <>
          {/* Grid View for Banners */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {banners
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((banner) => (
                <Grid item xs={12} sm={6} md={4} key={banner._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={banner.imageurl}
                      alt={banner.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div">
                        {banner.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {banner.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Created: {formatDate(banner.createdAt)}
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
                    count={banners.length}
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

      {/* Add Banner Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Banner</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={newBanner.title}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 3 }}
              required
            />
            <TextField
              label="Description"
              name="description"
              value={newBanner.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 3 }}
              required
            />
            <TextField
              label="Image URL"
              name="imageurl"
              value={newBanner.imageurl}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            {newBanner.imageurl && (
              <Box sx={{ mt: 2, mb: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Image Preview:</Typography>
                <img
                  src={newBanner.imageurl}
                  alt="Banner preview"
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
            onClick={handleAddBanner} 
            variant="contained" 
            color="primary"
            disabled={loading || !newBanner.title || !newBanner.description || !newBanner.imageurl}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Banner'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}