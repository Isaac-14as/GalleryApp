import { Box } from "@mui/joy";
import { observer } from "mobx-react-lite";

import { Outlet } from "react-router-dom";
import { MainHeader } from "widgets/main-header";

export const MainLayout = observer(() => {
  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <MainHeader />
      <Box
        sx={{
          height: "100%",
          width: "100%",
          overflowY: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
});
