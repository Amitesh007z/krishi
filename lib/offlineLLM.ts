// Offline LLM System for Voice Assistant
// Works without internet using local knowledge base and pattern matching

export interface OfflineResponse {
  text: string
  action?: string
  confidence: number
  language: 'en' | 'hi' | 'pa'
  context?: any
}

export interface VoiceCommand {
  text: string
  language: 'en' | 'hi' | 'pa'
  context: {
    location?: string
    crop?: string
    quantity?: string
    currentTab?: string
    userData?: any
    lastUtterance?: string
  }
}

// Multi-language agricultural knowledge base
const AGRICULTURAL_KNOWLEDGE = {
      crops: {
        wheat: {
      en: {
          sowing: 'October to December',
          harvesting: 'March to April',
        pests: ['aphids', 'rust', 'powdery mildew'],
          fertilizers: ['NPK 20:20:20', 'Urea', 'DAP'],
          irrigation: 'Requires 4-5 irrigations',
          yield: '4-5 tons per hectare',
          storage: 'Keep in dry, well-ventilated place',
        diseases: ['rust', 'smut', 'loose smut'],
        market_trend: 'Prices usually peak in March-April',
        best_selling_time: 'March to May',
        common_markets: ['Rajpura', 'Ghanaur', 'Patiala']
      },
      hi: {
        sowing: 'अक्टूबर से दिसंबर',
        harvesting: 'मार्च से अप्रैल',
        pests: ['एफिड्स', 'रस्ट', 'पाउडरी मिल्ड्यू'],
        fertilizers: ['NPK 20:20:20', 'यूरिया', 'DAP'],
        irrigation: '4-5 सिंचाई की आवश्यकता',
        yield: 'प्रति हेक्टेयर 4-5 टन',
        storage: 'सूखे, हवादार स्थान में रखें',
        diseases: ['रस्ट', 'स्मट', 'लूज स्मट'],
        market_trend: 'कीमतें आमतौर पर मार्च-अप्रैल में चरम पर होती हैं',
        best_selling_time: 'मार्च से मई',
        common_markets: ['राजपुरा', 'घनौर', 'पटियाला']
      },
      pa: {
        sowing: 'ਅਕਤੂਬਰ ਤੋਂ ਦਸੰਬਰ',
        harvesting: 'ਮਾਰਚ ਤੋਂ ਅਪ੍ਰੈਲ',
        pests: ['ਏਫਿਡਸ', 'ਰਸਟ', 'ਪਾਊਡਰੀ ਮਿਲਡਿਊ'],
        fertilizers: ['NPK 20:20:20', 'ਯੂਰੀਆ', 'DAP'],
        irrigation: '4-5 ਸਿੰਚਾਈ ਦੀ ਲੋੜ',
        yield: 'ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ 4-5 ਟਨ',
        storage: 'ਸੁੱਕੇ, ਹਵਾਦਾਰ ਜਗ੍ਹਾ ਵਿੱਚ ਰੱਖੋ',
        diseases: ['ਰਸਟ', 'ਸਮਟ', 'ਲੂਜ਼ ਸਮਟ'],
        market_trend: 'ਕੀਮਤਾਂ ਆਮ ਤੌਰ ਤੇ ਮਾਰਚ-ਅਪ੍ਰੈਲ ਵਿੱਚ ਚਰਮ ਤੇ ਹੁੰਦੀਆਂ ਹਨ',
        best_selling_time: 'ਮਾਰਚ ਤੋਂ ਮਈ',
        common_markets: ['ਰਾਜਪੁਰਾ', 'ਘਨੌਰ', 'ਪਟਿਆਲਾ']
      }
        },
        rice: {
      en: {
          sowing: 'June to July',
          harvesting: 'October to November',
          pests: ['stem borer', 'leaf folder', 'brown plant hopper'],
          fertilizers: ['Urea', 'DAP', 'Potash'],
          irrigation: 'Requires standing water',
          yield: '6-7 tons per hectare',
          storage: 'Store in moisture-controlled environment',
        diseases: ['blast', 'bacterial blight', 'tungro virus'],
        market_trend: 'Prices peak during festival season',
        best_selling_time: 'October to December',
        common_markets: ['Amritsar', 'Jalandhar', 'Ludhiana']
      },
      hi: {
        sowing: 'जून से जुलाई',
        harvesting: 'अक्टूबर से नवंबर',
        pests: ['स्टेम बोरर', 'लीफ फोल्डर', 'ब्राउन प्लांट होपर'],
        fertilizers: ['यूरिया', 'DAP', 'पोटाश'],
        irrigation: 'खड़े पानी की आवश्यकता',
        yield: 'प्रति हेक्टेयर 6-7 टन',
        storage: 'नमी नियंत्रित वातावरण में स्टोर करें',
        diseases: ['ब्लास्ट', 'बैक्टीरियल ब्लाइट', 'टंग्रो वायरस'],
        market_trend: 'त्योहार के मौसम में कीमतें चरम पर होती हैं',
        best_selling_time: 'अक्टूबर से दिसंबर',
        common_markets: ['अमृतसर', 'जालंधर', 'लुधियाना']
      },
      pa: {
        sowing: 'ਜੂਨ ਤੋਂ ਜੁਲਾਈ',
        harvesting: 'ਅਕਤੂਬਰ ਤੋਂ ਨਵੰਬਰ',
        pests: ['ਸਟੇਮ ਬੋਰਰ', 'ਲੀਫ ਫੋਲਡਰ', 'ਬ੍ਰਾਊਨ ਪਲਾਂਟ ਹੌਪਰ'],
        fertilizers: ['ਯੂਰੀਆ', 'DAP', 'ਪੋਟਾਸ਼'],
        irrigation: 'ਖੜ੍ਹੇ ਪਾਣੀ ਦੀ ਲੋੜ',
        yield: 'ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ 6-7 ਟਨ',
        storage: 'ਨਮੀ ਨਿਯੰਤਰਿਤ ਵਾਤਾਵਰਣ ਵਿੱਚ ਸਟੋਰ ਕਰੋ',
        diseases: ['ਬਲਾਸਟ', 'ਬੈਕਟੀਰੀਅਲ ਬਲਾਈਟ', 'ਟੰਗਰੋ ਵਾਇਰਸ'],
        market_trend: 'ਤਿਉਹਾਰ ਦੇ ਮੌਸਮ ਵਿੱਚ ਕੀਮਤਾਂ ਚਰਮ ਤੇ ਹੁੰਦੀਆਂ ਹਨ',
        best_selling_time: 'ਅਕਤੂਬਰ ਤੋਂ ਦਸੰਬਰ',
        common_markets: ['ਅੰਮ੍ਰਿਤਸਰ', 'ਜਲੰਧਰ', 'ਲੁਧਿਆਣਾ']
      }
    },
    potato: {
      en: {
        sowing: 'October to November',
        harvesting: 'February to March',
        pests: ['aphids', 'potato tuber moth', 'wireworms'],
        fertilizers: ['NPK', 'Urea', 'Potash'],
        irrigation: 'Requires regular irrigation',
        yield: '25-30 tons per hectare',
        storage: 'Store in cool, dark place',
        diseases: ['late blight', 'early blight', 'blackleg'],
        market_trend: 'Prices high during summer months',
        best_selling_time: 'February to April',
        common_markets: ['Jalandhar', 'Ludhiana', 'Amritsar']
      },
      hi: {
        sowing: 'अक्टूबर से नवंबर',
        harvesting: 'फरवरी से मार्च',
        pests: ['एफिड्स', 'आलू ट्यूबर मोथ', 'वायरवर्म्स'],
        fertilizers: ['NPK', 'यूरिया', 'पोटाश'],
        irrigation: 'नियमित सिंचाई की आवश्यकता',
        yield: 'प्रति हेक्टेयर 25-30 टन',
        storage: 'ठंडे, अंधेरे स्थान में स्टोर करें',
        diseases: ['लेट ब्लाइट', 'अर्ली ब्लाइट', 'ब्लैकलेग'],
        market_trend: 'गर्मी के महीनों में कीमतें अधिक होती हैं',
        best_selling_time: 'फरवरी से अप्रैल',
        common_markets: ['जालंधर', 'लुधियाना', 'अमृतसर']
      },
      pa: {
        sowing: 'ਅਕਤੂਬਰ ਤੋਂ ਨਵੰਬਰ',
        harvesting: 'ਫਰਵਰੀ ਤੋਂ ਮਾਰਚ',
        pests: ['ਏਫਿਡਸ', 'ਆਲੂ ਟਿਊਬਰ ਮੋਥ', 'ਵਾਇਰਵਰਮਸ'],
        fertilizers: ['NPK', 'ਯੂਰੀਆ', 'ਪੋਟਾਸ਼'],
        irrigation: 'ਨਿਯਮਿਤ ਸਿੰਚਾਈ ਦੀ ਲੋੜ',
        yield: 'ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ 25-30 ਟਨ',
        storage: 'ਠੰਡੇ, ਹਨੇਰੇ ਸਥਾਨ ਵਿੱਚ ਸਟੋਰ ਕਰੋ',
        diseases: ['ਲੇਟ ਬਲਾਈਟ', 'ਅਰਲੀ ਬਲਾਈਟ', 'ਬਲੈਕਲੈਗ'],
        market_trend: 'ਗਰਮੀ ਦੇ ਮਹੀਨਿਆਂ ਵਿੱਚ ਕੀਮਤਾਂ ਉੱਚੀਆਂ ਹੁੰਦੀਆਂ ਹਨ',
        best_selling_time: 'ਫਰਵਰੀ ਤੋਂ ਅਪ੍ਰੈਲ',
        common_markets: ['ਜਲੰਧਰ', 'ਲੁਧਿਆਣਾ', 'ਅੰਮ੍ਰਿਤਸਰ']
      }
    }
  },
  
  weather: {
        hot: {
      en: 'High temperature requires more irrigation. Monitor soil moisture.',
      hi: 'गर्मी में अधिक सिंचाई की आवश्यकता। मिट्टी की नमी की निगरानी करें।',
      pa: 'ਉੱਚ ਤਾਪਮਾਨ ਵਿੱਚ ਵਧੇਰੇ ਸਿੰਚਾਈ ਦੀ ਲੋੜ। ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।'
        },
        cold: {
      en: 'Cold weather requires crop protection. Watch for frost.',
      hi: 'सर्दी में फसल सुरक्षा की आवश्यकता। पाला पड़ने की संभावना।',
      pa: 'ਠੰਡੇ ਮੌਸਮ ਵਿੱਚ ਫਸਲ ਸੁਰੱਖਿਆ ਦੀ ਲੋੜ। ਪਾਲਾ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ।'
        },
        rainy: {
      en: 'Rainy weather requires drainage. Protect crops from waterlogging.',
      hi: 'बारिश में जल निकासी की आवश्यकता। फसल को जलभराव से बचाएं।',
      pa: 'ਬਾਰਸ਼ੀ ਮੌਸਮ ਵਿੱਚ ਜਲ ਨਿਕਾਸੀ ਦੀ ਲੋੜ। ਫਸਲ ਨੂੰ ਜਲਭਰਾਵ ਤੋਂ ਬਚਾਓ।'
    },
        normal: {
      en: 'Conditions are normal. Maintain regular irrigation and monitoring.',
      hi: 'स्थितियां सामान्य हैं। नियमित सिंचाई और निगरानी बनाए रखें।',
      pa: 'ਹਾਲਾਤ ਆਮ ਹਨ। ਨਿਯਮਿਤ ਸਿੰਚਾਈ ਅਤੇ ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ।'
    }
  },
  
  market: {
        rising: {
      en: 'Prices are rising. Good time to sell.',
      hi: 'कीमतें बढ़ रही हैं। बेचने का अच्छा समय।',
      pa: 'ਕੀਮਤਾਂ ਵਧ ਰਹੀਆਂ ਹਨ। ਵੇਚਣ ਦਾ ਚੰਗਾ ਸਮਾਂ।'
        },
        falling: {
      en: 'Prices are falling. Wait for better rates.',
      hi: 'कीमतें गिर रही हैं। बेहतर दरों का इंतजार करें।',
      pa: 'ਕੀਮਤਾਂ ਘਟ ਰਹੀਆਂ ਹਨ। ਬਿਹਤਰ ਦਰਾਂ ਦਾ ਇੰਤਜ਼ਾਰ ਕਰੋ।'
        },
        stable: {
      en: 'Prices are stable. Monitor market trends.',
      hi: 'कीमतें स्थिर हैं। बाजार ट्रेंड की निगरानी करें।',
      pa: 'ਕੀਮਤਾਂ ਸਥਿਰ ਹਨ। ਬਾਜ਼ਾਰ ਟ੍ਰੈਂਡ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।'
    }
  },
  
  navigation: {
    market: {
      en: 'Taking you to Market Intelligence',
      hi: 'आपको मार्केट इंटेलिजेंस में ले जा रहा हूं',
      pa: 'ਤੁਹਾਨੂੰ ਮਾਰਕੇਟ ਇੰਟੈਲੀਜੈਂਸ ਵਿੱਚ ਲੈ ਜਾ ਰਿਹਾ ਹਾਂ'
    },
    storage: {
      en: 'Opening Storage Optimization',
      hi: 'स्टोरेज ऑप्टिमाइजेशन खोल रहा हूं',
      pa: 'ਸਟੋਰੇਜ ਆਪਟੀਮਾਈਜ਼ੇਸ਼ਨ ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ'
    },
    weather: {
      en: 'Showing Weather & Climate',
      hi: 'मौसम और जलवायु दिखा रहा हूं',
      pa: 'ਮੌਸਮ ਅਤੇ ਜਲਵਾਯੂ ਦਿਖਾ ਰਿਹਾ ਹਾਂ'
    },
    ai: {
      en: 'Opening AI Insights',
      hi: 'AI इनसाइट्स खोल रहा हूं',
      pa: 'AI ਇਨਸਾਈਟਸ ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ'
    },
    supplychain: {
      en: 'Opening Supply Chain Tracker',
      hi: 'सप्लाई चेन ट्रैकर खोल रहा हूं',
      pa: 'ਸਪਲਾਈ ਚੇਨ ਟ੍ਰੈਕਰ ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ'
    }
  }
}

