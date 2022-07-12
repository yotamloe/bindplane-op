import { Button, Divider, Typography } from "@mui/material";
import { ResourceConfiguration } from "../../graphql/generated";
import { PlusCircleIcon } from "../Icons";
import { InlineProcessorLabel } from "./InlineProcessorLabel";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import mixins from "../../styles/mixins.module.scss";
import { useCallback, useState } from "react";
import { FormValues } from ".";

interface Props {
  processors: ResourceConfiguration[];
  onAddProcessor: () => void;
  onEditProcessor: (index: number) => void;
  setFormValues: (value: React.SetStateAction<FormValues>) => void;
}

export const InlineProcessorContainer: React.FC<Props> = ({
  setFormValues,
  processors: processorsProp,
  onAddProcessor,
  onEditProcessor,
}) => {
  // Manage the processor order state internally in this component
  const [processors, setProcessors] = useState(processorsProp);

  function handleDrop() {
    setFormValues((prev: FormValues) => ({
      ...prev,
      processors,
    }));
  }

  const moveProcessor = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (dragIndex === hoverIndex) {
        return;
      }
      console.log(
        `Moving processor at index ${dragIndex} to index ${hoverIndex}`
      );

      const newProcessors = [...processors];

      const dragItem = newProcessors[dragIndex];
      const hoverItem = newProcessors[hoverIndex];

      // Swap places of dragItem and hoverItem in the array
      newProcessors[dragIndex] = hoverItem;
      newProcessors[hoverIndex] = dragItem;

      setProcessors(newProcessors);
    },
    [processors]
  );

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <Divider />
        <Typography fontWeight={600} marginTop={2}>
          Processors
        </Typography>
        {processors.map((p, ix) => {
          function onRemove() {
            // TODO (dsvanlani)
          }

          return (
            <InlineProcessorLabel
              moveProcessor={moveProcessor}
              key={`${p.name}-${ix}`}
              processor={p}
              onEdit={() => onEditProcessor(ix)}
              onRemove={onRemove}
              onDrop={handleDrop}
              index={ix}
            />
          );
        })}

        <Button
          variant="text"
          startIcon={<PlusCircleIcon />}
          classes={{ root: mixins["mb-2"] }}
          onClick={onAddProcessor}
        >
          Add processor
        </Button>
        <Divider />
      </DndProvider>
    </>
  );
};
