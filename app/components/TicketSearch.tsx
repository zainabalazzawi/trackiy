"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from "@/app/types";
import { useTicketSearch } from "@/app/hooks/useTicketSearch";
import SearchInput from "./SearchInput";

const TicketSearch = () => {
  const { query, results, isLoading, setQuery, clearSearch } = useTicketSearch();
  const router = useRouter();

  const handleTicketClick = (ticket: Ticket) => {
    router.push(`/projects/${ticket.column.project?.id}/tickets/${ticket.id}`);
    clearSearch();
  };

  console.log(results.map((result) => result.ticketNumber));
  
  return (
    <div className="relative sm:w-90 text-muted-foreground">
      <SearchInput
        placeholder="Search tickets..."
        value={query}
        onChange={setQuery}
      />
      
      {query.trim() && (
        <Card className="absolute w-full py-0 z-10">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-sm">
                Searching...
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleTicketClick(result)}
                  className="p-2 px-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                >
                  <div className="text-xs sm:text-sm font-normal">
                    {result.ticketNumber} &nbsp; {result.title}
                  </div>
                  <span className="text-xs text-gray-700 font-medium">
                    {result?.column?.project?.name}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm">
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