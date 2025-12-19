import * as React from "react";
import { useState } from "react";

import { useLogin, useTranslate } from "@refinedev/core";
import { TextField, Button, Card, CardContent } from "@mui/material";

export const PasswordOnlyLogin = () => {
  const t = useTranslate();
  const { mutate: login } = useLogin();
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // передаём только password в authProvider.login
    login({ password });
  };

  return (
    <Card sx={{ maxWidth: 400, m: "auto", mt: 8 }}>
      <CardContent>
        <form onSubmit={onSubmit}>
          <TextField
            fullWidth
            type="password"
            label={t("pages.login.fields.password")}
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            {t("pages.login.signin")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
