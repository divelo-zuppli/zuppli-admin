import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import {
  Form,
  Select,
  SelectItem,
  Toggle,
  FileUploader,
  Button,
  ButtonSkeleton,
  InlineNotification,
} from "carbon-components-react";

import { GlobalContext } from "../../../../App.jsx";

const CreateImage = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  const { uid } = useParams();

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [navigate, user]);

  const [version, setVersion] = useState("");
  const [invalidVersion, setInvalidVersion] = useState(false);

  const [main, setMain] = useState(false);
  
  const [file, setFile] = useState(undefined);

  const [message, setMessage] = useState("");

  const UPLOAD_REFERENCE_IMAGE_MUTATION = gql`
    mutation uploadReferenceImage (
      $referenceUid: String!
      $version: String!
      $main: Boolean
      $file: Upload!
    ) {
      uploadReferenceImage (
        uploadReferenceImageInput: {
          uid: $referenceUid
          main: $main,
          version: $version
        },
        file: $file
      ) {
        id
      }
    }
  `;

  const [
    uploadReferenceImage,
    {
      data: uploadReferenceImageData,
      loading: uploadReferenceImageLoading,
      error: uploadReferenceImageError
    }
  ] = useMutation(UPLOAD_REFERENCE_IMAGE_MUTATION);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (!version) {
      setInvalidVersion(true);
      return;
    }

    setInvalidVersion(false);

    await uploadReferenceImage({
      variables: {
        referenceUid: uid,
        version,
        main,
        file: file,
      },
      
    });

    setMessage("successfully uploaded image");
  }

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter reference_image_create-page">
      <div className="bx--row reference_image_create-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <div style={{ marginBottom: "1rem" }}>
            <Link to={`/references/${uid}/images`}>Back</Link>
          </div>

          <span>Create a Reference image</span>

          <Form onSubmit={handleCreateSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <Select
                defaultValue=""
                id="imageVersion-select"
                invalid={invalidVersion}
                invalidText="A valid value is required"
                labelText="Image version"
                onChange={(event) => setVersion(event.target.value)}
              >
                <SelectItem
                  text="Choose an option"
                  value=""
                />
                <SelectItem
                  text="Small"
                  value="small"
                />
                <SelectItem
                  text="Medium"
                  value="medium"
                />
                <SelectItem
                  text="Large"
                  value="large"
                />
              </Select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <Toggle
                id="main-toggle"
                labelText="Main image?"
                defaultValue={false}
                onChange={(event) => setMain(event.target.checked)}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <FileUploader
                accept={[
                  ".jpg",
                  ".png"
                ]}
                buttonKind="tertiary"
                buttonLabel="Add file"
                filenameStatus="edit"
                iconDescription="Clear file"
                labelDescription="only .jpg or .png files at 500mb or less"
                labelTitle="Image"
                onChange={(event) => setFile(event.target.files[0])}
              />
            </div>

            {
              uploadReferenceImageError &&
                <InlineNotification
                  kind="error"
                  iconDescription="close button"
                  subtitle={<span>{uploadReferenceImageError.message}</span>}
                  title="Uups!"
                />
            }

            {
              uploadReferenceImageData &&
                <InlineNotification
                  kind="success"
                  iconDescription="close button"
                  subtitle={<span>{message}</span>}
                  title="Success!"
                  onClose={() => setMessage("")}
                />
            }

            <div style={{ marginBottom: "1rem" }}>
              {
                uploadReferenceImageLoading &&
                <ButtonSkeleton className="btn-block" size="field" />
              }

              {
                !uploadReferenceImageLoading &&
                <Button className="btn-block" type="submit" size="field">Send</Button>
              }
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default CreateImage;