import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  DataTableSkeleton,
  Pagination,
  InlineNotification,
} from "carbon-components-react";
import { gql, useQuery } from "@apollo/client";

// import httpRouteService from "../../http-route.service";

import { GlobalContext } from "../../../../App.jsx";

import AppDataTable from "../../../../components/AppDataTable";

const headers = [
  {
    key: "id",
    header: "ID",
  },
  {
    key: "name",
    header: "Name",
  },
  {
    key: "slug",
    header: "Slug",
  },
  {
    key: "parentId",
    header: "Parent ID",
  },
  {
    key: "parent",
    header: "Parent",
  },
  {
    key: "actions",
    header: "Actions",
  }
];

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
          slug
          parent {
              id
              uid
              name
          }
      }
  }
`;

const List = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  const ActionLinks = ({ uid }) => (
    <ul style={{ display: "flex" }}>
      <li>
        <Link to={`/categories/${uid}`}>Detail</Link>
      </li>
      <li>
        <span>&nbsp;|&nbsp;</span>
        <Link to={`/categories/${uid}/images`}>Extra</Link>
      </li>
    </ul>
  );

  const getRowItems = rows =>
    rows.map(row => ({
      ...row,
      id: "" + row.id,
      key: row.id,
      parentId: row.parent ? row.parent.id : undefined,
      parent: row.parent ? row.parent.name : undefined,
      actions: <ActionLinks uid={row.uid} />,
    }));

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [navigate, user]);

  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);

  const { loading, error, data } = useQuery(GET_CATEGORIES_QUERY);

  let rows = [];

  if (data) {
    rows = getRowItems(data.getAllCategories);
  }

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter http_route_list-page">
      <div className="bx--row http_route_list-page__r1">
        <div className="bx--col-lg-16">
          <div style={{ marginBottom: "1rem" }}>
            <Link to='/categories/create'>Create</Link>
          </div>
          {
            error &&
            <InlineNotification
              kind="error"
              iconDescription="close button"
              subtitle={<span>{error.message}</span>}
              title="Uups!"
              style={{ maxWidth: "100%" }}
            />
          }

          {
            loading &&
            <DataTableSkeleton
              columnCount={headers.length + 1}
              rowCount={10}
              headers={headers}
            />
          }

          {
            !error && !loading &&
            <>
              <AppDataTable
                title={"Categories"}
                description={"List of Categories"}
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