"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BreadcrumbNav = () => {
  const pathname = usePathname();
  
  // Get project data if we're on a project or ticket page
  const projectId = pathname.split('/')[2]; // /projects/[id]/...
  const ticketId = pathname.split('/')[4]; // /projects/[id]/tickets/[ticketId]
  
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${projectId}`);
      return response.data;
    },
    enabled: !!projectId
  });

  const { data: ticket } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${projectId}/tickets/${ticketId}`);
      return response.data;
    },
    enabled: !!projectId && !!ticketId
  });

  const generateBreadcrumbs = () => {
    const breadcrumbs = [];
    
    // Always add home
    breadcrumbs.push({
      label: "Home",
      href: "/",
      isActive: pathname === "/",
    });

    // Add projects if we're in the projects section
    if (pathname.startsWith('/projects')) {
      breadcrumbs.push({
        label: "Projects",
        href: "/projects",
        isActive: pathname === "/projects",
      });

      // Add specific project if we have a project ID
      if (projectId && projectId !== 'create' && projectId !== 'recent') {
        breadcrumbs.push({
          label: project?.name || projectId,
          href: `/projects/${projectId}`,
          isActive: pathname === `/projects/${projectId}`,
        });

        // Add tickets if we're in the tickets section
        if (pathname.includes('/tickets')) {
          breadcrumbs.push({
            label: "Tickets",
            href: `/projects/${projectId}/tickets`,
            isActive: pathname === `/projects/${projectId}/tickets`,
          });

          // Add specific ticket if we have a ticket ID
          if (ticketId && ticket) {
            breadcrumbs.push({
              label: ticket.title || `Ticket ${ticket.ticketNumber}`,
              href: `/projects/${projectId}/tickets/${ticketId}`,
              isActive: true,
            });
          }
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <div className="px-6 py-2 bg-muted/30 border-b">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              <BreadcrumbItem>
                {breadcrumb.isActive ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbNav;
