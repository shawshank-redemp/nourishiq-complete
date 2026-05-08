// ─────────────────────────────────────────────────────────────────────────────
// NourishIQ — Multilingual Voice-First Patient Interview System
// Replaces the tile-based clinical intake form.
// Only this file changed. All other files untouched.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import styles from './UrbanClinicMode.module.css';

// ── Language config ───────────────────────────────────────────────────────────
const LANGUAGES = [
  {
    code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ',
    flag: '🟢',
    instruction: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳನ್ನು ಹೇಳಿ. ನೀವು ಹೇಗೆ ಅನಿಸುತ್ತಿದ್ದೀರಿ?',
    loading: 'AI ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಓದುತ್ತಿದೆ...',
    confirm: 'ದೃಢಪಡಿಸಿ ಮತ್ತು ತಪಾಸಣೆ ಮಾಡಿ',
    speak_prompt: 'ಮಾತಾಡಲು ಒತ್ತಿ',
    stop: 'ನಿಲ್ಲಿಸಿ',
    bcp47: 'kn-IN',
  },
  {
    code: 'hi', name: 'Hindi', native: 'हिंदी',
    flag: '🟠',
    instruction: 'अपनी स्वास्थ्य समस्याएं बताएं। आप कैसा महसूस कर रही हैं?',
    loading: 'AI आपकी जानकारी पढ़ रहा है...',
    confirm: 'पुष्टि करें और जाँच करें',
    speak_prompt: 'बोलने के लिए दबाएं',
    stop: 'रोकें',
    bcp47: 'hi-IN',
  },
  {
    code: 'ta', name: 'Tamil', native: 'தமிழ்',
    flag: '🔴',
    instruction: 'உங்கள் உடல் நலப் பிரச்சனைகளை சொல்லுங்கள். நீங்கள் எப்படி உணர்கிறீர்கள்?',
    loading: 'AI உங்கள் விவரங்களை படிக்கிறது...',
    confirm: 'உறுதிப்படுத்தி பரிசோதி',
    speak_prompt: 'பேச அழுத்துங்கள்',
    stop: 'நிறுத்து',
    bcp47: 'ta-IN',
  },
  {
    code: 'te', name: 'Telugu', native: 'తెలుగు',
    flag: '🔵',
    instruction: 'మీ ఆరోగ్య సమస్యలు చెప్పండి. మీకు ఎలా అనిపిస్తుందో చెప్పండి.',
    loading: 'AI మీ వివరాలు చదువుతోంది...',
    confirm: 'నిర్ధారించి పరీక్షించండి',
    speak_prompt: 'మాట్లాడటానికి నొక్కండి',
    stop: 'ఆపండి',
    bcp47: 'te-IN',
  },
  {
    code: 'en', name: 'English', native: 'English',
    flag: '⚪',
    instruction: 'Please describe your health concerns. How are you feeling?',
    loading: 'AI is reading your details...',
    confirm: 'Confirm & Use in Assessment',
    speak_prompt: 'Press to speak',
    stop: 'Stop',
    bcp47: 'en-IN',
  },
];

// ── Claude extraction prompt ──────────────────────────────────────────────────
function buildExtractionPrompt(transcript, langCode) {
  return `You are a maternal health intake assistant. A pregnant patient just spoke in ${langCode} about their health. 

Transcript: "${transcript}"

Extract and return ONLY this JSON (no markdown, no explanation):
{
  "patientName": "name if mentioned or null",
  "age": "age if mentioned or null",
  "gestationalWeek": "week number if mentioned or null",
  "chiefComplaint": "1 sentence summary of main concern in English",
  "symptoms": "comma-separated symptoms in English",
  "severity": "Mild / Moderate / Severe",
  "duration": "how long symptoms have been present",
  "dietDescription": "what they have been eating",
  "foodAccess": "Good / Limited / Very limited based on context",
  "nativeSummary": "2-sentence summary of findings in the patient's language (${langCode})",
  "keyFlags": ["flag1", "flag2"]
}`;
}

// ── Step constants ────────────────────────────────────────────────────────────
const STEP = { LANG: 'lang', VOICE: 'voice', LOADING: 'loading', REPORT: 'report', DONE: 'done' };