// Multi-language intent patterns (expanded with local slang / transliterations)
const INTENT_PATTERNS = {
  greeting: {
    en: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'namaste', 'pranam', 'ram ram', 'greetings', 'good afternoon'],
    hi: ['नमस्ते', 'नमस्कार', 'प्रणाम', 'सलाम', 'हाय', 'हेलो', 'नमस्ते जी', 'नमस्तेजी', 'राम राम', 'प्रणाम जी', 'नमस्कार जी', 'नमस्ते bhai', 'नमस्ते दोस्त'],
    pa: ['ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ', 'ਨਮਸਤੇ', 'ਹੈਲੋ', 'ਹਾਇ', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀਓ', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਭਾਈ']
  },
  price_check: {
    en: ['price', 'rate', 'cost', 'value', 'market price', 'mandi price', 'current price', 'how much', 'bhav', 'mandi rate', 'daam', 'rate kya'],
    hi: ['कीमत', 'दर', 'मंडी', 'भाव', 'मूल्य', 'कितना', 'क्या रेट', 'वर्तमान कीमत', 'आज का भाव', 'दाम', 'भाव कितना'],
    pa: ['ਕੀਮਤ', 'ਦਰ', 'ਮੰਡੀ', 'ਭਾਵ', 'ਮੁੱਲ', 'ਕਿੰਨਾ', 'ਕੀ ਰੇਟ', 'ਵਰਤਮਾਨ ਕੀਮਤ', 'ਅੱਜ ਦਾ ਭਾਵ', 'ਭਾਵ ਕਿ੍ਹਨਾ', 'ਰੇਟ ਕਿ੍ਹਨਾ', 'kimat', 'bhav']
  },
  weather_check: {
    en: ['weather', 'temperature', 'rain', 'humidity', 'forecast', 'climate', 'mausam', 'barish', 'garmi', 'sardi'],
    hi: ['मौसम', 'तापमान', 'बारिश', 'आर्द्रता', 'पूर्वानुमान', 'पानी', 'गर्मी', 'सर्दी', 'मौसम कैसा'],
    pa: ['ਮੌਸਮ', 'ਤਾਪਮਾਨ', 'ਬਾਰਸ਼', 'ਨਮੀ', 'ਪੂਰਵਾਨੁਮਾਨ', 'ਪਾਣੀ', 'ਗਰਮੀ', 'ਸਰਦੀ', 'ਮੌਸਮ ਕੈਸਾ']
  },
  storage_info: {
    en: ['storage', 'warehouse', 'godown', 'store', 'preserve', 'shelf life', 'where to store'],
    hi: ['स्टोरेज', 'गोदाम', 'भंडारण', 'संरक्षण', 'रखना', 'संभालना', 'कहाँ रखें', 'गोडाउन'],
    pa: ['ਸਟੋਰੇਜ', 'ਗੋਦਾਮ', 'ਭੰਡਾਰਣ', 'ਸੁਰੱਖਿਆ', 'ਰੱਖਣਾ', 'ਸੰਭਾਲਣਾ', 'ਕਿੱਥੇ ਰੱਖੀਏ', 'godown']
  },
  crop_advice: {
    en: ['crop', 'farming', 'agriculture', 'sowing', 'harvesting', 'irrigation', 'seed', 'fertilizer', 'pesticide'],
    hi: ['फसल', 'खेती', 'कृषि', 'बुवाई', 'कटाई', 'सिंचाई', 'बीज', 'खाद', 'दवा', 'कीटनाशक'],
    pa: ['ਫਸਲ', 'ਖੇਤੀ', 'ਕਿਸਾਨੀ', 'ਬੀਜਣਾ', 'ਕਟਾਈ', 'ਸਿੰਚਾਈ', 'ਬੀਜ', 'ਖਾਦ', 'ਦਵਾਈ']
  },
  financial_calc: {
    en: ['profit', 'loss', 'cost', 'expense', 'income', 'calculation', 'finance', 'kitna milega', 'kitna kharch'],
    hi: ['लाभ', 'हानि', 'खर्च', 'आय', 'गणना', 'वित्त', 'कितना मिलेगा', 'कितना खर्च'],
    pa: ['ਲਾਭ', 'ਹਾਨੀ', 'ਖਰਚ', 'ਆਮਦਨੀ', 'ਗਣਨਾ', 'ਵਿੱਤ', 'ਕਿੰਨਾ ਮਿਲੇਗਾ', 'ਕਿੰਨਾ ਖਰਚ']
  },
  navigation: {
    en: ['go to', 'switch to', 'show', 'open', 'navigate', 'take me to', 'move to'],
    hi: ['जाओ', 'दिखाओ', 'खोलो', 'ले जाओ', 'स्क्रीन बदलो', 'पेज खोलो', 'टैब बदलो'],
    pa: ['ਜਾਓ', 'ਦਿਖਾਓ', 'ਖੋਲ੍ਹੋ', 'ਲੈ ਜਾਓ', 'ਸਕ੍ਰੀਨ ਬਦਲੋ', 'ਪੇਜ ਖੋਲ੍ਹੋ', 'ਟੈਬ ਬਦਲੋ']
  },
  help: {
    en: ['help', 'assist', 'support', 'guide', 'how to', 'what can you do'],
    hi: ['मदद', 'सहायता', 'गाइड', 'कैसे', 'क्या कर सकते हो', 'क्या सिखा सकते हो'],
    pa: ['ਮਦਦ', 'ਸਹਾਇਤਾ', 'ਗਾਈਡ', 'ਕਿਵੇਂ', 'ਕੀ ਕਰ ਸਕਦੇ ਹੋ', 'ਕੀ ਸਿਖਾ ਸਕਦੇ ਹੋ']
  }
}

