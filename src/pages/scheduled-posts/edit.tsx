import React, { useMemo, useState, useRef } from "react";
import {
  useGetToPath,
  useGo,
  useTranslate,
  useNotification,
  useInvalidate,
  useShow,
  useUpdate,
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
import { Drawer } from "../../components";
import { useChannels } from "../../api/channels";
import { IScheduledPost } from "../../interfaces";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";

import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Mark } from "@tiptap/core";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonUnderline,
  MenuButtonStrikethrough,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonBlockquote,
  MenuControlsContainer,
  MenuDivider,
  RichTextEditor,
  type RichTextEditorRef,
} from "mui-tiptap";

const Underline = Mark.create({
  name: "underline",
  // @ts-ignore - parseHTML является валидным свойством для Mark
  parseHTML() {
    return [
      {
        tag: "u",
      },
      {
        style: "text-decoration",
        getAttrs: (value: string) => value === "underline" && null,
      },
    ];
  },
  renderHTML() {
    return ["u", 0];
  },
  addCommands() {
    return {
      setUnderline:
        () =>
        ({ commands }: any) => {
          return commands.setMark(this.name);
        },
      toggleUnderline:
        () =>
        ({ commands }: any) => {
          return commands.toggleMark(this.name);
        },
      unsetUnderline:
        () =>
        ({ commands }: any) => {
          return commands.unsetMark(this.name);
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-u": () => this.editor.commands.toggleUnderline(),
    };
  },
});

const linkExtension = Link.configure({
  autolink: true,
  linkOnPaste: true,
  openOnClick: false,
});

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

  const { mutate: updatePost } = useUpdate<IScheduledPost>();
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
    setMediaPreview(post.media || null);
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
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

      let mediaBase64 = post.media || "";
      if (values.media) {
        mediaBase64 = await fileToBase64(values.media);
      } else if (!mediaPreview) {
        mediaBase64 = "";
      }

      const payload = {
        channel_id: values.channel_id,
        text: values.text.trim(),
        scheduled_at: toISOString(values.scheduled_at),
        media: mediaBase64,
      };

      updatePost(
        {
          resource: "scheduled-posts",
          id: post.id,
          values: payload,
        },
        {
          onSuccess: () => {
            invalidate({ resource: "scheduled-posts", invalidates: ["list"] });
            open?.({
              type: "success",
              message: t("notifications.success"),
              description: t("scheduledPost.notifications.updateSuccess"),
            });
            setIsSaving(false);
            onDrawerClose();
          },
          onError: (error) => {
            setIsSaving(false);
            open?.({
              type: "error",
              message: t("notifications.error"),
              description:
                error?.message || t("scheduledPost.notifications.updateError"),
            });
          },
        }
      );
    } catch (_error) {
      setIsSaving(false);
      open?.({
        type: "error",
        message: t("notifications.error"),
        description: t("scheduledPost.notifications.updateError"),
      });
    }
  };

  const isLoading = isSubmitting || isSaving;

  const rteRef = useRef<RichTextEditorRef>(null);

  const handleInsertNamedLink = () => {
    const editor = rteRef.current?.editor;
    if (!editor) return;

    const href = window.prompt("Введите URL ссылки", "https://");
    if (!href) {
      return;
    }

    const { state } = editor;
    const { empty, from, to } = state.selection;

    if (empty) {
      const label =
        window.prompt("Текст ссылки (по умолчанию URL)", href) ?? href;
      if (!label) return;

      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a> `
        )
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .setLink({ href })
      .setTextSelection(to)
      .insertContent(" ")
      .run();
  };

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
                <div>
                  <RichTextEditor
                    ref={rteRef}
                    extensions={[StarterKit, Underline, linkExtension]}
                    content={field.value || "<p></p>"}
                    onUpdate={({ editor }) => {
                      const html = editor.getHTML();
                      field.onChange(html);
                    }}
                    renderControls={() => (
                      <MenuControlsContainer>
                        <MenuButtonBold />
                        <MenuButtonItalic />
                        <MenuButtonUnderline />
                        <MenuButtonStrikethrough />
                        <MenuDivider />
                        <IconButton
                          size="small"
                          onClick={handleInsertNamedLink}
                          sx={{ mr: 1 }}
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                        <MenuDivider />
                        <MenuButtonCode />
                        <MenuButtonCodeBlock />
                        <MenuDivider />
                        <MenuButtonBlockquote />
                      </MenuControlsContainer>
                    )}
                  />
                  {errors.text && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.75 }}
                    >
                      {t("errors.required.field")}
                    </Typography>
                  )}
                </div>
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
              <label htmlFor="media-upload-edit">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<ImageIcon />}
                  fullWidth
                >
                  {mediaFile || mediaPreview
                    ? t("scheduledPost.changeImage")
                    : t("scheduledPost.uploadImage")}
                </Button>
              </label>
              {mediaPreview && (
                <Box
                  sx={{
                    mt: 2,
                    position: "relative",
                    display: "inline-block",
                    width: "100%",
                  }}
                >
                  <Box
                    component="img"
                    src={mediaPreview}
                    alt="Preview"
                    sx={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "background.paper",
                      "&:hover": {
                        bgcolor: "error.main",
                        color: "error.contrastText",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
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


