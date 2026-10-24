/* ═════════════════════════════════════════════════════════════
   ui/GamblingWarning.js — Responsible Gaming Disclosure
   30s first time, 3s later when user presses Exit
   English on top + detected local language below via navigator.language
   ═════════════════════════════════════════════════════════════ */

const ENGLISH_TEXT = `⚠️ WARNING: Gambling is Dangerous

Gambling can be addictive and cause serious financial loss, debt, anxiety, depression and harm to relationships and family life. This app contains SIMULATED gambling (Poker, Blackjack, Yahtzee, Monopoly, Bingo/Tambola, etc.) for ENTERTAINMENT ONLY — no real money, betting or prizes are involved.

Please play responsibly:
• Set time and money limits and stick to them
• Never chase losses and never borrow to play
• Take frequent breaks — do not play when stressed or under influence
• Gambling is not a way to make money
• If you feel you are losing control, stop and seek help immediately

You must be 18+ to play. If you or someone you know has a gambling problem, please contact a local helpline or a responsible-gambling support service in your country.`;

// Local translations below English. Keys are primary language codes.
const TRANSLATIONS = {
  hi: {
    label: "हिन्दी — Hindi (India)",
    text: `⚠️ चेतावनी: जुआ खतरनाक है

जुआ लत बन सकता है और गंभीर वित्तीय नुकसान, कर्ज, चिंता, अवसाद तथा परिवार और रिश्तों को नुकसान पहुँचा सकता है। इस ऐप में केवल मनोरंजन के लिए नकली जुआ (पोकर, ब्लैकजैक, याहत्ज़ी, मोनोपॉली, बिंगो/तंबोला आदि) है — इसमें असली पैसा, सट्टा या इनाम शामिल नहीं है।

कृपया जिम्मेदारी से खेलें:
• समय और सीमा निर्धारित करें और उनका पालन करें
• नुकसान की भरपाई करने की कोशिश कभी न करें, उधार लेकर न खेलें
• नियमित ब्रेक लें — तनाव या नशे में न खेलें
• जुआ पैसा कमाने का तरीका नहीं है
• यदि आप नियंत्रण खो रहे हैं तो तुरंत रुकें और सहायता लें

खेलने के लिए आयु 18+ होनी चाहिए। यदि आपको या आपके किसी परिचित को जुए की समस्या है, तो कृपया अपने देश की स्थानीय हेल्पलाइन या जिम्मेदार जुआ सहायता सेवा से संपर्क करें।`
  },
  bn: {
    label: "বাংলা — Bengali",
    text: `⚠️ সতর্কতা: জুয়া বিপজ্জনক

জুয়া আসক্তি তৈরি করতে পারে এবং গুরুতর আর্থিক ক্ষতি, ঋণ, উদ্বেগ ও পারিবারিক ক্ষতির কারণ হতে পারে। এই অ্যাপে শুধুমাত্র বিনোদনের জন্য নকল জুয়া (পোকার, ব্ল্যাকজ্যাক, ইয়াহটজি, মনোপলি, বিঙ্গো ইত্যাদি) রয়েছে — কোনো আসল টাকা জড়িত নয়। দায়িত্বের সাথে খেলুন, সীমা নির্ধারণ করুন, বিরতি নিন এবং কখনও ক্ষতি পুষিয়ে নেওয়ার চেষ্টা করবেন না। খেলার জন্য বয়স ১৮+ হতে হবে।`
  },
  ta: {
    label: "தமிழ் — Tamil",
    text: `⚠️ எச்சரிக்கை: சூதாட்டம் ஆபத்தானது

சூதாட்டம் அடிமையாக்கும் மற்றும் கடுமையான நிதி இழப்பு, கடன், மன அழுத்தம் மற்றும் குடும்ப பாதிப்பை ஏற்படுத்தும். இந்த செயலியில் பொழுதுபோக்கிற்காக மட்டுமே போலி சூதாட்டம் (போக்கர், பிளாக்ஜாக் போன்றவை) உள்ளது — உண்மை பணம் இல்லை. பொறுப்புடன் விளையாடுங்கள், எல்லை வைக்கவும், இடைவெளி எடுக்கவும். வயது 18+ .`
  },
  te: {
    label: "తెలుగు — Telugu",
    text: `⚠️ హెచ్చరిక: జూదం ప్రమాదకరం

జూదం వ్యసనంగా మారి తీవ్ర ఆర్థిక నష్టం, అప్పులు, ఆందోళన మరియు కుటుంబ సమస్యలకు దారితీస్తుంది. ఈ యాప్‌లో వినోదం కోసం మాత్రమే నకిలీ జూదం (పోకర్, బ్లాక్‌జాక్ మొదలైనవి) ఉంది — నిజమైన డబ్బు లేదు. బాధ్యతగా ఆడండి, పరిమితులు పెట్టుకోండి, విరామాలు తీసుకోండి. వయస్సు 18+ .`
  },
  mr: {
    label: "मराठी — Marathi",
    text: `⚠️ इशारा: जुगार धोकादायक आहे

जुगाराची सवय लागू शकते आणि गंभीर आर्थिक नुकसान, कर्ज आणि तणाव होऊ शकतो. या अॅपमध्ये केवळ मनोरंजनासाठी बनावट जुगार (पोकर, ब्लॅकजॅक इ.) आहे — खरे पैसे नाहीत. जबाबदारीने खेळा, मर्यादा ठेवा, विश्रांती घ्या. वय १८+ .`
  },
  gu: {
    label: "ગુજરાતી — Gujarati",
    text: `⚠️ ચેતવણી: જુગાર ખતરનાક છે

જુગાર વ્યસન બની શકે છે અને ગંભીર નાણાકીય નુકસાન કરી શકે છે. આ એપમાં ફક્ત મનોરંજન માટે નકલી જુગાર છે — સાચા પૈસા નથી. જવાબદારીપૂર્વક રમો, મર્યાદા રાખો. ઉંમર 18+ .`
  },
  ur: {
    label: "اردو — Urdu",
    text: `⚠️ انتباہ: جوا خطرناک ہے

جوا لت بن سکتا ہے اور شدید مالی نقصان، قرض اور ذہنی دباؤ کا سبب بن سکتا ہے۔ اس ایپ میں صرف تفریح کے لیے نقلی جوا (پوکر، بلیک جیک وغیرہ) ہے — اصلی رقم شامل نہیں۔ ذمہ داری سے کھیلیں، حد مقرر کریں، وقفہ لیں۔ عمر 18+ ہونی چاہیے۔`
  },
  pa: {
    label: "ਪੰਜਾਬੀ — Punjabi",
    text: `⚠️ ਚੇਤਾਵਨੀ: ਜੂਆ ਖਤਰਨਾਕ ਹੈ

ਜੂਆ ਆਦਤ ਬਣ ਸਕਦਾ ਹੈ ਅਤੇ ਗੰਭੀਰ ਵਿੱਤੀ ਨੁਕਸਾਨ ਕਰ ਸਕਦਾ ਹੈ। ਇਸ ਐਪ ਵਿੱਚ ਸਿਰਫ ਮਨੋਰੰਜਨ ਲਈ ਨਕਲੀ ਜੂਆ ਹੈ — ਅਸਲ ਪੈਸੇ ਨਹੀਂ। ਜ਼ਿੰਮੇਵਾਰੀ ਨਾਲ ਖੇਡੋ। ਉਮਰ 18+ .`
  },
  ml: {
    label: "മലയാളം — Malayalam",
    text: `⚠️ മുന്നറിയിപ്പ്: ചൂതാട്ടം അപകടകരമാണ്

ചൂതാട്ടം ആസക്തിയും സാമ്പത്തിക നഷ്ടവും ഉണ്ടാക്കും. ഈ ആപ്പിൽ വിനോദത്തിന് മാത്രം വ്യാജ ചൂതാട്ടമാണുള്ളത് — യഥാർത്ഥ പണം ഇല്ല. ഉത്തരവാദിത്തത്തോടെ കളിക്കുക, പരിധി വെക്കുക. പ്രായം 18+ .`
  },
  kn: {
    label: "ಕನ್ನಡ — Kannada",
    text: `⚠️ ಎಚ್ಚರಿಕೆ: ಜೂಜು ಅಪಾಯಕಾರಿ

ಜೂಜು ಚಟವಾಗಿ ಮಾರ್ಪಟ್ಟು ಹಣಕಾಸಿನ ನಷ್ಟಕ್ಕೆ ಕಾರಣವಾಗಬಹುದು. ಈ ಆಯಪ್‌ನಲ್ಲಿ ಮನರಂಜನೆಗಾಗಿ ಮಾತ್ರ ನಕಲಿ ಜೂಜು ಇದೆ — ನಿಜವಾದ ಹಣವಿಲ್ಲ. ಜವಾಬ್ದಾರಿಯಿಂದ ಆಟವಾಡಿ. ವಯಸ್ಸು 18+ .`
  },
  es: {
    label: "Español — Spanish",
    text: `⚠️ ADVERTENCIA: El juego es peligroso

El juego puede ser adictivo y causar graves pérdidas económicas, deudas, ansiedad y daño familiar. Esta app contiene juego SIMULADO (póker, blackjack, etc.) solo por entretenimiento — no hay dinero real. Juega con responsabilidad: pon límites, haz pausas, nunca persigas pérdidas. Debes tener 18+ . Si necesitas ayuda, contacta un servicio de ayuda local.`
  },
  fr: {
    label: "Français — French",
    text: `⚠️ ATTENTION : Le jeu d'argent est dangereux

Le jeu peut créer une dépendance et entraîner de graves pertes financières, dettes et anxiété. Cette application contient un jeu SIMULÉ (poker, blackjack, etc.) uniquement pour le divertissement — aucun argent réel. Jouez de manière responsable : fixez des limites, faites des pauses, ne courez jamais après vos pertes. 18+ .`
  },
  de: {
    label: "Deutsch — German",
    text: `⚠️ WARNUNG: Glücksspiel ist gefährlich

Glücksspiel kann süchtig machen und zu schweren finanziellen Verlusten, Schulden und Angst führen. Diese App enthält SIMULIERTES Glücksspiel (Poker, Blackjack usw.) nur zur Unterhaltung — kein echtes Geld. Spiele verantwortungsvoll: setze Limits, mache Pausen, jage niemals Verlusten hinterher. 18+ .`
  },
  pt: {
    label: "Português — Portuguese",
    text: `⚠️ AVISO: Jogar é perigoso

O jogo pode viciar e causar graves perdas financeiras e ansiedade. Este app contém jogo SIMULADO (pôquer, blackjack etc.) apenas para entretenimento — sem dinheiro real. Jogue com responsabilidade: defina limites, faça pausas, nunca tente recuperar perdas. 18+ .`
  },
  ru: {
    label: "Русский — Russian",
    text: `⚠️ ВНИМАНИЕ: Азартные игры опасны

Азартные игры вызывают зависимость и приводят к серьёзным финансовым потерям и долгам. Это приложение содержит СИМУЛИРОВАННЫЕ игры (покер, блэкджек и т.д.) только для развлечения — без реальных денег. Играйте ответственно, ставьте лимиты. 18+ .`
  },
  ar: {
    label: "العربية — Arabic",
    text: `⚠️ تحذير: القمار خطير

قد يسبب القمار الإدمان وخسائر مالية جسيمة وديون وقلق. هذا التطبيق يحتوي على قمار مُحاكى (بوكر، بلاك جاك إلخ) للترفيه فقط — لا يوجد مال حقيقي. العب بمسؤولية: ضع حدوداً، خذ فترات راحة، ولا تطارد الخسائر أبداً. يجب أن يكون عمرك 18+ .`
  },
  zh: {
    label: "中文 — Chinese",
    text: `⚠️ 警告：赌博很危险

赌博会上瘾并导致严重的经济损失、债务和焦虑。此应用仅包含模拟赌博（扑克、二十一点等）供娱乐 — 不涉及真实金钱。请负责任地游戏：设定限额、适时休息、切勿追损。须年满18岁。`
  },
  ja: {
    label: "日本語 — Japanese",
    text: `⚠️ 警告：ギャンブルは危険です

ギャンブルは依存症になり、深刻な金銭的損失や借金、不安を引き起こす可能性があります。このアプリは娯楽用の疑似ギャンブル（ポーカー、ブラックジャックなど）のみで、実際のお金は関係ありません。責任を持ってプレイし、制限を設け、休憩を取り、損失を追わないでください。18歳以上対象。`
  },
  ko: {
    label: "한국어 — Korean",
    text: `⚠️ 경고: 도박은 위험합니다

도박은 중독성이 있으며 심각한 금전적 손실과 빚, 불안을 초래할 수 있습니다. 이 앱은 오락용 모의 도박(포커, 블랙잭 등)만 포함하며 실제 돈이 걸리지 않습니다. 책임감 있게 플레이하고 한도를 정하며 휴식을 취하세요. 18세 이상만 이용 가능.`
  },
  it: {
    label: "Italiano — Italian",
    text: `⚠️ ATTENZIONE: Il gioco d'azzardo è pericoloso

Può creare dipendenza e causare gravi perdite economiche e ansia. Questa app contiene gioco SIMULATO (poker, blackjack ecc.) solo per intrattenimento — nessun denaro reale. Gioca responsabilmente: imposta limiti, fai pause, non rincorrere mai le perdite. 18+ .`
  },
  tr: {
    label: "Türkçe — Turkish",
    text: `⚠️ UYARI: Kumar tehlikelidir

Kumar bağımlılık yapabilir ve ciddi maddi kayıplara neden olabilir. Bu uygulama sadece eğlence için SİMÜLE kumar (poker, blackjack vb.) içerir — gerçek para yoktur. Sorumlu oynayın: limit koyun, ara verin, kayıpları kovalamayın. 18+ .`
  },
  nl: {
    label: "Nederlands — Dutch",
    text: `⚠️ WAARSCHUWING: Gokken is gevaarlijk

Gokken kan verslavend zijn en ernstige financiële verliezen veroorzaken. Deze app bevat GESIMULEERD gokken (poker, blackjack enz.) alleen voor vermaak — geen echt geld. Speel verantwoord: stel limieten in, neem pauzes. 18+ .`
  },
  id: {
    label: "Indonesia — Indonesian",
    text: `⚠️ PERINGATAN: Perjudian berbahaya

Perjudian dapat menyebabkan kecanduan dan kerugian finansial serius. Aplikasi ini berisi perjudian SIMULASI (poker, blackjack dll.) hanya untuk hiburan — tanpa uang sungguhan. Bermainlah secara bertanggung jawab. 18+ .`
  },
  pl: {
    label: "Polski — Polish",
    text: `⚠️ OSTRZEŻENIE: Hazard jest niebezpieczny

Hazard uzależnia i powoduje poważne straty finansowe. Ta aplikacja zawiera SYMULOWANY hazard (poker, blackjack itp.) tylko dla rozrywki — bez prawdziwych pieniędzy. Graj odpowiedzialnie, ustal limity. 18+ .`
  },
  th: {
    label: "ไทย — Thai",
    text: `⚠️ คำเตือน: การพนันเป็นอันตราย

การพนันทำให้เสพติดและก่อให้เกิดความสูญเสียทางการเงินอย่างร้ายแรง แอปนี้มีการพนันจำลองเพื่อความบันเทิงเท่านั้น — ไม่มีเงินจริง เล่นอย่างมีความรับผิดชอบ 18+ .`
  },
  vi: {
    label: "Tiếng Việt — Vietnamese",
    text: `⚠️ CẢNH BÁO: Cờ bạc rất nguy hiểm

Cờ bạc có thể gây nghiện và thiệt hại tài chính nghiêm trọng. Ứng dụng này chỉ chứa cờ bạc mô phỏng (poker, blackjack v.v.) để giải trí — không có tiền thật. Hãy chơi có trách nhiệm. 18+ .`
  },
};

