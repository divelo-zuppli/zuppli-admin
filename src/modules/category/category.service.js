import axios from "axios";

import environment from "../../environment";

import { getIdTokenFromCurrentUser } from "../../utils";

class HttpRouteService {
  async getAll() {    
    const token = await getIdTokenFromCurrentUser();

    if (!token) {
      return [];
    }

    const { data } = await axios({
      url: `${environment.AUTHORIZER_API_URL}authorizer/http-routes`,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      params: {
        limit: 1000
      }
    });

    return data;
  }

  async create({ method, path, permissionUid, isPublic }) {
    const token = await getIdTokenFromCurrentUser();

    if (!token) return {};

    const { data } = await axios({
      url: `${environment.AUTHORIZER_API_URL}authorizer/http-routes`,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      data: {
        method,
        path,
        permissionUid,
        isPublic,
      },
    });

    return {
      ...data,
      message: "successfully created http route",
    };
  }

  async getOne({ uid }) {
    const token = await getIdTokenFromCurrentUser();

    if (!token) return {};

    const { data } = await axios({
      url: `${environment.AUTHORIZER_API_URL}authorizer/http-routes/${uid}`,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    return data;
  }

  async update({ uid, method, path, permissionUid, isPublic }) {
    const token = await getIdTokenFromCurrentUser();

    if (!token) return {};

    console.log("isPublic", isPublic);

    const { data } = await axios({
      url: `${environment.AUTHORIZER_API_URL}authorizer/http-routes/${uid}`,
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      data: {
        method,
        path,
        permissionUid,
        isPublic,
      },
    });

    return {
      ...data,
      message: "successfully updated http route",
    };
  }

  async delete({ uid }) {
    const token = await getIdTokenFromCurrentUser();

    if (!token) return {};

    const { data } = await axios({
      url: `${environment.AUTHORIZER_API_URL}authorizer/http-routes/${uid}`,
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    return {
      ...data,
      message: "successfully deleted http route",
    };
  }
}

const httpRouteService = new HttpRouteService();

export default httpRouteService;
