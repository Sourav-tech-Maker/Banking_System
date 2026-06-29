import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Coins,
  Loader2,
  Lock,
  Mic,
  ShieldAlert,
  Trophy,
  XCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const FALLBACK_QUESTION_SECONDS = 20;
const FALLBACK_QUIZ_SECONDS = 15 * 60;

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function WeeklyTechQuiz({ quiz, onBack }) {
  const [phase, setPhase] = useState("intro");
  const [quizMeta, setQuizMeta] = useState(quiz || null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizSeconds, setQuizSeconds] = useState(quiz?.durationSeconds || FALLBACK_QUIZ_SECONDS);
  const [questionSeconds, setQuestionSeconds] = useState(quiz?.questionSeconds || FALLBACK_QUESTION_SECONDS);
  const [warning, setWarning] = useState("");
  const [terminatedReason, setTerminatedReason] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  const cleanupMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const loadCurrentQuiz = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/quiz/weekly`, {
        withCredentials: true,
      });
      setQuizMeta(response.data?.quiz || quiz || null);
    } catch {
      setQuizMeta(quiz || null);
    }
  }, [quiz]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadCurrentQuiz, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadCurrentQuiz]);

  const submitQuiz = useCallback(async () => {
    if (!attemptId || phase !== "active") return;

    cleanupMedia();
    setLoading(true);
    setApiError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/quiz/submit`,
        { attemptId, answers },
        { withCredentials: true },
      );
      setResult(response.data);
      setPhase("result");
    } catch (error) {
      setApiError(error.response?.data?.message || "Quiz submission failed.");
    } finally {
      setLoading(false);
    }
  }, [answers, attemptId, cleanupMedia, phase]);

  const terminateQuiz = useCallback((reason, eventType = "screen_leave") => {
    cleanupMedia();
    setTerminatedReason(reason);
    setPhase("terminated");

    if (attemptId) {
      axios.post(
        `${API_BASE_URL}/api/quiz/terminate`,
        { attemptId, reason, eventType },
        { withCredentials: true },
      ).catch(() => { });
    }
  }, [attemptId, cleanupMedia]);

  const startQuiz = async () => {
    setPermissionError("");
    setApiError("");
    setLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/quiz/start`,
        {
          mediaConsent: {
            camera: true,
            microphone: true,
          },
        },
        { withCredentials: true },
      );

      const serverQuiz = response.data?.quiz || quizMeta || {};
      const serverQuestions = response.data?.questions || [];

      streamRef.current = stream;
      setAttemptId(response.data?.attemptId || "");
      setQuizMeta(serverQuiz);
      setQuestions(serverQuestions);
      setCurrentIndex(0);
      setAnswers({});
      setResult(null);
      setQuizSeconds(serverQuiz.durationSeconds || FALLBACK_QUIZ_SECONDS);
      setQuestionSeconds(serverQuiz.questionSeconds || FALLBACK_QUESTION_SECONDS);
      setPhase("active");

      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 0);
    } catch (error) {
      cleanupMedia();
      if (error.name === "NotAllowedError") {
        setPermissionError("Camera and microphone permission is required before starting the quiz.");
      } else {
        setApiError(error.response?.data?.message || "Unable to start the weekly quiz.");
      }
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = (option) => {
    if (!currentQuestion) return;

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: option,
    }));
  };

  const goNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      submitQuiz();
      return;
    }

    setCurrentIndex((index) => index + 1);
    setQuestionSeconds(quizMeta?.questionSeconds || FALLBACK_QUESTION_SECONDS);
    setWarning("");
  }, [currentIndex, questions.length, quizMeta?.questionSeconds, submitQuiz]);

  useEffect(() => {
    if (phase !== "active" || !questions.length) return undefined;

    const intervalId = window.setInterval(() => {
      setQuizSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(intervalId);
          submitQuiz();
          return 0;
        }

        return seconds - 1;
      });

      setQuestionSeconds((seconds) => {
        if (seconds <= 1) {
          goNext();
          return quizMeta?.questionSeconds || FALLBACK_QUESTION_SECONDS;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [goNext, phase, questions.length, quizMeta?.questionSeconds, submitQuiz]);

  useEffect(() => {
    if (phase !== "active") return undefined;

    const blockAction = (event) => {
      event.preventDefault();
      setWarning("Copy, paste and right-click are disabled during the quiz.");
    };
    const handleVisibility = () => {
      if (document.hidden) {
        terminateQuiz("Quiz terminated because the quiz tab was left or minimized.", "visibility_hidden");
      }
    };
    const handleBlur = () => {
      terminateQuiz("Quiz terminated because the quiz window lost focus.", "window_blur");
    };

    document.addEventListener("copy", blockAction);
    document.addEventListener("paste", blockAction);
    document.addEventListener("contextmenu", blockAction);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("copy", blockAction);
      document.removeEventListener("paste", blockAction);
      document.removeEventListener("contextmenu", blockAction);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [phase, terminateQuiz]);

  useEffect(() => {
    return cleanupMedia;
  }, [cleanupMedia]);

  if (phase === "terminated") {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-rose-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">Quiz Terminated</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{terminatedReason}</p>
        <p className="mt-3 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Per the quiz rules, leaving the quiz interface may suspend the user from the next four quizzes.
        </p>
        <button
          className="mt-6 rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          onClick={onBack}
          type="button"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <Trophy className="size-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">Quiz Submitted</h2>
        <p className="mt-3 text-sm text-slate-600">
          You scored <strong>{result?.score || 0}/{result?.totalQuestions || questions.length}</strong> and earned{" "}
          <strong>{result?.earnedCoins || 0} Nexora Coins</strong>.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Correct</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{result?.score || 0}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Questions</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{result?.totalQuestions || questions.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Coins</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{result?.earnedCoins || 0}</p>
          </div>
        </div>
        <button
          className="mt-6 rounded-md bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
          onClick={onBack}
          type="button"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (phase === "active") {
    return (
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm font-semibold text-indigo-600">{currentQuestion?.topic}</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">
                Question {currentIndex + 1} of {questions.length}
              </h2>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                <Clock className="size-4" />
                {formatTimer(quizSeconds)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-md bg-amber-100 px-3 py-2 text-sm font-bold text-amber-800">
                {questionSeconds}s
              </span>
            </div>
          </div>

          {warning && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="size-4" />
              {warning}
            </div>
          )}
          {apiError && (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {apiError}
            </div>
          )}

          <h3 className="mt-6 text-2xl font-bold leading-8 text-slate-950">
            {currentQuestion?.question}
          </h3>

          <div className="mt-6 grid gap-3">
            {(currentQuestion?.options || []).map((option) => {
              const selected = answers[currentQuestion.id] === option;

              return (
                <button
                  className={`rounded-lg border px-4 py-4 text-left text-sm font-semibold transition ${selected
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  key={option}
                  onClick={() => answerQuestion(option)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-60"
              disabled={loading}
              onClick={goNext}
              type="button"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {currentIndex >= questions.length - 1 ? "Submit Quiz" : "Next Question"}
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-950">Live Monitoring</h3>
            <video
              autoPlay
              className="mt-3 aspect-video w-full rounded-md bg-slate-950 object-cover"
              muted
              playsInline
              ref={videoRef}
            />
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">
                <Camera className="size-3.5" />
                Camera
              </span>
              <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">
                <Mic className="size-3.5" />
                Microphone
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-950">Rules Active</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-600" /> No previous questions</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-600" /> Copy/paste blocked</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-600" /> Screen leave terminates quiz</li>
            </ul>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-violet-100 px-3 py-2 text-sm font-bold text-violet-700">
              <Trophy className="size-4" />
              {quizMeta?.title || "Weekly Tech Quiz"}
            </div>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">Take the Nexora Weekly Tech Quiz</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Questions, attempts, scoring and leaderboard data now come from the backend. The browser only receives
              randomized questions and options, not the answer key.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Coins className="size-4" />
                  Entry Fee
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">₹{quizMeta?.entryFee || 10}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Question Timer</p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {quizMeta?.questionSeconds || FALLBACK_QUESTION_SECONDS}s
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Quiz Timer</p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {formatTimer(quizMeta?.durationSeconds || FALLBACK_QUIZ_SECONDS)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg">
            <div className="flex size-14 items-center justify-center rounded-lg bg-white/15">
              <Lock className="size-7" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Before You Start</h3>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Keep this tab active and allow camera plus microphone access. Leaving the screen terminates the quiz.
            </p>
            {(permissionError || apiError) && (
              <p className="mt-4 rounded-md bg-white/10 px-3 py-2 text-sm text-white">
                {permissionError || apiError}
              </p>
            )}
            <button
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-60"
              disabled={loading || quizMeta?.canStart === false}
              onClick={startQuiz}
              type="button"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {quizMeta?.canStart === false ? "Quiz Locked" : "Start Secure Quiz"}
            </button>
          </div>
        </div>
      </section>

      <button
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        onClick={onBack}
        type="button"
      >
        <XCircle className="size-4" />
        Back to Dashboard
      </button>
    </div>
  );
}
