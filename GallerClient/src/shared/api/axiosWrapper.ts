import axios from "axios";
import type { AxiosRequestConfig } from "axios";
// import { authConstants } from "shared/constants/auth";

export const getBearerHeaders = () => {
  return {
    // Authorization: `Bearer ${localStorage.getItem(authConstants.tokenString)}`,
  };
};

export const axiosWrapper = async ({
  url,
  method,
  headers = null,
  data = null,
  params = null,
  returnField = "data",
  paramsSerializer = null,
  responseType = "json",
  requiredAdmin = false,
}) => {
  const config: AxiosRequestConfig = {
    url:  url,
    method: method,
    headers: requiredAdmin ? getBearerHeaders() : headers ?? {},
    data: data,
    params: params,
    paramsSerializer: paramsSerializer,
    responseType: responseType as AxiosRequestConfig["responseType"],
  };

  const resultData = await axios(config);

  if (!returnField) {
    return resultData;
  } else {
    return resultData[returnField];
  }
};
