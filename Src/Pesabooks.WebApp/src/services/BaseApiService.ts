import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { first } from 'rxjs/operators';
import { authState$, setUser } from '../States/Auth.state';


export class BaseApiService {

  // instance: AxiosInstance;

  // constructor() {
  //   this.instance = axios.create();
  //   this.instance.interceptors.response.use(
  //     (response) => response,
  //     async (error) => await this.handleError(error)
  //   );
  // }
  // async handleError(error) {
  //   console.log("Error", error);

  // }

  getBaseUrl(arg) {
    return 'https://localhost:5001';
  }

  async transformOptions(options: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const { user } = await authState$.pipe(first()).toPromise();
    options.headers['Authorization'] = `Bearer ${user?.access_token}`;
    options.headers['psbk-tenant'] = 5;
    return options;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected transformResult(url: string, response: AxiosResponse, processor: (response: AxiosResponse) => Promise<any>): Promise<any> {
    // if(response.data.result){ 
    //     response.data=response.data.result;
    // }
    if (response.status == 401) {
      setUser(null);
    }
    return processor(response);
  }
}
