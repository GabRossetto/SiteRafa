const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// ==========================================
// 1. ESTADO GLOBAL DO SISTEMA (Banco de Memória)
// ==========================================

// --- MURAL ---
// Estrutura: { id, text, image, x, y, rotate, style, createdAt }
let activeNotes = []; 

// --- JOGO SINCRONIA ---
let lastClickTime = 0;
let lastClickerId = "";

// --- JOGO DA VELHA (TIC TAC TOE) ---
let tictacState = {
  board: Array(9).fill(null),
  isXNext: true,
  winner: null,
  score: { X: 0, O: 0 },
  players: { X: null, O: null }
};

// --- JOGO DA MEMÓRIA ---
const MEMORY_ICONS = ["💘", "🧸", "🌹", "🍫", "🍕", "🐶", "✈️", "💍"];

const generateMemoryBoard = () => {
  // Duplica os ícones, embaralha e cria o estado inicial
  return [...MEMORY_ICONS, ...MEMORY_ICONS]
    .sort(() => Math.random() - 0.5)
    .map((val, i) => ({ id: i, val, isFlipped: false, isMatched: false }));
};

let memoryState = {
  board: generateMemoryBoard(),
  score: { P1: 0, P2: 0 },
  turn: 'P1',
  players: { P1: null, P2: null },
  flippedBuffer: [], // Cartas viradas temporariamente
  isProcessing: false // Bloqueia cliques durante animação de erro
};

// ==========================================
// 2. FUNÇÕES AUXILIARES
// ==========================================