// Multi-language response templates
const RESPONSE_TEMPLATES = {
  greeting: {
    en: "Hello! I'm your AI farming assistant. Ask me about prices, weather, storage, crop advice, or navigation.",
    hi: 'नमस्ते! मैं आपका AI कृषि सहायक हूं। कीमत, मौसम, स्टोरेज, फसल सलाह या नेविगेशन के बारे में पूछें।',
    pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਕਿਸਾਨੀ ਸਹਾਇਕ ਹਾਂ। ਕੀਮਤਾਂ, ਮੌਸਮ, ਸਟੋਰੇਜ, ਫਸਲ ਸਲਾਹ ਜਾਂ ਨੈਵੀਗੇਸ਼ਨ ਬਾਰੇ ਪੁੱਛੋ।'
  },
  price_check: {
    en: "The current market price for {crop} in {location} is approximately ₹{price} per quintal. {trend_info} {advice}",
    hi: "{location} में {crop} का वर्तमान बाजार भाव लगभग ₹{price} प्रति क्विंटल है। {trend_info} {advice}",
    pa: "{location} ਵਿੱਚ {crop} ਦੀ ਵਰਤਮਾਨ ਬਾਜ਼ਾਰ ਕੀਮਤ ਲਗਭਗ ₹{price} ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ। {trend_info} {advice}"
  },
  weather_check: {
    en: "Current weather in {location} is {temp}°C with {condition}. {advice}",
    hi: "{location} में वर्तमान मौसम {temp}°C है और {condition}। {advice}",
    pa: "{location} ਵਿੱਚ ਵਰਤਮਾਨ ਮੌਸਮ {temp}°C ਹੈ ਅਤੇ {condition}। {advice}"
  },
  crop_advice: {
    en: "For {crop} in {location}, I recommend {advice}. Optimal sowing time is {sowing_time}. {additional_tips}",
    hi: "{location} में {crop} के लिए, मैं {advice} सलाह देता हूं। बुवाई का सर्वोत्तम समय {sowing_time} है। {additional_tips}",
    pa: "{location} ਵਿੱਚ {crop} ਲਈ, ਮੈਂ {advice} ਸਲਾਹ ਦਿੰਦਾ ਹਾਂ। ਬੀਜਣ ਦਾ ਸਰਵੋਤਮ ਸਮਾਂ {sowing_time} ਹੈ। {additional_tips}"
  },
  financial_calc: {
    en: "Based on current prices, your {quantity} tons of {crop} would fetch approximately ₹{revenue}. Estimated profit margin is {margin}%. {financial_advice}",
    hi: "वर्तमान कीमतों के आधार पर, आपके {quantity} टन {crop} से लगभग ₹{revenue} मिलेंगे। अनुमानित लाभ मार्जिन {margin}% है। {financial_advice}",
    pa: "ਵਰਤਮਾਨ ਕੀਮਤਾਂ ਦੇ ਆਧਾਰ ਤੇ, ਤੁਹਾਡੇ {quantity} ਟਨ {crop} ਤੋਂ ਲਗਭਗ ₹{revenue} ਮਿਲਣਗੇ। ਅਨੁਮਾਨਿਤ ਲਾਭ ਮਾਰਜਿਨ {margin}% ਹੈ। {financial_advice}"
  },
  navigation: {
    en: "Navigating to {tab_name}. {tab_description}",
    hi: "{tab_name} में जा रहा हूं। {tab_description}",
    pa: "{tab_name} ਵਿੱਚ ਜਾ ਰਿਹਾ ਹਾਂ। {tab_description}"
  }
}

