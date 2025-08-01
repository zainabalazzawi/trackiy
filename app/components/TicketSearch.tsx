"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from "@/app/types";
import { useTicketSearch } from "@/app/hooks/useTicketSearch";


const TicketSearch = () => {
  const { query, results, isLoading, setQuery, clearSearch } = useTicketSearch();
  const router = useRouter();

  const handleTicketClick = (ticket: Ticket) => {
  router.push(`/projects/${ticket.column.project?.id}/tickets/${ticket.id}`);
    clearSearch();
  };

  return (
    <div className="relative w-90 text-muted-foreground">
      <div>
        <Search className="absolute left-3 top-2.5 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search tickets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      {query.trim() && (
        <Card className="absolute w-full py-0 z-10">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                Searching...
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleTicketClick(result)}
                  className="p-1 px-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                >
                  <div className="text-[16px] font-normal">{result.title}</div>
                    <span className="text-xs text-gray-700 font-medium">
                      {result?.column?.project?.name}
                    </span>
              
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                No tickets found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketSearch; 