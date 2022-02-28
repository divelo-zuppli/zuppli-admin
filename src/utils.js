import { getAuth } from "firebase/auth";

import firebaseApp from "./firebase";

export const setFirebaseProviderId = (value = "") => {
  localStorage.setItem("firebaseProviderId", value);
};

export const getFirebaseProviderId = () => {
  const providerId = localStorage.getItem("firebaseProviderId");

  return providerId || "none";
};

export const getIdTokenFromCurrentUser = async () => {
  const auth = getAuth(firebaseApp);

  const { currentUser } = auth;

  if (!currentUser) {
    return undefined;
  }

  const token = await currentUser.getIdToken();

  return token;
};

export const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
