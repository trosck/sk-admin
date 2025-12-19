import { type PropsWithChildren, useMemo } from "react";
import {
  type HttpError,
  useGo,
  useNavigation,
  useTranslate,
} from "@refinedev/core";
import { useLocation } from "react-router";
import { useDataGrid } from "@refinedev/mui";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Avatar from "@mui/material/Avatar";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import IconButton from "@mui/material/IconButton";
import type { IUser, IUserFilterVariables } from "../../interfaces";
import { RefineListView } from "../../components";
import { getAvatarUrl } from "./utils";

export const UserList = ({ children }: PropsWithChildren) => {
  const go = useGo();
  const { pathname } = useLocation();
  const { showUrl } = useNavigation();
  const t = useTranslate();

  const { dataGridProps } = useDataGrid<IUser, HttpError, IUserFilterVariables>(
    {
      pagination: {
        pageSize: 10,
      },
    }
  );

  const columns = useMemo<GridColDef<IUser>[]>(
    () => [
      {
        field: "avatar",
        headerName: t("users.fields.avatar.label"),
        display: "flex",
        renderCell: function render({ row }) {
          return (
            <Avatar
              sx={{
                width: 32,
                height: 32,
              }}
              src={getAvatarUrl(row)}
            />
          );
        },
        align: "center",
        headerAlign: "center",
        sortable: false,
      },
      {
        field: "username",
        headerName: t("users.fields.name"),
        minWidth: 140,
        flex: 1,
      },
      {
        field: "total_xp",
        headerName: t("users.fields.total_xp"),
      },
      {
        field: "level",
        headerName: t("users.fields.level"),
      },
      {
        field: "cookies",
        headerName: t("users.fields.cookies"),
      },
      {
        field: "actions",
        headerName: t("table.actions"),
        align: "center",
        headerAlign: "center",
        display: "flex",
        sortable: false,
        filterable: false,
        renderCell: function render({ row }) {
          return (
            <IconButton
              sx={{
                color: "text.secondary",
              }}
              onClick={() => {
                return go({
                  to: `${showUrl("users", row.discord_id)}`,
                  query: {
                    to: pathname,
                  },
                  options: {
                    keepQuery: true,
                  },
                  type: "replace",
                });
              }}
            >
              <VisibilityOutlined />
            </IconButton>
          );
        },
      },
    ],
    [t, go, pathname, showUrl]
  );

  return (
    <>
      <RefineListView breadcrumb={false}>
        <DataGrid
          {...dataGridProps}
          columns={columns}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </RefineListView>
      {children}
    </>
  );
};

export default UserList;
