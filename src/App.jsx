import { useEffect, useState } from "react";
import "./App.css";
import { initAlbumBook } from "./albumBook";
import { supabase, supabaseConfigError } from "./supabaseClient";

function App() {
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    const cleanup = initAlbumBook();
    return cleanup;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanName = guestName.trim();
    const cleanMessage = guestMessage.trim();

    if (!cleanName) {
      setSubmitState("error");
      setFeedbackText("hãy để lại tên bạn cho mình biết nhé!");
      return;
    }

    if (!cleanMessage) {
      setSubmitState("error");
      setFeedbackText("Bạn ơi, để lại lời nhắn cho Nam nữa nhé!");
      return;
    }

    setSubmitState("loading");
    setFeedbackText("");

    if (!supabase || supabaseConfigError) {
      setSubmitState("error");
      setFeedbackText("Chưa cấu hình Supabase. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.");
      return;
    }

    const { error } = await supabase.from("guest_messages").insert({
      name: cleanName,
      message: cleanMessage,
    });

    if (error) {
      setSubmitState("error");
      setFeedbackText("Gửi chưa thành công, bạn thử lại giúp mình nhé.");
      return;
    }

    setSubmitState("success");
    setFeedbackText(`Cảm ơn ${cleanName}, lời nhắn của bạn đã được ghi nhận.`);
    setGuestName("");
    setGuestMessage("");
  };

  return (
    <div className="scene">
      <div className="book-title-top">✦ Album Ký Ức ✦</div>

      <div className="book-perspective">
        <div className="book" id="book">
          <div className="book-shadow"></div>
          <div className="spine"></div>
          <div className="static-left" id="staticLeft"></div>
          <div className="static-right" id="staticRight"></div>
          <div className="flip-wrap" id="flipWrap">
            <div className="flip-face front" id="flipFront"></div>
            <div className="flip-face back" id="flipBack"></div>
          </div>
        </div>
      </div>

      <div className="controls">
        <button className="btn" id="prevBtn" disabled>
          ← Trước
        </button>
        <div className="page-label" id="pageLabel">
          Bìa sách
        </div>
        <button className="btn" id="nextBtn">
          Tiếp →
        </button>
      </div>

      <section className="guest-note-box">
        <h3>Bạn có muốn gửi lời nào đến Nam không?</h3>
        <form className="guest-note-form" onSubmit={handleSubmit}>
          <label>
            Tên của bạn
            <input
              type="text"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder="Nhập tên của bạn"
              maxLength={80}
              required
            />
          </label>
          <label>
            Lời nhắn
            <textarea
              value={guestMessage}
              onChange={(event) => setGuestMessage(event.target.value)}
              placeholder="Viết lời chúc cho Nam..."
              rows={3}
              maxLength={500}
              required
            />
          </label>
          <button type="submit" className="guest-note-submit" disabled={submitState === "loading"}>
            {submitState === "loading" ? "Đang gửi..." : "Gửi lời nhắn"}
          </button>
        </form>
        {feedbackText ? <p className={`guest-note-feedback ${submitState}`}>{feedbackText}</p> : null}
      </section>
    </div>
  );
}

export default App;
