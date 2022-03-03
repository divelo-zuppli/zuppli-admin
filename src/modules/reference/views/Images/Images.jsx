import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  ModalWrapper,
  Loading,
  InlineNotification,
} from "carbon-components-react";
import { ImageReference24 } from "@carbon/icons-react";
import { gql, useQuery, useMutation } from "@apollo/client";

import { GlobalContext } from "../../../../App.jsx";

const getImagesItems = (images = []) => {
  const flattenImages = images.reduce((pre, cur) => {
    const { attachment = {}, ...rest } = cur;

    return [
      ...pre,
      {
        ...rest,
        attachmentId: attachment.id,
        attachmentUid: attachment.uid,
        cloudId: attachment.cloudId,
        url: attachment.url,
      }
    ];
  }, []);

  console.log("flattenImages", flattenImages);

  return flattenImages;
};

const Images = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  const { uid } = useParams();

  // getting the item for the images
  const GET_REFERENCE_QUERY = gql`
    query getOneReference (
        $uid: String!
    ) {
        getReference (
            getOneReferenceInput: {
                uid: $uid
            }
        ) {
          referenceAttachments {
              main
              version
              attachment {
                  id
                  uid
                  cloudId
                  type
                  url
              }
          }
        }
    }
  `;
  const {
    loading: referenceQueryLoading,
    // error: referenceQueryError,
    data: referenceQueryData,
  } = useQuery(GET_REFERENCE_QUERY, {
    variables: {
      uid,
    },
  });

  // define the state
  const [images, setImages] = useState([]);

  const [shouldClosePopUp, setShouldClosePopUp] = useState(false);

  // check if the user is logged in
  // if not, redirect to login page
  useEffect(() => {
    if (!user) {
      return navigate("/");
    }

    if (referenceQueryData) {
      setImages(getImagesItems(referenceQueryData?.getReference?.referenceAttachments));
    }
  }, [user, navigate, referenceQueryData]);

  // delete the image
  const DELETE_REFERENCE_IMAGE_MUTATION = gql`
    mutation deleteReferenceImage (
        $referenceUid: String!
        $attachmentUid: String!
    ) {
        deleteReferenceImage (
            deleteReferenceImageInput: {
              referenceUid: $referenceUid,
              attachmentUid: $attachmentUid 
            }
        ) {
            id,
            uid,
            sku,
            name,
            description
        }
    }
  `;

  const [
    deleteReferenceImage, 
    {
      // data: deleteReferenceImageData,
      // loading: deletingReferenceImageLoading,
      error: deletingReferenceImageError,
    }
  ] = useMutation(DELETE_REFERENCE_IMAGE_MUTATION);

  const deleteImage = async (attachmentUid) => {
    await deleteReferenceImage({
      variables: {
        referenceUid: uid,
        attachmentUid,
      },
    });

    setImages(images.filter(image => image.attachmentUid !== attachmentUid));

    setShouldClosePopUp(true);

    setShouldClosePopUp(false);
  };

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter category_images-page">
      <div className="bx--row category_images-page__r1">
        <div className="bx--col-lg-16">
          <div style={{ marginBottom: "1rem" }}>
            <Link to={`/categories/${uid}/images/create`}>Create</Link>
          </div>
          {
            referenceQueryLoading &&
            <div style={{ width: "100%" }}>
              <Loading
                style={{ display: "table", margin: "0 auto" }}
                description="Active loading indicator" withOverlay={false}
              />
            </div>
          }

          {
            referenceQueryData &&
            <StructuredListWrapper ariaLabel="Structured list">
              <StructuredListHead>
                <StructuredListRow
                  head
                  tabIndex={0}
                >
                  <StructuredListCell head>
                  Main image
                  </StructuredListCell>
                  <StructuredListCell head>
                  Version
                  </StructuredListCell>
                  <StructuredListCell head>
                  Show
                  </StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {images.map((image, index) => (
                  <StructuredListRow tabIndex={0} key={index}>
                    <StructuredListCell>
                      {String(image.main)}
                    </StructuredListCell>
                    <StructuredListCell>
                      {image.version || "none"}
                    </StructuredListCell>
                    <StructuredListCell>
                      <ModalWrapper
                        renderTriggerButtonIcon={() => <ImageReference24 />}
                        buttonTriggerClassName="category_images-page__trigger-button"
                        triggerButtonKind="primary"
                        modalHeading="Image"
                        modalLabel="Label"
                        danger={true}
                        shouldCloseAfterSubmit={shouldClosePopUp}
                        preventCloseOnClickOutside={true}
                        handleSubmit={() => deleteImage(image.attachmentUid)}
                        primaryButtonText="Delete"
                      >
                        {
                          deletingReferenceImageError &&
                          <InlineNotification
                            kind="error"
                            iconDescription="close button"
                            subtitle={<span>{deletingReferenceImageError.message}</span>}
                            title="Uups!"
                          />
                        }
                        <img
                          src={image.url}
                          alt="Carbon illustration"
                        />
                      </ModalWrapper>
                    </StructuredListCell>
                  </StructuredListRow>
                ))}
              </StructuredListBody>
            </StructuredListWrapper>
          }
        </div>
      </div>
    </div>
  );
};

export default Images;