// Tab information for navigation
const TAB_INFO = {
  market: {
    en: { name: 'Market Intelligence', description: 'View current market prices and trends' },
    hi: { name: 'मार्केट इंटेलिजेंस', description: 'वर्तमान बाजार कीमतें और ट्रेंड देखें' },
    pa: { name: 'ਮਾਰਕੇਟ ਇੰਟੈਲੀਜੈਂਸ', description: 'ਵਰਤਮਾਨ ਬਾਜ਼ਾਰ ਕੀਮਤਾਂ ਅਤੇ ਟ੍ਰੈਂਡ ਦੇਖੋ' }
  },
  storage: {
    en: { name: 'Storage Optimization', description: 'Find storage facilities and optimization tips' },
    hi: { name: 'स्टोरेज ऑप्टिमाइजेशन', description: 'स्टोरेज सुविधाएं और ऑप्टिमाइजेशन टिप्स खोजें' },
    pa: { name: 'ਸਟੋਰੇਜ ਆਪਟੀਮਾਈਜ਼ੇਸ਼ਨ', description: 'ਸਟੋਰੇਜ ਸੁਵਿਧਾਵਾਂ ਅਤੇ ਆਪਟੀਮਾਈਜ਼ੇਸ਼ਨ ਟਿਪਸ ਲੱਭੋ' }
  },
  weather: {
    en: { name: 'Weather & Climate', description: 'Check weather forecasts and climate data' },
    hi: { name: 'मौसम और जलवायु', description: 'मौसम पूर्वानुमान और जलवायु डेटा देखें' },
    pa: { name: 'ਮੌਸਮ ਅਤੇ ਜਲਵਾਯੂ', description: 'ਮੌਸਮ ਪੂਰਵਾਨੁਮਾਨ ਅਤੇ ਜਲਵਾਯੂ ਡੇਟਾ ਦੇਖੋ' }
  },
  ai: {
    en: { name: 'AI Insights', description: 'Get AI-powered agricultural recommendations' },
    hi: { name: 'AI इनसाइट्स', description: 'AI-संचालित कृषि सिफारिशें प्राप्त करें' },
    pa: { name: 'AI ਇਨਸਾਈਟਸ', description: 'AI-ਸੰਚਾਲਿਤ ਕਿਸਾਨੀ ਸਿਫਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ' }
  },
  supplychain: {
    en: { name: 'Supply Chain', description: 'Track supply chain and logistics' },
    hi: { name: 'सप्लाई चेन', description: 'सप्लाई चेन और लॉजिस्टिक्स ट्रैक करें' },
    pa: { name: 'ਸਪਲਾਈ ਚੇਨ', description: 'ਸਪਲਾਈ ਚੇਨ ਅਤੇ ਲਾਜਿਸਟਿਕਸ ਟ੍ਰੈਕ ਕਰੋ' }
  }
}

