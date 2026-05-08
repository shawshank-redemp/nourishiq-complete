// ─────────────────────────────────────────────────────────────────────────────
// NourishIQ — Multilingual Voice Interview + Doctor Confirmation with Retry
// 6-step flow. ONLY this file changed. Nothing else touched.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import styles from './UrbanClinicMode.module.css';

// ── Full language text map ────────────────────────────────────────────────────
const LANG = {
  kn: {
    name: 'Kannada', native: 'ಕನ್ನಡ', bcp47: 'kn-IN',
    instruction:       'ನೀವು ಈಗ ಹೇಗೆ ಅನಿಸುತ್ತಿದ್ದೀರಿ ಎಂದು ವಿವರಿಸಿ',
    speak_now:         'ಮಾತನಾಡಿ',
    stop:              'ನಿಲ್ಲಿಸಿ',
    listening:         'ಕೇಳುತ್ತಿದ್ದೇವೆ...',
    analysing:         'AI ವರದಿ ತಯಾರಿಸುತ್ತಿದೆ...',
    send_doctor:       'ವೈದ್ಯರ ಅನುಮೋದನೆಗಾಗಿ ಕಳುಹಿಸಿ',
    sending:           'ಹತ್ತಿರದ ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...',
    connecting:        'ಡಾ. ರಮೇಶ್ ಕುಮಾರ್ (PHC ದೊಡ್ಡಬಳ್ಳಾಪುರ) ಜೊತೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...',
    no_response:       'ಈ ವೈದ್ಯರು ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಿಲ್ಲ. ಮುಂದಿನ ವೈದ್ಯರನ್ನು ಪ್ರಯತ್ನಿಸುತ್ತಿದ್ದೇವೆ...',
    retry_connect:     'ಡಾ. ಸುನೀತಾ ರೆಡ್ಡಿ (PHC ನೆಲಮಂಗಲ) ಜೊತೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...',
    approved_banner:   '✅ ವೈದ್ಯರು ಅನುಮೋದಿಸಿದ್ದಾರೆ - ಈ ಔಷಧವು ಸರಿಯಾಗಿದೆ',
    rejected_banner:   '❌ ವೈದ್ಯರು ಅನುಮೋದಿಸಿಲ್ಲ - ಈ ಔಷಧವು ಸರಿಯಲ್ಲ',
    approved_note:     'ಈ ಔಷಧ ತೆಗೆದುಕೊಳ್ಳಬಹುದು. ಚೆನ್ನಾಗಿ ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು ನೀರು ಕುಡಿಯಿರಿ.',
    rejected_note:     'ಸರಿಯಾದ ಪರೀಕ್ಷೆಗಾಗಿ ದಯವಿಟ್ಟು ತಕ್ಷಣ PHC ಗೆ ಭೇಟಿ ನೀಡಿ.',
    doctor_rec:        'ವೈದ್ಯರ ಶಿಫಾರಸು:',
    phc_info:          'ಹತ್ತಿರದ PHC:',
    proceed:           'ಸಂಪೂರ್ಣ AI ತಪಾಸಣೆಗೆ ಮುಂದುವರಿಯಿರಿ',
    transcript_label:  'ನೇರ ಲಿಪ್ಯಂತರಣ',
    report_title:      'AI ವರದಿ',
    summary_label:     'ಸಾರಾಂಶ',
    medicine_label:    'ಸೂಚಿಸಿದ ಔಷಧ',
    dosage_label:      'ಪ್ರಮಾಣ ಮತ್ತು ಸಮಯ',
    no_speech:         'ಮಾತು ಪತ್ತೆಯಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    analyse_btn:       'AI ಜೊತೆ ವಿಶ್ಲೇಷಿಸಿ →',
    change_lang:       '← ಭಾಷೆ ಬದಲಿಸಿ',
    re_record:         '← ಮತ್ತೆ ರೆಕಾರ್ಡ್ ಮಾಡಿ',
    done_title:        'ಫಾರ್ಮ್ ತುಂಬಲಾಗಿದೆ!',
    done_desc:         'ರೋಗಿಯ ವಿವರಗಳನ್ನು ತಪಾಸಣೆ ಟ್ಯಾಬ್‌ಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ.',
    new_interview:     'ಹೊಸ ಸಂದರ್ಶನ',
    edit_hint:         'ಕ್ಷೇತ್ರಗಳನ್ನು ಸಂಪಾದಿಸಿ',
    doctor_reviewing:  'ವೈದ್ಯರು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ...',
  },
  hi: {
    name: 'Hindi', native: 'हिंदी', bcp47: 'hi-IN',
    instruction:       'अभी आप कैसा महसूस कर रहे हैं, बताएं',
    speak_now:         'बोलिए',
    stop:              'रोकें',
    listening:         'सुन रहे हैं...',
    analysing:         'AI रिपोर्ट तैयार कर रहा है...',
    send_doctor:       'डॉक्टर की मंजूरी के लिए भेजें',
    sending:           'नजदीकी डॉक्टर को भेजा जा रहा है...',
    connecting:        'डॉ. रमेश कुमार (PHC दोड्डाबल्लापुर) से जुड़ रहे हैं...',
    no_response:       'यह डॉक्टर जवाब नहीं दे रहे हैं। अगले डॉक्टर को ट्राई कर रहे हैं...',
    retry_connect:     'डॉ. सुनीता रेड्डी (PHC नेलमंगला) से जुड़ रहे हैं...',
    approved_banner:   '✅ डॉक्टर ने स्वीकृति दी - यह दवा सही है',
    rejected_banner:   '❌ डॉक्टर ने स्वीकृति नहीं दी - यह दवा सही नहीं है',
    approved_note:     'यह दवा ले सकते हैं। अच्छे से आराम करें और पानी पिएं।',
    rejected_note:     'सही जांच के लिए कृपया तुरंत PHC जाएं।',
    doctor_rec:        'डॉक्टर की सिफारिश:',
    phc_info:          'नजदीकी PHC:',
    proceed:           'पूर्ण AI जांच के लिए आगे बढ़ें',
    transcript_label:  'लाइव ट्रांसक्रिप्शन',
    report_title:      'AI रिपोर्ट',
    summary_label:     'सारांश',
    medicine_label:    'सुझाई गई दवा',
    dosage_label:      'खुराक और समय',
    no_speech:         'कोई आवाज नहीं आई। फिर से बोलें।',
    analyse_btn:       'AI से विश्लेषण करें →',
    change_lang:       '← भाषा बदलें',
    re_record:         '← फिर से रिकॉर्ड करें',
    done_title:        'फॉर्म भरा गया!',
    done_desc:         'मरीज की जानकारी जांच टैब में भेज दी गई है।',
    new_interview:     'नया साक्षात्कार',
    edit_hint:         'फ़ील्ड संपादित करें',
    doctor_reviewing:  'डॉक्टर समीक्षा कर रहे हैं...',
  },
  ta: {
    name: 'Tamil', native: 'தமிழ்', bcp47: 'ta-IN',
    instruction:       'இப்போது உங்களுக்கு எப்படி இருக்கிறது என்று சொல்லுங்கள்',
    speak_now:         'பேசுங்கள்',
    stop:              'நிறுத்து',
    listening:         'கேட்கிறோம்...',
    analysing:         'AI அறிக்கை தயாரிக்கிறது...',
    send_doctor:       'மருத்துவர் ஒப்புதலுக்கு அனுப்பு',
    sending:           'அருகிலுள்ள மருத்துவரிடம் அனுப்புகிறோம்...',
    connecting:        'டாக்டர் ரமேஷ் குமார் (PHC தொட்டபல்லிபுரம்) உடன் இணைகிறோம்...',
    no_response:       'இந்த மருத்துவர் பதிலளிக்கவில்லை. அடுத்த மருத்துவரை தொடர்கிறோம்...',
    retry_connect:     'டாக்டர் சுனீதா ரெட்டி (PHC நெலமங்கல) உடன் இணைகிறோம்...',
    approved_banner:   '✅ மருத்துவர் அனுமதித்தார் - இந்த மருந்து சரியாக உள்ளது',
    rejected_banner:   '❌ மருத்துவர் அனுமதிக்கவில்லை - இந்த மருந்து சரியல்ல',
    approved_note:     'இந்த மருந்தை எடுக்கலாம். நன்றாக ஓய்வெடுங்கள் மற்றும் தண்ணீர் குடியுங்கள்.',
    rejected_note:     'சரியான பரிசோதனைக்கு உடனடியாக PHC வாருங்கள்.',
    doctor_rec:        'மருத்துவர் பரிந்துரை:',
    phc_info:          'அருகிலுள்ள PHC:',
    proceed:           'முழு AI பரிசோதனைக்கு தொடரவும்',
    transcript_label:  'நேரடி எழுத்துப்படி',
    report_title:      'AI அறிக்கை',
    summary_label:     'சுருக்கம்',
    medicine_label:    'பரிந்துரைக்கப்பட்ட மருந்து',
    dosage_label:      'அளவு மற்றும் நேரம்',
    no_speech:         'பேச்சு கண்டறியப்படவில்லை. மீண்டும் முயற்சிக்கவும்.',
    analyse_btn:       'AI உடன் பகுப்பாய்வு →',
    change_lang:       '← மொழி மாற்று',
    re_record:         '← மீண்டும் பதிவு செய்',
    done_title:        'படிவம் நிரப்பப்பட்டது!',
    done_desc:         'நோயாளியின் விவரங்கள் பரிசோதனை தாவலுக்கு மாற்றப்பட்டன.',
    new_interview:     'புதிய நேர்காணல்',
    edit_hint:         'புலங்களை திருத்தவும்',
    doctor_reviewing:  'மருத்துவர் மதிப்பாய்வு செய்கிறார்...',
  },
  te: {
    name: 'Telugu', native: 'తెలుగు', bcp47: 'te-IN',
    instruction:       'మీకు ఇప్పుడు ఎలా అనిపిస్తుందో వివరించండి',
    speak_now:         'మాట్లాడండి',
    stop:              'ఆపండి',
    listening:         'వింటున్నాము...',
    analysing:         'AI నివేదిక తయారు చేస్తోంది...',
    send_doctor:       'డాక్టర్ అనుమతి కోసం పంపండి',
    sending:           'సమీపంలోని డాక్టర్‌కు పంపుతున్నాము...',
    connecting:        'డా. రమేష్ కుమార్ (PHC దొడ్డబళ్ళాపుర) తో కనెక్ట్ అవుతున్నాము...',
    no_response:       'ఈ డాక్టర్ ప్రతిస్పందించలేదు. తర్వాత డాక్టర్‌ను ప్రయత్నిస్తున్నాము...',
    retry_connect:     'డా. సునీతా రెడ్డి (PHC నెలమంగల) తో కనెక్ట్ అవుతున్నాము...',
    approved_banner:   '✅ డాక్టర్ ఆమోదించారు - ఈ ఔషధం సరైనది',
    rejected_banner:   '❌ డాక్టర్ ఆమోదించలేదు - ఈ ఔషధం సరైనది కాదు',
    approved_note:     'ఈ మందు తీసుకోవచ్చు. బాగా విశ్రాంతి తీసుకోండి మరియు నీళ్లు తాగండి.',
    rejected_note:     'సరైన పరీక్ష కోసం దయచేసి వెంటనే PHC కి వెళ్ళండి.',
    doctor_rec:        'డాక్టర్ సిఫారసు:',
    phc_info:          'సమీప PHC:',
    proceed:           'పూర్తి AI పరీక్షకు కొనసాగండి',
    transcript_label:  'లైవ్ ట్రాన్స్క్రిప్షన్',
    report_title:      'AI నివేదిక',
    summary_label:     'సారాంశం',
    medicine_label:    'సూచించిన ఔషధం',
    dosage_label:      'మోతాదు మరియు సమయం',
    no_speech:         'మాట్లాడటం గుర్తించబడలేదు. మళ్ళీ ప్రయత్నించండి.',
    analyse_btn:       'AI తో విశ్లేషించండి →',
    change_lang:       '← భాష మార్చండి',
    re_record:         '← మళ్ళీ రికార్డ్ చేయండి',
    done_title:        'ఫారం నింపబడింది!',
    done_desc:         'రోగి వివరాలు అసెస్‌మెంట్ ట్యాబ్‌కు బదిలీ చేయబడ్డాయి.',
    new_interview:     'కొత్త ఇంటర్వ్యూ',
    edit_hint:         'ఫీల్డ్‌లను సవరించండి',
    doctor_reviewing:  'డాక్టర్ సమీక్షిస్తున్నారు...',
  },
  en: {
    name: 'English', native: 'English', bcp47: 'en-IN',
    instruction:       'Describe what you are feeling right now',
    speak_now:         'Speak Now',
    stop:              'Stop',
    listening:         'Listening...',
    analysing:         'AI is generating your report...',
    send_doctor:       'Send to Doctor for Confirmation',
    sending:           'Sending to nearest PHC doctor...',
    connecting:        'Connecting to Dr. Ramesh Kumar (PHC Doddaballapur)...',
    no_response:       'This doctor is not available. Trying next doctor...',
    retry_connect:     'Connecting to Dr. Sunita Reddy (PHC Nelamangala)...',
    approved_banner:   '✅ Doctor approved - This medicine is correct',
    rejected_banner:   '❌ Doctor did not approve - This medicine is not correct',
    approved_note:     'You can take this medicine. Rest well and drink water.',
    rejected_note:     'Please visit PHC immediately for proper examination.',
    doctor_rec:        "Doctor's recommendation:",
    phc_info:          'Nearest PHC:',
    proceed:           'Proceed to Full AI Assessment',
    transcript_label:  'Live Transcription',
    report_title:      'AI Report',
    summary_label:     'Summary',
    medicine_label:    'Suggested Medicine',
    dosage_label:      'Dosage & Timing',
    no_speech:         'No speech detected. Please try again.',
    analyse_btn:       'Analyse with AI →',
    change_lang:       '← Change Language',
    re_record:         '← Re-record',
    done_title:        'Form Filled!',
    done_desc:         'Patient details transferred to the Assessment tab.',
    new_interview:     'New Interview',
    edit_hint:         'Edit fields below if needed',
    doctor_reviewing:  'Doctor is reviewing...',
  },
};

