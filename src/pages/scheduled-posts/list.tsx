import { useMemo, type PropsWithChildren } from "react";
import {
  HttpError,
  useTranslate,
  useNavigation,
  useGo,
} from "@refinedev/core";
import { RefineListView } from "../../components";
import { IFilterVariables, IScheduledPost } from "../../interfaces";
import { useDataGrid } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import { useLocation } from "react-router";
import { useChannels } from "../../api/channels";

export const ScheduledPostList = ({ children }: PropsWithChildren) => {
  const go = useGo();
  const { pathname } = useLocation();
  const t = useTranslate();
  const { createUrl, showUrl } = useNavigation();
  const { data: channels } = useChannels();

  const { dataGridProps } = useDataGrid<
    IScheduledPost,
    HttpError,
    IFilterVariables
  >({
    pagination: {
      pageSize: 10,
    },
  });

  const getChannelName = (channelId: string): string => {
    const channel = channels?.find(
      (ch) => String(ch.id) === String(channelId)
    );
    return (channel as { name?: string })?.name || channelId;
  };

  const columns = useMemo<GridColDef<IScheduledPost>[]>(
    () => [
      {
        sortable: false,
        field: "channel_id",
        headerName: t("scheduledPost.channelName"),
        valueGetter: (value, row) => getChannelName(row.channel_id),
      },
      {
        sortable: false,
        field: "text",
        headerName: t("scheduledPost.text"),
        flex: 2,
        renderCell: function render({ row }) {
          return (
            <Box
              dangerouslySetInnerHTML={{ __html: row.text || "" }}
              sx={{
                maxHeight: "100px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
                margin: 0,
                padding: 0,
                lineHeight: "normal",
                "& p": {
                  margin: 0,
                  padding: 0,
                },
                "& *": {
                  margin: 0,
                  padding: 0,
                },
              }}
            />
          );
        },
      },
      {
        field: "status",
        headerName: t("scheduledPost.status"),
        flex: 1
      },
      {
        field: "scheduled_at",
        headerName: t("scheduledPost.scheduled_at"),
        flex: 1,
        renderCell: function render({ row }) {
          if (!row.scheduled_at) return "";
          const date = new Date(row.scheduled_at);
          return date.toLocaleString();
        },
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
                  to: `${showUrl("scheduled-posts", row.id)}`,
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
    [t, channels, go, pathname, showUrl],
  );

  return (
    <>
      <RefineListView breadcrumb={false} headerButtons={
        <Button variant="contained" onClick={() => {
          return go({
            to: createUrl("scheduled-posts"),
            query: {
              to: pathname,
            },
            options: {
              keepQuery: true,
            },
            type: "replace",
          });
        }}>
          {t("buttons.create")}
        </Button>
      }>
        <DataGrid
          {...dataGridProps}
          columns={columns}
          getRowId={row => row.id}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </RefineListView>
      {children}
    </>
  );
};
