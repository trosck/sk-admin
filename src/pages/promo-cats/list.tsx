import { useMemo, useRef, type PropsWithChildren, ChangeEvent } from "react";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadPromocodesClick = () => {
    fileInputRef.current?.click();
  };

  const handlePromocodesFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;
    // TODO: реализовать обработку файла промокодов (xlsx)
    // Сейчас — заглушка
    console.log("Selected promocodes file:", file);

    // сброс значения, чтобы повторный выбор того же файла срабатывал
    event.target.value = "";
  };

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
      <RefineListView
        breadcrumb={false}
        headerButtons={
          <>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              style={{ display: "none" }}
              onChange={handlePromocodesFileChange}
            />

            <Button variant="contained" onClick={handleUploadPromocodesClick}>
              {t("uploadPromocodes")}
            </Button>

            <Divider />

            <Button
              variant="contained"
              onClick={() => {
                return;
              }}
            >
              {t("uploadImages")}
            </Button>
          </>
        }
      >
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
