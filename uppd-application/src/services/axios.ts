import Axios from 'axios';

export const axios = Axios.create({
  baseURL: `${process.env.REACT_APP_ENDPOINT_URL}`,
});
