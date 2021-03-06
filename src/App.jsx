import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Content } from "carbon-components-react";

import "./app.scss";

import firebaseApp from "./firebase";

import Header from "./components/AppHeader";

import Login from "./modules/auth/views/Login";
import OTP from "./modules/auth/views/OTP";
import Home from "./modules/main/views/Home";

import ListUsers from "./modules/user/views/List";
import CreateUser from "./modules/user/views/Create";

import ListCategories from "./modules/category/views/List";
import CreateCategory from "./modules/category/views/Create";
import CategoryDetail from "./modules/category/views/Detail";
import CategoryImages from "./modules/category/views/Images";
import CreateCategoryImage from "./modules/category/views/CreateImage";

import ListReferences from "./modules/reference/views/List";
import CreateReference from "./modules/reference/views/Create";
import ReferenceDetail from "./modules/reference/views/Detail";
import ReferenceImages from "./modules/reference/views/Images";
import CreateReferenceImage from "./modules/reference/views/CreateImage";

import ListProducts from "./modules/product/views/List";
import CreateProduct from "./modules/product/views/Create";
import ProductDetail from "./modules/product/views/Detail";

export const GlobalContext = React.createContext();

const App = () => {
  const [user, setUser] = useState({});

  const auth = getAuth(firebaseApp);

  onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return (
    <div className="App">
      <GlobalContext.Provider value={{ user }}>
        <Header />
        <Content>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/otp" element={<OTP />} />
            <Route path="/home" element={<Home user={user} />} />

            <Route path="/users" element={<ListUsers />} />
            <Route path="/users/create" element={<CreateUser />} />

            <Route path="/categories" element={<ListCategories />} />
            <Route path="/categories/create" element={<CreateCategory />} />
            <Route path="/categories/:uid" element={<CategoryDetail />} />
            <Route path="/categories/:uid/images" element={<CategoryImages />} />
            <Route path="/categories/:uid/images/create" element={<CreateCategoryImage />} />

            <Route path="/references" element={<ListReferences />} />
            <Route path="/references/create" element={<CreateReference />} />
            <Route path="/references/:uid" element={<ReferenceDetail />} />
            <Route path="/references/:uid/images" element={<ReferenceImages />} />
            <Route path="/references/:uid/images/create" element={<CreateReferenceImage />} />

            <Route path="/products" element={<ListProducts />} />
            <Route path="/products/create" element={<CreateProduct />} />
            <Route path="/products/:uid" element={<ProductDetail />} />
          </Routes>
        </Content>
      </GlobalContext.Provider>
    </div>
  );
}

export default App;