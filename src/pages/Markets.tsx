import { useState } from "react";
import { PageHeader } from "../components/shared/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Sparkles, Check, X, ChevronDown, ChevronRight, Search, Clock, Tag, TrendingUp } from "lucide-react";
import { CardHeader, CardTitle } from "../components/ui/card";
import { mockProposedQuestions, mockAgents } from "../lib/mock-data";
import { ProposedQuestion, Agent } from "../lib/types";
import { formatDate, formatDateTime } from "../lib/utils";
import { EmptyState } from "../components/shared/EmptyState";
import { QuestionDetailsModal } from "../components/shared/QuestionDetailsModal";
import { toast } from "sonner@2.0.3";

interface MarketsProps {
  onNavigate: (page: string) => void;
}

export function Markets({ onNavigate }: MarketsProps) {
  const [proposals, setProposals] = useState<ProposedQuestion[]>(mockProposedQuestions);
  const [queuedProposals, setQueuedProposals] = useState<ProposedQuestion[]>([]);
  const [deletedProposals, setDeletedProposals] = useState<ProposedQuestion[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ProposedQuestion | null>(null);
  const [activeTab, setActiveTab] = useState<"suggestions" | "queued" | "deleted">("queued");
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilters, setSourceFilters] = useState({
    twitter: true,
    news: true,
    meme: true,
  });
  const [typeFilters, setTypeFilters] = useState({
    binary: true,
    multiOption: true,
  });

  // Helper function to get agent name from a proposal
  const getAgentName = (proposal: ProposedQuestion): string => {
    const agent = mockAgents.find(a => a.id === proposal.agentId);
    return agent?.name || 'Unknown Agent';
  };

  // Filter proposals based on search term, source filters, and type filters
  const currentList = activeTab === "suggestions" ? proposals : activeTab === "queued" ? queuedProposals : deletedProposals;
  const filteredProposals = currentList.filter((proposal) => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Agent filter - for now we'll match all since we removed source filtering
    const matchesSource = true;
    
    // Type filter
    const proposalType = proposal.type || 'binary';
    const matchesType = proposalType === 'binary' ? typeFilters.binary : typeFilters.multiOption;
    
    return matchesSearch && matchesSource && matchesType;
  });

  const handleToggleSourceFilter = (source: keyof typeof sourceFilters) => {
    setSourceFilters(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const handleToggleTypeFilter = (type: keyof typeof typeFilters) => {
    setTypeFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      setGenerateOpen(false);
      toast.success("Generated 3 new question proposals");
    }, 2000);
  };

  const handleApprove = (id: string) => {
    const question = proposals.find((p) => p.id === id);
    if (question) {
      toast.success("Question approved and moved to queued");
      setQueuedProposals([...queuedProposals, question]);
      setProposals(proposals.filter((p) => p.id !== id));
    }
  };

  const handleReject = (id: string) => {
    const question = proposals.find((p) => p.id === id);
    if (question) {
      toast.success("Question rejected");
      setDeletedProposals([...deletedProposals, question]);
      setProposals(proposals.filter((p) => p.id !== id));
    }
  };

  const handleApproveFromModal = (question: ProposedQuestion) => {
    if (activeTab === "suggestions") {
      setQueuedProposals([...queuedProposals, question]);
      setProposals(proposals.filter((p) => p.id !== question.id));
    }
    setDeletedProposals(deletedProposals.filter((p) => p.id !== question.id));
  };

  const handleRejectFromModal = (question: ProposedQuestion) => {
    if (activeTab === "suggestions") {
      setDeletedProposals([...deletedProposals, question]);
      setProposals(proposals.filter((p) => p.id !== question.id));
    } else if (activeTab === "queued") {
      setDeletedProposals([...deletedProposals, question]);
      setQueuedProposals(queuedProposals.filter((p) => p.id !== question.id));
    }
  };

  const handleBatchApprove = () => {
    toast.success(`Approved ${proposals.length} questions and moved to queued`);
    setQueuedProposals([...queuedProposals, ...proposals]);
    setProposals([]);
  };

  const handleEditDetails = (proposal: ProposedQuestion) => {
    setSelectedQuestion(proposal);
    setDetailsModalOpen(true);
  };

  const handleSaveQuestion = (updatedQuestion: ProposedQuestion) => {
    if (activeTab === "suggestions") {
      setProposals(
        proposals.map((p) =>
          p.id === updatedQuestion.id ? updatedQuestion : p
        )
      );
    } else if (activeTab === "queued") {
      setQueuedProposals(
        queuedProposals.map((p) =>
          p.id === updatedQuestion.id ? updatedQuestion : p
        )
      );
    } else {
      setDeletedProposals(
        deletedProposals.map((p) =>
          p.id === updatedQuestion.id ? updatedQuestion : p
        )
      );
    }
    toast.success("Question details updated");
  };

  // Get top suggestions by AI score for horizontal feed
  const topSuggestions = [...proposals]
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 6);

  // Category color mapping
  const categoryColors: Record<string, string> = {
    'Technology': 'bg-blue-100 text-blue-700 border-blue-200',
    'AI': 'bg-purple-100 text-purple-700 border-purple-200',
    'Cryptocurrency': 'bg-orange-100 text-orange-700 border-orange-200',
    'Finance': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Markets': 'bg-teal-100 text-teal-700 border-teal-200',
    'Apple': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div>
      <PageHeader
        title="Markets"
        description="Manage AI-generated suggestions and queued questions"
        actions={
          <>
            {activeTab === "suggestions" && proposals.length > 0 && (
              <Button variant="outline" onClick={handleBatchApprove}>
                Approve All ({proposals.length})
              </Button>
            )}
            {activeTab === "suggestions" && (
              <Button onClick={() => setGenerateOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
            )}
          </>
        }
      />

      {/* Top Suggestions Horizontal Feed */}
      {topSuggestions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-lg">Top AI Suggestions</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                Highest Scored
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {topSuggestions.map((suggestion, index) => (
                <Card
                  key={suggestion.id}
                  className="min-w-[340px] group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden"
                  onClick={() => handleEditDetails(suggestion)}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    index === 0 ? 'from-violet-500/10 to-purple-500/10' :
                    index === 1 ? 'from-blue-500/10 to-cyan-500/10' :
                    index === 2 ? 'from-pink-500/10 to-rose-500/10' :
                    index === 3 ? 'from-emerald-500/10 to-teal-500/10' :
                    index === 4 ? 'from-orange-500/10 to-amber-500/10' :
                    'from-indigo-500/10 to-blue-500/10'
                  } opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <CardHeader className="relative pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        AI Score: {(suggestion.aiScore * 100).toFixed(0)}%
                      </Badge>
                      {index === 0 && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                          🏆 Top Pick
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {suggestion.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-3 pt-0">
                    {/* Description - truncated */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {suggestion.description}
                    </p>

                    {/* Categories */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {suggestion.categories.slice(0, 2).map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className={`text-xs ${categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                        >
                          {category}
                        </Badge>
                      ))}
                      {suggestion.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                          +{suggestion.categories.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between pt-1 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Ends {suggestion.proposedAnswerEndAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>{getAgentName(suggestion)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Left Filter Bar */}
        <Card className="col-span-3">
          <CardContent className="p-6 space-y-6">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="mb-3 block">Sources</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="twitter"
                    checked={sourceFilters.twitter}
                    onCheckedChange={() => handleToggleSourceFilter("twitter")}
                  />
                  <label
                    htmlFor="twitter"
                    className="text-sm cursor-pointer"
                  >
                    Twitter
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="news"
                    checked={sourceFilters.news}
                    onCheckedChange={() => handleToggleSourceFilter("news")}
                  />
                  <label
                    htmlFor="news"
                    className="text-sm cursor-pointer"
                  >
                    News
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="reddit"
                    checked={sourceFilters.meme}
                    onCheckedChange={() => handleToggleSourceFilter("meme")}
                  />
                  <label
                    htmlFor="reddit"
                    className="text-sm cursor-pointer"
                  >
                    Reddit
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Type</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="binary"
                    checked={typeFilters.binary}
                    onCheckedChange={() => handleToggleTypeFilter("binary")}
                  />
                  <label
                    htmlFor="binary"
                    className="text-sm cursor-pointer"
                  >
                    Binary
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="multi-option"
                    checked={typeFilters.multiOption}
                    onCheckedChange={() => handleToggleTypeFilter("multiOption")}
                  />
                  <label
                    htmlFor="multi-option"
                    className="text-sm cursor-pointer"
                  >
                    Multi-option
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <p className="mb-1">
                  <span className="font-medium">AI Suggestions:</span> {proposals.length}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Queued:</span> {queuedProposals.length}
                </p>
                <p>
                  <span className="font-medium">Deleted:</span> {deletedProposals.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="col-span-9">
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "suggestions" | "queued" | "deleted")} className="w-full">
                <div className="border-b px-6 pt-4">
                  <TabsList>
                    <TabsTrigger value="suggestions">
                      All AI Suggestions ({proposals.length})
                    </TabsTrigger>
                    <TabsTrigger value="queued">
                      Queued ({queuedProposals.length})
                    </TabsTrigger>
                    <TabsTrigger value="deleted">
                      Deleted ({deletedProposals.length})
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* AI Suggestions Tab */}
                <TabsContent value="suggestions" className="m-0">
                  {filteredProposals.length === 0 ? (
                    <EmptyState
                      icon={<Sparkles className="h-12 w-12" />}
                      title="No proposals yet"
                      description="Click Generate to create AI-powered question proposals based on your configured sources"
                      action={{
                        label: "Generate Proposals",
                        onClick: () => setGenerateOpen(true),
                      }}
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Agent</TableHead>
                          <TableHead>Live Date</TableHead>
                          <TableHead>Answer End</TableHead>
                          <TableHead>Settlement</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProposals.map((proposal) => (
                          <>
                            <TableRow key={proposal.id}>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setExpandedRow(
                                      expandedRow === proposal.id ? null : proposal.id
                                    )
                                  }
                                >
                                  {expandedRow === proposal.id ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <p className="max-w-md">{proposal.title}</p>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="border-primary/50 text-primary"
                                >
                                  {getAgentName(proposal)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{formatDateTime(proposal.liveDate)}</TableCell>
                              <TableCell className="text-sm">{formatDateTime(proposal.proposedAnswerEndAt)}</TableCell>
                              <TableCell className="text-sm">
                                {formatDateTime(proposal.proposedSettlementAt)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {proposal.type === 'multi-option' ? 'Multi-option' : proposal.type === 'paused' ? 'Paused' : 'Binary'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleApprove(proposal.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(proposal.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedRow === proposal.id && (
                              <TableRow>
                                <TableCell colSpan={8} className="bg-muted/50">
                                  <div className="p-4 space-y-4">
                                    <div>
                                      <h4 className="mb-2">Description</h4>
                                      <p className="text-muted-foreground">
                                        {proposal.description}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="mb-2">Resolution Criteria</h4>
                                      <p className="text-muted-foreground">
                                        {proposal.resolutionCriteria}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="mb-2">AI Agent</h4>
                                      <Badge variant="outline" className="border-primary/50 text-primary">
                                        {getAgentName(proposal)}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleEditDetails(proposal)}
                                      >
                                        Edit Details
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                {/* Queued Tab */}
                <TabsContent value="queued" className="m-0">
                  {filteredProposals.length === 0 ? (
                    <EmptyState
                      icon={<Clock className="h-12 w-12" />}
                      title="No queued questions"
                      description="Approved questions will appear here ready for publishing"
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Agent</TableHead>
                          <TableHead>Live Date</TableHead>
                          <TableHead>Answer End</TableHead>
                          <TableHead>Settlement</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProposals.map((proposal) => (
                          <>
                            <TableRow key={proposal.id}>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setExpandedRow(
                                      expandedRow === proposal.id ? null : proposal.id
                                    )
                                  }
                                >
                                  {expandedRow === proposal.id ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <p className="max-w-md">{proposal.title}</p>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="border-primary/50 text-primary"
                                >
                                  {getAgentName(proposal)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{formatDateTime(proposal.liveDate)}</TableCell>
                              <TableCell className="text-sm">{formatDateTime(proposal.proposedAnswerEndAt)}</TableCell>
                              <TableCell className="text-sm">
                                {formatDateTime(proposal.proposedSettlementAt)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {proposal.type === 'multi-option' ? 'Multi-option' : proposal.type === 'paused' ? 'Paused' : 'Binary'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditDetails(proposal)}
                                >
                                  Edit Details
                                </Button>
                              </TableCell>
                            </TableRow>
                            {expandedRow === proposal.id && (
                              <TableRow>
                                <TableCell colSpan={8} className="bg-muted/50">
                                  <div className="p-4 space-y-4">
                                    <div>
                                      <h4 className="mb-2">Description</h4>
                                      <p className="text-muted-foreground">
                                        {proposal.description}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="mb-2">Resolution Criteria</h4>
                                      <p className="text-muted-foreground">
                                        {proposal.resolutionCriteria}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="mb-2">AI Agent</h4>
                                      <Badge variant="outline" className="border-primary/50 text-primary">
                                        {getAgentName(proposal)}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleEditDetails(proposal)}
                                      >
                                        Edit Details
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                {/* Deleted Tab */}
                <TabsContent value="deleted" className="m-0">
                  {filteredProposals.length === 0 ? (
                    <EmptyState
                      icon={<X className="h-12 w-12" />}
                      title="No deleted proposals"
                      description="Rejected questions will appear here"
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Agent</TableHead>
                          <TableHead>Live Date</TableHead>
                          <TableHead>Answer End</TableHead>
                          <TableHead>Settlement</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProposals.map((proposal) => (
                          <>
                            <TableRow key={proposal.id}>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setExpandedRow(
                                      expandedRow === proposal.id ? null : proposal.id
                                    )
                                  }
                                >
                                  {expandedRow === proposal.id ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <p className="max-w-md">{proposal.title}</p>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="border-primary/50 text-primary"
                                >
                                  {getAgentName(proposal)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{formatDateTime(proposal.liveDate)}</TableCell>
                              <TableCell className="text-sm">{formatDateTime(proposal.proposedAnswerEndAt)}</TableCell>
                              <TableCell className="text-sm">
                                {formatDateTime(proposal.proposedSettlementAt)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {proposal.type === 'multi-option' ? 'Multi-option' : proposal.type === 'paused' ? 'Paused' : 'Binary'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditDetails(proposal)}
                                >
                                  Edit Details
                                </Button>
                              </TableCell>
                            </TableRow>
                            {expandedRow === proposal.id && (
                              <TableRow>
                                <TableCell colSpan={8} className="bg-muted/50">
                                  <div className="p-4 space-y-4">
                                    <div>
                                      <h4 className="mb-2">Description</h4>
                                      <p className="text-muted-foreground">
                                        {proposal.description}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="mb-2">Resolution Criteria</h4>
                                      <p className="text-muted-foreground">
                                        {proposal.resolutionCriteria}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="mb-2">AI Agent</h4>
                                      <Badge variant="outline" className="border-primary/50 text-primary">
                                        {getAgentName(proposal)}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleEditDetails(proposal)}
                                      >
                                        Edit Details
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Proposals</DialogTitle>
            <DialogDescription>
              The AI will analyze recent sources and generate binary question proposals
              based on your configured filters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Topic (optional)</Label>
              <Input placeholder="e.g., Politics, Sports, Technology..." />
            </div>
            <div className="space-y-2">
              <Label>Number of proposals</Label>
              <Input type="number" defaultValue="5" min="1" max="20" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Details Modal */}
      <QuestionDetailsModal
        question={selectedQuestion}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onSave={handleSaveQuestion}
        onApprove={handleApproveFromModal}
        onReject={handleRejectFromModal}
        showActions={activeTab === "suggestions" || activeTab === "queued"}
      />
    </div>
  );
}
