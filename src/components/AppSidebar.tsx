import { Link, useRouterState } from "@tanstack/react-router";
import { Building, LayoutGrid, Sparkles } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { COLLEGE_SHORT } from "@/lib/college";

const items = [
  { title: "Company Intelligence", url: "/company/intelligence", icon: Building },
  { title: "Skill Intelligence", url: "/company/skills", icon: Sparkles },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex h-10 items-center gap-2 px-1">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary font-heading text-xs font-bold text-primary-foreground">
            {COLLEGE_SHORT.charAt(0)}
          </span>
          {!collapsed && <span className="font-heading text-sm font-semibold">{COLLEGE_SHORT} Placement Hub</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Research</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={path === item.url} tooltip={item.title}>
                  <Link to={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="All Companies">
              <Link to="/"><LayoutGrid className="h-4 w-4" /><span>All Companies</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
