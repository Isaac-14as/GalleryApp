import axios from "axios";

export const authConstants = {
  tokenString: "accessToken",
  clientName: "Личный кабинет",
};

export const getBearerHeaders = () => {
  return {
    Authorization: `Bearer ${localStorage.getItem(authConstants.tokenString)}`,
  };
};

export const authAxios = async ({
  url,
  method,
  headers = null,
  data = null,
  params = null,
  useDomain = false,
  returnField = "data",
  paramsSerializer = null,
  responseType = "json",
}) => {
  const config = {
    url: useDomain ? `${this.authDomain}${url}` : url,
    method: method,
    headers: headers ? headers : getBearerHeaders(),
    data: data,
    params: params,
    paramsSerializer: paramsSerializer,
    responseType: responseType,
  };

  const resultData = await axios(config);

  if (!returnField) {
    return resultData;
  } else {
    return resultData[returnField];
  }
};
