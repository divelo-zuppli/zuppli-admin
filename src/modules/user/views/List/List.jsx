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
    key: "fullName",
    header: "Full Name",
  },
  {
    key: "email",
    header: "Email",
  },
  {
    key: "phoneNumber",
    header: "Phone Number",
  },
  {
    key: "createdAt",
    header: "Created",
  },
  {
    key: "updatedAt",
    header: "Updated",
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
        <Link to={`/users/${uid}`}>Detail</Link>
      </li>
      <li>
        <span>&nbsp;|&nbsp;</span>
        <Link to={`/users/${uid}/images`}>Images</Link>
      </li>
    </ul>
  );

  const getRowItems = rows =>
    rows.map(row => ({
      ...row,
      id: "" + row.id,
      key: row.id,
      actions: <ActionLinks uid={row.uid} />,
    }));

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [navigate, user]);

  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);

  const GET_USERS_QUERY = gql`
    query getAllUsers (
        $limit: Int,
        $skip: Int,
        $q: String,
    ) {
      getAllUsers (
          getAllUsersInput: {
              limit: $limit,
              skip: $skip,
              q: $q
          }
      ) {
          id
          uid
          authUid
          email
          fullName
          phoneNumber
          createdAt
          updatedAt
      }
    }
  `;

  const {
    loading: getUsersLoading,
    error: getUsersError,
    data: getUsersData,
  } = useQuery(GET_USERS_QUERY);

  let rows = [];

  if (getUsersData) {
    rows = getRowItems(getUsersData.getAllUsers);
  }

  return (
    <div className="bx--grid bx--grid--full-width bx--grid--no-gutter user_list-page">
      <div className="bx--row reference_list-page__r1">
        <div className="bx--col-lg-16">
          <div style={{ marginBottom: "1rem" }}>
            <Link to='/users/create'>Create</Link>
          </div>
          {
            getUsersError &&
            <InlineNotification
              kind="error"
              iconDescription="close button"
              subtitle={<span>{getUsersError.message}</span>}
              title="Uups!"
              style={{ maxWidth: "100%" }}
            />
          }

          {
            getUsersLoading &&
            <DataTableSkeleton
              columnCount={headers.length + 1}
              rowCount={10}
              headers={headers}
            />
          }

          {
            (!getUsersError && !getUsersLoading && getUsersData) &&
            <>
              <AppDataTable
                title={"Users"}
                description={"List of USers"}
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