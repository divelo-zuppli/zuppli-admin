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
  TextArea,
  NumberInput,
} from "carbon-components-react";
import { gql, useQuery, useMutation } from "@apollo/client";

import { GlobalContext } from "../../../../App.jsx";

const Create = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [navigate, user]);

  const [categoryUid, setCategoryUid] = useState("");
  const [invalidCategoryUid, setInvalidCategoryUid] = useState(false);

  const [sku, setSku] = useState("");
  const [invalidSku, setInvalidSku] = useState(false);

  const [name, setName] = useState("");
  const [invalidName, setInvalidName] = useState(false);

  const [packaging, setPackaging] = useState("");

  const [measurementUnit, setMeasurementUnit] = useState("");

  const [measurementValue, setMeasurementValue] = useState(undefined)

  const [description, setDescription] = useState("");

  const [message, setMessage] = useState(undefined);

  const GET_CATEGORIES_QUERY = gql`
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
      }
  }
  `;
  const {
    loading: categoriesQueryLoading,
    error: categoriesQueryError,
    data: categoriesQueryData,
  } = useQuery(GET_CATEGORIES_QUERY);

  let categories = [];
  if (categoriesQueryData) {
    categories = categoriesQueryData.getAllCategories;
  }

  const CREATE_REFERENCE_MUTATION = gql`
    mutation createReference (
      $sku: String!,
      $name: String!,
      $description: String
      $categoryUid: String!
      $packaging: String
      $measurementUnit: String
      $measurementValue: Float
    ) {
        createReference (
            createReferenceInput: {
                sku: $sku,
                name: $name,
                description: $description,
                categoryUid: $categoryUid,
                packaging: $packaging,
                measurementUnit: $measurementUnit,
                measurementValue: $measurementValue
            }
        ) {
            uid
        }
    }
  `;

  const [
    createReference,
    {
      data: createReferenceData,
      loading: createReferenceLoading,
      error: createReferenceError
    }
  ] = useMutation(CREATE_REFERENCE_MUTATION);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (!categoryUid) {
      setInvalidCategoryUid(true);
      return;
    }
    setInvalidCategoryUid(false);

    if (!sku) {
      setInvalidSku(true);
      return;
    }
    setInvalidSku(false);

    if (!name) {
      setInvalidName(true);
      return;
    }
    setInvalidName(false);

    await createReference({
      variables: {
        categoryUid,
        sku,
        name,
        description,
        packaging,
        measurementUnit,
        measurementValue,
      }
    });

    setMessage("successfully created reference");
  };

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter category_create-page">
      <div className="bx--row category_create-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <div style={{ marginBottom: "1rem" }}>
            <Link to="/references">Back</Link>
          </div>

          <span>Create a Reference</span>

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
                      id="categoryUid-select"
                      invalid={invalidCategoryUid}
                      invalidText="A valid value is required"
                      labelText="Category"
                      onChange={(event) => setCategoryUid(event.target.value)}
                    >
                      <SelectItem
                        text="Select..."
                        value=""
                      />
                      {
                        categories.map(({ id, name, uid }) => (
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
                  id="sku-text"
                  labelText="SKU"
                  invalid={invalidSku}
                  invalidText="A valid value is required"
                  onChange={(event) => setSku(event.target.value)}
                />
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

              <div style={{ marginBottom: "1rem" }}>
                <Select
                  defaultValue=""
                  id="packaging-select"
                  invalid={invalidCategoryUid}
                  invalidText="A valid value is required"
                  labelText="Packaging"
                  onChange={(event) => setPackaging(event.target.value)}
                >
                  <SelectItem
                    text="Select..."
                    value=""
                  />
                  <SelectItem
                    text="Unidad"
                    value="Unidad"
                  />
                  <SelectItem
                    text="Display"
                    value="Display"
                  />
                  <SelectItem
                    text="Caja"
                    value="Caja"
                  />
                </Select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <Select
                  defaultValue=""
                  id="measurementUnit-select"
                  invalid={invalidCategoryUid}
                  invalidText="A valid value is required"
                  labelText="Measurement Unit"
                  onChange={(event) => setMeasurementUnit(event.target.value)}
                >
                  <SelectItem
                    text="Select..."
                    value=""
                  />
                  <SelectItem
                    text="Kilogramo"
                    value="kg"
                  />
                  <SelectItem
                    text="Gramo"
                    value="gr"
                  />
                  <SelectItem
                    text="Mililitro"
                    value="ml"
                  />
                  <SelectItem
                    text="Litro"
                    value="lt"
                  />
                </Select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <NumberInput
                  id="measurementValue-text"
                  labelText="Measurement Value"
                  invalid={invalidName}
                  invalidText="A valid value is required"
                  onChange={(event) => setMeasurementValue(event.target.value)}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <TextArea
                  id="description-text"
                  labelText="Description"
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              {
                createReferenceError &&
                <InlineNotification
                  kind="error"
                  iconDescription="close button"
                  subtitle={<span>{createReferenceError.message}</span>}
                  title="Uups!"
                />
              }

              {
                createReferenceData &&
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
                  createReferenceLoading ?
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
