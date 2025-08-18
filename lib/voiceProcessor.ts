// Voice Command Processor for Agricultural Intelligence
// Handles intent detection, entity extraction, and response generation

export interface VoiceIntent {
  intent: string
  confidence: number
  entities: {
    crop?: string
    location?: string
    quantity?: string
    action?: string
  }
  originalText: string
}

export interface VoiceResponse {
  text: string
  action?: string
  data?: any
  confidence: number
}

// Intent patterns for agricultural queries
const INTENT_PATTERNS = {
  // Market & Price Queries
  'price_check': {
    patterns: [
      'price', 'rate', 'cost', 'value', 'market price', 'mandi price',
      'कीमत', 'दर', 'मंडी', 'भाव', 'मूल्य', 'कितना भाव है'
    ],
    entities: ['crop', 'location']
  },
  'price_alert': {
    patterns: [
      'alert', 'notification', 'notify', 'price alert', 'price notification',
      'अलर्ट', 'सूचना', 'नोटिफिकेशन', 'कीमत अलर्ट'
    ],
    entities: ['crop', 'location', 'action']
  },
  
  // Weather Queries
  'weather_check': {
    patterns: [
      'weather', 'temperature', 'rain', 'humidity', 'forecast', 'climate',
      'मौसम', 'तापमान', 'बारिश', 'आर्द्रता', 'पूर्वानुमान', 'कैसा मौसम है'
    ],
    entities: ['location']
  },
  
  // Storage Queries
  'storage_info': {
    patterns: [
      'storage', 'warehouse', 'godown', 'store', 'preserve', 'shelf life',
      'स्टोरेज', 'गोदाम', 'भंडारण', 'संरक्षण', 'कहाँ स्टोर करें'
    ],
    entities: ['location', 'crop']
  },
  
  // Crop Management
  'crop_advice': {
    patterns: [
      'crop', 'farming', 'agriculture', 'sowing', 'harvesting', 'irrigation',
      'फसल', 'खेती', 'कृषि', 'बुवाई', 'कटाई', 'सिंचाई', 'क्या करें'
    ],
    entities: ['crop', 'location', 'action']
  },
  
  // Financial Queries
  'financial_calc': {
    patterns: [
      'profit', 'loss', 'cost', 'expense', 'income', 'calculation', 'finance',
      'लाभ', 'हानि', 'खर्च', 'आय', 'गणना', 'वित्त', 'कितना लाभ होगा'
    ],
    entities: ['crop', 'quantity', 'location']
  },
  
  // Cooperative Queries
  'cooperative_info': {
    patterns: [
      'cooperative', 'group', 'collective', 'union', 'society', 'farmer group',
      'सहकारी', 'समूह', 'संघ', 'सोसायटी', 'फार्मर ग्रुप'
    ],
    entities: ['location', 'action']
  },
  
  // Navigation
  'navigate': {
    patterns: [
      'go to', 'switch to', 'show', 'open', 'navigate', 'take me to',
      'जाओ', 'दिखाओ', 'खोलो', 'ले जाओ', 'कहाँ जाएं'
    ],
    entities: ['action']
  },
  
  // General Help
  'help': {
    patterns: [
      'help', 'assist', 'support', 'guide', 'how to', 'what can you do',
      'मदद', 'सहायता', 'गाइड', 'कैसे', 'क्या कर सकते हैं'
    ],
    entities: []
  }
}

// Entity extraction patterns
const ENTITY_PATTERNS = {
  crop: [
    'wheat', 'गेहूं', 'rice', 'चावल', 'cotton', 'कपास', 'sugarcane', 'गन्ना',
    'pulses', 'दालें', 'maize', 'मक्का', 'corn', 'corn', 'potato', 'आलू'
  ],
  location: [
    'ludhiana', 'लुधियाना', 'amritsar', 'अमृतसर', 'patiala', 'पटियाला',
    'jalandhar', 'जालंधर', 'bathinda', 'बठिंडा', 'punjab', 'पंजाब'
  ],
  action: [
    'sell', 'बेचें', 'store', 'स्टोर', 'buy', 'खरीदें', 'plant', 'लगाएं',
    'harvest', 'काटें', 'irrigate', 'सिंचाई', 'fertilize', 'खाद डालें'
  ]
}

