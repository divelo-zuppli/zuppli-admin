import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  TextInput,
  PasswordInput,
  Button,
  InlineNotification,
} from "carbon-components-react";

import authService from "../../auth.service";

import { GlobalContext } from "../../../../App.jsx";

const Login = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  useEffect(() => {
    if (user) {
      return navigate("/home");
    }
  }, [navigate, user]);

  const [email, setEmail] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [error, setError] = useState(undefined);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!email || email.trim().length === 0) {
      setInvalidEmail(true);
      return;
    }
    setInvalidEmail(false);

    if (!password || password.trim().length === 0) {
      setInvalidPassword(true);
      return;
    }
    setInvalidPassword(false);

    try {
      await authService.login({
        email,
        password,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter login-page">
      <div className="bx--row login-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <span>Try with your email and password...</span>
          <Form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <TextInput
                id="email"
                labelText="Email"
                invalid={invalidEmail}
                invalidText="A valid value is required"
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <PasswordInput
                id="password"
                labelText="Password"
                invalid={invalidPassword}
                invalidText="A valid value is required"
                onChange={(event) => setPassword(event.target.value)} />
            </div>

            {
              error &&
                            <div>
                              <InlineNotification
                                kind="error"
                                iconDescription="close button"
                                subtitle={<span>{error}</span>}
                                title="Uups!"
                                onClose={() => setError(undefined)}
                              />
                            </div>
            }

            <div style={{ marginBottom: "1rem" }}>
              <Button className="btn-block" type="submit" size="field">GO</Button>
            </div>

            <div style={{ textAlign: "center" }}>
              <span>
                                Want to try with <Link to="/otp">OTP</Link> instead?
              </span>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;