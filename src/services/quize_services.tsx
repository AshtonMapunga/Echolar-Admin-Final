import axios from 'axios';

const BASE_URL = 'https://escholar.onrender.com/api/v1';
interface ReelData {
  [key: string]: any; // Replace with specific class properties if known
}

const QuizeServices = {
  async getAllQuize(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${BASE_URL}/quize_route/getall`,
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
      console.error('Error fetching :', error);
      return [];
    }
  },

   async addQuize(ReelData: ReelData): Promise<boolean> {
    try {
      const response = await axios.post(
        `${BASE_URL}/quize_route/create`,
        ReelData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.status === 201;
    } catch (error) {
      return false;
    }
  },
};

export default QuizeServices;