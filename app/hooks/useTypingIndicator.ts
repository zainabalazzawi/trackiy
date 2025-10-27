import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatTypingMessage } from "@/lib/utils";

interface TypingUser {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export const useTypingIndicator = (ticketId: string, fieldId: string) => {
  const [isTyping, setIsTyping] = useState(false);

  // Poll for typing users using React Query
  const { data: typingUsers = [] } = useQuery<TypingUser[]>({
    queryKey: ["typing", ticketId, fieldId],
    queryFn: async () => {
      const response = await axios.get(`/api/typing`, {
        params: { ticketId, fieldId },
      });
      return response.data;
    },
    enabled: !!ticketId && !!fieldId,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Start typing indicator
  const startTyping = async () => {
    try {
      await axios.post("/api/typing", { ticketId, fieldId });
      setIsTyping(true);
    } catch (error) {
      console.error("Error starting typing indicator:", error);
    }
  };

  // Stop typing indicator
  const stopTyping = async () => {
    try {
      await axios.delete("/api/typing", {
        params: { ticketId, fieldId },
      });
      setIsTyping(false);
    } catch (error) {
      console.error("Error stopping typing indicator:", error);
    }
  };

  // Format typing message
  const getTypingMessage = () => {
    const names = typingUsers
      .map((u) => u.user.name)
      .filter(Boolean) as string[]; 
    
    return formatTypingMessage(names);
  };

  return {
    typingUsers,
    typingMessage: getTypingMessage(),
    startTyping,
    stopTyping,
    isTyping,
  };
};