// Main offline LLM function
export async function processOfflineVoiceCommand(command: VoiceCommand): Promise<OfflineResponse> {
  const { text, language, context } = command
  const lowerText = text.toLowerCase()
  
  try {
    // Detect intent per language only
    const intent = detectIntent(lowerText, language)
    
    // Greetings: always offline immediate
    if (intent.intent === 'greeting') {
      return await generateResponse(intent, language, context)
    }

    // If strong pattern match (>= 0.4) and at least 4 keyword hits overall, prefer offline fast path
    const minConfidence = 0.4
    const minKeywordHits = 4
    const hits = countKeywordHits(lowerText, language)
    if (intent.intent !== 'unknown' && intent.confidence >= minConfidence && hits >= minKeywordHits) {
      return await generateResponse(intent, language, context)
    }
    
    // Otherwise, signal caller to fall back to LLM
    return {
      text: '',
      confidence: 0.0,
      language,
      action: 'fallback_llm',
      context
    }
  } catch (error) {
    console.error('Error processing offline command:', error)
    
    // Fallback response
    const fallbackText = {
      en: "I'm sorry, I didn't understand that. Please try asking about prices, weather, crops, or navigation.",
      hi: "माफ़ करें, मैं आपकी बात समझ नहीं पाया। कृपया कीमत, मौसम, फसल या नेविगेशन के बारे में पूछें।",
      pa: "ਮਾਫ਼ ਕਰੋ, ਮੈਂ ਤੁਹਾਡੀ ਗੱਲ ਨਹੀਂ ਸਮਝ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਕੀਮਤਾਂ, ਮੌਸਮ, ਫਸਲਾਂ ਜਾਂ ਨੈਵੀਗੇਸ਼ਨ ਬਾਰੇ ਪੁੱਛੋ।"
    }

    return {
      text: fallbackText[language],
      confidence: 0.3,
      language,
      action: 'help'
    }
  }
}

