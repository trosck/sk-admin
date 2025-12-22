import React, { useState } from "react";
import {
  useGetToPath,
  useGo,
  useInvalidate,
  useShow,
  useTranslate,
} from "@refinedev/core";
import { useSearchParams } from "react-router";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { IUser } from "../../interfaces";
import { Drawer, DrawerHeader } from "../../components";
import { getAvatarUrl } from "./utils";
import { Button, TextField } from "@mui/material";
import { incrementUserXP } from "../../api";

export const UserShow = () => {
  const getToPath = useGetToPath();
  const [searchParams] = useSearchParams();
  const go = useGo();
  const $t = useTranslate();
  const invalidate = useInvalidate();

  const [valueXP, setValueXP] = useState("");
  const [isLoading, setLoading] = useState(false);

  const { query: queryResult } = useShow<IUser>();
  const user = queryResult.data?.data;

  const onDrawerCLose = () => {
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

  async function giveUserXP() {
    setLoading(true);

    if (user) {
      await incrementUserXP(user?.id, +valueXP);
      invalidate({ resource: "users", invalidates: ["all"] });
    }

    setLoading(false);
    setValueXP("0");
  }

  return (
    <Drawer
      open
      onClose={onDrawerCLose}
      anchor="right"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "736px",
        },
      }}
    >
      <Stack
        spacing="32px"
        padding="32px 32px 56px 32px"
        sx={{
          background: "white",
          height: "100%",
        }}
      >
        <Stack spacing="28px" direction="row" alignItems="center">
          <Avatar
            sx={{
              width: "72px",
              height: "72px",
            }}
            src={user && getAvatarUrl(user)}
            alt={user?.username}
          />
          <Stack>
            <Typography color="text.secondary" fontWeight="700">
              #{user?.discord_id}
            </Typography>
            <Typography variant="h5">{user?.username}</Typography>
          </Stack>
        </Stack>

        <Paper>
          <Stack direction="row" alignItems="center" padding="24px">
            <Typography>
              {$t("users.fields.level")}: {user?.level}
            </Typography>
          </Stack>
        </Paper>

        <Paper>
          <Stack direction="row" alignItems="center" padding="24px">
            <Typography>
              {$t("users.fields.total_xp")}: {user?.total_xp}
            </Typography>
          </Stack>
        </Paper>

        <Paper>
          <Stack direction="row" alignItems="center" padding="24px">
            <Typography>
              {$t("users.fields.cookies")}: {user?.cookies}
            </Typography>
          </Stack>
        </Paper>

        <Paper>
          <Stack
            direction="row"
            alignItems="center"
            padding="24px"
            spacing="8px"
          >
            <TextField
              type="number"
              size="small"
              sx={{
                maxWidth: "160px",
                backgroundColor: "#ffffff",
                borderRadius: "5px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#AB47BC",
                  },
                  "&:hover fieldset": {
                    borderColor: "#9C27B0",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#7B1FA2",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#111827",
                },
              }}
              value={valueXP}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/[^0-9]/g, "");
                setValueXP(onlyDigits);
              }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                min: 0,
              }}
            />

            <Button
              loading={isLoading}
              variant="outlined"
              onClick={giveUserXP}
            >
              {$t("users.give_xp")}
            </Button>
          </Stack>
        </Paper>

        {/* <DataGrid {...dataGridProps} columns={columns} hideFooter /> */}
      </Stack>
    </Drawer>
  );
};
