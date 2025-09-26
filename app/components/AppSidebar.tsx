"use client";

import { useState } from "react";
import {
  Home,
  ListFilter,
  Clock,
  Settings,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import RecentProjectsCard from "./RecentProjectsCard";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar() {
  const [isRecentCardOpen, setIsRecentCardOpen] = useState(false);

  // Menu items.
  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Recent",
      url: "#",
      icon: Clock,
      onClick: () => setIsRecentCardOpen(true),
    },
    {
      title: "Filter",
      url: "#",
      icon: ListFilter,
      subItems: [
        {
          title: "All work items",
          url: "/items",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Ttackiy</SidebarGroupLabel>
          <SidebarGroupContent>
             <SidebarMenu>
               {items.map((item) =>
                 item.subItems ? 
                 
                 (
                   <Collapsible
                     key={item.title}
                     defaultOpen
                     className="group/collapsible"
                   >
                     <SidebarMenuItem>
                       <CollapsibleTrigger asChild>
                         <SidebarMenuButton>
                           <item.icon />
                           <span>{item.title}</span>
                           <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                         </SidebarMenuButton>
                       </CollapsibleTrigger>
                       <CollapsibleContent>
                         <SidebarMenuSub>
                           {item.subItems.map((subItem) => (
                             <SidebarMenuSubItem key={subItem.title}>
                               <SidebarMenuSubButton asChild>
                                 <Link href={subItem.url}>
                                   <span>{subItem.title}</span>
                                 </Link>
                               </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                           ))}
                         </SidebarMenuSub>
                       </CollapsibleContent>
                     </SidebarMenuItem>
                   </Collapsible>
                 ) : item.onClick ? (
                   <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton onClick={item.onClick}>
                       <item.icon />
                       <span>{item.title}</span>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                 ) : (
                   <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton asChild>
                       <Link href={item.url}>
                         <item.icon />
                         <span>{item.title}</span>
                       </Link>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                 )
               )}
             </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <RecentProjectsCard 
        isOpen={isRecentCardOpen} 
        onClose={() => setIsRecentCardOpen(false)} 
      />
    </Sidebar>
  );
}
