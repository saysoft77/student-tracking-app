import axios from 'axios';
import { config } from '../config/config';

const api = {
  standards: {
    getAll: () => 
      axios.get(`${config.API_URL}/api/standards`),
    getByGradeBand: (gradeBand) => 
      axios.get(`${config.API_URL}/api/standards/grade/${gradeBand}`)
  }
};

export default api;