// Intent detection function
function detectIntent(text: string, language: 'en' | 'hi' | 'pa'): { intent: string; confidence: number } {
  let bestIntent = 'unknown'
    let bestConfidence = 0
  
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    const langPatterns = patterns[language] || patterns.en || []
    
    for (const pattern of langPatterns) {
      if (text.includes(pattern.toLowerCase())) {
        const confidence = pattern.length / text.length
          if (confidence > bestConfidence) {
            bestConfidence = confidence
          bestIntent = intent
        }
      }
    }
  }
  
  return { intent: bestIntent, confidence: bestConfidence }
}

function countKeywordHits(text: string, language: 'en' | 'hi' | 'pa'): number {
  let hits = 0
  for (const patterns of Object.values(INTENT_PATTERNS) as any[]) {
    const langPatterns: string[] = patterns[language] || []
    for (const pattern of langPatterns) {
      if (pattern && text.includes(pattern.toLowerCase())) hits++
    }
  }
  return hits
}

// Response generation function
async function generateResponse(
  intent: { intent: string; confidence: number },
  language: 'en' | 'hi' | 'pa',
  context: any
): Promise<OfflineResponse> {
  const { location = 'Punjab', crop = 'wheat', quantity = '10' } = context
  
  switch (intent.intent) {
    case 'greeting':
      return generateGreetingResponse(language, context)
    case 'price_check':
      return generatePriceResponse(language, crop, location, context)
    
    case 'weather_check':
      return generateWeatherResponse(language, location, context)
    
    case 'crop_advice':
      return generateCropAdviceResponse(language, crop, location, context)
    
    case 'financial_calc':
      return generateFinancialResponse(language, crop, quantity, location, context)
    
    case 'navigation':
      return generateNavigationResponse(language, (context?.lastUtterance as string) || '', context)
    
    case 'help':
      return generateHelpResponse(language, context)
    
    default:
      return generateGeneralResponse(language, crop, location, context)
  }
}