export default function UrbanClinicMode({ onFillAssessment }) {
  const [step, setStep]               = useState(STEP.LANG);
  const [lang, setLang]               = useState(null);
  const [recording, setRecording]     = useState(false);
  const [transcript, setTranscript]   = useState('');
  const [interimText, setInterimText] = useState('');
  const [report, setReport]           = useState(null);
  const [editReport, setEditReport]   = useState(null);
  const [error, setError]             = useState('');
  const [pulseAnim, setPulseAnim]     = useState(false);
  const [micSupported, setMicSupported] = useState(true);

  const recognitionRef = useRef(null);
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  // ── Check browser support ─────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) setMicSupported(false);
  }, []);

  // ── Language selected ─────────────────────────────────────────────────────
  function selectLanguage(l) {
    setLang(l);
    setStep(STEP.VOICE);
    setTranscript('');
    setInterimText('');
    setError('');
  }

  // ── Start recording ───────────────────────────────────────────────────────
  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Please use Chrome.');
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = lang.bcp47;
    recog.continuous = true;
    recog.interimResults = true;
    recog.maxAlternatives = 1;

    recog.onresult = (e) => {
      let final = '', interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';
        else interim += t;
      }
      if (final) setTranscript(prev => prev + final);
      setInterimText(interim);
    };

    recog.onerror = (e) => {
      if (e.error !== 'aborted') setError(`Microphone error: ${e.error}. Please try again.`);
      setRecording(false);
      setPulseAnim(false);
    };

    recog.onend = () => {
      setRecording(false);
      setPulseAnim(false);
      setInterimText('');
    };

    recognitionRef.current = recog;
    recog.start();
    setRecording(true);
    setPulseAnim(true);
    setError('');
  }

  // ── Stop recording ────────────────────────────────────────────────────────
  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
    setPulseAnim(false);
  }

  // ── Submit transcript to Claude ───────────────────────────────────────────
  async function analyseTranscript() {
    const fullText = (transcript + ' ' + interimText).trim();
    if (!fullText) { setError('No speech detected. Please try speaking again.'); return; }
    stopRecording();
    setStep(STEP.LOADING);
    setError('');

    try {
      let parsed;
      const hasKey = apiKey && apiKey !== 'paste-your-key-here';

      if (hasKey) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 600,
            messages: [{ role: 'user', content: buildExtractionPrompt(fullText, lang.code) }],
          }),
        });
        const data = await res.json();
        const raw = data.content?.[0]?.text || '{}';
        parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      } else {
        // Demo mock
        await new Promise(r => setTimeout(r, 2000));
        parsed = {
          patientName: null,
          age: '24',
          gestationalWeek: '26',
          chiefComplaint: 'Severe fatigue and dizziness, feeling weak and unable to work',
          symptoms: 'Pale eyelids, extreme fatigue, dizziness when standing, mild swelling in feet',
          severity: 'Moderate',
          duration: 'Past 2 weeks',
          dietDescription: 'Rice and sambar only, skipping breakfast, no vegetables',
          foodAccess: 'Limited',
          nativeSummary: lang.code === 'kn'
            ? 'ರೋಗಿಗೆ ತೀವ್ರ ಆಯಾಸ ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ ಇದೆ. ಆಹಾರದಲ್ಲಿ ಕಬ್ಬಿಣದ ಕೊರತೆ ಕಂಡುಬಂದಿದೆ.'
            : lang.code === 'hi'
            ? 'मरीज को गंभीर थकान और चक्कर आ रहे हैं। आहार में आयरन की कमी पाई गई है।'
            : 'Patient reports severe fatigue and dizziness for 2 weeks. Diet analysis shows significant iron deficit.',
          keyFlags: ['severe fatigue', 'dietary iron deficit', 'dizziness on standing'],
        };
      }

      setReport({ ...parsed, rawTranscript: fullText });
      setEditReport({ ...parsed, rawTranscript: fullText });
      setStep(STEP.REPORT);
    } catch (err) {
      setError('Failed to analyse. Please try again.');
      setStep(STEP.VOICE);
    }
  }

  // ── Confirm and fill assessment form ─────────────────────────────────────
  function confirmAndFill() {
    if (!editReport) return;
    const filled = {
      patientName:     editReport.patientName    || '',
      age:             editReport.age            || '',
      gestationalWeek: editReport.gestationalWeek || '',
      ashaWorkerName:  '',
      symptoms:        editReport.symptoms       || editReport.chiefComplaint || '',
      foodIntake:      editReport.dietDescription || '',
      foodAccess:      editReport.foodAccess === 'Good'
        ? 'Good — vegetables, pulses, milk available'
        : editReport.foodAccess === 'Very limited'
        ? 'Very limited — irregular meals'
        : 'Limited — basic rice and roti only',
    };
    if (onFillAssessment) {
      onFillAssessment(filled);
    }
    setStep(STEP.DONE);
  }

  function reset() {
    setStep(STEP.LANG);
    setLang(null);
    setTranscript('');
    setInterimText('');
    setReport(null);
    setEditReport(null);
    setError('');
  }

  function editField(key, val) {
    setEditReport(prev => ({ ...prev, [key]: val }));
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>

      {/* ── STEP 1: Language Selection ── */}
      {step === STEP.LANG && (
        <div className={styles.langScreen}>
          <div className={styles.langHeader}>
            <div className={styles.langIcon}>🎙️</div>
            <h2 className={styles.langTitle}>Voice Patient Interview</h2>
            <p className={styles.langDesc}>
              Select the patient's language — they can speak naturally about their health
            </p>
          </div>
          <div className={styles.langGrid}>
            {LANGUAGES.map(l => (
              <button key={l.code} className={styles.langBtn} onClick={() => selectLanguage(l)}>
                <span className={styles.langNative}>{l.native}</span>
                <span className={styles.langEnglish}>{l.name}</span>
              </button>
            ))}
          </div>
          <p className={styles.langNote}>
            Patient speaks naturally · AI extracts structured health data · Auto-fills assessment form
          </p>
        </div>
      )}

      {/* ── STEP 2: Voice Interview ── */}
      {step === STEP.VOICE && lang && (
        <div className={styles.voiceScreen}>
          <button className={styles.backLink} onClick={reset}>← Change language</button>

          <div className={styles.voiceHeader}>
            <div className={styles.langPill}>{lang.native} · {lang.name}</div>
            <p className={styles.voiceInstruction}>{lang.instruction}</p>
          </div>

          {/* Mic button */}
          <div className={styles.micWrapper}>
            {pulseAnim && (
              <>
                <div className={`${styles.pulse} ${styles.pulse1}`} />
                <div className={`${styles.pulse} ${styles.pulse2}`} />
                <div className={`${styles.pulse} ${styles.pulse3}`} />
              </>
            )}
            <button
              className={`${styles.micBtn} ${recording ? styles.micBtnActive : ''}`}
              onClick={recording ? stopRecording : startRecording}
              disabled={!micSupported}
            >
              <span className={styles.micIcon}>{recording ? '⏹' : '🎙️'}</span>
              <span className={styles.micLabel}>
                {recording ? lang.stop : lang.speak_prompt}
              </span>
            </button>
          </div>

          {/* Live transcript */}
          {(transcript || interimText) && (
            <div className={styles.transcriptBox}>
              <div className={styles.transcriptLabel}>Live transcription</div>
              <p className={styles.transcriptText}>
                {transcript}
                {interimText && <span className={styles.interim}>{interimText}</span>}
              </p>
            </div>
          )}

          {/* Browser fallback */}
          {!micSupported && (
            <div className={styles.fallbackBox}>
              <p>🔇 Speech recognition not available in this browser.</p>
              <p>Please type the patient's complaint below:</p>
              <textarea
                className={styles.fallbackTextarea}
                rows={5}
                placeholder="Type what the patient is saying..."
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
              />
            </div>
          )}

          {error && <div className={styles.errorBox}>⚠️ {error}</div>}

          {(transcript.trim() || interimText.trim()) && !recording && (
            <button className={styles.analyseBtn} onClick={analyseTranscript}>
              Analyse with AI →
            </button>
          )}

          {(transcript.trim() || interimText.trim() || !micSupported) && !recording && (
            <button className={styles.analyseBtn} onClick={analyseTranscript}>
              Analyse with AI →
            </button>
          )}
        </div>
      )}

      {/* ── STEP 3: Loading ── */}
      {step === STEP.LOADING && lang && (
        <div className={styles.loadingScreen}>
          <div className={styles.loadingOrb}>
            <div className={styles.loadingRing} />
            <span className={styles.loadingIcon}>🧠</span>
          </div>
          <p className={styles.loadingText}>{lang.loading}</p>
          <p className={styles.loadingSubText}>Extracting symptoms · diet · severity · risk flags</p>
        </div>
      )}

      {/* ── STEP 4: Report Review ── */}
      {step === STEP.REPORT && editReport && lang && (
        <div className={styles.reportScreen}>
          <button className={styles.backLink} onClick={() => setStep(STEP.VOICE)}>← Re-record</button>

          <div className={styles.reportHeader}>
            <div className={styles.reportTitle}>AI Extracted Report</div>
            <div className={styles.reportLangPill}>{lang.native}</div>
          </div>

          {/* Native summary */}
          {editReport.nativeSummary && (
            <div className={styles.nativeSummary}>
              <div className={styles.nativeSummaryLabel}>Summary in {lang.native}</div>
              <p className={styles.nativeSummaryText}>{editReport.nativeSummary}</p>
            </div>
          )}

          {/* Key flags */}
          {editReport.keyFlags?.length > 0 && (
            <div className={styles.flagsRow}>
              {editReport.keyFlags.map((f, i) => (
                <span key={i} className={styles.flagChip}>⚑ {f}</span>
              ))}
            </div>
          )}

          {/* Editable fields */}
          <div className={styles.reportGrid}>
            {[
              { key: 'patientName',     label: 'Patient Name',       type: 'text'   },
              { key: 'age',             label: 'Age (years)',         type: 'number' },
              { key: 'gestationalWeek', label: 'Gestational Week',    type: 'number' },
              { key: 'chiefComplaint',  label: 'Chief Complaint',     type: 'text'   },
              { key: 'symptoms',        label: 'Symptoms (comma-sep)',type: 'text'   },
              { key: 'severity',        label: 'Severity',            type: 'text'   },
              { key: 'duration',        label: 'Duration',            type: 'text'   },
              { key: 'dietDescription', label: 'Diet / Food Intake',  type: 'text'   },
            ].map(({ key, label, type }) => (
              <div key={key} className={styles.reportField}>
                <label className={styles.reportLabel}>{label}</label>
                <input
                  className={styles.reportInput}
                  type={type}
                  value={editReport[key] || ''}
                  onChange={e => editField(key, e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              </div>
            ))}

            {/* Food access select */}
            <div className={styles.reportField}>
              <label className={styles.reportLabel}>Food Access Level</label>
              <select
                className={styles.reportInput}
                value={editReport.foodAccess || ''}
                onChange={e => editField('foodAccess', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Good">Good — vegetables, pulses, milk available</option>
                <option value="Limited">Limited — basic rice and roti only</option>
                <option value="Very limited">Very limited — irregular meals</option>
              </select>
            </div>
          </div>

          {/* Raw transcript accordion */}
          <details className={styles.rawTranscript}>
            <summary className={styles.rawTranscriptToggle}>View raw transcript</summary>
            <p className={styles.rawTranscriptText}>{editReport.rawTranscript}</p>
          </details>

          <button className={styles.confirmBtn} onClick={confirmAndFill}>
            ✓ {lang.confirm}
          </button>
        </div>
      )}

      {/* ── STEP 5: Done ── */}
      {step === STEP.DONE && (
        <div className={styles.doneScreen}>
          <div className={styles.doneIcon}>✅</div>
          <h3 className={styles.doneTitle}>Assessment form filled!</h3>
          <p className={styles.doneDesc}>
            The patient's details have been transferred to the Assessment tab.
            Switch to the Assessment tab and click "Run AI Assessment →"
          </p>
          <button className={styles.doneBtn} onClick={reset}>
            Start New Interview
          </button>
        </div>
      )}

    </div>
  );
}
