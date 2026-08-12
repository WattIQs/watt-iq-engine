/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from "./routes/__root";
import { Route as IndexRouteImport } from "./routes/index";
import { Route as AuthRouteImport } from "./routes/auth";
import { Route as AuthVerifyRouteImport } from "./routes/auth.verify";

const IndexRoute = IndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRouteImport,
} as any);

const AuthRoute = AuthRouteImport.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => rootRouteImport,
} as any);

const AuthVerifyRoute = AuthVerifyRouteImport.update({
  id: "/auth/verify",
  path: "/auth/verify",
  getParentRoute: () => rootRouteImport,
} as any);

export interface FileRoutesByFullPath {
  "/": typeof IndexRoute;
  "/auth": typeof AuthRoute;
  "/auth/verify": typeof AuthVerifyRoute;
}

export interface FileRoutesByTo {
  "/": typeof IndexRoute;
  "/auth": typeof AuthRoute;
  "/auth/verify": typeof AuthVerifyRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRouteImport;
  "/": typeof IndexRoute;
  "/auth": typeof AuthRoute;
  "/auth/verify": typeof AuthVerifyRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths: "/" | "/auth" | "/auth/verify";
  fileRoutesByTo: FileRoutesByTo;
  to: "/" | "/auth" | "/auth/verify";
  id: "__root__" | "/" | "/auth" | "/auth/verify";
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  AuthRoute: typeof AuthRoute;
  AuthVerifyRoute: typeof AuthVerifyRoute;
}

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof IndexRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/auth": {
      id: "/auth";
      path: "/auth";
      fullPath: "/auth";
      preLoaderRoute: typeof AuthRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/auth/verify": {
      id: "/auth/verify";
      path: "/auth/verify";
      fullPath: "/auth/verify";
      preLoaderRoute: typeof AuthVerifyRouteImport;
      parentRoute: typeof rootRouteImport;
    };
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute,
  AuthRoute,
  AuthVerifyRoute,
};

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();
