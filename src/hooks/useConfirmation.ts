import { useState, useCallback } from "react";

interface UseConfirmationOptions {
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function useConfirmation({
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
}: UseConfirmationOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);

  const open = useCallback((additionalData?: any) => {
    if (additionalData) {
      setData(additionalData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    await onConfirm();
    close();
  }, [onConfirm, close]);

  return {
    isOpen,
    open,
    close,
    data,
    dialogProps: {
      isOpen,
      onClose: close,
      onConfirm: handleConfirm,
      title,
      description,
      confirmText,
      cancelText,
      variant,
    },
  };
}