// Generate greeting response
function generateGreetingResponse(language: 'en' | 'hi' | 'pa', context: any): OfflineResponse {
  const text = RESPONSE_TEMPLATES.greeting[language] || RESPONSE_TEMPLATES.greeting.en
  return {
    text,
    confidence: 1.0,
    language,
    action: 'greet',
    context
  }
}

// Generate price-related response
function generatePriceResponse(language: 'en' | 'hi' | 'pa', crop: string, location: string, context: any): OfflineResponse {
  const cropInfo = AGRICULTURAL_KNOWLEDGE.crops[crop as keyof typeof AGRICULTURAL_KNOWLEDGE.crops] || AGRICULTURAL_KNOWLEDGE.crops.wheat
  const langInfo = cropInfo[language] || cropInfo.en
  
  const price = Math.floor(Math.random() * 1000) + 1500
  const trend = price > 2000 ? 'rising' : 'stable'
  const trendInfo = AGRICULTURAL_KNOWLEDGE.market[trend][language] || AGRICULTURAL_KNOWLEDGE.market[trend].en
  
  const template = RESPONSE_TEMPLATES.price_check[language] || RESPONSE_TEMPLATES.price_check.en
  const text = template
           .replace('{crop}', crop)
           .replace('{location}', location)
    .replace('{price}', price.toString())
    .replace('{trend_info}', trendInfo)
    .replace('{advice}', langInfo.market_trend)
  
  return {
    text,
    confidence: 0.9,
    language,
    context: { price, trend, crop, location }
  }
}

// Generate weather response
function generateWeatherResponse(language: 'en' | 'hi' | 'pa', location: string, context: any): OfflineResponse {
        const temp = Math.floor(Math.random() * 15) + 20
  const condition = ['sunny', 'cloudy', 'partly cloudy'][Math.floor(Math.random() * 3)]
  
  let weatherAdvice
  if (temp > 35) weatherAdvice = AGRICULTURAL_KNOWLEDGE.weather.hot[language] || AGRICULTURAL_KNOWLEDGE.weather.hot.en
  else if (temp < 15) weatherAdvice = AGRICULTURAL_KNOWLEDGE.weather.cold[language] || AGRICULTURAL_KNOWLEDGE.weather.cold.en
  else weatherAdvice = AGRICULTURAL_KNOWLEDGE.weather.normal[language] || AGRICULTURAL_KNOWLEDGE.weather.normal.en
  
  const template = RESPONSE_TEMPLATES.weather_check[language] || RESPONSE_TEMPLATES.weather_check.en
  const text = template
          .replace('{location}', location)
          .replace('{temp}', temp.toString())
          .replace('{condition}', condition)
    .replace('{advice}', weatherAdvice)
  
  return {
    text,
    confidence: 0.85,
    language,
    context: { temp, condition, location }
  }
}

// Generate crop advice response
function generateCropAdviceResponse(language: 'en' | 'hi' | 'pa', crop: string, location: string, context: any): OfflineResponse {
  const cropInfo = AGRICULTURAL_KNOWLEDGE.crops[crop as keyof typeof AGRICULTURAL_KNOWLEDGE.crops] || AGRICULTURAL_KNOWLEDGE.crops.wheat
  const langInfo = cropInfo[language] || cropInfo.en
  
  const template = RESPONSE_TEMPLATES.crop_advice[language] || RESPONSE_TEMPLATES.crop_advice.en
  const text = template
          .replace('{crop}', crop)
          .replace('{location}', location)
    .replace('{advice}', langInfo.irrigation)
    .replace('{sowing_time}', langInfo.sowing)
    .replace('{additional_tips}', langInfo.storage)
  
  return {
    text,
    confidence: 0.9,
    language,
    context: { crop, location, advice: langInfo }
  }
}

// Generate financial calculation response
function generateFinancialResponse(language: 'en' | 'hi' | 'pa', crop: string, quantity: string, location: string, context: any): OfflineResponse {
  const price = Math.floor(Math.random() * 1000) + 1500
  const revenue = parseInt(quantity) * price * 10
  const margin = Math.floor(Math.random() * 20) + 15
  const cost = revenue * (100 - margin) / 100
  const profit = revenue - cost
  
  const template = RESPONSE_TEMPLATES.financial_calc[language] || RESPONSE_TEMPLATES.financial_calc.en
  const text = template
          .replace('{crop}', crop)
    .replace('{quantity}', quantity)
          .replace('{location}', location)
          .replace('{revenue}', revenue.toString())
          .replace('{margin}', margin.toString())
    .replace('{financial_advice}', 'Consider selling during peak season for better prices.')
  
  return {
    text,
    confidence: 0.9,
    language,
    context: { revenue, margin, cost, profit, crop, quantity }
  }
}

