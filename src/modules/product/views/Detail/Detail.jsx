import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Form,
  Button,
  Select,
  SelectItem,
  InlineNotification,
  SelectSkeleton,
  ButtonSkeleton,
  NotificationActionButton,
  NumberInput,
  NumberInputSkeleton,
} from "carbon-components-react";
import { gql, useQuery, useMutation } from "@apollo/client";

import { GlobalContext } from "../../../../App.jsx";

const Detail = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  const { uid } = useParams();

  // getting the item for the detail page
  const GET_PRODUCT_QUERY = gql`
    query getOneProduct (
        $uid: String!
    ) {
        getProduct (
          getOneProductInput: {
              uid: $uid
          }
        ) {
          id
          uid
          costPrice
          sellPrice
          salePrice
          stock
          reference {
              uid
          }
        }
    }
  `;

  const {
    loading: productQueryLoading,
    error: productQueryError,
    data: productQueryData,
  } = useQuery(GET_PRODUCT_QUERY, {
    variables: {
      uid,
    },
  });

  // define the state
  const [deleting, setDeleting] = useState(false);

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

  // check if the user is logged in
  // if not, redirect to login page
  // and set the variables to the state
  useEffect(() => {
    if (!user) {
      return navigate("/");
    }

    if (productQueryData) {
      const {
        getProduct: {
          reference,
          costPrice,
          sellPrice,
          salePrice,
          stock,
        }
      } = productQueryData;

      setReferenceUid(reference ? reference.uid : undefined);
      setCostPrice(costPrice);
      setSellPrice(sellPrice);
      setSalePrice(salePrice || undefined);
      setStock(stock);

    }
  }, [productQueryData, navigate, uid, user]);

  // getting the items that could be used as parents
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

  // updating the current item
  const UPDATE_PRODUCT_MUTATION = gql`
    mutation updateProduct (
      $uid: String!,
      $costPrice: Float,
      $sellPrice: Float,
      $salePrice: Float,
      $stock: Int,
      $referenceUid: String
    ) {
        updateProduct(
          getOneProductInput: {
              uid: $uid
          },
          updateProductInput: {
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
    updateProduct,
    {
      data: updateProductData,
      loading: updateProductLoading,
      error: updateProductError
    }
  ] = useMutation(UPDATE_PRODUCT_MUTATION);

  const handleUpdateSubmit = async (event) => {
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

    await updateProduct({
      variables: {
        uid,
        costPrice: parseFloat(costPrice),
        sellPrice: parseFloat(sellPrice),
        salePrice: parseFloat(salePrice),
        stock: parseInt(stock),
        referenceUid,
      }
    })

    setMessage("successfully updated product");
  };

  // deleting the current item
  const DETELE_PRODUCT_MUTATION = gql`
    mutation deleteReference (
        $uid: String!
    ) {
        deleteProduct (
          getOneProductInput: {
              uid: $uid
          }
        ) {
          id
        }
    }
  `;

  const [
    deleteProduct,
    {
      data: deleteProductData,
      loading: deleteProductLoading,
      error: deleteProductError
    }
  ] = useMutation(DETELE_PRODUCT_MUTATION);

  const handleDeleteClick = async (event) => {
    event.preventDefault();

    setDeleting(false);

    await deleteProduct({ variables: { uid } });

    setMessage("successfully deleted product");
  }

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter product_detail-page">
      <div className="bx--row product_detail-page__r1">
        <div className="bx--offset-lg-5 bx--col-lg-6 bx--col-md-8 bx--col-sm-4">
          <div style={{ marginBottom: "1rem" }}>
            <Link to="/products">Back</Link>
          </div>

          <span>Handle a Product</span>

          {
            (referencesQueryError || productQueryError) &&
            <InlineNotification
              kind="error"
              iconDescription="close button"
              subtitle={<span>{referencesQueryError?.message || productQueryError?.message}</span>}
              title="Uups!"
              style={{ maxWidth: "100%" }}
            />
          }

          {
            (referencesQueryData && productQueryData) &&
            <Form onSubmit={handleUpdateSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                {
                  referencesQueryLoading ?
                    (<SelectSkeleton />)
                    :
                    <Select
                      id="referenceUid-select"
                      invalid={invalidReferenceUid}
                      invalidText="A valid value is required"
                      labelText="Reference"
                      onChange={(event) => setReferenceUid(event.target.value)}
                      value={referenceUid}
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
                {
                  productQueryLoading ?
                    <NumberInputSkeleton />
                    :
                    <NumberInput
                      id="costPrice-number"
                      label="Cost price"
                      invalid={invalidCostPrice}
                      invalidText="A valid value is required"
                      onChange={(event) => setCostPrice(event.target.value)}
                      value={costPrice}
                    />
                }
              </div>

              <div style={{ marginBottom: "1rem" }}>
                {
                  productQueryLoading ?
                    <NumberInputSkeleton />
                    :
                    <NumberInput
                      id="sellPrice-number"
                      label="Sell price"
                      invalid={invalidSellPrice}
                      invalidText="A valid value is required"
                      onChange={(event) => setSellPrice(event.target.value)}
                      value={sellPrice}
                    />
                }
              </div>
              
              <div style={{ marginBottom: "1rem" }}>
                {
                  productQueryLoading ?
                    <NumberInputSkeleton />
                    :
                    <NumberInput
                      id="salePrice-number"
                      label="Sale price"
                      onChange={(event) => setSalePrice(event.target.value)}
                      value={salePrice}
                    />
                }
              </div>

              <div style={{ marginBottom: "1rem" }}>
                {
                  productQueryLoading ?
                    <NumberInputSkeleton />
                    :
                    <NumberInput
                      id="stock-number"
                      label="Stock"
                      invalid={invalidStock}
                      invalidText="A valid value is required"
                      onChange={(event) => setStock(event.target.value)}
                      value={stock}
                    />
                }
              </div>

              <div>
                {
                  (updateProductError || deleteProductError) &&
                  <InlineNotification
                    kind="error"
                    iconDescription="close button"
                    subtitle={<span>{updateProductError?.message || deleteProductError?.message}</span>}
                    title="Uups!"
                  />
                }
              </div>

              <div>
                {
                  (updateProductData || deleteProductData) &&
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
                  (productQueryLoading || updateProductLoading) ?
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
                  (productQueryLoading || deleteProductLoading) ?
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
