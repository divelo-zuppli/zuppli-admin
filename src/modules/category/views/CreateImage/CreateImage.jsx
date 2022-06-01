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

  const UPLOAD_CATEGORY_IMAGE_MUTATION = gql`
    mutation uploadCategoryImage (
      $categoryUid: String!
      $version: String
      $main: Boolean
      $file: Upload!
    ) {
      uploadCategoryImage (
        uploadCategoryImageInput: {
          uid: $categoryUid
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
    uploadCategoryImage,
    {
      data: uploadCategoryImageData,
      loading: uploadCategoryImageLoading,
      error: uploadCategoryImageError
    }
  ] = useMutation(UPLOAD_CATEGORY_IMAGE_MUTATION);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (!version) {
      setInvalidVersion(true);
      return;
    }

    setInvalidVersion(false);

    await uploadCategoryImage({
      variables: {
        categoryUid: uid,
        version,
        main,
        file: file,
      },
      
    });

    setMessage("successfully uploaded image");
  }

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter category_image_create-page">
      <div className="bx--row category_image_create-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <div style={{ marginBottom: "1rem" }}>
            <Link to={`/categories/${uid}/images`}>Back</Link>
          </div>
          <span>Create a Category image</span>

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
              uploadCategoryImageError &&
                <InlineNotification
                  kind="error"
                  iconDescription="close button"
                  subtitle={<span>{uploadCategoryImageError.message}</span>}
                  title="Uups!"
                />
            }

            {
              uploadCategoryImageData &&
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
                uploadCategoryImageLoading &&
                <ButtonSkeleton className="btn-block" size="field" />
              }

              {
                !uploadCategoryImageLoading &&
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