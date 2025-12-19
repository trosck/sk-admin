import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type ChangeEvent,
} from "react";
import { HttpError, useTranslate, useNotification } from "@refinedev/core";
import { RefineListView } from "../../components";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  IFilterVariables,
  IPromoCat,
  IPromoCatImage,
  IPromoCatSettings,
} from "../../interfaces";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useDataGrid } from "@refinedev/mui";
import {
  httpClient,
  getPromoCatsSettings,
  getPromoCatsImages,
  setPromoCatsSettings,
} from "../../api";
import { useChannels, type Channel } from "../../api/channels";
import Autocomplete from "@mui/material/Autocomplete";

export const PromoCatList = ({ children }: PropsWithChildren) => {
  const t = useTranslate();
  const { open: openNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imagesFileInputRef = useRef<HTMLInputElement | null>(null);
  const [settings, setSettings] = useState<IPromoCatSettings | null>(null);
  const [images, setImages] = useState<IPromoCatImage[]>([]);

  const { data: channelsData } = useChannels();

  const channelOptions =
    channelsData?.map((channel: Channel) => ({
      id: channel.id,
      label: String(channel.name ?? channel.id),
    })) ?? [];

  useEffect(() => {
    void (async () => {
      try {
        const data = await getPromoCatsSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load promo cats settings", error);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getPromoCatsImages();
        setImages(data);
      } catch (error) {
        console.error("Failed to load promo cats images", error);
      }
    })();
  }, []);

  const handleUploadPromocodesClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadImagesClick = () => {
    imagesFileInputRef.current?.click();
  };

  const columns = useMemo<GridColDef<IPromoCat>[]>(
    () => [
      {
        disableColumnMenu: true,
        sortable: false,
        field: "promocode",
        headerName: t("promocat.promocode"),
        flex: 1,
      },
      {
        disableColumnMenu: true,
        sortable: false,
        field: "discount",
        headerName: t("promocat.discount"),
        flex: 1,
      },
      {
        field: "date",
        headerName: t("promocat.date"),
        flex: 1,
        renderCell: function render({ row }) {
          if (!row.date) return "";
          const date = new Date(row.date);
          return date.toLocaleDateString();
        },
      },
      {
        disableColumnMenu: true,
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
              onClick={() => {}}
            >
              {/* <VisibilityOutlined /> */}
            </IconButton>
          );
        },
      },
    ],
    [t]
  );

  const { dataGridProps, tableQuery } = useDataGrid<
    IPromoCat,
    HttpError,
    IFilterVariables
  >({
    pagination: {
      pageSize: 10,
    },
  });

  const handlePromocodesFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await httpClient.post("/promo-cats/upload/promocodes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      openNotification?.({
        type: "success",
        message: t("promocat.upload.success"),
        description: file.name,
      });
    } catch (error) {
      console.error("Failed to upload promocodes file", error);

      openNotification?.({
        type: "error",
        message: t("promocat.upload.error"),
      });
    }

    event.target.value = "";
  };

  const handleImagesFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await httpClient.post("/promo-cats/upload/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      openNotification?.({
        type: "success",
        message: t("promocat.upload.success"),
        description: file.name,
      });

      try {
        const newImages = await getPromoCatsImages();
        setImages(newImages);
      } catch (error) {
        console.error("Failed to reload promo cats images after upload", error);
      }
    } catch (error) {
      console.error("Failed to upload images archive", error);

      openNotification?.({
        type: "error",
        message: t("promocat.upload.error"),
      });
    }

    event.target.value = "";
  };

  return (
    <>
      <RefineListView
        breadcrumb={false}
        headerButtons={
          <>
            <Stack direction="row" spacing={2} alignItems="center" mr={2}>
              <Autocomplete
                size="small"
                sx={{
                  width: "250px",
                }}
                options={channelOptions}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.label
                }
                value={
                  channelOptions.find(
                    (opt) => opt.id === settings?.channel_id
                  ) || null
                }
                onChange={async (_, value) => {
                  const channel_id = value ? String(value.id) : "";
                  setSettings((prev) => ({
                    ...(prev ?? { post_time: "" }),
                    channel_id,
                  }));

                  try {
                    await setPromoCatsSettings({ channel_id });
                    openNotification?.({
                      type: "success",
                      message: t("promocat.settings.channel.success"),
                    });
                  } catch (error) {
                    console.error("Failed to update promo cats channel", error);
                    openNotification?.({
                      type: "error",
                      message: t("promocat.settings.channel.error"),
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("form.selectChannel")}
                    size="small"
                  />
                )}
              />

              <TextField
                type="time"
                size="small"
                sx={{
                  width: "150px",
                }}
                label={t("promocat.postTime")}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }} // минутная точность
                value={
                  settings?.post_time
                    ? (() => {
                        const d = new Date(settings.post_time);
                        const hh = String(d.getHours()).padStart(2, "0");
                        const mm = String(d.getMinutes()).padStart(2, "0");
                        return `${hh}:${mm}`;
                      })()
                    : ""
                }
                onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                  const value = event.target.value; // формат "HH:MM"

                  let iso = "";
                  if (value) {
                    const [hh, mm] = value.split(":").map(Number);
                    const base = settings?.post_time
                      ? new Date(settings.post_time)
                      : new Date();
                    base.setHours(hh ?? 0, mm ?? 0, 0, 0);
                    iso = base.toISOString();
                  }

                  setSettings((prev) => ({
                    ...(prev ?? { channel_id: "" }),
                    post_time: iso,
                  }));

                  try {
                    await setPromoCatsSettings({ post_time: iso });
                  } catch (error) {
                    console.error(
                      "Failed to update promo cats post time",
                      error
                    );
                    openNotification?.({
                      type: "error",
                      message: t("promocat.settings.time.error"),
                    });
                    return;
                  }

                  openNotification?.({
                    type: "success",
                    message: t("promocat.settings.time.success"),
                  });
                }}
              />
            </Stack>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              style={{ display: "none" }}
              onChange={handlePromocodesFileChange}
            />
            <input
              type="file"
              ref={imagesFileInputRef}
              accept=".zip,application/zip"
              style={{ display: "none" }}
              onChange={handleImagesFileChange}
            />

            <Button variant="contained" onClick={handleUploadPromocodesClick}>
              {t("uploadPromocodes")}
            </Button>

            <Divider />

            <Button
              variant="contained"
              onClick={handleUploadImagesClick}
            >
              {t("uploadImages")}
            </Button>
          </>
        }
      >
        <DataGrid
          {...dataGridProps}
          columns={columns}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 20, 50, 100]}
        />
        {images.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              {t("promocat.imagesPreview")}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {images.map((image) => (
                <Box
                  key={image.name}
                  sx={{
                    width: 120,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={`data:image/*;base64,${image.preview}`}
                    alt={image.name}
                    sx={{
                      width: "100%",
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      mb: 0.5,
                    }}
                  />
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ width: "100%", textAlign: "center" }}
                    title={image.name}
                  >
                    {image.name}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </RefineListView>
      {children}
    </>
  );
};

export default PromoCatList;
