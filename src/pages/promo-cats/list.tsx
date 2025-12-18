import { type PropsWithChildren } from "react";
import {
  useTranslate,
} from "@refinedev/core";
import { RefineListView } from "../../components";
import { Autocomplete, TextField } from "@mui/material";
import { useChannels } from "../../api";

export const PromoCatList = ({ children }: PropsWithChildren) => {
  const t = useTranslate();

  const { data, isLoading, error, refetch } = useChannels({
    params: {
      type: 0
    }
  });

  const channelList = data?.map(channel => ({
    id: channel.id,
    label: channel.name
  }))

  function onSelect() {

  }

  return (
    <>
      <RefineListView breadcrumb={false}>
        {/* {
          channelList && <Autocomplete
            defaultValue={null}
            onSelect={onSelect}
            options={channelList}
            renderInput={(params) => <TextField {...params} label={t("form.selectChannel")} />}
          />
        } */}
      </RefineListView>
      {children}
    </>
  );
};
