import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import React from "react";

import "./App.css";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";
import { Suspense } from "react";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";

const Users = React.lazy(() => import("./user/pages/Users"));
const NewPlace = React.lazy(() => import("./places/pages/NewPlace"));
const UserPlaces = React.lazy(() => import("./places/pages/UserPlaces"));
const UpdatePlace = React.lazy(() => import("./places/pages/UpdatePlace"));
const Auth = React.lazy(() => import("./user/pages/Auth"));

function App() {
  const { token, login, logout, userId } = useAuth();
  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path={"/"} exact>
          <Users />
        </Route>
        <Route path={"/:userId/places"} exact>
          <UserPlaces />
        </Route>
        <Route path={"/places/new"} exact>
          <NewPlace />
        </Route>
        <Route path={"/places/:placeId"}>
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path={"/"} exact>
          <Users />
        </Route>
        <Route path={"/:userId/places"} exact>
          <UserPlaces />
        </Route>
        <Route path={"/auth"} exact>
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId,
        login,
        logout,
      }}
    >
      <BrowserRouter>
        <MainNavigation />
        <main>
          <Suspense
            fallback={
              <div className="center">
                <LoadingSpinner />
              </div>
            }
          >
            {routes}
          </Suspense>
        </main>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
