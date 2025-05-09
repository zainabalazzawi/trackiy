"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Ticket, TicketInput  } from "../types";


const defaultValues: TicketInput = {
  title: "",
  description: "",
  priority: "MEDIUM",
  assignee:  "",
  reporter:  "",
} as const;

interface CreateTicketFormProps {
  onSuccess?: () => void;
  projectId: string;
}


 const  CreateTicketForm = ({ onSuccess, projectId }: CreateTicketFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<Ticket>({
    defaultValues,
  });

  const { handleSubmit, reset, control } = form;

  const createTicket = async (data: Ticket) => {
    const response = await axios.post(`/api/projects/${projectId}/tickets`, data);
    return response.data;
  }
  const createTicketMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", projectId] });
      reset(defaultValues);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating ticket:', error);
    }
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit((data) => createTicketMutation.mutate(data))}
        className="space-y-6"
      >
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Ticket title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Ticket description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="reporter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reporter</FormLabel>
              <FormControl>
                <Input placeholder="reporter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="assignee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee</FormLabel>
              <FormControl>
                <Input placeholder="Assignee name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createTicketMutation.isPending}
          className="w-full"
        >
          {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
        </Button>
      </form>
    </Form>
  );
}


export default CreateTicketForm