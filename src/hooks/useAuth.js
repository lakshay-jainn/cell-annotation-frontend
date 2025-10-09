import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function useGlobalAuth() {
  return useContext(AuthContext);
}
