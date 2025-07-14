import axios from 'axios';

const BASE_URL = 'https://escholar.onrender.com/api/v1';

const AuthStudentService = {
  async registerStudent(studentData: Record<string, any>): Promise<boolean> {
    try {
      const response = await axios.post(
        `${BASE_URL}/student_route/signup`,
        studentData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.status === 201;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  },

  async loginStudent(studentData: Record<string, any>): Promise<Record<string, any> | null> {
    try {
      const response = await axios.post(
        `${BASE_URL}/student_route/login`,
        studentData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("login status -----------------------", response.status);
      console.log("login response -----------------------", response);

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  async updateStudentById(studentID: string, updatedData: Record<string, any>): Promise<any> {
    try {
      const token = localStorage.getItem('studenttoken');
      if (!token) return null;

      const response = await axios.put(
        `${BASE_URL}/student_route/updatestudent/${studentID}`,
        updatedData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log("update student status code--------------------", response.status);

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Update student error:', error);
      return null;
    }
  },

  async getStudentByPhoneNumber(studentPhoneNumber: string): Promise<Record<string, any> | null> {
    try {
      const token = localStorage.getItem('studenttoken');
      if (!token) return null;

      const response = await axios.get(
        `${BASE_URL}/student_route/getstudentbyPhoneNumber/${studentPhoneNumber}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        return response.data?.data || null;
      }
      return null;
    } catch (error) {
      console.error('Get student by phone error:', error);
      return null;
    }
  },

  async getAllStudent(): Promise<any[] | null> {
    try {
      const token = localStorage.getItem('teachertoken');
      if (!token) return null;

      const response = await axios.get(
        `${BASE_URL}/student_route/getallstudents`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Get all students error:', error);
      return null;
    }
  },

  async getStudentById(studentID: string): Promise<Record<string, any> | null> {
    try {
      const token = localStorage.getItem('studenttoken');
      if (!token) return null;

      const response = await axios.get(
        `${BASE_URL}/student_route/getstudentbyid/${studentID}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log("response-------------payment status code:", response.status);

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Get student by ID error:', error);
      return null;
    }
  },
};

export default AuthStudentService;