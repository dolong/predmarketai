import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { mockProposedQuestions } from "../lib/mock-data";
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
  Tag,
  Search,
  Calendar as CalendarIcon
} from "lucide-react";
import { useState } from "react";
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
import { cn } from "../lib/utils";
import { QuestionDetailsModal } from "../components/shared/QuestionDetailsModal";
import { ProposedQuestion } from "../lib/types";

interface OverviewProps {
  onNavigate: (page: string) => void;
}

export function Overview({ onNavigate }: OverviewProps) {
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [settlementDate, setSettlementDate] = useState<Date>();
  const [expiryPopoverOpen, setExpiryPopoverOpen] = useState(false);
  const [settlementPopoverOpen, setSettlementPopoverOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ProposedQuestion | null>(null);

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
    setSelectedQuestion(suggestion);
    setDetailsModalOpen(true);
  };

  const handleSaveQuestion = (updatedQuestion: ProposedQuestion) => {
    // In a real app, this would update the backend
    // For now, we'll just show a success message
    // The actual data is pulled from mockProposedQuestions which is static
  };

  // Get trending AI suggestions (highest scores)
  const trendingSuggestions = [...mockProposedQuestions]
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 5);

  const stats = [
    { label: 'Active Questions', value: '23', icon: Zap, trend: '+5 this week' },
    { label: 'Total Participants', value: '1,247', icon: Users, trend: '+12% this month' },
    { label: 'AI Suggestions', value: mockProposedQuestions.length.toString(), icon: Brain, trend: '+3 today' },
  ];

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
    <div className="space-y-8 pb-8">
      {/* Compact Search Bar */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Make a question about $FLOKI"
              className="pl-10 bg-white border-slate-200 h-11"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm"
            onClick={handleOpenModal}
          >
            <Brain className="h-4 w-4 mr-2" />
            Generate Question
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
          <Button variant="ghost" onClick={() => onNavigate('markets')}>
            View All Suggestions
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {trendingSuggestions.map((suggestion, index) => (
            <Card 
              key={suggestion.id} 
              className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden"
              onClick={() => handleViewDetails(suggestion)}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                index === 0 ? 'from-violet-500/10 to-purple-500/10' :
                index === 1 ? 'from-blue-500/10 to-cyan-500/10' :
                index === 2 ? 'from-pink-500/10 to-rose-500/10' :
                index === 3 ? 'from-emerald-500/10 to-teal-500/10' :
                'from-orange-500/10 to-amber-500/10'
              } opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    AI Score: {(suggestion.aiScore * 100).toFixed(0)}%
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {suggestion.categories.map((category) => (
                    <Badge 
                      key={category} 
                      variant="outline"
                      className={categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-200'}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Ends {suggestion.proposedAnswerEndAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>{suggestion.sources.length} sources</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
              <Button onClick={() => onNavigate('suggest')} className="gradient-primary text-white border-0">
                <Brain className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
              <Button variant="outline" onClick={() => onNavigate('questions')}>
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
        onSave={handleSaveQuestion}
        showActions={false}
      />
    </div>
  );
}