// PHC info shown on rejection
const PHC_INFO = {
  name: 'PHC Doddaballapur',
  address: 'B.B. Road, Doddaballapur, Bengaluru Rural — 561203',
  phone: '080-7677-2100',
  hours: 'Mon–Sat  8:00 AM – 4:00 PM',
};

// Doctor sequence for retry simulation
const DOCTORS = [
  { name: 'Dr. Ramesh Kumar', phc: 'PHC Doddaballapur', key: 'connecting' },
  { name: 'Dr. Sunita Reddy', phc: 'PHC Nelamangala',   key: 'retry_connect' },
];

// Steps
const STEP = {
  LANG: 'lang', VOICE: 'voice', LOADING: 'loading',
  REPORT: 'report', DOCTOR: 'doctor', DONE: 'done',
};

// Doctor sub-states
const DOC = {
  SENDING: 'sending', CONNECTING: 'connecting',
  NO_RESP: 'no_response', RETRY: 'retry',
  REVIEWING: 'reviewing', APPROVED: 'approved', REJECTED: 'rejected',
};

function buildPrompt(transcript, langCode) {
  return `You are a general health intake assistant. A patient spoke in ${langCode}. Transcript: "${transcript}"
Return ONLY this JSON (no markdown):
{
  "chief_complaint": "patient's own words in 1 sentence English",
  "symptoms_list": "comma-separated English symptoms",
  "severity": "Mild/Moderate/Severe",
  "duration": "how long symptoms present",
  "diet_history": "any diet info mentioned",
  "lifestyle_notes": "any other relevant notes",
  "native_language_summary": "2-3 sentences in ${langCode} script summarising symptoms",
  "suggested_medicine_name": "appropriate OTC medicine name",
  "suggested_dosage_and_timing": "dosage and frequency in English",
  "patient_name": null,
  "age": null,
  "gestational_week": null
}`;
}

