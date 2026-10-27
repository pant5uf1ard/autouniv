import { useTranslation } from "@/i18n";
import { Typography } from "@mui/material";

function UnexpectedFallback() {
  const t = useTranslation();

  return (
    <Typography role="alert" variant="h6" sx={{ color: "#3c3c3ca0", textAlign: "center" }}>
      {t.errors.UNEXPECTED}
    </Typography>
  );
}

export default UnexpectedFallback;
