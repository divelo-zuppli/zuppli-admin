import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Button,
  Select,
  SelectItem,
  TextInput,
  InlineNotification,
  ButtonSkeleton,
  NumberInput,
} from "carbon-components-react";
import { gql, useMutation } from "@apollo/client";

import { GlobalContext } from "../../../../App.jsx";
import { PasswordInput } from "carbon-components-react";

const Create = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [navigate, user]);

  const [email, setEmail] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);

  const [fullName, setFullName] = useState("");
  const [invalidFullName, setInvalidFullName] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [invalidPhoneNumber, setInvalidPhoneNumber] = useState(false);

  const [roleCode, setRoleCode] = useState("");
  const [invalidRoleCode, setInvalidRoleCode] = useState(false);

  const [password, setPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(false);

  const [message, setMessage] = useState(undefined);

  const CREATE_USER_MUTATION = gql`
    mutation createUser (
        $email: String!,
        $phoneNumber: String!,
        $password: String!,
        $fullName: String!,
        $roleCode: String!
    ) {
        createUserFromAdmin (
            createUserFromAdminInput: {
                email: $email,
                phoneNumber: $phoneNumber,
                password: $password,
                fullName: $fullName,
                roleCode: $roleCode
            }
        ) {
            uid,
        }
    }
  `;

  const [
    createUser,
    {
      data: createUserData,
      loading: createUserLoading,
      error: createUserError
    }
  ] = useMutation(CREATE_USER_MUTATION);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (!fullName) {
      setInvalidFullName(true);
      return;
    }
    setInvalidFullName(false);

    if (!phoneNumber) {
      setInvalidPhoneNumber(true);
      return;
    }
    setInvalidPhoneNumber(false);

    if (!email) {
      setInvalidEmail(true);
      return;
    }
    setInvalidEmail(false);

    if (!password) {
      setInvalidPassword(true);
      return;
    }
    setInvalidPassword(false);

    

    if (!roleCode) {
      setInvalidRoleCode(true);
      return;
    }
    setInvalidRoleCode(false);

    await createUser({
      variables: {
        email,
        phoneNumber,
        password,
        fullName,
        roleCode
      }
    });

    setMessage("successfully created user");
  };

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter category_create-page">
      <div className="bx--row category_create-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <div style={{ marginBottom: "1rem" }}>
            <Link to="/users">Back</Link>
          </div>

          <span>Create a User</span>

          <Form onSubmit={handleCreateSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <TextInput
                id="fullName-text"
                labelText="Full name"
                invalid={invalidFullName}
                invalidText="A valid value is required"
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <NumberInput
                id="phoneNumber-text"
                label="Phone number"
                invalid={invalidPhoneNumber}
                invalidText="A valid value is required"
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <TextInput
                id="email-text"
                labelText="Email"
                invalid={invalidEmail}
                invalidText="A valid value is required"
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <PasswordInput
                id="password-text"
                labelText="Password"
                invalid={invalidPassword}
                invalidText="A valid value is required"
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <Select
                defaultValue=""
                id="roleCode-select"
                invalid={invalidRoleCode}
                invalidText="A valid value is required"
                labelText="Packaging"
                onChange={(event) => setRoleCode(event.target.value)}
              >
                <SelectItem
                  text="Select..."
                  value=""
                />
                <SelectItem
                  text="Customer"
                  value="01C"
                />
              </Select>
            </div>

            {
              createUserError &&
                <InlineNotification
                  kind="error"
                  iconDescription="close button"
                  subtitle={<span>{createUserError.message}</span>}
                  title="Uups!"
                />
            }

            {
              createUserData &&
                <InlineNotification
                  kind="success"
                  iconDescription="close button"
                  subtitle={<span>{message}</span>}
                  title="Success!"
                  onClose={() => setMessage(undefined)}
                />
            }

            <div style={{ marginBottom: "1rem" }}>
              {
                createUserLoading ?
                  <ButtonSkeleton className="btn-block" /> :
                  <Button className="btn-block" type="submit" size="field">Send</Button>
              }
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Create;
