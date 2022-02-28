import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  NumberInput,
  Select,
  SelectItem,
  Button,
  InlineNotification,
} from "carbon-components-react";

import authService from "../../auth.service";

import { GlobalContext } from "../../../../App.jsx";

const OTP = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  useEffect(() => {
    if (user) {
      return navigate("/home");
    }
  }, [navigate, user]);

  const [phoneCode, setPhoneCode] = useState("");
  const [invalidPhoneCode, setInvalidPhoneCode] = useState(false);
  const [channel, setChannel] = useState("");
  const [invalidChannel, setInvalidChannel] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(undefined);
  const [invalidPhoneNumber, setInvalidPhoneNumber] = useState(false);
  const [otp, setOtp] = useState("");
  const [invalidOtp, setInvalidOtp] = useState(false);
    
  const [errorOnSend, setErrorOnSend] = useState(undefined);
  const [errorOnVerify, setErrorOnVerify] = useState(undefined);

  const handleSendOTPSubmit = async (event) => {
    event.preventDefault();

    if (!phoneCode) {
      setInvalidPhoneCode(true);
      return;
    }
    setInvalidPhoneCode(false);

    if (!channel) {
      setInvalidChannel(true);
      return;
    }
    setInvalidChannel(false);

    if (!phoneNumber) {
      setInvalidPhoneNumber(true);
      return;
    }
    setInvalidPhoneNumber(false);

    try {
      const { message } = await authService.sendOTP({
        phoneCode,
        channel,
        phoneNumber,
      });

      alert(message);
    } catch (error) {
      setErrorOnSend(error.message);
    }
  }

  const handleVerifyOTPSubmit = async (event) => {
    event.preventDefault();

    if (!otp) {
      setInvalidOtp(true);
      return;
    }
    setInvalidOtp(false);

    try {
      await authService.verifyOTP({
        phoneCode,
        phoneNumber,
        otp,
      });
    } catch (error) {
      setErrorOnVerify(error.message);
    }
  }

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter otp-page">
      <div className="bx--row otp-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <span>Send OTP</span>
          <Form onSubmit={handleSendOTPSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <Select
                defaultValue=""
                id="phoneCode-select"
                invalid={invalidPhoneCode}
                invalidText="A valid value is required"
                labelText="Country"
                onChange={(event) => setPhoneCode(event.target.value)}
              >
                <SelectItem
                  text="Select..."
                  value=""
                />
                <SelectItem
                  text="COLOMBIA"
                  value="57"
                />
                <SelectItem
                  text="MEXICO"
                  value="52"
                />
                <SelectItem
                  text="BRASIL"
                  value="55"
                />
              </Select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <Select
                defaultValue="placeholder-item"
                id="channel-select"
                invalid={invalidChannel}
                invalidText="A valid value is required"
                labelText="Channel"
                onChange={(event) => setChannel(event.target.value)}
              >
                <SelectItem
                  text="Select..."
                  value=""
                />
                <SelectItem
                  text="Whatsapp"
                  value="wa"
                />
                <SelectItem
                  text="SMS"
                  value="sms"
                />
                <SelectItem
                  text="Call"
                  value="call"
                />
              </Select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <NumberInput
                id="phoneNumber"
                labelText="Phone Number"
                invalid={invalidPhoneNumber}
                invalidText="A valid value is required"
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
            </div>

            {
              errorOnSend &&
                            <div>
                              <InlineNotification
                                kind="error"
                                iconDescription="close button"
                                subtitle={<span>{errorOnSend}</span>}
                                title="Uups!"
                                onClose={() => setErrorOnSend(undefined)}
                              />
                            </div>
            }

            <div style={{ marginBottom: "1rem" }}>
              <Button className="btn-block" type="submit" size="field">Send</Button>
            </div>
          </Form>

          <span>Verify OTP</span>
          <Form onSubmit={handleVerifyOTPSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <NumberInput
                id="otp"
                labelText="OTP"
                invalid={invalidOtp}
                invalidText="A valid value is required"
                onChange={(event) => setOtp(event.target.value)}
              />
            </div>

            {
              errorOnVerify &&
                            <div>
                              <InlineNotification
                                kind="error"
                                iconDescription="close button"
                                subtitle={<span>{errorOnVerify}</span>}
                                title="Uups!"
                                onClose={() => setErrorOnVerify(undefined)}
                              />
                            </div>
            }

            <div style={{ marginBottom: "1rem" }}>
              <Button kind="secondary" className="btn-block" type="submit" size="field">Verify</Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default OTP;