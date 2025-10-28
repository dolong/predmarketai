import { useState } from "react";
import { PageHeader } from "../components/shared/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
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
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Progress } from "../components/ui/progress";
import { Target, AlertCircle, ExternalLink, CheckCircle } from "lucide-react";
import { mockQuestions } from "../lib/mock-data";
import { Question, Outcome } from "../lib/types";
import { formatDate } from "../lib/utils";
import { toast } from "sonner@2.0.3";

interface ResolveScoreProps {
  onNavigate: (page: string) => void;
}

export function ResolveScore({ onNavigate }: ResolveScoreProps) {
  const awaitingResolution = mockQuestions.filter(
    (q) => q.state === "awaiting_resolution"
  );
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [notes, setNotes] = useState("");
  const [isScoring, setIsScoring] = useState(false);

  const handleOpenResolution = (question: Question) => {
    setSelectedQuestion(question);
    setSelectedOutcome(null);
    setNotes("");
  };

  const handleResolve = () => {
    if (!selectedOutcome) {
      toast.error("Please select an outcome");
      return;
    }
    
    setIsScoring(true);
    // Simulate scoring
    setTimeout(() => {
      setIsScoring(false);
      toast.success("Question resolved and answers scored");
      setSelectedQuestion(null);
    }, 2000);
  };

  const handleBulkResolve = () => {
    toast.success(`Resolving ${awaitingResolution.length} questions`);
  };

  return (
    <div>
      <PageHeader
        title="Resolve Markets"
        description="Use AI to settle answers and resolve prediction markets. AI will perform research with your sources to determine outcomes."
        actions={
          awaitingResolution.length > 0 && (
            <Button onClick={handleBulkResolve}>
              <Target className="h-4 w-4 mr-2" />
              Bulk Resolve ({awaitingResolution.length})
            </Button>
          )
        }
      />

      <Card>
        <CardContent className="p-0">
          {awaitingResolution.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3>All caught up!</h3>
              <p className="text-muted-foreground mt-2">
                There are no questions awaiting resolution at this time.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Settlement Date</TableHead>
                  <TableHead>Sources</TableHead>
                  <TableHead>AI Proposal</TableHead>
                  <TableHead>Answers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awaitingResolution.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <p className="max-w-md">{question.title}</p>
                    </TableCell>
                    <TableCell>{formatDate(question.settlementAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.sources.length} sources</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">YES</Badge>
                        <Progress value={78} className="w-20" />
                        <span className="text-sm text-muted-foreground">78%</span>
                      </div>
                    </TableCell>
                    <TableCell>{question.answerCount}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleOpenResolution(question)}
                      >
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resolution Panel Dialog */}
      <Dialog
        open={selectedQuestion !== null}
        onOpenChange={(open) => !open && setSelectedQuestion(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedQuestion && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl pr-6">Resolve Question</DialogTitle>
                <DialogDescription>{selectedQuestion.title}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-2">
                {/* Criteria Recap */}
                <div className="space-y-3">
                  <Label>Resolution Criteria</Label>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        {selectedQuestion.resolutionCriteria}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Evidence */}
                <div className="space-y-3">
                  <Label>Evidence Sources</Label>
                  <div className="space-y-2">
                    {selectedQuestion.sources.map((source) => (
                      <Card key={source.id}>
                        <CardContent className="p-3 flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm">{source.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {source.outlet}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  source.trustLevel === "high"
                                    ? "border-green-500 text-green-700"
                                    : source.trustLevel === "medium"
                                    ? "border-yellow-500 text-yellow-700"
                                    : "border-red-500 text-red-700"
                                }`}
                              >
                                {source.trustLevel} trust
                              </Badge>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* AI Proposal */}
                <div className="space-y-3">
                  <Label>AI Proposal</Label>
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">YES</Badge>
                        <div className="flex items-center gap-2">
                          <Progress value={78} className="w-24" />
                          <span className="text-sm">78% confidence</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        Based on the analyzed sources, the AI suggests this question
                        resolves to YES with high confidence. Key evidence includes
                        official announcements and verified reporting from trusted sources.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Outcome Selector */}
                <div className="space-y-3">
                  <Label>Select Outcome</Label>
                  <RadioGroup
                    value={selectedOutcome || undefined}
                    onValueChange={(value) => setSelectedOutcome(value as Outcome)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="YES" id="yes" />
                      <Label htmlFor="yes" className="flex-1 cursor-pointer">
                        YES
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="NO" id="no" />
                      <Label htmlFor="no" className="flex-1 cursor-pointer">
                        NO
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="INVALID" id="invalid" />
                      <Label htmlFor="invalid" className="flex-1 cursor-pointer">
                        INVALID
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <Label htmlFor="notes">Resolution Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional context or reasoning..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedQuestion(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResolve}
                  disabled={!selectedOutcome || isScoring}
                >
                  {isScoring ? "Scoring..." : "Save & Score"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}