export default function UrbanClinicMode({ onFillAssessment }) {
  const [step, setStep]         = useState(STEP.LANG);
  const [langCode, setLangCode] = useState(null);
  const [recording, setRec]     = useState(false);
  const [transcript, setTrans]  = useState('');
  const [interim, setInterim]   = useState('');
  const [report, setReport]     = useState(null);
  const [edit, setEdit]         = useState(null);
  const [error, setError]       = useState('');
  const [docState, setDocState] = useState(DOC.SENDING);
  const [docIdx, setDocIdx]     = useState(0);
  const [outcome, setOutcome]   = useState(null); // 'approved' | 'rejected'
  const [micOk, setMicOk]       = useState(true);

  const recogRef = useRef(null);
  const t1 = useRef(null); const t2 = useRef(null);
  const t3 = useRef(null); const t4 = useRef(null);
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const T = langCode ? LANG[langCode] : null;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setMicOk(false);
    return () => [t1, t2, t3, t4].forEach(r => clearTimeout(r.current));
  }, []);

  // ── Voice helpers ─────────────────────────────────────────────────────────
  function startRec() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Speech not supported. Type below.'); return; }
    const r = new SR();
    r.lang = LANG[langCode].bcp47;
    r.continuous = true; r.interimResults = true;
    r.onresult = e => {
      let fin = '', itm = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        e.results[i].isFinal ? (fin += t + ' ') : (itm += t);
      }
      if (fin) setTrans(p => p + fin);
      setInterim(itm);
    };
    r.onerror = e => { if (e.error !== 'aborted') setError(`Mic: ${e.error}`); stopRec(); };
    r.onend   = () => { setRec(false); setInterim(''); };
    recogRef.current = r; r.start(); setRec(true); setError('');
  }

  function stopRec() {
    recogRef.current?.stop(); recogRef.current = null;
    setRec(false); setInterim('');
  }

  // ── AI analysis ───────────────────────────────────────────────────────────
  async function analyse() {
    const full = (transcript + ' ' + interim).trim();
    if (!full) { setError(T.no_speech); return; }
    stopRec(); setStep(STEP.LOADING);
    try {
      let parsed;
      const hasKey = apiKey && apiKey !== 'paste-your-key-here';
      if (hasKey) {
        const res  = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
          body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 700, messages: [{ role: 'user', content: buildPrompt(full, langCode) }] }),
        });
        const data = await res.json();
        parsed = JSON.parse((data.content?.[0]?.text || '{}').replace(/```json|```/g, '').trim());
      } else {
        await new Promise(r => setTimeout(r, 2000));
        parsed = {
          chief_complaint: 'Severe fatigue and dizziness, feeling very weak',
          symptoms_list: 'Pale eyelids, extreme fatigue, dizziness, swollen feet',
          severity: 'Moderate',
          duration: 'Past 2 weeks',
          diet_history: 'Rice and sambar only, skipping breakfast, no vegetables',
          lifestyle_notes: 'Cannot stand for long, unable to do housework',
          native_language_summary:
            langCode === 'kn' ? 'ರೋಗಿಗೆ ತೀವ್ರ ಆಯಾಸ ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ ಇದೆ. ಆಹಾರದಲ್ಲಿ ಕಬ್ಬಿಣದ ಕೊರತೆ ಕಂಡುಬಂದಿದೆ. PHC ಪರೀಕ್ಷೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.' :
            langCode === 'hi' ? 'मरीज को गंभीर थकान और चक्कर आ रहे हैं। आहार में आयरन की कमी है। PHC जांच की सलाह दी जाती है।' :
            langCode === 'ta' ? 'நோயாளிக்கு கடுமையான சோர்வு மற்றும் தலைசுற்றல் உள்ளது. உணவில் இரும்பு குறைபாடு உள்ளது. PHC பரிசோதனை பரிந்துரைக்கப்படுகிறது.' :
            langCode === 'te' ? 'రోగికి తీవ్రమైన అలసట మరియు తలతిరుగుడు ఉంది. ఆహారంలో ఇనుప లోపం ఉంది. PHC పరీక్ష సిఫారసు చేయబడింది.' :
            'Patient reports severe fatigue and dizziness for 2 weeks. Iron deficit in diet detected. PHC examination recommended.',
          suggested_medicine_name: 'Iron + Folic Acid (IFA) Tablet',
          suggested_dosage_and_timing: '1 tablet twice daily after meals (morning and evening)',
          patient_name: null, age: '24', gestational_week: '26',
        };
      }
      const r = { ...parsed, rawTranscript: full };
      setReport(r); setEdit(r); setStep(STEP.REPORT);
    } catch { setError('Analysis failed. Please try again.'); setStep(STEP.VOICE); }
  }

  // ── Doctor confirmation flow ──────────────────────────────────────────────
  function startDoctorFlow() {
    setStep(STEP.DOCTOR);
    setDocIdx(0);
    setDocState(DOC.SENDING);
    setOutcome(null);

    // 1s — show "sending"
    t1.current = setTimeout(() => {
      setDocState(DOC.CONNECTING);
    }, 1000);

    // 5s — first doctor no response
    t2.current = setTimeout(() => {
      setDocState(DOC.NO_RESP);
    }, 6000);

    // 8s — retry with second doctor
    t3.current = setTimeout(() => {
      setDocIdx(1);
      setDocState(DOC.RETRY);
    }, 9000);

    // 11s — second doctor reviewing
    t4.current = setTimeout(() => {
      setDocState(DOC.REVIEWING);
    }, 12000);

    // 15s — final outcome
    setTimeout(() => {
      const result = Math.random() > 0.38 ? 'approved' : 'rejected';
      setOutcome(result);
      setDocState(result === 'approved' ? DOC.APPROVED : DOC.REJECTED);
    }, 16000);
  }

  function proceed() {
    if (!edit) return;
    const filled = {
      patientName:     edit.patient_name     || '',
      age:             edit.age              || '',
      gestationalWeek: edit.gestational_week || '',
      symptoms:        edit.symptoms_list    || edit.chief_complaint || '',
      foodIntake:      edit.diet_history     || '',
      foodAccess:      'Limited — basic rice and roti only',
      ashaWorkerName:  '',
    };
    if (onFillAssessment) onFillAssessment(filled);
    setStep(STEP.DONE);
  }

  function reset() {
    [t1, t2, t3, t4].forEach(r => clearTimeout(r.current));
    setStep(STEP.LANG); setLangCode(null); setTrans(''); setInterim('');
    setReport(null); setEdit(null); setError('');
    setDocState(DOC.SENDING); setDocIdx(0); setOutcome(null);
  }

  const ef = (k, v) => setEdit(p => ({ ...p, [k]: v }));

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 1 — Language Selection
  // ════════════════════════════════════════════════════════════════════════════
  if (step === STEP.LANG) return (
    <div className={styles.wrap}>
      <div className={styles.langScreen}>
        <div className={styles.langHero}>
          <span className={styles.langHeroIcon}>🎙️</span>
          <h2 className={styles.langHeroTitle}>Voice Patient Interview</h2>
          <p className={styles.langHeroDesc}>Select patient language · Speak naturally · AI extracts report · Doctor confirms</p>
        </div>
        <div className={styles.langGrid}>
          {Object.entries(LANG).map(([code, l]) => (
            <button key={code} className={styles.langBtn} onClick={() => { setLangCode(code); setStep(STEP.VOICE); setTrans(''); setInterim(''); setError(''); }}>
              <span className={styles.langNative}>{l.native}</span>
              <span className={styles.langEn}>{l.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 2 — Voice Interview
  // ════════════════════════════════════════════════════════════════════════════
  if (step === STEP.VOICE) return (
    <div className={styles.wrap}>
      <button className={styles.back} onClick={reset}>{T.change_lang}</button>
      <div className={styles.voiceScreen}>
        <div className={styles.langTag}>{T.native} · {T.name}</div>
        <p className={styles.voiceInstr}>{T.instruction}</p>

        <div className={styles.micOuter}>
          {recording && <><div className={`${styles.wave} ${styles.w1}`}/><div className={`${styles.wave} ${styles.w2}`}/><div className={`${styles.wave} ${styles.w3}`}/></>}
          <button className={`${styles.micBtn} ${recording ? styles.micActive : ''}`} onClick={recording ? stopRec : startRec} disabled={!micOk}>
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
            <p>🔇 Type symptoms below:</p>
            <textarea className={styles.fallbackTA} rows={5} value={transcript} onChange={e => setTrans(e.target.value)} placeholder="Type what the patient is saying..." />
          </div>
        )}

        {error && <div className={styles.errBox}>⚠️ {error}</div>}

        {((transcript.trim() || interim.trim()) && !recording) || (!micOk && transcript.trim()) ? (
          <button className={styles.primaryBtn} onClick={analyse}>{T.analyse_btn}</button>
        ) : null}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 3 — Loading
  // ════════════════════════════════════════════════════════════════════════════
  if (step === STEP.LOADING) return (
    <div className={styles.wrap}>
      <div className={styles.loadScreen}>
        <div className={styles.loadOrb}><div className={styles.loadRing}/><span className={styles.loadIcon}>🧠</span></div>
        <p className={styles.loadText}>{T.analysing}</p>
        <div className={styles.loadDots}><span/><span/><span/></div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 4 — Report Review
  // ════════════════════════════════════════════════════════════════════════════
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

        {/* Medicine highlight */}
        {edit.suggested_medicine_name && (
          <div className={styles.medicineCard}>
            <div className={styles.medRow}>
              <span className={styles.medIcon}>💊</span>
              <div>
                <div className={styles.medLabel}>{T.medicine_label}</div>
                <div className={styles.medName}>{edit.suggested_medicine_name}</div>
              </div>
            </div>
            {edit.suggested_dosage_and_timing && (
              <div className={styles.medDosage}>
                <span className={styles.medDosageLabel}>{T.dosage_label}</span>
                <span className={styles.medDosageVal}>{edit.suggested_dosage_and_timing}</span>
              </div>
            )}
          </div>
        )}

        <p className={styles.editHint}>{T.edit_hint}</p>

        <div className={styles.fieldGrid}>
          {[
            { k: 'chief_complaint',            lbl: 'Chief Complaint',    full: true },
            { k: 'symptoms_list',              lbl: 'Symptoms Detected',  full: true },
            { k: 'severity',                   lbl: 'Severity',           full: false },
            { k: 'duration',                   lbl: 'Duration',           full: false },
            { k: 'diet_history',               lbl: 'Diet / Food',        full: true },
            { k: 'suggested_medicine_name',    lbl: 'Suggested Medicine', full: false },
            { k: 'suggested_dosage_and_timing',lbl: 'Dosage & Timing',    full: false },
            { k: 'patient_name',               lbl: 'Patient Name',       full: false },
            { k: 'age',                        lbl: 'Age',                full: false },
            { k: 'gestational_week',           lbl: 'Gestational Week',   full: false },
          ].map(({ k, lbl, full }) => (
            <div key={k} className={`${styles.fieldRow} ${full ? styles.fullWidth : ''}`}>
              <label className={styles.fieldLbl}>{lbl}</label>
              <input className={styles.fieldInput} value={edit[k] || ''} onChange={e => ef(k, e.target.value)} placeholder={lbl} />
            </div>
          ))}
        </div>

        <button className={styles.primaryBtn} onClick={startDoctorFlow}>{T.send_doctor}</button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 5 — Doctor Confirmation
  // ════════════════════════════════════════════════════════════════════════════
  if (step === STEP.DOCTOR) return (
    <div className={styles.wrap}>
      <div className={styles.doctorScreen}>

        {/* ── Waiting / connecting / retry states ── */}
        {[DOC.SENDING, DOC.CONNECTING, DOC.NO_RESP, DOC.RETRY, DOC.REVIEWING].includes(docState) && (
          <div className={styles.waitCard}>
            <div className={styles.waitOrb}>
              <div className={`${styles.waitRing} ${docState === DOC.NO_RESP ? styles.waitRingRed : ''}`}/>
              <span className={styles.waitOrbIcon}>
                {docState === DOC.NO_RESP ? '⚠️' : docState === DOC.REVIEWING ? '🩺' : '👨‍⚕️'}
              </span>
            </div>

            <p className={`${styles.waitStatus} ${docState === DOC.NO_RESP ? styles.waitStatusRed : ''}`}>
              {docState === DOC.SENDING   && T.sending}
              {docState === DOC.CONNECTING && T.connecting}
              {docState === DOC.NO_RESP   && T.no_response}
              {docState === DOC.RETRY     && T.retry_connect}
              {docState === DOC.REVIEWING && T.doctor_reviewing}
            </p>

            {/* Progress bar */}
            <div className={styles.progressTrack}>
              <div className={`${styles.progressBar} ${
                docState === DOC.SENDING    ? styles.prog20 :
                docState === DOC.CONNECTING ? styles.prog40 :
                docState === DOC.NO_RESP    ? styles.prog50 :
                docState === DOC.RETRY      ? styles.prog70 :
                styles.prog90
              }`}/>
            </div>

            {/* Doctor name card */}
            {(docState === DOC.CONNECTING || docState === DOC.REVIEWING) && (
              <div className={styles.doctorNameCard}>
                <span className={styles.doctorAvatar}>👨‍⚕️</span>
                <div>
                  <div className={styles.doctorName}>{DOCTORS[docIdx].name}</div>
                  <div className={styles.doctorPhc}>{DOCTORS[docIdx].phc}</div>
                </div>
                <div className={styles.onlineDot}/>
              </div>
            )}
            {docState === DOC.RETRY && (
              <div className={styles.doctorNameCard}>
                <span className={styles.doctorAvatar}>👩‍⚕️</span>
                <div>
                  <div className={styles.doctorName}>{DOCTORS[1].name}</div>
                  <div className={styles.doctorPhc}>{DOCTORS[1].phc}</div>
                </div>
                <div className={styles.onlineDot}/>
              </div>
            )}

            {/* ECG line */}
            <div className={styles.ecgWrap}><div className={styles.ecgLine}/></div>
          </div>
        )}

        {/* ── APPROVED ── */}
        {docState === DOC.APPROVED && (
          <div className={`${styles.outcomeCard} ${styles.outcomeGreen}`}>
            <div className={styles.outcomeIconCircle} style={{ background: '#16A34A' }}>
              <span className={styles.outcomeIcon}>✅</span>
            </div>
            <h3 className={styles.outcomeBanner}>{T.approved_banner}</h3>

            <div className={styles.approvedMedCard}>
              <div className={styles.approvedMedLabel}>💊 {T.medicine_label}</div>
              <div className={styles.approvedMedName}>{edit?.suggested_medicine_name}</div>
              <div className={styles.approvedMedDose}>{edit?.suggested_dosage_and_timing}</div>
            </div>

            <div className={styles.outcomeNote}>{T.approved_note}</div>

            <div className={styles.doctorSays}>
              <div className={styles.doctorSaysLabel}>{T.doctor_rec}</div>
              <p className={styles.doctorSaysText}>
                {langCode === 'kn' ? 'ರೋಗಿಗೆ ಕಬ್ಬಿಣದ ಕೊರತೆ ಇದೆ. IFA ಮಾತ್ರೆ ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ. 7 ದಿನಗಳ ನಂತರ ಮರು ಪರೀಕ್ಷೆ.' :
                 langCode === 'hi' ? 'मरीज में आयरन की कमी है। IFA गोली खाने के बाद लें। 7 दिन बाद दोबारा जांच कराएं।' :
                 langCode === 'ta' ? 'நோயாளிக்கு இரும்பு குறைபாடு உள்ளது. IFA மாத்திரையை சாப்பிட்ட பிறகு எடுக்கவும். 7 நாட்களில் மீண்டும் பரிசோதனை.' :
                 langCode === 'te' ? 'రోగికి ఇనుప లోపం ఉంది. భోజనం తర్వాత IFA మాత్ర తీసుకోండి. 7 రోజుల్లో తిరిగి పరీక్ష.' :
                 'Patient has iron deficiency. Take IFA tablet after meals. Re-examine in 7 days.'}
              </p>
            </div>

            <button className={styles.proceedBtn} onClick={proceed}>{T.proceed}</button>
          </div>
        )}

        {/* ── REJECTED ── */}
        {docState === DOC.REJECTED && (
          <div className={`${styles.outcomeCard} ${styles.outcomeRed}`}>
            <div className={styles.outcomeIconCircle} style={{ background: '#DC2626' }}>
              <span className={styles.outcomeIcon}>❌</span>
            </div>
            <h3 className={styles.outcomeBanner}>{T.rejected_banner}</h3>
            <div className={styles.outcomeNote}>{T.rejected_note}</div>

            <div className={styles.phcCard}>
              <div className={styles.phcLabel}>{T.phc_info}</div>
              <div className={styles.phcName}>{PHC_INFO.name}</div>
              <div className={styles.phcDetail}>📍 {PHC_INFO.address}</div>
              <div className={styles.phcDetail}>📞 {PHC_INFO.phone}</div>
              <div className={styles.phcDetail}>🕗 {PHC_INFO.hours}</div>
            </div>

            <div className={styles.doctorSays}>
              <div className={styles.doctorSaysLabel}>{T.doctor_rec}</div>
              <p className={styles.doctorSaysText}>
                {langCode === 'kn' ? 'ಈ ರೋಗಿಗೆ ಸಂಪೂರ್ಣ ರಕ್ತ ಪರೀಕ್ಷೆ ಮತ್ತು Hb ಮಟ್ಟ ತಪಾಸಣೆ ಅಗತ್ಯ. PHC ಗೆ ಕರೆದೊಯ್ಯಿರಿ.' :
                 langCode === 'hi' ? 'इस मरीज को पूरी रक्त जांच और Hb स्तर की जरूरत है। PHC ले जाएं।' :
                 langCode === 'ta' ? 'இந்த நோயாளிக்கு முழு இரத்த பரிசோதனை மற்றும் Hb அளவு பரிசோதனை தேவை. PHC அழைத்துச் செல்லவும்.' :
                 langCode === 'te' ? 'ఈ రోగికి పూర్తి రక్త పరీక్ష మరియు Hb స్థాయి పరీక్ష అవసరం. PHC తీసుకెళ్ళండి.' :
                 'Patient needs full blood count and Hb level test. Take to PHC immediately.'}
              </p>
            </div>

            <button className={styles.proceedBtn} style={{ background: '#DC2626' }} onClick={proceed}>{T.proceed}</button>
          </div>
        )}

      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 6 — Done
  // ════════════════════════════════════════════════════════════════════════════
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
