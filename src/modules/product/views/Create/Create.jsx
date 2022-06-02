import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Button,
  Select,
  SelectItem,
  InlineNotification,
  SelectSkeleton,
  ButtonSkeleton,
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

  const [referenceUid, setReferenceUid] = useState("");
  const [invalidReferenceUid, setInvalidReferenceUid] = useState(false);

  const [costPrice, setCostPrice] = useState(undefined);
  const [invalidCostPrice, setInvalidCostPrice] = useState(false);

  const [sellPrice, setSellPrice] = useState(undefined);
  const [invalidSellPrice, setInvalidSellPrice] = useState(false);

  const [salePrice, setSalePrice] = useState(undefined);

  const [stock, setStock] = useState(undefined);
  const [invalidStock, setInvalidStock] = useState(false);

  const [message, setMessage] = useState("");

  const GET_REFERENCES_QUERY = gql`
    query getAllReferences (
      $limit: Int,
      $skip: Int,
    ) {
        getAllReferences (
          getAllReferencesInput: {
              limit: $limit,
              skip: $skip,
          }
        ) {
            id
            uid
            sku
            name
        }
    }
  `;

  const {
    loading: referencesQueryLoading,
    error: referencesQueryError,
    data: referencesQueryData,
  } = useQuery(GET_REFERENCES_QUERY);

  let references = [];
  if (referencesQueryData) {
    references = referencesQueryData.getAllReferences;
  }

  const CREATE_PRODUCT_MUTATION = gql`
    mutation createProduct (
      $costPrice: Float!,
      $sellPrice: Float!,
      $salePrice: Float,
      $stock: Int!,
      $referenceUid: String!
    ) {
        createProduct (
          createProductInput: {
            costPrice: $costPrice,
            sellPrice: $sellPrice,
            salePrice: $salePrice,
            stock: $stock,
            referenceUid: $referenceUid
          }
        ) {
            uid
        }
    }
  `;

  const [
    createProduct,
    {
      data: createProductData,
      loading: createProductLoading,
      error: createProductError
    }
  ] = useMutation(CREATE_PRODUCT_MUTATION);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (!referenceUid) {
      setInvalidReferenceUid(true);
      return;
    }
    setInvalidReferenceUid(false);

    if (!costPrice) {
      setInvalidCostPrice(true);
      return;
    }
    setInvalidCostPrice(false);

    if (!sellPrice) {
      setInvalidSellPrice(true);
      return;
    }
    setInvalidSellPrice(false);

    if (!stock) {
      setInvalidStock(true);
      return;
    }
    setInvalidStock(false);

    await createProduct({
      variables: {
        costPrice: parseFloat(costPrice),
        sellPrice: parseFloat(sellPrice),
        salePrice: parseFloat(salePrice),
        stock: parseInt(stock),
        referenceUid: referenceUid,
      },
    });

    setMessage("successfully created product");
  };

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter product_create-page">
      <div className="bx--row product_create-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <div style={{ marginBottom: "1rem" }}>
            <Link to="/products">Back</Link>
          </div>

          <span>Create a Reference</span>
          <>
            {            
              referencesQueryError &&
              <InlineNotification
                kind="error"
                iconDescription="close button"
                subtitle={<span>{referencesQueryError.message}</span>}
                title="Uups!"
                style={{ maxWidth: "100%" }}
              />            
            }
          </>

          {
            !referencesQueryError &&
            <Form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                {
                  referencesQueryLoading ?
                    <SelectSkeleton /> :
                    <Select
                      defaultValue=""
                      id="referenceUid-select"
                      invalid={invalidReferenceUid}
                      invalidText="A valid value is required"
                      labelText="Reference"
                      onChange={(event) => setReferenceUid(event.target.value)}
                    >
                      <SelectItem
                        text="Select..."
                        value=""
                      />
                      {
                        references.map(({ id, name, uid, sku }) => (
                          <SelectItem
                            key={id}
                            text={sku + " | " + name}
                            value={uid}
                          />
                        ))
                      }
                    </Select>
                }
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <NumberInput
                  id="costPrice-number"
                  label="Cost price"
                  invalid={invalidCostPrice}
                  invalidText="A valid value is required"
                  onChange={(event) => setCostPrice(event.target.value)}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <NumberInput
                  id="sellPrice-number"
                  label="Sell price"
                  invalid={invalidSellPrice}
                  invalidText="A valid value is required"
                  onChange={(event) => setSellPrice(event.target.value)}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <NumberInput
                  id="salePrice-number"
                  label="Sale price"
                  onChange={(event) => setSalePrice(event.target.value)}
                />
              </div>
            
              <div style={{ marginBottom: "1rem" }}>
                <NumberInput
                  id="stock-number"
                  label="Stock"
                  invalid={invalidStock}
                  invalidText="A valid value is required"
                  onChange={(event) => setStock(event.target.value)}
                />
              </div>

              {
                createProductError &&
                <InlineNotification
                  kind="error"
                  iconDescription="close button"
                  subtitle={<span>{createProductError.message}</span>}
                  title="Uups!"
                />
              }

              {
                createProductData &&
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
                  createProductLoading ?
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
