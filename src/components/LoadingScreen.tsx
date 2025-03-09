import { motion } from "framer-motion";
import { Shield, ArrowRight, LayoutDashboard } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        {/* Animation Container */}
        <motion.div
          className="flex items-center gap-6 text-slate-600"
          animate={{
            x: [-50, 0, 50],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Password Protection Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-3 bg-blue-50 rounded-xl"
          >
            <Shield className="w-8 h-8 text-blue-500" />
          </motion.div>

          {/* Arrow */}
          <ArrowRight className="w-6 h-6" />

          {/* Dashboard Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-3 bg-indigo-50 rounded-xl"
          >
            <LayoutDashboard className="w-8 h-8 text-indigo-500" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-semibold text-slate-800">
            Accessing Dashboard
          </h2>
          <p className="text-slate-500 text-sm">
            Please wait while we prepare your dashboard...
          </p>
        </motion.div>
      </div>
    </div>
  );
}
