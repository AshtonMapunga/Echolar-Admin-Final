import axios from 'axios';

const BASE_URL = 'https://escholar.onrender.com/api/v1';
interface ReelData {
  [key: string]: any; // Replace with specific class properties if known
}

const RealmService = {
  async getAllRealms(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${BASE_URL}/realm_route/getall`,
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
      console.error('Error fetching realms:', error);
      return [];
    }
  },

    async addReel(ReelData: ReelData): Promise<boolean> {
    try {
      const response = await axios.post(
        `${BASE_URL}/realm_route/create`,
        ReelData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log("------------------------ adding  response status", response.status);
      
      return response.status === 201;
    } catch (error) {
      console.error('Error adding real:', error);
      return false;
    }
  },
};

export default RealmService;