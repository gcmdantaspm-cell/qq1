import { useState, useMemo } from "react";
import { 
  Brain, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  HelpCircle, 
  BookOpen, 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  LayoutDashboard,
  FileText,
  History,
  Trophy,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Question, GenerationParams, Difficulty, QuestionType, UserAnswer } from "./types";
import { generateQuestions } from "./services/geminiService";
import { cn } from "@/lib/utils";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [activeTab, setActiveTab] = useState("create");
  
  const [params, setParams] = useState<GenerationParams>({
    topic: "",
    count: 5,
    difficulty: "médio",
    type: "múltipla escolha",
    language: "Português"
  });

  const handleGenerate = async () => {
    if (!params.topic.trim()) return;
    
    setLoading(true);
    try {
      const result = await generateQuestions(params);
      setQuestions(result);
      setUserAnswers({});
      setActiveTab("solve");
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar questões. Verifique sua chave API.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    if (userAnswers[questionId]?.isSubmitted) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOption: option,
        isCorrect: false,
        isSubmitted: false
      }
    }));
  };

  const handleSubmitAnswer = (questionId: string) => {
    const answer = userAnswers[questionId];
    if (!answer || answer.isSubmitted) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = answer.selectedOption === question.correctAnswer;

    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...answer,
        isCorrect,
        isSubmitted: true
      }
    }));
  };

  const copyToClipboard = () => {
    const text = questions.map((q, i) => (
      `${i + 1}. ${q.question}\n` +
      q.options.map((opt, j) => `   ${String.fromCharCode(97 + j)}) ${opt}`).join("\n") +
      `\n   Resposta: ${q.correctAnswer}\n   Explicação: ${q.explanation}\n`
    )).join("\n");
    
    navigator.clipboard.writeText(text);
    alert("Copiado para a área de transferência!");
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "questoes.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const stats = useMemo(() => {
    const answered = (Object.values(userAnswers) as UserAnswer[]).filter(a => a.isSubmitted);
    const correct = answered.filter(a => a.isCorrect).length;
    return {
      total: questions.length,
      answered: answered.length,
      correct,
      percent: answered.length > 0 ? Math.round((correct / answered.length) * 100) : 0
    };
  }, [userAnswers, questions]);

  const resetQuiz = () => {
    setUserAnswers({});
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="h-14 border-b bg-white flex items-center px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 mr-8">
          <div className="bg-[#004A99] p-1.5 rounded-md">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-[#004A99] tracking-tight">Q-Questia</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <button className="text-[#004A99] border-b-2 border-[#004A99] h-14 px-1">Questões</button>
          <button className="hover:text-slate-800 transition-colors">Simulados</button>
          <button className="hover:text-slate-800 transition-colors">Desempenho</button>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 gap-1">
            <Trophy className="w-3 h-3" /> {stats.correct}/{stats.total}
          </Badge>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
            GD
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r bg-white hidden lg:flex flex-col p-4 space-y-2">
          <Button variant="ghost" className="justify-start gap-3 text-slate-600 hover:text-[#004A99] hover:bg-blue-50">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Button>
          <Button 
            variant={activeTab === "create" ? "secondary" : "ghost"} 
            className={cn("justify-start gap-3", activeTab === "create" ? "bg-blue-50 text-[#004A99]" : "text-slate-600")}
            onClick={() => setActiveTab("create")}
          >
            <Sparkles className="w-4 h-4" /> Criar Questões
          </Button>
          <Button 
            variant={activeTab === "solve" ? "secondary" : "ghost"} 
            className={cn("justify-start gap-3", activeTab === "solve" ? "bg-blue-50 text-[#004A99]" : "text-slate-600")}
            onClick={() => setActiveTab("solve")}
          >
            <FileText className="w-4 h-4" /> Resolver Agora
          </Button>
          <Button variant="ghost" className="justify-start gap-3 text-slate-600 hover:text-[#004A99] hover:bg-blue-50">
            <History className="w-4 h-4" /> Histórico
          </Button>
          
          <Separator className="my-4" />
          
          <div className="px-3 py-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Seu Progresso</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Taxa de acerto</span>
                <span className="font-bold text-[#004A99]">{stats.percent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#004A99] transition-all duration-500" 
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {activeTab === "create" ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gerador de Questões</h2>
                    <p className="text-slate-500">Crie questões personalizadas a partir de qualquer texto ou tópico.</p>
                  </div>
                </div>

                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Texto Base ou Tópico</Label>
                      <Textarea 
                        placeholder="Cole aqui o conteúdo que você deseja transformar em questões..."
                        className="min-h-[200px] border-slate-200 focus:ring-[#004A99] focus:border-[#004A99]"
                        value={params.topic}
                        onChange={(e) => setParams({...params, topic: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Quantidade</Label>
                        <Select 
                          value={params.count.toString()} 
                          onValueChange={(v) => setParams({...params, count: parseInt(v)})}
                        >
                          <SelectTrigger className="border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 15, 20].map(n => (
                              <SelectItem key={n} value={n.toString()}>{n} Questões</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Dificuldade</Label>
                        <Select 
                          value={params.difficulty} 
                          onValueChange={(v: Difficulty) => setParams({...params, difficulty: v})}
                        >
                          <SelectTrigger className="border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fácil">Fácil</SelectItem>
                            <SelectItem value="médio">Médio</SelectItem>
                            <SelectItem value="difícil">Difícil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Tipo</Label>
                        <Select 
                          value={params.type} 
                          onValueChange={(v: QuestionType) => setParams({...params, type: v})}
                        >
                          <SelectTrigger className="border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="múltipla escolha">Múltipla Escolha</SelectItem>
                            <SelectItem value="verdadeiro/falso">Verdadeiro/Falso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 p-6 border-t rounded-b-xl flex justify-end">
                    <Button 
                      size="lg" 
                      className="bg-[#004A99] hover:bg-[#003d7a] px-8 gap-2"
                      onClick={handleGenerate}
                      disabled={loading || !params.topic.trim()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processando Texto...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Gerar Questões Online
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 pb-20"
              >
                <div className="flex items-center justify-between sticky top-14 bg-[#F8FAFC] py-4 z-40">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Resolução de Questões</h2>
                    <p className="text-sm text-slate-500">Pratique com as questões geradas pela IA.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2 hidden md:flex">
                      <Copy className="w-4 h-4" /> Copiar
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadJSON} className="gap-2 hidden md:flex">
                      <Download className="w-4 h-4" /> Exportar
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetQuiz} className="gap-2">
                      <RotateCcw className="w-4 h-4" /> Reiniciar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("create")} className="gap-2">
                      <Settings2 className="w-4 h-4" /> Novo Texto
                    </Button>
                  </div>
                </div>

                {questions.length > 0 ? (
                  <div className="space-y-8">
                    {questions.map((q, idx) => {
                      const answer = userAnswers[q.id];
                      return (
                        <Card key={q.id} className="border-none shadow-sm overflow-hidden">
                          <CardHeader className="bg-white border-b pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">
                                Questão {idx + 1}
                              </Badge>
                              <div className="flex gap-2">
                                <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] uppercase">{params.difficulty}</Badge>
                                <Badge className="bg-slate-50 text-slate-600 border-none text-[10px] uppercase">IA Generated</Badge>
                              </div>
                            </div>
                            <CardTitle className="text-lg font-medium leading-relaxed text-slate-800">
                              {q.question}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                              {q.options.map((option, optIdx) => {
                                const isSelected = answer?.selectedOption === option;
                                const isCorrect = option === q.correctAnswer;
                                const showResult = answer?.isSubmitted;
                                
                                return (
                                  <button
                                    key={optIdx}
                                    disabled={showResult}
                                    onClick={() => handleSelectOption(q.id, option)}
                                    className={cn(
                                      "flex items-start gap-3 p-4 rounded-lg border text-left transition-all group",
                                      !showResult && "hover:border-[#004A99] hover:bg-blue-50/50",
                                      isSelected && !showResult && "border-[#004A99] bg-blue-50 ring-1 ring-[#004A99]",
                                      showResult && isCorrect && "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500",
                                      showResult && isSelected && !isCorrect && "bg-red-50 border-red-500 ring-1 ring-red-500",
                                      showResult && !isSelected && !isCorrect && "opacity-60 border-slate-100 bg-slate-50"
                                    )}
                                  >
                                    <span className={cn(
                                      "flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-colors",
                                      isSelected ? "bg-[#004A99] border-[#004A99] text-white" : "border-slate-300 text-slate-500 group-hover:border-[#004A99] group-hover:text-[#004A99]",
                                      showResult && isCorrect && "bg-emerald-500 border-emerald-500 text-white",
                                      showResult && isSelected && !isCorrect && "bg-red-500 border-red-500 text-white"
                                    )}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="text-sm leading-snug pt-0.5">{option}</span>
                                    {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto self-center" />}
                                    {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 ml-auto self-center" />}
                                  </button>
                                );
                              })}
                            </div>
                          </CardContent>
                          <CardFooter className="bg-slate-50/50 p-4 border-t flex items-center justify-between">
                            <div className="flex gap-4">
                              <Button variant="ghost" size="sm" className="text-slate-500 gap-2">
                                <MessageSquare className="w-4 h-4" /> Comentários
                              </Button>
                              <Button variant="ghost" size="sm" className="text-slate-500 gap-2">
                                <History className="w-4 h-4" /> Estatísticas
                              </Button>
                            </div>
                            
                            {!answer?.isSubmitted ? (
                              <Button 
                                className="bg-[#004A99] hover:bg-[#003d7a] gap-2"
                                disabled={!answer?.selectedOption}
                                onClick={() => handleSubmitAnswer(q.id)}
                              >
                                Responder
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                {answer.isCorrect ? (
                                  <span className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Você acertou!
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-bold text-sm flex items-center gap-1">
                                    <XCircle className="w-4 h-4" /> Você errou!
                                  </span>
                                )}
                              </div>
                            )}
                          </CardFooter>
                          
                          {answer?.isSubmitted && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              className="bg-white border-t p-6"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-4 bg-[#004A99] rounded-full" />
                                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Gabarito Comentado</h4>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                                {q.explanation}
                              </p>
                            </motion.div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                    <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center">
                      <FileText className="w-10 h-10 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-slate-400">Nenhuma questão para resolver</h3>
                      <p className="text-slate-400 max-w-xs mx-auto">
                        Vá para a aba "Criar Questões" e gere seu primeiro caderno de exercícios.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveTab("create")}>
                        Criar Agora
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-10 border-t bg-white flex items-center px-6 text-[10px] text-slate-400 font-medium uppercase tracking-widest justify-between">
        <div>Q-Questia Platform v2.0</div>
        <div className="flex gap-4">
          <span>Status: Online</span>
          <span>IA: Gemini 3 Flash</span>
        </div>
      </footer>
    </div>
  );
}
