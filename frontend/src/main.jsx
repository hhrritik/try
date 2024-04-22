import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme.js";
import CodeEditor from "./components/CodeEditor.jsx";
import { Shell } from "./components/shell.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";


const routes = [
  {
    path: "/",
    element: <CodeEditor />,
  },
  {
    path: "/bash",
    element: <Shell />,
  },
];
const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);
