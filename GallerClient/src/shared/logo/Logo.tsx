import { Typography } from "@mui/joy";

const Logo = () => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Typography
        style={{
          fontWeight: 500,
          color: "#000",
          fontSize: "24px",
          lineHeight: "24px",
          marginRight: "10px",
        }}
      >
        Галерея
      </Typography>
    </div>
  );
};

export default Logo;
