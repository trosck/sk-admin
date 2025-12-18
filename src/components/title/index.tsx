import Box from "@mui/material/Box";

export const Title: React.FC = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={"12px"}
      sx={{
        color: "text.primary",
      }}
    ></Box>
  );
};
