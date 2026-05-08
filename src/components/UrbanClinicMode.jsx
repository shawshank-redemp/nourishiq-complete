// ─────────────────────────────────────────────────────────────────────────────
// NourishIQ — Multilingual Voice-First Clinical Intake Mode
// 6-step flow: Language → Voice → AI Extract → Review → Doctor Sim → Assessment
// ONLY this file changed. No other files touched.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import styles from './UrbanClinicMode.module.css';

// ── Full language text map ────────────────────────────────────────────────────
const LANG = {
  kn: {
    name: 'Kannada', native: 'ಕನ್ನಡ', bcp47: 'kn-IN',
    instruction:      'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳನ್ನು ಹೇಳಿ',
    speak_now:        'ಮಾತನಾಡಿ',
    stop:             'ನಿಲ್ಲಿಸಿ',
    listening:        'ಕೇಳುತ್ತಿದ್ದೇವೆ...',
    analysing:        'AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...',
    send_doctor:      'ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸಿ',
    waiting_doctor:   'ವೈದ್ಯರ ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದ್ದೇವೆ...',
    approved:         '✅ ವೈದ್ಯರು ಅನುಮೋದಿಸಿದ್ದಾರೆ',
    visit_required:   '🏥 ದಯವಿಟ್ಟು PHC ಗೆ ಬನ್ನಿ',
    approved_msg:     'ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಸೌಮ್ಯವಾಗಿವೆ. ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು ನೀರು ಕುಡಿಯಿರಿ. ಇಂದು ಔಷಧ ಅಗತ್ಯವಿಲ್ಲ.',
    visit_msg:        'ನಿಮ್ಮ ಲಕ್ಷಣಗಳಿಗೆ ಪರೀಕ್ಷೆ ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣ PHC ಗೆ ಭೇಟಿ ನೀಡಿ.',
    proceed:          'ಸಂಪೂರ್ಣ AI ತಪಾಸಣೆಗೆ ಮುಂದುವರಿಯಿರಿ',
    transcript_label: 'ನೇರ ಲಿಪ್ಯಂತರಣ',
    report_title:     'AI ವರದಿ',
    summary_label:    'ಸಾರಾಂಶ',
    edit_hint:        'ಕ್ಷೇತ್ರಗಳನ್ನು ಸಂಪಾದಿಸಿ',
    try_again:        'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    no_speech:        'ಮಾತು ಪತ್ತೆಯಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    analyse_btn:      'AI ಜೊತೆ ವಿಶ್ಲೇಷಿಸಿ →',
    doctor_note:      'ವೈದ್ಯರ ಸಂದೇಶ',
    change_lang:      '← ಭಾಷೆ ಬದಲಿಸಿ',
    re_record:        '← ಮತ್ತೆ ರೆಕಾರ್ಡ್ ಮಾಡಿ',
    done_title:       'ಫಾರ್ಮ್ ತುಂಬಲಾಗಿದೆ!',
    done_desc:        'ರೋಗಿಯ ವಿವರಗಳನ್ನು ತಪಾಸಣೆ ಟ್ಯಾಬ್‌ಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ.',
    new_interview:    'ಹೊಸ ಸಂದರ್ಶನ',
  },
  hi: {
    name: 'Hindi', native: 'हिंदी', bcp47: 'hi-IN',
    instruction:      'अपनी स्वास्थ्य समस्याएं बताएं',
    speak_now:        'बोलिए',
    stop:             'रोकें',
    listening:        'सुन रहे हैं...',
    analysing:        'AI विश्लेषण कर रहा है...',
    send_doctor:      'डॉक्टर को भेजें',
    waiting_doctor:   'डॉक्टर की समीक्षा का इंतजार है...',
    approved:         '✅ डॉक्टर ने मंजूरी दी',
    visit_required:   '🏥 कृपया PHC आएं',
    approved_msg:     'आपके लक्षण हल्के हैं। आराम करें और पानी पिएं। आज दवा की जरूरत नहीं है।',
    visit_msg:        'आपके लक्षणों की जांच जरूरी है। कृपया तुरंत PHC जाएं।',
    proceed:          'पूर्ण AI जांच के लिए आगे बढ़ें',
    transcript_label: 'लाइव ट्रांसक्रिप्शन',
    report_title:     'AI रिपोर्ट',
    summary_label:    'सारांश',
    edit_hint:        'फ़ील्ड संपादित करें',
    try_again:        'फिर कोशिश करें',
    no_speech:        'कोई आवाज नहीं आई। कृपया फिर से बोलें।',
    analyse_btn:      'AI से विश्लेषण करें →',
    doctor_note:      'डॉक्टर का संदेश',
    change_lang:      '← भाषा बदलें',
    re_record:        '← फिर से रिकॉर्ड करें',
    done_title:       'फॉर्म भरा गया!',
    done_desc:        'मरीज की जानकारी जांच टैब में भेज दी गई है।',
    new_interview:    'नया साक्षात्कार',
  },
  ta: {
    name: 'Tamil', native: 'தமிழ்', bcp47: 'ta-IN',
    instruction:      'உங்கள் உடல் நலப் பிரச்சனைகளை சொல்லுங்கள்',
    speak_now:        'பேசுங்கள்',
    stop:             'நிறுத்து',
    listening:        'கேட்கிறோம்...',
    analysing:        'AI பகுப்பாய்வு செய்கிறது...',
    send_doctor:      'மருத்துவரிடம் அனுப்பு',
    waiting_doctor:   'மருத்துவர் மதிப்பாய்வுக்காக காத்திருக்கிறோம்...',
    approved:         '✅ மருத்துவர் அனுமதித்தார்',
    visit_required:   '🏥 தயவுசெய்து PHC வாருங்கள்',
    approved_msg:     'உங்கள் அறிகுறிகள் லேசானவை. ஓய்வெடுங்கள் மற்றும் தண்ணீர் குடியுங்கள். இன்று மருந்து தேவையில்லை.',
    visit_msg:        'உங்கள் அறிகுறிகளுக்கு பரிசோதனை தேவை. உடனடியாக PHC வாருங்கள்.',
    proceed:          'முழு AI பரிசோதனைக்கு தொடரவும்',
    transcript_label: 'நேரடி எழுத்துப்படி',
    report_title:     'AI அறிக்கை',
    summary_label:    'சுருக்கம்',
    edit_hint:        'புலங்களை திருத்தவும்',
    try_again:        'மீண்டும் முயற்சிக்கவும்',
    no_speech:        'பேச்சு கண்டறியப்படவில்லை. மீண்டும் முயற்சிக்கவும்.',
    analyse_btn:      'AI உடன் பகுப்பாய்வு →',
    doctor_note:      'மருத்துவர் செய்தி',
    change_lang:      '← மொழி மாற்று',
    re_record:        '← மீண்டும் பதிவு செய்',
    done_title:       'படிவம் நிரப்பப்பட்டது!',
    done_desc:        'நோயாளியின் விவரங்கள் பரிசோதனை தாவலுக்கு மாற்றப்பட்டன.',
    new_interview:    'புதிய நேர்காணல்',
  },
  te: {
    name: 'Telugu', native: 'తెలుగు', bcp47: 'te-IN',
    instruction:      'మీ ఆరోగ్య సమస్యలు చెప్పండి',
    speak_now:        'మాట్లాడండి',
    stop:             'ఆపండి',
    listening:        'వింటున్నాము...',
    analysing:        'AI విశ్లేషిస్తోంది...',
    send_doctor:      'డాక్టర్‌కు పంపండి',
    waiting_doctor:   'డాక్టర్ సమీక్ష కోసం వేచి ఉన్నాము...',
    approved:         '✅ డాక్టర్ ఆమోదించారు',
    visit_required:   '🏥 దయచేసి PHC కి రండి',
    approved_msg:     'మీ లక్షణాలు తేలికగా ఉన్నాయి. విశ్రాంతి తీసుకోండి మరియు నీళ్లు తాగండి. ఈరోజు మందు అవసరం లేదు.',
    visit_msg:        'మీ లక్షణాలకు పరీక్ష అవసరం. దయచేసి వెంటనే PHC కి వెళ్ళండి.',
    proceed:          'పూర్తి AI పరీక్షకు కొనసాగండి',
    transcript_label: 'లైవ్ ట్రాన్స్క్రిప్షన్',
    report_title:     'AI నివేదిక',
    summary_label:    'సారాంశం',
    edit_hint:        'ఫీల్డ్‌లను సవరించండి',
    try_again:        'మళ్ళీ ప్రయత్నించండి',
    no_speech:        'మాట్లాడటం గుర్తించబడలేదు. మళ్ళీ ప్రయత్నించండి.',
    analyse_btn:      'AI తో విశ్లేషించండి →',
    doctor_note:      'డాక్టర్ సందేశం',
    change_lang:      '← భాష మార్చండి',
    re_record:        '← మళ్ళీ రికార్డ్ చేయండి',
    done_title:       'ఫారం నింపబడింది!',
    done_desc:        'రోగి వివరాలు అసెస్‌మెంట్ ట్యాబ్‌కు బదిలీ చేయబడ్డాయి.',
    new_interview:    'కొత్త ఇంటర్వ్యూ',
  },
  en: {
    name: 'English', native: 'English', bcp47: 'en-IN',
    instruction:      'Please describe your health concerns',
    speak_now:        'Speak Now',
    stop:             'Stop',
    listening:        'Listening...',
    analysing:        'AI is analysing...',
    send_doctor:      'Send to Doctor',
    waiting_doctor:   'Waiting for doctor review...',
    approved:         '✅ Doctor has approved',
    visit_required:   '🏥 Please visit PHC',
    approved_msg:     'Your symptoms are mild. Rest and drink water. Medicine is not needed today.',
    visit_msg:        'Your symptoms need examination. Please visit PHC immediately.',
    proceed:          'Proceed to Full AI Assessment',
    transcript_label: 'Live Transcription',
    report_title:     'AI Report',
    summary_label:    'Summary',
    edit_hint:        'Edit fields below',
    try_again:        'Try Again',
    no_speech:        'No speech detected. Please try again.',
    analyse_btn:      'Analyse with AI →',
    doctor_note:      'Doctor\'s Message',
    change_lang:      '← Change Language',
    re_record:        '← Re-record',
    done_title:       'Form Filled!',
    done_desc:        'Patient details transferred to the Assessment tab.',
    new_interview:    'New Interview',
  },
};

