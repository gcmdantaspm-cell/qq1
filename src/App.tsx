import { useState } from "react";
import { Brain, Sparkles, Download, Copy, Check, Loader2, HelpCircle, BookOpen, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Question, GenerationParams, Difficulty, QuestionType } from "./types";
import { generateQuestions } from "./services/geminiService";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [copied, setCopied] = useState(false);
  
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
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar questões. Verifique sua chave API e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = questions.map((q, i) => (
      `${i + 1}. ${q.question}\n` +
      q.options.map((opt, j) => `   ${String.fromCharCode(97 + j)}) ${opt}`).join("\n") +
      `\n   Resposta: ${q.correctAnswer}\n   Explicação: ${q.explanation}\n`
    )).join("\n");
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Questia <span className="text-primary/60">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="hidden sm:flex gap-1 py-1">
              <Sparkles className="w-3 h-3" /> Powered by Gemini
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Controls */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings2 className="w-5 h-5" /> Configurações
                </CardTitle>
                <CardDescription>Defina o tema e o formato das questões.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Tópico ou Texto Base</Label>
                  <Textarea 
                    id="topic"
                    placeholder="Ex: Revolução Francesa, Fotossíntese ou cole um texto aqui..."
                    className="min-h-[120px] resize-none"
                    value={params.topic}
                    onChange={(e) => setParams({...params, topic: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="count">Quantidade</Label>
                    <Select 
                      value={params.count.toString()} 
                      onValueChange={(v) => setParams({...params, count: parseInt(v)})}
                    >
                      <SelectTrigger id="count">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 5, 10, 15, 20].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} questões</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select 
                      value={params.difficulty} 
                      onValueChange={(v: Difficulty) => setParams({...params, difficulty: v})}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fácil">Fácil</SelectItem>
                        <SelectItem value="médio">Médio</SelectItem>
                        <SelectItem value="difícil">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Questão</Label>
                  <Select 
                    value={params.type} 
                    onValueChange={(v: QuestionType) => setParams({...params, type: v})}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="múltipla escolha">Múltipla Escolha</SelectItem>
                      <SelectItem value="verdadeiro/falso">Verdadeiro ou Falso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handleGenerate}
                  disabled={loading || !params.topic.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Questões
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-primary/5 border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Dica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quanto mais detalhado for o tópico ou o texto base, melhor será a qualidade das questões geradas pela IA.
                </p>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="preview" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="preview" className="gap-2">
                    <BookOpen className="w-4 h-4" /> Visualização
                  </TabsTrigger>
                  <TabsTrigger value="deploy" className="gap-2">
                    <Download className="w-4 h-4" /> Guia Deployment
                  </TabsTrigger>
                </TabsList>
                
                {questions.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadJSON} className="gap-2">
                      <Download className="w-4 h-4" /> JSON
                    </Button>
                  </div>
                )}
              </div>

              <TabsContent value="preview" className="mt-0">
                <ScrollArea className="h-[calc(100vh-250px)] rounded-xl border bg-white p-6 shadow-sm">
                  <AnimatePresence mode="wait">
                    {questions.length > 0 ? (
                      <div className="space-y-8">
                        {questions.map((q, idx) => (
                          <motion.div 
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="space-y-4"
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                                {idx + 1}
                              </span>
                              <div className="space-y-4 flex-1">
                                <h3 className="text-lg font-medium leading-tight pt-1">{q.question}</h3>
                                <div className="grid grid-cols-1 gap-2">
                                  {q.options.map((option, optIdx) => (
                                    <div 
                                      key={optIdx}
                                      className={`p-3 rounded-lg border text-sm transition-colors ${
                                        option === q.correctAnswer 
                                          ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                                          : "bg-slate-50 border-slate-100"
                                      }`}
                                    >
                                      <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                                      {option}
                                    </div>
                                  ))}
                                </div>
                                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Explicação</p>
                                  <p className="text-sm text-blue-900/80">{q.explanation}</p>
                                </div>
                              </div>
                            </div>
                            {idx < questions.length - 1 && <Separator className="my-8" />}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <Brain className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-slate-400">Nenhuma questão gerada</h3>
                          <p className="text-slate-400 max-w-xs mx-auto">
                            Preencha o tópico ao lado e clique em "Gerar Questões" para começar.
                          </p>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="deploy" className="mt-0">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle>Como fazer o Deploy no Vercel</CardTitle>
                    <CardDescription>Siga estes passos para colocar seu app online com segurança.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <div>
                          <h4 className="font-bold mb-1">Prepare seu Repositório</h4>
                          <p className="text-sm text-slate-600">Suba seu código para o GitHub, GitLab ou Bitbucket.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                        <div>
                          <h4 className="font-bold mb-1">Importe no Vercel</h4>
                          <p className="text-sm text-slate-600">No dashboard do Vercel, clique em "Add New" {">"} "Project" e selecione seu repositório.</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                        <div className="flex-1">
                          <h4 className="font-bold mb-1 text-primary">Configure a Chave API (Crucial)</h4>
                          <p className="text-sm text-slate-600 mb-3">Antes de clicar em "Deploy", procure a seção <strong>Environment Variables</strong>:</p>
                          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs space-y-2">
                            <p><span className="text-pink-400">Key:</span> GEMINI_API_KEY</p>
                            <p><span className="text-pink-400">Value:</span> [Sua Chave do Google AI Studio]</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-2 italic">
                            * Nota: O Vite automaticamente injeta variáveis de ambiente durante o build se configurado corretamente.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</div>
                        <div>
                          <h4 className="font-bold mb-1">Deploy!</h4>
                          <p className="text-sm text-slate-600">Clique em "Deploy". O Vercel vai buildar seu app e a chave estará protegida no servidor.</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <h4 className="text-amber-800 font-bold text-sm mb-1 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> Dica de Segurança
                      </h4>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Nunca coloque sua chave diretamente no código (hardcoded). Use sempre variáveis de ambiente (.env) para evitar que sua chave seja roubada se o código for público.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2026 Questia AI - Gerador de Questões Inteligente</p>
        </div>
      </footer>
    </div>
  );
}
