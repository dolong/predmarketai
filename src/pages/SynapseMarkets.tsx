import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Clock, TrendingUp, Tag, Brain } from "lucide-react";
import { getCategoryColor } from "../lib/utils";

interface SynapseQuestion {
  id: number;
  liveAt: string;
  liveUntil: string;
  updatedAt: string | null;
  createdAt: string;
  question: string;
  extra: string;
  answerValue: number;
  answeredAt: string | null;
  markedAsCompleteAt: string | null;
  scheduledForCompletionAt: string | null;
  qstashMessageId: string | null;
  image: string;
}

interface SynapseApiResponse {
  success: boolean;
  data: {
    result: SynapseQuestion[];
  };
}

export function SynapseMarkets() {
  const [questions, setQuestions] = useState<SynapseQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try with API key as query parameter to avoid CORS issues
      const response = await fetch(
        'https://admin-launcher-api-synapse-dev.dolong-4e5.workers.dev/api/predictive/wager-questions?filterBy=All&page=1&limit=100&apiKey=TZ3eYpuOwDfm6CEyLJyLmN0y'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data: SynapseApiResponse = await response.json();

      if (data.success && data.data && data.data.result) {
        setQuestions(data.data.result);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error loading Synapse questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Synapse Markets</h1>
        <p className="text-muted-foreground">
          Live questions from Synapse prediction markets
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                <p className="text-3xl font-bold">{questions.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active</p>
                <p className="text-3xl font-bold">
                  {questions.filter(q => !q.answeredAt).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                <p className="text-3xl font-bold">
                  {questions.filter(q => q.answeredAt).length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl">Live Questions</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading Synapse questions...</p>
          </div>
        ) : error ? (
          <Card className="p-12 text-center border-2 border-destructive">
            <Brain className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Questions</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
          </Card>
        ) : questions.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
            <p className="text-muted-foreground">
              No Synapse questions found at this time
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {questions.map((question, index) => (
              <Card
                key={question.id}
                className="group hover:shadow-lg transition-all border-2 hover:border-primary/50 relative overflow-hidden"
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(index)} opacity-0 group-hover:opacity-100 transition-opacity`} />

                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      className={
                        question.answeredAt
                          ? "bg-gray-100 text-gray-700 border-gray-200"
                          : "bg-green-100 text-green-700 border-green-200"
                      }
                    >
                      {question.answeredAt ? "Resolved" : "Active"}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      ID: {question.id}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {question.question}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative space-y-4">
                  {/* Extra description if available */}
                  {question.extra && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {question.extra}
                    </p>
                  )}

                  {/* Categories */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <Badge
                      variant="outline"
                      className={getCategoryColor("Synapse")}
                    >
                      Synapse
                    </Badge>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-col gap-2 pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Live: {new Date(question.liveAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Until: {new Date(question.liveUntil).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {question.answeredAt && (
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        <span>
                          Answered: {new Date(question.answeredAt).toLocaleDateString()}
                          {question.answerValue !== null && ` - Value: ${question.answerValue}`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
