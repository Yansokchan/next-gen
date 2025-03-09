import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, Edit, Trash, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string | React.ReactNode | (() => React.ReactNode);
  accessorKey?: keyof T | string | ((data: T) => React.ReactNode);
  cell?: ({ row }: { row: { original: T } }) => React.ReactNode;
  id?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId?: (row: T) => string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  searchable?: boolean;
  searchKeys?: Array<keyof T>;
  basePath?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  getRowId = (row) => row.id,
  onView,
  onEdit,
  onDelete,
  searchable = true,
  searchKeys = [],
  basePath,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Filter data based on search query
  const filteredData =
    searchable && searchQuery
      ? data.filter((item) => {
          return searchKeys.some((key) => {
            const value = item[key];
            if (typeof value === "string") {
              return value.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return false;
          });
        })
      : data;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handlers
  const handleView = (id: string) => {
    if (onView) {
      onView(id);
    } else if (basePath) {
      navigate(`${basePath}/${id}`);
    }
  };

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id);
    } else if (basePath) {
      navigate(`${basePath}/${id}/edit`);
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {searchable && (
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 focus-ring"
          />
        </div>
      )}

      <div className="rounded-lg border glass-card overflow-hidden animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="bg-secondary/40 font-medium">
                  {typeof column.header === 'function' 
                    ? column.header()
                    : column.header}
                </TableHead>
              ))}
              <TableHead className="bg-secondary/40 w-[80px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center text-muted-foreground py-6"
                >
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  className="hover:bg-secondary/30 transition-colors group"
                >
                  {columns.map((column, index) => (
                    <TableCell key={index} className={cn(
                      typeof column.accessorKey === "function" ? "" : 
                      typeof column.cell === "function" ? "" :
                      column.accessorKey === "price" || column.accessorKey === "total" ? "text-center" : ""
                    )}>
                      {typeof column.accessorKey === "function"
                        ? column.accessorKey(row)
                        : column.cell
                        ? column.cell({ row: { original: row } })
                        : String(row[column.accessorKey as keyof T] || "")}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                          onClick={() => handleView(getRowId(row))}
                        >
                          <Eye size={16} className="mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(getRowId(row))}
                        >
                          <Edit size={16} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(getRowId(row))}
                          className="text-destructive focus:text-destructive hover:!text-destructive hover:!bg-destructive/10 font-medium"
                        >
                          <Trash size={16} className="mr-2 text-destructive" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={cn(
                  currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                )}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className={cn(
                  currentPage === totalPages
                    ? "opacity-50 pointer-events-none"
                    : ""
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
