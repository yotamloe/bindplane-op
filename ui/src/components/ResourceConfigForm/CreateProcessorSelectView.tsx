import { gql } from "@apollo/client";
import { Button } from "@mui/material";
import { useState } from "react";
import { ButtonFooter, FormTitle, ProcessorType } from ".";
import { useGetProcessorTypesQuery } from "../../graphql/generated";
import { metadataSatisfiesSubstring } from "../../utils/metadata-satisfies-substring";
import {
  ResourceTypeButton,
  ResourceTypeButtonContainer,
} from "../ResourceTypeButton";

gql`
  query getProcessorTypes {
    processorTypes {
      metadata {
        displayName
        description
        name
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

interface CreateProcessorSelectViewProps {
  title: string;
  onBack: () => void;
  onSelect: (pt: ProcessorType) => void;
}

export const CreateProcessorSelectView: React.FC<CreateProcessorSelectViewProps> =
  ({ title, onBack, onSelect }) => {
    // TODO (dsvanlani) handle error and loading states
    const { data, loading, error } = useGetProcessorTypesQuery();
    const [search, setSearch] = useState("");

    const backButton: JSX.Element = (
      <Button variant="contained" color="secondary" onClick={onBack}>
        Back
      </Button>
    );

    return (
      <>
        <FormTitle
          title={title}
          crumbs={["Add a processor"]}
          description={"Select a processor type to configure."}
        />

        <ResourceTypeButtonContainer
          onSearchChange={(v: string) => setSearch(v)}
        >
          {data?.processorTypes
            .filter((pt) => metadataSatisfiesSubstring(pt, search))
            .map((p) => (
              <ResourceTypeButton
                key={`${p.metadata.name}`}
                icon={""}
                displayName={p.metadata.displayName!}
                onSelect={() => {
                  onSelect(p);
                }}
              />
            ))}
        </ResourceTypeButtonContainer>
        <ButtonFooter
          primaryButton={<></>}
          secondaryButton={<></>}
          backButton={backButton}
        />
      </>
    );
  };