function checkTicTacWinner(board) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(let line of lines) {
    const [a,b,c] = line;
    if(board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.includes(null) ? null : "Empate";
}

// ==========================================
// 3. EVENTOS DO SOCKET
// ==========================================

io.on('connection', (socket) => {
  
  // -- GERENCIAMENTO DE PRESENÇA --
  const countUsers = () => io.of("/").sockets.size;
  io.emit('user_count', countUsers());
  console.log(`🟢 Conectou: ${socket.id} | Total: ${countUsers()}`);
  
  socket.on('ask_status', () => io.emit('user_count', countUsers()));

  // -- DISCONNECT (Limpeza de Vagas Importante) --
  socket.on('disconnect', () => {
    console.log(`🔴 Saiu: ${socket.id}`);

    // Limpa Vagas Velha
    if (tictacState.players.X === socket.id) tictacState.players.X = null;
    if (tictacState.players.O === socket.id) tictacState.players.O = null;
    
    // Limpa Vagas Memória
    if (memoryState.players.P1 === socket.id) memoryState.players.P1 = null;
    if (memoryState.players.P2 === socket.id) memoryState.players.P2 = null;
    
    io.emit('user_count', countUsers());
  });

  // ==========================
  // LÓGICA DO MURAL
  // ==========================
  socket.emit('load_notes', activeNotes);

  // Nova Nota
  socket.on('new_note', (data) => {
    const note = { ...data, id: Date.now() };
    activeNotes.push(note);
    io.emit('receive_note', note);
  });

  // Mover Nota (Salvar posição)
  socket.on('move_note', ({ id, x, y }) => {
    const index = activeNotes.findIndex(n => n.id === id);
    if (index !== -1) {
        activeNotes[index].x = x;
        activeNotes[index].y = y;
        // Envia apenas o update da posição para todos
        io.emit('update_note_position', { id, x, y });
    }
  });

  // Limpar Tudo
  socket.on('clear_board', () => { 
    activeNotes = []; 
    io.emit('board_cleared'); 
  });


  // ==========================
  // JOGO: SINCRONIA
  // ==========================
  socket.on('click_attempt', () => {
    const now = Date.now();
    if ((now - lastClickTime) < 800 && lastClickerId !== socket.id && lastClickerId !== "") {
      io.emit('game_win', { timeDiff: now - lastClickTime });
      lastClickTime = 0; lastClickerId = "";
    } else {
      lastClickTime = now; lastClickerId = socket.id;
      socket.broadcast.emit('partner_clicked'); 
    }
  });


  // ==========================
  // JOGO: JOGO DA VELHA
  // ==========================
  
  socket.on('tictac_request_state', () => {
    // Tenta pegar vaga
    if (!tictacState.players.X && tictacState.players.O !== socket.id) tictacState.players.X = socket.id;
    else if (!tictacState.players.O && tictacState.players.X !== socket.id) tictacState.players.O = socket.id;
    
    // Define role
    let myRole = 'SPECTATOR';
    if (tictacState.players.X === socket.id) myRole = 'X';
    else if (tictacState.players.O === socket.id) myRole = 'O';
    
    socket.emit('tictac_role', myRole);
    socket.emit('tictac_update', tictacState);
  });

  socket.on('tictac_move', (idx) => {
    const isX = socket.id === tictacState.players.X;
    const isO = socket.id === tictacState.players.O;
    const isTurnX = tictacState.isXNext;

    // Validações
    if( (isTurnX && !isX) || (!isTurnX && isX) ) return;
    if( (!isX && !isO) ) return; // Espectador não joga
    if (tictacState.board[idx] || tictacState.winner) return;

    // Executa
    tictacState.board[idx] = isTurnX ? "❤️" : "💋";
    tictacState.isXNext = !tictacState.isXNext;
    tictacState.winner = checkTicTacWinner(tictacState.board);
    
    if(tictacState.winner && tictacState.winner !== "Empate") {
       tictacState.winner === "❤️" ? tictacState.score.X++ : tictacState.score.O++;
    }
    io.emit('tictac_update', tictacState);
  });

  socket.on('tictac_reset', () => {
    tictacState.board = Array(9).fill(null);
    tictacState.winner = null;
    // Não reseta o placar nem os players
    io.emit('tictac_update', tictacState);
  });


  // ==========================
  // JOGO: JOGO DA MEMÓRIA
  // ==========================
  
  socket.on('memory_request_state', () => {
    // 1. Inicializa board se vazio (primeiro acesso)
    if (!memoryState.board || memoryState.board.length === 0) {
        memoryState.board = generateMemoryBoard();
    }

    // 2. Atribui Jogadores
    if (!memoryState.players.P1 && memoryState.players.P2 !== socket.id) {
        memoryState.players.P1 = socket.id;
    } else if (!memoryState.players.P2 && memoryState.players.P1 !== socket.id) {
        memoryState.players.P2 = socket.id;
    }

    // 3. Define papel deste socket
    let role = 'SPECTATOR';
    if (memoryState.players.P1 === socket.id) role = 'P1';
    else if (memoryState.players.P2 === socket.id) role = 'P2';

    // 4. Envia estado atual
    socket.emit('memory_role', role);
    socket.emit('memory_update', memoryState);
  });

  socket.on('memory_flip', (cardId) => {
    if (memoryState.isProcessing) return; 
    
    // Valida Jogador e Turno
    const isP1 = socket.id === memoryState.players.P1;
    const isP2 = socket.id === memoryState.players.P2;

    if (!isP1 && !isP2) return; // Espectador fora
    if (memoryState.turn === 'P1' && !isP1) return; // Vez do P1, P2 tentou
    if (memoryState.turn === 'P2' && !isP2) return; // Vez do P2, P1 tentou

    // Encontra a carta
    const cardIndex = memoryState.board.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;
    const card = memoryState.board[cardIndex];
    if (card.isFlipped || card.isMatched) return;

    // Vira a carta e coloca no buffer
    memoryState.board[cardIndex].isFlipped = true;
    memoryState.flippedBuffer.push(cardIndex);
    io.emit('memory_update', memoryState);

    // Lógica de verificação (se virou 2 cartas)
    if (memoryState.flippedBuffer.length === 2) {
        memoryState.isProcessing = true; // Trava inputs globalmente

        const idx1 = memoryState.flippedBuffer[0];
        const idx2 = memoryState.flippedBuffer[1];
        
        // Match!
        if (memoryState.board[idx1].val === memoryState.board[idx2].val) {
            memoryState.board[idx1].isMatched = true;
            memoryState.board[idx2].isMatched = true;
            memoryState.score[memoryState.turn]++;
            
            memoryState.flippedBuffer = [];
            memoryState.isProcessing = false;
            
            io.emit('memory_update', memoryState);
        } else {
            // Errou: Espera 1.5s e desvira
            setTimeout(() => {
                memoryState.board[idx1].isFlipped = false;
                memoryState.board[idx2].isFlipped = false;
                memoryState.flippedBuffer = [];
                // Troca turno
                memoryState.turn = memoryState.turn === 'P1' ? 'P2' : 'P1';
                memoryState.isProcessing = false;
                io.emit('memory_update', memoryState);
            }, 1500);
        }
    }
  });

  socket.on('memory_reset', () => {
    memoryState.board = generateMemoryBoard();
    memoryState.flippedBuffer = [];
    memoryState.isProcessing = false;
    memoryState.turn = 'P1';
    // Opcional: memoryState.score = { P1: 0, P2: 0 };
    io.emit('memory_update', memoryState);
  });

});

server.listen(3001, () => {
  console.log('❤️ SERVIDOR MESTRE RODANDO (3001)');
});