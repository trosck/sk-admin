import * as React from "react";
import { AuthPage as MUIAuthPage, type AuthProps } from "@refinedev/mui";
import { Link } from "react-router";
import Box from "@mui/material/Box";

const renderAuthContent = (content: React.ReactNode) => {
  return (
    <div>
      <Link to="/"></Link>
      {content}
    </div>
  );
};

export const AuthPage: React.FC<AuthProps> = ({ type, formProps }) => {
  return (
    <MUIAuthPage
      type={type}
      renderContent={renderAuthContent}
      formProps={formProps}
    />
  );
};
