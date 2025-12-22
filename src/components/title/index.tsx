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
    >
      <Box
        component="img"
        src={"/images/logo.png"}
        alt={"Atlas logo"}
        sx={{
          height: 40,
          width: "auto",
        }}
      />
    </Box>
  );
};
