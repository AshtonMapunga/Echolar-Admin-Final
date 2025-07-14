import axios from 'axios';

const BASE_URL = 'https://escholar.onrender.com/api/v1';

interface ClassData {
  [key: string]: any; // Replace with specific class properties if known
}

const ClassService = {
  // Create a new class
  async addClass(classData: ClassData): Promise<boolean> {
    try {
      const response = await axios.post(
        `${BASE_URL}/class_route/create`,
        classData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log("------------------------ adding class response status", response.status);
      
      return response.status === 201;
    } catch (error) {
      console.error('Error adding class:', error);
      return false;
    }
  },

  // Get all classes
  async getAllClasses(): Promise<ClassData[]> {
    try {
      const response = await axios.get(
        `${BASE_URL}/class_route/getAll`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  },

  // Update a class by ID
  async updateClassById(classId: string, updatedData: ClassData): Promise<boolean> {
    try {
      const response = await axios.put(
        `${BASE_URL}/class_route/updateclass/${classId}`,
        updatedData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error updating class:', error);
      return false;
    }
  },

  // Get class by ID (stubbed implementation)
  async getClassById(classItem: any): Promise<ClassData | null> {
    // Implement this method based on your requirements
    return null;
  },
};

export default ClassService;