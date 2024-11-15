import axios from 'axios';
import { config } from '../config/config';

const api = {
  standards: {
    getByGradeBand: (gradeBand) => 
      axios.get(`${config.API_URL}/api/standards/grade/${gradeBand}`),
  },
  // Add other API endpoints here organized by feature
};

export default api;
