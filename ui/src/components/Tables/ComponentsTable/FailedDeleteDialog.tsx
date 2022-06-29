import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { isEmpty, trim } from "lodash";
import { Link } from "react-router-dom";
import { ResourceKind, ResourceStatus } from "../../../types/resources";

interface FailedDeleteDialogProps extends DialogProps {
  failures: ResourceStatus[];
  onAcknowledge: () => void;
}

export const FailedDeleteDialog: React.FC<FailedDeleteDialogProps> = ({
  failures,
  onAcknowledge,
  ...dialogProps
}) => {
  return (
    <Dialog {...dialogProps} fullWidth maxWidth="md">
      <DialogContent>
        <Typography variant="h6" marginBottom={1}>
          Cannot delete some components.
        </Typography>

        <Typography marginBottom={3}>
          These components are currently being referenced by at least one
          Configuration. To delete these components first remove them from the
          Configuration on the Configuration Page.
        </Typography>

        <Divider />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Kind</strong>
              </TableCell>

              <TableCell>
                <strong>Dependencies</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {failures.map((f) => (
              <TableRow key={`${f.resource.kind}|${f.resource.metadata.name}`}>
                <TableCell>{f.resource.metadata.name}</TableCell>
                <TableCell>{f.resource.kind}</TableCell>
                {renderDependenciesCell(f.reason ?? "")}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onAcknowledge}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

function renderDependenciesCell(reason: string) {
  // We parse the reason by splitting on new lines, and then further on spaces.
  // This is used to create links to the resources.  This is probably fragile
  // and could use optimized.
  const split = reason.split("\n");

  const resourceStrings = split.reduce<string[]>((prev, cur) => {
    if (cur.startsWith("Dependent resources:")) return prev;
    if (isEmpty(cur)) return prev;
    prev.push(trim(cur));
    return prev;
  }, []);

  const links: JSX.Element[] = [];
  for (const resourceString of resourceStrings) {
    const [kind, name] = resourceString.split(" ");
    if (kind === ResourceKind.CONFIGURATION) {
      links.push(
        <Link to={`/configurations/${trim(name)}`}>{trim(name)}</Link>
      );
    }
  }

  return (
    <TableCell>
      {links.map((link, ix) => (
        <div key={ix}>{link}</div>
      ))}
    </TableCell>
  );
}
