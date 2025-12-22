import React, { useMemo, useState } from "react";
import {
  useGetToPath,
  useGo,
  useTranslate,
  useNotification,
  useInvalidate,
} from "@refinedev/core";
import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Drawer, RichTextEditorField } from "../../components";
import { useChannels } from "../../api/channels";
import { httpClient } from "../../api/httpClient";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface FormValues {
  channel_id: string;
  text: string;
  scheduled_at: string; // datetime-local format string
  media: File | null;
}

/**
 * Converts datetime-local string to ISO string for API
 */
const toISOString = (datetimeLocal: string): string => {
  if (!datetimeLocal) return "";
  // datetime-local format: "YYYY-MM-DDTHH:mm"
  // Convert to ISO: "YYYY-MM-DDTHH:mm:ss.sssZ"
  return new Date(datetimeLocal).toISOString();
};

/**
 * Gets default scheduled time (1 hour from now) in datetime-local format
 */
const getDefaultScheduledAt = (): string => {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Validates that scheduled_at is in the future
 */
const validateScheduledAt = (value: string): boolean | string => {
  if (!value) return "errors.required.field";
  const scheduledDate = new Date(value);
  const now = new Date();
  if (scheduledDate <= now) {
    return "scheduledPost.errors.scheduledAtMustBeFuture";
  }
  return true;
};

export const ScheduledPostCreate: React.FC = () => {
  const getToPath = useGetToPath();
  const [searchParams] = useSearchParams();
  const go = useGo();
  const t = useTranslate();
  const { open } = useNotification();
  const invalidate = useInvalidate();

  const { data: channels, isLoading: channelsLoading } = useChannels();
  const [isCreating, setIsCreating] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      channel_id: "",
      text: "",
      scheduled_at: getDefaultScheduledAt(),
      media: null,
    },
  });

  const mediaFile = watch("media");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const channelOptions = useMemo(() => {
    return (channels ?? []).map((channel) => ({
      id: String(channel.id),
      label: (channel as { name?: string }).name || String(channel.id),
    }));
  }, [channels]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setValue("media", file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        open?.({
          type: "error",
          message: t("notifications.error"),
          // description: "Пожалуйста, выберите изображение",
        });
      }
    }
  };

  const handleRemoveImage = () => {
    setValue("media", null);
    setMediaPreview(null);
  };

  const onDrawerClose = () => {
    go({
      to: searchParams.get("to") ?? getToPath({ action: "list" }) ?? "",
      query: { to: undefined },
      options: { keepQuery: true },
      type: "replace",
    });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsCreating(true);

      // Создаем FormData
      const formData = new FormData();
      formData.append("channel_id", values.channel_id);
      formData.append("text", values.text.trim());
      formData.append("scheduled_at", toISOString(values.scheduled_at));

      // Добавляем файл напрямую, если он есть
      if (values.media) {
        formData.append("file", values.media);
      }

      await httpClient.post("/scheduled-posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      invalidate({ resource: "scheduled-posts", invalidates: ["list"] });

      open?.({
        type: "success",
        message: t("notifications.success"),
        description: t("scheduledPost.notifications.createSuccess"),
      });

      setIsCreating(false);

      onDrawerClose();
    } catch (error: any) {
      setIsCreating(false);
      open?.({
        type: "error",
        message: t("notifications.error"),
        description:
          error?.response?.data?.message ||
          error?.message ||
          t("scheduledPost.notifications.createError"),
      });
    }
  };

  const isLoading = isSubmitting || isCreating;

  return (
    <Drawer
      open
      onClose={onDrawerClose}
      anchor="right"
      PaperProps={{ sx: { width: "100%", maxWidth: "736px" } }}
    >
      <Stack
        spacing="24px"
        padding="24px 24px 56px 24px"
        sx={{
          background: "black",
          height: "100%",
        }}
      >
        <Paper>
          <Stack spacing="16px" padding="24px">
            <Typography variant="h6">
              {t("scheduledPost.scheduledPosts")}
            </Typography>

            <Controller
              name="channel_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  // sx={{ color: "black" }}
                  loading={channelsLoading}
                  options={channelOptions}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.label
                  }
                  value={
                    channelOptions.find((opt) => opt.id === field.value) || null
                  }
                  onChange={(_, value) => field.onChange(value ? value.id : "")}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("form.selectChannel")}
                      error={!!errors.channel_id}
                      helperText={
                        errors.channel_id
                          ? t("errors.required.field")
                          : undefined
                      }
                    />
                  )}
                />
              )}
            />

            <Controller
              name="text"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <RichTextEditorField
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.text}
                  translate={t}
                />
              )}
            />

            <Box>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="media-upload"
                type="file"
                onChange={handleFileChange}
              />
              {!mediaPreview && (
                <label htmlFor="media-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<ImageIcon />}
                    fullWidth
                  >
                    {t("scheduledPost.uploadImage")}
                  </Button>
                </label>
              )}
              {mediaPreview && (
                <Box
                  sx={{
                    mt: 2,
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  <Box
                    component="img"
                    src={mediaPreview}
                    alt="Preview"
                    sx={{
                      width: "128px",
                      height: "128px",
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        document.getElementById("media-upload")?.click();
                      }}
                      size="small"
                      sx={{
                        bgcolor: "background.paper",
                        "&:hover": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={handleRemoveImage}
                      size="small"
                      sx={{
                        bgcolor: "background.paper",
                        "&:hover": {
                          bgcolor: "error.main",
                          color: "error.contrastText",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              )}
            </Box>

            <Box
              onClick={(e) => {
                const input = (e.currentTarget as HTMLElement).querySelector(
                  'input[type="datetime-local"]'
                ) as HTMLInputElement;
                if (input) {
                  e.preventDefault();
                  e.stopPropagation();
                  if (typeof input.showPicker === "function") {
                    input.showPicker();
                  } else {
                    input.focus();
                    input.click();
                  }
                }
              }}
              sx={{ cursor: "pointer" }}
            >
              <TextField
                label={t("scheduledPost.scheduled_at")}
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                {...register("scheduled_at", {
                  required: true,
                  validate: validateScheduledAt,
                })}
                error={!!errors.scheduled_at}
                helperText={
                  errors.scheduled_at
                    ? typeof errors.scheduled_at.message === "string"
                      ? t(errors.scheduled_at.message)
                      : t("errors.required.field")
                    : undefined
                }
                fullWidth
              />
            </Box>

            <Stack direction="row" spacing="12px" justifyContent="flex-end">
              <Button variant="outlined" onClick={onDrawerClose}>
                {t("buttons.cancel")}
              </Button>
              <LoadingButton
                variant="contained"
                loading={isLoading}
                onClick={handleSubmit(onSubmit)}
              >
                {t("buttons.save")}
              </LoadingButton>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Drawer>
  );
};

export default ScheduledPostCreate;
