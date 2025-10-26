"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Home,
  Video,
  Library,
  Settings,
  BarChart3,
  Download,
  Palette,
  Wand2,
  Users,
  MessageSquare,
  Play,
  Phone,
  User2,
  LogOut,
  Link2,
  Clapperboard,
  Calendar,
} from "lucide-react";

const navigationItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Video Library",
    url: "/dashboard/library",
    icon: Library,
  },
  {
    title: "Connected Accounts",
    url: "/dashboard/accounts",
    icon: Users,
  },
  {
    title: "Scheduled Content",
    url: "/dashboard/calendar",
    icon: Calendar,
  },
  // {
  //   title: "Connect Accounts",
  //   url: "/dashboard/accounts",
  //   icon: Link2,
  // },
  // {
  //   title: "My Projects",
  //   url: "/dashboard/projects",
  //   icon: Video,
  // },
  // {
  //   title: "Analytics",
  //   url: "/dashboard/analytics",
  //   icon: BarChart3,
  // },
  // {
  //   title: "Exports",
  //   url: "/dashboard/exports",
  //   icon: Download,
  // },
];

const contentCreationItems = [
  {
    title: "Make Carousel",
    url: "/dashboard/carousel",
    icon: Wand2,
  },
  {
    title: "Make Video",
    url: "/dashboard/video",
    icon: MessageSquare,
  },
  // {
  //   title: "Wall of Text",
  //   url: "/dashboard/wall-of-text",
  //   icon: MessageSquare,
  // },
];

const toolsItems = [
  {
    title: "Bulk Creator",
    url: "/dashboard/bulk",
    icon: Users,
  },
  {
    title: "Custom Templates",
    url: "/dashboard/templates",
    icon: Palette,
  },
];
import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { BrandLogo } from "./brand-logo";
import { url } from "inspector";
// We don't need this import as DropdownMenuContent is included in ./ui/dropdown-menu

export function AppSidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const { open, setOpen, isMobile } = useSidebar();
  return (
    <Sidebar
      className="border-r border-sidebar-border overflow-x-hidden"
      // variant="floating"
      collapsible="icon"
    >
      <SidebarHeader className="">
        {/* <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Play className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">
            ReelForge
          </span>
        </div> */}
        <Link href="/dashboard">
          {open ? (
            <div className="flex flex-row items-center">
              <BrandLogo className="hover:opacity-40" />
              {/* <SidebarTrigger className="ml-auto" /> */}
            </div>
          ) : (
            // <SidebarTrigger />
            <></>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link
                      href={item.url}
                      className="flex items-center space-x-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Create Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentCreationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link
                      href={item.url}
                      className="flex items-center space-x-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 hover:bg-transparent">
              <Avatar>
                <AvatarImage
                  src={user?.user_metadata.avatar_url}
                  alt="User Avatar"
                />
                <AvatarFallback>
                  <User2 />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-x-hidden">
                <p className="font-semibold">{user?.user_metadata.full_name}</p>
                <p className="text-md truncate">{user?.email}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-max-56">
            <DropdownMenuLabel className="">
              <div className="flex items-center gap-3 min-w-0 mb-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user?.user_metadata.avatar_url}
                    alt="User Avatar"
                  />
                  <AvatarFallback>
                    <User2 />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {user?.user_metadata.full_name ?? "Account"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email ?? "—"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className="my-1 p-0">
                <form action="/auth/signout" method="post" className="w-full">
                  <Button
                    type="submit"
                    className="w-full rounded-none"
                    variant={"destructive"}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </Button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
