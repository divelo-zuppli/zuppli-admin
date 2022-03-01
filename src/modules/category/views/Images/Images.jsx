import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  ModalWrapper,
  Loading,
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

  return flattenImages;
};

const Images = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  const { uid } = useParams();

  // getting the item for the images
  const GET_CATEGORY_QUERY = gql`
  query getOneCategory (
    $uid: String!
  ) {
      getCategory (
        getOneCategoryInput: {
            uid: $uid
        }
      ) {
        categoryAttachments {
            main
            version
            createdAt
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
    loading: categoryQueryLoading,
    // error: categoryQueryError,
    data: categoryQueryData,
  } = useQuery(GET_CATEGORY_QUERY, {
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

    if (categoryQueryData) {
      setImages(getImagesItems(categoryQueryData?.getCategory?.categoryAttachments));
    }
  }, [user, navigate, categoryQueryData]);

  // delete the image
  const DELETE_CATEGORY_IMAGE_MUTATION = gql`
    mutation deleteCategoryImage (
      $categoryUid: String!
      $attachmentUid: String!
    ) {
        deleteCategoryImage (
            deleteCategoryImageInput: {
                categoryUid: $categoryUid,
                attachmentUid: $attachmentUid
            }
        ) {
            uid
        }
    }
  `;

  const [
    deleteCategoryImage, 
    {
      // data: deleteCategoryImageData,
      // loading: deletingCategoryImageLoading,
      error: deletingCategoryImageError,
    }
  ] = useMutation(DELETE_CATEGORY_IMAGE_MUTATION);

  const deleteImage = async (attachmentUid) => {
    await deleteCategoryImage({
      variables: {
        categoryUid: uid,
        attachmentUid,
      },
    });

    setImages(images.filter(image => image.attachmentUid !== attachmentUid));

    setShouldClosePopUp(true);

    setShouldClosePopUp(false);
  };

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter category_images-page">
      <div className="bx--row category_list-page__r1">
        <div className="bx--col-lg-16">
          {
            categoryQueryLoading &&
            <div style={{ width: "100%" }}>
              <Loading
                style={{ display: "table", margin: "0 auto" }}
                description="Active loading indicator" withOverlay={false}
              />
            </div>
          }

          {
            categoryQueryData &&
            <StructuredListWrapper ariaLabel="Structured list">
              <StructuredListHead>
                <StructuredListRow
                  head
                  tabIndex={0}
                >
                  <StructuredListCell head>
                  Main Image
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
                          deletingCategoryImageError &&
                          <div>
                            {deletingCategoryImageError.message}
                          </div>
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