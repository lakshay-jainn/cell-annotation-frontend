import axiosClient from "../axios/axiosClient";

export async function SigninAPI(data) {
  const response = await axiosClient.post("/login", data);

  return response.data;
}

export async function SignupAPI(data) {
  const response = await axiosClient.post("/register", data);

  return response.data;
}
