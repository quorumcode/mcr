import axios, { AxiosInstance } from "axios";
import qs from "qs";

export class Client {
  public axios: AxiosInstance;

  constructor(baseUrl: string) {
    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: 3000,
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: "repeat" });
      },
    });
    // TODO Use this & eventBus for showing modal login form
    /*this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response.status === 401) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(axios.request(error.config));
            }, 3000);
          });
        }
        return Promise.reject(error);
      }
    );*/
  }

  setToken(token: string | undefined): void {
    if (token) {
      this.axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
    } else {
      this.axios.defaults.headers.common = {};
    }
  }
}
