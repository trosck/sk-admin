import React, { useMemo, useState } from "react";
import {
  useGetToPath,
  useGo,
  useTranslate,
  useNotification,
  useInvalidate,
  useShow,
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
import { IScheduledPost } from "../../interfaces";
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

const toISOString = (datetimeLocal: string): string => {
  if (!datetimeLocal) return "";
  return new Date(datetimeLocal).toISOString();
};

const toDatetimeLocal = (date: Date | string): string => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const validateScheduledAt = (value: string): boolean | string => {
  if (!value) return "errors.required.field";
  const scheduledDate = new Date(value);
  const now = new Date();
  if (scheduledDate <= now) {
    return "scheduledPost.errors.scheduledAtMustBeFuture";
  }
  return true;
};

export const ScheduledPostEdit: React.FC = () => {
  const getToPath = useGetToPath();
  const [searchParams] = useSearchParams();
  const go = useGo();
  const t = useTranslate();
  const { open } = useNotification();
  const invalidate = useInvalidate();

  const { query } = useShow<IScheduledPost>();
  const post = query.data?.data;

  const { data: channels, isLoading: channelsLoading } = useChannels();
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      channel_id: "",
      text: "",
      scheduled_at: "",
      media: null,
    },
  });

  const mediaFile = watch("media");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (!post) return;
    reset({
      channel_id: post.channel_id,
      text: post.text || "",
      scheduled_at: toDatetimeLocal(post.scheduled_at),
      media: null,
    });
    // Если есть медиа, используем первое изображение для превью
    if (post.media && post.media.length > 0 && post.media[0].preview) {
      const preview = post.media[0].preview;
      // Preview приходит как строка (base64 или data URL)
      if (typeof preview === "string") {
        const previewStr = preview;
        setMediaPreview(
          previewStr.startsWith("data:")
            ? previewStr
            : `data:image/jpeg;base64,${previewStr}`
        );
      } else if (preview && typeof preview === 'object') {
        // Если preview это объект с числовыми ключами, конвертируем в base64 строку
        // Конвертируем объект {0: 255, 1: 216, ...} в массив байтов
        const keys = Object.keys(preview)
          .map(Number)
          .sort((a, b) => a - b);
        const bytes = keys.map(key => preview[key]);
        const binary = bytes.map((byte: number) => String.fromCharCode(byte)).join('');
        setMediaPreview(`data:image/jpeg;base64,${btoa(binary)}`);
      } else {
        setMediaPreview(null);
      }
    } else {
      setMediaPreview(null);
    }
  }, [post, reset]);

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
    if (!post) return;

    try {
      setIsSaving(true);

      // Создаем FormData
      const formData = new FormData();
      formData.append("channel_id", values.channel_id);
      formData.append("text", values.text.trim());
      formData.append("scheduled_at", toISOString(values.scheduled_at));

      // Если есть новый файл, добавляем его
      if (values.media) {
        formData.append("file", values.media);
      } else if (!mediaPreview) {
        // Если нет превью и нет файла, отправляем пустую строку для удаления
        formData.append("media", "");
      }
      // Если есть mediaPreview но нет нового файла, не добавляем поле media (оставляем старое)

      await httpClient.patch(`/scheduled-posts/${post.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      invalidate({ resource: "scheduled-posts", invalidates: ["list"] });
      open?.({
        type: "success",
        message: t("notifications.success"),
        description: t("scheduledPost.notifications.updateSuccess"),
      });
      setIsSaving(false);
      onDrawerClose();
    } catch (error: any) {
      setIsSaving(false);
      open?.({
        type: "error",
        message: t("notifications.error"),
        description:
          error?.response?.data?.message ||
          error?.message ||
          t("scheduledPost.notifications.updateError"),
      });
    }
  };

  const isLoading = isSubmitting || isSaving;

  if (!post) {
    return null;
  }

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
              {t("scheduledPost.editScheduledPost")}
            </Typography>

            <Controller
              name="channel_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
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
                id="media-upload-edit"
                type="file"
                onChange={handleFileChange}
              />
              {!mediaPreview && (
                <label htmlFor="media-upload-edit">
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
                        document.getElementById("media-upload-edit")?.click();
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

export default ScheduledPostEdit;
