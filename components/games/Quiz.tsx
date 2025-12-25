"use client";
import { useState, useEffect } from "react";
import { Check, X, Trophy, RefreshCcw, Sparkles, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// BANCO DE 20 QUESTÕES
// Dica: Edite as strings "EDITAR_RESPOSTA" com o texto real depois
const ALL_QUESTIONS = [
  { q: "Qual a data oficial do nosso início?", a: ["17 de Abril", "12 de Junho", "25 de Dezembro", "01 de Janeiro"], correct: 0 },
  { q: "Qual a minha comida favorita?", a: ["Pizza", "Hambúrguer", "Lasanha", "Torta"], correct: 3 }, // Ajuste o index correto
  { q: "Qual minha cor favorita?", a: ["Preto", "Roxo", "Vermelho", "Preto"], correct: 1 },
  { q: "Qual foi o local do nosso primeiro beijo?", a: ["Cinema", "Rua", "Festa", "Parque"], correct: 1 },
  { q: "Qual filme eu veria 100 vezes?", a: ["Interestelar", "Enrolados", "Vingadores", "Homem de Ferro"], correct: 1 },
  { q: "O que mais me irrita?", a: ["Fome", "Sono", "Atraso", "Mentira"], correct: 3 },
  { q: "Qual meu sabor de sorvete?", a: ["Chocolate", "Baunilha", "Morango", "Maracuja"], correct: 3 },
  { q: "Quem disse 'Eu te amo' primeiro?", a: ["Gabriel", "Eu", "Foi ao mesmo tempo", "Gab"], correct: 1 },
  { q: "Qual meu sonho de viagem?", a: ["Paris", "Nova York", "Maldivas", "Japão"], correct: 2 },
  { q: "Qual o apelido que eu mais gosto?", a: ["Amor", "Momo", "Coco rotineiro", "Dengo"], correct: 1 },
  { q: "O que eu prefiro fazer domingo?", a: ["Sair", "FIcar com Vc", "Ir no parque", "Dormir"], correct: 1 },
  { q: "Qual música me define?", a: ["Rap", "Pagode", "Rock", "Sertanejo"], correct: 0 },
  { q: "Qual presente eu amaria ganhar?", a: ["Roupas", "Eletrônicos", "Comida", "Você"], correct: 3 },
  { q: "Se eu ganhasse na loteria, o que compraria primeiro?", a: ["Casa", "Carro", "Viajaria o mundo", "Investiria tudo"], correct: 0 },
  { q: "Eu sou mais...", a: ["Extrovertido", "Introvertido", "Chato", "Amoroso"], correct: 3 },
  { q: "O que eu notei primeiro em você?", a: ["Forma que me trata", "Olhos", "Roupa", "Cabelo"], correct: 0 },
  { q: "Quantos filhos eu quero ter?", a: ["Nenhum", "1", "2", "3 ou mais"], correct: 2 },
  { q: "Bebida favorita", a: ["Café puro", "Refri", "Chá gelado", "Pinga"], correct: 2 },
  { q: "Qual meu signo?", a: ["Áries/Touro/Gemeos", "Cancer/Leão/Virgem", "Libra/Escorpião/Sag.", "Capric/Aquario/Peixes"], correct: 0 }, // Edite a resposta
  { q: "O quanto eu te amo?", a: ["Muito", "Demais", "Infinito", "Inexplicável"], correct: 3 },
];

export default function QuizGame() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Inicializa Jogo com perguntas aleatórias
  useEffect(() => {
    restartGame();
  }, []);

  const restartGame = () => {
    // Embaralha e pega 5 perguntas para uma partida rápida
    const shuffled = [...ALL_QUESTIONS].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAns(null);
    setIsAnimating(false);
  };

  const handleAnswer = (index: number) => {
    if (isAnimating) return; // Bloqueia clique duplo
    
    setSelectedAns(index);
    setIsAnimating(true);

    const isCorrect = index === questions[currentIdx].correct;
    
    // Somente aguarda para mostrar o resultado antes de avançar
    setTimeout(() => {
        if (isCorrect) setScore(s => s + 1);

        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setSelectedAns(null);
            setIsAnimating(false);
        } else {
            setIsFinished(true);
            if (isCorrect) confettiEffect();
        }
    }, 1200); // 1.2s de suspense
  };

  const confettiEffect = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#ffffff']
    });
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="w-full h-[600px] flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#18181b] border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Fundo Decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />

        <AnimatePresence mode="wait">
            {!isFinished ? (
                <motion.div 
                    key="question"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col"
                >
                    {/* Header: Barra de Progresso e Score */}
                    <div className="flex justify-between items-center mb-6 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                        <div className="flex flex-col gap-1 w-full max-w-[120px]">
                            <span>Questão {currentIdx + 1} / {questions.length}</span>
                            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-rose-500 to-purple-500" 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1 rounded-full text-white">
                            <Sparkles size={12} className="text-yellow-400"/>
                            <span>{score} pts</span>
                        </div>
                    </div>

                    {/* Pergunta */}
                    <h2 className="text-xl md:text-2xl font-serif text-white leading-relaxed mb-8 min-h-[4rem]">
                        {currentQ.q}
                    </h2>

                    {/* Respostas */}
                    <div className="space-y-3">
                        {currentQ.a.map((answer: string, idx: number) => {
                            const isSelected = selectedAns === idx;
                            const isCorrect = idx === currentQ.correct;
                            
                            // Define estilo baseado no estado
                            // Se selecionado: Checa se é certo (verde) ou errado (vermelho)
                            // Se não selecionado, mas já revelou a resposta (animating): Mostra a correta em verde (opcional) ou opacidade
                            let btnStyle = "border-neutral-700 hover:border-white/50 text-neutral-300";
                            
                            if (isAnimating) {
                                if (isSelected) {
                                    btnStyle = isCorrect 
                                        ? "bg-green-500/20 border-green-500 text-green-200" 
                                        : "bg-red-500/20 border-red-500 text-red-200";
                                } else if (isCorrect && selectedAns !== null) {
                                    // Mostra a correta se errou
                                    btnStyle = "bg-green-500/10 border-green-500/50 text-green-200 opacity-70";
                                } else {
                                    btnStyle = "border-neutral-800 text-neutral-600 opacity-50";
                                }
                            } else if (isSelected) {
                                btnStyle = "bg-white text-black border-white";
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    whileHover={!isAnimating ? { scale: 1.02 } : {}}
                                    whileTap={!isAnimating ? { scale: 0.98 } : {}}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={isAnimating}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${btnStyle}`}
                                >
                                    <span className="font-bold text-sm md:text-base">{answer}</span>
                                    {isAnimating && isSelected && (
                                        isCorrect ? <Check size={20} /> : <X size={20} />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-10"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500 blur-[60px] opacity-20" />
                        <Trophy size={80} className="text-yellow-400 mb-6 drop-shadow-2xl relative z-10" />
                    </div>
                    
                    <h2 className="text-4xl font-serif text-white mb-2">Quiz Completo!</h2>
                    <p className="text-neutral-400 mb-8 max-w-xs mx-auto">
                        Você acertou <strong className="text-white text-lg">{score}</strong> de {questions.length}. 
                        {score === questions.length ? " Perfeito! Você sabe tudo! ❤️" : " Nada mal, mas dá pra melhorar! 😘"}
                    </p>

                    <div className="w-full bg-neutral-800 rounded-full h-4 mb-10 overflow-hidden border border-neutral-700">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(score / questions.length) * 100}%` }}
                            transition={{ delay: 0.2, duration: 1 }}
                            className={`h-full ${score === questions.length ? "bg-gradient-to-r from-yellow-400 to-yellow-600" : "bg-gradient-to-r from-rose-500 to-purple-500"}`}
                        />
                    </div>

                    <button 
                        onClick={restartGame}
                        className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-neutral-200 transition hover:scale-105 active:scale-95"
                    >
                        <RefreshCcw size={18} /> Jogar Novamente
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}