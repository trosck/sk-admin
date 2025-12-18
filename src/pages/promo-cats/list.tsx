import { useMemo, type PropsWithChildren } from "react";
import {
  HttpError,
  useTranslate,
} from "@refinedev/core";
import { RefineListView } from "../../components";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IFilterVariables, IPromoCat } from "../../interfaces";
import { Button, Divider } from "@mui/material";
import { useDataGrid } from "@refinedev/mui";

export const PromoCatList = ({ children }: PropsWithChildren) => {
  const t = useTranslate();

  const columns = useMemo<GridColDef<IPromoCat>[]>(
    () => [
      {
        sortable: false,
        field: "promocode",
        headerName: t("promocat.promocode")
      },
      {
        sortable: false,
        field: "discount",
        headerName: t("promocat.discount"),
        flex: 1,
      },
      {
        field: "date",
        headerName: t("promocat.date"),
        flex: 1
      },
    ],
    [t,],
  );

  const { dataGridProps } = useDataGrid<
    IPromoCat,
    HttpError,
    IFilterVariables
  >({
    pagination: {
      pageSize: 10,
    },
  });

  return (
    <>
      <RefineListView breadcrumb={false} headerButtons={
        <>
          <Button variant="contained" onClick={() => {
            return;
          }}>
            {t("uploadPromocodes")}
          </Button>

          <Divider />

          <Button variant="contained" onClick={() => {
            return;
          }}>
            {t("uploadImages")}
          </Button>
        </>
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
