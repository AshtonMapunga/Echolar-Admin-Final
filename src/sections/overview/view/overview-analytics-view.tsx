import { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import ClassService from 'src/services/classes_services';
import AuthStudentService from 'src/services/student_Services';
import AuthService from 'src/services/teacher_services';
import RealmService from 'src/services/reels_services';

// Custom color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Custom widget component
const SummaryCard = ({ title, value, icon, color = '#0088FE', data = [] }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
      {data.length > 0 && (
        <Box mt={2}>
          <LinearProgress 
            variant="determinate" 
            value={(data[0] / (data[0] + data[1])) * 100} 
            color="primary"
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption">{data[0]} active</Typography>
            <Typography variant="caption">{data[1]} total</Typography>
          </Box>
        </Box>
      )}
    </CardContent>
  </Card>
);

// Data table component for distributions
const DistributionTable = ({ title, data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => {
                const percentage = ((row.value / total) * 100).toFixed(1);
                return (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      <Box display="flex" alignItems="center">
                        <Box 
                          width={16} 
                          height={16} 
                          bgcolor={COLORS[index % COLORS.length]} 
                          mr={1} 
                          borderRadius={1}
                        />
                        {row.name}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{row.value}</TableCell>
                    <TableCell align="right">{percentage}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

// Simple bar chart using MUI
const SimpleBarChart = ({ title, data }) => {
  const maxValue = Math.max(...data.map(d => d.count), 1); // Ensure at least 1 to avoid division by zero
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {data.map((item, index) => {
            const height = (item.count / maxValue) * 100;
            return (
              <Box key={item.month} display="flex" alignItems="flex-end" mb={1}>
                <Typography variant="caption" sx={{ width: 40 }}>
                  {item.month}
                </Typography>
                <Box 
                  sx={{ 
                    bgcolor: COLORS[index % COLORS.length],
                    height: `${height}%`,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    pr: 1,
                    color: 'common.white',
                    transition: 'height 0.5s ease'
                  }}
                >
                  <Typography variant="caption">{item.count}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export function OverviewAnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    teachers: 0,
    realms: 0,
    activeStudents: 0,
    activeTeachers: 0
  });
  const [classData, setClassData] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any[]>([]);
  const [teacherData, setTeacherData] = useState<any[]>([]);
  const [realmData, setRealmData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [classes, students, teachers, realms] = await Promise.all([
          ClassService.getAllClasses(),
          AuthStudentService.getAllStudent(),
          AuthService.getAllTeacher(),
          RealmService.getAllRealms()
        ]);

        setClassData(classes || []);
        setStudentData(students || []);
        setTeacherData(teachers || []);
        setRealmData(realms || []);

        setStats({
          classes: classes?.length || 0,
          students: students?.length || 0,
          teachers: teachers?.length || 0,
          realms: realms?.length || 0,
          activeStudents: students?.filter(s => s.isActive)?.length || 0,
          activeTeachers: teachers?.filter(t => t.isActive)?.length || 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for visualizations
  const classDistribution = classData.reduce((acc, cls) => {
    const level = cls.level || 'Unknown';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const studentStatusData = [
    { name: 'Active', value: stats.activeStudents },
    { name: 'Inactive', value: stats.students - stats.activeStudents }
  ];

  const teacherStatusData = [
    { name: 'Active', value: stats.activeTeachers },
    { name: 'Inactive', value: stats.teachers - stats.activeTeachers }
  ];

  const monthlySignups = (data: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = new Array(12).fill(0);
    
    data.forEach(item => {
      if (item.createdAt) {
        const month = new Date(item.createdAt).getMonth();
        result[month]++;
      }
    });
    
    return months.map((month, index) => ({ month, count: result[index] }));
  };

  const classLevelData = Object.entries(classDistribution).map(([name, value]) => ({
    name,
    value
  }));

  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        eScholar Platform Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Classes" 
            value={stats.classes} 
            icon="C"
            color="#4CAF50"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Students" 
            value={stats.students} 
            icon="S"
            color="#2196F3"
            data={[stats.activeStudents, stats.students]}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Teachers" 
            value={stats.teachers} 
            icon="T"
            color="#FF9800"
            data={[stats.activeTeachers, stats.teachers]}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Learning Realms" 
            value={stats.realms} 
            icon="R"
            color="#9C27B0"
          />
        </Grid>

        {/* Distribution Tables */}
        <Grid item xs={12} md={4}>
          <DistributionTable 
            title="Student Status" 
            data={studentStatusData} 
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <DistributionTable 
            title="Teacher Status" 
            data={teacherStatusData} 
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <DistributionTable 
            title="Class Levels" 
            data={classLevelData} 
          />
        </Grid>

        {/* Growth Charts */}
        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="Student Growth"
            data={monthlySignups(studentData)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="Teacher Growth"
            data={monthlySignups(teacherData)}
          />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Classes
              </Typography>
              <List>
                {classData.slice(0, 5).map((cls, index) => (
                  <div key={cls._id}>
                    <ListItem>
                      <Avatar sx={{ bgcolor: '#4CAF50', mr: 2 }}>
                        {cls.name?.charAt(0) || 'C'}
                      </Avatar>
                      <ListItemText
                        primary={cls.name || 'Unnamed Class'}
                        secondary={`Level: ${cls.level} | Students: ${cls.students?.length || 0}`}
                      />
                    </ListItem>
                    {index < classData.length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Realms */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popular Realms
              </Typography>
              <List>
                {[...realmData]
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 5)
                  .map((realm, index) => (
                    <div key={realm._id}>
                      <ListItem>
                        <Avatar sx={{ bgcolor: '#9C27B0', mr: 2 }}>
                          {realm.title?.charAt(0) || 'R'}
                        </Avatar>
                        <ListItemText
                          primary={realm.title || 'Unnamed Realm'}
                          secondary={`Views: ${realm.views || 0} | Created: ${new Date(realm.createdAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                      {index < 4 && <Divider />}
                    </div>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Students */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Students
              </Typography>
              <List>
                {studentData.slice(0, 5).map((student, index) => (
                  <div key={student._id}>
                    <ListItem>
                      <Avatar sx={{ bgcolor: '#2196F3', mr: 2 }}>
                        {student.name?.charAt(0) || 'S'}
                      </Avatar>
                      <ListItemText
                        primary={student.name || 'New Student'}
                        secondary={`Joined: ${new Date(student.createdAt).toLocaleDateString()} | ${student.isActive ? 'Active' : 'Inactive'}`}
                      />
                    </ListItem>
                    {index < studentData.length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}