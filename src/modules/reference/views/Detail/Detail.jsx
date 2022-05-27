import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
  NotificationActionButton,
  TextArea,
  NumberInput,
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
  const GET_REFERENCE_QUERY = gql`
    query getOneReference (
        $uid: String!
    ) {
        getReference (
            getOneReferenceInput: {
                uid: $uid
            }
        ) {
            id
            uid
            sku
            name
            description
            packaging
            measurementUnit
            measurementValue
            category {
                uid
            }
        }
    }
  `;

  const {
    loading: referenceQueryLoading,
    error: referenceQueryError,
    data: referenceQueryData,
  } = useQuery(GET_REFERENCE_QUERY, {
    variables: {
      uid,
    },
  });

  // define the state
  const [deleting, setDeleting] = useState(false);

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

  const [message, setMessage] = useState("");

  // check if the user is logged in
  // if not, redirect to login page
  // and set the variables to the state
  useEffect(() => {
    if (!user) {
      return navigate("/");
    }

    if (referenceQueryData) {
      const { getReference: { sku, name, description, category, packaging, measurementUnit, measurementValue } } = referenceQueryData;

      setCategoryUid(category ? category.uid : undefined);
      setSku(sku);
      setName(name);
      setDescription(description);
      setPackaging(packaging);
      setMeasurementUnit(measurementUnit);
      setMeasurementValue(measurementValue);

    }
  }, [referenceQueryData, navigate, uid, user]);

  // getting the items that could be used as parents
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

  // format the items to be used in the select
  let parentCategories = [];
  if (categoriesQueryData) {
    parentCategories = getCategoriesItems(categoriesQueryData.getAllCategories);
  }

  // updating the current item
  const UPDATE_REFERENCE_MUTATION = gql`
    mutation updateReference (
      $uid: String!
      $sku: String,
      $name: String,
      $description: String
      $packaging: String,
      $measurementUnit: String,
      $measurementValue: Float,
      $categoryUid: String
    ) {
        updateReference(
            getOneReferenceInput: {
                uid: $uid
            },
            updateReferenceInput: {
                sku: $sku,
                name: $name,
                description: $description,
                categoryUid: $categoryUid
                packaging: $packaging,
                measurementUnit: $measurementUnit,
                measurementValue: $measurementValue
            }
        ) {
            id
        }
    }
  `;
  const [
    updateReference,
    {
      data: updateReferenceData,
      loading: updateReferenceLoading,
      error: updateReferenceError
    }
  ] = useMutation(UPDATE_REFERENCE_MUTATION);

  const handleUpdateSubmit = async (event) => {
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

    await updateReference({
      variables: {
        uid,
        sku,
        name,
        description,
        categoryUid,
        packaging,
        measurementUnit,
        measurementValue: measurementValue ? parseFloat(measurementValue) : undefined,
      }
    })

    setMessage("successfully updated reference");
  };

  // deleting the current item
  const DETELE_REFERENCE_MUTATION = gql`
    mutation deleteReference (
        $uid: String!
    ) {
        deleteReference (
            getOneReferenceInput: {
                uid: $uid
            }
        ) {
            id
        }
    }
  `;

  const [
    deleteReference,
    {
      data: deleteReferenceData,
      loading: deleteReferenceLoading,
      error: deleteReferenceError
    }
  ] = useMutation(DETELE_REFERENCE_MUTATION);

  const handleDeleteClick = async (event) => {
    event.preventDefault();

    setDeleting(false);

    await deleteReference({ variables: { uid } });

    setMessage("successfully deleted reference");
  }

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter category_detail-page">
      <div className="bx--row category_detail-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <div style={{ marginBottom: "1rem" }}>
            <Link to="/references">Back</Link>
          </div>

          <span>Handle a Reference</span>

          {
            (categoriesQueryError || referenceQueryError) &&
            <InlineNotification
              kind="error"
              iconDescription="close button"
              subtitle={<span>{categoriesQueryError?.message || referenceQueryError?.message}</span>}
              title="Uups!"
              style={{ maxWidth: "100%" }}
            />
          }

          {
            (categoriesQueryData && referenceQueryData) &&
            <Form onSubmit={handleUpdateSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                {
                  categoriesQueryLoading ?
                    (<SelectSkeleton />)
                    :
                    <Select
                      id="categoryUid-select"
                      invalid={invalidCategoryUid}
                      invalidText="A valid value is required"
                      labelText="Category"
                      onChange={(event) => setCategoryUid(event.target.value)}
                      value={categoryUid}
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
                  referenceQueryLoading ?
                    (<TextInputSkeleton />)
                    :
                    <TextInput
                      id="name-text"
                      labelText="Name"
                      invalid={invalidSku}
                      invalidText="A valid value is required"
                      onChange={(event) => setSku(event.target.value)}
                      value={sku}
                    />
                }
              </div>

              <div style={{ marginBottom: "1rem" }}>
                {
                  referenceQueryLoading ?
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

              <div style={{ marginBottom: "1rem" }}>
                <Select
                  defaultValue=""
                  id="packaging-select"
                  invalid={invalidCategoryUid}
                  invalidText="A valid value is required"
                  labelText="Packaging"
                  onChange={(event) => setPackaging(event.target.value)}
                  value={packaging}
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
                  value={measurementUnit}
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
                  label="Measurement Value"
                  invalid={invalidName}
                  invalidText="A valid value is required"
                  onChange={(event) => setMeasurementValue(event.target.value)}
                  value={measurementValue}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                {
                  referenceQueryLoading ?
                    (<TextInputSkeleton />)
                    :
                    <TextArea
                      id="description-text"
                      labelText="Description"
                      onChange={(event) => setDescription(event.target.value)}
                      value={description}
                    />
                }
              </div>

              <div>
                {
                  (updateReferenceError || deleteReferenceError) &&
                  <InlineNotification
                    kind="error"
                    iconDescription="close button"
                    subtitle={<span>{updateReferenceError?.message || deleteReferenceError?.message}</span>}
                    title="Uups!"
                  />
                }
              </div>

              <div>
                {
                  (updateReferenceData || deleteReferenceData) &&
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
                  (referenceQueryLoading || updateReferenceLoading) ?
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
                  (referenceQueryLoading || deleteReferenceLoading) ?
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
