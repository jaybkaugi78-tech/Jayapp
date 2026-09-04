import {
  RotateCcw,
  Send,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

const initialGame = {
  board: Array(9).fill(null),
  turn: "Jay",
  winner: null,
  jayScore: 0,
  millieScore: 0,
  draws: 0,
};

const GAME_DOC = "main";

export default function Game({
  person,
}) {
  const [game, setGame] =
    useState(initialGame);

  const [chat, setChat] =
    useState([]);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const chatBottom =
    useRef(null);

  // ============================
  // WINNER CHECK
  // ============================

  const winnerFor = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [
      a,
      b,
      c,
    ] of lines) {
      if (
        board[a] &&
        board[a] === board[b] &&
        board[a] === board[c]
      ) {
        return board[a];
      }
    }

    return null;
  };

  // ============================
  // LIVE GAME
  // ============================

  useEffect(() => {
    const gameRef = doc(
      db,
      "game",
      GAME_DOC
    );

    const unsubscribe =
      onSnapshot(
        gameRef,

        async (snapshot) => {
          if (
            !snapshot.exists()
          ) {
            try {
              await setDoc(
                gameRef,
                initialGame
              );
            } catch (err) {
              console.error(
                "Create game error:",
                err
              );

              setError(
                "Unable to create game."
              );
            }

            setLoading(false);
            return;
          }

          const data =
            snapshot.data();

          setGame({
            ...initialGame,
            ...data,
            board:
              Array.isArray(
                data.board
              ) &&
              data.board.length ===
                9
                ? data.board
                : Array(9).fill(
                    null
                  ),
          });

          setLoading(false);
          setError("");
        },

        (err) => {
          console.error(
            "Game listener error:",
            err
          );

          setLoading(false);

          setError(
            "Unable to load game."
          );
        }
      );

    return unsubscribe;
  }, []);

  // ============================
  // LIVE GAME CHAT
  // ============================

  useEffect(() => {
    const chatRef =
      collection(
        db,
        "game_chat"
      );

    const unsubscribe =
      onSnapshot(
        chatRef,

        (snapshot) => {
          const messages =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          messages.sort(
            (a, b) => {
              const aTime =
                a.createdAt
                  ?.toMillis?.() ||
                a.timestamp
                  ?.toMillis?.() ||
                0;

              const bTime =
                b.createdAt
                  ?.toMillis?.() ||
                b.timestamp
                  ?.toMillis?.() ||
                0;

              return (
                aTime -
                bTime
              );
            }
          );

          setChat(messages);
        },

        (err) => {
          console.error(
            "Game chat error:",
            err
          );

          setError(
            "Unable to load game chat."
          );
        }
      );

    return unsubscribe;
  }, []);

  // ============================
  // AUTO SCROLL CHAT
  // ============================

  useEffect(() => {
    chatBottom.current
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, [chat]);

  // ============================
  // MAKE MOVE
  // ============================

  const move = async (
    index
  ) => {
    if (
      loading ||
      game.board[index] ||
      game.winner ||
      game.turn !== person
    ) {
      return;
    }

    if (!auth.currentUser) {
      return;
    }

    const gameRef = doc(
      db,
      "game",
      GAME_DOC
    );

    setError("");

    try {
      await runTransaction(
        db,
        async (
          transaction
        ) => {
          const snapshot =
            await transaction.get(
              gameRef
            );

          if (
            !snapshot.exists()
          ) {
            throw new Error(
              "Game does not exist."
            );
          }

          const current = {
            ...initialGame,
            ...snapshot.data(),
          };

          const board =
            Array.isArray(
              current.board
            )
              ? [
                  ...current.board,
                ]
              : Array(9).fill(
                  null
                );

          // Another player may
          // have already moved.
          if (
            board[index] ||
            current.winner ||
            current.turn !==
              person
          ) {
            return;
          }

          board[index] =
            person === "Jay"
              ? "X"
              : "O";

          const symbol =
            winnerFor(board);

          let winner = null;

          let jayScore =
            current.jayScore ||
            0;

          let millieScore =
            current.millieScore ||
            0;

          let draws =
            current.draws ||
            0;

          if (
            symbol === "X"
          ) {
            winner = "Jay";
            jayScore += 1;
          } else if (
            symbol === "O"
          ) {
            winner =
              "Millie";

            millieScore += 1;
          } else if (
            board.every(
              Boolean
            )
          ) {
            winner = "Draw";
            draws += 1;
          }

          transaction.update(
            gameRef,
            {
              board,
              winner,
              jayScore,
              millieScore,
              draws,

              turn:
                person ===
                "Jay"
                  ? "Millie"
                  : "Jay",

              lastMoveBy:
                person,

              lastMoveAt:
                serverTimestamp(),
            }
          );
        }
      );
    } catch (err) {
      console.error(
        "Move error:",
        err
      );

      setError(
        "Unable to make move."
      );
    }
  };

  // ============================
  // NEW ROUND
  // ============================

  const newRound =
    async () => {
      const gameRef = doc(
        db,
        "game",
        GAME_DOC
      );

      setError("");

      try {
        await runTransaction(
          db,
          async (
            transaction
          ) => {
            const snapshot =
              await transaction.get(
                gameRef
              );

            const current =
              snapshot.exists()
                ? {
                    ...initialGame,
                    ...snapshot.data(),
                  }
                : initialGame;

            transaction.set(
              gameRef,
              {
                ...current,

                board:
                  Array(9).fill(
                    null
                  ),

                winner: null,

                turn: "Jay",

                roundResetBy:
                  person,

                roundResetAt:
                  serverTimestamp(),
              }
            );
          }
        );
      } catch (err) {
        console.error(
          "New round error:",
          err
        );

        setError(
          "Unable to start a new round."
        );
      }
    };

  // ============================
  // SEND GAME MESSAGE
  // ============================

  const send = async (e) => {
    e.preventDefault();

    const value =
      text.trim();

    if (!value) {
      return;
    }

    if (
      !auth.currentUser
    ) {
      setError(
        "You need to be signed in."
      );

      return;
    }

    setSending(true);
    setError("");

    try {
      await addDoc(
        collection(
          db,
          "game_chat"
        ),
        {
          sender:
            person,

          text:
            value,

          senderId:
            auth.currentUser.uid,

          createdAt:
            serverTimestamp(),
        }
      );

      setText("");
    } catch (err) {
      console.error(
        "Send game chat error:",
        err
      );

      setError(
        "Unable to send game message."
      );
    } finally {
      setSending(false);
    }
  };

  // ============================
  // UI
  // ============================

  return (
    <section className="screen">
      <div className="section-head">
        <div>
          <h2>
            Tic-Tac-Toe
          </h2>

          <p>
            Jay vs Millie
          </p>
        </div>

        <span className="online-pill">
          ● Live
        </span>
      </div>

      {error && (
        <div
          style={{
            marginBottom:
              "12px",
            fontSize:
              "12px",
            color:
              "var(--danger)",
          }}
        >
          {error}
        </div>
      )}

      <div className="scoreboard">
        <div className="score jay">
          <span>
            Jay
          </span>

          <strong>
            {game.jayScore ||
              0}
          </strong>
        </div>

        <div className="draw-score">
          <span>
            Draws
          </span>

          <strong>
            {game.draws || 0}
          </strong>
        </div>

        <div className="score millie">
          <span>
            Millie
          </span>

          <strong>
            {game.millieScore ||
              0}
          </strong>
        </div>
      </div>

      <div className="game-status">
        {loading
          ? "Loading game..."
          : game.winner ===
            "Draw"
          ? "It's a draw."
          : game.winner
          ? `${game.winner} wins!`
          : game.turn ===
            person
          ? "Your turn"
          : `${game.turn}'s turn`}
      </div>

      <div className="ttt">
        {game.board.map(
          (
            cell,
            index
          ) => (
            <button
              type="button"
              key={index}
              disabled={
                loading ||
                Boolean(cell) ||
                Boolean(
                  game.winner
                ) ||
                game.turn !==
                  person
              }
              className={
                cell === "X"
                  ? "jay"
                  : cell ===
                    "O"
                  ? "millie"
                  : ""
              }
              onClick={() =>
                move(index)
              }
            >
              {cell}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="new-game"
        onClick={
          newRound
        }
      >
        <RotateCcw
          size={15}
        />

        &nbsp; New round
      </button>

      <div className="game-chat">
        <h3>
          Game chat
        </h3>

        <div className="game-chat-list">
          {chat.length ===
            0 && (
            <div className="empty">
              No game messages yet.
            </div>
          )}

          {chat.map(
            (message) => {
              const sender =
                message.sender ||
                message.from ||
                "Unknown";

              return (
                <div
                  className={`game-msg ${
                    sender ===
                    person
                      ? "mine"
                      : ""
                  }`}
                  key={
                    message.id
                  }
                >
                  <div
                    className={
                      sender ===
                      "Millie"
                        ? "millie-bubble"
                        : "jay-bubble"
                    }
                  >
                    {
                      message.text
                    }
                  </div>

                  <small>
                    {sender}
                  </small>
                </div>
              );
            }
          )}

          <div
            ref={
              chatBottom
            }
          />
        </div>

        <form
          className="mini-composer"
          onSubmit={send}
        >
          <input
            value={text}
            placeholder="Game message..."
            disabled={
              sending
            }
            onChange={(e) =>
              setText(
                e.target.value
              )
            }
          />

          <button
            type="submit"
            disabled={
              sending ||
              !text.trim()
            }
          >
            <Send
              size={17}
            />
          </button>
        </form>
      </div>
    </section>
  );
}