// Generate navigation response
function generateNavigationResponse(language: 'en' | 'hi' | 'pa', text: string, context: any): OfflineResponse {
  // Extract target tab from text
  let targetTab = 'market'
  
  if (text.includes('storage') || text.includes('warehouse') || text.includes('गोदाम') || text.includes('ਸਟੋਰੇਜ')) {
    targetTab = 'storage'
  } else if (text.includes('weather') || text.includes('मौसम') || text.includes('ਮੌਸਮ')) {
    targetTab = 'weather'
  } else if (text.includes('ai') || text.includes('insights') || text.includes('इनसाइट्स') || text.includes('ਇਨਸਾਈਟਸ')) {
    targetTab = 'ai'
  } else if (text.includes('supply') || text.includes('chain') || text.includes('चेन') || text.includes('ਚੇਨ')) {
    targetTab = 'supplychain'
  }
  
  const tabInfo = TAB_INFO[targetTab as keyof typeof TAB_INFO]
  const langTabInfo = tabInfo[language] || tabInfo.en
  
  const template = RESPONSE_TEMPLATES.navigation[language] || RESPONSE_TEMPLATES.navigation.en
  const responseText = template
    .replace('{tab_name}', langTabInfo.name)
    .replace('{tab_description}', langTabInfo.description)
  
  return {
    text: responseText,
    confidence: 0.95,
    language,
    action: `navigate_to_${targetTab}`,
    context: { targetTab, tabInfo: langTabInfo }
  }
}

// Generate help response
function generateHelpResponse(language: 'en' | 'hi' | 'pa', context: any): OfflineResponse {
  const helpText = {
    en: "I'm your AI farming assistant! I can help with market prices, weather updates, crop advice, financial calculations, and navigation. Just ask me anything about farming in natural language!",
    hi: "मैं आपका AI कृषि सहायक हूं! मैं मंडी की कीमतों, मौसम अपडेट, फसल सलाह, वित्तीय गणना और नेविगेशन में मदद कर सकता हूं। बस मुझसे खेती के बारे में प्राकृतिक भाषा में कुछ भी पूछें!",
    pa: "ਮੈਂ ਤੁਹਾਡਾ AI ਕਿਸਾਨੀ ਸਹਾਇਕ ਹਾਂ! ਮੈਂ ਮੰਡੀ ਦੀਆਂ ਕੀਮਤਾਂ, ਮੌਸਮ ਅਪਡੇਟ, ਫਸਲ ਸਲਾਹ, ਵਿੱਤੀ ਗਣਨਾ ਅਤੇ ਨੈਵੀਗੇਸ਼ਨ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਬਸ ਮੈਨੂੰ ਕਿਸਾਨੀ ਬਾਰੇ ਕੁদਰਤੀ ਭਾਸ਼ਾ ਵਿੱਚ ਕੁਝ ਵੀ ਪੁੱਛੋ!"
  }
  
  return {
    text: helpText[language],
    confidence: 1.0,
    language,
    action: 'help'
  }
}

// Generate general response
function generateGeneralResponse(language: 'en' | 'hi' | 'pa', crop: string, location: string, context: any): OfflineResponse {
  const generalText = {
    en: `I can help you with ${crop} farming in ${location}. Ask about prices, weather, storage, pest control, fertilizers, or financial calculations.`,
    hi: `मैं ${location} में ${crop} की खेती में आपकी मदद कर सकता हूं। कीमत, मौसम, स्टोरेज, कीट नियंत्रण, खाद, या वित्तीय गणना के बारे में पूछें।`,
    pa: `ਮੈਂ ${location} ਵਿੱਚ ${crop} ਦੀ ਕਿਸਾਨੀ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਕੀਮਤਾਂ, ਮੌਸਮ, ਸਟੋਰੇਜ, ਕੀੜੇ ਨਿਯੰਤਰਣ, ਖਾਦ, ਜਾਂ ਵਿੱਤੀ ਗਣਨਾ ਬਾਰੇ ਪੁੱਛੋ।`
  }
  
  return {
    text: generalText[language],
    confidence: 0.7,
    language,
    action: 'general_help'
  }
}

// Get available intents
export function getAvailableIntents(): string[] {
  return Object.keys(INTENT_PATTERNS)
}

// Get language support
export function getSupportedLanguages(): string[] {
  return ['en', 'hi', 'pa']
}

// Get crop information
export function getCropInfo(crop: string, language: 'en' | 'hi' | 'pa' = 'en') {
  const cropData = AGRICULTURAL_KNOWLEDGE.crops[crop as keyof typeof AGRICULTURAL_KNOWLEDGE.crops]
  if (cropData) {
    return cropData[language] || cropData.en
  }
  return null
}
