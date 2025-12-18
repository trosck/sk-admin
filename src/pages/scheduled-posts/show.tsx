import React from "react";
import {
  useGetToPath,
  useGo,
  useShow,
  useTranslate,
} from "@refinedev/core";
import { useSearchParams } from "react-router";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { IScheduledPost } from "../../interfaces";
import {
  Drawer,
  DrawerHeader,
} from "../../components";
import { useChannels } from "../../api/channels";
import StarterKit from "@tiptap/starter-kit";
import { Mark } from "@tiptap/core";
import { RichTextEditor } from "mui-tiptap";
import { useRef } from "react";

const Underline = Mark.create({
  name: "underline",
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
});

const ScheduledPostStatus = {
  SCHEDULED: "SCHEDULED",
  PROCESSING: "PROCESSING",
  SENT: "SENT",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
} as const;

export const ScheduledPostShow = () => {
  const getToPath = useGetToPath();
  const [searchParams] = useSearchParams();
  const go = useGo();
  const $t = useTranslate();

  const { query: queryResult } = useShow<IScheduledPost>();
  const post = queryResult.data?.data;
  const { data: channels } = useChannels();

  const rteRef = useRef<any>(null);

  const getChannelName = (channelId: string): string => {
    const channel = channels?.find(
      (ch) => String(ch.id) === String(channelId)
    );
    return (channel as { name?: string })?.name || channelId;
  };

  const formatDate = (date: Date | string): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString();
  };

  const onDrawerClose = () => {
    go({
      to:
        searchParams.get("to") ??
        getToPath({
          action: "list",
        }) ??
        "",
      query: {
        to: undefined,
      },
      options: {
        keepQuery: true,
      },
      type: "replace",
    });
  };

  if (!post) {
    return null;
  }

  return (
    <Drawer
      open
      onClose={onDrawerClose}
      anchor="right"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "736px",
        },
      }}
    >
      <DrawerHeader onCloseClick={onDrawerClose} />
      <Stack spacing="32px" padding="32px 32px 56px 32px">
        <Paper>
          <Stack spacing="16px" padding="24px">
            <Typography variant="h6">
              {$t("scheduledPost.channelName")}
            </Typography>
            <Typography color="text.secondary">
              {getChannelName(post.channel_id)}
            </Typography>
          </Stack>
        </Paper>

        <Paper>
          <Stack spacing="16px" padding="24px">
            <Typography variant="h6">
              {$t("scheduledPost.status")}
            </Typography>
            <Typography color="text.secondary">
              {post.status}
            </Typography>
          </Stack>
        </Paper>

        <Paper>
          <Stack spacing="16px" padding="24px">
            <Typography variant="h6">
              {$t("scheduledPost.scheduled_at")}
            </Typography>
            <Typography color="text.secondary">
              {formatDate(post.scheduled_at)}
            </Typography>
          </Stack>
        </Paper>

        <Paper>
          <Stack spacing="16px" padding="24px">
            <Typography variant="h6">
              {$t("scheduledPost.text")}
            </Typography>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                padding: 1,
                minHeight: "200px",
              }}
            >
              <RichTextEditor
                ref={rteRef}
                extensions={[StarterKit, Underline]}
                content={post.text || "<p></p>"}
                editable={false}
              />
            </Box>
          </Stack>
        </Paper>

        {post.media.length > 0 && (
          <Paper>
            <Stack spacing="16px" padding="24px">
              <Typography variant="h6">
                {$t("scheduledPost.media")}
              </Typography>
              <Box
                component="img"
                src={post.media}
                alt="Post media"
                sx={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "contain",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            </Stack>
          </Paper>
        )}

        {post.error && (
          <Paper>
            <Stack spacing="16px" padding="24px">
              <Typography variant="h6" color="error">
                {$t("scheduledPost.error")}
              </Typography>
              <Typography color="error">
                {post.error}
              </Typography>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Drawer>
  );
};
