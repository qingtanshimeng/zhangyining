const form = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");
const quoteEl = document.querySelector("#quote-text");
const copyQuestionButtons = document.querySelectorAll("[data-copy-question]");
const copyContactButtons = document.querySelectorAll("[data-copy-contact]");
const themeToggle = document.querySelector("#theme-toggle");
const root = document.documentElement;

function setTheme(theme, persist = true) {
  root.setAttribute("data-theme", theme);
  if (persist) {
    localStorage.setItem("theme", theme);
  }
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "白天模式" : "夜间模式";
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "切换白天模式" : "切换夜间模式"
    );
  }
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark" || savedTheme === "light") {
  setTheme(savedTheme, false);
} else {
  setTheme("light", false);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme") || "light";
    setTheme(currentTheme === "dark" ? "light" : "dark", true);
  });
}

const quotes = [
  "训练身体，是为了更久地看见未来；认真交友，是为了让未来更宽广。",
  "真正的成熟，不是懂很多道理，而是愿意把日子过好。",
  "我想结交的朋友，是遇事能商量，开心能分享，低谷能并肩。"
];

if (quoteEl) {
  let index = 0;
  setInterval(() => {
    index = (index + 1) % quotes.length;
    quoteEl.textContent = `“${quotes[index]}”`;
  }, 4500);
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = form.querySelector("input[name='name']")?.value.trim();
    const city = form.querySelector("input[name='city']")?.value.trim();
    const contact = form.querySelector("input[name='contact']")?.value.trim();
    const message = form.querySelector("textarea[name='message']")?.value.trim();

    if (!name || !city || !contact || !message) {
      alert("请先完整填写称呼、城市、联系方式和留言内容，再发送哦。");
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;
    if (formNote) formNote.textContent = "正在发送中，请稍候...";

    const payload = new FormData(form);
    payload.append("_subject", "网站新留言｜张一宁个人主页");
    payload.append("_template", "table");
    payload.append("_captcha", "false");
    payload.append("_honey", "");

    try {
      const response = await fetch("https://formsubmit.co/ajax/954860451@qq.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload
      });

      const result = await response.json().catch(() => ({}));
      const success = response.ok && (result.success === true || result.success === "true");
      if (!success) {
        const msg = typeof result.message === "string" ? result.message : "submit failed";
        throw new Error(msg);
      }

      if (formNote) formNote.textContent = "发送成功！我会尽快联系你。";
      alert(`收到啦，${name}！很高兴认识你，来自${city}的你我会认真回复。`);
      form.reset();
    } catch (error) {
      const errText = error instanceof Error ? error.message : "";
      const localHint = errText.includes("web server")
        ? "请通过线上链接打开网站后再提交（不要用本地文件直接双击打开）。"
        : "发送失败，请稍后再试，或直接邮件联系 954860451@qq.com。";
      if (formNote) formNote.textContent = localHint;
      alert(localHint);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

copyQuestionButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const question = button.parentElement?.querySelector("p")?.textContent?.trim();
    if (!question) return;

    try {
      await navigator.clipboard.writeText(question);
      const oldText = button.textContent;
      button.textContent = "已复制";
      setTimeout(() => {
        button.textContent = oldText || "复制这句";
      }, 1000);
    } catch {
      alert("复制失败，请手动复制这句话。");
    }
  });
});

copyContactButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.getAttribute("data-copy-contact");
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const oldText = button.textContent;
      button.textContent = "已复制";
      setTimeout(() => {
        button.textContent = oldText || "复制";
      }, 1000);
    } catch {
      alert("复制失败，请手动复制。");
    }
  });
});

const canUseTilt =
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canUseTilt) {
  const tiltCards = document.querySelectorAll(
    ".timeline-item, .card, .social-card, .icebreaker-item, .update-item, .match-card, .contact-form"
  );

  tiltCards.forEach((card) => {
    card.classList.add("tilt-card");
    const maxTilt = 1.2;
    let frameId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function animate() {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      const nearZero = Math.abs(currentX) < 0.01 && Math.abs(currentY) < 0.01;

      card.style.transform = nearZero
        ? ""
        : `perspective(900px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg) translateY(-0.5px)`;

      if (!nearZero || Math.abs(targetX) > 0.01 || Math.abs(targetY) > 0.01) {
        frameId = requestAnimationFrame(animate);
      } else {
        frameId = 0;
      }
    }

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      targetY = (x - 0.5) * maxTilt * 2;
      targetX = (0.5 - y) * maxTilt * 2;
      if (!frameId) frameId = requestAnimationFrame(animate);
    });

    card.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      if (!frameId) frameId = requestAnimationFrame(animate);
    });
  });
}
