import React from "react";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import { Card, RefineListView } from "../../components";
import { useTranslation } from "@refinedev/core";
import { Link } from "react-router";

export const DashboardPage: React.FC = () => {
  const { translate } = useTranslation()

  return (
    <RefineListView>
      <Link to="/users">
        <Card sx={{ maxWidth: "200px" }} title={translate("users.users")} icon={<AccountCircleOutlinedIcon />}></Card>
      </Link>
    </RefineListView>
  );
};
