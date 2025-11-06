import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  Clock,
  Users,
  Brain,
  Search,
  Calendar as CalendarIcon,
  Tag
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questionsApi, agentsApi } from "../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { cn, getCategoryColor } from "../lib/utils";
import { QuestionDetailsModal } from "../components/shared/QuestionDetailsModal";
import { EditQuestionDetailsModal } from "../components/shared/EditQuestionDetailsModal";
import { ProposedQuestion, Question, Agent } from "../lib/types";

export function Overview() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from database
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [questionsData, agentsData] = await Promise.all([
        questionsApi.getQuestions(),
        agentsApi.getAgents()
      ]);
      setQuestions(questionsData);
      setAgents(agentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get agent name from a proposal
  const getAgentName = (proposal: ProposedQuestion): string => {
    const agent = agents.find(a => a.id === proposal.agentId);
    return agent?.name || 'Unknown Agent';
  };

  // Helper function to get gradient class for suggestion cards
  const getGradientClass = (index: number): string => {
    const gradients = [
      'from-violet-500/10 to-purple-500/10',
      'from-blue-500/10 to-cyan-500/10',
      'from-pink-500/10 to-rose-500/10',
      'from-emerald-500/10 to-teal-500/10',
      'from-orange-500/10 to-amber-500/10'
    ];
    return gradients[index % gradients.length];
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [settlementDate, setSettlementDate] = useState<Date>();
  const [expiryPopoverOpen, setExpiryPopoverOpen] = useState(false);
  const [settlementPopoverOpen, setSettlementPopoverOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ProposedQuestion | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEditQuestion, setSelectedEditQuestion] = useState<Question | null>(null);

  const handleOpenModal = () => {
    setQuestionInput(searchInput);
    setIsModalOpen(true);
  };

  const handleUseAI = () => {
    // Mock AI rephrasing - in production this would call an LLM API
    const rephrased = `Will ${questionInput.trim() || 'this event'} happen by ${expiryDate ? expiryDate.toLocaleDateString() : 'the deadline'}?`;
    setQuestionInput(rephrased);
  };

  const handleViewDetails = (suggestion: ProposedQuestion) => {
    // Convert ProposedQuestion to Question for editing
    const questionForEdit: Question = {
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      state: 'published', // Overview shows live/published questions
      liveDate: suggestion.liveDate || suggestion.createdAt, // Use liveDate or fallback to createdAt
      answerEndAt: suggestion.answerEndAt,
      settlementAt: suggestion.settlementAt,
      resolutionCriteria: suggestion.resolutionCriteria,
      categories: suggestion.categories,
      agentId: suggestion.agentId,
      answerCount: 0, // Default values
      createdAt: suggestion.createdAt,
      updatedAt: new Date(),
      type: suggestion.type || 'binary',
    };

    setSelectedEditQuestion(questionForEdit);
    setEditModalOpen(true);
  };

  const handleSaveQuestion = (updatedQuestion: Question) => {
    // In a real app, this would update the backend
    // For now, we'll just show a success message
    console.log('Draft saved:', updatedQuestion);
  };

  const handleQueueLive = (updatedQuestion: Question) => {
    // In a real app, this would update the backend and move to queue
    // For now, we'll navigate to Markets page
    console.log('Queued for review:', updatedQuestion);
    navigate('/markets');
  };

  // Get trending AI suggestions (highest scores from pending questions)
  const trendingSuggestions = [...questions.filter(q => q.state === 'pending' && q.aiScore)]
    .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
    .slice(0, 5);

  // Calculate stats from real data
  const pendingCount = questions.filter(q => q.state === 'pending').length;
  const publishedCount = questions.filter(q => q.state === 'published').length;
  const totalParticipants = questions.reduce((sum, q) => sum + (q.answerCount || 0), 0);

  const stats = [
    { label: 'Active Questions', value: publishedCount.toString(), icon: Zap, trend: `${questions.length} total` },
    { label: 'Total Participants', value: totalParticipants.toString(), icon: Users, trend: `${agents.length} agents` },
    { label: 'AI Suggestions', value: pendingCount.toString(), icon: Brain, trend: 'Ready for review' },
  ];


  return (
    <div className="space-y-8 pb-8">
      {/* Compact Search Bar */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Make a question about $FLOKI"
              className="pl-10 bg-white border-slate-200 h-11 w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm sm:whitespace-nowrap"
            onClick={handleOpenModal}
          >
            <Brain className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Generate Question</span>
            <span className="sm:hidden">Generate</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <Badge variant="secondary" className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
              <div className="text-3xl mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trending AI Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl">🔥 Top AI Suggestions</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/markets')}>
            View All Suggestions
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading AI suggestions...</p>
          </div>
        ) : trendingSuggestions.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No AI Suggestions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create an agent and run it to generate questions
            </p>
            <Button onClick={() => navigate('/agents')}>
              Go to AI Agents
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {trendingSuggestions.map((suggestion, index) => (
            <Card 
              key={suggestion.id} 
              className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden"
              onClick={() => handleViewDetails(suggestion)}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(index)} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    AI Score: {((suggestion.aiScore || 0) * 100).toFixed(0)}%
                  </Badge>
                  {index === 0 && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      🏆 Top Pick
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {suggestion.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {/* Description - not truncated */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {suggestion.description}
                </p>
                
                {/* Categories */}
                {suggestion.categories && suggestion.categories.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    {suggestion.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className={getCategoryColor(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Meta info */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Ends {suggestion.answerEndAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>{getAgentName(suggestion)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-2">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl mb-1">Ready to create something new?</h3>
              <p className="text-muted-foreground">
                Use AI to generate questions or create your own from scratch
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/markets')} className="gradient-primary text-white border-0">
                <Brain className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
              <Button variant="outline" onClick={() => navigate('/questions')}>
                Manual Create
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Manual Question Creation */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Create a New Question</DialogTitle>
            <DialogDescription>
              Enter your question and set an expiry date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="Enter your question here"
                className="col-span-3"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border-0"
                onClick={handleUseAI}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Use AI
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry-date">Answer deadline:</Label>
              <Popover open={expiryPopoverOpen} onOpenChange={setExpiryPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? expiryDate.toLocaleDateString() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100]" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={(date) => {
                      setExpiryDate(date);
                      setExpiryPopoverOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settlement-date">Settlement:</Label>
              <Popover open={settlementPopoverOpen} onOpenChange={setSettlementPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left",
                      !settlementDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {settlementDate ? settlementDate.toLocaleDateString() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100]" align="start">
                  <Calendar
                    mode="single"
                    selected={settlementDate}
                    onSelect={(date) => {
                      setSettlementDate(date);
                      setSettlementPopoverOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => {
                // Handle question creation logic here
                setIsModalOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Details Modal */}
      <QuestionDetailsModal
        question={selectedQuestion}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onSave={(updatedQuestion: ProposedQuestion) => {
          // Legacy handler if needed
        }}
        showActions={false}
      />

      {/* Edit Question Details Modal */}
      <EditQuestionDetailsModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        question={selectedEditQuestion}
        onSave={handleSaveQuestion}
        onQueueLive={handleQueueLive}
      />
    </div>
  );
}