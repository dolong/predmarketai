import { useState } from "react";
import { PageHeader } from "../components/shared/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { AddAgentModal } from "../components/shared/AddAgentModal";
import { EditAgentModal } from "../components/shared/EditAgentModal";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Settings, 
  Trash2,
  Globe,
  Link as LinkIcon,
  Twitter,
  FileJson,
  Sparkles,
} from "lucide-react";
import { mockAgents } from "../lib/mock-data";
import { Agent, AgentSource, AgentSourceType } from "../lib/types";
import { formatDateTime } from "../lib/utils";
import { toast } from "sonner@2.0.3";

interface AgentsProps {
  onNavigate: (page: string) => void;
}

export function Agents({ onNavigate }: AgentsProps) {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [searchQuery, setSearchQuery] = useState("");
  const [addAgentOpen, setAddAgentOpen] = useState(false);
  const [editAgentOpen, setEditAgentOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Agent | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const templateAgents = agents.filter(a => a.isTemplate);
  const customAgents = filteredAgents.filter(a => !a.isTemplate);

  const handleAddAgent = (agent: Partial<Agent>) => {
    const newAgent: Agent = {
      id: `agent${agents.length + 1}`,
      name: agent.name!,
      description: agent.description || "",
      sources: agent.sources!,
      questionPrompt: agent.questionPrompt!,
      resolutionPrompt: agent.resolutionPrompt!,
      frequency: agent.frequency!,
      status: agent.status || 'active',
      questionsCreated: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setAgents([...agents, newAgent]);
  };

  const handleUseTemplate = (template: Agent) => {
    setSelectedTemplate(template);
    setAddAgentOpen(true);
  };

  const handleCloseModal = () => {
    setAddAgentOpen(false);
    setSelectedTemplate(null);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditAgentOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditAgentOpen(false);
    setSelectedAgent(null);
  };

  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgents(agents.map(a => a.id === updatedAgent.id ? updatedAgent : a));
  };

  const handleRunAgent = (agentId: string) => {
    toast.success("Agent run started");
  };

  const handlePauseAgent = (agentId: string) => {
    setAgents(agents.map(a => 
      a.id === agentId ? { ...a, status: a.status === 'paused' ? 'active' : 'paused' as const } : a
    ));
    toast.success("Agent status updated");
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(agents.filter(a => a.id !== agentId));
    toast.success("Agent deleted");
  };

  const getSourceIcon = (type: AgentSourceType) => {
    switch (type) {
      case 'website':
        return <Globe className="h-3 w-3" />;
      case 'api':
        return <LinkIcon className="h-3 w-3" />;
      case 'x':
        return <Twitter className="h-3 w-3" />;
      case 'reddit':
        return <FileJson className="h-3 w-3" />;
      case 'feed':
        return <FileJson className="h-3 w-3" />;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Every Day';
      case 'on_update':
        return 'Every Update';
      case 'weekly':
        return 'Every Week';
      default:
        return frequency;
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Agents"
        description="Configure AI agents to automatically generate prediction market questions from various sources"
        actions={
          <Button onClick={() => setAddAgentOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        }
      />

      {/* Template Cards */}
      <div className="mb-8">
        <h2 className="text-xl mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Agent Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templateAgents.map((template) => (
            <Card 
              key={template.id}
              className="hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => handleUseTemplate(template)}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  {template.name}
                  <Badge variant="outline" className="border-purple-500 text-purple-700">
                    Template
                  </Badge>
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {template.sources.map((source, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 text-xs">
                        {getSourceIcon(source.type)}
                        {source.type}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Frequency: {getFrequencyLabel(template.frequency)}
                  </div>
                  <Button 
                    className="w-full group-hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template);
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Agents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Agents</CardTitle>
              <CardDescription>Manage and monitor your active AI agents</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead>Sources</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Questions Created</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No custom agents yet. Create one using a template or start from scratch.
                  </TableCell>
                </TableRow>
              ) : (
                customAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {agent.sources.map((source, idx) => (
                          <Badge key={idx} variant="outline" className="gap-1 text-xs">
                            {getSourceIcon(source.type)}
                            {source.type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getFrequencyLabel(agent.frequency)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={agent.status === 'active' ? 'default' : 'secondary'}
                        className={
                          agent.status === 'active'
                            ? 'bg-green-600'
                            : agent.status === 'paused'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }
                      >
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.questionsCreated}</TableCell>
                    <TableCell>
                      {agent.lastRun ? formatDateTime(agent.lastRun) : '-'}
                    </TableCell>
                    <TableCell>
                      {agent.nextRun ? formatDateTime(agent.nextRun) : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRunAgent(agent.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Run Now
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePauseAgent(agent.id)}>
                            <Pause className="h-4 w-4 mr-2" />
                            {agent.status === 'paused' ? 'Resume' : 'Pause'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditAgent(agent)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
        </CardContent>
      </Card>

      <AddAgentModal
        open={addAgentOpen}
        onOpenChange={handleCloseModal}
        onSave={handleAddAgent}
        templateAgent={selectedTemplate}
      />

      <EditAgentModal
        open={editAgentOpen}
        onOpenChange={handleCloseEditModal}
        onSave={handleUpdateAgent}
        agent={selectedAgent}
      />
    </div>
  );
}
