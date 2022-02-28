import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Button,
  Select,
  SelectItem,
  TextInput,
  InlineNotification,
  SelectSkeleton,
  TextInputSkeleton,
  ButtonSkeleton,
  NotificationActionButton
} from "carbon-components-react";
import { gql, useQuery, useMutation } from "@apollo/client";

import { GlobalContext } from "../../../../App.jsx";

const getCategoriesItems = (categories = []) => {
  const flattenCategories = categories.reduce((pre, cur) => {
    const { children = [], ...rest } = cur;

    return [...pre, rest, ...children];
  }, []);

  // delete the duplicate categories
  const uniqueIds = new Set(flattenCategories.map(({ id }) => id));

  const uniqueCategories = [...uniqueIds].map(id => {
    const category = flattenCategories.find(({ id: categoryId }) => categoryId === id);

    return category;
  });

  return uniqueCategories;
};

const Detail = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  const { uid } = useParams();

  // getting the item for the detail page
  const GET_CATEGORY_QUERY = gql`
  query getOneCategory (
    $uid: String!
  ) {
      getCategory (
        getOneCategoryInput: {
            uid: $uid
        }
      ) {
          id
          uid
          name
          parent {
            id
            uid
            name
          }
      }
  }
`;
  const {
    loading: categoryQueryLoading,
    error: categoryQueryError,
    data: categoryQueryData,
  } = useQuery(GET_CATEGORY_QUERY, {
    variables: {
      uid,
    },
  });

  // define the state
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [invalidName, setInvalidName] = useState(false);

  const [parentUid, setParentUid] = useState("");

  const [message, setMessage] = useState(undefined);

  // check if the user is logged in
  // if not, redirect to login page
  // and set the variables to the state
  useEffect(() => {
    if (!user) {
      return navigate("/");
    }

    if (categoryQueryData) {
      const { getCategory: { name, parent } } = categoryQueryData;

      setName(name);
      setParentUid(parent ? parent.uid : undefined);
    }
  }, [categoryQueryData, navigate, uid, user]);

  // getting the items that could be used as parents
  const GET_PARENT_CATEGORIES_QUERY = gql`
  query getAllCategories (
    $limit: Int,
    $skip: Int,
    $q: String,
    $onlyRoots: Boolean
  ) {
      getAllCategories (
          getAllCategoriesInput: {
              limit: $limit,
              skip: $skip,
              q: $q,
              onlyRoots: $onlyRoots
          }
      ) {
          id
          uid
          name
          children {
            id
            uid
            name
          }
      }
  }
`;

  const {
    loading: categoriesQueryLoading,
    error: categoriesQueryError,
    data: categoriesQueryData,
  } = useQuery(GET_PARENT_CATEGORIES_QUERY, {
    variables: {
      onlyRoots: true,
    },
  });

  // format the items to be used in the select
  let parentCategories = [];
  if (categoriesQueryData) {
    parentCategories = getCategoriesItems(categoriesQueryData.getAllCategories);
  }

  // updating the current item
  const UPDATE_CATEGORY_MUTATION = gql`
  mutation updateCategory (
    $uid: String!
    $name: String,
    $parentUid: String
  ) {
      updateCategory(
        getOneCategoryInput: {
            uid: $uid
        },
        updateCategoryInput: {
            name: $name,
            parentUid: $parentUid
        }
      ) {
        id
        name
        parent {
            id
            name
        }
      }
  }
`;

  const [
    updateCategory,
    {
      data: updateCategoryData,
      loading: updateCategoryLoading,
      error: updateCategoryError
    }
  ] = useMutation(UPDATE_CATEGORY_MUTATION);

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    if (!name) {
      setInvalidName(true);
      return;
    }
    setInvalidName(false);

    await updateCategory({ variables: { uid, name, parentUid } });

    setMessage("successfully updated category");
  };

  // deleting the current item
  const DETELE_CATEGORY_MUTATION = gql`
  mutation deleteCategory (
      $uid: String!
  ) {
      deleteCategory (
          getOneCategoryInput: {
              uid: $uid
          }
      ) {
          id
      }
  }
`;

  const [
    deleteCategory,
    {
      data: deleteCategoryData,
      loading: deleteCategoryLoading,
      error: deleteCategoryError
    }
  ] = useMutation(DETELE_CATEGORY_MUTATION);

  const handleDeleteClick = async (event) => {
    event.preventDefault();

    setDeleting(false);

    await deleteCategory({ variables: { uid } });

    setMessage("successfully deleted category");
  }

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter category_detail-page">
      <div className="bx--row category_detail-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <span>Handle a Category</span>

          {
            (categoriesQueryError || categoryQueryError) &&
            <InlineNotification
              kind="error"
              iconDescription="close button"
              subtitle={<span>{categoriesQueryError?.message || categoryQueryError?.message}</span>}
              title="Uups!"
              style={{ maxWidth: "100%" }}
            />
          }

          {
            (!categoriesQueryError && !categoryQueryError) &&
            <Form onSubmit={handleUpdateSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                {
                  categoriesQueryLoading ?
                    (<SelectSkeleton />)
                    :
                    <Select
                      id="parent-select"
                      invalid={false}
                      invalidText="A valid value is required"
                      labelText="Parent Category"
                      onChange={(event) => setParentUid(event.target.value)}
                      value={parentUid}
                    >
                      <SelectItem
                        text="Select..."
                        value=""
                      />
                      {
                        parentCategories.map(({ id, name, uid }) => (
                          <SelectItem
                            key={id}
                            text={name}
                            value={uid}
                          />
                        ))
                      }
                    </Select>
                }
              </div>

              <div style={{ marginBottom: "1rem" }}>
                {
                  categoryQueryLoading ?
                    (<TextInputSkeleton />)
                    :
                    <TextInput
                      id="name-text"
                      labelText="Name"
                      invalid={invalidName}
                      invalidText="A valid value is required"
                      onChange={(event) => setName(event.target.value)}
                      value={name}
                    />
                }
              </div>

              <div>
                {
                  (updateCategoryError || deleteCategoryError) &&
                  <InlineNotification
                    kind="error"
                    iconDescription="close button"
                    subtitle={<span>{updateCategoryError?.message || deleteCategoryError?.message}</span>}
                    title="Uups!"
                  />
                }
              </div>

              <div>
                {
                  (updateCategoryData || deleteCategoryData) &&
                  <InlineNotification
                    kind="success"
                    iconDescription="close button"
                    subtitle={<span>{message}</span>}
                    title="Success!"
                    onClose={() => setMessage(undefined)}
                  />
                }
              </div>

              <div style={{ marginBottom: "1rem" }}>
                {
                  (categoryQueryLoading || updateCategoryLoading) ?
                    (<ButtonSkeleton className="btn-block" size="field" />)
                    :
                    <Button className="btn-block" type="submit" size="field">Update</Button>
                }
              </div>

              <div>
                {
                  deleting &&

                  <InlineNotification
                    kind="warning"
                    iconDescription="close button"
                    subtitle={<span>are you sure?</span>}
                    title="Alert!"
                    onClose={() => setDeleting(false)}
                    actions={
                      <NotificationActionButton onClick={handleDeleteClick}>
                        Cotinue
                      </NotificationActionButton>
                    }
                  />
                }
              </div>

              <div style={{ marginBottom: "1rem" }}>
                {
                  (categoryQueryLoading || deleteCategoryLoading) ?
                    (<ButtonSkeleton className="btn-block" size="field" />)
                    :
                    <Button kind="danger" className="btn-block" size="field" onClick={() => setDeleting(true)}>Delete</Button>
                }
              </div>
            </Form>
          }
        </div>
      </div>
    </div>
  );
}

export default Detail;