function detectLocal() {
  try {
    const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    const primary = nav.split("-")[0];
    if (TRANSLATIONS[primary]) return { code: primary, ...TRANSLATIONS[primary] };
    // also try full like zh-CN vs zh
    if (TRANSLATIONS[nav]) return { code: nav, ...TRANSLATIONS[nav] };
    // fallback: guess by region? Use Intl locale? For India many langs, but navigator.language is enough.
    // If English detected, still show Hindi as second for Indian audience? But spec says language of their country detect via JS — so we show detected.
    // If not found, fallback to Hindi for India region, else English copy
    if (nav.includes("-in") || nav === "hi") return { code: "hi", ...TRANSLATIONS.hi };
    return { code: "en", label: "English — Detected language not available (showing English)", text: ENGLISH_TEXT };
  } catch { return { code: "en", label: "English", text: ENGLISH_TEXT }; }
}

export class GamblingWarning {
  constructor({ overlayId = "gamblingOverlay" } = {}) {
    this.overlayId = overlayId;
    this.overlay = null;
    this.dismissBtn = null;
    this.stayBtn = null;
    this.checkbox = null;
    this.countEl = null;
    this.timer = null;
    this.remaining = 30;
    this.firstTime = !localStorage.getItem("gambling_warning_seen");
    this.onExitCallback = null;
    this._boundBeforeUnload = this._onBeforeUnload.bind(this);
    this._boundPopState = this._onPopState.bind(this);
  }