// Response templates in Hindi and English
const RESPONSE_TEMPLATES = {
  price_check: {
    en: "The current market price for {crop} in {location} is ₹{price} per quintal. {trend}",
    hi: "{location} में {crop} का वर्तमान बाजार भाव ₹{price} प्रति क्विंटल है। {trend}"
  },
  weather_check: {
    en: "The current weather in {location} is {temp}°C with {condition}. {advice}",
    hi: "{location} में वर्तमान मौसम {temp}°C है और {condition}। {advice}"
  },
  storage_info: {
    en: "I found {count} storage facilities near {location}. The nearest warehouse is {name} with {capacity} tons capacity.",
    hi: "मैंने {location} के पास {count} स्टोरेज सुविधाएं पाई हैं। निकटतम गोदाम {name} है जिसकी क्षमता {capacity} टन है।"
  },
  crop_advice: {
    en: "For {crop} in {location}, I recommend {advice}. The optimal {action} time is {time}.",
    hi: "{location} में {crop} के लिए, मैं {advice} सलाह देता हूं। {action} का सर्वोत्तम समय {time} है।"
  },
  financial_calc: {
    en: "Based on current prices, your {quantity} tons of {crop} would fetch approximately ₹{revenue}. Estimated profit margin is {margin}%.",
    hi: "वर्तमान कीमतों के आधार पर, आपके {quantity} टन {crop} से लगभग ₹{revenue} मिलेंगे। अनुमानित लाभ मार्जिन {margin}% है।"
  },
  help: {
    en: "I can help you with market prices, weather updates, storage information, crop advice, financial calculations, and cooperative selling. Just ask me anything about farming!",
    hi: "मैं आपकी मंडी की कीमतों, मौसम अपडेट, स्टोरेज जानकारी, फसल सलाह, वित्तीय गणना और सहकारी बिक्री में मदद कर सकता हूं। बस मुझसे खेती के बारे में कुछ भी पूछें!"
  }
}

// Intent detection function
export function detectIntent(text: string): VoiceIntent {
  const lowerText = text.toLowerCase()
  let bestIntent = 'unknown'
  let bestConfidence = 0
  let entities: any = {}

  // Detect intent
  for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (lowerText.includes(pattern.toLowerCase())) {
        const confidence = pattern.length / text.length
        if (confidence > bestConfidence) {
          bestConfidence = confidence
          bestIntent = intent
        }
      }
    }
  }

  // Extract entities
  entities = extractEntities(lowerText)

  return {
    intent: bestIntent,
    confidence: bestConfidence,
    entities,
    originalText: text
  }
}

// Entity extraction function
function extractEntities(text: string): any {
  const entities: any = {}

  for (const [entityType, patterns] of Object.entries(ENTITY_PATTERNS)) {
    for (const pattern of patterns) {
      if (text.includes(pattern.toLowerCase())) {
        entities[entityType] = pattern
        break
      }
    }
  }

  // Extract quantity (numbers)
  const quantityMatch = text.match(/(\d+)\s*(ton|quintal|kg|kilo)/i)
  if (quantityMatch) {
    entities.quantity = quantityMatch[1]
  }

  return entities
}

// Generate response based on intent and entities
export function generateResponse(
  intent: VoiceIntent, 
  language: 'en' | 'hi' = 'hi',
  context?: {
    location?: string
    crop?: string
    quantity?: string
  }
): VoiceResponse {
  const template = RESPONSE_TEMPLATES[intent.intent as keyof typeof RESPONSE_TEMPLATES]
  
  if (!template) {
    return {
      text: language === 'hi' 
        ? "माफ़ करें, मैं आपकी बात समझ नहीं पाया। कृपया दोबारा कहें।"
        : "Sorry, I didn't understand that. Please try again.",
      confidence: 0
    }
  }

  // Merge context with extracted entities
  const mergedEntities = { ...context, ...intent.entities }
  
  // Generate response text
  let responseText = template[language]
  
  // Replace placeholders with actual values
  responseText = responseText.replace('{crop}', mergedEntities.crop || 'wheat')
  responseText = responseText.replace('{location}', mergedEntities.location || 'Punjab')
  responseText = responseText.replace('{quantity}', mergedEntities.quantity || '10')
  responseText = responseText.replace('{action}', mergedEntities.action || 'sowing')
  
  // Add mock data for dynamic values
  responseText = responseText.replace('{price}', (Math.floor(Math.random() * 1000) + 1500).toString())
  responseText = responseText.replace('{temp}', (Math.floor(Math.random() * 15) + 20).toString())
  responseText = responseText.replace('{condition}', ['sunny', 'cloudy', 'partly cloudy'][Math.floor(Math.random() * 3)])
  responseText = responseText.replace('{advice}', 'Good conditions for farming activities.')
  responseText = responseText.replace('{count}', '3')
  responseText = responseText.replace('{name}', 'Punjab State Warehousing Corporation')
  responseText = responseText.replace('{capacity}', '50000')
  responseText = responseText.replace('{time}', 'October to December')
  responseText = responseText.replace('{revenue}', (Math.floor(Math.random() * 50000) + 100000).toString())
  responseText = responseText.replace('{margin}', (Math.floor(Math.random() * 20) + 15).toString())
  responseText = responseText.replace('{trend}', 'Prices are stable this week.')

  return {
    text: responseText,
    action: intent.intent === 'navigate' ? mergedEntities.action : undefined,
    confidence: intent.confidence
  }
}

// Process voice command
export function processVoiceCommand(
  text: string, 
  language: 'en' | 'hi' = 'hi',
  context?: {
    location?: string
    crop?: string
    quantity?: string
  }
): VoiceResponse {
  const intent = detectIntent(text)
  return generateResponse(intent, language, context)
}

// Get available intents for help
export function getAvailableIntents(): string[] {
  return Object.keys(INTENT_PATTERNS)
}

// Get entity patterns for debugging
export function getEntityPatterns(): any {
  return ENTITY_PATTERNS
}