const STEP = { LANG: 'lang', VOICE: 'voice', LOADING: 'loading', REPORT: 'report', DOCTOR: 'doctor', DONE: 'done' };

function buildPrompt(transcript, langCode) {
  return `You are a maternal health intake assistant. A pregnant patient spoke in ${langCode}. Transcript: "${transcript}"
Return ONLY this JSON (no markdown):
{"chief_complaint":"1 sentence English","symptoms_detected":"comma-separated English","severity":"Mild/Moderate/Severe","duration":"how long","diet_history":"what they eat","lifestyle_notes":"any other relevant notes","native_language_summary":"2 sentences in ${langCode} script","patient_name":null,"age":null,"gestational_week":null}`;
}

export default function UrbanClinicMode({ onFillAssessment }) {
  const [step, setStep]             = useState(STEP.LANG);
  const [langCode, setLangCode]     = useState(null);
  const [recording, setRecording]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim]       = useState('');
  const [report, setReport]         = useState(null);
  const [edit, setEdit]             = useState(null);
  const [error, setError]           = useState('');
  const [doctorStatus, setDoctorStatus] = useState('waiting'); // waiting | approved | visit
  const [micOk, setMicOk]           = useState(true);
  const [waitSecs, setWaitSecs]     = useState(10);

  const recogRef   = useRef(null);
  const timerRef   = useRef(null);
  const countRef   = useRef(null);
  const apiKey     = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const T = langCode ? LANG[langCode] : null;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setMicOk(false);
    return () => { clearTimeout(timerRef.current); clearInterval(countRef.current); };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function pick(lang) { setLangCode(lang); setStep(STEP.VOICE); setTranscript(''); setInterim(''); setError(''); }

  function startRec() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Speech recognition not supported. Use Chrome or type below.'); return; }
    const r = new SR();
    r.lang = LANG[langCode].bcp47;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = e => {
      let fin = '', itm = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        e.results[i].isFinal ? (fin += t + ' ') : (itm += t);
      }
      if (fin) setTranscript(p => p + fin);
      setInterim(itm);
    };
    r.onerror = e => { if (e.error !== 'aborted') setError(`Mic error: ${e.error}`); stopRec(); };
    r.onend   = () => { setRecording(false); setInterim(''); };
    recogRef.current = r;
    r.start();
    setRecording(true);
    setError('');
  }

  function stopRec() {
    recogRef.current?.stop();
    recogRef.current = null;
    setRecording(false);
    setInterim('');
  }

  async function analyse() {
    const full = (transcript + ' ' + interim).trim();
    if (!full) { setError(T.no_speech); return; }
    stopRec();
    setStep(STEP.LOADING);
    try {
      let parsed;
      const hasKey = apiKey && apiKey !== 'paste-your-key-here';
      if (hasKey) {
        const res  = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
          body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 600, messages: [{ role: 'user', content: buildPrompt(full, langCode) }] }),
        });
        const data = await res.json();
        parsed = JSON.parse((data.content?.[0]?.text || '{}').replace(/```json|```/g, '').trim());
      } else {
        await new Promise(r => setTimeout(r, 2000));
        parsed = {
          chief_complaint:       'Severe fatigue and dizziness, feeling very weak',
          symptoms_detected:     'Pale eyelids, extreme fatigue, dizziness, swollen feet',
          severity:              'Moderate',
          duration:              'Past 2 weeks',
          diet_history:          'Rice and sambar only, skipping breakfast, no vegetables',
          lifestyle_notes:       'Difficulty standing for long, unable to do housework',
          native_language_summary:
            langCode === 'kn' ? 'ರೋಗಿಗೆ ತೀವ್ರ ಆಯಾಸ ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ ಇದೆ. ಆಹಾರದಲ್ಲಿ ಕಬ್ಬಿಣದ ಕೊರತೆ ಕಂಡುಬಂದಿದೆ.' :
            langCode === 'hi' ? 'मरीज को गंभीर थकान और चक्कर आ रहे हैं। आहार में आयरन की कमी है।' :
            langCode === 'ta' ? 'நோயாளிக்கு கடுமையான சோர்வு மற்றும் தலைசுற்றல் உள்ளது. உணவில் இரும்பு குறைபாடு உள்ளது.' :
            langCode === 'te' ? 'రోగికి తీవ్రమైన అలసట మరియు తలతిరుగుడు ఉంది. ఆహారంలో ఇనుప లోపం కనుగొనబడింది.' :
            'Patient reports severe fatigue and dizziness for 2 weeks. Diet analysis shows iron deficit.',
          patient_name: null, age: '24', gestational_week: '26',
        };
      }
      setReport({ ...parsed, rawTranscript: full });
      setEdit({ ...parsed, rawTranscript: full });
      setStep(STEP.REPORT);
    } catch { setError('Analysis failed. Please try again.'); setStep(STEP.VOICE); }
  }

  function sendToDoctor() {
    setStep(STEP.DOCTOR);
    setDoctorStatus('waiting');
    setWaitSecs(10);
    countRef.current = setInterval(() => setWaitSecs(s => s - 1), 1000);
    timerRef.current = setTimeout(() => {
      clearInterval(countRef.current);
      setDoctorStatus(Math.random() > 0.4 ? 'approved' : 'visit');
    }, 10000);
  }

  function proceed() {
    if (!edit) return;
    const filled = {
      patientName:     edit.patient_name    || '',
      age:             edit.age             || '',
      gestationalWeek: edit.gestational_week || '',
      symptoms:        edit.symptoms_detected || edit.chief_complaint || '',
      foodIntake:      edit.diet_history    || '',
      foodAccess:      'Limited — basic rice and roti only',
      ashaWorkerName:  '',
    };
    if (onFillAssessment) onFillAssessment(filled);
    setStep(STEP.DONE);
  }

  function reset() {
    clearTimeout(timerRef.current);
    clearInterval(countRef.current);
    setStep(STEP.LANG); setLangCode(null); setTranscript(''); setInterim('');
    setReport(null); setEdit(null); setError(''); setDoctorStatus('waiting'); setWaitSecs(10);
  }

  function ef(k, v) { setEdit(p => ({ ...p, [k]: v })); }

  // ── RENDER ────────────────────────────────────────────────────────────────

  // STEP 1 — Language
  if (step === STEP.LANG) return (
    <div className={styles.wrap}>
      <div className={styles.langScreen}>
        <div className={styles.langHero}>
          <span className={styles.langHeroIcon}>🎙️</span>
          <h2 className={styles.langHeroTitle}>Voice Patient Interview</h2>
          <p className={styles.langHeroDesc}>Select patient language · Speak naturally · AI extracts report</p>
        </div>
        <div className={styles.langGrid}>
          {Object.entries(LANG).map(([code, l]) => (
            <button key={code} className={styles.langBtn} onClick={() => pick(code)}>
              <span className={styles.langNative}>{l.native}</span>
              <span className={styles.langEn}>{l.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // STEP 2 — Voice
  if (step === STEP.VOICE) return (
    <div className={styles.wrap}>
      <button className={styles.back} onClick={reset}>{T.change_lang}</button>
      <div className={styles.voiceScreen}>
        <div className={styles.langTag}>{T.native} · {T.name}</div>
        <p className={styles.voiceInstr}>{T.instruction}</p>

        <div className={styles.micOuter}>
          {recording && <><div className={`${styles.wave} ${styles.w1}`}/><div className={`${styles.wave} ${styles.w2}`}/><div className={`${styles.wave} ${styles.w3}`}/></>}
          <button
            className={`${styles.micBtn} ${recording ? styles.micActive : ''}`}
            onClick={recording ? stopRec : startRec}
            disabled={!micOk}
          >
            <span className={styles.micEmoji}>{recording ? '⏹' : '🎙️'}</span>
            <span className={styles.micLabel}>{recording ? T.stop : T.speak_now}</span>
          </button>
        </div>

        {recording && <p className={styles.listeningText}>{T.listening}</p>}

        {(transcript || interim) && (
          <div className={styles.transcriptBox}>
            <div className={styles.transcriptLabel}>{T.transcript_label}</div>
            <p className={styles.transcriptText}>{transcript}<span className={styles.interim}>{interim}</span></p>
          </div>
        )}

        {!micOk && (
          <div className={styles.fallback}>
            <p>🔇 Speech not available — type below:</p>
            <textarea className={styles.fallbackTA} rows={5} value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Type symptoms here..." />
          </div>
        )}

        {error && <div className={styles.errBox}>⚠️ {error}</div>}

        {(transcript.trim() || interim.trim()) && !recording && (
          <button className={styles.primaryBtn} onClick={analyse}>{T.analyse_btn}</button>
        )}
        {!micOk && transcript.trim() && (
          <button className={styles.primaryBtn} onClick={analyse}>{T.analyse_btn}</button>
        )}
      </div>
    </div>
  );

  // STEP 3 — Loading
  if (step === STEP.LOADING) return (
    <div className={styles.wrap}>
      <div className={styles.loadScreen}>
        <div className={styles.loadOrb}>
          <div className={styles.loadRing}/>
          <span className={styles.loadIcon}>🧠</span>
        </div>
        <p className={styles.loadText}>{T.analysing}</p>
        <div className={styles.loadDots}><span/><span/><span/></div>
      </div>
    </div>
  );

  // STEP 4 — Report Review
  if (step === STEP.REPORT && edit) return (
    <div className={styles.wrap}>
      <button className={styles.back} onClick={() => setStep(STEP.VOICE)}>{T.re_record}</button>
      <div className={styles.reportScreen}>
        <div className={styles.reportTitleRow}>
          <span className={styles.reportTitle}>{T.report_title}</span>
          <span className={styles.langTag}>{T.native}</span>
        </div>

        {edit.native_language_summary && (
          <div className={styles.nativeSummary}>
            <div className={styles.nativeLbl}>{T.summary_label}</div>
            <p className={styles.nativeText}>{edit.native_language_summary}</p>
          </div>
        )}

        <p className={styles.editHint}>{T.edit_hint}</p>

        <div className={styles.fieldGrid}>
          {[
            { k: 'chief_complaint',   lbl: 'Chief Complaint' },
            { k: 'symptoms_detected', lbl: 'Symptoms' },
            { k: 'severity',          lbl: 'Severity' },
            { k: 'duration',          lbl: 'Duration' },
            { k: 'diet_history',      lbl: 'Diet / Food' },
            { k: 'lifestyle_notes',   lbl: 'Lifestyle Notes' },
            { k: 'patient_name',      lbl: 'Patient Name' },
            { k: 'age',               lbl: 'Age' },
            { k: 'gestational_week',  lbl: 'Gestational Week' },
          ].map(({ k, lbl }) => (
            <div key={k} className={`${styles.fieldRow} ${(k === 'chief_complaint' || k === 'symptoms_detected' || k === 'diet_history' || k === 'lifestyle_notes') ? styles.fullWidth : ''}`}>
              <label className={styles.fieldLbl}>{lbl}</label>
              <input className={styles.fieldInput} value={edit[k] || ''} onChange={e => ef(k, e.target.value)} placeholder={lbl} />
            </div>
          ))}
        </div>

        <button className={styles.primaryBtn} onClick={sendToDoctor}>{T.send_doctor}</button>
      </div>
    </div>
  );

  // STEP 5 — Doctor Confirmation
  if (step === STEP.DOCTOR) return (
    <div className={styles.wrap}>
      <div className={styles.doctorScreen}>
        {doctorStatus === 'waiting' && (
          <div className={styles.waitingCard}>
            <div className={styles.waitingSpinner}>
              <div className={styles.waitRing}/>
              <span className={styles.waitIcon}>👨‍⚕️</span>
            </div>
            <p className={styles.waitText}>{T.waiting_doctor}</p>
            <div className={styles.waitCountdown}>
              <div className={styles.countdownBar} style={{ width: `${(waitSecs / 10) * 100}%` }}/>
            </div>
            <p className={styles.waitSecs}>{waitSecs}s</p>
            <div className={styles.ecgLine}>
              <div className={styles.ecgAnim}/>
            </div>
          </div>
        )}

        {doctorStatus === 'approved' && (
          <div className={`${styles.doctorCard} ${styles.doctorApproved}`}>
            <div className={styles.doctorIconWrap}>
              <span className={styles.doctorIcon}>✅</span>
            </div>
            <h3 className={styles.doctorStatus}>{T.approved}</h3>
            <div className={styles.doctorMsgBox}>
              <div className={styles.doctorMsgLabel}>{T.doctor_note}</div>
              <p className={styles.doctorMsg}>{T.approved_msg}</p>
            </div>
            <button className={styles.proceedBtn} onClick={proceed}>{T.proceed}</button>
          </div>
        )}

        {doctorStatus === 'visit' && (
          <div className={`${styles.doctorCard} ${styles.doctorVisit}`}>
            <div className={styles.doctorIconWrap}>
              <span className={styles.doctorIcon}>🏥</span>
            </div>
            <h3 className={styles.doctorStatus}>{T.visit_required}</h3>
            <div className={styles.doctorMsgBox}>
              <div className={styles.doctorMsgLabel}>{T.doctor_note}</div>
              <p className={styles.doctorMsg}>{T.visit_msg}</p>
            </div>
            <button className={styles.proceedBtn} onClick={proceed}>{T.proceed}</button>
          </div>
        )}
      </div>
    </div>
  );

  // STEP 6 — Done
  return (
    <div className={styles.wrap}>
      <div className={styles.doneScreen}>
        <div className={styles.doneCheck}>✅</div>
        <h3 className={styles.doneTitle}>{T.done_title}</h3>
        <p className={styles.doneDesc}>{T.done_desc}</p>
        <button className={styles.outlineBtn} onClick={reset}>{T.new_interview}</button>
      </div>
    </div>
  );
}
