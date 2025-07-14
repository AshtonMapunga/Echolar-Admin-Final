import axios from 'axios';

const BASE_URL = 'https://escholar.onrender.com/api/v1';
interface ReelData {
  [key: string]: any; // Replace with specific class properties if known
}

const BannersService = {
  async getAllBanners(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${BASE_URL}/banner_route/getall`,
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
      console.error('Error fetching banner:', error);
      return [];
    }
  },

   async addBanner(ReelData: ReelData): Promise<boolean> {
    try {
      const response = await axios.post(
        `${BASE_URL}/banner_route/create`,
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
      console.error('Error adding banner:', error);
      return false;
    }
  },
};

export default BannersService;