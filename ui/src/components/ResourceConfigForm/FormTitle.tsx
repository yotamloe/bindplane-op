import { Stack, Typography } from "@mui/material";
import { ChevronRight } from "../Icons";

import mixins from "../../styles/mixins.module.scss";

interface FormTitleProps {
  title: string;
  description?: string;
  crumbs?: string[];
}

export const FormTitle: React.FC<FormTitleProps> = ({
  title,
  crumbs,
  description,
}) => {
  return (
    <>
      {/** Bread crumbs */}
      <Stack direction="row" alignItems={"center"} spacing={1}>
        <Typography variant="h6">{title}</Typography>
        {crumbs &&
          crumbs.map((c, ix) => {
            return (
              <>
                {ix < crumbs.length && (
                  <ChevronRight key={`chevron-${ix}`} width={14} height={14} />
                )}
                <Typography key={`crumb-${ix}`} variant={"body2"}>
                  {c}
                </Typography>
              </>
            );
          })}
      </Stack>

      {description && (
        <Typography variant="body2" className={mixins["mb-5"]}>
          {description}
        </Typography>
      )}
    </>
  );
};
