import { Button, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  DataGridProps,
  GridCellParams,
  GridColumns,
  GridSelectionModel,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { isFunction } from "lodash";
import { ComponentsQuery } from "../../../graphql/generated";
import { DestinationTypeCell, SourceTypeCell } from "./cells";

export enum ComponentsTableField {
  NAME = "name",
  KIND = "kind",
  TYPE = "type",
}

interface ComponentsDataGridProps
  extends Omit<DataGridProps, "columns" | "rows"> {
  onComponentsSelected?: (names: GridSelectionModel) => void;
  onEditDestination: (name: string) => void;
  queryData: ComponentsQuery;
  loading: boolean;
}

export const ComponentsDataGrid: React.FC<ComponentsDataGridProps> = ({
  onComponentsSelected,
  queryData,
  onEditDestination,
  ...dataGridProps
}) => {
  function renderNameCell(cellParams: GridCellParams<string>): JSX.Element {
    if (cellParams.row.kind === "Destination") {
      return (
        <Button
          variant="text"
          onClick={() => onEditDestination(cellParams.value!)}
        >
          {cellParams.value}
        </Button>
      );
    }

    return renderStringCell(cellParams);
  }

  const columns: GridColumns = [
    {
      field: ComponentsTableField.NAME,
      flex: 1,
      headerName: "Name",
      valueGetter: (params: GridValueGetterParams) => params.row.metadata.name,
      renderCell: renderNameCell,
    },
    {
      field: ComponentsTableField.KIND,
      flex: 1,
      headerName: "Kind",
      valueGetter: (params: GridValueGetterParams) => params.row.kind,
      renderCell: renderStringCell,
    },
    {
      field: ComponentsTableField.TYPE,
      flex: 1,
      headerName: "Type",
      valueGetter: (params: GridValueGetterParams) => params.row.spec.type,
      renderCell: renderTypeCell,
    },
  ];

  function handleSelect(s: GridSelectionModel) {
    isFunction(onComponentsSelected) && onComponentsSelected(s);
  }

  const rows = [...queryData.destinations, ...queryData.sources];

  return (
    <DataGrid
      {...dataGridProps}
      onSelectionModelChange={handleSelect}
      components={{
        NoRowsOverlay: () => (
          <Stack height="100%" alignItems="center" justifyContent="center">
            No Components
          </Stack>
        ),
      }}
      autoHeight
      getRowId={(row) => `${row.kind}|${row.metadata.name}`}
      columns={columns}
      rows={rows}
    />
  );
};

function renderTypeCell(cellParams: GridCellParams<string>): JSX.Element {
  return cellParams.row.kind === "Source" ? (
    <SourceTypeCell type={cellParams.value ?? ""} />
  ) : (
    <DestinationTypeCell type={cellParams.value ?? ""} />
  );
}

function renderStringCell(cellParams: GridCellParams<string>): JSX.Element {
  return <Typography>{cellParams.value}</Typography>;
}
