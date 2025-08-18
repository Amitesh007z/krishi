// Local AI System for Natural Language Understanding
// Uses lightweight models that work offline with contextual responses

export interface AIResponse {
  text: string
  confidence: number
  context: any
  action?: string
  reasoning?: string
}

export interface AIQuestion {
  text: string
  language: 'en' | 'hi' | 'pa'
  context: {
    location?: string
    crop?: string
    quantity?: string
    currentTab?: string
    userData?: any
    conversationHistory?: string[]
  }
}

// Agricultural knowledge base for context
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
        common_markets: ['Rajpura', 'Ghanaur', 'Patiala'],
        climate: 'Cool season crop, sensitive to heat',
        soil: 'Well-drained loamy soil with pH 6.0-7.5'
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
        common_markets: ['राजपुरा', 'घनौर', 'पटियाला'],
        climate: 'ठंडी मौसम की फसल, गर्मी के प्रति संवेदनशील',
        soil: 'अच्छी जल निकासी वाली दोमट मिट्टी, pH 6.0-7.5'
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
        common_markets: ['ਰਾਜਪੁਰਾ', 'ਘਨੌਰ', 'ਪਟਿਆਲਾ'],
        climate: 'ਠੰਡੇ ਮੌਸਮ ਦੀ ਫਸਲ, ਗਰਮੀ ਦੇ ਪ੍ਰਤੀ ਸੰਵੇਦਨਸ਼ੀਲ',
        soil: 'ਚੰਗੀ ਜਲ ਨਿਕਾਸੀ ਵਾਲੀ ਦੋਮਟ ਮਿੱਟੀ, pH 6.0-7.5'
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
        common_markets: ['Amritsar', 'Jalandhar', 'Ludhiana'],
        climate: 'Warm season crop, requires high humidity',
        soil: 'Clay loam soil with good water retention'
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
        common_markets: ['अमृतसर', 'जालंधर', 'लुधियाना'],
        climate: 'गर्म मौसम की फसल, उच्च आर्द्रता की आवश्यकता',
        soil: 'चिकनी दोमट मिट्टी जिसमें अच्छी जल धारण क्षमता हो'
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
        common_markets: ['ਅੰਮ੍ਰਿਤਸਰ', 'ਜਲੰਧਰ', 'ਲੁਧਿਆਣਾ'],
        climate: 'ਗਰਮ ਮੌਸਮ ਦੀ ਫਸਲ, ਉੱਚ ਨਮੀ ਦੀ ਲੋੜ',
        soil: 'ਚਿਕਣੀ ਦੋਮਟ ਮਿੱਟੀ ਜਿਸ ਵਿੱਚ ਚੰਗੀ ਜਲ ਧਾਰਨ ਸਮਰੱਥਾ ਹੋਵੇ'
      }
    }
  },
  
  weather_patterns: {
    hot: {
      en: 'High temperature requires more irrigation. Monitor soil moisture and consider shade protection.',
      hi: 'गर्मी में अधिक सिंचाई की आवश्यकता। मिट्टी की नमी की निगरानी करें और छाया सुरक्षा पर विचार करें।',
      pa: 'ਉੱਚ ਤਾਪਮਾਨ ਵਿੱਚ ਵਧੇਰੇ ਸਿੰਚਾਈ ਦੀ ਲੋੜ। ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ ਅਤੇ ਛਾਂ ਸੁਰੱਖਿਆ ਬਾਰੇ ਸੋਚੋ।'
    },
    cold: {
      en: 'Cold weather requires crop protection. Watch for frost and consider row covers.',
      hi: 'सर्दी में फसल सुरक्षा की आवश्यकता। पाला पड़ने की संभावना और पंक्ति कवर पर विचार करें।',
      pa: 'ਠੰਡੇ ਮੌਸਮ ਵਿੱਚ ਫਸਲ ਸੁਰੱਖਿਆ ਦੀ ਲੋੜ। ਪਾਲਾ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਅਤੇ ਕਤਾਰ ਕਵਰ ਬਾਰੇ ਸੋਚੋ।'
    },
    rainy: {
      en: 'Rainy weather requires drainage. Protect crops from waterlogging and fungal diseases.',
      hi: 'बारिश में जल निकासी की आवश्यकता। फसल को जलभराव और फंगल रोगों से बचाएं।',
      pa: 'ਬਾਰਸ਼ੀ ਮੌਸਮ ਵਿੱਚ ਜਲ ਨਿਕਾਸੀ ਦੀ ਲੋੜ। ਫਸਲ ਨੂੰ ਜਲਭਰਾਵ ਅਤੇ ਫੰਗਲ ਰੋਗਾਂ ਤੋਂ ਬਚਾਓ।'
    }
  },
  
  market_insights: {
    rising: {
      en: 'Prices are rising due to increased demand and reduced supply. Consider holding for better rates.',
      hi: 'बढ़ती मांग और कम आपूर्ति के कारण कीमतें बढ़ रही हैं। बेहतर दरों के लिए रोकने पर विचार करें।',
      pa: 'ਬਢ਼ਦੀ ਮੰਗ ਅਤੇ ਘੱਟ ਸਪਲਾਈ ਦੇ ਕਾਰਨ ਕੀਮਤਾਂ ਵਧ ਰਹੀਆਂ ਹਨ। ਬਿਹਤਰ ਦਰਾਂ ਲਈ ਰੋਕਣ ਬਾਰੇ ਸੋਚੋ।'
    },
    falling: {
      en: 'Prices are falling due to oversupply. Consider selling soon or storing for better rates.',
      hi: 'अधिक आपूर्ति के कारण कीमतें गिर रही हैं। जल्द बेचने या बेहतर दरों के लिए स्टोर करने पर विचार करें।',
      pa: 'ਵਾਧੂ ਸਪਲਾਈ ਦੇ ਕਾਰਨ ਕੀਮਤਾਂ ਘਟ ਰਹੀਆਂ ਹਨ। ਜਲਦੀ ਵੇਚਣ ਜਾਂ ਬਿਹਤਰ ਦਰਾਂ ਲਈ ਸਟੋਰ ਕਰਨ ਬਾਰੇ ਸੋਚੋ।'
    },
    stable: {
      en: 'Prices are stable with balanced supply and demand. Monitor market trends for opportunities.',
      hi: 'संतुलित आपूर्ति और मांग के साथ कीमतें स्थिर हैं। अवसरों के लिए बाजार ट्रेंड की निगरानी करें।',
      pa: 'ਸੰਤੁਲਿਤ ਸਪਲਾਈ ਅਤੇ ਮੰਗ ਦੇ ਨਾਲ ਕੀਮਤਾਂ ਸਥਿਰ ਹਨ। ਮੌਕਿਆਂ ਲਈ ਬਾਜ਼ਾਰ ਟ੍ਰੈਂਡ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।'
    }
  }
}

