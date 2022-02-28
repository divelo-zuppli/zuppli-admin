import axios from "axios";
import { getAuth, signInWithCustomToken, signInWithEmailAndPassword } from "firebase/auth";

import environment from "../../environment";
import { setFirebaseProviderId } from "../../utils";

import firebaseApp from "../../firebase";

class AuthService {
  async sendOTP({ phoneCode, phoneNumber, channel }) {
    await axios({
      url: `${environment.API_URL}authentication/otp`,
      method: "POST",
      data: {
        phoneCode: "" + phoneCode,
        phoneNumber: "" + phoneNumber,
        channel,
      },
    });

    return {
      message: "OTP sent successfully",
    };
  }

  async verifyOTP({ phoneCode, phoneNumber, otp }) {
    const {
      data: { customToken },
    } = await axios({
      url: `${environment.API_URL}authentication/otp`,
      method: "PATCH",
      data: {
        phoneCode: "" + phoneCode,
        phoneNumber: "" + phoneNumber,
        otp,
      },
    });

    const auth = getAuth(firebaseApp);

    const userCredential = await signInWithCustomToken(auth, customToken);

    const { providerId } = userCredential;

    if (providerId) setFirebaseProviderId(providerId);
  }

  async login({ email, password }) {
    console.log("LOGIN WITH EMAIL");

    const auth = getAuth(firebaseApp);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const { providerId } = userCredential;

    if (providerId) setFirebaseProviderId(providerId);
  }

  async logout() {
    const auth = getAuth(firebaseApp);

    if (auth.currentUser) await auth.signOut();
  }
}

const authService = new AuthService();

export default authService;
