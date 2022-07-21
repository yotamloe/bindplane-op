import { gql, OnSubscriptionDataOptions } from "@apollo/client";
import { Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  LivetailSubscription,
  useLivetailSubscription,
} from "../../graphql/generated";
import styles from "./live-tail-console.module.scss";
import { LTSearchBar } from "./SearchBar";

interface Props {
  ids: string[];
}

type Record = LivetailSubscription["livetail"][0]["records"][0];

gql`
  subscription livetail($ids: [String!]!, $filters: [String!]!) {
    livetail(agentIds: $ids, filters: $filters) {
      type
      records
    }
  }
`;

export const LiveTailConsole: React.FC<Props> = ({ ids }) => {
  const [filters, setFilters] = useState<string[]>([]);
  const [rows, setRows] = useState<Record[]>([]);

  const consoleRef = useRef<HTMLDivElement | null>(null);
  const lastRowRef = useRef<HTMLDivElement | null>(null);

  useLivetailSubscription({
    variables: { ids, filters },
    onSubscriptionData: ({
      subscriptionData,
    }: OnSubscriptionDataOptions<LivetailSubscription>) => {
      const { data } = subscriptionData;
      if (data == null) return;

      let records: Record[] = [];
      for (const message of data.livetail) {
        records = records.concat(...message.records);
      }
      setRows((prev) => [...prev, ...records]);
    },
  });

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [rows]);

  function handleFilterChange(v: string[]) {
    setFilters(v);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.dt}>Time</div>
        <div className={styles.lg}>Message</div>
      </div>
      <div className={styles.console} ref={consoleRef} onScroll={() => {}}>
        {rows.map((row) => (
          <Stack direction="row">
            <div className={styles.dt}>{row.timestamp}</div>
            <div className={styles.lg}>{row.body}</div>
          </Stack>
        ))}
      </div>
      <div ref={lastRowRef} />

      <LTSearchBar value={filters} onValueChange={handleFilterChange} />
    </div>
  );
};
