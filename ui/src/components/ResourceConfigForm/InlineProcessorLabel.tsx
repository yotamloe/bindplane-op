import { gql } from "@apollo/client";
import { Button, Stack, Typography } from "@mui/material";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  ResourceConfiguration,
  useGetProcessorTypeQuery,
} from "../../graphql/generated";
import { MenuIcon } from "../Icons";

import styles from "./inline-processor-label.module.scss";

interface Props {
  index: number;
  processor: ResourceConfiguration;
  onEdit: () => void;
  onRemove: () => void;
  // Move processor should change the components order state
  moveProcessor: (dragIndex: number, dropIndex: number) => void;

  // onDrop should "save" the current order to the formValues and apply
  // the changed configuration.
  onDrop: () => void;
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

type Item = {
  index: number;
};

export const InlineProcessorLabel: React.FC<Props> = ({
  index,
  processor,
  onEdit,
  onRemove,
  onDrop,
  moveProcessor,
}) => {
  // TODO (dsvanlani) handle loading and error
  const { data, loading, error } = useGetProcessorTypeQuery({
    variables: { type: processor.type! },
  });

  const [, dragRef] = useDrag({
    type: "inline-processor",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isHovered }, dropRef] = useDrop<
    Item,
    unknown,
    { isHovered: boolean }
  >({
    accept: "inline-processor",
    collect: (monitor) => ({
      isHovered: monitor.isOver(),
    }),
    hover: (item, monitor) => {
      if (ref.current == null) {
        return;
      }

      if (monitor == null) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      moveProcessor(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },

    // Save the order on drop
    drop: onDrop,
  });

  // Join the 2 refs together into one (both draggable and can be dropped on)
  const ref = useRef<HTMLDivElement>(null);

  const dragDropRef = dragRef(dropRef(ref)) as any;

  return (
    <div
      ref={dragDropRef}
      style={{ borderTop: isHovered ? "2px solid #4abaeb" : "2px solid white" }}
    >
      <Stack direction="row" alignItems={"center"} spacing={1}>
        <MenuIcon className={styles["hover-icon"]} />
        <Typography>{data?.processorType?.metadata.displayName}</Typography>
        <div>
          <Button
            size="small"
            variant="text"
            color="error"
            onClick={onRemove}
            classes={{ root: styles.button }}
          >
            remove
          </Button>

          <Button
            size="small"
            variant="text"
            color="primary"
            onClick={onEdit}
            classes={{ root: styles.button }}
          >
            edit
          </Button>
        </div>
      </Stack>
    </div>
  );
};