  init() {
    // create overlay if not exists
    this.overlay = document.getElementById(this.overlayId);
    if (!this.overlay) {
      this.overlay = document.createElement("div");
      this.overlay.id = this.overlayId;
      this.overlay.setAttribute("role", "dialog");
      this.overlay.setAttribute("aria-modal", "true");
      this.overlay.setAttribute("aria-labelledby", "gamblingTitle");
      document.body.appendChild(this.overlay);
    }
    this._render();
    this._attachGlobalExitHooks();
  }

  _render() {
    const local = detectLocal();
    const isEn = local.code === "en";
    // Use Intl.DisplayNames to show language name if available
    let detectedLabel = local.label;
    try {
      if (typeof Intl.DisplayNames !== "undefined") {
        const dn = new Intl.DisplayNames([navigator.language], { type: "language" });
        const name = dn.of(local.code);
        if (name) detectedLabel = `${name} — ${local.label}`;
      }
    } catch {}

    this.overlay.innerHTML = `
      <div class="gambling-dialog">
        <div class="gambling-head">
          <h2 id="gamblingTitle">🛑 Responsible Gaming Disclosure & Warning</h2>
          <p>Gambling is dangerous — please read and confirm before you exit</p>
        </div>
        <div class="gambling-body">
          <div class="gambling-lang-block">
            <h3><span>🇬🇧 English</span> <span class="badge">ENGLISH — TOP</span></h3>
            <p>${ENGLISH_TEXT}</p>
          </div>
          <div class="gambling-lang-block local">
            <h3><span>${isEn ? "🌍 Your Language (detected)" : "🌍 Your Country Language"}</span> <span class="badge">${detectedLabel}</span></h3>
            <p>${local.text}</p>
            <div style="margin-top:8px; font-size:.72rem; color:#6d4a2a; background:rgba(255,255,255,.6); border-radius:8px; padding:6px 8px;">
              Detected via JavaScript: <b>navigator.language = "${navigator.language}"</b> · locale <b>${Intl.DateTimeFormat().resolvedOptions().locale}</b> · timeZone <b>${Intl.DateTimeFormat().resolvedOptions().timeZone || "—"}</b>
            </div>
          </div>
          <div class="gambling-meta">
            <span>🎰 Simulated only — no real money</span>
            <span>·</span>
            <span>🔞 18+</span>
            <span>·</span>
            <span>⏱ First time 30s · Later 3s</span>
            <span>·</span>
            <span>🆘 Play responsibly</span>
          </div>
        </div>
        <div class="gambling-actions">
          <label class="gambling-check">
            <input type="checkbox" id="gamblingCheck" />
            <span><b>I understand</b> that gambling is dangerous, can be addictive, and I am <b>18+ years old</b>. I have read the warning in English and in my language (<b>${local.code.toUpperCase()}</b>) and I agree to play responsibly.</span>
          </label>
          <div class="gambling-btns">
            <button id="gamblingStay" class="gambling-btn ghost">🎮 Stay & Play Responsibly</button>
            <button id="gamblingExit" class="gambling-btn primary" disabled>
              <span id="gamblingCount" class="gambling-count"></span>
              <span id="gamblingExitLabel">Please wait…</span>
            </button>
          </div>
          <div style="text-align:center; font-size:.72rem; color:#6d4a2a;">
            Warning must be read before exit is allowed. Closing this page without confirmation is not recommended.
          </div>
        </div>
      </div>
    `;
    this.dismissBtn = this.overlay.querySelector("#gamblingExit");
    this.stayBtn = this.overlay.querySelector("#gamblingStay");
    this.checkbox = this.overlay.querySelector("#gamblingCheck");
    this.countEl = this.overlay.querySelector("#gamblingCount");
    this.exitLabel = this.overlay.querySelector("#gamblingExitLabel");

    this.stayBtn.addEventListener("click", () => this.hide(false));
    this.dismissBtn.addEventListener("click", () => this.hide(true));
    this.checkbox.addEventListener("change", () => this._updateButtonState());
    // close on backdrop? no — require explicit button after timer
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay && this.dismissBtn && !this.dismissBtn.disabled) {
        // allow backdrop close only after timer + checkbox (same as Stay)
        this.hide(false);
      }
    });
  }

  _attachGlobalExitHooks() {
    // Intercept in-app quit buttons
    const quitBtn = document.getElementById("quitBtn");
    const exitBtn = document.getElementById("exitBtn");
    const newGameBtn = document.getElementById("newGameBtn");
    // Header exit if exists, else create hook for quitBtn
    [quitBtn, exitBtn, newGameBtn].forEach(btn => {
      if (!btn) return;
      // wrap existing listeners by capturing at high priority
      btn.addEventListener("click", (e) => {
        // If warning already shown, let it through after confirmation? We re-show warning
        // For quitBtn/newGameBtn we want to show warning first
        if (this.overlay.classList.contains("show")) return;
        // Only intercept quit/exit, not newGame if it's just hub? We'll intercept both quit and exitBtn
        if (btn.id === "quitBtn" || btn.id === "exitBtn") {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.show(() => {
            // after user confirms exit, actually perform original action
            if (btn.id === "quitBtn") {
              // trigger original quit logic: close setup etc. We simulate click again after removing our handler temporarily
              // Instead, dispatch a custom event and let main.js handle? Simpler: just hide setup and show hub?
              // For now, just show toast and keep user on page but allow them to leave if they press exit again? We call callback.
              if (typeof this.onExitCallback === "function") this.onExitCallback("quit");
            } else if (btn.id === "exitBtn") {
              if (typeof this.onExitCallback === "function") this.onExitCallback("exit");
              else window.close(); // try close tab
            }
          });
        }
      }, true); // capture
    });

    // Browser back button / history
    try {
      history.pushState({ gambling: true }, "");
      window.addEventListener("popstate", this._boundPopState);
    } catch {}
    // Before unload (tab close / refresh / navigate away)
    window.addEventListener("beforeunload", this._boundBeforeUnload);
    // Also handle visibility + pagehide as fallback
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.overlay.classList.contains("show")) {
        // allow escape to close only if button enabled
        if (!this.dismissBtn.disabled && this.checkbox.checked) this.hide(false);
      }
    });
  }

  _onPopState(e) {
    // User pressed back
    if (!this.overlay.classList.contains("show")) {
      history.pushState({ gambling: true }, "");
      this.show(() => {
        // if they confirm exit, go back
        history.back();
      });
    } else {
      history.pushState({ gambling: true }, "");
    }
  }

  _onBeforeUnload(e) {
    // Standard beforeunload cannot show custom 30s, but we can set returnValue to trigger browser dialog
    // We also store that they attempted exit so next time is 3s
    if (!localStorage.getItem("gambling_warning_seen")) {
      // first time: browser will show generic prompt; we also mark seen for next time
    }
    // Show our overlay if page is not unloading yet (some browsers allow short delay)
    // We cannot block unload for 30s, but we can try to show overlay and prevent unload by returning string
    e.preventDefault();
    e.returnValue = "⚠️ Gambling is dangerous. Are you sure you want to exit? Please read the responsible gaming warning.";
    return e.returnValue;
  }

  show(onExitCallback) {
    if (onExitCallback) this.onExitCallback = onExitCallback;
    this.firstTime = !localStorage.getItem("gambling_warning_seen");
    const delay = this.firstTime ? 30 : 3;
    this.remaining = delay;
    this.overlay.classList.add("show");
    document.body.style.overflow = "hidden";
    this._render(); // re-render to update detected language & label
    // re-bind after re-render
    this.dismissBtn = this.overlay.querySelector("#gamblingExit");
    this.stayBtn = this.overlay.querySelector("#gamblingStay");
    this.checkbox = this.overlay.querySelector("#gamblingCheck");
    this.countEl = this.overlay.querySelector("#gamblingCount");
    this.exitLabel = this.overlay.querySelector("#gamblingExitLabel");
    this.stayBtn.addEventListener("click", () => this.hide(false));
    this.dismissBtn.addEventListener("click", () => this.hide(true));
    this.checkbox.addEventListener("change", () => this._updateButtonState());
    this.dismissBtn.disabled = true;
    this._updateCountdownText();
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.remaining--;
      this._updateCountdownText();
      this._updateButtonState();
      if (this.remaining <= 0) {
        clearInterval(this.timer);
        this._updateButtonState();
      }
    }, 1000);
    this._updateButtonState();
    // announce for screen readers
    this.overlay.scrollTop = 0;
  }

  _updateCountdownText() {
    if (!this.countEl || !this.exitLabel) return;
    if (this.remaining > 0) {
      this.countEl.textContent = `⏱ ${this.remaining}s`;
      this.exitLabel.textContent = this.firstTime ? `Wait ${this.remaining}s to exit — read warning` : `Wait ${this.remaining}s`;
    } else {
      this.countEl.textContent = `✓`;
      this.exitLabel.textContent = `I Understand — Exit Anyway`;
    }
  }

  _updateButtonState() {
    if (!this.dismissBtn || !this.checkbox) return;
    const canExit = this.remaining <= 0 && this.checkbox.checked;
    this.dismissBtn.disabled = !canExit;
    this.dismissBtn.style.opacity = canExit ? "1" : ".55";
  }

  hide(confirmedExit) {
    clearInterval(this.timer);
    this.overlay.classList.remove("show");
    document.body.style.overflow = "";
    if (confirmedExit) {
      localStorage.setItem("gambling_warning_seen", "1");
      localStorage.setItem("gambling_warning_last", Date.now().toString());
      // mark first time done
      if (typeof this.onExitCallback === "function") {
        const cb = this.onExitCallback;
        this.onExitCallback = null;
        // small delay to allow overlay to close
        setTimeout(() => cb(), 80);
      } else {
        // generic exit: try to close or navigate
        // For tab close, we cannot force, so just show toast
        const box = document.getElementById("toastBox");
        if (box) {
          const t = document.createElement("div");
          t.className = "toast gold";
          t.textContent = "⚠️ Stay safe — gambling is dangerous. Take a break!";
          box.appendChild(t);
          setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 2500);
        }
      }
    } else {
      // stay
      const box = document.getElementById("toastBox");
      if (box) {
        const t = document.createElement("div");
        t.className = "toast";
        t.style.background = "#d3f2dc";
        t.style.color = "#0a4d2a";
        t.style.border = "1px solid #2dc653";
        t.textContent = "💚 Good choice — play responsibly!";
        box.appendChild(t);
        setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 2200);
      }
    }
  }

  // Public helper to trigger warning manually (e.g., from main.js exitBtn)
  trigger(onExit) {
    this.show(onExit);
  }

  destroy() {
    clearInterval(this.timer);
    window.removeEventListener("beforeunload", this._boundBeforeUnload);
    window.removeEventListener("popstate", this._boundPopState);
  }
}
