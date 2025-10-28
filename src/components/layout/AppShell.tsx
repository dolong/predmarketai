import { ReactNode, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
} from "../ui/sidebar";
import {
  LayoutDashboard,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Target,
  MessageSquare,
  Rss,
  BarChart3,
  Settings,
  Search,
  Plus,
  User,
  Bot,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";

interface AppShellProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navigation = [
  {
    label: "Main",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "markets", label: "Markets", icon: Sparkles },
      { id: "questions", label: "Live Markets", icon: TrendingUp },
      { id: "resolve", label: "Resolve Markets", icon: Target },
      { id: "answers", label: "Market History", icon: MessageSquare },
      { id: "agents", label: "AI Agents", icon: Bot },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "reports", label: "Reports", icon: BarChart3 },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppShell({ children, currentPage, onNavigate }: AppShellProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 gradient-primary text-white rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm">Predictive Markets</h2>
              <p className="text-xs text-muted-foreground">AI Dashboard</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {navigation.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onNavigate(item.id)}
                        isActive={currentPage === item.id}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions, suggestions..."
                className="pl-10"
              />
            </div>
          </div>
          <Button size="sm" className="gradient-primary text-white border-0">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}