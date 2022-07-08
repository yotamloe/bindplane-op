import { gql } from "@apollo/client";
import { Button, Stack, Typography } from "@mui/material";
import {
  ResourceConfiguration,
  useGetProcessorTypeQuery,
} from "../../graphql/generated";

interface Props {
  processor: ResourceConfiguration;
  onEdit: () => void;
  onRemove: () => void;
}

gql`
  query getProcessorType($type: String!) {
    processorType(name: $type) {
      metadata {
        displayName
        name
        description
      }
      spec {
        parameters {
          label
          name
          description
          required
          type
          default
          relevantIf {
            name
            operator
            value
          }
          validValues
        }
      }
    }
  }
`;

export const InlineProcessorLabel: React.FC<Props> = ({
  processor,
  onEdit,
  onRemove,
}) => {
  // TODO (dsvanlani) handle loading and error
  const { data, loading, error } = useGetProcessorTypeQuery({
    variables: { type: processor.type! },
  });

  return (
    <>
      <Stack direction="row" alignItems={"center"} spacing={1}>
        <Typography>{data?.processorType?.metadata.displayName}</Typography>
        <Button size="small" variant="text" color="error" onClick={onRemove}>
          Remove
        </Button>
        <Button size="small" variant="text" color="primary" onClick={onEdit}>
          Edit
        </Button>
      </Stack>
    </>
  );
};
