import axios from 'axios';

const BASE_URL = 'https://escholar.onrender.com/api/v1';

const AuthService = {
  async registerTeacher(teacherData: Record<string, any>): Promise<Record<string, any> | null> {
    try {
      const response = await axios.post(
        `${BASE_URL}/teacher_route/signup`,
        teacherData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("response teacher register ---------------", response.status);

      if (response.status === 201) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Teacher registration error:', error);
      return null;
    }
  },

  async loginTeacher(teacherData: Record<string, any>): Promise<Record<string, any> | null> {
    try {
      const response = await axios.post(
        `${BASE_URL}/teacher_route/login`,
        teacherData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Teacher login error:', error);
      return null;
    }
  },

  async getAllTeacher(): Promise<any[]> {
    try {
      const token = localStorage.getItem('teachertoken');
      if (!token) return [];

      const response = await axios.get(
        `${BASE_URL}/teacher_route/getall`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        return response.data?.data || [];
      }
      return [];
    } catch (error) {
      console.error('Get all teachers error:', error);
      return [];
    }
  },

  async getTeacherByEmail(teacherEmail: string): Promise<Record<string, any> | null> {
    try {
      const token = localStorage.getItem('teachertoken');
      if (!token) return null;

      const response = await axios.get(
        `${BASE_URL}/teacher_route/getbyemail/${teacherEmail}`,
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
      console.error('Get teacher by email error:', error);
      return null;
    }
  },
};

export default AuthService;