// Natural language understanding patterns
const LANGUAGE_PATTERNS = {
  questions: {
    en: ['what', 'how', 'when', 'where', 'why', 'which', 'can you', 'could you', 'would you', 'tell me', 'explain', 'describe'],
    hi: ['क्या', 'कैसे', 'कब', 'कहाँ', 'क्यों', 'कौन सा', 'क्या आप', 'क्या आप बता सकते हैं', 'मुझे बताएं', 'समझाएं', 'वर्णन करें'],
    pa: ['ਕੀ', 'ਕਿਵੇਂ', 'ਕਦੋਂ', 'ਕਿੱਥੇ', 'ਕਿਉਂ', 'ਕਿਹੜਾ', 'ਕੀ ਤੁਸੀਂ', 'ਕੀ ਤੁਸੀਂ ਦੱਸ ਸਕਦੇ ਹੋ', 'ਮੈਨੂੰ ਦੱਸੋ', 'ਸਮਝਾਓ', 'ਵਰਣਨ ਕਰੋ']
  },
  
  actions: {
    en: ['go to', 'switch to', 'show', 'open', 'navigate', 'take me to', 'move to', 'start', 'begin', 'analyze'],
    hi: ['जाओ', 'दिखाओ', 'खोलो', 'ले जाओ', 'शुरू करो', 'शुरू करें', 'विश्लेषण करो', 'शुरू करें'],
    pa: ['ਜਾਓ', 'ਦਿਖਾਓ', 'ਖੋਲ੍ਹੋ', 'ਲੈ ਜਾਓ', 'ਸ਼ੁਰੂ ਕਰੋ', 'ਸ਼ੁਰੂ ਕਰੋ', 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ', 'ਸ਼ੁਰੂ ਕਰੋ']
  },
  
  agricultural_terms: {
    en: ['crop', 'farming', 'agriculture', 'sowing', 'harvesting', 'irrigation', 'pest', 'disease', 'fertilizer', 'soil', 'weather', 'market', 'price'],
    hi: ['फसल', 'खेती', 'कृषि', 'बुवाई', 'कटाई', 'सिंचाई', 'कीट', 'रोग', 'खाद', 'मिट्टी', 'मौसम', 'बाजार', 'कीमत'],
    pa: ['ਫਸਲ', 'ਖੇਤੀ', 'ਕਿਸਾਨੀ', 'ਬੀਜਣਾ', 'ਕਟਾਈ', 'ਸਿੰਚਾਈ', 'ਕੀੜਾ', 'ਰੋਗ', 'ਖਾਦ', 'ਮਿੱਟੀ', 'ਮੌਸਮ', 'ਬਾਜ਼ਾਰ', 'ਕੀਮਤ']
  }
}

// Context-aware response generation
class LocalAI {
  private context: any = {}
  private conversationHistory: string[] = []
  
  constructor() {
    this.context = {
      location: 'Punjab',
      crop: 'wheat',
      quantity: '10',
      currentTab: 'market'
    }
  }
  
  // Update context with new information
  updateContext(newContext: any) {
    this.context = { ...this.context, ...newContext }
  }
  
  // Add to conversation history
  addToHistory(text: string) {
    this.conversationHistory.push(text)
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift()
    }
  }
  
  // Natural language understanding and response generation
  async processQuestion(question: AIQuestion): Promise<AIResponse> {
    const { text, language, context } = question
    
    // Update context
    this.updateContext(context)
    this.addToHistory(text)
    
    // Analyze question intent and context
    const analysis = this.analyzeQuestion(text, language)
    
    // Generate contextual response
    const response = await this.generateResponse(analysis, language)
    
    return response
  }
  
  // Analyze question for intent and context
  private analyzeQuestion(text: string, language: 'en' | 'hi' | 'pa') {
    const lowerText = text.toLowerCase()
    const lang = language
    
    // Detect question type
    const isQuestion = this.isQuestion(text, lang)
    const isAction = this.isAction(text, lang)
    const isAgricultural = this.isAgricultural(text, lang)
    
    // Extract entities
    const entities = this.extractEntities(text, lang)
    
    // Determine intent
    let intent = 'general'
    if (isQuestion && isAgricultural) {
      intent = 'agricultural_question'
    } else if (isAction) {
      intent = 'navigation_action'
    } else if (isQuestion) {
      intent = 'general_question'
    }
    
    return {
      text,
      language: lang,
      intent,
      isQuestion,
      isAction,
      isAgricultural,
      entities,
      context: this.context
    }
  }
  
  // Check if text is a question
  private isQuestion(text: string, language: 'en' | 'hi' | 'pa'): boolean {
    const patterns = LANGUAGE_PATTERNS.questions[language] || LANGUAGE_PATTERNS.questions.en
    
    return patterns.some(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    ) || text.includes('?')
  }
  
  // Check if text is an action command
  private isAction(text: string, language: 'en' | 'hi' | 'pa'): boolean {
    const patterns = LANGUAGE_PATTERNS.actions[language] || LANGUAGE_PATTERNS.actions.en
    
    return patterns.some(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    )
  }
  
  // Check if text is agricultural
  private isAgricultural(text: string, language: 'en' | 'hi' | 'pa'): boolean {
    const patterns = LANGUAGE_PATTERNS.agricultural_terms[language] || LANGUAGE_PATTERNS.agricultural_terms.en
    
    return patterns.some(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    )
  }
  
  // Extract entities from text
  private extractEntities(text: string, language: 'en' | 'hi' | 'pa'): any {
    const entities: any = {}
    
    // Extract crop
    for (const [crop, data] of Object.entries(AGRICULTURAL_KNOWLEDGE.crops)) {
      if (text.toLowerCase().includes(crop.toLowerCase())) {
        entities.crop = crop
        entities.cropData = data[language] || data.en
        break
      }
    }
    
    // Extract location mentions
    if (text.toLowerCase().includes('punjab') || text.toLowerCase().includes('पंजाब') || text.toLowerCase().includes('ਪੰਜਾਬ')) {
      entities.location = 'Punjab'
    }
    
    // Extract quantities
    const quantityMatch = text.match(/(\d+)\s*(ton|quintal|kg|kilo|टन|क्विंटल|ਟਨ|ਕੁਇੰਟਲ)/i)
    if (quantityMatch) {
      entities.quantity = quantityMatch[1]
    }
    
    return entities
  }
  
  // Generate contextual response
  private async generateResponse(analysis: any, language: 'en' | 'hi' | 'pa'): Promise<AIResponse> {
    const { intent, entities, context } = analysis
    
    try {
      switch (intent) {
        case 'agricultural_question':
          return this.generateAgriculturalResponse(analysis, language)
        
        case 'navigation_action':
          return this.generateNavigationResponse(analysis, language)
        
        case 'general_question':
          return this.generateGeneralResponse(analysis, language)
        
        default:
          return this.generateFallbackResponse(language)
      }
    } catch (error) {
      console.error('Error generating response:', error)
      return this.generateFallbackResponse(language)
    }
  }
  
  // Generate agricultural response
  private generateAgriculturalResponse(analysis: any, language: 'en' | 'hi' | 'pa'): AIResponse {
    const { text, entities, context } = analysis
    const crop = entities.crop || context.crop || 'wheat'
    const location = context.location || 'Punjab'
    const quantity = context.quantity || '10'
    
   const cropsMap = AGRICULTURAL_KNOWLEDGE.crops as Record<string, any>
    const cropData = cropsMap[crop]?.[language] ?? cropsMap[crop]?.en
    
    if (!cropData) {
      return this.generateFallbackResponse(language)
    }
    
    // Generate contextual response based on question
    let responseText = ''
    let action = undefined
    
    if (text.toLowerCase().includes('sowing') || text.toLowerCase().includes('बुवाई') || text.toLowerCase().includes('ਬੀਜਣਾ')) {
      responseText = this.getLocalizedText(language, {
        en: `For ${crop} in ${location}, the optimal sowing time is ${cropData.sowing}. This timing ensures proper growth and yield.`,
        hi: `${location} में ${crop} के लिए, बुवाई का सर्वोत्तम समय ${cropData.sowing} है। यह समय उचित विकास और उपज सुनिश्चित करता है।`,
        pa: `${location} ਵਿੱਚ ${crop} ਲਈ, ਬੀਜਣ ਦਾ ਸਰਵੋਤਮ ਸਮਾਂ ${cropData.sowing} ਹੈ। ਇਹ ਸਮਾਂ ਉਚਿਤ ਵਿਕਾਸ ਅਤੇ ਉਪਜ ਨੂੰ ਯਕੀਨੀ ਬਣਾਉਂਦਾ ਹੈ।`
      })
    } else if (text.toLowerCase().includes('pest') || text.toLowerCase().includes('कीट') || text.toLowerCase().includes('ਕੀੜਾ')) {
      responseText = this.getLocalizedText(language, {
        en: `Common pests in ${crop} include ${cropData.pests.join(', ')}. Regular monitoring and timely treatment is essential.`,
        hi: `${crop} में सामान्य कीट ${cropData.pests.join(', ')} हैं। नियमित निगरानी और समय पर उपचार आवश्यक है।`,
        pa: `${crop} ਵਿੱਚ ਆਮ ਕੀੜੇ ${cropData.pests.join(', ')} ਹਨ। ਨਿਯਮਿਤ ਨਿਗਰਾਨੀ ਅਤੇ ਸਮੇਂ ਸਿਰ ਇਲਾਜ ਜ਼ਰੂਰੀ ਹੈ।`
      })
    } else if (text.toLowerCase().includes('fertilizer') || text.toLowerCase().includes('खाद') || text.toLowerCase().includes('ਖਾਦ')) {
      responseText = this.getLocalizedText(language, {
        en: `For ${crop}, I recommend ${cropData.fertilizers.join(', ')}. Apply at sowing and flowering stages for best results.`,
        hi: `${crop} के लिए, मैं ${cropData.fertilizers.join(', ')} सलाह देता हूं। बेहतर परिणामों के लिए बुवाई और फूल आने के समय प्रयोग करें।`,
        pa: `${crop} ਲਈ, ਮੈਂ ${cropData.fertilizers.join(', ')} ਸਿਫਾਰਸ਼ ਕਰਦਾ ਹਾਂ। ਬਿਹਤਰ ਨਤੀਜਿਆਂ ਲਈ ਬੀਜਣ ਅਤੇ ਫੁੱਲ ਆਉਣ ਦੇ ਸਮੇਂ ਲਗਾਓ।`
      })
    } else if (text.toLowerCase().includes('market') || text.toLowerCase().includes('price') || text.toLowerCase().includes('बाजार') || text.toLowerCase().includes('कीमत') || text.toLowerCase().includes('ਬਾਜ਼ਾਰ') || text.toLowerCase().includes('ਕੀਮਤ')) {
      responseText = this.getLocalizedText(language, {
        en: `Market trends for ${crop} show ${cropData.market_trend}. Best selling time is ${cropData.best_selling_time}. Consider nearby markets like ${cropData.common_markets.join(', ')}.`,
        hi: `${crop} के लिए बाजार ट्रेंड ${cropData.market_trend} दिखाता है। बेहतर बिक्री का समय ${cropData.best_selling_time} है। ${cropData.common_markets.join(', ')} जैसे निकटवर्ती बाजारों पर विचार करें।`,
        pa: `${crop} ਲਈ ਬਾਜ਼ਾਰ ਟ੍ਰੈਂਡ ${cropData.market_trend} ਦਿਖਾਉਂਦਾ ਹੈ। ਬਿਹਤਰ ਵਿਕਰੀ ਦਾ ਸਮਾਂ ${cropData.best_selling_time} ਹੈ। ${cropData.common_markets.join(', ')} ਵਰਗੇ ਨੇੜਲੇ ਬਾਜ਼ਾਰਾਂ ਬਾਰੇ ਸੋਚੋ।`
      })
    } else {
      // General agricultural advice
      responseText = this.getLocalizedText(language, {
        en: `For ${crop} farming in ${location}, focus on proper irrigation (${cropData.irrigation}), pest management, and timely harvesting (${cropData.harvesting}). Expected yield is ${cropData.yield}.`,
        hi: `${location} में ${crop} की खेती के लिए, उचित सिंचाई (${cropData.irrigation}), कीट प्रबंधन और समय पर कटाई (${cropData.harvesting}) पर ध्यान दें। अनुमानित उपज ${cropData.yield} है।`,
        pa: `${location} ਵਿੱਚ ${crop} ਦੀ ਕਿਸਾਨੀ ਲਈ, ਉਚਿਤ ਸਿੰਚਾਈ (${cropData.irrigation}), ਕੀੜੇ ਪ੍ਰਬੰਧਨ ਅਤੇ ਸਮੇਂ ਸਿਰ ਕਟਾਈ (${cropData.harvesting}) ਤੇ ਧਿਆਨ ਦਿਓ। ਅਨੁਮਾਨਿਤ ਉਪਜ ${cropData.yield} ਹੈ।`
      })
    }
    
    return {
      text: responseText,
      confidence: 0.9,
      context: { crop, location, quantity, cropData },
      reasoning: `Generated contextual response for ${crop} farming in ${location}`
    }
  }
  
  // Generate navigation response
  private generateNavigationResponse(analysis: any, language: 'en' | 'hi' | 'pa'): AIResponse {
    const { text } = analysis
    const lowerText = text.toLowerCase()
    
    let targetTab = 'market'
    let responseText = ''
    
    if (lowerText.includes('market') || lowerText.includes('price') || lowerText.includes('mandi') || lowerText.includes('भाव') || lowerText.includes('ਭਾਵ')) {
      targetTab = 'market'
      responseText = this.getLocalizedText(language, {
        en: 'Taking you to Market Intelligence for price analysis and market trends.',
        hi: 'आपको कीमत विश्लेषण और बाजार ट्रेंड के लिए मार्केट इंटेलिजेंस में ले जा रहा हूं।',
        pa: 'ਤੁਹਾਨੂੰ ਕੀਮਤ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਬਾਜ਼ਾਰ ਟ੍ਰੈਂਡ ਲਈ ਮਾਰਕੇਟ ਇੰਟੈਲੀਜੈਂਸ ਵਿੱਚ ਲੈ ਜਾ ਰਿਹਾ ਹਾਂ।'
      })
    } else if (lowerText.includes('weather') || lowerText.includes('climate') || lowerText.includes('मौसम') || lowerText.includes('ਮੌਸਮ')) {
      targetTab = 'weather'
      responseText = this.getLocalizedText(language, {
        en: 'Opening Weather & Climate for current conditions and forecasts.',
        hi: 'वर्तमान स्थितियों और पूर्वानुमानों के लिए मौसम और जलवायु खोल रहा हूं।',
        pa: 'ਵਰਤਮਾਨ ਸਥਿਤੀਆਂ ਅਤੇ ਪੂਰਵਾਨੁਮਾਨਾਂ ਲਈ ਮੌਸਮ ਅਤੇ ਜਲਵਾਯੂ ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ।'
      })
    } else if (lowerText.includes('ai') || lowerText.includes('insights') || lowerText.includes('इनसाइट्स') || lowerText.includes('ਇਨਸਾਈਟਸ')) {
      targetTab = 'ai'
      responseText = this.getLocalizedText(language, {
        en: 'Opening AI Insights for intelligent agricultural recommendations.',
        hi: 'बुद्धिमान कृषि सिफारिशों के लिए AI इनसाइट्स खोल रहा हूं।',
        pa: 'ਬੁੱਧੀਜੀਵੀ ਕਿਸਾਨੀ ਸਿਫਾਰਸ਼ਾਂ ਲਈ AI ਇਨਸਾਈਟਸ ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ।'
      })
    } else if (lowerText.includes('storage') || lowerText.includes('warehouse') || lowerText.includes('गोदाम') || lowerText.includes('ਸਟੋਰੇਜ')) {
      targetTab = 'storage'
      responseText = this.getLocalizedText(language, {
        en: 'Opening Storage Optimization for warehouse facilities and tips.',
        hi: 'गोदाम सुविधाओं और टिप्स के लिए स्टोरेज ऑप्टिमाइजेशन खोल रहा हूं।',
        pa: 'ਗੋਦਾਮ ਸੁਵਿਧਾਵਾਂ ਅਤੇ ਟਿਪਸ ਲਈ ਸਟੋਰੇਜ ਆਪਟੀਮਾਈਜ਼ੇਸ਼ਨ ਖੋਲ੍ਹ ਰਿਹਾ ਹਾਂ।'
      })
    } else {
      targetTab = 'market'
      responseText = this.getLocalizedText(language, {
        en: 'Navigating to Market Intelligence for comprehensive analysis.',
        hi: 'व्यापक विश्लेषण के लिए मार्केट इंटेलिजेंस में जा रहा हूं।',
        pa: 'ਵਿਆਪਕ ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਮਾਰਕੇਟ ਇੰਟੈਲੀਜੈਂਸ ਵਿੱਚ ਜਾ ਰਿਹਾ ਹਾਂ।'
      })
    }
    
    return {
      text: responseText,
      confidence: 0.95,
      context: { targetTab },
      action: `navigate_to_${targetTab}`,
      reasoning: `Navigation command detected, targeting ${targetTab} tab`
    }
  }
  
  // Generate general response
  private generateGeneralResponse(analysis: any, language: 'en' | 'hi' | 'pa'): AIResponse {
    const { context } = analysis
    const crop = context.crop || 'farming'
    const location = context.location || 'Punjab'
    
    const responseText = this.getLocalizedText(language, {
      en: `I'm your AI farming assistant for ${location}! I can help with crop advice, market analysis, weather updates, and navigation. What would you like to know about ${crop} farming?`,
      hi: `मैं ${location} के लिए आपका AI कृषि सहायक हूं! मैं फसल सलाह, बाजार विश्लेषण, मौसम अपडेट और नेविगेशन में मदद कर सकता हूं। ${crop} की खेती के बारे में आप क्या जानना चाहते हैं?`,
      pa: `ਮੈਂ ${location} ਲਈ ਤੁਹਾਡਾ AI ਕਿਸਾਨੀ ਸਹਾਇਕ ਹਾਂ! ਮੈਂ ਫਸਲ ਸਲਾਹ, ਬਾਜ਼ਾਰ ਵਿਸ਼ਲੇਸ਼ਣ, ਮੌਸਮ ਅਪਡੇਟ ਅਤੇ ਨੈਵੀਗੇਸ਼ਨ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ${crop} ਦੀ ਕਿਸਾਨੀ ਬਾਰੇ ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?`
    })
    
    return {
      text: responseText,
      confidence: 0.8,
      context: { crop, location },
      reasoning: 'General question response with context awareness'
    }
  }
  
  // Generate fallback response
  private generateFallbackResponse(language: 'en' | 'hi' | 'pa'): AIResponse {
    const responseText = this.getLocalizedText(language, {
      en: "I'm here to help with your farming questions! Ask me about crops, weather, market prices, or navigation. I understand natural language and can provide contextual advice.",
      hi: "मैं आपकी खेती के सवालों में मदद करने के लिए यहां हूं! मुझसे फसलों, मौसम, बाजार कीमतों या नेविगेशन के बारे में पूछें। मैं प्राकृतिक भाषा समझता हूं और संदर्भ-जागरूक सलाह दे सकता हूं।",
      pa: "ਮੈਂ ਤੁਹਾਡੇ ਕਿਸਾਨੀ ਸਵਾਲਾਂ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ! ਮੈਨੂੰ ਫਸਲਾਂ, ਮੌਸਮ, ਬਾਜ਼ਾਰ ਕੀਮਤਾਂ ਜਾਂ ਨੈਵੀਗੇਸ਼ਨ ਬਾਰੇ ਪੁੱਛੋ। ਮੈਂ ਕੁਦਰਤੀ ਭਾਸ਼ਾ ਸਮਝਦਾ ਹਾਂ ਅਤੇ ਸੰਦਰਭ-ਜਾਗਰੂਕ ਸਲਾਹ ਦੇ ਸਕਦਾ ਹਾਂ।"
    })
    
    return {
      text: responseText,
      confidence: 0.6,
      context: {},
      reasoning: 'Fallback response for unrecognized input'
    }
  }
  
  // Helper function for localized text
  private getLocalizedText(language: 'en' | 'hi' | 'pa', texts: { en: string; hi: string; pa: string }): string {
    return texts[language] || texts.en
  }
  
  // Get conversation context
  getConversationContext(): any {
    return {
      ...this.context,
      history: this.conversationHistory
    }
  }
  
  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = []
  }
}

// Create singleton instance
const localAI = new LocalAI()

// Export functions
export async function askLocalAI(question: AIQuestion): Promise<AIResponse> {
  return await localAI.processQuestion(question)
}

export function updateAIContext(context: any): void {
  localAI.updateContext(context)
}

export function getAIContext(): any {
  return localAI.getConversationContext()
}

export function clearAIHistory(): void {
  localAI.clearHistory()
}

// (Types already exported as interfaces above)
