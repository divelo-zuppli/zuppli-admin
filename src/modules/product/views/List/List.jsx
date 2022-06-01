import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  DataTableSkeleton,
  Pagination,
  InlineNotification,
} from "carbon-components-react";
import { gql, useQuery } from "@apollo/client";

import { GlobalContext } from "../../../../App.jsx";

import AppDataTable from "../../../../components/AppDataTable";

const headers = [
  {
    key: "id",
    header: "ID",
  },
  {
    key: "costPrice",
    header: "Cost",
  },
  {
    key: "sellPrice",
    header: "Sell",
  },
  {
    key: "salePrice",
    header: "Sale",
  },
  {
    key: "referenceName",
    header: "Reference",
  },
  {
    key: "actions",
    header: "Actions",
  }
];

const List = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  const ActionLinks = ({ uid }) => (
    <ul style={{ display: "flex" }}>
      <li>
        <Link to={`/products/${uid}`}>Detail</Link>
      </li>
      <li>
        <span>&nbsp;|&nbsp;</span>
        <Link to={`/products/${uid}/images`}>Images</Link>
      </li>
    </ul>
  );

  const getRowItems = rows =>
    rows.map(row => ({
      ...row,
      id: "" + row.id,
      key: row.id,
      referenceName: row.reference ? row.reference.name : undefined,
      actions: <ActionLinks uid={row.uid} />,
    }));

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [navigate, user]);

  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);

  const GET_PRODUCTS_QUERY = gql`
    query getAllReferences (
        $limit: Int,
        $skip: Int,
    ) {
        getAllProducts (
          getAllProductsInput: {
            limit: $limit,
            skip: $skip
            }
        ) {
            id
            uid
            costPrice
            sellPrice
            salePrice
            reference {
                id
                uid
                name
            }
          }
      }
`;

  const {
    loading: productsQueryLoading,
    error: productsQueryError,
    data: productsQueryData,
  } = useQuery(GET_PRODUCTS_QUERY);

  let rows = [];

  if (productsQueryData) {
    rows = getRowItems(productsQueryData.getAllProducts);
  }

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter reference_list-page">
      <div className="bx--row reference_list-page__r1">
        <div className="bx--col-lg-16">
          <div style={{ marginBottom: "1rem" }}>
            <Link to='/prodcuts/create'>Create</Link>
          </div>
          {
            productsQueryError &&
            <InlineNotification
              kind="error"
              iconDescription="close button"
              subtitle={<span>{productsQueryError.message}</span>}
              title="Uups!"
              style={{ maxWidth: "100%" }}
            />
          }

          {
            productsQueryLoading &&
            <DataTableSkeleton
              columnCount={3}
              rowCount={5}
              headers={headers}
            />
          }

          {
            (!productsQueryError && !productsQueryLoading && productsQueryData) &&
            <>
              <AppDataTable
                title={"Products"}
                description={"List of Products"}
                headers={headers}
                rows={rows.slice(
                  firstRowIndex,
                  firstRowIndex + currentPageSize
                )} /><Pagination
                totalItems={rows.length}
                backwardText="Previous page"
                forwardText="Next page"
                pageSize={currentPageSize}
                pageSizes={[5, 10, 15, 25]}
                itemsPerPageText="Items per page"
                onChange={({ page, pageSize }) => {
                  if (pageSize !== currentPageSize) {
                    setCurrentPageSize(pageSize);
                  }
                  setFirstRowIndex(pageSize * (page - 1));
                }} />
            </>
          }
        </div>
      </div>
    </div>
  );
};

export default List;