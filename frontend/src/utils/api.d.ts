declare module '@/utils/api' {
  import { AxiosInstance } from 'axios';
  const api: AxiosInstance;
  export default api;
}

declare module '*/utils/api' {
  import { AxiosInstance } from 'axios';
  const api: AxiosInstance;
  export default api;
}
