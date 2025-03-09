import { useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useAuth } from "../lib/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Key, AlertCircle, ShieldAlert } from "lucide-react"; // Import icons
import { useToast } from "@/hooks/use-toast";

// Constants for attempt limits and block durations
const WARN_ATTEMPTS = 3;
const BLOCK_ATTEMPTS = 5;
const INITIAL_BLOCK_DURATION = 60; // 1 minute in seconds
const EXTENDED_BLOCK_DURATION = 600; // 10 minutes in seconds

export default function PasswordProtection() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const [lastLength, setLastLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Attempt tracking state
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState<number | null>(null);
  const [blockDuration, setBlockDuration] = useState(INITIAL_BLOCK_DURATION);
  const [countdown, setCountdown] = useState<number>(0);

  // Show content with animation after mount
  useEffect(() => {
    setShowContent(true);

    // Check if there's an existing block in localStorage
    const storedBlockData = localStorage.getItem("passwordBlockData");
    if (storedBlockData) {
      const { endTime, duration, attemptCount } = JSON.parse(storedBlockData);
      if (endTime > Date.now()) {
        setIsBlocked(true);
        setBlockEndTime(endTime);
        setBlockDuration(duration);
        setAttempts(attemptCount);
      } else {
        // Clear expired block
        localStorage.removeItem("passwordBlockData");
      }
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBlocked && blockEndTime) {
      const updateCountdown = () => {
        const remaining = Math.max(0, (blockEndTime - Date.now()) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining % 60);
        setCountdown(remaining);

        if (remaining <= 0) {
          setIsBlocked(false);
          setBlockEndTime(null);
          localStorage.removeItem("passwordBlockData");
        }
      };

      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isBlocked, blockEndTime]);

  // Clear error when password changes
  useEffect(() => {
    if (error) setError("");
  }, [password]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleBlock = () => {
    const endTime = Date.now() + blockDuration * 1000;
    setIsBlocked(true);
    setBlockEndTime(endTime);

    // Store block data in localStorage
    localStorage.setItem(
      "passwordBlockData",
      JSON.stringify({
        endTime,
        duration: blockDuration,
        attemptCount: attempts,
      })
    );

    // Show block notification
    toast({
      variant: "destructive",
      title: "Account Temporarily Blocked",
      description: `Too many failed attempts. Please wait ${formatTime(
        blockDuration
      )} before trying again.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      const minutes = Math.floor(countdown / 60);
      const seconds = Math.floor(countdown % 60);
      toast({
        variant: "destructive",
        title: "Access Blocked",
        description: `Please wait ${formatTime(
          countdown
        )} before trying again.`,
      });
      return;
    }

    setIsLoading(true);

    // Add artificial delay for smooth animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const isValid = login(password);
    if (!isValid) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError("Invalid password");
      setPassword("");
      setLastLength(0);

      if (newAttempts >= BLOCK_ATTEMPTS) {
        // Increase block duration if already blocked before
        const newDuration =
          blockDuration === INITIAL_BLOCK_DURATION
            ? EXTENDED_BLOCK_DURATION
            : blockDuration;
        setBlockDuration(newDuration);
        handleBlock();
      } else if (newAttempts >= WARN_ATTEMPTS) {
        // Warning for approaching block
        toast({
          variant: "destructive",
          title: "Warning: Multiple Failed Attempts",
          description: `You have ${
            BLOCK_ATTEMPTS - newAttempts
          } attempts remaining before your account is temporarily blocked.`,
        });
      } else {
        // Regular error toast
        toast({
          variant: "destructive",
          title: "Access Denied",
          description:
            "The password you entered is incorrect. Please try again.",
        });
      }
    } else {
      // Reset attempts on successful login
      setAttempts(0);
      localStorage.removeItem("passwordBlockData");
    }
    setIsLoading(false);
  };

  // Handle input changes with paste detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const oldLength = lastLength;
    const newLength = newValue.length;

    // If more than one character was added at once, likely a paste
    if (newLength - oldLength > 1) {
      setPassword(password); // Keep old value
      return;
    }

    setPassword(newValue);
    setLastLength(newLength);
  };

  // Prevent paste from keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
      e.preventDefault();
      return false;
    }
  };

  // Prevent context menu (right click)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Additional clipboard event handlers
  const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.value.length - password.length > 1) {
      e.preventDefault();
      return false;
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    return false;
  };

  if (isAuthenticated) {
    return <Navigate to="/" state={{ from: "/password" }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute w-96 h-96 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div
        className={`w-full max-w-md transform transition-all duration-1000 ease-out ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="relative">
          {/* Logo/Icon Container */}
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2">
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center animate-logo-entrance">
              {isBlocked ? (
                <ShieldAlert className="w-10 h-10 text-red-500" />
              ) : (
                <Lock className="w-10 h-10 text-blue-500" />
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl px-8 pt-14 pb-8 mb-4 transform transition-all"
            onContextMenu={handleContextMenu}
            onPaste={(e: ClipboardEvent<HTMLFormElement>) => e.preventDefault()}
          >
            <div className="mb-6 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">
                  {isBlocked ? "Access Blocked" : "Welcome Back"}
                </h2>
                <p className="text-gray-600 animate-fade-in animation-delay-200">
                  {isBlocked
                    ? `Please wait ${formatTime(countdown)} before trying again`
                    : "Please enter your password to continue"}
                </p>
              </div>

              <div className="relative animate-fade-in animation-delay-400">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={handleInputChange}
                  onBeforeInput={handleBeforeInput}
                  onPaste={handlePaste}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onKeyDown={handleKeyDown}
                  onContextMenu={handleContextMenu}
                  autoComplete="off"
                  data-lpignore="true"
                  spellCheck="false"
                  disabled={isBlocked}
                  className={`w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm
                    ${
                      isBlocked
                        ? "border-red-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                  placeholder={
                    isBlocked ? "Temporarily blocked" : "Enter password"
                  }
                />
              </div>

              {error && !isBlocked && (
                <p className="text-red-500 text-sm mt-2 animate-shake">
                  {error}
                </p>
              )}

              {!isBlocked && attempts > 0 && attempts < BLOCK_ATTEMPTS && (
                <p className="text-amber-500 text-sm mt-2">
                  Failed attempts: {attempts}/{BLOCK_ATTEMPTS}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isBlocked}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 animate-fade-in animation-delay-600
                ${
                  isBlocked
                    ? "bg-red-100 text-red-400 cursor-not-allowed"
                    : isLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white hover:shadow-lg"
                }
              `}
            >
              {isBlocked ? (
                "Blocked"
              ) : isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  <span className="ml-2">Verifying...</span>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
