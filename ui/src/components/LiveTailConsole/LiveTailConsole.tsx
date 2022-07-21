import { gql, OnSubscriptionDataOptions } from "@apollo/client";
import {
  Card,
  Collapse,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  LivetailSubscription,
  useLivetailSubscription,
} from "../../graphql/generated";
import { ChevronDown } from "../Icons";
import styles from "./live-tail-console.module.scss";
import { LTSearchBar } from "./SearchBar";

interface Props {
  ids: string[];
}

type Record = LivetailSubscription["livetail"][0]["records"][0];

const ROWS: Record[] = [
  {
    timestamp: Date.now().toString(),
    a: "b",
    foo: "bar",
    blah: "foo",
  },
  {
    timestamp: Date.now().toString(),
    a: "b",
    foo: "bar",
    blah: "foo",
  },
  {
    timestamp: Date.now().toString(),
    a: "b",
    foo: "bar",
    blah: "foo",
  },
  {
    timestamp: Date.now().toString(),
    a: "b",
    foo: "bar",
    blah: "foo",
  },
  {
    timestamp: Date.now().toString(),
    a: "b",
    foo: "bar",
    blah: "foo",
  },
];

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
      <div className={styles.console} ref={consoleRef} onScroll={() => {}}>
        <div className={styles.header}>
          <div className={styles.ch} />
          <div className={styles.dt}>Time</div>
          <div className={styles.lg}>Message</div>
        </div>
        {rows.map((row) => (
          <LiveTailRow record={row} />
        ))}
      </div>
      <div ref={lastRowRef} />

      <LTSearchBar value={filters} onValueChange={handleFilterChange} />
    </div>
  );
};

const LiveTailRow: React.FC<{ record: Record }> = ({ record }) => {
  const { timestamp, ...rest } = record;
  const [open, setOpen] = useState(false);

  return (
    <Card
      onClick={() => setOpen((prev) => !prev)}
      classes={{ root: styles.card }}
    >
      <Stack direction="row">
        <div className={styles.ch}>
          <ChevronDown className={styles.chevron} />
        </div>
        <div className={styles.dt}>{record.timestamp}</div>
        <div className={styles.lg}>{record.body}</div>
      </Stack>
      <Collapse in={open}>
        <div className={styles["table-container"]}>
          <Table padding="none" size="small">
            <TableBody>
              {Object.entries(rest).map(([k, v]) => (
                <TableRow>
                  <TableCell className={styles.key}>{k}</TableCell>
                  <TableCell className={styles.value}>{v as any}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Collapse>
    </Card>
  );
};
