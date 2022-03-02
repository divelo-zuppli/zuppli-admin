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
    key: "sku",
    header: "SKU",
  },
  {
    key: "name",
    header: "Name",
  },
  {
    key: "categoryName",
    header: "Category",
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
        <Link to={`/references/${uid}`}>Detail</Link>
      </li>
      <li>
        <span>&nbsp;|&nbsp;</span>
        <Link to={`/references/${uid}/images`}>Images</Link>
      </li>
    </ul>
  );

  const getRowItems = rows =>
    rows.map(row => ({
      ...row,
      id: "" + row.id,
      key: row.id,
      categoryName: row.category ? row.category.name : undefined,
      actions: <ActionLinks uid={row.uid} />,
    }));

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [navigate, user]);

  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);

  const GET_REFERENCES_QUERY = gql`
  query getAllReferences (
      $limit: Int,
      $skip: Int,
      $q: String,
  ) {
      getAllReferences (
          getAllReferencesInput: {
              limit: $limit,
              skip: $skip,
              q: $q
          }
      ) {
          id
          uid
          sku
          name
          description
          createdAt
          updatedAt
          category {
              uid
              name
          }
      }
  }
`;

  const {
    loading: referencesLoading,
    error: referencesError,
    data: referencesData,
  } = useQuery(GET_REFERENCES_QUERY);

  let rows = [];

  if (referencesData) {
    rows = getRowItems(referencesData.getAllReferences);
  }

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter reference_list-page">
      <div className="bx--row reference_list-page__r1">
        <div className="bx--col-lg-16">
          <div style={{ marginBottom: "1rem" }}>
            <Link to='/references/create'>Create</Link>
          </div>
          {
            referencesError &&
            <InlineNotification
              kind="error"
              iconDescription="close button"
              subtitle={<span>{referencesError.message}</span>}
              title="Uups!"
              style={{ maxWidth: "100%" }}
            />
          }

          {
            referencesLoading &&
            <DataTableSkeleton
              columnCount={headers.length + 1}
              rowCount={10}
              headers={headers}
            />
          }

          {
            (!referencesError && !referencesLoading && referencesData) &&
            <>
              <AppDataTable
                title={"References"}
                description={"List of References"}
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