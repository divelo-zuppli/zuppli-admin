import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Button,
  Select,
  SelectItem,
  TextInput,
  InlineNotification,
  SelectSkeleton,
  ButtonSkeleton,
} from "carbon-components-react";
import { gql, useQuery, useMutation } from "@apollo/client";

import { GlobalContext } from "../../../../App.jsx";

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

const CREATE_CATEGORY_MUTATION = gql`
  mutation createCategory (
    $name: String!,
    $parentUid: String
  ) {
      createCategory (
          createCategoryInput: {
            name: $name,
            parentUid: $parentUid
          }
      ) {
          id
          uid
          name
          slug
          createdAt
          updatedAt
      }
  }
`;

const Create = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [navigate, user]);

  const [parentUid, setParentUid] = useState("");

  const [name, setName] = useState("");
  const [invalidName, setInvalidName] = useState(false);

  const [message, setMessage] = useState(undefined);

  const {
    loading: categoriesQueryLoading,
    error: categoriesQueryError,
    data: categoriesQueryData,
  } = useQuery(GET_PARENT_CATEGORIES_QUERY, {
    variables: {
      onlyRoots: true,
    },
  });

  let parentCategories = [];
  if (categoriesQueryData) {
    parentCategories = getCategoriesItems(categoriesQueryData.getAllCategories);
  }

  const [
    createCategory,
    {
      data: createCategoryData,
      loading: createLoading,
      error: createCategoryError
    }
  ] = useMutation(CREATE_CATEGORY_MUTATION);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (!name) {
      setInvalidName(true);
      return;
    }
    setInvalidName(false);

    await createCategory({ variables: { name, parentUid } });

    setMessage("successfully created category");
  };

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter category_create-page">
      <div className="bx--row category_create-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <div style={{ marginBottom: "1rem" }}>
            <Link to="/categories/">Back</Link>
          </div>
          <span>Create a Category</span>

          {
            categoriesQueryError &&
            <InlineNotification
              kind="error"
              iconDescription="close button"
              subtitle={<span>{categoriesQueryError.message}</span>}
              title="Uups!"
              style={{ maxWidth: "100%" }}
            />
          }

          {
            !categoriesQueryError &&
            <Form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                {
                  categoriesQueryLoading ?
                    <SelectSkeleton /> :
                    <Select
                      defaultValue=""
                      id="parent-select"
                      invalid={false}
                      invalidText="A valid value is required"
                      labelText="Parent Category"
                      onChange={(event) => setParentUid(event.target.value)}
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
                <TextInput
                  id="name-text"
                  labelText="Name"
                  invalid={invalidName}
                  invalidText="A valid value is required"
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              {
                createCategoryError &&
                <InlineNotification
                  kind="error"
                  iconDescription="close button"
                  subtitle={<span>{createCategoryError.message}</span>}
                  title="Uups!"
                />
              }

              {
                createCategoryData &&
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
                  createLoading ?
                    <ButtonSkeleton className="btn-block" /> :
                    <Button className="btn-block" type="submit" size="field">Send</Button>
                }
              </div>
            </Form>
          }
        </div>
      </div>
    </div>
  );
}

export default Create;
