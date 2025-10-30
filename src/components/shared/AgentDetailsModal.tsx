import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Agent, ProposedQuestion, AgentSourceType } from "../../lib/types";
import { mockProposedQuestions } from "../../lib/mock-data";
import { formatDateTime, cn } from "../../lib/utils";
import {
  Globe,
  LinkIcon,
  Twitter,
  FileJson,
  Play,
  Pause,
  Settings,
  Calendar,
  TrendingUp,
  Sparkles,
  Clock,
  Tag,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface AgentDetailsModalProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditAgent?: (agent: Agent) => void;
  onRunAgent?: (agentId: string) => void;
  onTogglePause?: (agentId: string) => void;
}


export function AgentDetailsModal({
  agent,
  open,
  onOpenChange,
  onEditAgent,
  onRunAgent,
  onTogglePause,
}: AgentDetailsModalProps) {
  const [generatedQuestions, setGeneratedQuestions] = useState<ProposedQuestion[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (agent && open) {
      // Filter questions by this specific agent
      const agentQuestions = mockProposedQuestions.filter(q => q.agentId === agent.id);
      setGeneratedQuestions(agentQuestions);
    }
  }, [agent, open]);

  if (!agent) return null;

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

  const handleRunNow = async () => {
    setIsRunning(true);

    try {
      // Get the API endpoint from the agent's source configuration
      const apiSource = agent.sources.find(source => source.type === 'api');
      const apiEndpoint = apiSource?.config?.apiEndpoint || 'https://theanomaly.app.n8n.cloud/webhook/getbtcdata?ticker=btc';

      const requestBody = {
        Question: agent.questionPrompt
      };

      // Make API call to generate question
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate question: ${response.status}`);
      }

      const responseText = await response.text();

      if (!responseText || responseText.length === 0) {
        throw new Error('API returned empty response');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`API returned invalid JSON: ${responseText}`);
      }

      // Generate current Bitcoin price for mock data (between $65,000 - $75,000)
      const currentPrice = Math.floor(Math.random() * 10000 + 65000);
      const targetPrice = Math.floor(Math.random() * 5000 + currentPrice - 2500);

      // Create new question with API response and mock data
      const newQuestion: ProposedQuestion = {
        id: `gq${Date.now()}`,
        title: data.question || `Will Bitcoin close above $${targetPrice.toLocaleString()} today?`,
        description: `dummy desc.`,
        liveDate: new Date(),
        proposedAnswerEndAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        proposedSettlementAt: new Date(Date.now() + 25 * 60 * 60 * 1000), // 25 hours from now
        resolutionCriteria: `dummy resolution desc.`,
        agentId: agent.id,
        aiScore: Math.random() * 0.1 + 0.85, // Random score between 0.85-0.95
        riskFlags: [],
        createdAt: new Date(),
        categories: ['Cryptocurrency', 'Bitcoin'],
        type: 'binary',
      };

      // Add new question to the beginning of the list
      setGeneratedQuestions(prev => [newQuestion, ...prev]);

      setIsRunning(false);
      onRunAgent?.(agent.id);
      toast.success("New question generated successfully!");

    } catch (error) {
      console.error('Error generating question:', error);

      // Fallback to mock generation if API fails
      const fallbackPrice = Math.floor(Math.random() * 5000 + 67000);
      const newQuestion: ProposedQuestion = {
        id: `gq${Date.now()}`,
        title: `Will Bitcoin close above $${fallbackPrice.toLocaleString()} today?`,
        description: 'A daily prediction market asking whether Bitcoin will close above today\'s target price (API fallback).',
        liveDate: new Date(),
        proposedAnswerEndAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        proposedSettlementAt: new Date(Date.now() + 25 * 60 * 60 * 1000),
        resolutionCriteria: `Resolves YES if Bitcoin closes above $${fallbackPrice.toLocaleString()} today based on major exchanges.`,
        agentId: agent.id,
        aiScore: Math.random() * 0.1 + 0.85,
        riskFlags: ['api-error'],
        createdAt: new Date(),
        categories: ['Cryptocurrency', 'Bitcoin'],
        type: 'binary',
      };

      setGeneratedQuestions(prev => [newQuestion, ...prev]);
      setIsRunning(false);
      onRunAgent?.(agent.id);
      toast.error("API call failed, generated fallback question");
    }
  };

  const handleEdit = () => {
    onEditAgent?.(agent);
    onOpenChange(false);
  };

  const handleTogglePause = () => {
    onTogglePause?.(agent.id);
  };

  // Category color mapping
  const categoryColors: Record<string, string> = {
    'Cryptocurrency': 'bg-orange-100 text-orange-700 border-orange-200',
    'Bitcoin': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Finance': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Technology': 'bg-blue-100 text-blue-700 border-blue-200',
    'AI': 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] sm:w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-3 flex-wrap">
                {agent.name}
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
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {agent.description}
              </DialogDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleEdit}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleTogglePause}
              >
                {agent.status === 'paused' ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                onClick={handleRunNow}
                disabled={isRunning}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Running...' : 'Run Now'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Sources</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {agent.sources.map((source, idx) => (
                    <Badge key={idx} variant="outline" className="gap-1">
                      {getSourceIcon(source.type)}
                      {source.type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {getFrequencyLabel(agent.frequency)}
                </Badge>
                <div className="mt-2 text-xs text-muted-foreground">
                  {agent.nextRun && (
                    <p>Next: {formatDateTime(agent.nextRun)}</p>
                  )}
                  {agent.lastRun && (
                    <p>Last: {formatDateTime(agent.lastRun)}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{agent.questionsCreated}</div>
                <div className="text-xs text-muted-foreground">Questions Created</div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Questions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl">🔥 Generated Questions</h2>
                <Badge variant="secondary">{generatedQuestions.length}</Badge>
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Full width questions list */}
            <div className="space-y-4">
              {generatedQuestions.slice(0, 6).map((question, index) => (
                <Card
                  key={question.id}
                  className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden"
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    index === 0 ? 'from-violet-500/10 to-purple-500/10' :
                    index === 1 ? 'from-blue-500/10 to-cyan-500/10' :
                    index === 2 ? 'from-pink-500/10 to-rose-500/10' :
                    index === 3 ? 'from-emerald-500/10 to-teal-500/10' :
                    'from-orange-500/10 to-amber-500/10'
                  } opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <CardContent className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            AI Score: {(question.aiScore * 100).toFixed(0)}%
                          </Badge>
                          {index === 0 && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              ✨ Latest
                            </Badge>
                          )}
                        </div>

                        <div>
                          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors mb-2">
                            {question.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 break-words">
                            {question.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                            {question.categories.map((category) => (
                              <Badge
                                key={category}
                                variant="outline"
                                className={categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-200'}
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Ends {question.proposedAnswerEndAt.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              <span>Generated by AI</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Agent Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {agent.questionPrompt}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resolution Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {agent.resolutionPrompt}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}