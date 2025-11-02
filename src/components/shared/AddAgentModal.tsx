import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { AgentSourceType, AgentFrequency, Agent, AgentSource } from "../../lib/types";
import { toast } from "sonner@2.0.3";
import { Plus, X, Globe, Link as LinkIcon, Twitter, FileJson } from "lucide-react";

interface AddAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (agent: Partial<Agent>) => void;
  templateAgent?: Agent | null;
}

export function AddAgentModal({
  open,
  onOpenChange,
  onSave,
  templateAgent,
}: AddAgentModalProps) {
  const [name, setName] = useState(templateAgent?.name || "");
  const [description, setDescription] = useState(templateAgent?.description || "");
  const [category, setCategory] = useState(templateAgent?.category || "");
  const [sources, setSources] = useState<AgentSource[]>(templateAgent?.sources || []);
  const [questionPrompt, setQuestionPrompt] = useState(templateAgent?.questionPrompt || "");
  const [resolutionPrompt, setResolutionPrompt] = useState(templateAgent?.resolutionPrompt || "");
  const [baseModel, setBaseModel] = useState(templateAgent?.baseModel || "chatgpt-4o-latest");
  const [frequency, setFrequency] = useState<AgentFrequency>(templateAgent?.frequency || "on_update");
  
  const [newSourceType, setNewSourceType] = useState<AgentSourceType | "">("");
  const [newSourceConfig, setNewSourceConfig] = useState("");

  const handleAddSource = () => {
    if (!newSourceType || !newSourceConfig) {
      toast.error("Please select a source type and provide configuration");
      return;
    }

    const config: any = {};
    
    switch (newSourceType) {
      case 'website':
        config.url = newSourceConfig;
        break;
      case 'api':
        config.apiEndpoint = newSourceConfig;
        break;
      case 'x':
        config.url = newSourceConfig;
        break;
      case 'reddit':
        config.subreddit = newSourceConfig;
        break;
      case 'feed':
        config.feedUrl = newSourceConfig;
        break;
    }

    setSources([...sources, { type: newSourceType, config }]);
    setNewSourceType("");
    setNewSourceConfig("");
  };

  const handleRemoveSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name || !questionPrompt || !resolutionPrompt || sources.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const agent: Partial<Agent> = {
      name,
      description,
      category,
      sources,
      questionPrompt,
      resolutionPrompt,
      baseModel,
      frequency,
      status: 'active',
      questionsCreated: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onSave(agent);
    onOpenChange(false);
    toast.success("Agent created successfully");
  };

  const getSourceIcon = (type: AgentSourceType) => {
    switch (type) {
      case 'website':
        return <Globe className="h-4 w-4" />;
      case 'api':
        return <LinkIcon className="h-4 w-4" />;
      case 'x':
        return <Twitter className="h-4 w-4" />;
      case 'reddit':
        return <FileJson className="h-4 w-4" />;
      case 'feed':
        return <FileJson className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (source: AgentSource) => {
    switch (source.type) {
      case 'website':
        return source.config.url;
      case 'api':
        return source.config.apiEndpoint;
      case 'x':
        return source.config.url;
      case 'reddit':
        return `r/${source.config.subreddit}`;
      case 'feed':
        return source.config.feedUrl;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {templateAgent ? `Create Agent: ${templateAgent.name}` : "Create New Agent"}
          </DialogTitle>
          <DialogDescription>
            Configure an AI agent to automatically generate prediction market questions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Agent Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Elon Market Agent"
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent do?"
              className="mt-2 min-h-[80px]"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Cryptocurrency, Technology, Finance"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Questions created by this agent will inherit this category
            </p>
          </div>

          {/* Sources */}
          <div>
            <Label>Sources *</Label>
            <div className="mt-2 space-y-3">
              {sources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sources.map((source, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-2 pr-1 py-1.5"
                    >
                      {getSourceIcon(source.type)}
                      <span className="text-xs">{source.type}</span>
                      <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {getSourceLabel(source)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-transparent"
                        onClick={() => handleRemoveSource(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Select
                  value={newSourceType}
                  onValueChange={(value) => setNewSourceType(value as AgentSourceType)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website (scrape)
                      </div>
                    </SelectItem>
                    <SelectItem value="api">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        API
                      </div>
                    </SelectItem>
                    <SelectItem value="x">
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4" />
                        X
                      </div>
                    </SelectItem>
                    <SelectItem value="reddit">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        Reddit (Subreddit)
                      </div>
                    </SelectItem>
                    <SelectItem value="feed">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        Feed (JSON)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={newSourceConfig}
                  onChange={(e) => setNewSourceConfig(e.target.value)}
                  onBlur={handleAddSource}
                  placeholder={
                    newSourceType === "website"
                      ? "https://example.com"
                      : newSourceType === "api"
                      ? "https://api.example.com/endpoint"
                      : newSourceType === "x"
                      ? "https://x.com/username"
                      : newSourceType === "reddit"
                      ? "Subreddit name (without r/)"
                      : newSourceType === "feed"
                      ? "https://feed.example.com/data.json"
                      : "Configure source..."
                  }
                  className="flex-1"
                />

                <Button onClick={handleAddSource} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Question Generation Prompt */}
          <div>
            <Label htmlFor="questionPrompt">Question Generation Prompt *</Label>
            <Textarea
              id="questionPrompt"
              value={questionPrompt}
              onChange={(e) => setQuestionPrompt(e.target.value)}
              placeholder="e.g., Create a question based on Elon Musk's latest tweet"
              className="mt-2 min-h-[100px]"
            />
          </div>

          {/* Resolution Prompt */}
          <div>
            <Label htmlFor="resolutionPrompt">Resolution Prompt *</Label>
            <Textarea
              id="resolutionPrompt"
              value={resolutionPrompt}
              onChange={(e) => setResolutionPrompt(e.target.value)}
              placeholder="e.g., Answer the question by researching the web and finding the answer."
              className="mt-2 min-h-[100px]"
            />
          </div>

          {/* Base Model */}
          <div>
            <Label htmlFor="baseModel">AI Model *</Label>
            <Select value={baseModel} onValueChange={setBaseModel}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chatgpt-4o-latest">ChatGPT 4o (Latest)</SelectItem>
                <SelectItem value="chatgpt-4o">ChatGPT 4o</SelectItem>
                <SelectItem value="chatgpt-4-turbo">ChatGPT 4 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div>
            <Label htmlFor="frequency">How often should this agent run? *</Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as AgentFrequency)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Every Day</SelectItem>
                <SelectItem value="on_update">Every Update</SelectItem>
                <SelectItem value="weekly">Every Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Create Agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
