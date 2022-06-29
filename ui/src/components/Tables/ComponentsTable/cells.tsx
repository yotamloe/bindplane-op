import { gql } from "@apollo/client";
import {
  useGetDestinationTypeDisplayInfoQuery,
  useGetSourceTypeDisplayInfoQuery,
} from "../../../graphql/generated";

import styles from "./cells.module.scss";

interface ResourceTypeCellProps {
  type: string;
}

export const SourceTypeCell: React.FC<ResourceTypeCellProps> = ({ type }) => {
  const { data } = useGetSourceTypeDisplayInfoQuery({
    variables: { name: type },
  });
  return data?.sourceType ? (
    <div className={styles.cell}>
      <span
        className={styles.icon}
        style={{
          backgroundImage: `url(${data.sourceType?.metadata.icon ?? ""})`,
        }}
      />
      {data.sourceType?.metadata.displayName}
    </div>
  ) : (
    <div>{type}</div>
  );
};

export const DestinationTypeCell: React.FC<ResourceTypeCellProps> = ({
  type,
}) => {
  const { data } = useGetDestinationTypeDisplayInfoQuery({
    variables: { name: type },
  });
  return data?.destinationType ? (
    <div className={styles.cell}>
      <span
        className={styles.icon}
        style={{
          backgroundImage: `url(${data.destinationType?.metadata.icon ?? ""})`,
        }}
      />
      {data.destinationType?.metadata.displayName}
    </div>
  ) : (
    <div>{type}</div>
  );
};

gql`
  query getDestinationTypeDisplayInfo($name: String!) {
    destinationType(name: $name) {
      metadata {
        displayName
        icon
        name
      }
    }
  }
`;

gql`
  query getSourceTypeDisplayInfo($name: String!) {
    sourceType(name: $name) {
      metadata {
        displayName
        icon
        name
      }
    }
  }
`;
