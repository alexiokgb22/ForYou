import { useEffect, useRef } from "react";
import "./LetterPaper.css";

type Props = {
  senderName?: string;
  recipientName?: string;
  date?: string;
  body: string;
  signature?: string;
  readOnly?: boolean;
  onDateChange?: (v: string) => void;
  onBodyChange?: (v: string) => void;
  onSignatureChange?: (v: string) => void;
};

export default function LetterPaper({
  senderName,
  recipientName,
  date = "",
  body,
  signature = "",
  readOnly = false,
  onDateChange,
  onBodyChange,
  onSignatureChange,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [body]);

  return (
    <div className="lp">
      <div className="lp-paper">
        <div className="lp-lines" aria-hidden />

        <div className="lp-date-row">
          {readOnly ? (
            <span className="lp-date">{date}</span>
          ) : (
            <input
              className="lp-date-input"
              type="text"
              placeholder="Date"
              value={date}
              onChange={(e) => onDateChange?.(e.target.value)}
              maxLength={40}
            />
          )}
        </div>

        {recipientName && (
          <p className="lp-salutation">Chère {recipientName},</p>
        )}

        {readOnly ? (
          <p className="lp-body">{body}</p>
        ) : (
          <textarea
            ref={textareaRef}
            className="lp-body-input"
            placeholder="Écris ta lettre ici..."
            value={body}
            onChange={(e) => onBodyChange?.(e.target.value)}
            maxLength={3000}
          />
        )}

        <div className="lp-closing-row">
          <span className="lp-closing">Avec affection,</span>
          {readOnly ? (
            <span className="lp-signature">{signature || senderName}</span>
          ) : (
            <input
              className="lp-signature-input"
              type="text"
              placeholder="Ta signature"
              value={signature}
              onChange={(e) => onSignatureChange?.(e.target.value)}
              maxLength={40}
            />
          )}
        </div>
      </div>
    </div>
  );
}
